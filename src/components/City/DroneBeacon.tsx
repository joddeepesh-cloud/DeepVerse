import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useExperience } from '../../context/ExperienceContext';

interface DroneBeaconProps {
  active: boolean;
}

export const DroneBeacon: React.FC<DroneBeaconProps> = ({ active }) => {
  const { deviceType } = useExperience();
  const isMobile = deviceType === 'mobile';
  const transitionT = useRef<number>(0);
  const [shouldRender, setShouldRender] = useState(false);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const speed = 1.0 / 1.5; // 1.5 seconds transition duration

    if (active) {
      if (!shouldRender) setShouldRender(true);
      transitionT.current = Math.min(transitionT.current + dt * speed, 1.0);
    } else {
      transitionT.current = Math.max(transitionT.current - dt * speed * 1.5, 0.0); // fade out slightly faster
      if (transitionT.current === 0.0 && shouldRender) {
        setShouldRender(false);
      }
    }
  });

  // Safe check to avoid rendering anything when fully hidden
  if (!active && transitionT.current === 0) return null;

  const t = transitionT.current;
  const time = typeof window !== 'undefined' ? performance.now() * 0.001 : 0;

  // 1. Pulse ring animations (Stage 1: t from 0.0 to 0.6)
  const showPulse = t > 0.0 && t < 0.6;
  const pulseProgress = showPulse ? t / 0.6 : 0;
  const pulseY = pulseProgress * 20.0;
  const pulseOpacity = Math.max(0, 1.0 - pulseProgress);
  const pulseScale = 1.0 + pulseProgress * 1.5;

  // 2. Holographic ring underneath the vehicle (Stage 2: t > 0.20)
  const ringAlpha = Math.max(0, Math.min(1.0, (t - 0.2) / 0.3));
  const ringScale = ringAlpha * 1.6;

  // 3. Vertical energy beam (Stage 3: t > 0.40)
  const beamAlpha = Math.max(0, Math.min(1.0, (t - 0.4) / 0.3));
  const beamHeight = beamAlpha * 22.0;

  // 4. Floating holographic label (Stage 4: t > 0.70)
  const labelAlpha = Math.max(0, Math.min(1.0, (t - 0.7) / 0.3));
  const labelFloatY = beamHeight + Math.sin(time * 2.5) * 0.25;

  return (
    <group name="DroneBeacon" position={[0, -0.38, 0]}>
      {/* A. Rotating Holographic ring below vehicle */}
      {ringAlpha > 0.01 && (
        <group position={[0, 0.05, 0]} scale={[ringScale, 1, ringScale]}>
          <mesh rotation={[-Math.PI / 2, 0, time * 1.2]}>
            <ringGeometry args={[1.2, 1.35, 32]} />
            <meshBasicMaterial 
              color="#00f0ff" 
              transparent 
              opacity={ringAlpha * 0.65} 
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, -time * 0.6]}>
            <ringGeometry args={[0.8, 0.9, 16]} />
            <meshBasicMaterial 
              color="#ff007f" 
              transparent 
              opacity={ringAlpha * 0.3} 
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* B. Cyan Energy Pulse */}
      {showPulse && (
        <mesh position={[0, pulseY, 0]} scale={[pulseScale, 1.0, pulseScale]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial 
            color="#00f0ff" 
            transparent 
            opacity={pulseOpacity * 0.8} 
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* C. Vertical energy beam */}
      {beamAlpha > 0.01 && (
        <mesh position={[0, beamHeight / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.03, beamHeight, 8, 1, true]} />
          <meshBasicMaterial 
            color="#00f0ff" 
            transparent 
            opacity={beamAlpha * 0.4} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* D. Floating holographic label above the beam */}
      {labelAlpha > 0.01 && (
        <Html 
          position={[0, labelFloatY, 0]} 
          center 
          distanceFactor={18}
          style={{
            opacity: labelAlpha,
            transition: 'opacity 0.2s ease-out',
            pointerEvents: 'none'
          }}
        >
          <div className={`font-['Orbitron'] ${isMobile ? 'text-xs px-4 py-2 border-[#00f0ff]' : 'text-[9px] px-3 py-1.5'} font-black tracking-[0.3em] text-[#00f0ff] bg-black/85 border border-[#00f0ff]/40 rounded-sm whitespace-nowrap shadow-[0_0_15px_rgba(0,240,255,0.45)] text-center select-none uppercase`}>
            <span className="text-[#ff007f] mr-1.5">◆</span>
            DEEP CORE
            <span className="text-[#ff007f] ml-1.5">◆</span>
          </div>
        </Html>
      )}
    </group>
  );
};
export default DroneBeacon;
