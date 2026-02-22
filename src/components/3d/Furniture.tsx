// src/components/3d/Furniture.tsx
"use client";

import { useGLTF } from "@react-three/drei";
import { useStore } from "@/src/store/useStore";
import { useMemo, Suspense } from "react";
import * as THREE from "three";
import { ASSET_REGISTRY } from "@/src/lib/assetRegistry";

interface ModelProps {
    url: string;
    scale?: [number, number, number];
    position?: [number, number, number];
    rotation?: [number, number, number];
}

function GenericModel({ url, scale = [1, 1, 1], position = [0, 0, 0], rotation = [0, 0, 0] }: ModelProps) {
    const { scene } = useGLTF(url, true);
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(m => {
                        if ('envMapIntensity' in m) (m as any).envMapIntensity = 2.0;
                        if ('roughness' in m) (m as any).roughness = 0.4;
                    });
                } else {
                    if ('envMapIntensity' in mesh.material) (mesh.material as any).envMapIntensity = 2.0;
                    if ('roughness' in mesh.material) (mesh.material as any).roughness = 0.4;
                }
            }
        }
    });

    return (
        <primitive
            object={clonedScene}
            scale={scale}
            position={position}
            rotation={rotation}
        />
    );
}

export default function Furniture() {
    const activeFurniture = useStore((state) => state.activeFurniture);
    const assetBaseUrl = useStore((state) => state.assetBaseUrl);

    // 🛑 THE CRITICAL GUARD: 
    // If the URL is empty, return null. 
    // This stops useGLTF from firing a 404 request to the wrong domain.
    if (!assetBaseUrl || assetBaseUrl === "") {
        return null;
    }

    // Sanitize baseUrl (strip trailing slash)
    const baseUrl = assetBaseUrl.endsWith('/')
        ? assetBaseUrl.slice(0, -1)
        : assetBaseUrl;

    return (
        <group>
            {activeFurniture.map((item) => {
                const definition = ASSET_REGISTRY[item.type] || ASSET_REGISTRY.sofa;
                const fullUrl = `${baseUrl}${definition.path}`;

                return (
                    <Suspense key={item.id} fallback={null}>
                        <GenericModel
                            url={fullUrl}
                            scale={definition.baseScale}
                            position={item.position}
                            rotation={[0, (item.rotation * Math.PI) / 180, 0]}
                        />
                    </Suspense>
                );
            })}
        </group>
    );
}
