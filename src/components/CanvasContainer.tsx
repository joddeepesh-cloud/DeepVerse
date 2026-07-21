import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useExperience } from '../context/ExperienceContext';
import { SceneManager } from '../managers/SceneManager';
import { Loader } from '@react-three/drei';

export const CanvasContainer: React.FC = () => {
  const { quality } = useExperience();

  return (
    <div className="w-full h-full relative" id="canvas-container">
      <Canvas
        shadows
        gl={{
          antialias: quality === 'high',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true
        }}
        camera={{
          position: [60, 150, 180],
          fov: 60,
          near: 0.1,
          far: 400
        }}
      >
        {/* Dark background clear color */}
        <color attach="background" args={['#03030d']} />

        <Suspense fallback={null}>
          <SceneManager />
        </Suspense>

        {/* Dynamic Post-processing based on graphic specification */}
        {quality === 'high' && (
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={1.2}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.7}
              height={300}
            />
          </EffectComposer>
        )}
      </Canvas>

      {/* Standard Drei loading bar indicator as fallback */}
      <Loader
        containerStyles={{ background: '#02020a' }}
        innerStyles={{ background: '#4e5566' }}
        barStyles={{ background: '#00f0ff' }}
        dataStyles={{ color: '#00f0ff', fontFamily: 'Orbitron' }}
      />
    </div>
  );
};
export default CanvasContainer;
