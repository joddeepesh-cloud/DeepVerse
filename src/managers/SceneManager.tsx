import React from 'react';
import { CameraManager } from './CameraManager';
import { LightingManager } from './LightingManager';
import { EnvironmentManager } from './EnvironmentManager';
import { PortfolioDistricts } from '../components/City/PortfolioDistricts';
import { RoadGuidance } from '../components/City/RoadGuidance';

export const SceneManager: React.FC = () => {
  return (
    <group name="SceneManager">
      {/* Manages cinematic intro and orbit controls */}
      <CameraManager />

      {/* Handles ambient, directional, and colored point lighting */}
      <LightingManager />

      {/* Orchestrates sky, mountains, roads, buildings, and holograms */}
      <EnvironmentManager />

      {/* Renders the handcrafted interactive portfolio districts */}
      <PortfolioDistricts />

      {/* Renders the futuristic road guidance signs */}
      <RoadGuidance />
    </group>
  );
};
