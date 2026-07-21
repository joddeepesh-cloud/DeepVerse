import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom shader for a dynamic starry space skybox
const SkyShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#03030d') },
    uColorB: { value: new THREE.Color('#100520') },
    uColorC: { value: new THREE.Color('#250b40') }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    // Pseudo-random noise function
    float hash(vec3 p) {
      p = fract(p * 0.3183099 + .1);
      p *= 17.0;
      return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
    }

    void main() {
      // Normalize position direction
      vec3 dir = normalize(vWorldPosition);

      // 1. Base gradient nebula
      float nebulaFactor = sin(dir.x * 2.0 + uTime * 0.015) * cos(dir.y * 2.0 + uTime * 0.01) * 0.5 + 0.5;
      vec3 skyColor = mix(uColorA, uColorB, dir.y * 0.5 + 0.5);
      skyColor = mix(skyColor, uColorC, nebulaFactor * 0.4);

      // 2. Stars generation (twinkling)
      // Project to higher dimension to get dense stars
      vec3 starDir = dir * 160.0;
      vec3 ip = floor(starDir);
      float n = hash(ip);
      
      float star = 0.0;
      if (n > 0.994) {
        // Twinkling speed based on grid cell hash
        float twinkle = sin(uTime * 3.0 + n * 100.0) * 0.4 + 0.6;
        // Size variation
        float size = hash(ip + vec3(1.0)) * 0.7 + 0.3;
        star = twinkle * size;
      }

      // Add stars to sky
      skyColor += vec3(star * 0.8);

      // 3. Subtle glow near horizon (y close to 0)
      float horizonGlow = pow(1.0 - max(0.0, dir.y), 6.0) * 0.15;
      skyColor += vec3(0.0, 0.4, 0.5) * horizonGlow;

      gl_FragColor = vec4(skyColor, 1.0);
    }
  `
};

export const Sky: React.FC = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh scale={[-1, 1, 1]}> {/* Invert shell for backface look-in */}
      <sphereGeometry args={[250, 32, 32]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={SkyShader.vertexShader}
        fragmentShader={SkyShader.fragmentShader}
        uniforms={SkyShader.uniforms}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
