// src/components/3d/SceneWrapper.tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Room from './Room';
import Lighting from './Lighting';
import Furniture from './Furniture';
import { Suspense } from 'react';

export default function SceneWrapper() {
    return (
        <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
            {/* Suspense tells React not to freeze while downloading the Environment lighting */}
            <Suspense fallback={null}>
                <color attach="background" args={['#111827']} />
                <Environment preset="city" />
                <Lighting />
                <Room />
                <Furniture />
                <OrbitControls target={[0, 2, 0]} />
            </Suspense>
        </Canvas>
    );
}
