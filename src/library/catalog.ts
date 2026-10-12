// Real, free-to-read books for the library.
//
// - Shelves are organised by Dewey Decimal class. Each section's titles come
//   from Open Library, limited to public-domain e-books (`ebook_access:public`).
// - Reading uses the Internet Archive: its mirror of Project Gutenberg gives
//   clean text; any other public scan opens in the Archive's page-turning reader.
// - Comics are a hand-picked set of Golden Age series that are genuinely in the
//   public domain. Archive upload licences are not reliable enough to filter on
//   (copyrighted Marvel and Disney issues are tagged "public domain" there), so
//   the series list is explicit. Manga is Hokusai Manga (1814 onwards), the
//   public-domain original; modern manga is copyrighted and not freely available.

export type BookKind = 'book' | 'comic' | 'manga';

export interface CatalogBook {
  id: string;
  title: string;
  author: string;
  year?: number;
  coverUrl?: string;
  iaIds: string[]; // Internet Archive items that may hold the book's text or scans
  kind: BookKind;
}

type SectionSource =
  | { type: 'openlibrary', ddc: string }
  | { type: 'archive', query: string, kind: BookKind };

export interface Section {
  id: string;
  code: string; // Dewey Decimal class shown on the shelf sign
  name: string;
  source: SectionSource;
}

const ol = (code: string, name: string, ddc: string): Section =>
  ({ id: code, code, name, source: { type: 'openlibrary', ddc } });

// Public-domain Golden Age comics: Nedor, Lev Gleason and Fox titles, 1938-1956.
const PUBLIC_DOMAIN_COMIC_SERIES = [
  'Exciting Comics', 'Startling Comics', 'Thrilling Comics', 'Black Terror',
  'Silver Streak', 'Daredevil Comics', 'Crime Does Not Pay', 'Phantom Lady', 'Fantastic Comics',
];

export const SECTIONS: Record<string, Section> = Object.fromEntries(([
  ol('000', 'General Works', '00'),
  ol('100', 'Philosophy & Psychology', '1'),
  ol('200', 'Religion & Mythology', '2'),
  ol('300', 'Social Sciences', '30'),
  ol('320', 'Political Science', '32'),
  ol('330', 'Economics', '33'),
  ol('400', 'Language', '4'),
  ol('500', 'Natural Sciences', '50'),
  ol('510', 'Mathematics', '51'),
  ol('520', 'Astronomy', '52'),
  ol('530', 'Physics', '53'),
  ol('540', 'Chemistry', '54'),
  ol('570', 'Biology & Life Sciences', '57'),
  ol('600', 'Technology', '6'),
  ol('610', 'Medicine & Health', '61'),
  ol('700', 'Arts & Recreation', '7'),
  ol('780', 'Music', '78'),
  ol('800', 'Literature', '80'),
  ol('813', 'American Fiction', '813'),
  ol('821', 'Poetry', '821'),
  ol('823', 'English Fiction', '823'),
  ol('840', 'French Literature', '84'),
  ol('900', 'History', '9'),
  ol('920', 'Biography', '92'),
  {
    id: '741.5', code: '741.5', name: 'Comics (Golden Age)', source: {
      type: 'archive', kind: 'comic',
      query: `collection:comics AND date:[1938-01-01 TO 1956-12-31] AND title:(${PUBLIC_DOMAIN_COMIC_SERIES.map((s) => `"${s}"`).join(' OR ')})`,
    },
  },
  {
    id: '741.59', code: '741.59', name: 'Manga (Hokusai)', source: {
      type: 'archive', kind: 'manga', query: 'title:(hokusai manga) AND mediatype:texts',
    },
  },
] satisfies Section[]).map((s) => [s.id, s]));

// Books shown on one alcove's real-title shelves (2 cases x 2 rows x 16 spines).
export const BOOKS_PER_SECTION = 64;

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  ia?: string[];
}

// Archive search fields may come back as a single value or a list.
type OneOrMany<T> = T | T[];
const first = <T>(value: OneOrMany<T> | undefined) => (Array.isArray(value) ? value[0] : value);

interface ArchiveDoc {
  identifier: string;
  title?: OneOrMany<string>;
  creator?: OneOrMany<string>;
  year?: OneOrMany<string | number>;
}

const fromOpenLibrary = (doc: OpenLibraryDoc): CatalogBook => ({
  id: doc.key,
  title: String(doc.title),
  author: doc.author_name?.[0] ?? 'Unknown author',
  year: doc.first_publish_year,
  coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
  iaIds: doc.ia ?? [],
  kind: 'book',
});

const fromArchive = (doc: ArchiveDoc, kind: BookKind): CatalogBook => ({
  id: `ia:${doc.identifier}`,
  title: String(first(doc.title) ?? doc.identifier),
  author: String(first(doc.creator) ?? (kind === 'manga' ? 'Katsushika Hokusai' : 'Golden Age comics')),
  year: Number(first(doc.year)) || undefined,
  coverUrl: `https://archive.org/services/img/${doc.identifier}`,
  iaIds: [doc.identifier],
  kind,
});

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
};

const searchOpenLibrary = async (query: string, limit: number, sort?: string) => {
  const params = new URLSearchParams({
    q: `${query} AND ebook_access:public`,
    fields: 'key,title,author_name,first_publish_year,cover_i,ia',
    limit: String(limit),
  });
  if (sort) params.set('sort', sort);
  const data = await fetchJson<{ docs: OpenLibraryDoc[] }>(`https://openlibrary.org/search.json?${params}`);
  return data.docs.filter((d) => d.ia?.length).map(fromOpenLibrary);
};

const searchArchive = async (query: string, limit: number, kind: BookKind) => {
  const params = new URLSearchParams({ q: query, rows: String(limit), output: 'json' });
  for (const field of ['identifier', 'title', 'creator', 'year']) params.append('fl[]', field);
  params.append('sort[]', 'downloads desc');
  const data = await fetchJson<{ response: { docs: ArchiveDoc[] } }>(`https://archive.org/advancedsearch.php?${params}`);
  return data.response.docs.map((d) => fromArchive(d, kind));
};

const sectionCache = new Map<string, Promise<CatalogBook[]>>();

// Books for a section, most-read first. Cached for the session; a failed
// request is forgotten so walking past the shelf again retries it.
export const loadSection = (section: Section): Promise<CatalogBook[]> => {
  let pending = sectionCache.get(section.id);
  if (!pending) {
    const { source } = section;
    pending = source.type === 'openlibrary'
      ? searchOpenLibrary(`ddc:${source.ddc}*`, BOOKS_PER_SECTION, 'readinglog')
      : searchArchive(source.query, BOOKS_PER_SECTION, source.kind);
    pending.catch(() => sectionCache.delete(section.id));
    sectionCache.set(section.id, pending);
  }
  return pending;
};

// Free-text search across every public-domain book Open Library knows about.
export const searchCatalog = (text: string) => {
  const cleaned = text.replace(/[:()"[\]{}^~*?\\/]/g, ' ').trim();
  return cleaned ? searchOpenLibrary(cleaned, 40) : Promise.resolve([]);
};

// --- Reading -----------------------------------------------------------------

export type ReadableSource =
  | { type: 'text', iaId: string, text: string } // clean Gutenberg text
  | { type: 'scan', iaId: string } // scanned book, shown in the Archive's reader
  | { type: 'pages', iaId: string, pages: string[] }; // comic uploaded as page images

interface ArchiveMetadata {
  metadata?: { title?: string, mediatype?: string, collection?: string | string[], 'access-restricted-item'?: string | boolean };
  files?: { name: string }[];
}

// Archive collections whose items can only be borrowed, not read freely.
const LENDING_COLLECTIONS = new Set(['inlibrary', 'printdisabled', 'lendinglibrary']);

const fetchMetadata = (id: string) =>
  fetchJson<ArchiveMetadata>(`https://archive.org/metadata/${encodeURIComponent(id)}`).catch(() => null);

const isFreelyReadable = (meta: ArchiveMetadata | null) => {
  if (!meta?.metadata) return false;
  const restricted = meta.metadata['access-restricted-item'];
  if (restricted === true || restricted === 'true') return false;
  // Audio items (e.g. LibriVox recordings) share titles with books; skip them.
  if (meta.metadata.mediatype !== 'texts' && meta.metadata.mediatype !== 'image') return false;
  const collections = [meta.metadata.collection ?? []].flat();
  return !collections.some((c) => LENDING_COLLECTIONS.has(c));
};

const naturalOrder = new Intl.Collator(undefined, { numeric: true }).compare;

// Most Golden Age comics on the Archive are folders of page images.
const pageImages = (iaId: string, files: { name: string }[] = []) =>
  files
    .map((f) => f.name)
    .filter((n) => /\.(jpe?g|png|gif|webp)$/i.test(n) && !/thumb/i.test(n))
    .sort(naturalOrder)
    .map((n) => `https://archive.org/download/${encodeURIComponent(iaId)}/${n.split('/').map(encodeURIComponent).join('/')}`);

// Compares the start of two titles, so a German "Romeo und Julia" Gutenberg
// file is not served for an English "Romeo and Juliet".
const titleKey = (title = '') => title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);

const pickTextFile = (files: { name: string }[] = []) => {
  const names = files.map((f) => f.name).filter((n) => n.endsWith('.txt') && !n.includes('_meta'));
  const utf8 = names.find((n) => n.endsWith('-0.txt'));
  if (utf8) return { name: utf8, encoding: 'utf-8' };
  const plain = names.find((n) => /^(pg)?\d+\.txt$/.test(n));
  if (plain) return { name: plain, encoding: 'utf-8' };
  const latin1 = names.find((n) => n.endsWith('-8.txt'));
  if (latin1) return { name: latin1, encoding: 'iso-8859-1' };
  return null;
};

// Drops Project Gutenberg's licence header and footer, keeping the book itself.
const stripGutenbergBoilerplate = (text: string) => {
  const start = text.search(/\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n/i);
  const end = text.search(/\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG/i);
  const from = start >= 0 ? text.indexOf('\n', start) + 1 : 0;
  return text.slice(from, end > from ? end : undefined).trim();
};

const loadGutenbergText = async (iaId: string, title: string) => {
  const meta = await fetchMetadata(iaId);
  if (!meta?.metadata || titleKey(meta.metadata.title) !== titleKey(title)) return null;
  const file = pickTextFile(meta.files);
  if (!file) return null;
  const res = await fetch(`https://archive.org/download/${encodeURIComponent(iaId)}/${encodeURIComponent(file.name)}`);
  if (!res.ok) return null;
  const text = new TextDecoder(file.encoding).decode(await res.arrayBuffer());
  return stripGutenbergBoilerplate(text.replace(/\r\n/g, '\n'));
};

const readableCache = new Map<string, Promise<ReadableSource | null>>();

// Finds the best way to read a book: clean Gutenberg text when the Archive
// mirrors it, otherwise the first freely readable scan.
export const resolveReadable = (book: CatalogBook): Promise<ReadableSource | null> => {
  let pending = readableCache.get(book.id);
  if (!pending) {
    pending = (async () => {
      if (book.kind === 'book') {
        for (const iaId of book.iaIds.filter((id) => id.endsWith('gut')).slice(0, 3)) {
          const text = await loadGutenbergText(iaId, book.title).catch(() => null);
          if (text) return { type: 'text', iaId, text } as const;
        }
      }
      const candidates = book.iaIds.filter((id) => !id.endsWith('gut')).slice(0, 8);
      const metas = await Promise.all(candidates.map(fetchMetadata));
      const index = metas.findIndex(isFreelyReadable);
      if (index < 0) return null;
      const iaId = candidates[index];
      if (metas[index]?.metadata?.mediatype === 'image') {
        const pages = pageImages(iaId, metas[index]?.files);
        return pages.length ? { type: 'pages', iaId, pages } as const : null;
      }
      return { type: 'scan', iaId } as const;
    })();
    pending.catch(() => readableCache.delete(book.id));
    readableCache.set(book.id, pending);
  }
  return pending;
};
