import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const HologramShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00f0ff') }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    // Fast noise for glitching
    float rand(float n){return fract(sin(n) * 43758.5453123);}

    void main() {
      // 1. Fresnel effect (glowing edges)
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

      // 2. Animated horizontal scanlines
      float scanline = sin(vUv.y * 150.0 - uTime * 12.0) * 0.4 + 0.6;

      // 3. Glitch effect (random flickering offsets)
      float glitchTrigger = sin(uTime * 4.0) * cos(uTime * 2.0);
      float glitch = 0.0;
      if (glitchTrigger > 0.75) {
        glitch = rand(floor(vUv.y * 15.0) + uTime) * 0.25;
      }

      // Combine factors into emission
      float alpha = (fresnel * 0.6 + scanline * 0.3) * (0.8 - glitch);
      vec3 finalColor = uColor + vec3(glitch * 0.5, glitch, glitch * 0.8);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export const Hologram: React.FC = () => {
  const mainMeshRef = useRef<THREE.Mesh>(null);
  const ringMeshRef = useRef<THREE.Mesh>(null);
  const leftMeshRef = useRef<THREE.Mesh>(null);
  const rightMeshRef = useRef<THREE.Mesh>(null);

  const mainShaderRef = useRef<THREE.ShaderMaterial>(null);
  const leftShaderRef = useRef<THREE.ShaderMaterial>(null);
  const rightShaderRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate main hologram
    if (mainMeshRef.current) {
      mainMeshRef.current.rotation.y = time * 0.5;
      mainMeshRef.current.rotation.x = time * 0.2;
      mainMeshRef.current.position.y = 8 + Math.sin(time * 2.0) * 0.4; // Floating effect
    }

    if (ringMeshRef.current) {
      ringMeshRef.current.rotation.z = -time * 0.8;
      ringMeshRef.current.position.y = 8 + Math.sin(time * 2.0) * 0.4;
    }

    // Rotate auxiliary holograms
    if (leftMeshRef.current) {
      leftMeshRef.current.rotation.y = -time * 0.4;
      leftMeshRef.current.position.y = 12 + Math.cos(time * 1.5) * 0.3;
    }

    if (rightMeshRef.current) {
      rightMeshRef.current.rotation.y = time * 0.6;
      rightMeshRef.current.position.y = 10 + Math.sin(time * 1.8) * 0.2;
    }

    // Update shaders uTime
    if (mainShaderRef.current) mainShaderRef.current.uniforms.uTime.value = time;
    if (leftShaderRef.current) leftShaderRef.current.uniforms.uTime.value = time;
    if (rightShaderRef.current) rightShaderRef.current.uniforms.uTime.value = time;
  });

  return (
    <group name="Holograms">
      {/* 1. CENTRAL PLAZA HOLOGRAM (Large spinning Torus Knot) */}
      <mesh ref={mainMeshRef} position={[0, 8, -10]}>
        <torusKnotGeometry args={[2.5, 0.7, 100, 16]} />
        <shaderMaterial
          ref={mainShaderRef}
          vertexShader={HologramShader.vertexShader}
          fragmentShader={HologramShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#00f0ff') } // Cyan
          }}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbiting Hologram Ring */}
      <mesh ref={ringMeshRef} position={[0, 8, -10]} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[4.5, 0.1, 8, 48]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          wireframe
        />
      </mesh>

      {/* 2. ROOFTOP HOLOGRAM LEFT (Magenta Dodecahedron) */}
      <mesh ref={leftMeshRef} position={[-25, 12, 10]}>
        <dodecahedronGeometry args={[1.5, 0]} />
        <shaderMaterial
          ref={leftShaderRef}
          vertexShader={HologramShader.vertexShader}
          fragmentShader={HologramShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#ff007f') } // Magenta
          }}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 3. ROOFTOP HOLOGRAM RIGHT (Gold Icosahedron) */}
      <mesh ref={rightMeshRef} position={[25, 10, 10]}>
        <icosahedronGeometry args={[1.3, 1]} />
        <shaderMaterial
          ref={rightShaderRef}
          vertexShader={HologramShader.vertexShader}
          fragmentShader={HologramShader.fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#ffaa00') } // Gold
          }}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
