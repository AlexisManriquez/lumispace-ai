'use client';
import { useStore } from '../../store/useStore';

export default function Lighting() {
    const timeOfDay = useStore((state) => state.timeOfDay);

    // Convert time (6-18) to an arc for the sun (0 to PI)
    const clampedTime = Math.max(6, Math.min(18, timeOfDay));
    const angle = ((clampedTime - 6) / 12) * Math.PI;

    // Calculate X and Y coordinates for the sun
    const sunX = Math.cos(angle) * -10;
    const sunY = Math.sin(angle) * 10;

    // Give sunset/sunrise a warmer color, noon a white color
    const lightColor = clampedTime < 8 || clampedTime > 16 ? '#ffb366' : '#ffffff';
    // Intensity drops closer to dawn/dusk
    const intensity = Math.max(0.1, Math.sin(angle) * 2);

    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[sunX, sunY, 5]}
                intensity={intensity}
                color={lightColor}
                castShadow
            />
        </>
    );
}