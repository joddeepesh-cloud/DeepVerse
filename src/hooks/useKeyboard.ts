import { useEffect } from 'react';
import { useExperience, type DrivingInputs } from '../context/ExperienceContext';

export const useKeyboard = () => {
  const {
    setInputs,
    setCameraMode,
    autoExploreActive,
    autoExploreState,
    setAutoExploreState
  } = useExperience();

  useEffect(() => {
    const keyMap: Record<string, keyof DrivingInputs> = {
      KeyW: 'forward',
      ArrowUp: 'forward',
      KeyS: 'backward',
      ArrowDown: 'backward',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
      Space: 'brake',
      ShiftLeft: 'boost',
      ShiftRight: 'boost',
      KeyR: 'reset',
      KeyC: 'cameraChange',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Overriding Space key for pausing/resuming autopilot tour
      if (e.code === 'Space' && autoExploreActive) {
        e.preventDefault();
        setAutoExploreState(autoExploreState === 'driving' ? 'manually_paused' : 'driving');
        return;
      }

      const inputName = keyMap[e.code];
      if (!inputName) return;

      // Handle edge triggers (camera mode change)
      if (inputName === 'cameraChange') {
        e.preventDefault();
        
        // Cycle cameras: follow -> chase -> driver -> orbit -> follow (skip cinematic during roam)
        setCameraMode((current) => {
          const order: typeof current[] = ['follow', 'chase', 'driver', 'orbit', 'drone'];
          const idx = order.indexOf(current);
          const nextIdx = (idx + 1) % order.length;
          return order[nextIdx];
        });
        return;
      }

      setInputs((prev) => ({
        ...prev,
        [inputName]: true,
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const inputName = keyMap[e.code];
      if (!inputName) return;

      setInputs((prev) => ({
        ...prev,
        [inputName]: false,
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setInputs, setCameraMode, autoExploreActive, autoExploreState, setAutoExploreState]);
};
export default useKeyboard;
