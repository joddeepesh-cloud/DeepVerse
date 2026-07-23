import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Custom GLSL shader for skyscraper window facade mapping
const BuildingShader = {
  uniforms: {
    uTime: { value: 0 },
    uCityColor: { value: new THREE.Color('#02020a') },
    uWindowColor: { value: new THREE.Color('#00f0ff') }, // cyan lit windows
    uAltWindowColor: { value: new THREE.Color('#ff007f') } // magenta lit windows
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uCityColor;
    uniform vec3 uWindowColor;
    uniform vec3 uAltWindowColor;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    // Pseudo-random hash
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      // 1. Core building color (dark matte metallic)
      vec3 finalColor = uCityColor;
      
      // Calculate normal direction alignment
      vec3 absNormal = abs(vNormal);

      // Only draw windows on vertical walls (normal pointing horizontally)
      if (absNormal.y < 0.8) {
        // Compute world coordinates depending on wall orientation
        vec2 gridPos = vec2(0.0);
        if (absNormal.x > 0.5) {
          gridPos = vec2(vWorldPosition.z, vWorldPosition.y);
        } else {
          gridPos = vec2(vWorldPosition.x, vWorldPosition.y);
        }

        // Window Tiling: density of windows
        vec2 uvTiled = gridPos * vec2(0.35, 0.28); 
        vec2 windowGrid = fract(uvTiled);
        vec2 cellId = floor(uvTiled);

        // Window box shape (add padding borders)
        float windowWidth = 0.55;
        float windowHeight = 0.65;
        float windowShape = step(1.0 - windowWidth, windowGrid.x) * step(1.0 - windowHeight, windowGrid.y);

        // Randomize window status (on/off)
        float randState = hash(cellId);
        float randFlicker = hash(cellId + vec2(uTime * 0.05)); // very slow flicker
        
        float windowOn = step(0.48, randState); // ~50% windows lit
        
        if (windowOn > 0.1) {
          // Glow intensity
          float glow = (sin(uTime * 0.5 + randState * 100.0) * 0.15 + 0.85) * windowShape;
          
          // Separate window colors (mostly cyan, some magenta)
          vec3 wColor = mix(uWindowColor, uAltWindowColor, step(0.85, randState));
          
          // Glitch window dimming
          if (randFlicker > 0.97) {
            glow *= 0.15;
          }

          finalColor = mix(finalColor, wColor, glow * 0.8);
        }
        
        // Add vertical glowing neon stripes along the edges of the walls
        float stripe = step(0.97, fract(vUv.x * 2.0)) + step(0.97, fract(vUv.y));
        if (stripe > 0.1 && randState > 0.8) {
          finalColor = mix(finalColor, uWindowColor, stripe * 0.4);
        }
      } else {
        // Roof detailing: subtle circular lights/plates
        float centerGlow = 1.0 - distance(vUv, vec2(0.5));
        centerGlow = pow(centerGlow, 5.0);
        finalColor += vec3(0.05, 0.1, 0.15) * centerGlow;
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

interface BuildingConfig {
  id: number;
  position: [number, number, number];
  scale: [number, number, number];
  hasBeacon: boolean;
  beaconColor: string;
}

const DISTRICT_COORDINATES = [
  { x: 0, z: 30 },    // Welcome Plaza
  { x: 0, z: 75 },    // About Me
  { x: -40, z: 80 },  // Skills Street
  { x: -55, z: 45 },  // Experience Boulevard
  { x: -55, z: -45 }, // Projects District
  { x: -60, z: -85 }, // Future Vision Tower
  { x: 0, z: -60 },   // Open Source Avenue
  { x: 45, z: -45 },  // GitHub Tower
  { x: 60, z: -60 },  // Contact Hub
  { x: 55, z: 60 },   // Certifications Hall
  { x: 45, z: 45 }    // Hackathon Arena
];

export const Buildings: React.FC = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  // Generate building configurations
  const buildings = useMemo(() => {
    const list: BuildingConfig[] = [];
    const gridSize = 9; // 9x9 grid of building blocks
    const spacing = 18; // spacing between blocks
    let idCounter = 0;

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        // Exclude central corridor for roads, central square, and look paths
        const distanceToCenter = Math.sqrt(x * x + z * z);
        if (distanceToCenter < 2.5) continue; // keep plaza clear
        if (Math.abs(x) < 1.2 && z > -5) continue; // clear main highway lane north
        
        // 35% chance to skip block for negative space / plazas
        if (Math.random() > 0.72) continue;

        // Position coordinates
        const posX = x * spacing + (Math.random() * 4 - 2);
        const posZ = z * spacing + (Math.random() * 4 - 2);

        // Skip building spawning if near any portfolio district to clear the area
        let nearDistrict = false;
        for (const dist of DISTRICT_COORDINATES) {
          const dx = posX - dist.x;
          const dz = posZ - dist.z;
          if (dx * dx + dz * dz < 20 * 20) {
            nearDistrict = true;
            break;
          }
        }
        if (nearDistrict) continue;

        // Skyscraper properties
        const height = 18 + Math.random() * 45;
        const width = 8 + Math.random() * 6;
        const depth = 8 + Math.random() * 6;

        // Rooftop warning beacon light
        const hasBeacon = Math.random() > 0.3;
        const beaconColor = Math.random() > 0.4 ? '#ff007f' : '#00f0ff';

        list.push({
          id: idCounter++,
          position: [posX, height / 2, posZ],
          scale: [width, height, depth],
          hasBeacon,
          beaconColor
        });
      }
    }
    return list;
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group name="CitySkyscrapers">
      {/* Facade Shader Material shared across all buildings */}
      <shaderMaterial
        ref={shaderRef}
        vertexShader={BuildingShader.vertexShader}
        fragmentShader={BuildingShader.fragmentShader}
        uniforms={BuildingShader.uniforms}
        attach="custom-shader" // will apply individually below
      />

      {buildings.map((bld) => (
        <group key={bld.id} position={bld.position}>
          {/* Main Tower Box Mesh */}
          <mesh scale={bld.scale} castShadow receiveShadow>
            <boxGeometry />
            {/* Direct reference to BuildingShader template */}
            <primitive object={new THREE.ShaderMaterial({
              vertexShader: BuildingShader.vertexShader,
              fragmentShader: BuildingShader.fragmentShader,
              uniforms: {
                uTime: shaderRef.current ? shaderRef.current.uniforms.uTime : { value: 0 },
                uCityColor: { value: new THREE.Color('#03030e') },
                uWindowColor: { value: new THREE.Color('#00f0ff') },
                uAltWindowColor: { value: new THREE.Color('#ff007f') }
              }
            })} attach="material" />
          </mesh>

          {/* Rooftop Beacons (small glowing warning spheres) */}
          {bld.hasBeacon && (
            <mesh position={[0, bld.scale[1] / 2 + 0.5, 0]}>
              <sphereGeometry args={[0.25, 8, 8]} />
              <BeaconMaterial color={bld.beaconColor} speed={1.5 + Math.random()} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// Rooftop beacon shader component that flashes
const BeaconMaterial: React.FC<{ color: string; speed: number }> = ({ color, speed }) => {
  const meshMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (meshMatRef.current) {
      const time = state.clock.getElapsedTime();
      // Flash on and off cleanly
      const flash = Math.sin(time * Math.PI * speed) * 0.5 + 0.5;
      meshMatRef.current.opacity = flash > 0.65 ? 1.0 : 0.15;
    }
  });

  return (
    <meshBasicMaterial
      ref={meshMatRef}
      color={color}
      transparent
      depthWrite={true}
    />
  );
};
