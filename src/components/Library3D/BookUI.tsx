import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, Library, Search, X } from 'lucide-react';
import { useGameStore } from '../../store';
import { SECTIONS, loadSection, resolveReadable, searchCatalog, type CatalogBook, type ReadableSource } from '../../library/catalog';
import { ALCOVES, alcoveForSection, describeSpot, spotForIndex } from '../../library/shelves';

const byline = (book: CatalogBook) => `${book.author}${book.year ? ` · ${book.year}` : ''}`;

const Cover = ({ book, size }: { book: CatalogBook, size: number }) => (
  <div className="book-cover" style={{ width: size, height: size * 1.5 }}>
    {book.coverUrl ? <img src={book.coverUrl} alt="" loading="lazy" /> : <BookOpen size={size / 2.5} />}
  </div>
);

// Name of the spine under the cursor, while browsing the shelves.
export const SpineHoverLabel = () => {
  const hovered = useGameStore((s) => s.hoveredSpine);
  const hasCard = useGameStore((s) => s.shelfSelection !== null);
  if (!hovered || hasCard) return null;
  return (
    <div className="spine-hover">
      <strong>{hovered.title}</strong>
      <span>{byline(hovered)} — click to take a look</span>
    </div>
  );
};

// Details of a book picked from a shelf, with exactly where it stands.
export const ShelfBookCard = () => {
  const selection = useGameStore((s) => s.shelfSelection);
  const currentBook = useGameStore((s) => s.currentBook);
  const setShelfSelection = useGameStore((s) => s.setShelfSelection);
  const setCurrentBook = useGameStore((s) => s.setCurrentBook);
  if (!selection) return null;
  const { book, spot } = selection;
  const carryingThis = currentBook?.id === book.id;

  return (
    <div className="book-panel shelf-card">
      <button className="book-panel-close" onClick={() => setShelfSelection(null)} aria-label="Close"><X size={20} /></button>
      <Cover book={book} size={96} />
      <div className="shelf-card-body">
        <div className="section-chip">{spot.alcove.section.code} · {spot.alcove.section.name}</div>
        <h3>{book.title}</h3>
        <p className="muted">{byline(book)}</p>
        <p className="shelf-location">{describeSpot(spot)}</p>
        <div className="row-buttons">
          <button
            className="btn-3d"
            disabled={carryingThis}
            onClick={() => { setCurrentBook(book); setShelfSelection(null); }}
          >
            {carryingThis ? 'You have this book' : currentBook ? 'Swap for this book' : 'Take this book'}
          </button>
        </div>
        <p className="muted small">Take it to any desk or table and sit down to read.</p>
      </div>
    </div>
  );
};

export const CarryingChip = () => {
  const currentBook = useGameStore((s) => s.currentBook);
  const isSeated = useGameStore((s) => s.isSeated);
  if (!currentBook || isSeated) return null;
  return (
    <div className="carrying-chip">
      <BookOpen size={16} /> Carrying <strong>{currentBook.title}</strong>
    </div>
  );
};

// Catalogue browser opened from a table: every section, plus a search across
// all public-domain books, so the reader can change books without walking.
export const CatalogBrowser = () => {
  const open = useGameStore((s) => s.catalogOpen);
  const setCatalogOpen = useGameStore((s) => s.setCatalogOpen);
  const startReading = useGameStore((s) => s.startReading);
  const currentBook = useGameStore((s) => s.currentBook);
  const [sectionId, setSectionId] = useState<string | null>('823');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [results, setResults] = useState<{ key: string, books: CatalogBook[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestKey = sectionId ? `section:${sectionId}` : `search:${submitted}`;

  useEffect(() => {
    if (!open || results?.key === requestKey) return;
    let cancelled = false;
    const pending = sectionId ? loadSection(SECTIONS[sectionId]) : searchCatalog(submitted);
    pending
      .then((books) => { if (!cancelled) { setResults({ key: requestKey, books }); setError(null); } })
      .catch(() => { if (!cancelled) setError('Could not reach the catalogue. Check your connection and try again.'); });
    return () => { cancelled = true; };
  }, [open, requestKey, results?.key, sectionId, submitted]);

  if (!open) return null;
  const loading = results?.key !== requestKey && !error;
  const alcove = sectionId ? alcoveForSection(sectionId) : undefined;

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSectionId(null);
    setSubmitted(query.trim());
  };

  return (
    <div className="book-panel catalog">
      <button className="book-panel-close" onClick={() => setCatalogOpen(false)} aria-label="Close"><X size={20} /></button>
      <header className="catalog-header">
        <h3><Library size={20} /> Library catalogue</h3>
        <form onSubmit={onSearch} className="catalog-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search every public-domain book: title or author"
            onKeyDown={(e) => e.stopPropagation()}
          />
          <button className="btn-3d" type="submit">Search</button>
        </form>
      </header>
      <div className="catalog-body">
        <nav className="catalog-sections">
          {ALCOVES.slice().sort((a, b) => a.section.code.localeCompare(b.section.code, undefined, { numeric: true })).map(({ section }) => (
            <button
              key={section.id}
              className={section.id === sectionId ? 'active' : ''}
              onClick={() => { setSectionId(section.id); setError(null); }}
            >
              <span className="code">{section.code}</span> {section.name}
            </button>
          ))}
        </nav>
        <div className="catalog-results">
          {error && <p className="muted">{error}</p>}
          {loading && <p className="muted">Fetching books…</p>}
          {!loading && !error && results?.books.length === 0 && <p className="muted">No free-to-read books found.</p>}
          {!loading && results?.books.map((book, index) => (
            <button key={book.id} className={`catalog-book${currentBook?.id === book.id ? ' current' : ''}`} onClick={() => startReading(book)}>
              <Cover book={book} size={44} />
              <span className="catalog-book-text">
                <strong>{book.title}</strong>
                <span className="muted">{byline(book)}</span>
                {alcove && index < 64 && <span className="muted small">{describeSpot(spotForIndex(alcove, index))}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Splits plain text into pages of roughly `size` characters on paragraph
// boundaries, breaking very long paragraphs at sentence ends.
const paginate = (text: string, size = 1400) => {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
    .flatMap((p) => (p.length <= size ? [p] : p.match(new RegExp(`.{1,${size}}(?:[.!?]\\s|$)`, 'g')) ?? [p]));
  const pages: string[][] = [];
  let page: string[] = [];
  let length = 0;
  for (const p of paragraphs) {
    if (length + p.length > size && page.length) { pages.push(page); page = []; length = 0; }
    page.push(p);
    length += p.length;
  }
  if (page.length) pages.push(page);
  return pages;
};

const savedPageKey = (book: CatalogBook) => `nexora:page:${book.id}`;
const loadSavedPage = (book: CatalogBook) => {
  try { return Number(localStorage.getItem(savedPageKey(book))) || 0; } catch { return 0; }
};

// Narrow screens show one page at a time, so each page carries less text.
const pageSize = () => (window.matchMedia('(max-width: 700px)').matches ? 700 : 1400);

const TextReader = ({ book, text }: { book: CatalogBook, text: string }) => {
  const pages = useMemo(() => paginate(text, pageSize()), [text]);
  const [spread, setSpread] = useState(() => Math.min(loadSavedPage(book), Math.max(0, pages.length - 1)) & ~1);
  const lastSpread = Math.max(0, (pages.length - 1) & ~1);

  useEffect(() => {
    try { localStorage.setItem(savedPageKey(book), String(spread)); } catch { /* storage unavailable */ }
  }, [book, spread]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setSpread((s) => Math.min(lastSpread, s + 2));
      if (e.key === 'ArrowLeft') setSpread((s) => Math.max(0, s - 2));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lastSpread]);

  return (
    <>
      <div className="book-spread">
        {[spread, spread + 1].map((n) => (
          <div key={n} className="book-page">
            {pages[n]?.map((p, i) => <p key={i}>{p}</p>)}
            {pages[n] && <span className="page-number">{n + 1}</span>}
          </div>
        ))}
      </div>
      <footer className="reader-footer">
        <button className="btn-3d secondary" disabled={spread === 0} onClick={() => setSpread((s) => Math.max(0, s - 2))}><ChevronLeft size={18} /></button>
        <span className="muted">Pages {spread + 1}–{Math.min(spread + 2, pages.length)} of {pages.length} · ← → to turn</span>
        <button className="btn-3d secondary" disabled={spread >= lastSpread} onClick={() => setSpread((s) => Math.min(lastSpread, s + 2))}><ChevronRight size={18} /></button>
      </footer>
    </>
  );
};

const ComicReader = ({ pages }: { pages: string[] }) => {
  const [page, setPage] = useState(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPage((p) => Math.min(pages.length - 1, p + 1));
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(0, p - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pages.length]);
  // Fetch the next page in the background so turning feels instant.
  useEffect(() => {
    if (pages[page + 1]) new Image().src = pages[page + 1];
  }, [pages, page]);
  return (
    <>
      <div className="comic-page"><img src={pages[page]} alt={`Page ${page + 1}`} /></div>
      <footer className="reader-footer">
        <button className="btn-3d secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={18} /></button>
        <span className="muted">Page {page + 1} of {pages.length} · ← → to turn</span>
        <button className="btn-3d secondary" disabled={page >= pages.length - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight size={18} /></button>
      </footer>
    </>
  );
};

export const BookReader = ({ book, onClose }: { book: CatalogBook, onClose: () => void }) => {
  const setCatalogOpen = useGameStore((s) => s.setCatalogOpen);
  const [state, setState] = useState<{ id: string, source: ReadableSource | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveReadable(book)
      .then((source) => { if (!cancelled) setState({ id: book.id, source }); })
      .catch(() => { if (!cancelled) setState({ id: book.id, source: null }); });
    return () => { cancelled = true; };
  }, [book]);

  const source = state?.id === book.id ? state.source : undefined;

  return (
    <div className="book-panel reader">
      <header className="reader-header">
        <div>
          <h3>{book.title}</h3>
          <p className="muted">{byline(book)}</p>
        </div>
        <div className="row-buttons">
          <button className="btn-3d secondary" onClick={() => setCatalogOpen(true)}><Library size={16} /> Change book</button>
          <button className="book-panel-close static" onClick={onClose} aria-label="Close book"><X size={20} /></button>
        </div>
      </header>
      {source === undefined && <p className="reader-status muted">Opening the book…</p>}
      {source === null && (
        <div className="reader-status">
          <p>This edition can't be opened here: it may only be available to borrow.</p>
          <button className="btn-3d" onClick={() => setCatalogOpen(true)}>Choose another book</button>
        </div>
      )}
      {source?.type === 'text' && <TextReader key={book.id} book={book} text={source.text} />}
      {source?.type === 'pages' && <ComicReader key={book.id} pages={source.pages} />}
      {source?.type === 'scan' && (
        <>
          <iframe className="scan-frame" title={book.title} src={`https://archive.org/embed/${encodeURIComponent(source.iaId)}`} allowFullScreen />
          <footer className="reader-footer">
            <span className="muted">Scanned edition from the Internet Archive</span>
            <a className="muted" href={`https://archive.org/details/${encodeURIComponent(source.iaId)}`} target="_blank" rel="noreferrer">Open full screen <ExternalLink size={14} /></a>
          </footer>
        </>
      )}
    </div>
  );
};
