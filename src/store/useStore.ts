// src/store/useStore.ts
import { create } from 'zustand';

interface SpaceState {
    timeOfDay: number; // 6 to 18
    floorMaterial: string;
    wallColor: string;

    // NEW PHASE 3 STATES
    hasLeftWindow: boolean; // East Wall
    hasBackWindow: boolean; // North Wall
    furnitureType: string; // 'none' | 'kitchen_island' | 'couch'

    setTimeOfDay: (time: number) => void;
    setFloorMaterial: (material: string) => void;
    setWallColor: (color: string) => void;

    // NEW PHASE 3 SETTERS
    setLeftWindow: (hasWindow: boolean) => void;
    setBackWindow: (hasWindow: boolean) => void;
    setFurniture: (type: string) => void;
}

export const useStore = create<SpaceState>((set) => ({
    timeOfDay: 14,
    floorMaterial: 'light_wood',
    wallColor: '#f0f0f0',

    hasLeftWindow: false,
    hasBackWindow: false,
    furnitureType: 'none',

    setTimeOfDay: (time) => set({ timeOfDay: time }),
    setFloorMaterial: (material) => set({ floorMaterial: material }),
    setWallColor: (color) => set({ wallColor: color }),

    setLeftWindow: (hasWindow) => set({ hasLeftWindow: hasWindow }),
    setBackWindow: (hasWindow) => set({ hasBackWindow: hasWindow }),
    setFurniture: (type) => set({ furnitureType: type }),
}));