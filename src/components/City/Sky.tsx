import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperience } from '../../context/ExperienceContext';
import * as THREE from 'three';

// Custom shader for a dynamic starry space skybox supporting Day/Night modes
const SkyShader = {
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
    uniform float uDayMix;
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

      // 1. Base gradient nebula / sky color
      float nebulaFactor = sin(dir.x * 2.0 + uTime * 0.015) * cos(dir.y * 2.0 + uTime * 0.01) * 0.5 + 0.5;
      vec3 skyColor = mix(uColorA, uColorB, dir.y * 0.5 + 0.5);
      skyColor = mix(skyColor, uColorC, nebulaFactor * 0.4 * (1.0 - uDayMix * 0.7));

      // 2. Stars generation (twinkling) - only visible in Night mode
      vec3 starDir = dir * 160.0;
      vec3 ip = floor(starDir);
      float n = hash(ip);
      
      float star = 0.0;
      if (n > 0.994) {
        float twinkle = sin(uTime * 3.0 + n * 100.0) * 0.4 + 0.6;
        float size = hash(ip + vec3(1.0)) * 0.7 + 0.3;
        star = twinkle * size;
      }

      skyColor += vec3(star * 0.8 * (1.0 - uDayMix));

      // 3. Horizon glow color shifts from cyan to light sky blue/white
      float horizonGlow = pow(1.0 - max(0.0, dir.y), 6.0) * 0.15;
      vec3 glowColor = mix(vec3(0.0, 0.4, 0.5), vec3(0.8, 0.95, 1.0), uDayMix);
      skyColor += glowColor * horizonGlow;

      gl_FragColor = vec4(skyColor, 1.0);
    }
  `
};

export const Sky: React.FC = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const { themeMode } = useExperience();
  const transitionProgress = useRef<number>(0.0);

  const nightColors = {
    a: new THREE.Color('#03030d'),
    b: new THREE.Color('#100520'),
    c: new THREE.Color('#250b40')
  };

  const dayColors = {
    a: new THREE.Color('#3b82f6'), // vibrant sky blue
    b: new THREE.Color('#93c5fd'), // soft blue horizon
    c: new THREE.Color('#ffffff')  // cloud color
  };

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Smooth transition progress
    if (themeMode === 'day') {
      transitionProgress.current = THREE.MathUtils.lerp(transitionProgress.current, 1.0, 4.0 * dt);
    } else {
      transitionProgress.current = THREE.MathUtils.lerp(transitionProgress.current, 0.0, 4.0 * dt);
    }

    if (shaderRef.current) {
      const p = transitionProgress.current;
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderRef.current.uniforms.uDayMix.value = p;
      
      // Interpolate colors
      shaderRef.current.uniforms.uColorA.value.copy(nightColors.a).lerp(dayColors.a, p);
      shaderRef.current.uniforms.uColorB.value.copy(nightColors.b).lerp(dayColors.b, p);
      shaderRef.current.uniforms.uColorC.value.copy(nightColors.c).lerp(dayColors.c, p);
    }
  });

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[250, 32, 32]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={SkyShader.vertexShader}
        fragmentShader={SkyShader.fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color('#03030d') },
          uColorB: { value: new THREE.Color('#100520') },
          uColorC: { value: new THREE.Color('#250b40') },
          uDayMix: { value: 0.0 }
        }}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

export default Sky;
