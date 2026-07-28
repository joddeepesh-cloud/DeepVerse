import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type SceneState = 'loading' | 'intro' | 'explore';
export type QualityMode = 'low' | 'high';
export type CameraMode = 'follow' | 'chase' | 'driver' | 'orbit' | 'cinematic' | 'drone';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DrivingInputs {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  boost: boolean;
  reset: boolean;
  cameraChange: boolean;
}

interface ExperienceContextType {
  loadingProgress: number;
  isLoaded: boolean;
  sceneState: SceneState;
  quality: QualityMode;
  cameraMode: CameraMode;
  speed: number;
  rpm: number;
  boostActive: boolean;
  hasDriven: boolean;
  inputs: DrivingInputs;
  autoExploreActive: boolean;
  autoExploreIndex: number;
  autoExploreState: 'driving' | 'paused' | 'manually_paused' | 'finished';
  autoExploreDirection: 'forward' | 'backward';
  themeMode: 'day' | 'night';
  deviceType: DeviceType;
  setLoadingProgress: (progress: number) => void;
  setIsLoaded: (isLoaded: boolean) => void;
  setSceneState: (state: SceneState) => void;
  setQuality: (quality: QualityMode) => void;
  setCameraMode: React.Dispatch<React.SetStateAction<CameraMode>>;
  setSpeed: (speed: number) => void;
  setRpm: (rpm: number) => void;
  setBoostActive: (active: boolean) => void;
  setHasDriven: (driven: boolean) => void;
  setInputs: React.Dispatch<React.SetStateAction<DrivingInputs>>;
  setAutoExploreActive: (active: boolean) => void;
  setAutoExploreIndex: (index: number) => void;
  setAutoExploreState: (state: 'driving' | 'paused' | 'manually_paused' | 'finished') => void;
  setAutoExploreDirection: (dir: 'forward' | 'backward') => void;
  setThemeMode: (mode: 'day' | 'night') => void;
}

const defaultInputs: DrivingInputs = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  brake: false,
  boost: false,
  reset: false,
  cameraChange: false,
};

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export const ExperienceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [sceneState, setSceneState] = useState<SceneState>('loading');
  const [quality, setQuality] = useState<QualityMode>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) return 'low';
    }
    return 'high';
  });
  const [cameraMode, setCameraMode] = useState<CameraMode>('cinematic'); // starts circling during introduction
  const [speed, setSpeed] = useState<number>(0);
  const [rpm, setRpm] = useState<number>(800); // idling rpm
  const [boostActive, setBoostActive] = useState<boolean>(false);
  const [hasDriven, setHasDriven] = useState<boolean>(false);
  const [inputs, setInputs] = useState<DrivingInputs>(defaultInputs);
  const [autoExploreActive, setAutoExploreActive] = useState<boolean>(false);
  const [autoExploreIndex, setAutoExploreIndex] = useState<number>(-1);
  const [autoExploreState, setAutoExploreState] = useState<'driving' | 'paused' | 'manually_paused' | 'finished'>('driving');
  const [autoExploreDirection, setAutoExploreDirection] = useState<'forward' | 'backward'>('forward');
  const [themeMode, setThemeMode] = useState<'day' | 'night'>('night');
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width >= 768 && width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ExperienceContext.Provider
      value={{
        loadingProgress,
        isLoaded,
        sceneState,
        quality,
        cameraMode,
        speed,
        rpm,
        boostActive,
        hasDriven,
        inputs,
        autoExploreActive,
        autoExploreIndex,
        autoExploreState,
        autoExploreDirection,
        themeMode,
        deviceType,
        setLoadingProgress,
        setIsLoaded,
        setSceneState,
        setQuality,
        setCameraMode,
        setSpeed,
        setRpm,
        setBoostActive,
        setHasDriven,
        setInputs,
        setAutoExploreActive,
        setAutoExploreIndex,
        setAutoExploreState,
        setAutoExploreDirection,
        setThemeMode,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = (): ExperienceContextType => {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
};
export default ExperienceContext;
