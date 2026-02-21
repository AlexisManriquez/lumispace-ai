// src/components/3d/SceneWrapper.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, useProgress } from "@react-three/drei";
import { Suspense, useState, useEffect, useMemo } from "react";
import Room from "./Room";
import Lighting from "./Lighting";
import Furniture from "./Furniture";
import { useStore } from "@/src/store/useStore";

function LoaderOverlay() {
    const { progress } = useProgress();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (progress === 100) {
            const timer = setTimeout(() => setVisible(false), 800);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (!visible) return null;

    return (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-1000 ${progress === 100 ? 'opacity-0 shadow-none' : 'opacity-100'}`}>
            <div className="relative w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                    className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-blue-400 font-mono text-xs tracking-widest uppercase animate-pulse">
                Initializing LumiSpace... {progress.toFixed(0)}%
            </p>
        </div>
    );
}

export default function SceneWrapper() {
    const timeOfDay = useStore((state) => state.timeOfDay);
    const isNight = timeOfDay < 6 || timeOfDay > 18;

    const skyColor = useMemo(() => {
        if (timeOfDay >= 10 && timeOfDay <= 15) return "#87CEEB";
        if (timeOfDay === 6 || timeOfDay === 18) return "#ED815C";
        if (timeOfDay === 7 || timeOfDay === 17) return "#FDB813";
        if (timeOfDay === 8 || timeOfDay === 16) return "#B0E0E6";
        if (isNight) return "#020617";
        return "#87CEEB";
    }, [timeOfDay, isNight]);

    return (
        <div className="w-full h-full bg-slate-950 relative">
            <LoaderOverlay />

            <Canvas
                shadows
                camera={{ position: [12, 10, 12], fov: 35 }}
                className="w-full h-full"
            >
                <color attach="background" args={[skyColor]} />
                <fog attach="fog" args={[skyColor, 15, 150]} />

                <Suspense fallback={null}>
                    <Lighting />

                    {isNight && (
                        <Stars
                            radius={100}
                            depth={50}
                            count={5000}
                            factor={10}
                            saturation={0}
                            fade
                            speed={1}
                        />
                    )}

                    <Room />
                    <Furniture />

                    <OrbitControls
                        makeDefault
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 1.9}
                        enableDamping
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
