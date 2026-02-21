import { create } from 'zustand';
import { ASSET_BASE_URL } from '../lib/assetRegistry';

// ... (FurnitureItem and LightingState kept same)
export interface FurnitureItem {
    id: string;
    type: string;
    position: [number, number, number];
    rotation: number; // degrees
}

export interface LightingState {
    intensity: number;
    color: string;
    isOn: boolean;
}

interface SpaceState {
    timeOfDay: number; // 0 to 23
    floorMaterial: string;
    wallColor: string;

    // PHASE 3 STATES
    hasLeftWindow: boolean; // East Wall
    hasBackWindow: boolean; // North Wall

    // NEW PHASE 4 STATES
    interiorLights: LightingState;
    activeFurniture: FurnitureItem[];

    setTimeOfDay: (time: number) => void;
    setFloorMaterial: (material: string) => void;
    setWallColor: (color: string) => void;
    setLeftWindow: (hasWindow: boolean) => void;
    setBackWindow: (hasWindow: boolean) => void;

    // NEW PHASE 4 SETTERS
    setInteriorLighting: (lighting: Partial<LightingState>) => void;
    addFurniture: (item: Omit<FurnitureItem, 'id'>) => string;
    updateFurniture: (id: string, updates: Partial<Omit<FurnitureItem, 'id'>>) => void;
    removeFurniture: (id: string) => void;
    clearAllFurniture: () => void;

    // RUNTIME ASSET URL
    runtimeAssetBaseUrl: string;
    setRuntimeAssetBaseUrl: (url: string) => void;
}

// Bounding box for the room
const BOUNDS = { min: -4.5, max: 4.5 };
const clamp = (val: number) => Math.min(Math.max(val, BOUNDS.min), BOUNDS.max);

export const useStore = create<SpaceState>((set) => ({
    timeOfDay: 14,
    floorMaterial: 'wood_floor',
    wallColor: '#f0f0f0',

    hasLeftWindow: false,
    hasBackWindow: false,

    interiorLights: {
        intensity: 0.5,
        color: '#ffccaa',
        isOn: false,
    },
    activeFurniture: [],

    setTimeOfDay: (time) => set((state) => {
        // Smart lighting logic: Default to ON between 8 PM (20) and 5 AM (5)
        const isNight = time >= 20 || time <= 5;
        return {
            timeOfDay: time,
            interiorLights: {
                ...state.interiorLights,
                isOn: isNight ? true : state.interiorLights.isOn
            }
        };
    }),

    setFloorMaterial: (material) => set({ floorMaterial: material }),
    setWallColor: (color) => set({ wallColor: color }),
    setLeftWindow: (hasWindow) => set({ hasLeftWindow: hasWindow }),
    setBackWindow: (hasWindow) => set({ hasBackWindow: hasWindow }),

    setInteriorLighting: (lighting) => set((state) => ({
        interiorLights: { ...state.interiorLights, ...lighting }
    })),

    addFurniture: (item) => {
        const id = `${item.type}_${Math.random().toString(36).substr(2, 9)}`;
        const clampedPosition: [number, number, number] = [
            clamp(item.position[0]),
            item.position[1],
            clamp(item.position[2])
        ];
        set((state) => ({
            activeFurniture: [...state.activeFurniture, { ...item, id, position: clampedPosition }]
        }));
        return id;
    },

    updateFurniture: (id, updates) => set((state) => ({
        activeFurniture: state.activeFurniture.map((item) => {
            if (item.id === id) {
                const newPos = updates.position || item.position;
                const clampedPosition: [number, number, number] = [
                    clamp(newPos[0]),
                    newPos[1], // Maintain Y scale/position
                    clamp(newPos[2])
                ];
                return { ...item, ...updates, position: clampedPosition };
            }
            return item;
        })
    })),

    removeFurniture: (id) => set((state) => ({
        activeFurniture: state.activeFurniture.filter((item) => item.id !== id)
    })),

    clearAllFurniture: () => set({ activeFurniture: [] }),

    runtimeAssetBaseUrl: ASSET_BASE_URL,
    setRuntimeAssetBaseUrl: (url) => set({ runtimeAssetBaseUrl: url }),
}));

