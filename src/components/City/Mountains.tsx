import React, { useMemo } from 'react';

interface MountainProps {
  position: [number, number, number];
  scale: [number, number, number];
  rotationY: number;
}

export const Mountains: React.FC = () => {
  // Generate mountain rings dynamically
  const mountainsList = useMemo(() => {
    const list: MountainProps[] = [];
    const count = 14;
    const radius = 170;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      
      // Position around the border with slight noise
      const r = radius + (Math.random() * 20 - 10);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      
      // Randomize height and width
      const height = 30 + Math.random() * 45;
      const baseWidth = 50 + Math.random() * 40;
      const scale: [number, number, number] = [baseWidth, height, baseWidth];
      
      // Place them on the ground plane (y = height/2 - offset)
      const y = height / 2 - 8;

      list.push({
        position: [x, y, z],
        scale,
        rotationY: Math.random() * Math.PI
      });
    }
    return list;
  }, []);

  return (
    <group name="DistantMountains">
      {mountainsList.map((mtn, index) => (
        <mesh
          key={index}
          position={mtn.position}
          scale={mtn.scale}
          rotation={[0, mtn.rotationY, 0]}
          receiveShadow
        >
          {/* 4 radial segments gives a nice low-poly pyramid structure */}
          <coneGeometry args={[1, 1, 4]} />
          <meshStandardMaterial
            color="#080314"
            roughness={0.9}
            metalness={0.1}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
};
