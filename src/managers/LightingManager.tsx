import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperience } from '../context/ExperienceContext';
import * as THREE from 'three';

interface StreetlightProps {
  id: number;
  position: [number, number, number];
  color: string;
  intensity: number;
  rotationY: number;
}

export const LightingManager: React.FC = () => {
  const { themeMode } = useExperience();
  const transitionProgress = useRef<number>(0.0);

  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight>(null);
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  
  // Point lights for city center neon glow
  const pointLight1 = useRef<THREE.PointLight>(null);
  const pointLight2 = useRef<THREE.PointLight>(null);
  const pointLight3 = useRef<THREE.PointLight>(null);
  const pointLight4 = useRef<THREE.PointLight>(null);

  // Define streetlight coordinate offsets along the North-South road (X ~ 4 and X ~ -4)
  const streetlights = useMemo<StreetlightProps[]>(() => [
    { id: 1, position: [-4.2, 0, 50], color: '#ffaa00', intensity: 2.2, rotationY: Math.PI / 2 },
    { id: 2, position: [4.2, 0, 15], color: '#00f0ff', intensity: 2.2, rotationY: -Math.PI / 2 },
    { id: 3, position: [-4.2, 0, -25], color: '#ffaa00', intensity: 2.2, rotationY: Math.PI / 2 },
    { id: 4, position: [4.2, 0, -60], color: '#00f0ff', intensity: 2.2, rotationY: -Math.PI / 2 },
    { id: 5, position: [-4.2, 0, -100], color: '#ffaa00', intensity: 2.2, rotationY: Math.PI / 2 },
    { id: 6, position: [4.2, 0, -140], color: '#00f0ff', intensity: 2.2, rotationY: -Math.PI / 2 },
  ], []);

  const streetlightRefs = useRef<(THREE.SpotLight | null)[]>([]);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Smooth transition progress
    if (themeMode === 'day') {
      transitionProgress.current = THREE.MathUtils.lerp(transitionProgress.current, 1.0, 4.0 * dt);
    } else {
      transitionProgress.current = THREE.MathUtils.lerp(transitionProgress.current, 0.0, 4.0 * dt);
    }

    const p = transitionProgress.current;

    // 1. Ambient Light
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = THREE.MathUtils.lerp(0.15, 0.75, p);
      ambientLightRef.current.color.copy(new THREE.Color('#050515')).lerp(new THREE.Color('#cbdfff'), p);
    }

    // 2. Hemisphere Light
    if (hemiLightRef.current) {
      hemiLightRef.current.intensity = THREE.MathUtils.lerp(0.5, 0.85, p);
      hemiLightRef.current.color.copy(new THREE.Color('#2b0054')).lerp(new THREE.Color('#94c6ff'), p);
      hemiLightRef.current.groundColor.copy(new THREE.Color('#02020a')).lerp(new THREE.Color('#d2e5ff'), p);
    }

    // 3. Directional Light (Sun/Moon)
    if (dirLightRef.current) {
      dirLightRef.current.intensity = THREE.MathUtils.lerp(0.8, 2.2, p);
      dirLightRef.current.color.copy(new THREE.Color('#a5b8ff')).lerp(new THREE.Color('#fffced'), p);
      dirLightRef.current.position.set(
        THREE.MathUtils.lerp(-50, 100, p),
        THREE.MathUtils.lerp(90, 150, p),
        THREE.MathUtils.lerp(50, 50, p)
      );
    }

    // 4. Point Lights (Neon Glow - reduced in Day Mode)
    if (pointLight1.current) pointLight1.current.intensity = THREE.MathUtils.lerp(3.5, 0.5, p);
    if (pointLight2.current) pointLight2.current.intensity = THREE.MathUtils.lerp(2.8, 0.4, p);
    if (pointLight3.current) pointLight3.current.intensity = THREE.MathUtils.lerp(2.8, 0.4, p);
    if (pointLight4.current) pointLight4.current.intensity = THREE.MathUtils.lerp(3.0, 0.4, p);

    // 5. Streetlights Spotlights (almost off during day)
    streetlightRefs.current.forEach((light, index) => {
      if (light) {
        const originalIntensity = streetlights[index]?.intensity || 2.2;
        light.intensity = THREE.MathUtils.lerp(originalIntensity, originalIntensity * 0.05, p);
      }
    });
  });

  return (
    <group name="LightingManager">
      {/* Soft dark blue base ambient light */}
      <ambientLight ref={ambientLightRef} intensity={0.15} color="#050515" />

      {/* Hemisphere light for atmospheric purple-blue sky and dark blue ground reflection */}
      <hemisphereLight
        ref={hemiLightRef}
        color="#2b0054"
        groundColor="#02020a"
        intensity={0.5}
      />

      {/* Directional light acting as a distant neon moon */}
      <directionalLight
        ref={dirLightRef}
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
        ref={pointLight1}
        position={[0, 8, -10]}
        intensity={3.5}
        distance={45}
        color="#00f0ff"
        decay={1.8}
      />

      {/* Left Sector (Magenta Glow) */}
      <pointLight
        ref={pointLight2}
        position={[-25, 6, 10]}
        intensity={2.8}
        distance={35}
        color="#ff007f"
        decay={1.5}
      />

      {/* Right Sector (Purple/Gold Glow) */}
      <pointLight
        ref={pointLight3}
        position={[25, 6, 10]}
        intensity={2.8}
        distance={35}
        color="#ffaa00"
        decay={1.5}
      />

      {/* Deep City Avenues */}
      <pointLight
        ref={pointLight4}
        position={[0, 4, -50]}
        intensity={3.0}
        distance={40}
        color="#9d00ff"
        decay={1.8}
      />

      {/* PHYSICAL STREETLIGHT POLES AND SPOTLIGHTS */}
      {streetlights.map((light, index) => (
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
            ref={(el) => { streetlightRefs.current[index] = el; }}
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
