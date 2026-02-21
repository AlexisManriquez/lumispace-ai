'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Room from '@/src/components/3d/Room';
import Lighting from '@/src/components/3d/Lighting';
import LiveAgent from '@/src/components/ui/LiveAgent';
import Furniture from '@/src/components/3d/Furniture';
import { useStore } from '@/src/store/useStore';

export default function Home() {
  const { setTimeOfDay, setFloorMaterial, setWallColor, timeOfDay } = useStore();

  return (
    <main className="flex h-screen w-screen bg-gray-900 text-white font-sans">

      {/* LEFT SIDEBAR */}
      <div className="w-80 p-6 bg-gray-800 shadow-xl z-10 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">LumiSpace PoC</h1>
          <p className="text-sm text-gray-400">Phase 2 & 3: AI Tool Calling</p>
        </div>

        {/* --- THE GEMINI CONTROLS --- */}
        <LiveAgent />

        <hr className="border-gray-600" />

        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Manual Controls Override</p>

        <div className="flex flex-col gap-2">
          <label>Time of Day: {timeOfDay}:00</label>
          <input
            type="range" min="6" max="18" step="1"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(Number(e.target.value))}
          />
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
          <label>Wall Color</label>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setWallColor('#f0f0f0')} className="p-2 bg-white text-black rounded text-sm">White</button>
            <button onClick={() => setWallColor('#2c3e50')} className="p-2 bg-slate-800 text-white border rounded text-sm">Navy</button>
            <button onClick={() => setWallColor('#8f9779')} className="p-2 bg-green-800 text-white rounded text-sm">Sage</button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm">Architecture & Furniture</label>
          <div className="flex gap-2 text-sm flex-wrap">
            <button onClick={() => useStore.getState().setLeftWindow(!useStore.getState().hasLeftWindow)} className="px-2 py-1 bg-blue-900 rounded border border-blue-500">Toggle East Window</button>
            <button onClick={() => useStore.getState().setFurniture('kitchen_island')} className="px-2 py-1 bg-purple-900 rounded border border-purple-500">Add Island</button>
            <button onClick={() => useStore.getState().setFurniture('couch')} className="px-2 py-1 bg-purple-900 rounded border border-purple-500">Add Couch</button>
            <button onClick={() => useStore.getState().setFurniture('none')} className="px-2 py-1 bg-red-900 rounded border border-red-500">Clear Room</button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
          <color attach="background" args={['#111827']} />
          <Environment preset="city" />
          <Lighting />
          <Room />
          <Furniture />
          <OrbitControls target={[0, 2, 0]} />
        </Canvas>
      </div>
    </main>
  );
}