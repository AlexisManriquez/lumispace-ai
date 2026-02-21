// src/components/3d/Furniture.tsx
'use client';
import { useStore } from '@/src/store/useStore';

export default function Furniture() {
    const furnitureType = useStore((state) => state.furnitureType);

    if (furnitureType === 'none') return null;

    if (furnitureType === 'kitchen_island') {
        return (
            <group position={[0, 0, 0]}>
                {/* Island Base (Dark wood) */}
                <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
                    <boxGeometry args={[3, 1.8, 1.5]} />
                    <meshStandardMaterial color="#3e2723" roughness={0.9} />
                </mesh>
                {/* Countertop (White Marble) */}
                <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
                    <boxGeometry args={[3.2, 0.1, 1.7]} />
                    <meshStandardMaterial color="#f8f9fa" roughness={0.1} metalness={0.1} />
                </mesh>
            </group>
        );
    }

    if (furnitureType === 'couch') {
        return (
            <group position={[0, 0, 1]}>
                {/* Couch Base */}
                <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[4, 0.8, 1.5]} />
                    <meshStandardMaterial color="#455a64" roughness={0.8} />
                </mesh>
                {/* Backrest */}
                <mesh position={[0, 1.2, -0.6]} castShadow receiveShadow>
                    <boxGeometry args={[4, 1, 0.3]} />
                    <meshStandardMaterial color="#455a64" roughness={0.8} />
                </mesh>
                {/* Armrests */}
                <mesh position={[-1.85, 1, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.3, 0.6, 1.5]} />
                    <meshStandardMaterial color="#455a64" roughness={0.8} />
                </mesh>
                <mesh position={[1.85, 1, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.3, 0.6, 1.5]} />
                    <meshStandardMaterial color="#455a64" roughness={0.8} />
                </mesh>
            </group>
        );
    }

    return null;
}
