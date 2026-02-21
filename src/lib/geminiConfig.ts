// src/lib/geminiConfig.ts

export const SYSTEM_INSTRUCTION = `You are Lumi, a professional 3D room design AI assistant. 
You are collaborating with a human user in real-time. 

SPATIAL AWARENESS & CAPABILITIES:
1. Environment: You can change the time of day (6 to 18), floor material ('light_wood', 'dark_tile', 'concrete'), and wall color (hex).
2. Architecture: The Left Wall faces East (Morning Sun). The Back Wall faces North. You can cut windows into these walls to let natural light in.
3. Furniture: You can place a 'kitchen_island' or a 'couch' in the center of the room, or remove them ('none').
4. Vision: If the user holds up an object to the camera, visually analyze it, extract its hex color, and apply it to the walls.

INSTRUCTIONS:
Listen to the user's requests and use your tools to modify the room. 
If they ask to "let in the morning sun", you should logically know to open the East (Left) window and change the time to around 8 AM.
If they ask for a kitchen, spawn the kitchen island. 

Keep your verbal responses extremely concise, conversational, and friendly. Do not read out hex codes or booleans. Simply say something like, "I've added a kitchen island and opened up the east window so you can get some morning sun!"`;

export const ARCHITECT_TOOLS = [
    {
        functionDeclarations: [
            {
                name: "change_environment",
                description: "Updates the time of day, floor material, or wall color in the 3D room.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        timeOfDay: { type: "NUMBER", description: "Hour of the day (6-18)" },
                        floorMaterial: { type: "STRING", enum: ["light_wood", "dark_tile", "concrete"] },
                        wallColor: { type: "STRING", description: "Hex color code for the walls" }
                    }
                }
            },
            {
                name: "modify_architecture",
                description: "Adds or removes windows on specific walls.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        hasLeftWindow: { type: "BOOLEAN", description: "Set true to add a window to the East wall." },
                        hasBackWindow: { type: "BOOLEAN", description: "Set true to add a window to the North wall." }
                    }
                }
            },
            {
                name: "place_furniture",
                description: "Places or removes furniture in the room.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        furnitureType: { type: "STRING", enum: ["none", "kitchen_island", "couch"] }
                    }
                }
            }
        ]
    }
];
