import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Hovercar {
  id: number;
  position: [number, number, number];
  direction: 'north' | 'south' | 'east' | 'west';
  speed: number;
  color: string;
}

export const Traffic: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Define 8 hovercars distributed along the corridors
  const hovercars = useMemo(() => {
    const list: Hovercar[] = [];
    
    // North-South Highway (x = -1.5 for Southbound, x = 1.5 for Northbound)
    list.push({ id: 1, position: [-1.5, 0.45, -120], direction: 'south', speed: 18, color: '#00f0ff' });
    list.push({ id: 2, position: [-1.5, 0.45, 20], direction: 'south', speed: 22, color: '#ffaa00' });
    list.push({ id: 3, position: [1.5, 0.45, 120], direction: 'north', speed: 20, color: '#ff007f' });
    list.push({ id: 4, position: [1.5, 0.45, -40], direction: 'north', speed: 25, color: '#00f0ff' });

    // East-West Highway (z = -11.5 for Westbound, z = -8.5 for Eastbound)
    list.push({ id: 5, position: [-100, 0.45, -11.5], direction: 'east', speed: 21, color: '#ff007f' });
    list.push({ id: 6, position: [40, 0.45, -11.5], direction: 'east', speed: 19, color: '#ffaa00' });
    list.push({ id: 7, position: [100, 0.45, -8.5], direction: 'west', speed: 24, color: '#00f0ff' });
    list.push({ id: 8, position: [-30, 0.45, -8.5], direction: 'west', speed: 20, color: '#9d00ff' });

    return list;
  }, []);

  const carRefs = useRef<THREE.Group[]>([]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const limit = 160;

    hovercars.forEach((car, index) => {
      const mesh = carRefs.current[index];
      if (!mesh) return;

      // Float hovering cycle
      const time = state.clock.getElapsedTime();
      const hover = Math.sin(time * 3.0 + car.id) * 0.03;

      // Update positions along direction vector
      if (car.direction === 'south') {
        mesh.position.z += car.speed * dt;
        if (mesh.position.z > limit) mesh.position.z = -limit;
      } else if (car.direction === 'north') {
        mesh.position.z -= car.speed * dt;
        if (mesh.position.z < -limit) mesh.position.z = limit;
      } else if (car.direction === 'east') {
        mesh.position.x += car.speed * dt;
        if (mesh.position.x > limit) mesh.position.x = -limit;
      } else if (car.direction === 'west') {
        mesh.position.x -= car.speed * dt;
        if (mesh.position.x < -limit) mesh.position.x = limit;
      }

      mesh.position.y = 0.45 + hover;
    });
  });

  return (
    <group ref={groupRef} name="Traffic">
      {hovercars.map((car, index) => {
        // Calculate Y rotation based on direction
        let rotY = 0;
        if (car.direction === 'south') rotY = 0;
        if (car.direction === 'north') rotY = Math.PI;
        if (car.direction === 'east') rotY = Math.PI / 2;
        if (car.direction === 'west') rotY = -Math.PI / 2;

        return (
          <group
            key={car.id}
            ref={(el) => {
              if (el) carRefs.current[index] = el;
            }}
            position={car.position}
            rotation={[0, rotY, 0]}
          >
            {/* Hovercar Chassis */}
            <mesh castShadow>
              <boxGeometry args={[0.9, 0.35, 2.0]} />
              <meshStandardMaterial
                color="#04040e"
                roughness={0.2}
                metalness={0.9}
              />
            </mesh>

            {/* Glowing neon side stripes */}
            <mesh position={[0.46, 0, 0]}>
              <boxGeometry args={[0.02, 0.08, 1.2]} />
              <meshBasicMaterial color={car.color} />
            </mesh>
            <mesh position={[-0.46, 0, 0]}>
              <boxGeometry args={[0.02, 0.08, 1.2]} />
              <meshBasicMaterial color={car.color} />
            </mesh>

            {/* Headlights (front cyan lights) */}
            <mesh position={[-0.3, 0.05, 1.01]}>
              <boxGeometry args={[0.15, 0.06, 0.02]} />
              <meshBasicMaterial color="#a5f3ff" />
            </mesh>
            <mesh position={[0.3, 0.05, 1.01]}>
              <boxGeometry args={[0.15, 0.06, 0.02]} />
              <meshBasicMaterial color="#a5f3ff" />
            </mesh>

            {/* Brake lights (rear red lights) */}
            <mesh position={[-0.3, 0.05, -1.01]}>
              <boxGeometry args={[0.15, 0.06, 0.02]} />
              <meshBasicMaterial color="#ff007f" />
            </mesh>
            <mesh position={[0.3, 0.05, -1.01]}>
              <boxGeometry args={[0.15, 0.06, 0.02]} />
              <meshBasicMaterial color="#ff007f" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
export default Traffic;
