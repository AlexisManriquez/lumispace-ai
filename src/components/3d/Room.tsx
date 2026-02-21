// src/components/3d/Room.tsx
"use client";

import { useStore } from "@/src/store/useStore";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Suspense } from "react";

import { ASSET_BASE_URL } from "@/src/lib/assetRegistry";

// A helper component for the Textured Floor to handle Suspense locally or let it bubble up
function TexturedFloor({ materialId }: { materialId: string }) {
    // Try to load textures from the local public folder
    const maps = useTexture({
        map: `${ASSET_BASE_URL}/assets/textures/${materialId}/diff.jpeg`,
        normalMap: `${ASSET_BASE_URL}/assets/textures/${materialId}/nor.jpeg`,
        roughnessMap: `${ASSET_BASE_URL}/assets/textures/${materialId}/rough.jpeg`,
        aoMap: `${ASSET_BASE_URL}/assets/textures/${materialId}/ao.jpeg`,
    });

    // Optimize textures
    if (maps.map) {
        Object.values(maps).forEach((texture: any) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4); // Architectural tiling
        });
    }

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial
                {...maps}
                normalScale={new THREE.Vector2(1, 1)}
                envMapIntensity={0.5}
            />
        </mesh>
    );
}

// A helper component to build a wall with or without a window
const Wall = ({ position, rotation, hasWindow, wallColor }: any) => {
    if (!hasWindow) {
        return (
            <mesh position={position} rotation={rotation} castShadow receiveShadow>
                <boxGeometry args={[10, 5, 0.4]} />
                <meshStandardMaterial color={wallColor} roughness={0.9} />
            </mesh>
        );
    }

    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, -1.75, 0]} castShadow receiveShadow>
                <boxGeometry args={[10, 1.5, 0.4]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
            <mesh position={[0, 1.75, 0]} castShadow receiveShadow>
                <boxGeometry args={[10, 1.5, 0.4]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
            <mesh position={[-3.5, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 2, 0.4]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
            <mesh position={[3.5, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 2, 0.4]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>

            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[4.1, 2.1, 0.05]} />
                <meshPhysicalMaterial
                    transmission={0.95}
                    thickness={0.2}
                    roughness={0}
                    ior={1.5}
                    color="#eef"
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </group>
    );
};

export default function Room() {
    const wallColor = useStore((state: any) => state.wallColor);
    const floorMaterial = useStore((state: any) => state.floorMaterial);
    const hasLeftWindow = useStore((state: any) => state.hasLeftWindow);
    const hasBackWindow = useStore((state: any) => state.hasBackWindow);

    return (
        <group>
            {/* 🧱 THE MAIN FLOOR */}
            <Suspense fallback={
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                    <planeGeometry args={[20, 20]} />
                    <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
                </mesh>
            }>
                <TexturedFloor materialId={floorMaterial} />
            </Suspense>

            {/* 🌳 THE INFINITE YARD (World Floor) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#0a0a0a" roughness={1.0} metalness={0.0} />
            </mesh>

            {/* 🏛️ ARCHITECTURE: THE GREAT ROOM LAYOUT */}

            {/* 1. NORTH WALL (Back) - Main anchor */}
            <Wall position={[0, 2.5, -5]} rotation={[0, 0, 0]} hasWindow={hasBackWindow} wallColor={wallColor} />

            {/* 2. WEST WALL (Left) - Panorama Window side */}
            <Wall position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} hasWindow={hasLeftWindow} wallColor={wallColor} />

            {/* 3. EAST WALL (Right) - Nook side */}
            <Wall position={[5, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} hasWindow={false} wallColor={wallColor} />

            {/* 4. THE KITCHEN STUB - Creates the "Nook" in the back-right corner */}
            {/* 4. THE KITCHEN STUB - Creates the "Nook" in the back-right corner */}
            <mesh position={[2.5, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.4, 5, 5]} />
                <meshStandardMaterial color={wallColor} roughness={0.9} />
            </mesh>

            {/* 5. THE GHOST CEILING (Lid) */}
            <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial
                    color="#ffffff"
                    roughness={1}
                />
            </mesh>
        </group>
    );
}