import React from 'react';
import { ExperienceProvider } from './context/ExperienceContext';
import { CanvasContainer } from './components/CanvasContainer';
import { LoadingScreen } from './components/LoadingScreen';
import { HUD } from './components/HUD';
import { useKeyboard } from './hooks/useKeyboard';

const ExperienceApp: React.FC = () => {
  // Bind global keyboard event listeners
  useKeyboard();

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#03030d]">
      
      {/* 3D WebGL Canvas Layer */}
      <CanvasContainer />

      {/* Cinematic Loading Boot Overlay */}
      <LoadingScreen />

      {/* Game Telemetry HUD Overlay (Speedometer, GPS, Mini-map, Mobile Joysticks) */}
      <HUD />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ExperienceProvider>
      <ExperienceApp />
    </ExperienceProvider>
  );
};

export default App;
