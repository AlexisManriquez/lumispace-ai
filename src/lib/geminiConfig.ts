// src/lib/geminiConfig.ts
import { ASSET_REGISTRY, FLOOR_MATERIALS } from './assetRegistry';

const ITEM_TYPES = Object.keys(ASSET_REGISTRY);
const CATALOG_DESCRIPTION = Object.values(ASSET_REGISTRY)
    .map(asset => `- ${asset.id}: ${asset.description} (Dimensions: ${asset.dimensions.width}m x ${asset.dimensions.depth}m)`)
    .join('\n');

const FLOOR_DESCRIPTION = FLOOR_MATERIALS.map(m => `- ${m}`).join('\n');

export const SYSTEM_INSTRUCTION = `You are Lumi, a professional 3D room design AI assistant. 
You are collaborating with a human user in real-time. 

SPATIAL AWARENESS (THE GREAT ROOM):
1. Layout: The room is an L-shape 10x10 Great Room. 
   - LIVING AREA: The central and western open space.
   - KITCHEN NOOK: The back-right corner, partially divided by a structural stub wall at X = 2.5.
2. Wall Coordinates:
   - NORTH Wall (Back): Z = -5. (Has the "Back Window").
   - WEST Wall (Left): X = -5. (Has the large "Panorama Window" - West window).
   - SOUTH Wall (Front): Z = 5. (Open to camera).
   - EAST Wall (Right): X = 5. (Solid wall).
3. Structural Boundaries:
   - There is a stub wall at X = 2.5 extending from Z = -2.5 to Z = 2.5. Do not place furniture overlapping this wall.
4. Furniture Management:
   - Tracking: You MUST track the IDs of furniture you place.
   - Placement: Items have volume. Keep them ~1m away from walls (e.g., place at -4 or 4, not -5).
5. Rotation Logic:
   - 0°: Faces SOUTH (Camera).
   - 90°: Faces EAST (Right).
   - 180°: Faces NORTH (Back Window).
   - 270°: Faces WEST (Panorama Window).

AVAILABLE CATALOG:
${CATALOG_DESCRIPTION}

AVAILABLE MATERIALS:
${FLOOR_DESCRIPTION}

ARCHITECTURAL PERSONALITY:
- Aesthetic Goal: High-end, clean, and intentional.
- Placement: Align furniture with walls or the window view. For example, place a sofa facing the West Panorama window.
- Zones: Try to keep kitchen-related items in the "Kitchen Nook" (X > 2.5, Z < 0) and living-related items in the "Living Area".
- Lighting: Proactively use warm, dim interior lights for evening settings.

INSTRUCTIONS:
- Track IDs for updates/removals. Replacement is Remove + Place.
- Keep responses extremely concise and friendly.`;

export const ARCHITECT_TOOLS = [
    {
        functionDeclarations: [
            {
                name: "change_environment",
                description: "Updates the time of day, floor material, or wall color.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        timeOfDay: { type: "NUMBER", description: "Hour (0-23)" },
                        floorMaterial: { type: "STRING", enum: FLOOR_MATERIALS },
                        wallColor: { type: "STRING", description: "Hex color" }
                    }
                }
            },
            {
                name: "adjust_interior_lighting",
                description: "Controls the indoor smart lights.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        brightness: { type: "NUMBER", description: "Intensity from 0.0 to 1.0" },
                        color: { type: "STRING", description: "Hex color" },
                        isOn: { type: "BOOLEAN" }
                    }
                }
            },
            {
                name: "place_furniture",
                description: "Adds a new furniture item. RETURNS AN ID.",
                parameters: {
                    type: "OBJECT",
                    required: ["item_type", "x", "z"],
                    properties: {
                        item_type: { type: "STRING", enum: ITEM_TYPES },
                        x: { type: "NUMBER", description: "X coord (-4 to 4)" },
                        z: { type: "NUMBER", description: "Z coord (-4 to 4)" },
                        rotation: { type: "NUMBER", description: "Rotation in degrees (0..360)" }
                    }
                }
            },
            {
                name: "update_furniture",
                description: "Updates an existing item's position or rotation using its unique ID.",
                parameters: {
                    type: "OBJECT",
                    required: ["id"],
                    properties: {
                        id: { type: "STRING", description: "The ID returned by place_furniture" },
                        x: { type: "NUMBER" },
                        z: { type: "NUMBER" },
                        rotation: { type: "NUMBER" }
                    }
                }
            },
            {
                name: "remove_furniture",
                description: "Deletes a specific furniture item by ID.",
                parameters: {
                    type: "OBJECT",
                    required: ["id"],
                    properties: {
                        id: { type: "STRING" }
                    }
                }
            },
            {
                name: "clear_all_furniture",
                description: "Deletes all furniture from the room.",
                parameters: { type: "OBJECT", properties: {} }
            },
            {
                name: "check_spatial_safety",
                description: "Checks if there's enough clearance between furniture items for accessibility and safety.",
                parameters: { type: "OBJECT", properties: {} }
            },
            {
                name: "modify_architecture",
                description: "Toggles windows. Left Window is at X: -5, Back Window is at Z: -5.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        hasLeftWindow: { type: "BOOLEAN" },
                        hasBackWindow: { type: "BOOLEAN" }
                    }
                }
            }
        ]
    }
];


