# 📱 LumiSpace: Application Breakdown

---

## 1. Executive Summary
LumiSpace is an agentic design platform that bridges the gap between 2D floor plans and 3D reality. Instead of using complex CAD software, users collaborate with **Lumi**—an AI architect—via natural voice conversation and video. 

Lumi doesn't just "chat"; she actively manipulates a 3D environment in real-time, understanding spatial context, lighting physics, and architectural constraints. The project delivers a professional, high-fidelity experience tailored for home buyers and designers who value visual clarity and instant feedback.

---

## 2. Current Feature Set (High-End Architectural Visualization)

### 🧠 Multimodal AI Core
*   **Real-Time Voice Conversation:** Users speak naturally to Lumi without push-to-talk latency (powered by Gemini Multimodal Live API via WebSockets).
*   **Computer Vision (Vision-to-Material):** Lumi analyzes the live video feed to extract colors from physical objects and apply them to the room's walls.
*   **Furniture Brain (ID Loop):** Lumi tracks every piece of furniture she places via **Unique IDs**. This allows her to rotate, move, or remove specific items later in the conversation.
*   **Massive Design Knowledge:** Lumi has been trained on a catalog of **19+ high-fidelity PBR textures**, allowing her to suggest and apply specific materials like "Diagonal Parquet" or "Marble 01" instantly.

### 🏛️ Advanced Architectural Structure
*   **The L-Shaped Great Room:** A professional 10x10m open-concept layout.
*   **Zoned Mapping:** Distinct areas including the **Living Area** (central/open) and a **Kitchen Nook** (defined by a structural stub wall).
*   **The "Ghost" Ceiling:** A white ceiling "lid" that is visible from inside (for realistic light bouncing and enclosure) but automatically becomes **invisible** from high camera angles, allowing for a "Sims-style" top-down design view.
*   **Window Architecture:** Deep floor-to-ceiling cutouts with refractive glass. A primary **West Panorama Window** captures dramatic sunset shadows across the floor.

### 🌓 Atmospheric & Environmental Logic
*   **Full 24-Hour Day/Night Cycle:**
    *   **Day:** Realistic sun trajectory with mathematically accurate Rayleigh scattering and dynamic Skybox transitions.
    *   **Night:** Automatic transition to deep night sky with a high-intensity starfield and auto-activation of warm interior point lights.
*   **Grounding (The Infinite Yard):** A massive $200m$ dark ground plane combined with a synchronized **Dynamic Fog** system. This eliminates the "floating box" effect and provides a horizon for architectural shadows to land on.
*   **Enhanced Lighting Rig:** 
    *   High-resolution shadow mapping ($2048 \times 2048$).
    *   4-Point Recessed Lighting grid for professional interior illumination.

### 🎨 Material & Interior Design
*   **PBR Texture Suite:** A custom pipeline delivering 1K **Physically Based Rendering** textures (Diffuse, Normal, Roughness, and AO maps).
*   **Dynamic Layout Tools:** AI tools to `place_furniture`, `update_furniture` (rotation/position), `remove_furniture`, and `clear_all_furniture`.
*   **Environment Mapping:** Dynamic switching between "City" and "Night" reflection presets to ensure realistic metallic and wood finishes.

---

## 3. Technical Architecture

### Frontend (The Interface)
*   **Framework:** Next.js 15 (App Router).
*   **3D Engine:** React Three Fiber (Three.js ecosystem).
*   **State Management:** Zustand (The "Bridge" between AI intelligence and 3D rendering).
*   **Dynamic Asset Suite:** A sub-component system in `Room.tsx` that hot-swaps PBR volumes and furniture meshes.

### Backend & Infrastructure (Google Cloud)
*   **Compute:** Google Cloud Run (Serverless Container).
*   **Security:** Server-side API Route (`/api/get-key`) for secure Gemini API key delivery.
*   **Asset Automation:** Python scripts used to sync texture libraries directly into the project's public directory.

---

## 4. User Flow (The Demo Script)

1.  **Entry:** User hits the URL. A branded splash screen tracks the loading of the PBR material library.
2.  **Interaction:** User clicks "Initialize Vision."
3.  **Spatial Creation:** User says, *"Lumi, let's start with a modern kitchen. Open the west window and put a kitchen island in the nook."*
    *   *Action:* Lumi toggles the architecture and places the island at the exact nook coordinates.
4.  **Material Request:** User says, *"Give the living room a more classic look. Can you try a dark wooden floor?"*
    *   *Action:* Lumi triggers the PBR loader for `dark_wooden_planks`. The floor instantly gains deep textures.
5.  **Furniture Tuning:** User says, *"The island is facing the wrong way. Rotate it 90 degrees."*
    *   *Action:* Using the **Unique ID**, Lumi sends an update command to rotate that specific object.
6.  **Sunset Transition:** User says, *"What would this look like during a sunset?"*
    *   *Action:* The sun moves to the horizon (18:00), casting long, dramatic shadows through the Panorama window and onto the Infinite Yard.
7.  **Night Mode:** User says, *"Now show me how it looks at night."*
    *   *Action:* The sun sets, stars appear, and warm interior lights reveal the interior's details.
