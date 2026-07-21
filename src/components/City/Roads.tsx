import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom shader for road lanes with animated glowing flow lines
const RoadShader = {
  uniforms: {
    uTime: { value: 0 },
    uRoadColor: { value: new THREE.Color('#04040c') },
    uLaneColor: { value: new THREE.Color('#00f0ff') },   // cyan lanes
    uBorderColor: { value: new THREE.Color('#ff007f') } // magenta borders
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uRoadColor;
    uniform vec3 uLaneColor;
    uniform vec3 uBorderColor;
    varying vec2 vUv;

    void main() {
      // Base asphalt color
      vec3 finalColor = uRoadColor;
      float alpha = 1.0;

      // 1. Sidewalk borders (glowing borders on left/right edges)
      float borderLeft = step(vUv.y, 0.03);
      float borderRight = step(0.97, vUv.y);
      float borders = borderLeft + borderRight;
      
      // 2. Center dynamic lane marker (dashed moving line)
      float centerLane = step(0.48, vUv.y) * step(vUv.y, 0.52);
      
      // Dash calculations based on horizontal UV coordinate
      float dashFreq = 8.0;
      float dashSpeed = 3.5;
      float dash = step(0.4, fract(vUv.x * dashFreq - uTime * dashSpeed));
      float activeLane = centerLane * dash;

      // Glow multipliers
      float borderGlow = borders * (sin(uTime * 1.5) * 0.15 + 0.85);
      float laneGlow = activeLane * (sin(uTime * 3.0) * 0.1 + 0.9);

      // Blending colors
      finalColor = mix(finalColor, uBorderColor, borderGlow * 0.9);
      finalColor = mix(finalColor, uLaneColor, laneGlow * 0.9);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export const Roads: React.FC = () => {
  const northRoadShaderRef = useRef<THREE.ShaderMaterial>(null);
  const eastRoadShaderRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (northRoadShaderRef.current) {
      northRoadShaderRef.current.uniforms.uTime.value = time;
    }
    if (eastRoadShaderRef.current) {
      eastRoadShaderRef.current.uniforms.uTime.value = time;
    }
  });

  return (
    <group name="CityInfrastructure">
      {/* 1. Ground Plaza / Sidewalk Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[350, 350]} />
        <meshStandardMaterial
          color="#020208"
          roughness={0.8}
          metalness={0.3}
        />
      </mesh>

      {/* Ground Grid overlay for futuristic division lines */}
      <gridHelper
        args={[350, 50, '#ff007f', '#0f051b']}
        position={[0, 0, 0]}
      />

      {/* 2. North-South Highway Lane */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[350, 7]} /> {/* long strip, 7 units wide */}
        <shaderMaterial
          ref={northRoadShaderRef}
          vertexShader={RoadShader.vertexShader}
          fragmentShader={RoadShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uRoadColor: { value: new THREE.Color('#04040d') },
            uLaneColor: { value: new THREE.Color('#00f0ff') },
            uBorderColor: { value: new THREE.Color('#ff007f') }
          }}
        />
      </mesh>

      {/* 3. East-West Highway Lane (crossing at Z = -10 near the central plaza) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, -10]} receiveShadow>
        <planeGeometry args={[350, 7]} />
        <shaderMaterial
          ref={eastRoadShaderRef}
          vertexShader={RoadShader.vertexShader}
          fragmentShader={RoadShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uRoadColor: { value: new THREE.Color('#04040d') },
            uLaneColor: { value: new THREE.Color('#ffaa00') }, // Gold inner lanes for East-West
            uBorderColor: { value: new THREE.Color('#9d00ff') } // Purple borders
          }}
        />
      </mesh>
    </group>
  );
};
