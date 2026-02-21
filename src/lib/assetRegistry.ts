// src/lib/assetRegistry.ts

export interface AssetDefinition {
    id: string;
    path: string; // Relative path (e.g. /assets/models/...)
    baseScale: [number, number, number];
    category: 'seating' | 'kitchen' | 'decor' | 'table';
    description: string;
    dimensions: {
        width: number;
        depth: number;
    };
    clearanceRequired?: number; // Necessary for Phase 5.2 Spatial Reasoning
}

// 1. Build-time Variable (Hardcoded by Next.js during 'npm run build')
const buildTimeBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL || '';

// 2. Runtime Detection (For local dev or browser-side overrides)
const getRuntimeBaseUrl = () => {
    if (typeof window === 'undefined') return buildTimeBaseUrl;

    // Manual Override via URL param: ?asset_url=https://...
    const params = new URLSearchParams(window.location.search);
    const override = params.get('asset_url');
    if (override) return override.endsWith('/') ? override.slice(0, -1) : override;

    return buildTimeBaseUrl;
};

const resolvedBase = getRuntimeBaseUrl();
export const ASSET_BASE_URL = resolvedBase.endsWith('/') ? resolvedBase.slice(0, -1) : resolvedBase;

// 3. Console Debugging Tool
if (typeof window !== 'undefined') {
    (window as any).lumi = {
        config: {
            ASSET_BASE_URL,
            buildTimeBaseUrl,
            params: new URLSearchParams(window.location.search).get('asset_url')
        },
        help: "Type 'lumi.config' to see asset paths. Add '?asset_url=...' to force a GCS bucket."
    };

    console.log("🧩 LumiSpace Config Attached. Type 'lumi' to inspect.");
}

export const ASSET_REGISTRY: Record<string, AssetDefinition> = {
    sofa: {
        id: "sofa",
        path: "/assets/models/modern-sofa.glb",
        baseScale: [3, 3, 3],
        category: "seating",
        description: "A wide, comfortable modern sofa for the living area.",
        dimensions: { width: 2.5, depth: 1.0 },
        clearanceRequired: 1.0,
    },

    kitchen_island: {
        id: "kitchen_island",
        path: "/assets/models/kitchen-island.glb",
        baseScale: [1.5, 1.5, 1.5],
        category: "kitchen",
        description: "A sturdy kitchen island for food preparation and storage.",
        dimensions: { width: 2.0, depth: 1.0 },
        clearanceRequired: 1.2,
    }
};

export const FLOOR_MATERIALS = [
    "dark_wooden_planks",
    "diagonal_parquet",
    "floor_tiles_02",
    "floor_tiles_04",
    "floor_tiles_06",
    "floor_tiles_08",
    "laminate_floor",
    "laminate_floor_02",
    "laminate_floor_03",
    "marble_01",
    "old_wood_floor",
    "plank_flooring",
    "plank_flooring_02",
    "rectangular_parquet",
    "square_tiles",
    "stone_tiles",
    "tiled_floor_001",
    "wood_floor",
    "wood_planks"
];
