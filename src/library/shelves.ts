import { ALCOVE_ZS } from '../components/Library3D/longRoomLayout';
import { SECTIONS, type Section } from './catalog';

// Which Dewey section lives in which ground-floor alcove of the Long Room.
// Bays are numbered from the entrance, so the popular fiction, comics and
// manga are the first shelves a visitor walks past.
const LEFT_SECTIONS = ['000', '100', '200', '300', '320', '330', '400', '500', '510', '520', '530', '540', '570'];
const RIGHT_SECTIONS = ['823', '813', '741.5', '741.59', '800', '821', '840', '920', '900', '700', '780', '600', '610'];

export interface Alcove {
  key: string;
  section: Section;
  side: 'L' | 'R';
  bay: number; // 1 = nearest the entrance
  z: number; // centre of the alcove along the hall
  x: number; // centre of the shelf run across the hall
}

// ALCOVE_ZS runs from the far end to the entrance; bays count the other way.
const alcovesFor = (side: 'L' | 'R', sectionIds: string[]): Alcove[] =>
  [...ALCOVE_ZS].reverse().map((z, i) => ({
    key: `${side}${i + 1}`,
    section: SECTIONS[sectionIds[i]],
    side,
    bay: i + 1,
    z,
    x: side === 'L' ? -7.25 : 7.25,
  }));

export const ALCOVES: Alcove[] = [...alcovesFor('L', LEFT_SECTIONS), ...alcovesFor('R', RIGHT_SECTIONS)];

// Each alcove shows its section's books on two bookcases (the one nearer the
// far end = case 0), two eye-level rows each (upper first), 16 spines a row.
export const SPINES_PER_ROW = 16;
export const ROWS_PER_CASE = 2;
export const BOOKS_PER_CASE = SPINES_PER_ROW * ROWS_PER_CASE;

export interface ShelfSpot {
  alcove: Alcove;
  caseIndex: number;
  row: number;
  position: number; // 0-based, counted from the viewer's left
}

export const spotForIndex = (alcove: Alcove, index: number): ShelfSpot => ({
  alcove,
  caseIndex: Math.floor(index / BOOKS_PER_CASE),
  row: Math.floor((index % BOOKS_PER_CASE) / SPINES_PER_ROW),
  position: index % SPINES_PER_ROW,
});

const ordinal = (n: number) => {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${suffix}`;
};

// A human description of where a book stands, as seen when standing in the
// alcove facing its window. Facing the left wall, the case nearer the far end
// is on your right; facing the right wall, it is on your left.
export const describeSpot = ({ alcove, caseIndex, row, position }: ShelfSpot) => {
  const caseOnRight = alcove.side === 'L' ? caseIndex === 0 : caseIndex === 1;
  return [
    `${alcove.side === 'L' ? 'Left' : 'Right'} bay ${alcove.bay}`,
    `${caseOnRight ? 'right-hand' : 'left-hand'} bookcase`,
    `${row === 0 ? 'upper' : 'lower'} shelf`,
    `${ordinal(position + 1)} from the left`,
  ].join(' · ');
};

export const alcoveForSection = (sectionId: string) => ALCOVES.find((a) => a.section.id === sectionId);
