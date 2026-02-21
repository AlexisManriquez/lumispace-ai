// src/components/3d/Room.tsx
'use client';
import { useStore } from '@/src/store/useStore';

// A helper component to build a wall with or without a window
const Wall = ({ position, rotation, hasWindow, wallColor }: any) => {
    if (!hasWindow) {
        // Solid Wall
        return (
            <mesh position={position} rotation={rotation} castShadow receiveShadow>
                <boxGeometry args={[10, 5, 0.2]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
        );
    }

    // Wall with a 4x2 Window in the center
    return (
        <group position={position} rotation={rotation}>
            {/* Bottom piece */}
            <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[10, 2, 0.2]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
            {/* Top piece */}
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[10, 1, 0.2]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
            {/* Left piece */}
            <mesh position={[-3.5, 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 2, 0.2]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
            {/* Right piece */}
            <mesh position={[3.5, 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 2, 0.2]} />
                <meshStandardMaterial color={wallColor} />
            </mesh>
            {/* The Glass */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[4, 2, 0.05]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.3} envMapIntensity={2} roughness={0.1} metalness={0.8} />
            </mesh>
        </group>
    );
};

export default function Room() {
    const floorMaterial = useStore((state) => state.floorMaterial);
    const wallColor = useStore((state) => state.wallColor);
    const hasLeftWindow = useStore((state) => state.hasLeftWindow);
    const hasBackWindow = useStore((state) => state.hasBackWindow);

    const getFloorColor = () => {
        switch (floorMaterial) {
            case 'dark_tile': return '#333333';
            case 'concrete': return '#999999';
            case 'light_wood': default: return '#d2b48c';
        }
    };

    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <meshStandardMaterial color={getFloorColor()} roughness={0.8} />
            </mesh>

            {/* Back Wall (North) */}
            <Wall
                position={[0, 2.5, -5]}
                rotation={[0, 0, 0]}
                hasWindow={hasBackWindow}
                wallColor={wallColor}
            />

            {/* Left Wall (East - Morning Sun) */}
            <Wall
                position={[-5, 2.5, 0]}
                rotation={[0, Math.PI / 2, 0]}
                hasWindow={hasLeftWindow}
                wallColor={wallColor}
            />
        </group>
    );
}