import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useExperience } from '../context/ExperienceContext';
import * as THREE from 'three';

export const CameraManager: React.FC = () => {
  const { camera } = useThree();
  const { sceneState, setSceneState, cameraMode, setCameraMode, speed, boostActive, inputs } = useExperience();
  
  // Vectors for target lock and smooth transition interpolations
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentGoalPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 50, 100));

  // Circle angle helper for cinematic/intro sweep
  const introTimer = useRef<number>(0);

  // Monitor key press W to end introduction and begin roaming
  useEffect(() => {
    if (sceneState === 'intro' && inputs.forward) {
      setSceneState('explore');
      setCameraMode('follow');
    }
  }, [inputs.forward, sceneState, setSceneState, setCameraMode]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

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
    
    // Get car yaw (from rotation Y)
    const carYaw = vehicle.rotation.y;

    // 2. STATE MACHINE: CALCULATE CAMERA TARGET POSITION & LOOK-AT VECTOR
    let goalPos = new THREE.Vector3();
    let goalTarget = new THREE.Vector3();
    let lerpSpeed = 0.06; // standard smooth damping

    // Force cinematic circling during intro
    const activeMode = sceneState === 'intro' ? 'cinematic' : cameraMode;

    switch (activeMode) {
      case 'cinematic':
        // Circular sweep around the vehicle
        introTimer.current += dt * 0.22;
        const radius = 10.5;
        goalPos.set(
          carPos.x + Math.sin(introTimer.current) * radius,
          carPos.y + 1.8,
          carPos.z + Math.cos(introTimer.current) * radius
        );
        goalTarget.copy(carPos).add(new THREE.Vector3(0, 0.8, 0));
        lerpSpeed = 0.03; // extra slow glide
        break;

      case 'follow':
        // Behind and above the car
        const followDist = 8.5;
        const followHeight = 3.6;
        // Direction vector opposite of car heading
        goalPos.set(
          carPos.x - Math.sin(carYaw) * followDist,
          carPos.y + followHeight,
          carPos.z - Math.cos(carYaw) * followDist
        );
        goalTarget.copy(carPos).add(new THREE.Vector3(0, 0.8, -1.0)); // look slightly ahead
        lerpSpeed = 0.08;
        break;

      case 'chase':
        // Close, low rear bumper chase view
        const chaseDist = 6.2;
        const chaseHeight = 2.0;
        goalPos.set(
          carPos.x - Math.sin(carYaw) * chaseDist,
          carPos.y + chaseHeight,
          carPos.z - Math.cos(carYaw) * chaseDist
        );
        goalTarget.copy(carPos).add(new THREE.Vector3(0, 0.6, -2.5));
        lerpSpeed = 0.15; // responsive follow
        break;

      case 'driver':
        // Cockpit POV looking forward
        // Apply car matrix to transform local cockpit offset to world coordinates
        const localDriverOffset = new THREE.Vector3(0, 0.72, -0.15);
        goalPos.copy(localDriverOffset).applyMatrix4(vehicle.matrixWorld);

        const localDriverTarget = new THREE.Vector3(0, 0.58, -15.0);
        goalTarget.copy(localDriverTarget).applyMatrix4(vehicle.matrixWorld);
        lerpSpeed = 0.22; // very responsive
        break;

      case 'orbit':
        // Unlocked Orbit controls, but keep orbit targets anchored on the vehicle position
        goalTarget.copy(carPos).add(new THREE.Vector3(0, 1.0, 0));
        break;

      default:
        break;
    }

    // 3. APPLY INTERPOLATION & SHAKE TO CAMERA
    if (activeMode !== 'orbit') {
      // Lerp position towards goal
      currentGoalPos.current.lerp(goalPos, lerpSpeed);
      camera.position.copy(currentGoalPos.current);

      // Speed-dependent camera shake in chase/follow view
      if ((activeMode === 'chase' || activeMode === 'follow') && speed > 20) {
        const shakeScale = (speed / 170) * (boostActive ? 0.08 : 0.035);
        camera.position.x += (Math.random() - 0.5) * shakeScale;
        camera.position.y += (Math.random() - 0.5) * shakeScale;
        camera.position.z += (Math.random() - 0.5) * shakeScale;
      }

      // Lerp look-at target
      targetLookAt.current.lerp(goalTarget, lerpSpeed + 0.02);
      camera.lookAt(targetLookAt.current);
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
