import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useExperience, type CameraMode } from '../context/ExperienceContext';
import * as THREE from 'three';
import { WAYPOINTS } from '../components/City/Vehicle';

export const CameraManager: React.FC = () => {
  const { camera } = useThree();
  const {
    sceneState,
    setSceneState,
    cameraMode,
    setCameraMode,
    speed,
    boostActive,
    inputs,
    autoExploreActive,
    autoExploreIndex,
    autoExploreState,
    deviceType
  } = useExperience();

  const isMobile = deviceType === 'mobile' || (typeof window !== 'undefined' && window.innerWidth < 768);
  const zoomFactor = isMobile ? 0.77 : 1.0;
  
  // Vectors for target lock and smooth transition interpolations
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentGoalPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 50, 100));
  const currentUp = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));

  // Circle angle helper for cinematic/intro sweep
  const introTimer = useRef<number>(0);
  const finaleTimer = useRef<number>(0);

  // Monitor key press W to end introduction and begin roaming
  useEffect(() => {
    if (sceneState === 'intro' && inputs.forward) {
      setSceneState('explore');
      setCameraMode('follow');
    }
  }, [inputs.forward, sceneState, setSceneState, setCameraMode]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Track timer for grand finale ending cinematic
    if (autoExploreActive && autoExploreState === 'finished') {
      finaleTimer.current += dt;
    } else {
      finaleTimer.current = 0;
    }

    // 1. Find Vehicle in Three.js hierarchy
    const vehicle = state.scene.getObjectByName('Vehicle') as THREE.Group | undefined;
    
    // Fallback if car isn't rendered yet
    if (!vehicle) {
      if (sceneState === 'intro') {
        // simple circle rotation around center
        introTimer.current += dt * 0.15;
        camera.position.set(
          Math.sin(introTimer.current) * 35,
          10,
          Math.cos(introTimer.current) * 35 + 25
        );
        targetLookAt.current.set(0, 1.5, 25);
        camera.lookAt(targetLookAt.current);
      }
      return;
    }

    const carPos = vehicle.position;
    const carYaw = vehicle.rotation.y;

    // 2. STATE MACHINE: CALCULATE CAMERA TARGET POSITION & LOOK-AT VECTOR
    let goalPos = new THREE.Vector3();
    let goalTarget = new THREE.Vector3();
    let lerpSpeed = 0.06; // standard smooth damping

    // Force cinematic circling during intro
    let activeMode: CameraMode | 'cinematic-pan' | 'grand-finale' = sceneState === 'intro' ? 'cinematic' : cameraMode;

    if (autoExploreActive) {
      if (autoExploreState === 'finished') {
        activeMode = 'grand-finale';
      } else if (autoExploreState === 'paused') {
        // Cinematic side-angle pan framing the district and vehicle
        activeMode = 'cinematic-pan';
      } else if (autoExploreIndex >= 0 && autoExploreIndex < WAYPOINTS.length) {
        // Calculate current path leg progression
        const prevWaypoint = WAYPOINTS[autoExploreIndex === 0 ? 0 : autoExploreIndex - 1];
        const nextWaypoint = WAYPOINTS[autoExploreIndex];
        const carPos2D = new THREE.Vector2(carPos.x, carPos.z);
        const start2D = new THREE.Vector2(prevWaypoint.position.x, prevWaypoint.position.z);
        const end2D = new THREE.Vector2(nextWaypoint.position.x, nextWaypoint.position.z);
        const totalLen = start2D.distanceTo(end2D);
        let t = 0;
        if (totalLen > 0.001) {
          const toCar = carPos2D.clone().sub(start2D);
          const lineDir = end2D.clone().sub(start2D).normalize();
          t = THREE.MathUtils.clamp(toCar.dot(lineDir) / totalLen, 0, 1);
        }

        // Cycle cameras: Follow -> Drone -> Chase based on path progression on long legs
        if (totalLen > 35) {
          if (t < 0.25) {
            activeMode = 'follow';
          } else if (t < 0.7) {
            activeMode = 'drone';
          } else {
            activeMode = 'chase';
          }
        } else {
          activeMode = 'follow';
        }
      } else {
        activeMode = 'follow';
      }
    }

    // Run active camera mode logic
    switch (activeMode) {
      case 'grand-finale': {
        // Grand Finale cinematic sequence: slowly lift upward and rotate around the city
        const fTime = finaleTimer.current;
        const liftHeight = (4.2 + Math.min(fTime / 10.0, 1.0) * 35.0) * zoomFactor; // rises from 4.2 to 39.2
        const radius = (11.0 + Math.min(fTime / 10.0, 1.0) * 20.0) * zoomFactor; // moves back to show scale
        const angle = carYaw + fTime * 0.12; // slow orbit rotation
        
        goalPos.set(
          carPos.x - Math.sin(angle) * radius,
          carPos.y + liftHeight,
          carPos.z - Math.cos(angle) * radius
        );
        goalTarget.copy(carPos).add(new THREE.Vector3(0, 1.8 * zoomFactor, 0));
        lerpSpeed = 0.025; // majestic smooth flight
        break;
      }

      case 'cinematic-pan': {
        const sideDist = 11.0 * zoomFactor;
        const sideHeight = 4.2 * zoomFactor;
        const sideAngle = carYaw + Math.PI / 4.5;
        goalPos.set(
          carPos.x - Math.sin(sideAngle) * sideDist,
          carPos.y + sideHeight,
          carPos.z - Math.cos(sideAngle) * sideDist
        );
        goalTarget.copy(carPos).add(new THREE.Vector3(0, 1.4 * zoomFactor, 0));
        lerpSpeed = 0.035; // extra slow cinematic sweep
        break;
      }

      case 'cinematic':
        // Circular sweep around the vehicle
        introTimer.current += dt * 0.22;
        const radius = 10.5 * zoomFactor;
        goalPos.set(
          carPos.x + Math.sin(introTimer.current) * radius,
          carPos.y + 1.8 * zoomFactor,
          carPos.z + Math.cos(introTimer.current) * radius
        );
        goalTarget.copy(carPos).add(new THREE.Vector3(0, 0.8 * zoomFactor, 0));
        lerpSpeed = 0.03; // extra slow glide
        break;

      case 'follow': {
        // Behind and above the car
        const followDist = (autoExploreActive ? 9.5 : 8.5) * zoomFactor;
        const followHeight = (autoExploreActive ? 4.0 : 3.6) * zoomFactor;
        goalPos.set(
          carPos.x - Math.sin(carYaw) * followDist,
          carPos.y + followHeight,
          carPos.z - Math.cos(carYaw) * followDist
        );
        goalTarget.copy(carPos).add(new THREE.Vector3(0, (autoExploreActive ? 1.0 : 0.8) * zoomFactor, -1.0 * zoomFactor)); // look slightly ahead
        lerpSpeed = autoExploreActive ? 0.05 : 0.08;
        break;
      }

      case 'chase':
        // Close, low rear bumper chase view
        const chaseDist = 6.2 * zoomFactor;
        const chaseHeight = 2.0 * zoomFactor;
        goalPos.set(
          carPos.x - Math.sin(carYaw) * chaseDist,
          carPos.y + chaseHeight,
          carPos.z - Math.cos(carYaw) * chaseDist
        );
        goalTarget.copy(carPos).add(new THREE.Vector3(0, 0.6 * zoomFactor, -2.5 * zoomFactor));
        lerpSpeed = 0.15; // responsive follow
        break;

      case 'driver':
        // Cockpit POV looking forward
        const localDriverOffset = new THREE.Vector3(0, 0.72, -0.15);
        goalPos.copy(localDriverOffset).applyMatrix4(vehicle.matrixWorld);

        const localDriverTarget = new THREE.Vector3(0, 0.58, -15.0);
        goalTarget.copy(localDriverTarget).applyMatrix4(vehicle.matrixWorld);
        lerpSpeed = 0.22; // very responsive
        break;

      case 'drone': {
        // Drone view flies high above, framing the skyline composition beautifully
        const droneDist = 32.0 * zoomFactor;
        const droneHeight = 40.0 * zoomFactor;
        goalPos.set(
          carPos.x - Math.sin(carYaw) * droneDist,
          carPos.y + droneHeight,
          carPos.z - Math.cos(carYaw) * droneDist
        );
        // Look ahead of vehicle to tilt camera down slightly and show the massive skyline
        const localDroneTarget = new THREE.Vector3(0, 1.8 * zoomFactor, -6.5 * zoomFactor);
        goalTarget.copy(localDroneTarget).applyMatrix4(vehicle.matrixWorld);
        lerpSpeed = 0.025; // smooth majestic flight lag
        break;
      }

      case 'orbit':
        // Unlocked Orbit controls
        goalTarget.copy(carPos).add(new THREE.Vector3(0, 1.0 * zoomFactor, 0));
        break;

      default:
        break;
    }

    // 3. APPLY INTERPOLATION & SHAKE TO CAMERA
    if (activeMode !== 'orbit') {
      // Lerp position towards goal
      currentGoalPos.current.lerp(goalPos, lerpSpeed);
      camera.position.copy(currentGoalPos.current);

      // Speed-dependent camera shake (disabled in Auto Explore or Drone view)
      if (!autoExploreActive && activeMode !== 'drone' && (activeMode === 'chase' || activeMode === 'follow') && speed > 20) {
        const shakeScale = (speed / 170) * (boostActive ? 0.08 : 0.035);
        camera.position.x += (Math.random() - 0.5) * shakeScale;
        camera.position.y += (Math.random() - 0.5) * shakeScale;
        camera.position.z += (Math.random() - 0.5) * shakeScale;
      }

      // Lerp look-at target
      targetLookAt.current.lerp(goalTarget, lerpSpeed + 0.02);

      // Apply banking tilt (roll) based on steering for the Drone camera
      if (activeMode === 'drone') {
        const steerFactor = inputs.left ? 0.06 : (inputs.right ? -0.06 : 0);
        const forward = new THREE.Vector3().subVectors(targetLookAt.current, camera.position).normalize();
        const targetUp = new THREE.Vector3(0, 1, 0).applyAxisAngle(forward, steerFactor);
        currentUp.current.lerp(targetUp, dt * 5);
        camera.up.copy(currentUp.current);
      } else {
        currentUp.current.lerp(new THREE.Vector3(0, 1, 0), dt * 5);
        camera.up.copy(currentUp.current);
      }

      camera.lookAt(targetLookAt.current);
    }

    // 4. SMOOTH INTERPOLATION FOR FIELD OF VIEW (Wide cinematic FOV in Drone view)
    const targetFov = activeMode === 'drone' ? 78 : 60;
    const persCam = camera as THREE.PerspectiveCamera;
    if (persCam.fov !== undefined && Math.abs(persCam.fov - targetFov) > 0.05) {
      persCam.fov = THREE.MathUtils.lerp(persCam.fov, targetFov, dt * 4);
      persCam.updateProjectionMatrix();
    }
  });

  return (
    <>
      {cameraMode === 'orbit' && sceneState === 'explore' && (
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2 - 0.05} // prevent going below ground
          minDistance={6}
          maxDistance={120}
          target={targetLookAt.current}
        />
      )}
    </>
  );
};
export default CameraManager;
