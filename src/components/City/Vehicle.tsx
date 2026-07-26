import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperience } from '../../context/ExperienceContext';
import * as THREE from 'three';
import { synth } from '../../hooks/useAssetLoader';
import { DroneBeacon } from './DroneBeacon';

// Shared building coordinates helper to check collisions
const isNearBuilding = (x: number, z: number): boolean => {
  const gridSize = 9;
  const spacing = 18;
  
  // Grid coordinates corresponding to city setup
  const gridX = Math.round(x / spacing);
  const gridZ = Math.round(z / spacing);

  // Check bounds
  if (Math.abs(gridX) > gridSize || Math.abs(gridZ) > gridSize) return false;

  const distanceToCenter = Math.sqrt(gridX * gridX + gridZ * gridZ);
  if (distanceToCenter < 2.5) return false; // center plaza is clear
  if (Math.abs(gridX) < 1.2 && gridZ > -5) return false; // north highway clear

  // Procedural noise factor used in Buildings generation
  const hash = fractHash(gridX, gridZ);
  if (hash > 0.72) return false; // building skipped

  // Calculate building center and approximate collision size
  const bldX = gridX * spacing;
  const bldZ = gridZ * spacing;

  // Building width/depth boundaries (approx 12x12 units with car clearance)
  const halfSize = 6.2; 
  if (Math.abs(x - bldX) < halfSize && Math.abs(z - bldZ) < halfSize) {
    return true; // collision detected!
  }

  return false;
};

// Fast hash matching the city generator
const fractHash = (x: number, z: number): number => {
  const dotVal = x * 12.7 + z * 31.1;
  return fract(Math.sin(dotVal) * 43758.54);
};

const fract = (val: number): number => {
  return val - Math.floor(val);
};

export const WAYPOINTS = [
  { name: 'Welcome Plaza', position: new THREE.Vector3(0, 0.1, 30) },
  { name: 'About Me', position: new THREE.Vector3(0, 0.1, 75) },
  { name: 'Skills Street', position: new THREE.Vector3(-40, 0.1, 80) },
  { name: 'Experience Boulevard', position: new THREE.Vector3(-55, 0.1, 45) },
  { name: 'Projects District', position: new THREE.Vector3(-55, 0.1, -45) },
  { name: 'Future Vision Spire', position: new THREE.Vector3(-60, 0.1, -85) },
  { name: 'Open Source Avenue', position: new THREE.Vector3(0, 0.1, -60) },
  { name: 'GitHub Tower', position: new THREE.Vector3(45, 0.1, -45) },
  { name: 'Contact Hub', position: new THREE.Vector3(60, 0.1, -60) },
  { name: 'Certifications Hall', position: new THREE.Vector3(55, 0.1, 60) },
  { name: 'Hackathon Arena', position: new THREE.Vector3(45, 0.1, 45) },
  { name: 'Welcome Plaza End', position: new THREE.Vector3(0, 0.1, 30) }
];

const easeInOutCubic = (x: number): number => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export const Vehicle: React.FC = () => {
  const {
    sceneState,
    cameraMode,
    inputs,
    setSpeed,
    setRpm,
    setBoostActive,
    setHasDriven,
    hasDriven,
    quality,
    autoExploreActive,
    autoExploreIndex,
    autoExploreState,
    autoExploreDirection,
    setAutoExploreActive,
    setAutoExploreIndex,
    setAutoExploreState,
    setAutoExploreDirection
  } = useExperience();

  const carGroupRef = useRef<THREE.Group>(null);
  
  // Physics parameters (using refs for direct mutation in R3F frame loop)
  const pos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.1, 25)); // start near center highway
  const angle = useRef<number>(Math.PI); // facing forward (towards North/negative Z)
  const velocity = useRef<number>(0);
  const steerAngle = useRef<number>(0);
  const driftFactor = useRef<number>(0);

  // Autopilot variables
  const autoExploreT = useRef<number>(0);
  const autoExploreTimer = useRef<number>(0);

  // Wheel meshes for rotation/steering animation
  const frontLeftWheel = useRef<THREE.Mesh>(null);
  const frontRightWheel = useRef<THREE.Mesh>(null);
  const rearLeftWheel = useRef<THREE.Mesh>(null);
  const rearRightWheel = useRef<THREE.Mesh>(null);

  // Underglow light
  const underglowLightRef = useRef<THREE.PointLight>(null);

  // Exhaust particles config (reusable buffer)
  const exhaustCount = 20;
  const [exhaustParticles, exhaustSpeeds] = useMemo(() => {
    const positions = new Float32Array(exhaustCount * 3);
    const speeds = new Float32Array(exhaustCount);
    for (let i = 0; i < exhaustCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = -100; // hide initially
      positions[i * 3 + 2] = 0;
      speeds[i] = 0.5 + Math.random() * 1.5;
    }
    return [positions, speeds];
  }, []);
  const exhaustPointsRef = useRef<THREE.Points>(null);

  // Sound trigger on scene introduction finished
  const soundStarted = useRef(false);
  useEffect(() => {
    if (sceneState === 'explore' && !soundStarted.current) {
      synth.startEngine();
      soundStarted.current = true;
    }
    const win = window as any;
    win.synthClick = () => synth.playClick();
  }, [sceneState]);

  // Sync / Reset vehicle when Auto Explore starts/stops
  useEffect(() => {
    if (autoExploreActive) {
      autoExploreT.current = 0;
      autoExploreTimer.current = 0;
      pos.current.copy(WAYPOINTS[0].position);
      angle.current = Math.PI;
      velocity.current = 0;
      steerAngle.current = 0;
      driftFactor.current = 0;
      if (carGroupRef.current) {
        carGroupRef.current.position.copy(pos.current);
        carGroupRef.current.rotation.set(0, angle.current, 0);
      }
    }
  }, [autoExploreActive]);

  // Reset autoExploreT when index changes during Auto Explore
  useEffect(() => {
    autoExploreT.current = 0;
  }, [autoExploreIndex, autoExploreActive]);

  // Reset function
  useEffect(() => {
    if (inputs.reset) {
      pos.current.set(0, 0.1, 25);
      angle.current = Math.PI;
      velocity.current = 0;
      steerAngle.current = 0;
      driftFactor.current = 0;
      if (carGroupRef.current) {
        carGroupRef.current.position.copy(pos.current);
        carGroupRef.current.rotation.set(0, angle.current, 0);
      }
      synth.playClick();
    }
  }, [inputs.reset]);

  useFrame((state, delta) => {
    // Clamp delta to avoid massive teleportation jumps during tab switching
    const dt = Math.min(delta, 0.05);

    // Only allow driving after introduction has booted
    if (sceneState === 'loading' || sceneState === 'intro') {
      // Idle suspension vibrations during cinematic circles
      if (carGroupRef.current) {
        const time = state.clock.getElapsedTime();
        carGroupRef.current.position.y = 0.1 + Math.sin(time * 18.0) * 0.008;
      }
      return;
    }

    // 0. AUTOPILOT / AUTO-EXPLORE MODE
    if (autoExploreActive && autoExploreIndex >= 0 && autoExploreIndex < WAYPOINTS.length) {
      if (autoExploreState === 'driving') {
        let startPos: THREE.Vector3;
        let endPos: THREE.Vector3;

        if (autoExploreDirection === 'forward') {
          const prevWaypoint = WAYPOINTS[autoExploreIndex === 0 ? 0 : autoExploreIndex - 1];
          const nextWaypoint = WAYPOINTS[autoExploreIndex];
          startPos = prevWaypoint.position;
          endPos = nextWaypoint.position;
        } else {
          // Backward direction: drive from the next waypoint index back to the current waypoint index
          const nextWaypoint = WAYPOINTS[autoExploreIndex + 1];
          const currentWaypoint = WAYPOINTS[autoExploreIndex];
          startPos = nextWaypoint.position;
          endPos = currentWaypoint.position;
        }

        const dist = startPos.distanceTo(endPos);
        const tourSpeed = 16.0; // stable speed in meters per sec
        const duration = Math.max(dist / tourSpeed, 1.0);
        
        let t = autoExploreT.current + dt / duration;
        if (t > 1.0) t = 1.0;
        autoExploreT.current = t;
        
        const ease = easeInOutCubic(t);
        const newPos = new THREE.Vector3().lerpVectors(startPos, endPos, ease);
        pos.current.copy(newPos);
        
        if (t < 0.99) {
          const nextPosFuture = new THREE.Vector3().lerpVectors(startPos, endPos, easeInOutCubic(Math.min(t + 0.01, 1.0)));
          const dir = nextPosFuture.clone().sub(newPos).normalize();
          if (dir.lengthSq() > 0.001) {
            angle.current = Math.atan2(dir.x, dir.z);
          }
        }
        
        setSpeed(58);
        setRpm(3200 + Math.sin(state.clock.getElapsedTime() * 3.0) * 150);
        
        if (t >= 1.0) {
          if (autoExploreIndex === WAYPOINTS.length - 1) {
            setAutoExploreState('finished');
          } else {
            setAutoExploreState('paused');
          }
          setAutoExploreDirection('forward'); // reset direction to forward after arrival
          autoExploreTimer.current = 0;
        }
      } else if (autoExploreState === 'manually_paused') {
        // Manually paused: vehicle freezes position, speed is 0, engine idles
        setSpeed(0);
        setRpm(800 + Math.sin(state.clock.getElapsedTime() * 10.0) * 10);
      } else if (autoExploreState === 'finished') {
        // Grand Finale State: Vehicle stops static, engine RPM fades completely out over time
        setSpeed(0);
        
        const currentRpm = Math.max(800 - autoExploreTimer.current * 100, 0);
        setRpm(currentRpm);
        synth.updateEngine(currentRpm, 0, false, false);
        
        autoExploreTimer.current += dt;
      } else {
        // Paused at district (autoExploreState === 'paused')
        const currentWaypoint = WAYPOINTS[autoExploreIndex];
        pos.current.copy(currentWaypoint.position);
        setSpeed(0);
        setRpm(800 + Math.sin(state.clock.getElapsedTime() * 10.0) * 10);
        
        autoExploreTimer.current += dt;
        if (autoExploreTimer.current >= 8.5) {
          if (autoExploreIndex >= WAYPOINTS.length - 1) {
            setAutoExploreActive(false);
            setAutoExploreIndex(-1);
            setAutoExploreState('driving');
            setAutoExploreDirection('forward');
          } else {
            setAutoExploreIndex(autoExploreIndex + 1);
            setAutoExploreState('driving');
            setAutoExploreDirection('forward');
            autoExploreT.current = 0;
          }
        }
      }

      if (carGroupRef.current) {
        const hover = Math.sin(state.clock.getElapsedTime() * 18.0) * 0.005;
        carGroupRef.current.position.copy(pos.current);
        carGroupRef.current.position.y += hover;
        carGroupRef.current.rotation.set(0, angle.current, 0);
      }

      const rollingSpeed = (autoExploreState === 'driving' ? 16.0 : 0) * dt;
      if (frontLeftWheel.current) frontLeftWheel.current.rotation.x += rollingSpeed;
      if (frontRightWheel.current) frontRightWheel.current.rotation.x += rollingSpeed;
      if (rearLeftWheel.current) rearLeftWheel.current.rotation.x += rollingSpeed;
      if (rearRightWheel.current) rearRightWheel.current.rotation.x += rollingSpeed;

      const win = window as any;
      win.carPosition = pos.current;

      if (autoExploreState !== 'finished') {
        synth.updateEngine(autoExploreState === 'driving' ? 3200 : 800, autoExploreState === 'driving' ? 16 : 0, false, false);
      }
      return;
    }

    // 1. INPUT HANDLING & SPEED PHYSICS
    const isForward = inputs.forward;
    const isBackward = inputs.backward;
    const isLeft = inputs.left;
    const isRight = inputs.right;
    const isBraking = inputs.brake;
    const isBoosting = inputs.boost;

    if (isForward && !hasDriven) {
      setHasDriven(true);
    }

    // Constants tuning driving feel
    const maxSpeedNormal = 32.0; // units/sec (~115 km/h)
    const maxSpeedBoost = 48.0;  // units/sec (~170 km/h)
    const maxSpeedReverse = -12.0;
    
    const accelerationRate = isBoosting ? 18.0 : 12.0;
    const decelerationRate = 14.0; // natural engine braking
    const frictionRate = 0.988;    // sliding drag coefficient
    
    const steerSpeed = 7.2;
    const steerDecay = 11.0;
    const maxSteerAngle = 0.80; // smaller turning radius

    // Apply Boost state
    setBoostActive(isBoosting && velocity.current > 1 && isForward);

    // Throttle / Reverse
    if (isForward && !isBraking) {
      const maxSpeed = isBoosting ? maxSpeedBoost : maxSpeedNormal;
      velocity.current = Math.min(velocity.current + accelerationRate * dt, maxSpeed);
    } else if (isBackward) {
      if (velocity.current > 0) {
        // acts as immediate reverse brake
        velocity.current = Math.max(velocity.current - decelerationRate * 2.0 * dt, 0);
      } else {
        // actual reverse acceleration
        velocity.current = Math.max(velocity.current - accelerationRate * 0.5 * dt, maxSpeedReverse);
      }
    } else {
      // Engine braking coasting decay
      if (velocity.current > 0.05) {
        velocity.current = Math.max(velocity.current - decelerationRate * dt, 0);
      } else if (velocity.current < -0.05) {
        velocity.current = Math.min(velocity.current + decelerationRate * dt, 0);
      } else {
        velocity.current = 0;
      }
    }

    // Hand brake (Space) drag
    if (isBraking) {
      if (velocity.current > 0) {
        velocity.current = Math.max(velocity.current - decelerationRate * 3.5 * dt, 0);
      } else {
        velocity.current = Math.min(velocity.current + decelerationRate * 3.5 * dt, 0);
      }
    }

    // Apply drag friction
    velocity.current *= frictionRate;

    // 2. STEERING & DRIFT PHYSICS
    if (isLeft) {
      steerAngle.current = Math.min(steerAngle.current + steerSpeed * dt, maxSteerAngle);
    } else if (isRight) {
      steerAngle.current = Math.max(steerAngle.current - steerSpeed * dt, -maxSteerAngle);
    } else {
      // Return steering wheels to center
      if (steerAngle.current > 0.01) {
        steerAngle.current = Math.max(steerAngle.current - steerDecay * dt, 0);
      } else if (steerAngle.current < -0.01) {
        steerAngle.current = Math.min(steerAngle.current + steerDecay * dt, 0);
      } else {
        steerAngle.current = 0;
      }
    }

    // Drifting side-slip calculation (slides out more at high speeds and sharp turns)
    const turnIntensity = Math.abs(steerAngle.current);
    const speedRatio = Math.abs(velocity.current) / maxSpeedNormal;
    
    if (turnIntensity > 0.25 && speedRatio > 0.4 && (isBraking || isBoosting || isLeft || isRight)) {
      // increase slide factor
      driftFactor.current = THREE.MathUtils.lerp(driftFactor.current, steerAngle.current * 0.65, 5.0 * dt);
    } else {
      driftFactor.current = THREE.MathUtils.lerp(driftFactor.current, 0, 8.0 * dt);
    }

    // 3. COLLISION AND MOVEMENT INTEGRATION
    // Yaw rotation update (improved turning sharpness)
    angle.current += (velocity.current * 0.055) * steerAngle.current * dt;

    // Try moving car position
    const nextPos = pos.current.clone();
    // Offset angle with drift slip angle to slide visually
    const moveAngle = angle.current + driftFactor.current * 0.3;
    nextPos.x += velocity.current * Math.sin(moveAngle) * dt;
    nextPos.z += velocity.current * Math.cos(moveAngle) * dt;

    // Write coordinate position to global window space for the HUD overlay
    const win = window as any;
    win.carPosition = pos.current;

    // Collision boundary limits checking (city border walls at 150)
    const boundaryLimit = 160;
    if (Math.abs(nextPos.x) > boundaryLimit || Math.abs(nextPos.z) > boundaryLimit) {
      // bounce back
      velocity.current = -velocity.current * 0.3;
      synth.playClick(); // trigger collision thud noise
    } else if (isNearBuilding(nextPos.x, nextPos.z)) {
      // building collision bounce
      velocity.current = -velocity.current * 0.4;
      synth.playClick(); // bump click
    } else {
      // safe, write position
      pos.current.copy(nextPos);
    }

    // 4. MESH TRANSFORMS & SUSPENSION SWAY
    if (carGroupRef.current) {
      carGroupRef.current.position.copy(pos.current);
      
      // Rotate car mesh. Y rotation accounts for drift angle too
      carGroupRef.current.rotation.set(0, angle.current, 0);

      // Scale vehicle smoothly based on drone camera view (5-10% scale up)
      const targetScale = cameraMode === 'drone' ? 1.08 : 1.0;
      carGroupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 6.0 * dt);

      // Body roll/sway based on centripetal force
      const lateralG = velocity.current * steerAngle.current * 0.04;
      carGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        carGroupRef.current.rotation.z,
        lateralG * 0.3,
        8.0 * dt
      );

      // Nose pitch based on acceleration / braking
      const pitchAcc = (isForward ? 1 : 0) - (isBraking ? 1.5 : 0);
      carGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        carGroupRef.current.rotation.x,
        pitchAcc * 0.015,
        10.0 * dt
      );
    }

    // 5. WHEEL ANIMATIONS
    const rollingSpeed = (velocity.current / 1.5) * dt;
    
    // Front wheel yaw steering
    if (frontLeftWheel.current) {
      frontLeftWheel.current.rotation.y = steerAngle.current * 1.5;
      frontLeftWheel.current.rotation.x += rollingSpeed;
    }
    if (frontRightWheel.current) {
      frontRightWheel.current.rotation.y = steerAngle.current * 1.5;
      frontRightWheel.current.rotation.x += rollingSpeed;
    }

    // Rear wheel roll
    if (rearLeftWheel.current) rearLeftWheel.current.rotation.x += rollingSpeed;
    if (rearRightWheel.current) rearRightWheel.current.rotation.x += rollingSpeed;

    // 6. DUST / EXHAUST PARTICLES INJECTOR
    if (exhaustPointsRef.current && quality === 'high') {
      const geo = exhaustPointsRef.current.geometry;
      const attrib = geo.getAttribute('position') as THREE.BufferAttribute;
      const count = exhaustCount;

      // Slowly float out particles in reverse direction of exhaust
      for (let i = 0; i < count; i++) {
        let pz = attrib.getZ(i);
        pz -= exhaustSpeeds[i] * 5.0 * dt; // shoot back
        
        let py = attrib.getY(i);
        py += Math.random() * 0.1 * dt; // float up slightly
        
        let px = attrib.getX(i);

        // Reset particle if it drifts too far back
        if (pz < -10) {
          px = Math.sin(state.clock.getElapsedTime() * 100) * 0.2;
          py = 0.4;
          pz = 0;
        }

        attrib.setX(i, px);
        attrib.setY(i, py);
        attrib.setZ(i, pz);
      }
      attrib.needsUpdate = true;
    }

    // 7. GLOBAL STATE TELEMETRY UPDATE (speed & rpm)
    const showSpeed = Math.round(Math.abs(velocity.current) * 3.6); // scale unit/sec to simulated km/h
    setSpeed(showSpeed);
    
    // Engine RPM simulation: gears 1-5
    let currentRpm = 800; // idle
    if (showSpeed > 0) {
      const gearRatio = showSpeed < 30 ? 60 : showSpeed < 65 ? 40 : showSpeed < 100 ? 30 : 22;
      currentRpm = 800 + (showSpeed % gearRatio) * (7000 / gearRatio);
    }
    setRpm(currentRpm);

    // Trigger audio updates
    synth.updateEngine(currentRpm, showSpeed, isBraking, isBoosting);

    // Update dynamic underglow pulse
    if (underglowLightRef.current) {
      const pulse = Math.sin(state.clock.getElapsedTime() * 4.0) * 0.4 + 2.0;
      underglowLightRef.current.intensity = pulse;
    }
  });

  // Material parameters
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#080814',
    roughness: 0.15,
    metalness: 0.9,
    flatShading: true,
  });

  const neonCyanMaterial = new THREE.MeshBasicMaterial({
    color: '#00f0ff',
  });

  const neonMagentaMaterial = new THREE.MeshBasicMaterial({
    color: '#ff007f',
  });

  return (
    <group>
      {/* Dynamic Exhaus Particle group (only rendered when high specs) */}
      {quality === 'high' && (
        <points ref={exhaustPointsRef} position={[pos.current.x, pos.current.y, pos.current.z]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[exhaustParticles, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.15}
            color="#ff007f"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Main Vehicle Physical Group */}
      <group ref={carGroupRef} position={[pos.current.x, pos.current.y, pos.current.z]} name="Vehicle">
        {/* Holographic Drone Beacon for visibility in Drone View */}
        <DroneBeacon active={cameraMode === 'drone'} />
        
        {/* CAR BODY MESH ASSEMBLY */}
        <group position={[0, 0.4, 0]}>
          
          {/* Main Chassis Base */}
          <mesh castShadow receiveShadow material={bodyMaterial}>
            <boxGeometry args={[1.8, 0.4, 4.2]} />
          </mesh>

          {/* Windshield / Cockpit Dome */}
          <mesh position={[0, 0.38, -0.2]} castShadow>
            <boxGeometry args={[1.4, 0.45, 1.8]} />
            <meshStandardMaterial
              color="#00f0ff"
              roughness={0.05}
              metalness={0.9}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Cockpit Inner Holographic dashboard beacon */}
          <mesh position={[0, 0.28, -0.9]}>
            <boxGeometry args={[1.0, 0.1, 0.1]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>

          {/* Cyber Spoiler Wing (Rear) */}
          <group position={[0, 0.4, 1.8]}>
            <mesh castShadow material={bodyMaterial}>
              <boxGeometry args={[2.0, 0.08, 0.4]} />
            </mesh>
            {/* Left strut */}
            <mesh position={[-0.8, -0.2, 0]} material={bodyMaterial}>
              <boxGeometry args={[0.08, 0.35, 0.1]} />
            </mesh>
            {/* Right strut */}
            <mesh position={[0.8, -0.2, 0]} material={bodyMaterial}>
              <boxGeometry args={[0.08, 0.35, 0.1]} />
            </mesh>
          </group>

          {/* HEADLIGHTS (Emissive nodes + spotlights) */}
          {/* Left Headlight */}
          <mesh position={[-0.7, 0.05, -2.1]} material={neonCyanMaterial}>
            <boxGeometry args={[0.25, 0.1, 0.1]} />
          </mesh>
          {/* Right Headlight */}
          <mesh position={[0.7, 0.05, -2.1]} material={neonCyanMaterial}>
            <boxGeometry args={[0.25, 0.1, 0.1]} />
          </mesh>

          {/* Spotlights projecting forward */}
          <spotLight
            position={[0, 0.2, -2.2]}
            target-position={[0, 0, -50]}
            angle={0.5}
            penumbra={0.6}
            intensity={4.5}
            distance={70}
            color="#a5f3ff"
            castShadow
          />

          {/* TAIL / BRAKE LIGHTS */}
          <mesh
            position={[0, 0.08, 2.1]}
            material={
              inputs.brake || inputs.backward
                ? neonMagentaMaterial // bright magenta brakes
                : new THREE.MeshBasicMaterial({ color: '#550022' }) // dim taillight
            }
          >
            <boxGeometry args={[1.4, 0.08, 0.08]} />
          </mesh>

          {/* Decorative neon cyan side stripes */}
          <mesh position={[-0.91, 0, 0]} material={neonCyanMaterial}>
            <boxGeometry args={[0.02, 0.08, 2.6]} />
          </mesh>
          <mesh position={[0.91, 0, 0]} material={neonCyanMaterial}>
            <boxGeometry args={[0.02, 0.08, 2.6]} />
          </mesh>
        </group>

        {/* NEON UNDERGLOW POINT LIGHT */}
        <pointLight
          ref={underglowLightRef}
          position={[0, -0.2, 0]}
          intensity={2.5}
          distance={8}
          color="#00f0ff"
        />

        {/* WHEEL MESHES (Assembled at offsets) */}
        {/* Front Left Wheel */}
        <group position={[-1.0, 0.2, -1.3]}>
          <mesh ref={frontLeftWheel} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
            <meshStandardMaterial color="#0b0b0e" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <ringGeometry args={[0.2, 0.35, 6]} />
            <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Front Right Wheel */}
        <group position={[1.0, 0.2, -1.3]}>
          <mesh ref={frontRightWheel} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.35, 16]} />
            <meshStandardMaterial color="#0b0b0e" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <ringGeometry args={[0.2, 0.35, 6]} />
            <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Rear Left Wheel */}
        <group position={[-1.0, 0.2, 1.3]}>
          <mesh ref={rearLeftWheel} castShadow>
            <cylinderGeometry args={[0.48, 0.48, 0.45, 16]} />
            <meshStandardMaterial color="#0b0b0e" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[-0.23, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <ringGeometry args={[0.2, 0.38, 6]} />
            <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Rear Right Wheel */}
        <group position={[1.0, 0.2, 1.3]}>
          <mesh ref={rearRightWheel} castShadow>
            <cylinderGeometry args={[0.48, 0.48, 0.45, 16]} />
            <meshStandardMaterial color="#0b0b0e" roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0.23, 0, 0]} rotation={[0, 0, Math.PI/2]}>
            <ringGeometry args={[0.2, 0.38, 6]} />
            <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
          </mesh>
        </group>

      </group>
    </group>
  );
};
export default Vehicle;
