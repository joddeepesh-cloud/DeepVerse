import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DroneConfig {
  id: number;
  center: [number, number, number];
  radius: number;
  speed: number;
  height: number;
  color: string;
}

export const Drones: React.FC = () => {
  const droneConfigs = useMemo<DroneConfig[]>(() => [
    { id: 1, center: [0, 16, -10], radius: 18, speed: 0.25, height: 14, color: '#00f0ff' }, // central plaza
    { id: 2, center: [-25, 14, 15], radius: 10, speed: -0.4, height: 16, color: '#ff007f' }, // left sector
    { id: 3, center: [30, 15, -30], radius: 14, speed: 0.35, height: 15, color: '#ffaa00' } // north-east highway
  ], []);

  const droneRefs = useRef<THREE.Group[]>([]);
  const spotRefs = useRef<THREE.SpotLight[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    droneConfigs.forEach((config, idx) => {
      const drone = droneRefs.current[idx];
      const spotlight = spotRefs.current[idx];
      if (!drone) return;

      // Circular trajectory around center point
      const angle = time * config.speed;
      const x = config.center[0] + Math.sin(angle) * config.radius;
      const z = config.center[2] + Math.cos(angle) * config.radius;
      
      // Floating vertical altitude oscillation
      const y = config.height + Math.sin(time * 2.0 + config.id) * 0.4;

      drone.position.set(x, y, z);
      
      // Rotate drone towards its motion vector
      drone.rotation.y = angle + Math.PI / 2;

      // Subtly tilt the drone forward in direction of travel
      drone.rotation.x = Math.sin(time * 2.5) * 0.05;

      // Sweeping searchlight focus targets (scans left/right on ground y=0)
      if (spotlight) {
        const targetX = x + Math.sin(time * 1.5 + config.id) * 6;
        const targetZ = z + Math.cos(time * 1.5 + config.id) * 6;
        spotlight.target.position.set(targetX, 0, targetZ);
        spotlight.target.updateMatrixWorld();
      }
    });
  });

  return (
    <group name="SurveillanceDrones">
      {droneConfigs.map((config, idx) => (
        <group
          key={config.id}
          ref={(el) => {
            if (el) droneRefs.current[idx] = el;
          }}
        >
          {/* Drone Body Assembly */}
          <group scale={[0.8, 0.8, 0.8]}>
            {/* Core Chassis Ball */}
            <mesh castShadow>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial color="#0c0c16" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Glowing Camera Eye */}
            <mesh position={[0, -0.15, -0.22]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color={config.color} />
            </mesh>

            {/* Left Rotor arm */}
            <mesh position={[-0.45, 0.05, 0]}>
              <boxGeometry args={[0.4, 0.04, 0.06]} />
              <meshStandardMaterial color="#0c0c16" />
            </mesh>
            {/* Left Rotor Ring */}
            <mesh position={[-0.65, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.15, 0.02, 4, 12]} />
              <meshBasicMaterial color={config.color} wireframe />
            </mesh>

            {/* Right Rotor arm */}
            <mesh position={[0.45, 0.05, 0]}>
              <boxGeometry args={[0.4, 0.04, 0.06]} />
              <meshStandardMaterial color="#0c0c16" />
            </mesh>
            {/* Right Rotor Ring */}
            <mesh position={[0.65, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.15, 0.02, 4, 12]} />
              <meshBasicMaterial color={config.color} wireframe />
            </mesh>
          </group>

          {/* Dynamic Searchlight SpotLight casting down */}
          <spotLight
            ref={(el) => {
              if (el) spotRefs.current[idx] = el;
            }}
            angle={0.28}
            penumbra={0.7}
            intensity={3.8}
            distance={30}
            color={config.color}
            castShadow
          />
        </group>
      ))}
    </group>
  );
};
export default Drones;
