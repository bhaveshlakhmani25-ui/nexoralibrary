import { create } from 'zustand';
import type { CatalogBook } from './library/catalog';
import type { ShelfSpot } from './library/shelves';

export interface GameState {
  nearTable: { id: number, transform: { pos: [number, number, number], rot: [number, number, number] } } | null;
  setNearTable: (table: { id: number, transform: { pos: [number, number, number], rot: [number, number, number] } } | null) => void;
  clearNearTable: (id: number) => void;
  
  // Seated Experience
  isSeated: boolean;
  seatTransform: { pos: [number, number, number], rot: [number, number, number] } | null;
  setSeated: (seated: boolean, transform?: { pos: [number, number, number], rot: [number, number, number] }) => void;

  // Session State
  sessionState: 'idle' | 'choosing' | 'reading' | 'studying';
  setSessionState: (state: 'idle' | 'choosing' | 'reading' | 'studying') => void;
  
  // Timer State
  studyDuration: number;
  timeRemaining: number;
  timerActive: boolean;
  setStudySession: (duration: number) => void;
  tickTimer: () => void;
  toggleTimer: () => void;
  
  // Reading: the book the player is carrying (and reads when seated)
  currentBook: CatalogBook | null;
  setCurrentBook: (book: CatalogBook | null) => void;
  startReading: (book?: CatalogBook) => void;
  // A spine the player clicked on a shelf, shown as a details card
  shelfSelection: { book: CatalogBook, spot: ShelfSpot } | null;
  setShelfSelection: (selection: { book: CatalogBook, spot: ShelfSpot } | null) => void;
  hoveredSpine: CatalogBook | null;
  setHoveredSpine: (book: CatalogBook | null) => void;
  // Catalogue browser for changing books from the table
  catalogOpen: boolean;
  setCatalogOpen: (open: boolean) => void;

  // Global actions
  endSession: () => void;

  joystickVector: { x: number; y: number };
  setJoystickVector: (v: { x: number; y: number }) => void;
  ambientSoundOn: boolean;
  setAmbientSound: (on: boolean) => void;
  resetTrigger: number;
  triggerReset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  nearTable: null,
  setNearTable: (table) => set({ nearTable: table }),
  // Only clear when leaving the seat that is currently prompted; sensors can
  // overlap, and leaving one must not hide the prompt of the one still entered.
  clearNearTable: (id) => set((state) => (state.nearTable?.id === id ? { nearTable: null } : state)),
  
  isSeated: false,
  seatTransform: null,
  setSeated: (seated, transform) => set({ 
    isSeated: seated, 
    seatTransform: transform || null,
    sessionState: seated ? 'choosing' : 'idle',
    timerActive: false
  }),

  sessionState: 'idle',
  setSessionState: (state) => set({ sessionState: state }),
  
  studyDuration: 0,
  timeRemaining: 0,
  timerActive: false,
  setStudySession: (duration) => set({ 
    studyDuration: duration, 
    timeRemaining: duration * 60, 
    timerActive: true, 
    sessionState: 'studying' 
  }),
  
  tickTimer: () => set((state) => {
    if (state.timerActive && state.timeRemaining > 0) {
      return { timeRemaining: state.timeRemaining - 1 };
    }
    return state;
  }),
  toggleTimer: () => set((state) => ({ timerActive: !state.timerActive })),
  
  currentBook: null,
  setCurrentBook: (book) => set({ currentBook: book }),
  startReading: (book) => set((state) => ({
    currentBook: book ?? state.currentBook,
    sessionState: 'reading',
    catalogOpen: false,
  })),
  shelfSelection: null,
  setShelfSelection: (selection) => set({ shelfSelection: selection }),
  hoveredSpine: null,
  setHoveredSpine: (book) => set({ hoveredSpine: book }),
  catalogOpen: false,
  setCatalogOpen: (open) => set({ catalogOpen: open }),

  // Keep the last seat transform for one render after leaving. Player uses it
  // to place the avatar beside the chair before normal movement resumes.
  endSession: () => set((state) => ({
    sessionState: 'idle', 
    isSeated: false, 
    seatTransform: state.seatTransform,
    timerActive: false,
    catalogOpen: false,
  })),

  joystickVector: { x: 0, y: 0 },
  setJoystickVector: (v) => set({ joystickVector: v }),
  ambientSoundOn: false,
  setAmbientSound: (on) => set({ ambientSoundOn: on }),

  resetTrigger: 0,
  triggerReset: () => set((state) => ({ resetTrigger: state.resetTrigger + 1, isSeated: false, sessionState: 'idle' })),
}));
