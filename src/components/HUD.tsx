import React, { useState, useEffect, useRef } from 'react';
import { useExperience } from '../context/ExperienceContext';
import { Shield } from 'lucide-react';

export const HUD: React.FC = () => {
  const {
    sceneState,
    cameraMode,
    setCameraMode,
    speed,
    rpm,
    boostActive,
    hasDriven,
    setInputs
  } = useExperience();

  // FPS calculations
  const [fps, setFps] = useState<number>(60);
  const lastTime = useRef<number>(performance.now());
  const frames = useRef<number>(0);

  // Car positions tracking for the minimap
  const [carCoords, setCarCoords] = useState({ x: 0, z: 25 });
  const mapScale = 0.55; // maps 3D coordinate space to 100px minimap range

  // Touch states for mobile virtual joystick
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // 1. FPS Tracker loop
    const updateFps = () => {
      const now = performance.now();
      frames.current++;
      if (now >= lastTime.current + 1000) {
        setFps(Math.round((frames.current * 1000) / (now - lastTime.current)));
        frames.current = 0;
        lastTime.current = now;
      }
      requestAnimationFrame(updateFps);
    };
    const animId = requestAnimationFrame(updateFps);

    // 2. Poll vehicle position from Three.js scene to sync minimap dot
    const pollInterval = setInterval(() => {
      const root = document.getElementById('canvas-container');
      if (!root) return;
      // We can query custom attributes or simply access the global canvas object
      // But a cleaner way in R3F is that the vehicle itself updates its coords,
      // or we query the scene directly by looking up the document object
      const canvas = root.querySelector('canvas');
      if (!canvas) return;
      
      // Let's grab the actual global state we store in window (simple runtime hook)
      // or retrieve it via the scene. Since window is globally accessible, 
      // let's have the Vehicle write its position to window so HUD can pull it without re-rendering!
      // This is a classic 60FPS high-speed polling trick.
      const win = window as any;
      if (win.carPosition) {
        setCarCoords({
          x: win.carPosition.x,
          z: win.carPosition.z
        });
      }
    }, 100);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(pollInterval);
    };
  }, []);

  // Update window positions globally
  // We'll write this into Vehicle.tsx later: window.carPosition = pos.current;

  // Handle Mobile Virtual Steering Joystick Touch
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    joystickStart.current = { x: touch.clientX, y: touch.clientY };
    setJoystickActive(true);
    setJoystickPos({ x: 0, y: 0 });
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickActive) return;
    e.preventDefault();
    const touch = e.touches[0];
    
    // Calculate displacement
    const dx = touch.clientX - joystickStart.current.x;
    const dy = touch.clientY - joystickStart.current.y;
    
    // Clamp to max radius of 40px
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 40;
    
    let clampedX = dx;
    let clampedY = dy;
    if (distance > maxRadius) {
      clampedX = (dx / distance) * maxRadius;
      clampedY = (dy / distance) * maxRadius;
    }
    
    setJoystickPos({ x: clampedX, y: clampedY });

    // Map steering input: left/right threshold of 10px
    setInputs((prev) => ({
      ...prev,
      left: clampedX < -10,
      right: clampedX > 10,
    }));
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    setInputs((prev) => ({
      ...prev,
      left: false,
      right: false,
    }));
  };

  // Switch camera trigger
  const handleCameraCycle = () => {
    const order: typeof cameraMode[] = ['follow', 'chase', 'driver', 'orbit'];
    const idx = order.indexOf(cameraMode);
    const nextIdx = (idx + 1) % order.length;
    setCameraMode(order[nextIdx]);
    
    // play click SFX
    const win = window as any;
    if (win.synthClick) win.synthClick();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-4 md:p-8 font-sans">
      
      {/* 1. TOP STATS BAR */}
      <div className="w-full flex justify-between items-start">
        
        {/* Mission Status Widget */}
        <div className="glass-panel px-4 py-3 border-[#00f0ff]/20 flex items-center gap-3">
          <Shield className="w-4 h-4 text-[#00f0ff] animate-pulse" />
          <div className="flex flex-col">
            <span className="font-['Orbitron'] text-[10px] font-extrabold tracking-widest text-[#00f0ff]">
              MISSION OBJECTIVE
            </span>
            <span className="font-mono text-xs text-white uppercase tracking-wider mt-0.5">
              {sceneState === 'intro' 
                ? 'SYSTEM BOOT ACTIVE' 
                : !hasDriven 
                  ? 'PRESS W TO DRIVE / EXPLORE' 
                  : 'EXPLORING CITY CORE'}
            </span>
          </div>
        </div>

        {/* Dashboard Status */}
        <div className="glass-panel px-4 py-3 border-[#ff007f]/25 text-[10px] font-mono text-[#8f9bb3] flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-ping" />
            <span>SYS: READY</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <span>FPS: {fps}</span>
        </div>
      </div>

      {/* 2. CENTER STAGE GAMEPLAY INSTRUCTIONS */}
      {sceneState === 'explore' && !hasDriven && (
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 flex flex-col items-center justify-center text-center max-w-[450px]">
          <h2 className="font-['Orbitron'] text-[#00f0ff] text-xl font-black tracking-[0.25em] glow-text-cyan animate-pulse">
            MISSION STARTED
          </h2>
          <p className="font-['Orbitron'] text-white text-xs tracking-wider uppercase mt-2">
            Explore Deepesh's Journey
          </p>
          <div className="mt-6 glass-panel px-6 py-3 border-[#ff007f]/25 text-xs text-[#ff007f] font-bold tracking-widest flex items-center gap-2">
            <span>[ PRESS W TO ACCELERATE ]</span>
          </div>
        </div>
      )}

      {/* 3. BOTTOM TELEMETRY HUDS (Speedometer & Minimap) */}
      <div className="w-full flex justify-between items-end gap-6">
        
        {/* Speedometer Widget (Bottom Left) */}
        <div className="glass-panel p-5 border-[#00f0ff]/15 flex items-end gap-4 min-w-[200px] pointer-events-auto">
          <div className="relative w-16 h-16 flex items-center justify-center border-2 border-dashed border-[#00f0ff]/20 rounded-full">
            {/* Pulsating background ring */}
            <div className="absolute inset-1 border border-white/5 rounded-full" />
            <span className="font-['Orbitron'] text-2xl font-black text-white leading-none">
              {speed}
            </span>
          </div>
          <div className="flex flex-col justify-end">
            <span className="font-['Orbitron'] text-[9px] font-bold tracking-widest text-[#8f9bb3]">TELEMETRY</span>
            <span className="font-['Orbitron'] text-xs font-semibold text-[#00f0ff] glow-text-cyan mt-0.5">
              KM/H
            </span>
            <span className="font-mono text-[9px] text-[#4e5566] mt-1.5 uppercase">
              RPM: {Math.round(rpm)}
            </span>
            <span className={`font-mono text-[9px] font-bold mt-0.5 ${boostActive ? 'text-[#ff007f]' : 'text-[#4e5566]'}`}>
              BOOST: {boostActive ? 'ACTIVE' : 'READY'}
            </span>
          </div>
        </div>

        {/* Minimap Widget (Bottom Right) */}
        <div className="glass-panel p-4 border-white/5 flex flex-col gap-2 min-w-[150px] items-center text-center">
          <span className="font-['Orbitron'] text-[9px] tracking-widest text-[#8f9bb3]">GPS MINIMAP</span>
          
          {/* Radar-like circular minimap */}
          <div className="relative w-24 h-24 bg-black/40 rounded-full border border-[#00f0ff]/15 overflow-hidden flex items-center justify-center">
            {/* Grid crosshair */}
            <div className="absolute w-full h-px bg-white/5" />
            <div className="absolute h-full w-px bg-white/5" />
            <div className="absolute w-16 h-16 border border-dashed border-white/5 rounded-full" />
            <div className="absolute w-8 h-8 border border-dashed border-white/5 rounded-full" />
            
            {/* Flashing center point */}
            <div className="absolute w-1 h-1 bg-[#ff007f] rounded-full" />
            
            {/* Moving Car Dot */}
            <div
              className="absolute w-2 h-2 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff] animate-pulse"
              style={{
                transform: `translate(${carCoords.x * mapScale}px, ${carCoords.z * mapScale}px)`
              }}
            />
          </div>
          
          <span className="font-mono text-[9px] text-[#4e5566] mt-1">
            X: {Math.round(carCoords.x)} // Z: {Math.round(carCoords.z)}
          </span>
        </div>
      </div>

      {/* 4. MOBILE VIRTUAL CONTROLS OVERLAY */}
      {/* Absolute overlay that binds touch controls, visible on mobile sizes (<768px) */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none flex flex-col justify-end p-4 md:hidden">
        
        {/* Row for steering and throttle pedals */}
        <div className="w-full flex justify-between items-end pointer-events-auto h-32">
          
          {/* Left Joystick Area */}
          <div
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            className="w-24 h-24 bg-black/60 border border-white/10 rounded-full flex items-center justify-center touch-none relative select-none"
          >
            {/* Center handle knob */}
            <div
              className="w-10 h-10 bg-[#00f0ff]/20 border-2 border-[#00f0ff] rounded-full absolute shadow-[0_0_10px_#00f0ff]"
              style={{
                transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
              }}
            />
          </div>

          {/* Right Action buttons */}
          <div className="flex gap-4">
            
            {/* Brake / Reverse (S key equivalent) */}
            <button
              onTouchStart={() => setInputs((p) => ({ ...p, backward: true }))}
              onTouchEnd={() => setInputs((p) => ({ ...p, backward: false }))}
              className="w-16 h-16 bg-[#ff007f]/10 border border-[#ff007f]/40 rounded-full font-['Orbitron'] text-xs font-bold text-[#ff007f] active:bg-[#ff007f]/30 active:scale-95 transition-all select-none"
            >
              BRAKE
            </button>

            {/* Throttle (W key equivalent) */}
            <button
              onTouchStart={() => setInputs((p) => ({ ...p, forward: true }))}
              onTouchEnd={() => setInputs((p) => ({ ...p, forward: false }))}
              className="w-16 h-16 bg-[#00f0ff]/10 border border-[#00f0ff]/40 rounded-full font-['Orbitron'] text-xs font-bold text-[#00f0ff] active:bg-[#00f0ff]/30 active:scale-95 transition-all select-none"
            >
              DRIVE
            </button>
          </div>
        </div>

        {/* Row for extra controls (Camera cycle, Boost, Reset) */}
        <div className="w-full flex justify-center gap-3 mt-4 pointer-events-auto pb-4">
          <button
            onClick={handleCameraCycle}
            className="px-3 py-1.5 rounded glass-panel border border-[#00f0ff]/20 text-[9px] font-['Orbitron'] font-bold text-[#00f0ff] select-none"
          >
            CAM: {cameraMode.toUpperCase()}
          </button>
          <button
            onTouchStart={() => setInputs((p) => ({ ...p, boost: true }))}
            onTouchEnd={() => setInputs((p) => ({ ...p, boost: false }))}
            className="px-3 py-1.5 rounded glass-panel border border-[#ff007f]/20 text-[9px] font-['Orbitron'] font-bold text-[#ff007f] select-none"
          >
            BOOST
          </button>
          <button
            onClick={() => setInputs((p) => ({ ...p, reset: true }))}
            className="px-3 py-1.5 rounded glass-panel border border-[#ffaa00]/20 text-[9px] font-['Orbitron'] font-bold text-[#ffaa00] select-none"
          >
            RESET
          </button>
        </div>
      </div>

    </div>
  );
};
export default HUD;
