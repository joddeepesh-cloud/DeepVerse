import React from 'react';
import { Html } from '@react-three/drei';

export const RoadGuidance: React.FC = () => {
  return (
    <group name="RoadGuidance">
      {/* Intersection 1: Welcome Plaza junction (0, 0, 45) */}
      <group position={[0, 0, 45]}>
        {/* Sign post mesh */}
        <mesh position={[4.0, 1.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3.6]} />
          <meshStandardMaterial color="#0f0d1a" metalness={0.9} roughness={0.15} />
        </mesh>
        <Html position={[4.0, 2.5, 0]} center transform distanceFactor={14}>
          <div className="glass-panel px-3 py-2 bg-black/90 border border-[#00f0ff] rounded font-['Orbitron'] text-[9px] font-black tracking-widest text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)] flex flex-col gap-1.5 min-w-[140px]">
            <div className="text-white/60 border-b border-[#00f0ff]/20 pb-1 text-[8px] tracking-normal">JUNCTION S_01</div>
            <div>⬆ ABOUT ME</div>
            <div>⬅ SKILLS ST.</div>
            <div>➡ ARENA</div>
          </div>
        </Html>
      </group>

      {/* Intersection 2: Skills Street junction (0, 0, 80) */}
      <group position={[0, 0, 80]}>
        <mesh position={[-4.0, 1.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3.6]} />
          <meshStandardMaterial color="#0f0d1a" metalness={0.9} roughness={0.15} />
        </mesh>
        <Html position={[-4.0, 2.5, 0]} center transform distanceFactor={14}>
          <div className="glass-panel px-3 py-2 bg-black/90 border border-[#ff007f] rounded font-['Orbitron'] text-[9px] font-black tracking-widest text-[#ff007f] shadow-[0_0_15px_rgba(255,0,127,0.4)] flex flex-col gap-1.5 min-w-[140px]">
            <div className="text-white/60 border-b border-[#ff007f]/20 pb-1 text-[8px] tracking-normal">JUNCTION S_02</div>
            <div>⬅ SKILLS STREET</div>
            <div>⬇ WELCOME PLAZA</div>
          </div>
        </Html>
      </group>

      {/* Intersection 3: Central crossing (0, 0, -10) */}
      <group position={[0, 0, -10]}>
        <mesh position={[4.0, 2.0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 4.0]} />
          <meshStandardMaterial color="#0f0d1a" metalness={0.9} roughness={0.15} />
        </mesh>
        <Html position={[4.0, 2.8, 0]} center transform distanceFactor={15}>
          <div className="glass-panel px-3 py-2 bg-black/90 border border-[#ffaa00] rounded font-['Orbitron'] text-[9px] font-black tracking-widest text-[#ffaa00] shadow-[0_0_15px_rgba(255,170,0,0.4)] flex flex-col gap-1.5 min-w-[150px]">
            <div className="text-white/60 border-b border-[#ffaa00]/20 pb-1 text-[8px] tracking-normal">CENTRAL CORE</div>
            <div>⬆ OPEN SOURCE AVE</div>
            <div>⬅ PROJECTS DIST.</div>
            <div>➡ GITHUB TOWER</div>
            <div>⬇ ABOUT ME</div>
          </div>
        </Html>
      </group>

      {/* Intersection 4: Open Source Ave junction (0, 0, -60) */}
      <group position={[0, 0, -60]}>
        <mesh position={[-4.0, 1.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3.6]} />
          <meshStandardMaterial color="#0f0d1a" metalness={0.9} roughness={0.15} />
        </mesh>
        <Html position={[-4.0, 2.5, 0]} center transform distanceFactor={14}>
          <div className="glass-panel px-3 py-2 bg-black/90 border border-[#9d00ff] rounded font-['Orbitron'] text-[9px] font-black tracking-widest text-[#9d00ff] shadow-[0_0_15px_rgba(157,0,255,0.4)] flex flex-col gap-1.5 min-w-[140px]">
            <div className="text-white/60 border-b border-[#9d00ff]/20 pb-1 text-[8px] tracking-normal">JUNCTION N_01</div>
            <div>⬅ FUTURE SPIRE</div>
            <div>➡ CONTACT HUB</div>
            <div>⬇ PROJECTS</div>
          </div>
        </Html>
      </group>
    </group>
  );
};
export default RoadGuidance;
