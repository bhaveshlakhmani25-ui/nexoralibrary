import { create } from 'zustand';

export interface GameState {
  nearTable: { id: number, transform: { pos: [number, number, number], rot: [number, number, number] } } | null;
  setNearTable: (table: { id: number, transform: { pos: [number, number, number], rot: [number, number, number] } } | null) => void;
  
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
  
  // Reading
  bookCategory: string | null;
  setBookCategory: (category: string | null) => void;

  // Global actions
  endSession: () => void;

  joystickVector: { x: number; y: number };
  setJoystickVector: (v: { x: number; y: number }) => void;
  ambientSoundOn: boolean;
  setAmbientSound: (on: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  nearTable: null,
  setNearTable: (table) => set({ nearTable: table }),
  
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
  
  bookCategory: null,
  setBookCategory: (category) => set({ bookCategory: category, sessionState: 'reading' }),

  endSession: () => set({ 
    sessionState: 'idle', 
    isSeated: false, 
    seatTransform: null, 
    timerActive: false 
  }),

  joystickVector: { x: 0, y: 0 },
  setJoystickVector: (v) => set({ joystickVector: v }),
  ambientSoundOn: false,
  setAmbientSound: (on) => set({ ambientSoundOn: on }),
}));
