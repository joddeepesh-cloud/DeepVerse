import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExperience } from '../context/ExperienceContext';
import { useAssetLoader } from '../hooks/useAssetLoader';
import { Shield, Cpu, Activity, Play, Check } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  const { loadingProgress, isLoaded, sceneState, setSceneState, quality, setQuality } = useExperience();
  const { phase, synth } = useAssetLoader();
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(false);

  const logsList = [
    'SYS.CORE_LOAD: quantum_kernel_v4.8.1loaded successfully.',
    'NET.ETHER: socket_mesh connection listening on port 8008.',
    'AUDIO.SYNTH: synthesized pulse oscillator configured (gain: -12dB).',
    'GPU.SHADERS: glsl compiling vertex_hologram & frag_skybox...',
    'GPU.SHADERS: glsl compiling vertex_building_facade...',
    'MEM.ALLOC: 256MB GPU texture buffer allocated.',
    'MATH.PROCEDURAL: generated grid layout: 150 sky_towers, 12 transport_lanes.',
    'ENV.LIGHTING: hdr lightmap coordinates bound, shadow cascade active.',
    'POST_COMP: depth_of_field and volumetric_bloom buffers mapped.',
    'DEEPVERSE.STATUS: System integrity 100% nominal.'
  ];

  // Incrementally render console logs for diagnostic feel
  useEffect(() => {
    if (loadingProgress < 5) return;
    const logIndex = Math.min(Math.floor((loadingProgress / 100) * logsList.length), logsList.length - 1);
    const currentLogs = logsList.slice(0, logIndex + 1);
    setConsoleLogs(currentLogs);
  }, [loadingProgress]);

  const handleEnterClick = () => {
    setHasStarted(true);
    synth.playClick();
    synth.startAmbientHum();
    synth.playWhoosh();
    
    // Brief delay to allow audio/transition triggers
    setTimeout(() => {
      setSceneState('intro');
    }, 200);
  };

  return (
    <AnimatePresence>
      {sceneState === 'loading' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2, ease: 'easeInOut' } }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-between p-8 md:p-16 bg-[#02020a] scanline-effect"
        >
          {/* Header */}
          <div className="w-full max-w-5xl flex items-center justify-between border-b border-[#00f0ff]/20 pb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#00f0ff] animate-pulse" />
              <h1 className="font-['Orbitron'] text-sm md:text-lg font-bold tracking-[0.25em] text-[#00f0ff] glow-text-cyan">
                THE DEEPVERSE // SYSTEM BOOT
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-6 font-['Orbitron'] text-xs text-[#8f9bb3] tracking-widest">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#ff007f]" />
                <span>CORE: v4.8</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#ffaa00]" />
                <span>GPU MAPPED</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Console Panel (Centered) */}
          <div className="w-full max-w-5xl flex-1 flex flex-col md:flex-row gap-6 my-8 items-stretch justify-center">
            
            {/* Terminal Window */}
            <div className="flex-1 glass-panel p-6 font-mono text-[10px] md:text-xs text-[#8f9bb3] overflow-hidden flex flex-col justify-end min-h-[220px]">
              <div className="flex-1 overflow-y-auto pr-2 space-y-1.5 flex flex-col justify-end">
                {consoleLogs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-2 ${idx === consoleLogs.length - 1 ? 'text-[#00f0ff]' : ''}`}
                  >
                    <span className="text-[#ff007f]">❯</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
                {loadingProgress < 100 && (
                  <div className="flex items-center gap-1.5 text-[#00f0ff] font-bold">
                    <span className="animate-ping">■</span>
                    <span>{phase}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quality and Systems Diagnostics */}
            <div className="w-full md:w-[320px] flex flex-col gap-6 justify-between">
              
              {/* Quality Settings Panel */}
              <div className="glass-panel p-6 flex flex-col gap-4">
                <h3 className="font-['Orbitron'] text-xs font-semibold tracking-wider text-[#00f0ff]">
                  GRAPHICS SPECIFICATION
                </h3>
                <p className="text-[11px] text-[#8f9bb3] leading-relaxed">
                  Choose cinematic realism (High spec with bloom & depth effects) or optimal responsiveness (Low spec).
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => { synth.playClick(); setQuality('high'); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-['Orbitron'] text-xs tracking-wider border transition-all duration-300 ${
                      quality === 'high'
                        ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] glow-border-cyan'
                        : 'border-[#4e5566] text-[#8f9bb3] hover:border-[#8f9bb3]'
                    }`}
                  >
                    {quality === 'high' && <Check className="w-3.5 h-3.5" />}
                    CINEMATIC
                  </button>
                  <button
                    onClick={() => { synth.playClick(); setQuality('low'); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-['Orbitron'] text-xs tracking-wider border transition-all duration-300 ${
                      quality === 'low'
                        ? 'bg-[#ff007f]/10 border-[#ff007f] text-[#ff007f]'
                        : 'border-[#4e5566] text-[#8f9bb3] hover:border-[#8f9bb3]'
                    }`}
                  >
                    {quality === 'low' && <Check className="w-3.5 h-3.5" />}
                    RESPONSIVE
                  </button>
                </div>
              </div>

              {/* Status Percentage Panel */}
              <div className="glass-panel p-6 flex flex-col items-center justify-center text-center gap-1">
                <span className="font-['Orbitron'] text-xs tracking-widest text-[#8f9bb3]">LOADING BUFFER</span>
                <span className="font-['Orbitron'] text-5xl font-extrabold tracking-tighter text-white glow-text-cyan">
                  {loadingProgress}%
                </span>
              </div>
            </div>
          </div>

          {/* Footer Action Area */}
          <div className="w-full max-w-5xl flex flex-col items-center gap-6">
            
            {/* Progress Bar (Always visible during loading) */}
            <div className="w-full h-1 bg-[#12122b] rounded-full overflow-hidden relative border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-[#9d00ff] via-[#00f0ff] to-[#ff007f]"
                style={{ width: `${loadingProgress}%` }}
                layoutId="loading-bar"
              />
              {/* Light glow reflection */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#00f0ff] blur-[4px] opacity-70"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            {/* Launch Button Trigger */}
            <div className="h-16 flex items-center justify-center w-full">
              {isLoaded ? (
                <motion.button
                  onClick={handleEnterClick}
                  disabled={hasStarted}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="font-['Orbitron'] font-extrabold text-sm md:text-base tracking-[0.3em] text-[#00f0ff] border border-[#00f0ff] px-10 py-4 rounded bg-[#00f0ff]/5 hover:bg-[#00f0ff]/20 hover:text-white transition-all duration-300 cursor-pointer flex items-center gap-3 shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:shadow-[0_0_50px_rgba(0,240,255,0.5)]"
                >
                  <Play className="w-4 h-4 fill-current text-[#00f0ff]" />
                  ENTER THE DEEPVERSE
                </motion.button>
              ) : (
                <div className="font-['Orbitron'] text-xs md:text-sm tracking-[0.2em] text-[#8f9bb3] animate-pulse">
                  ESTABLISHING CORE SYSTEM SYNC...
                </div>
              )}
            </div>

            <div className="font-mono text-[9px] text-[#4e5566] tracking-wider mt-2">
              DEEPVERSE MATRIX SYSTEM // ALL RIGHTS RESERVED © 2026
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default LoadingScreen;
