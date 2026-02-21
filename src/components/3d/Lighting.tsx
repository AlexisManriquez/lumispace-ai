// src/components/3d/Lighting.tsx
"use client";

import { Sky, Environment, ContactShadows } from "@react-three/drei";
import { useStore } from "@/src/store/useStore";
import * as THREE from "three";
import { useMemo } from "react";

export default function Lighting() {
    const timeOfDay = useStore((state) => state.timeOfDay);
    const interiorLights = useStore((state) => state.interiorLights);

    // 🌞 Sun Position Logic (Mathematically mapped to 0-24h)
    const sunPosition = useMemo(() => {
        // We use a slight tilt on the Z axis so the sun isn't perfectly centered
        const angle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
        return [
            Math.cos(angle) * 100,
            Math.sin(angle) * 100,
            -50
        ] as [number, number, number];
    }, [timeOfDay]);

    const isNight = timeOfDay < 6 || timeOfDay > 18;

    return (
        <>
            {/* 1. THE SKY: Rayleigh scattering physics create blue at noon and orange at sunset */}
            {!isNight && (
                <Sky
                    sunPosition={sunPosition}
                    turbidity={10}
                    rayleigh={2}
                    mieCoefficient={0.005}
                    mieDirectionalG={0.8}
                />
            )}

            {/* 1. AMBIENT LIGHT: Soft base lighting */}
            <ambientLight intensity={0.7} />

            {/* 2. POINT LIGHTS (Interior Smart Lights) */}
            {interiorLights.isOn && (
                <pointLight
                    position={[0, 4, 0]}
                    intensity={interiorLights.intensity * 2}
                    color={interiorLights.color}
                    castShadow
                />
            )}

            {/* 3. THE SUN: Turns off at night */}
            {!isNight && (
                <directionalLight
                    castShadow
                    position={sunPosition}
                    intensity={2.0}
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-left={-20}
                    shadow-camera-right={20}
                    shadow-camera-top={20}
                    shadow-camera-bottom={20}
                    shadow-bias={-0.0001}
                />
            )}

            {/* 4. INTERIOR LIGHTING RIG: 4-Point Grid Recessed Cans */}
            {interiorLights.isOn && (
                <group position={[0, 4.5, 0]}>
                    <pointLight
                        position={[-2.5, 0, -2.5]}
                        intensity={interiorLights.intensity * 25}
                        color={interiorLights.color}
                        castShadow
                        shadow-mapSize={[512, 512]}
                    />
                    <pointLight
                        position={[2.5, 0, -2.5]}
                        intensity={interiorLights.intensity * 25}
                        color={interiorLights.color}
                        castShadow
                        shadow-mapSize={[512, 512]}
                    />
                    <pointLight
                        position={[-2.5, 0, 2.5]}
                        intensity={interiorLights.intensity * 25}
                        color={interiorLights.color}
                        castShadow
                        shadow-mapSize={[512, 512]}
                    />
                    <pointLight
                        position={[2.5, 0, 2.5]}
                        intensity={interiorLights.intensity * 25}
                        color={interiorLights.color}
                        castShadow
                        shadow-mapSize={[512, 512]}
                    />
                </group>
            )}

            {/* 5. REFLECTIONS */}
            <Environment preset={isNight ? "night" : "city"} />

            {/* 6. GROUND SHADOWS */}
            <ContactShadows
                position={[0, 0, 0]}
                opacity={0.6}
                scale={20}
                blur={2}
                far={4.5}
            />
        </>
    );
}
