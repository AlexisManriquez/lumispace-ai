// src/app/page.tsx
'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import LiveAgent from '@/src/components/ui/LiveAgent';
import { useStore } from '@/src/store/useStore';

// 2. Dynamically import the 3D Scene (Forces it to load on the user's browser, not the server)
const SceneWrapper = dynamic(() => import('@/src/components/3d/SceneWrapper'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111827] text-blue-400">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Initializing 3D Engine...</p>
    </div>
  )
});

export default function Home() {
  const {
    setTimeOfDay, setFloorMaterial, setWallColor,
    timeOfDay, addFurniture, activeFurniture,
    setAssetBaseUrl, setGeminiApiKey
  } = useStore();

  useEffect(() => {
    // 1. Automatically fetch the keys/urls as soon as the app starts
    const initApp = async () => {
      try {
        const response = await fetch('/api/get-key');
        const data = await response.json();

        if (data.assetBaseUrl) {
          setAssetBaseUrl(data.assetBaseUrl);
          console.log("✅ Asset URL loaded:", data.assetBaseUrl);
        }

        if (data.apiKey) {
          setGeminiApiKey(data.apiKey);
          console.log("✅ Gemini API Key loaded");
        }
      } catch (err) {
        console.error("❌ Initial fetch failed:", err);
      }
    };

    initApp();
  }, [setAssetBaseUrl, setGeminiApiKey]);

  return (
    <main className="flex h-screen w-screen bg-gray-900 text-white font-sans">

      {/* LEFT SIDEBAR (Loads Instantly) */}
      <div className="w-80 p-6 bg-gray-800 shadow-xl z-10 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">LumiSpace</h1>
          <p className="text-sm text-gray-400">AI Spatial Architect</p>
        </div>

        <LiveAgent />

        <hr className="border-gray-600" />
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Manual Controls Override</p>

        <div className="flex flex-col gap-2">
          <label className="text-sm">Time of Day: {timeOfDay}:00</label>
          <input type="range" min="0" max="23" step="1" value={timeOfDay} onChange={(e) => setTimeOfDay(Number(e.target.value))} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm">Floor Material</label>
          <div className="flex gap-2 text-sm">
            <button onClick={() => setFloorMaterial('wood_floor')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">Wood</button>
            <button onClick={() => setFloorMaterial('marble_01')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">Marble</button>
            <button onClick={() => setFloorMaterial('square_tiles')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">Tiles</button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm">Architecture & Furniture</label>
          <div className="flex gap-2 text-sm flex-wrap">
            <button onClick={() => useStore.getState().setLeftWindow(!useStore.getState().hasLeftWindow)} className="px-2 py-1 bg-blue-900 rounded border border-blue-500">Toggle Window</button>
            <button onClick={() => useStore.getState().addFurniture({ type: 'kitchen_island', position: [0, 0, 0], rotation: 0 })} className="px-2 py-1 bg-purple-900 rounded border border-purple-500">Add Island</button>
            <button onClick={() => useStore.getState().addFurniture({ type: 'sofa', position: [2, 0, 0], rotation: -90 })} className="px-2 py-1 bg-purple-900 rounded border border-purple-500">Add Couch</button>
            <button onClick={() => useStore.getState().clearAllFurniture()} className="px-2 py-1 bg-red-900 rounded border border-red-500">Clear Room</button>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter font-mono">
            Active Items: {activeFurniture.length}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: The 3D Canvas (Now completely unblocked!) */}
      <div className="flex-1 relative">
        <SceneWrapper />
      </div>

    </main>
  );
}