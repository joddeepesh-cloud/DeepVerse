import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperience } from '../../context/ExperienceContext';
import * as THREE from 'three';

export const Particles: React.FC = () => {
  const { quality } = useExperience();
  const pointsRef = useRef<THREE.Points>(null);

  // Set particle count based on graphics quality
  const count = useMemo(() => (quality === 'high' ? 1800 : 400), [quality]);

  // Generate random positions and movement phase offsets
  const [positions, phases, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const phs = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Scatter in a cylindrical zone around the city center
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 80;
      pos[i * 3] = Math.cos(angle) * radius; // x
      pos[i * 3 + 1] = Math.random() * 70 - 10; // y (height)
      pos[i * 3 + 2] = Math.sin(angle) * radius; // z

      phs[i] = Math.random() * Math.PI * 2;
      spd[i] = 0.05 + Math.random() * 0.1;
    }
    return [pos, phs, spd];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const attrib = geo.getAttribute('position') as THREE.BufferAttribute;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Float upward
      let y = attrib.getY(i);
      y += speeds[i] * 0.5;

      // Wrap-around if particles drift too high
      if (y > 60) {
        y = -10;
      }
      attrib.setY(i, y);

      // Subtle horizontal sway based on individual phases
      const x = attrib.getX(i);
      const z = attrib.getZ(i);
      attrib.setX(i, x + Math.sin(time + phases[i]) * 0.01);
      attrib.setZ(i, z + Math.cos(time + phases[i]) * 0.01);
    }

    attrib.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={quality === 'high' ? 0.35 : 0.45}
        color="#00f0ff"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
