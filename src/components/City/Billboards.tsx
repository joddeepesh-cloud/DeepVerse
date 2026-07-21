import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BillboardShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#00f0ff') }
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
    uniform vec3 uColor;
    varying vec2 vUv;

    // Hash for glitch static
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      // 1. Double scrolling scanner lines
      float line1 = step(0.92, sin(vUv.y * 40.0 - uTime * 5.0));
      float line2 = step(0.96, sin(vUv.x * 20.0 + uTime * 2.0));
      
      // 2. Glitching text box grid
      vec2 grid = floor(vUv * vec2(12.0, 6.0));
      float gridRand = hash(grid + vec2(floor(uTime * 4.0)));
      float cellGlow = step(0.85, gridRand) * 0.45;

      // 3. Periodic full-screen static noise
      float noiseTrigger = step(0.98, sin(uTime * 8.0));
      float noise = hash(vUv + uTime) * 0.25 * noiseTrigger;

      // Outer border outline glow
      float border = step(0.97, vUv.x) + step(vUv.x, 0.03) + step(0.95, vUv.y) + step(vUv.y, 0.05);

      // Blend
      float alpha = max(line1 * 0.5 + line2 * 0.3 + cellGlow + noise, border * 0.7);
      vec3 finalColor = uColor + vec3(noise * 0.5, noise, noise * 0.8);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

interface BillboardConfig {
  id: number;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  rotationY: number;
}

export const Billboards: React.FC = () => {
  const configs = useMemo<BillboardConfig[]>(() => [
    // Positioned on skyscraper roofs
    { id: 1, position: [-25, 24, 25], scale: [8, 4, 0.1], color: '#ff007f', rotationY: Math.PI / 4 }, // Left front rooftop
    { id: 2, position: [25, 21, 25], scale: [8, 4, 0.1], color: '#00f0ff', rotationY: -Math.PI / 4 }, // Right front rooftop
    { id: 3, position: [0, 32, -60], scale: [12, 6, 0.1], color: '#ffaa00', rotationY: 0 }, // Deep central north tower roof
  ], []);

  const shadersRef = useRef<THREE.ShaderMaterial[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    shadersRef.current.forEach((shader) => {
      if (shader) shader.uniforms.uTime.value = time;
    });
  });

  return (
    <group name="HolographicBillboards">
      {configs.map((cfg, idx) => (
        <group key={cfg.id} position={cfg.position} rotation={[0, cfg.rotationY, 0]}>
          
          {/* Billboard Frame/Post (physical structural mesh) */}
          <mesh position={[0, -cfg.scale[1] / 2 - 0.5, 0]}>
            <boxGeometry args={[0.2, 1.0, 0.2]} />
            <meshStandardMaterial color="#070710" metalness={0.8} />
          </mesh>

          {/* Glowing Hologram Panel Screen */}
          <mesh>
            <planeGeometry args={[cfg.scale[0], cfg.scale[1]]} />
            <shaderMaterial
              ref={(el) => {
                if (el) shadersRef.current[idx] = el;
              }}
              vertexShader={BillboardShader.vertexShader}
              fragmentShader={BillboardShader.fragmentShader}
              uniforms={{
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(cfg.color) }
              }}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
export default Billboards;
