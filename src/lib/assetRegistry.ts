// src/lib/assetRegistry.ts

export interface AssetDefinition {
    id: string;
    url: string;
    baseScale: [number, number, number];
    category: 'seating' | 'kitchen' | 'decor' | 'table';
    description: string;
    dimensions: {
        width: number;
        depth: number;
    };
    clearanceRequired?: number; // Necessary for Phase 5.2 Spatial Reasoning
}

const ASSET_BASE_URL = process.env.NEXT_PUBLIC_ASSET_BASE_URL || '';

export const ASSET_REGISTRY: Record<string, AssetDefinition> = {
    sofa: {
        id: "sofa",
        url: `${ASSET_BASE_URL}/assets/models/modern-sofa.glb`,
        baseScale: [3, 3, 3],
        category: "seating",
        description: "A wide, comfortable modern sofa for the living area.",
        dimensions: { width: 2.5, depth: 1.0 },
        clearanceRequired: 1.0,
    },

    kitchen_island: {
        id: "kitchen_island",
        url: `${ASSET_BASE_URL}/assets/models/kitchen-island.glb`,
        baseScale: [1.5, 1.5, 1.5],
        category: "kitchen",
        description: "A sturdy kitchen island for food preparation and storage.",
        dimensions: { width: 2.0, depth: 1.0 },
        clearanceRequired: 1.2,
    }
};
