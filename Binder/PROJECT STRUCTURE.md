# 📂 LumiSpace: Project Structure

This document outlines the file architecture of the LumiSpace application. The project is built on **Next.js 15** and follows a modular feature-based architecture separating the **3D Engine**, **AI Logic**, and **UI State**.

---

## 🏗️ Root Directory

```text
lumispace-poc/
├── .env.local                  # Local Environment Variables (API Keys)
├── Binder/                     # Project Strategy & Documentation
│   ├── APP BREAKDOWN.md        # Feature list and capabilities
│   ├── PHASE_2_PLAN.md         # Roadmap for architectural visualization
│   └── PROJECT STRUCTURE.md    # (This file)
├── app/                        # Next.js App Router (Layouts, Pages, APIs)
├── scripts/                    # Automation and asset sync utilities
│   └── download_textures.py    # Python logic to sync textures from Poly Haven API
├── src/                        # Source code (Components, Store, Config)
├── public/                     # Static assets (Models, Textures)
│   └── textures/               # 19+ High-fidelity PBR texture sets
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and scripts
└── tsconfig.json               # TypeScript configuration (@/* aliases)
```

---

## 🧠 Source Code (`src/` & `app/`)

### 1. App Router (`app/`)
*Handles routing, API endpoints, and the main entry point.*

*   **`page.tsx`**: The main dashboard. Features a glassmorphic sidebar and a full-screen 3D viewport. Includes manual controls for environment and architectural items.
*   **`api/get-key/route.ts`**: Secure server-side endpoint to fetch the Gemini API key from environment variables at runtime.

### 2. 3D Engine (`src/components/3d/`)
*Built with React Three Fiber and @react-three/drei.*

*   **`SceneWrapper.tsx`**: The root of the 3D world.
    *   **Atmosphere & Fog:** Implements dynamic `skyColor` and a synchronized **Fog System** to blend the horizon seamlessly at any time of day.
    *   **Custom Loader:** Branded splash screen with real-time progress tracking for PBR assets.
*   **`Room.tsx`**: The architectural structure.
    *   **L-Shape Great Room:** Implements a professional layout with a North wall, East wall, and West Panorama window.
    *   **Kitchen Nook:** Features a structural "stub wall" to divide the space.
    *   **The Ghost Ceiling:** A ceiling plane visible from inside but invisible from above (using orientation logic) to allow unobstructed design views.
    *   **Infinite Yard:** A massive 200m grounded world-floor for realistic shadow projection.
*   **`Lighting.tsx`**: The "Atmospheric Engine."
    *   **24-Hour Trajectory:** Sun path with Rayleigh scattering physics.
    *   **Advanced Shadows:** High-resolution shadow mapping ($2048 \times 2048$) with expanded camera frustum to cover the yard.
    *   **Interior Rig:** A 4-point recessed lighting grid that activates automatically at night.
*   **`Furniture.tsx`**: Dynamic asset management.
    *   Handles GLTF loading and material application for furniture items tracked by the store.

### 3. UI & AI Logic (`src/components/ui/`)
*The interaction layer.*

*   **`LiveAgent.tsx`**: Manages the real-time AI session.
    *   **Furniture ID Loop:** Implements logic to track and return unique IDs for placed items, allowing Lumi to modify (rotate/move/remove) specific objects.
    *   **Multimodal Feed:** Streams audio and video frames for real-time design collaboration.

### 4. Personality & Config (`src/lib/`)
*   **`geminiConfig.ts`**: Defines Lumi's architectural personality, spatial awareness of "Zones" (Living vs Kitchen), and the tool definitions for furniture and environmental control.

### 5. State Management (`src/store/`)
*   **`useStore.ts`**: The "Source of Truth" (Zustand).
    *   Manages the collection of `activeFurniture`, tracking their unique IDs, positions, and rotations.
    *   Centralizes architectural state (windows, wall colors, lighting).

---

## 🔑 Key Data Flow

1.  **Placement:** `Lumi` -> `place_furniture` -> `LiveAgent.tsx` -> `addFurniture` -> **Store ID Created**.
2.  **ID Loop:** `Store ID` -> Returned to `Lumi`.
3.  **Modification:** `Lumi` -> `update_furniture(ID)` -> `useStore.ts` -> `Furniture.tsx` **re-renders specific item**.
4.  **Enclosure:** `Interior Lights` -> Bounce off `Ghost Ceiling` (Room.tsx) -> Create ambient occlusion.
5.  **Grounding:** `Sun` (Lighting.tsx) -> Casts shadow of `Room` -> Visible on `Infinite Yard` (Room.tsx).