import React, { useMemo } from 'react';

interface StreetlightProps {
  id: number;
  position: [number, number, number];
  color: string;
  intensity: number;
  rotationY: number;
}

export const LightingManager: React.FC = () => {
  // Define streetlight coordinate offsets along the North-South road (X ~ 4 and X ~ -4)
  const streetlights = useMemo<StreetlightProps[]>(() => [
    { id: 1, position: [-4.2, 0, 50], color: '#ffaa00', intensity: 2.2, rotationY: Math.PI / 2 },
    { id: 2, position: [4.2, 0, 15], color: '#00f0ff', intensity: 2.2, rotationY: -Math.PI / 2 },
    { id: 3, position: [-4.2, 0, -25], color: '#ffaa00', intensity: 2.2, rotationY: Math.PI / 2 },
    { id: 4, position: [4.2, 0, -60], color: '#00f0ff', intensity: 2.2, rotationY: -Math.PI / 2 },
    { id: 5, position: [-4.2, 0, -100], color: '#ffaa00', intensity: 2.2, rotationY: Math.PI / 2 },
    { id: 6, position: [4.2, 0, -140], color: '#00f0ff', intensity: 2.2, rotationY: -Math.PI / 2 },
  ], []);

  return (
    <group name="LightingManager">
      {/* Soft dark blue base ambient light */}
      <ambientLight intensity={0.15} color="#050515" />

      {/* Hemisphere light for atmospheric purple-blue sky and dark blue ground reflection */}
      <hemisphereLight
        color="#2b0054"
        groundColor="#02020a"
        intensity={0.5}
      />

      {/* Directional light acting as a distant neon moon */}
      <directionalLight
        position={[-50, 90, 50]}
        intensity={0.8}
        color="#a5b8ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={300}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0005}
      />

      {/* Central Plaza (Cyan Glow) */}
      <pointLight
        position={[0, 8, -10]}
        intensity={3.5}
        distance={45}
        color="#00f0ff"
        decay={1.8}
      />

      {/* Left Sector (Magenta Glow) */}
      <pointLight
        position={[-25, 6, 10]}
        intensity={2.8}
        distance={35}
        color="#ff007f"
        decay={1.5}
      />

      {/* Right Sector (Purple/Gold Glow) */}
      <pointLight
        position={[25, 6, 10]}
        intensity={2.8}
        distance={35}
        color="#ffaa00"
        decay={1.5}
      />

      {/* Deep City Avenues */}
      <pointLight
        position={[0, 4, -50]}
        intensity={3.0}
        distance={40}
        color="#9d00ff"
        decay={1.8}
      />

      {/* PHYSICAL STREETLIGHT POLES AND SPOTLIGHTS */}
      {streetlights.map((light) => (
        <group key={light.id} position={light.position} rotation={[0, light.rotationY, 0]}>
          {/* Vertical Pole */}
          <mesh position={[0, 2.8, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 5.6]} />
            <meshStandardMaterial color="#080814" roughness={0.5} />
          </mesh>

          {/* Horizontal Arm */}
          <mesh position={[0.6, 5.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 1.2]} />
            <meshStandardMaterial color="#080814" roughness={0.5} />
          </mesh>

          {/* Light bulb emitter */}
          <mesh position={[1.1, 5.4, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color={light.color} />
          </mesh>

          {/* Targeted SpotLight projecting straight down */}
          <spotLight
            position={[1.1, 5.3, 0]}
            target-position={[1.1, 0, 0]}
            angle={0.55}
            penumbra={0.6}
            intensity={light.intensity}
            distance={16}
            color={light.color}
            castShadow
          />
        </group>
      ))}

    </group>
  );
};
