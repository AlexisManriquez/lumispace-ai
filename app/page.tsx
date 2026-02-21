// src/app/page.tsx
'use client';
import dynamic from 'next/dynamic'; // <-- 1. Import Next.js Dynamic
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
  const { setTimeOfDay, setFloorMaterial, setWallColor, timeOfDay } = useStore();

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
          <input type="range" min="6" max="18" step="1" value={timeOfDay} onChange={(e) => setTimeOfDay(Number(e.target.value))} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm">Floor Material</label>
          <div className="flex gap-2 text-sm">
            <button onClick={() => setFloorMaterial('light_wood')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">Wood</button>
            <button onClick={() => setFloorMaterial('dark_tile')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">Tile</button>
            <button onClick={() => setFloorMaterial('concrete')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">Concrete</button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm">Architecture & Furniture</label>
          <div className="flex gap-2 text-sm flex-wrap">
            <button onClick={() => useStore.getState().setLeftWindow(!useStore.getState().hasLeftWindow)} className="px-2 py-1 bg-blue-900 rounded border border-blue-500">Toggle Window</button>
            <button onClick={() => useStore.getState().setFurniture('kitchen_island')} className="px-2 py-1 bg-purple-900 rounded border border-purple-500">Add Island</button>
            <button onClick={() => useStore.getState().setFurniture('couch')} className="px-2 py-1 bg-purple-900 rounded border border-purple-500">Add Couch</button>
            <button onClick={() => useStore.getState().setFurniture('none')} className="px-2 py-1 bg-red-900 rounded border border-red-500">Clear Room</button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The 3D Canvas (Now completely unblocked!) */}
      <div className="flex-1 relative">
        <SceneWrapper />
      </div>

    </main>
  );
}