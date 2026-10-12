import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { loadSection, type BookKind, type CatalogBook } from '../../library/catalog';
import { ALCOVES, SPINES_PER_ROW, ROWS_PER_CASE, BOOKS_PER_CASE, spotForIndex, type Alcove } from '../../library/shelves';
import { REAL_BOOK_SHELF_YS } from './longRoomLayout';
import { useGameStore } from '../../store';

// Titled spines on the eye-level shelves of every alcove, plus a brass Dewey
// sign at each alcove entrance. Each row of 16 spines is one box whose front
// face is a canvas texture with the real titles painted on, so a whole shelf
// costs one draw call. Rows load their books (and build textures) only when
// the camera comes near, and release the textures again when it leaves.

const ROW_WIDTH = 3.4;
const ROW_HEIGHT = 0.74;
const ROW_DEPTH = 0.22;
const CANVAS_W = 1024;
const CANVAS_H = Math.round(CANVAS_W * (ROW_HEIGHT / ROW_WIDTH));
const LOAD_DISTANCE = 13;
const UNLOAD_DISTANCE = 30;
const MAX_CLICK_DISTANCE = 10;

const PALETTES: Record<BookKind, string[]> = {
  book: ['#6b2a20', '#2f3d2a', '#1f3350', '#4a2c18', '#5c3a21', '#3a2448', '#7a5230', '#20403f', '#5a1e2c'],
  comic: ['#d62828', '#f77f00', '#fcbf49', '#1d3557', '#2a9d8f', '#e63946', '#6a4c93'],
  manga: ['#f1ece2', '#e9e1d0', '#1b1b1b', '#f1ece2'],
};

const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
};

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
};

// Spine widths (summing to 1) and heights (0..1) for one row, stable per row.
const rowLayout = (seed: string) => {
  let state = hash(seed);
  const next = () => ((state = Math.imul(state ^ (state >>> 15), 2246822507) >>> 0) / 4294967296);
  const raw = Array.from({ length: SPINES_PER_ROW }, () => 0.75 + next() * 0.6);
  const total = raw.reduce((a, b) => a + b, 0);
  return { widths: raw.map((w) => w / total), heights: raw.map(() => 0.8 + next() * 0.2) };
};

type Layout = ReturnType<typeof rowLayout>;

const drawRow = (books: (CatalogBook | undefined)[], layout: Layout) => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1c110a'; // shadowed back of the shelf
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  let x = 0;
  layout.widths.forEach((fraction, i) => {
    const w = fraction * CANVAS_W;
    const h = layout.heights[i] * CANVAS_H;
    const top = CANVAS_H - h;
    const book = books[i];
    const palette = PALETTES[book?.kind ?? 'book'];
    const color = palette[hash(book?.title ?? `${i}${fraction}`) % palette.length];

    ctx.fillStyle = color;
    ctx.fillRect(x + 1, top, w - 2, h);
    // Rounded-spine shading and gilt bands, like old bindings
    const shade = ctx.createLinearGradient(x, 0, x + w, 0);
    shade.addColorStop(0, 'rgba(0,0,0,0.35)');
    shade.addColorStop(0.35, 'rgba(255,255,255,0.08)');
    shade.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = shade;
    ctx.fillRect(x + 1, top, w - 2, h);
    ctx.fillStyle = book?.kind === 'manga' ? '#b3261e' : '#c9a24a';
    ctx.fillRect(x + 1, top + 8, w - 2, 3);
    ctx.fillRect(x + 1, CANVAS_H - 12, w - 2, 3);

    if (book) {
      ctx.save();
      ctx.translate(x + w / 2, top + h / 2);
      ctx.rotate(Math.PI / 2); // English spines read top to bottom
      ctx.fillStyle = isLight(color) ? '#1b1b1b' : '#f3e3b5';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.min(18, w * 0.42);
      ctx.font = `600 ${fontSize}px Georgia, serif`;
      const maxLength = h - 34;
      let title = book.title;
      while (title.length > 3 && ctx.measureText(title).width > maxLength) title = `${title.slice(0, -2).trimEnd()}…`;
      ctx.fillText(title, 0, 0);
      ctx.restore();
    }
    x += w;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
};

// One untitled texture shared by every row that has not loaded yet.
let placeholderTexture: THREE.Texture | null = null;
const getPlaceholder = () => (placeholderTexture ??= drawRow([], rowLayout('placeholder')));

const sideMat = new THREE.MeshStandardMaterial({ color: '#3a2416', roughness: 0.8 });
const pageEdgeMat = new THREE.MeshStandardMaterial({ color: '#9c855f', roughness: 1 }); // page edges, in shadow

const SpineRow = ({ alcove, caseIndex, row, books, loaded }: {
  alcove: Alcove, caseIndex: number, row: number, books: (CatalogBook | undefined)[], loaded: boolean,
}) => {
  const setShelfSelection = useGameStore((s) => s.setShelfSelection);
  const setHoveredSpine = useGameStore((s) => s.setHoveredSpine);
  const layout = useMemo(() => rowLayout(`${alcove.key}-${caseIndex}-${row}`), [alcove.key, caseIndex, row]);
  const texture = useMemo(() => (loaded ? drawRow(books, layout) : null), [loaded, books, layout]);
  useEffect(() => () => texture?.dispose(), [texture]);

  const frontMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texture ?? getPlaceholder(), roughness: 0.75 }),
    [texture],
  );
  useEffect(() => () => frontMat.dispose(), [frontMat]);
  // Box faces: +x, -x, +y (top: page edges), -y, +z (front: spines), -z
  const materials = useMemo(() => [sideMat, sideMat, pageEdgeMat, sideMat, frontMat, sideMat], [frontMat]);

  // Case 0 is the bookcase nearer the far end; its alcove-facing side is +z.
  const facing = caseIndex === 0 ? 1 : -1;
  const bookcaseZ = alcove.z - 2 * facing;
  const shelfY = REAL_BOOK_SHELF_YS[row];

  const spineAt = (e: ThreeEvent<PointerEvent | MouseEvent>) => {
    if (!loaded || e.face?.materialIndex !== 4 || !e.uv || e.distance > MAX_CLICK_DISTANCE) return null;
    let edge = 0;
    for (let i = 0; i < layout.widths.length; i++) {
      edge += layout.widths[i];
      if (e.uv.x <= edge) return e.uv.y <= layout.heights[i] && books[i] ? i : null;
    }
    return null;
  };

  return (
    <mesh
      position={[alcove.x, shelfY + 0.03 + ROW_HEIGHT / 2, bookcaseZ + facing * 0.17]}
      rotation={[0, facing > 0 ? 0 : Math.PI, 0]}
      material={materials}
      onPointerMove={(e) => {
        const i = spineAt(e);
        const book = i === null ? null : books[i] ?? null;
        if (useGameStore.getState().hoveredSpine !== book) setHoveredSpine(book);
        document.body.style.cursor = book ? 'pointer' : '';
      }}
      onPointerOut={() => {
        setHoveredSpine(null);
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        if (e.delta > 5) return; // the pointer was dragged to look around
        const i = spineAt(e);
        if (i === null) return;
        e.stopPropagation();
        setShelfSelection({ book: books[i]!, spot: spotForIndex(alcove, caseIndex * BOOKS_PER_CASE + row * SPINES_PER_ROW + i) });
      }}
    >
      <boxGeometry args={[ROW_WIDTH, ROW_HEIGHT, ROW_DEPTH]} />
    </mesh>
  );
};

const signTexture = (code: string, name: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1f2e24';
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = '#c9a24a';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 144);
  ctx.fillStyle = '#e8c872';
  ctx.textAlign = 'center';
  ctx.font = '700 58px Georgia, serif';
  ctx.fillText(code, 256, 78);
  ctx.font = '500 32px Georgia, serif';
  ctx.fillText(name, 256, 124, 470);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const SectionSign = ({ alcove }: { alcove: Alcove }) => {
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ map: signTexture(alcove.section.code, alcove.section.name), roughness: 0.5 }),
    [alcove.section],
  );
  useEffect(() => () => { material.map?.dispose(); material.dispose(); }, [material]);
  const side = alcove.side === 'L' ? -1 : 1;
  return (
    <mesh position={[side * 5.42, 4.75, alcove.z]} rotation={[0, -side * Math.PI / 2, 0]} material={material}>
      <planeGeometry args={[1.7, 0.53]} />
    </mesh>
  );
};

const AlcoveShelves = ({ alcove, near }: { alcove: Alcove, near: boolean }) => {
  const [books, setBooks] = useState<CatalogBook[] | null>(null);

  useEffect(() => {
    if (!near || books) return;
    let cancelled = false;
    loadSection(alcove.section)
      .then((result) => { if (!cancelled) setBooks(result); })
      .catch(() => { /* offline or rate-limited: keep the untitled spines */ });
    return () => { cancelled = true; };
  }, [near, books, alcove.section]);

  const loaded = near && books !== null;
  const rows = useMemo(() => Array.from({ length: 2 * ROWS_PER_CASE }, (_, r) => {
    const caseIndex = Math.floor(r / ROWS_PER_CASE);
    const row = r % ROWS_PER_CASE;
    const start = caseIndex * BOOKS_PER_CASE + row * SPINES_PER_ROW;
    return { caseIndex, row, books: Array.from({ length: SPINES_PER_ROW }, (_, i) => books?.[start + i]) };
  }), [books]);

  return (
    <>
      {rows.map(({ caseIndex, row, books: rowBooks }) => (
        <SpineRow key={`${caseIndex}-${row}`} alcove={alcove} caseIndex={caseIndex} row={row} books={rowBooks} loaded={loaded} />
      ))}
    </>
  );
};

export const SectionShelves = () => {
  const [nearKeys, setNearKeys] = useState<ReadonlySet<string>>(new Set());
  const elapsed = useRef(0);

  // Check every few frames which alcoves the camera is near; only re-render
  // when that set changes. Unloading uses a larger radius to avoid flicker.
  useFrame(({ camera }, delta) => {
    elapsed.current += delta;
    if (elapsed.current < 0.4) return;
    elapsed.current = 0;
    let changed = false;
    const next = new Set(nearKeys);
    for (const alcove of ALCOVES) {
      const distance = Math.hypot(camera.position.x - alcove.x, camera.position.z - alcove.z);
      if (!next.has(alcove.key) && distance < LOAD_DISTANCE) { next.add(alcove.key); changed = true; }
      if (next.has(alcove.key) && distance > UNLOAD_DISTANCE) { next.delete(alcove.key); changed = true; }
    }
    if (changed) setNearKeys(next);
  });

  return (
    <group>
      {ALCOVES.map((alcove) => (
        <group key={alcove.key}>
          <SectionSign alcove={alcove} />
          <AlcoveShelves alcove={alcove} near={nearKeys.has(alcove.key)} />
        </group>
      ))}
    </group>
  );
};
