import { create } from 'zustand';

interface GameState {
  nearTableId: number | null;
  setNearTable: (id: number | null) => void;
  activeTableId: number | null;
  setActiveTable: (id: number | null) => void;
  joystickVector: { x: number; y: number };
  setJoystickVector: (v: { x: number; y: number }) => void;
  ambientSoundOn: boolean;
  setAmbientSound: (on: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  nearTableId: null,
  setNearTable: (id) => set({ nearTableId: id }),
  activeTableId: null,
  setActiveTable: (id) => set({ activeTableId: id }),
  joystickVector: { x: 0, y: 0 },
  setJoystickVector: (v) => set({ joystickVector: v }),
  ambientSoundOn: false,
  setAmbientSound: (on) => set({ ambientSoundOn: on }),
}));
