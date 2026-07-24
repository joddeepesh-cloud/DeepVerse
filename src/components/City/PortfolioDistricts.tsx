import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const PortfolioDistricts: React.FC = () => {
  const timeRef = useRef<number>(0);

  // Group references for floating/rotating animations
  const welcomeRef = useRef<THREE.Group>(null);
  const aboutRef = useRef<THREE.Group>(null);
  const skillsRef = useRef<THREE.Group>(null);
  const octocatRef = useRef<THREE.Group>(null);
  const codeAveRef = useRef<THREE.Group>(null);
  const arenaRef = useRef<THREE.Group>(null);
  const projectsRef = useRef<THREE.Group>(null);
  const experienceRef = useRef<THREE.Group>(null);
  const certsRef = useRef<THREE.Group>(null);
  const contactRef = useRef<THREE.Group>(null);
  const futureLaserRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    timeRef.current = time;

    // 1. Welcome Plaza float
    if (welcomeRef.current) {
      welcomeRef.current.position.y = Math.sin(time * 1.5) * 0.25;
    }

    // 2. About Me spin
    if (aboutRef.current) {
      aboutRef.current.rotation.y = time * 0.4;
      aboutRef.current.position.y = Math.cos(time * 1.2) * 0.15;
    }

    // 3. Skills Street orbit
    if (skillsRef.current) {
      skillsRef.current.position.y = Math.sin(time * 2.0) * 0.15;
    }

    // 4. GitHub Octocat spin
    if (octocatRef.current) {
      octocatRef.current.rotation.y = time * 0.6;
      octocatRef.current.position.y = 16.0 + Math.sin(time * 1.8) * 0.5;
    }

    // 5. Open Source Ave flow lines
    if (codeAveRef.current) {
      codeAveRef.current.rotation.y = time * 0.25;
    }

    // 6. Arena spotlight sweep
    if (arenaRef.current) {
      arenaRef.current.rotation.z = Math.sin(time * 1.2) * 0.3;
    }

    // 7. Projects float
    if (projectsRef.current) {
      projectsRef.current.position.y = Math.sin(time * 1.5) * 0.3;
    }

    // 8. Experience timeline sway
    if (experienceRef.current) {
      experienceRef.current.position.y = Math.sin(time * 1.6) * 0.2;
    }

    // 9. Certifications spin
    if (certsRef.current) {
      certsRef.current.rotation.y = time * 0.5;
    }

    // 10. Contact float
    if (contactRef.current) {
      contactRef.current.position.y = Math.cos(time * 1.4) * 0.25;
    }

    // 11. Future laser pulse intensity
    if (futureLaserRef.current) {
      const laserMat = futureLaserRef.current.material as THREE.MeshBasicMaterial;
      laserMat.opacity = 0.4 + Math.sin(time * 8.0) * 0.25;
    }
  });

  return (
    <group name="PortfolioDistricts">
      {/* ======================================================== */}
      {/* 1. WELCOME PLAZA */}
      {/* ======================================================== */}
      <group position={[0, 0.5, 30]}>
        <group ref={welcomeRef}>
          {/* Neon Entrance Archway */}
          <mesh position={[-4.5, 3.5, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 7.0]} />
            <meshStandardMaterial color="#00f0ff" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[4.5, 3.5, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 7.0]} />
            <meshStandardMaterial color="#00f0ff" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0, 7.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 9.0]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          
          {/* Welcome Text via Html */}
          <Html position={[0, 5.0, 0]} center transform distanceFactor={15}>
            <div style={{
              fontFamily: 'Orbitron',
              color: '#00f0ff',
              fontSize: '18px',
              fontWeight: 'black',
              letterSpacing: '0.2em',
              textShadow: '0 0 10px #00f0ff',
              whiteSpace: 'nowrap'
            }}>
              WELCOME PLAZA
            </div>
            <div style={{
              fontFamily: 'Orbitron',
              color: '#ff007f',
              fontSize: '10px',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              textShadow: '0 0 8px #ff007f',
              textAlign: 'center',
              marginTop: '4px',
              whiteSpace: 'nowrap'
            }}>
              THE DEEPVERSE PORTFOLIO
            </div>
          </Html>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 2. ABOUT ME DISTRICT */}
      {/* ======================================================== */}
      <group position={[0, 0.5, 75]}>
        <group ref={aboutRef}>
          {/* Floating Nested Neon Cubes */}
          <mesh castShadow>
            <boxGeometry args={[2.5, 2.5, 2.5]} />
            <meshStandardMaterial color="#070714" roughness={0.2} metalness={0.9} wireframe />
          </mesh>
          <mesh>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshBasicMaterial color="#ff007f" transparent opacity={0.3} />
          </mesh>
        </group>
        
        {/* Profile billboard via Html */}
        <Html position={[0, 4.5, 0]} center transform distanceFactor={16}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#00f0ff',
            fontSize: '16px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00f0ff',
            whiteSpace: 'nowrap'
          }}>
            ABOUT ME: DEEPESH JOSHI
          </div>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#ffaa00',
            fontSize: '10px',
            fontWeight: 'normal',
            letterSpacing: '0.05em',
            textShadow: '0 0 8px #ffaa00',
            textAlign: 'center',
            marginTop: '4px',
            whiteSpace: 'nowrap'
          }}>
            CREATIVE FULL STACK & GRAPHICS ENGINEER
          </div>
        </Html>
      </group>

      {/* ======================================================== */}
      {/* 3. SKILLS STREET */}
      {/* ======================================================== */}
      <group position={[-40, 0.5, 80]}>
        {/* Signboard */}
        <Html position={[0, 4.2, 0]} center transform distanceFactor={16}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#00f0ff',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00f0ff',
            whiteSpace: 'nowrap'
          }}>
            SKILLS STREET
          </div>
        </Html>

        <group ref={skillsRef}>
          {/* Pedestals representing React, Three.js, TS, Python, C++ */}
          {/* React */}
          <group position={[-4, 0, 0]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.5, 0.7, 1.0, 8]} />
              <meshStandardMaterial color="#0c0c16" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.4, 0.07, 8, 24]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
            <Html position={[0, 2.4, 0]} center transform distanceFactor={12}>
              <div style={{ fontFamily: 'Orbitron', color: '#00f0ff', fontSize: '9px', whiteSpace: 'nowrap' }}>REACT</div>
            </Html>
          </group>

          {/* Three.js */}
          <group position={[-2, 0, 0]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.5, 0.7, 1.0, 8]} />
              <meshStandardMaterial color="#0c0c16" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.6, 0]}>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial color="#050510" roughness={0.1} metalness={0.9} wireframe />
            </mesh>
            <Html position={[0, 2.4, 0]} center transform distanceFactor={12}>
              <div style={{ fontFamily: 'Orbitron', color: '#ffaa00', fontSize: '9px', whiteSpace: 'nowrap' }}>THREE.JS</div>
            </Html>
          </group>

          {/* TypeScript */}
          <group position={[0, 0, 0]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.5, 0.7, 1.0, 8]} />
              <meshStandardMaterial color="#0c0c16" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.6, 0]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshBasicMaterial color="#ff007f" wireframe />
            </mesh>
            <Html position={[0, 2.4, 0]} center transform distanceFactor={12}>
              <div style={{ fontFamily: 'Orbitron', color: '#ff007f', fontSize: '9px', whiteSpace: 'nowrap' }}>TS</div>
            </Html>
          </group>

          {/* Python */}
          <group position={[2, 0, 0]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.5, 0.7, 1.0, 8]} />
              <meshStandardMaterial color="#0c0c16" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.6, 0]}>
              <octahedronGeometry args={[0.4, 0]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
            <Html position={[0, 2.4, 0]} center transform distanceFactor={12}>
              <div style={{ fontFamily: 'Orbitron', color: '#00f0ff', fontSize: '9px', whiteSpace: 'nowrap' }}>PYTHON</div>
            </Html>
          </group>

          {/* C++ */}
          <group position={[4, 0, 0]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.5, 0.7, 1.0, 8]} />
              <meshStandardMaterial color="#0c0c16" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.6, 0]}>
              <coneGeometry args={[0.3, 0.6, 8]} />
              <meshBasicMaterial color="#9d00ff" />
            </mesh>
            <Html position={[0, 2.4, 0]} center transform distanceFactor={12}>
              <div style={{ fontFamily: 'Orbitron', color: '#9d00ff', fontSize: '9px', whiteSpace: 'nowrap' }}>C++</div>
            </Html>
          </group>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 4. GITHUB TOWER */}
      {/* ======================================================== */}
      <group position={[45, 0.5, -45]}>
        {/* Massive cyberpunk tower chassis */}
        <mesh position={[0, 25.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 50, 14]} />
          <meshStandardMaterial color="#02020a" roughness={0.7} metalness={0.8} />
        </mesh>
        
        {/* Neon corner trim lines */}
        <mesh position={[-7.1, 25.0, 7.1]}>
          <boxGeometry args={[0.1, 50, 0.1]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
        <mesh position={[7.1, 25.0, 7.1]}>
          <boxGeometry args={[0.1, 50, 0.1]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>

        {/* Rotating Holographic Octocat head assembly */}
        <group ref={octocatRef} position={[0, 16.0, 0]}>
          {/* Main head sphere */}
          <mesh>
            <sphereGeometry args={[2.0, 16, 16]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} wireframe />
          </mesh>
          {/* Left cat ear */}
          <mesh position={[-1.2, 1.8, 0]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.5, 1.2, 4]} />
            <meshBasicMaterial color="#00f0ff" wireframe />
          </mesh>
          {/* Right cat ear */}
          <mesh position={[1.2, 1.8, 0]} rotation={[0, 0, -0.4]}>
            <coneGeometry args={[0.5, 1.2, 4]} />
            <meshBasicMaterial color="#00f0ff" wireframe />
          </mesh>
          {/* Torus boundary ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.2, 0.08, 8, 32]} />
            <meshBasicMaterial color="#ff007f" />
          </mesh>
        </group>

        {/* Floating PR / Commit rings */}
        <mesh position={[0, 48.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5.0, 0.1, 8, 32]} />
          <meshBasicMaterial color="#ffaa00" />
        </mesh>
        <mesh position={[0, 49.0, 0]} rotation={[Math.PI / 2, 0.2, 0]}>
          <torusGeometry args={[3.5, 0.08, 8, 32]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>

        <Html position={[-7.5, 15, 0]} rotation={[0, -Math.PI / 2, 0]} center transform distanceFactor={25}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#00f0ff',
            fontSize: '28px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00f0ff',
            transform: 'rotate(-90deg)',
            whiteSpace: 'nowrap'
          }}>
            GITHUB TOWER
          </div>
        </Html>
      </group>

      {/* ======================================================== */}
      {/* 5. OPEN SOURCE AVENUE */}
      {/* ======================================================== */}
      <group position={[0, 0.5, -60]}>
        {/* Waterfall coding gate columns */}
        <mesh position={[-4, 3.5, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 7.0, 16]} />
          <meshStandardMaterial color="#0c0c16" metalness={0.9} />
        </mesh>
        <mesh position={[4, 3.5, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 7.0, 16]} />
          <meshStandardMaterial color="#0c0c16" metalness={0.9} />
        </mesh>
        <mesh position={[0, 7.0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 8.0]} />
          <meshBasicMaterial color="#ff007f" />
        </mesh>

        {/* Streaming glowing codes group */}
        <group ref={codeAveRef} position={[0, 3.5, 0]}>
          <mesh>
            <cylinderGeometry args={[2.5, 2.5, 6.0, 8, 1, true]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} wireframe />
          </mesh>
        </group>

        {/* Text indicators */}
        <Html position={[0, 8.0, 0]} center transform distanceFactor={18}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#ff007f',
            fontSize: '15px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #ff007f',
            whiteSpace: 'nowrap'
          }}>
            OPEN SOURCE AVE
          </div>
        </Html>
      </group>

      {/* ======================================================== */}
      {/* 6. PROJECTS DISTRICT */}
      {/* ======================================================== */}
      <group position={[-55, 0.5, -45]}>
        <Html position={[0, 4.5, 0]} center transform distanceFactor={16}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#ffaa00',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #ffaa00',
            whiteSpace: 'nowrap'
          }}>
            PROJECTS DISTRICT
          </div>
        </Html>

        <group ref={projectsRef}>
          {/* Beacons for projects */}
          <group position={[-3, 0.5, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.5, 1.0, 1.5]} />
              <meshStandardMaterial color="#080816" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <octahedronGeometry args={[0.45, 0]} />
              <meshBasicMaterial color="#ff007f" wireframe />
            </mesh>
            <Html position={[0, 2.0, 0]} center transform distanceFactor={12}>
              <div style={{ fontFamily: 'Orbitron', color: '#ff007f', fontSize: '8px', whiteSpace: 'nowrap' }}>DEEPVERSE 3D</div>
            </Html>
          </group>

          <group position={[3, 0.5, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.5, 1.0, 1.5]} />
              <meshStandardMaterial color="#080816" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <octahedronGeometry args={[0.45, 0]} />
              <meshBasicMaterial color="#00f0ff" wireframe />
            </mesh>
             <Html position={[0, 2.0, 0]} center transform distanceFactor={12}>
               <div style={{ fontFamily: 'Orbitron', color: '#00f0ff', fontSize: '8px', whiteSpace: 'nowrap' }}>SATELLITE IMAGE RTV</div>
             </Html>
          </group>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 7. EXPERIENCE BOULEVARD */}
      {/* ======================================================== */}
      <group position={[-55, 0.5, 45]}>
        <Html position={[0, 4.5, 0]} center transform distanceFactor={16}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#00f0ff',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00f0ff',
            whiteSpace: 'nowrap'
          }}>
            EXPERIENCE BOULEVARD
          </div>
        </Html>

        <group ref={experienceRef}>
          <mesh position={[0, 2.0, 0]} castShadow>
            <boxGeometry args={[4.5, 3.0, 0.2]} />
            <meshStandardMaterial color="#0c0c16" metalness={0.9} />
          </mesh>
          <mesh position={[0, 2.0, 0.12]}>
            <boxGeometry args={[4.2, 2.7, 0.02]} />
            <meshBasicMaterial color="#ff007f" wireframe />
          </mesh>
          <Html position={[0, 2.0, 0.18]} center transform distanceFactor={12}>
            <div style={{
              fontFamily: 'Orbitron',
              color: '#ff007f',
              fontSize: '8px',
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: '1.4',
              whiteSpace: 'nowrap'
            }}>
              OPEN SOURCE<br/>CONTRIBUTOR
            </div>
          </Html>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 8. CERTIFICATIONS HALL */}
      {/* ======================================================== */}
      <group position={[55, 0.5, 60]}>
        <Html position={[0, 4.0, 0]} center transform distanceFactor={16}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#ffaa00',
            fontSize: '16px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #ffaa00',
            whiteSpace: 'nowrap'
          }}>
            CERTIFICATIONS HALL
          </div>
        </Html>

        <group ref={certsRef}>
          {/* Certificate displays */}
          <mesh position={[-1.5, 1.8, 0]} rotation={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.5, 2.0, 0.1]} />
            <meshStandardMaterial color="#070714" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[-1.5, 1.8, 0.07]} rotation={[0, 0.25, 0]}>
            <boxGeometry args={[1.3, 1.8, 0.01]} />
            <meshBasicMaterial color="#00f0ff" wireframe />
          </mesh>

          <mesh position={[1.5, 1.8, 0]} rotation={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[1.5, 2.0, 0.1]} />
            <meshStandardMaterial color="#070714" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[1.5, 1.8, 0.07]} rotation={[0, -0.25, 0]}>
            <boxGeometry args={[1.3, 1.8, 0.01]} />
            <meshBasicMaterial color="#ff007f" wireframe />
          </mesh>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 9. HACKATHON ARENA */}
      {/* ======================================================== */}
      <group position={[45, 0.5, 45]}>
        {/* Stadium circular architecture */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[5.0, 6.0, 4.0, 16]} />
          <meshStandardMaterial color="#080816" roughness={0.5} metalness={0.9} wireframe />
        </mesh>
        
        {/* Scanning laser sweeps */}
        <group ref={arenaRef} position={[0, 4.0, 0]}>
          <mesh position={[-2.0, 2.0, 0]} rotation={[0.3, 0, 0.3]}>
            <cylinderGeometry args={[0.01, 0.3, 4.0, 8]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.25} />
          </mesh>
          <mesh position={[2.0, 2.0, 0]} rotation={[0.3, 0, -0.3]}>
            <cylinderGeometry args={[0.01, 0.3, 4.0, 8]} />
            <meshBasicMaterial color="#ff007f" transparent opacity={0.25} />
          </mesh>
        </group>

        <Html position={[0, 5.5, 0]} center transform distanceFactor={18}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#00f0ff',
            fontSize: '15px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00f0ff',
            whiteSpace: 'nowrap'
          }}>
            HACKATHON ARENA
          </div>
        </Html>
      </group>

      {/* ======================================================== */}
      {/* 10. FUTURE VISION TOWER */}
      {/* ======================================================== */}
      <group position={[-60, 0.5, -85]}>
        {/* Spire tower structure */}
        <mesh position={[0, 20.0, 0]} castShadow>
          <cylinderGeometry args={[0.02, 3.0, 40.0, 8]} />
          <meshStandardMaterial color="#0b0b18" roughness={0.3} metalness={0.9} />
        </mesh>
        
        {/* Volumetric Laser Beacon rising to sky */}
        <mesh ref={futureLaserRef} position={[0, 60.0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 100.0, 8]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
        </mesh>

        <Html position={[0, 3.5, 3.5]} center transform distanceFactor={18}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#00f0ff',
            fontSize: '16px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00f0ff',
            whiteSpace: 'nowrap'
          }}>
            FUTURE VISION
          </div>
        </Html>
      </group>

      {/* ======================================================== */}
      {/* 11. CONTACT HUB */}
      {/* ======================================================== */}
      <group position={[60, 0.5, -60]}>
        <Html position={[0, 3.5, 0]} center transform distanceFactor={16}>
          <div style={{
            fontFamily: 'Orbitron',
            color: '#ffaa00',
            fontSize: '16px',
            fontWeight: 'bold',
            textShadow: '0 0 10px #ffaa00',
            whiteSpace: 'nowrap'
          }}>
            CONTACT HUB
          </div>
        </Html>

        <group ref={contactRef}>
          {/* Linked Network Nodes */}
          <group position={[-1.5, 1.2, 0]}>
            <mesh>
              <boxGeometry args={[0.7, 0.7, 0.7]} />
              <meshBasicMaterial color="#00f0ff" wireframe />
            </mesh>
            <Html position={[0, 0.8, 0]} center transform distanceFactor={10}>
              <div style={{ fontFamily: 'Orbitron', color: '#00f0ff', fontSize: '7px', whiteSpace: 'nowrap' }}>LINKEDIN</div>
            </Html>
          </group>
          <group position={[1.5, 1.2, 0]}>
            <mesh>
              <boxGeometry args={[0.7, 0.7, 0.7]} />
              <meshBasicMaterial color="#ff007f" wireframe />
            </mesh>
            <Html position={[0, 0.8, 0]} center transform distanceFactor={10}>
              <div style={{ fontFamily: 'Orbitron', color: '#ff007f', fontSize: '7px', whiteSpace: 'nowrap' }}>EMAIL</div>
            </Html>
          </group>
        </group>
      </group>

    </group>
  );
};

export default PortfolioDistricts;
