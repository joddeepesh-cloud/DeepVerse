import React, { useState, useEffect, useRef } from 'react';
import { useExperience, type CameraMode } from '../context/ExperienceContext';
import { Shield, Compass } from 'lucide-react';
import * as THREE from 'three';
import { WAYPOINTS } from './City/Vehicle';

interface TourDistrictData {
  title: string;
  subtitle: string;
  achievements: string[];
  buttonText?: string;
  buttonUrl?: string;
}

const DISTRICT_DATA: Record<number, TourDistrictData> = {
  1: {
    title: "About Me District",
    subtitle: "Deepesh Joshi // Profile",
    achievements: [
      "Second Year B.Tech Computer Science student",
      "Creative Full Stack & Graphics Developer",
      "Active participant in tech hackathons & sprints"
    ]
  },
  2: {
    title: "Skills Street",
    subtitle: "Developer Toolkit // Tech Stack",
    achievements: [
      "Languages: TypeScript, JavaScript, Python, C++",
      "Frameworks: React, Next.js, Vite, Three.js / Fiber",
      "Tools: Git, GitHub Actions, custom GLSL shaders, Blender"
    ],
    buttonText: "VIEW LINKEDIN",
    buttonUrl: "https://www.linkedin.com/in/deepesh-joshi-726317402?utm_source=share_via&utm_content=profile&utm_medium=member_android"
  },
  3: {
    title: "Experience Boulevard",
    subtitle: "Milestones // Contributions",
    achievements: [
      "Contributor to Matplotlib & SciPy libraries",
      "Contributor to pandas & pytest core codebases",
      "Active open-source developer with GSoC proposal experience"
    ]
  },
  4: {
    title: "Projects District",
    subtitle: "Featured Applications // Interactive",
    achievements: [
      "DeepVerse: Procedural 3D WebGL Portfolio world",
      "Built Cross-Modal Satellite Image Retrieval System",
      "Developed high-performance full-stack web applications"
    ],
    buttonText: "VIEW PROJECTS",
    buttonUrl: "https://github.com/joddeepesh-cloud"
  },
  5: {
    title: "Future Vision Tower",
    subtitle: "Next Frontiers // Advanced Graphics",
    achievements: [
      "Expanding research into WebGPU and advanced graphics rendering",
      "Tackling complex engineering challenges in open-source systems",
      "Developing next-generation interactive web canvas layouts"
    ]
  },
  6: {
    title: "Open Source Avenue",
    subtitle: "Community Collaboration // PRs",
    achievements: [
      "Committed to public code contributions and transparency",
      "Multiple merged Pull Requests in open-source repositories",
      "Practicing professional Git and collaborative developer workflows"
    ]
  },
  7: {
    title: "GitHub Tower",
    subtitle: "Automated Workflows // Badges",
    achievements: [
      "Pull Shark 🦈 badge earned on GitHub profile",
      "YOLO 🎉 badge earned on GitHub profile",
      "Active developer portfolio with public repositories"
    ],
    buttonText: "VIEW GITHUB",
    buttonUrl: "https://github.com/joddeepesh-cloud"
  },
  8: {
    title: "Contact Hub",
    subtitle: "Get In Touch // Collabs",
    achievements: [
      "Email: joddeepesh@gmail.com",
      "LinkedIn: linkedin.com/in/deepesh-joshi-726317402",
      "GitHub: github.com/joddeepesh-cloud"
    ],
    buttonText: "SEND EMAIL",
    buttonUrl: "mailto:joddeepesh@gmail.com"
  },
  9: {
    title: "Certifications Hall",
    subtitle: "Credentials // Core Training",
    achievements: [
      "Pursuing B.Tech Computer Science Engineering",
      "Self-taught Three.js rendering and shader architecture",
      "Verified public open-source Git commits"
    ]
  },
  10: {
    title: "Hackathon Arena",
    subtitle: "Rapid Prototyping // Sprints",
    achievements: [
      "Active participant in developer hackathons",
      "Designing and building functional MVPs in fast-paced teams",
      "Experienced in solving technical tasks under time limits"
    ]
  }
};

const cameraOptions: { mode: CameraMode; label: string }[] = [
  { mode: 'follow', label: 'Follow' },
  { mode: 'chase', label: 'Chase' },
  { mode: 'cinematic', label: 'Cinematic' },
  { mode: 'drone', label: 'Drone' },
  { mode: 'driver', label: 'Dashboard' },
  { mode: 'orbit', label: 'Orbit' },
];

export const HUD: React.FC = () => {
  const {
    sceneState,
    cameraMode,
    setCameraMode,
    speed,
    rpm,
    boostActive,
    hasDriven,
    setInputs,
    autoExploreActive,
    autoExploreIndex,
    autoExploreState,
    autoExploreDirection,
    setAutoExploreActive,
    setAutoExploreIndex,
    setAutoExploreState,
    setAutoExploreDirection,
    themeMode,
    setThemeMode
  } = useExperience();

  // FPS and notification states
  const [fps, setFps] = useState<number>(60);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const lastTime = useRef<number>(performance.now());
  const frames = useRef<number>(0);

  // Discovery and manual details states
  const [detectedDistrictIndex, setDetectedDistrictIndex] = useState<number>(-1);
  const [manualOpenDetailsIndex, setManualOpenDetailsIndex] = useState<number>(-1);
  const [discoveredDistricts, setDiscoveredDistricts] = useState<number[]>([]);

  // Sync discovery state with auto-explore indexing
  useEffect(() => {
    if (autoExploreActive && autoExploreIndex >= 1 && autoExploreIndex <= 10) {
      if (!discoveredDistricts.includes(autoExploreIndex)) {
        setDiscoveredDistricts((prev) => [...prev, autoExploreIndex]);
      }
    }
  }, [autoExploreActive, autoExploreIndex, discoveredDistricts]);

  // Car positions tracking for the minimap
  const [carCoords, setCarCoords] = useState({ x: 0, z: 25 });
  const mapScale = 0.55;

  // Touch states for mobile virtual joystick
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickStart = useRef({ x: 0, y: 0 });

  // Determine currently active camera mode for UI highlight (including Auto Explore transition cuts)
  let activeHighlight: CameraMode = cameraMode;
  if (autoExploreActive) {
    if (autoExploreState === 'paused') {
      activeHighlight = 'cinematic';
    } else if (autoExploreIndex >= 0 && autoExploreIndex < WAYPOINTS.length) {
      let startPos: THREE.Vector3;
      let endPos: THREE.Vector3;
      if (autoExploreDirection === 'forward') {
        const prevWaypoint = WAYPOINTS[autoExploreIndex === 0 ? 0 : autoExploreIndex - 1];
        const nextWaypoint = WAYPOINTS[autoExploreIndex];
        startPos = prevWaypoint.position;
        endPos = nextWaypoint.position;
      } else {
        const nextWaypoint = WAYPOINTS[autoExploreIndex + 1];
        const currentWaypoint = WAYPOINTS[autoExploreIndex];
        startPos = nextWaypoint.position;
        endPos = currentWaypoint.position;
      }

      const start2D = new THREE.Vector2(startPos.x, startPos.z);
      const end2D = new THREE.Vector2(endPos.x, endPos.z);
      const car2D = new THREE.Vector2(carCoords.x, carCoords.z);
      const totalLen = start2D.distanceTo(end2D);
      let t = 0;
      if (totalLen > 0.001) {
        const toCar = car2D.clone().sub(start2D);
        const lineDir = end2D.clone().sub(start2D).normalize();
        t = THREE.MathUtils.clamp(toCar.dot(lineDir) / totalLen, 0, 1);
      }
      if (totalLen > 35) {
        if (t < 0.25) activeHighlight = 'follow';
        else if (t < 0.7) activeHighlight = 'drone';
        else activeHighlight = 'chase';
      } else {
        activeHighlight = 'follow';
      }
    }
  }

  const selectCameraMode = (mode: CameraMode) => {
    if (autoExploreActive) {
      setAutoExploreActive(false);
      setAutoExploreIndex(-1);
      setAutoExploreState('driving');
      setAutoExploreDirection('forward');
    }
    setCameraMode(mode);
    const win = window as any;
    if (win.synthClick) win.synthClick();
  };

  // Auto explore navigation controls handlers
  const handlePrevDistrict = () => {
    if (!autoExploreActive) return;
    if (autoExploreState === 'paused' || autoExploreState === 'manually_paused') {
      if (autoExploreIndex > 1) {
        setAutoExploreIndex(autoExploreIndex - 1);
        setAutoExploreDirection('backward');
        setAutoExploreState('driving');
      }
    } else {
      setAutoExploreDirection('backward');
    }
    const win = window as any;
    if (win.synthClick) win.synthClick();
  };

  const handleNextDistrict = () => {
    if (!autoExploreActive) return;
    if (autoExploreIndex < WAYPOINTS.length - 2) {
      setAutoExploreIndex(autoExploreIndex + 1);
      setAutoExploreDirection('forward');
      setAutoExploreState('driving');
    }
    const win = window as any;
    if (win.synthClick) win.synthClick();
  };

  const handlePauseTour = () => {
    setAutoExploreState('manually_paused');
    const win = window as any;
    if (win.synthClick) win.synthClick();
  };

  const handleResumeTour = () => {
    setAutoExploreState('driving');
    const win = window as any;
    if (win.synthClick) win.synthClick();
  };

  const handleStopTour = () => {
    setAutoExploreActive(false);
    setAutoExploreIndex(-1);
    setAutoExploreState('driving');
    setAutoExploreDirection('forward');
    const win = window as any;
    if (win.synthClick) win.synthClick();
  };

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
      
      const win = window as any;
      if (win.carPosition) {
        const x = win.carPosition.x;
        const z = win.carPosition.z;
        setCarCoords({ x, z });
        
        // Proximity detection for manual discovery mode
        if (!autoExploreActive && sceneState === 'explore') {
          let nearestIdx = -1;
          for (let i = 1; i <= 10; i++) {
            const wp = WAYPOINTS[i];
            if (!wp) continue;
            const dist = Math.sqrt((x - wp.position.x) ** 2 + (z - wp.position.z) ** 2);
            if (dist < 14.0) { // 14 units detection zone
              nearestIdx = i;
              break;
            }
          }
          setDetectedDistrictIndex(nearestIdx);
        }
      }
    }, 100);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(pollInterval);
    };
  }, [autoExploreActive, sceneState]);

  // Repositioned welcome notification card timer: runs only after exploring starts
  useEffect(() => {
    if (sceneState !== 'explore') return;

    const welcomeTimer = setTimeout(() => {
      setShowWelcome(true);
    }, 1000);

    const welcomeDismissTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 10000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(welcomeDismissTimer);
    };
  }, [sceneState]);

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
    
    const dx = touch.clientX - joystickStart.current.x;
    const dy = touch.clientY - joystickStart.current.y;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 40;
    
    let clampedX = dx;
    let clampedY = dy;
    if (distance > maxRadius) {
      clampedX = (dx / distance) * maxRadius;
      clampedY = (dy / distance) * maxRadius;
    }
    
    setJoystickPos({ x: clampedX, y: clampedY });

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

  // Toggle Auto Explore Mode
  const handleAutoExploreToggle = () => {
    const nextState = !autoExploreActive;
    setAutoExploreActive(nextState);
    if (nextState) {
      setAutoExploreIndex(1); // start at About Me
      setAutoExploreState('driving');
      setAutoExploreDirection('forward');
    } else {
      setAutoExploreIndex(-1);
      setAutoExploreDirection('forward');
      setAutoExploreState('driving');
    }
    
    const win = window as any;
    if (win.synthClick) win.synthClick();
  };

  // Toggle Day/Night theme
  const handleThemeToggle = () => {
    const nextTheme = themeMode === 'night' ? 'day' : 'night';
    setThemeMode(nextTheme);
    
    const win = window as any;
    if (win.synthClick) win.synthClick();
  };

  const currentDistrict = DISTRICT_DATA[autoExploreIndex];

  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-4 md:p-8 font-sans select-none">
      
      {/* Onboarding Guidance Overlay */}
      {sceneState === 'intro' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 pointer-events-auto">
          <div className="glass-panel p-6 md:p-8 border-[#00f0ff]/40 bg-black/90 shadow-[0_0_40px_rgba(0,240,255,0.25)] max-w-md w-full relative overflow-hidden animate-slide-in flex flex-col gap-4 text-center">
            {/* Cyberpunk corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00f0ff]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00f0ff]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00f0ff]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00f0ff]" />

            <div className="flex flex-col gap-1.5 items-center">
              <span role="img" aria-label="car" className="text-2xl animate-bounce">🚗</span>
              <h2 className="font-['Orbitron'] text-lg md:text-xl font-black text-white tracking-[0.15em] uppercase mt-1">
                Welcome to DeepVerse
              </h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent my-2" />
            </div>

            <p className="font-mono text-xs text-[#00f0ff] leading-relaxed font-bold animate-pulse">
              Press <span className="px-2 py-1 bg-[#00f0ff]/10 border border-[#00f0ff] rounded text-white font-sans text-sm mx-1 shadow-[0_0_8px_rgba(0,240,255,0.4)]">W</span> to start driving.
            </p>
            
            <p className="font-mono text-[10px] text-[#8f9bb3] leading-relaxed">
              Once you're moving, the full interface and controls will automatically appear.
            </p>

            <div className="border-t border-white/10 pt-4 mt-2">
              <span className="font-['Orbitron'] text-[9px] font-black tracking-widest text-[#ff007f] block mb-3 uppercase">
                Controls Preview
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left font-mono text-[10px] text-[#b0bacf] max-w-[320px] mx-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[#00f0ff] font-bold w-12 text-right">⬆ W</span>
                  <span className="text-white/80">➔ Accelerate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00f0ff] font-bold w-12 text-right">⬇ S</span>
                  <span className="text-white/80">➔ Reverse</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00f0ff] font-bold w-12 text-right">⬅ A</span>
                  <span className="text-white/80">➔ Turn Left</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#00f0ff] font-bold w-12 text-right">➡ D</span>
                  <span className="text-white/80">➔ Turn Right</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2 mt-1 border-t border-white/5 pt-2 flex-wrap justify-between">
                  <div className="flex items-center gap-1">
                    <span role="img" aria-label="camera" className="text-xs">📷</span>
                    <span className="text-white/60">Camera</span>
                    <span className="text-white/80">➔ Change view</span>
                  </div>
                  <div className="flex items-center gap-1 flex-nowrap">
                    <span role="img" aria-label="compass" className="text-xs">🚀</span>
                    <span className="text-white/60">Auto Tour</span>
                    <span className="text-white/80">➔ Guided</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP STATS BAR */}
      <div className="w-full flex flex-col md:flex-row justify-between items-stretch md:items-start gap-4">
        
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
                : autoExploreActive
                  ? `AUTOPILOT TOUR ACTIVE [${autoExploreIndex}/10]`
                  : !hasDriven 
                    ? 'PRESS W TO DRIVE / EXPLORE' 
                    : 'EXPLORING CITY CORE'}
            </span>
          </div>
        </div>

        {/* Large Centered Auto Explore Button / Autopilot Control Bar */}
        {sceneState === 'explore' && (
          <div className="pointer-events-auto flex items-center gap-2 bg-black/80 border border-[#00f0ff]/20 p-1.5 rounded shadow-[0_0_20px_rgba(0,240,255,0.15)]">
            {!autoExploreActive ? (
              <button
                onClick={handleAutoExploreToggle}
                className="px-5 py-2.5 bg-[#00f0ff]/10 border border-[#00f0ff]/40 hover:bg-[#00f0ff]/25 hover:scale-105 text-[#00f0ff] font-['Orbitron'] text-xs font-black tracking-[0.2em] rounded transition-all duration-300 flex items-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
              >
                <Compass className="w-3.5 h-3.5 text-[#00f0ff]" />
                AUTO EXPLORE
              </button>
            ) : (
              <div className="flex items-center gap-1 md:gap-2">
                <div className="hidden lg:flex flex-col items-start px-2 font-mono text-[9px] text-[#8f9bb3] uppercase tracking-wider">
                  <span className="text-[#00f0ff] font-bold">AUTOPILOT</span>
                  <span>DISTRICT {autoExploreIndex}/10</span>
                </div>
                
                <button
                  onClick={handlePrevDistrict}
                  title="Previous District"
                  disabled={autoExploreIndex <= 1 && (autoExploreState === 'paused' || autoExploreState === 'manually_paused')}
                  className="px-3 py-2 bg-[#00f0ff]/5 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 hover:border-[#00f0ff] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-[#00f0ff]/30 text-[#00f0ff] font-bold text-xs rounded transition-all select-none flex items-center justify-center gap-1.5 min-h-[32px]"
                >
                  ⏮ <span className="hidden sm:inline font-['Orbitron'] text-[9px] tracking-wider">PREV</span>
                </button>

                {autoExploreState === 'driving' ? (
                  <button
                    onClick={handlePauseTour}
                    title="Pause Tour"
                    className="px-4 py-2 bg-[#ffaa00]/10 hover:bg-[#ffaa00]/25 border border-[#ffaa00]/40 hover:border-[#ffaa00] text-[#ffaa00] font-bold text-xs rounded transition-all select-none flex items-center justify-center gap-1.5 min-h-[32px]"
                  >
                    ⏸ <span className="hidden sm:inline font-['Orbitron'] text-[9px] tracking-wider">PAUSE</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResumeTour}
                    title="Resume Tour"
                    className="px-4 py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/25 border border-[#00f0ff]/40 hover:border-[#00f0ff] text-[#00f0ff] font-bold text-xs rounded transition-all select-none flex items-center justify-center gap-1.5 min-h-[32px]"
                  >
                    ▶️ <span className="hidden sm:inline font-['Orbitron'] text-[9px] tracking-wider">PLAY</span>
                  </button>
                )}

                <button
                  onClick={handleNextDistrict}
                  title="Next District"
                  disabled={autoExploreIndex >= WAYPOINTS.length - 2}
                  className="px-3 py-2 bg-[#00f0ff]/5 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 hover:border-[#00f0ff] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-[#00f0ff]/30 text-[#00f0ff] font-bold text-xs rounded transition-all select-none flex items-center justify-center gap-1.5 min-h-[32px]"
                >
                  <span className="hidden sm:inline font-['Orbitron'] text-[9px] tracking-wider">NEXT</span> ⏭
                </button>

                <button
                  onClick={handleStopTour}
                  title="Stop Tour"
                  className="px-3 py-2 bg-[#ff007f]/10 hover:bg-[#ff007f]/25 border border-[#ff007f]/40 hover:border-[#ff007f] text-[#ff007f] font-bold text-xs rounded transition-all select-none flex items-center justify-center gap-1.5 min-h-[32px]"
                >
                  ⏹ <span className="hidden sm:inline font-['Orbitron'] text-[9px] tracking-wider">STOP</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Status & Day/Night Toggle */}
        <div className="glass-panel px-4 py-3 border-[#ff007f]/25 text-[10px] font-mono text-[#8f9bb3] flex items-center justify-between md:justify-start gap-4">
          <button
            onClick={handleThemeToggle}
            className="pointer-events-auto px-2.5 py-1 bg-white/5 border border-white/10 hover:border-[#00f0ff] hover:text-[#00f0ff] rounded font-['Orbitron'] text-[9px] font-bold tracking-wider transition-all select-none"
          >
            MODE: {themeMode.toUpperCase()}
          </button>
          <div className="w-px h-3 bg-white/10 hidden md:block" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-ping" />
            <span>SYS: READY</span>
          </div>
          <div className="w-px h-3 bg-white/10 hidden md:block" />
          <span>FPS: {fps}</span>
        </div>
      </div>

      {/* 1.1. AUTO EXPLORE Progress Indicator */}
      {autoExploreActive && autoExploreIndex >= 1 && autoExploreIndex <= 11 && (
        <div className="absolute top-[180px] md:top-[100px] left-1/2 -translate-x-1/2 pointer-events-auto z-50 flex flex-col items-center bg-black/85 border border-[#00f0ff]/20 px-5 py-3 rounded shadow-[0_0_25px_rgba(0,240,255,0.12)] min-w-[280px] sm:min-w-[320px] md:min-w-[380px] animate-slide-in">
          <div className="flex flex-col items-center gap-1 w-full text-center">
            <span className="font-['Orbitron'] text-[9px] font-black tracking-[0.3em] text-[#00f0ff] uppercase animate-pulse">
              🌆 DEEPVERSE TOUR
            </span>
            <span className="font-['Orbitron'] text-xs font-black text-white tracking-widest uppercase mt-0.5 whitespace-nowrap">
              {WAYPOINTS[autoExploreIndex]?.name || 'UNKNOWN ZONE'}
            </span>
            
            {/* Horizontal Track of 11 Dots */}
            <div className="flex items-center justify-between w-full mt-3 px-2.5 relative">
              {/* Line track */}
              <div className="absolute left-3 right-3 h-[2px] bg-white/10 top-1/2 -translate-y-1/2 -z-10" />
              <div 
                className="absolute left-3 h-[2px] bg-[#00f0ff] top-1/2 -translate-y-1/2 -z-10 transition-all duration-500 shadow-[0_0_8px_#00f0ff]" 
                style={{ width: `${Math.max(0, Math.min(100, ((autoExploreIndex - 1) / 10) * 100))}%` }}
              />
              
              {Array.from({ length: 11 }).map((_, idx) => {
                const stepNum = idx + 1;
                const isPassed = stepNum < autoExploreIndex;
                const isCurrent = stepNum === autoExploreIndex;
                
                return (
                  <div
                    key={idx}
                    title={WAYPOINTS[stepNum]?.name}
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center relative cursor-help ${
                      isCurrent
                        ? 'border-[#ff007f] bg-black scale-110 shadow-[0_0_10px_#ff007f]'
                        : isPassed
                          ? 'border-[#00f0ff] bg-[#00f0ff] shadow-[0_0_6px_rgba(0,240,255,0.4)]'
                          : 'border-white/20 bg-black/40'
                    }`}
                  >
                    {isCurrent && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff007f] animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
            
            <span className="font-mono text-[9px] text-[#8f9bb3] tracking-wider mt-2.5">
              {autoExploreIndex} / 11 Districts Completed
            </span>
          </div>
        </div>
      )}

      {/* 1.25. DISCOVERY POPUP OVERLAY */}
      {!autoExploreActive && detectedDistrictIndex !== -1 && manualOpenDetailsIndex === -1 && (
        <div className="absolute top-[180px] md:top-[100px] left-1/2 -translate-x-1/2 pointer-events-auto z-50 max-w-[420px] w-[92%] animate-slide-in">
          <div className="glass-panel p-4 border-[#00f0ff]/40 bg-black/90 shadow-[0_0_22px_rgba(0,240,255,0.25)] flex items-center justify-between gap-4 relative">
            {/* Cyberpunk accent lines */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00f0ff]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00f0ff]" />
            <div className="flex flex-col pr-4 text-left">
              <span className="font-mono text-[9px] text-[#8f9bb3] uppercase tracking-wider">📍 Nearby District Discovered</span>
              <span className="font-['Orbitron'] text-xs font-black text-white tracking-widest mt-0.5 uppercase">
                {WAYPOINTS[detectedDistrictIndex]?.name}
              </span>
            </div>
            <button
              onClick={() => {
                setManualOpenDetailsIndex(detectedDistrictIndex);
                if (!discoveredDistricts.includes(detectedDistrictIndex)) {
                  setDiscoveredDistricts((prev) => [...prev, detectedDistrictIndex]);
                }
                const win = window as any;
                if (win.synthClick) win.synthClick();
              }}
              className="px-3.5 py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/25 border border-[#00f0ff] rounded font-['Orbitron'] text-[9px] font-black tracking-widest text-[#00f0ff] hover:scale-105 transition-all shadow-[0_0_10px_rgba(0,240,255,0.25)]"
            >
              OPEN DETAILS
            </button>
          </div>
        </div>
      )}

      {/* 1.5. WELCOME NOTIFICATION OVERLAY */}
      {showWelcome && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-auto z-50 max-w-[460px] w-[92%]">
          <div className="glass-panel p-4 border-[#00f0ff]/35 bg-black/85 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-start gap-3 relative animate-slide-in">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-2 right-2 text-white/50 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
            <div className="flex flex-col gap-1 pr-4">
              <span className="font-['Orbitron'] text-xs font-black text-[#00f0ff] tracking-wider flex items-center gap-1.5">
                ✨ Welcome to DeepVerse!
              </span>
              <p className="font-mono text-[10px] md:text-xs text-[#8f9bb3] leading-relaxed mt-0.5">
                🚗 <strong>Recommended:</strong> Click <strong>AUTO EXPLORE</strong> for the complete cinematic portfolio experience.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. CENTER STAGE GAMEPLAY INSTRUCTIONS */}
      {sceneState === 'explore' && !hasDriven && !autoExploreActive && (
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

      {/* 2.5. DISTRICT INFO PANEL CARD */}
      {((autoExploreActive && (autoExploreState === 'paused' || autoExploreState === 'manually_paused') && currentDistrict) ||
        (!autoExploreActive && manualOpenDetailsIndex !== -1)) && (
        <div className="absolute left-4 md:left-12 top-1/3 md:top-1/2 -translate-y-1/2 pointer-events-auto z-50 max-w-[420px] w-[90%]">
          <div className="glass-panel p-6 border-[#00f0ff]/40 bg-black/85 shadow-[0_0_30px_rgba(0,240,255,0.25)] relative overflow-hidden animate-slide-in">
            {/* Close button for manual exploration mode */}
            {!autoExploreActive && (
              <button
                onClick={() => setManualOpenDetailsIndex(-1)}
                className="absolute top-3 right-3 text-white/50 hover:text-white font-['Orbitron'] text-[9px] font-black tracking-wider transition-all border border-white/10 hover:border-[#ff007f] hover:text-[#ff007f] px-2.5 py-1 rounded bg-black/50 hover:bg-[#ff007f]/10 z-10"
              >
                ✕ CLOSE
              </button>
            )}

            {/* Cyberpunk corner details */}
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00f0ff]" />
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00f0ff]" />
            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00f0ff]" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#00f0ff]" />

            <div className="flex flex-col gap-1.5">
              <span className="font-['Orbitron'] text-[10px] font-extrabold tracking-[0.25em] text-[#ff007f]">
                {autoExploreActive ? currentDistrict.subtitle : DISTRICT_DATA[manualOpenDetailsIndex]?.subtitle}
              </span>
              <h2 className="font-['Orbitron'] text-lg md:text-xl font-black text-white tracking-widest uppercase border-b border-[#00f0ff]/20 pb-3 mt-1">
                {autoExploreActive ? currentDistrict.title : DISTRICT_DATA[manualOpenDetailsIndex]?.title}
              </h2>
              
              <ul className="space-y-3.5 my-5 font-mono text-[11px] md:text-xs text-[#b0bacf] list-none pl-0">
                {(autoExploreActive ? currentDistrict.achievements : DISTRICT_DATA[manualOpenDetailsIndex]?.achievements || []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-[#00f0ff] font-bold">❯</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {((autoExploreActive ? currentDistrict.buttonText : DISTRICT_DATA[manualOpenDetailsIndex]?.buttonText) && 
                (autoExploreActive ? currentDistrict.buttonUrl : DISTRICT_DATA[manualOpenDetailsIndex]?.buttonUrl)) && (
                <a
                  href={autoExploreActive ? currentDistrict.buttonUrl : DISTRICT_DATA[manualOpenDetailsIndex]?.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block w-full text-center py-3 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/30 border border-[#00f0ff] rounded font-['Orbitron'] text-[10px] font-black tracking-widest text-[#00f0ff] transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                >
                  {autoExploreActive ? currentDistrict.buttonText : DISTRICT_DATA[manualOpenDetailsIndex]?.buttonText}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2.75. CAMERA MODE MENU */}
      {sceneState === 'explore' && (
        <div className="absolute right-3 sm:right-6 md:right-8 bottom-[185px] sm:bottom-[180px] md:bottom-[170px] pointer-events-auto z-50 flex flex-col items-end gap-2 animate-slide-in">
          <div className="glass-panel p-2 md:p-3 border-[#00f0ff]/25 bg-black/85 shadow-[0_0_20px_rgba(0,240,255,0.15)] w-[140px] sm:w-[190px] md:w-[240px] flex flex-col gap-1.5 md:gap-2 relative group/panel transition-all duration-300 hover:border-[#00f0ff]/50">
            {/* Corner Cyberpunk Details */}
            <div className="absolute -top-px -left-px w-2.5 h-2.5 border-t border-l border-[#00f0ff]" />
            <div className="absolute -bottom-px -right-px w-2.5 h-2.5 border-b border-r border-[#00f0ff]" />
            
            {/* Tooltip Description on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-black/90 border border-[#00f0ff]/40 rounded text-[8px] md:text-[9px] font-mono text-[#00f0ff] opacity-0 group-hover/panel:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-[0_0_8px_rgba(0,240,255,0.25)] tracking-wider z-[60]">
              Change Camera View
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-1">
              <div className="flex items-center gap-1">
                <span role="img" aria-label="camera" className="text-[10px] md:text-xs">📷</span>
                <span className="font-['Orbitron'] text-[8px] sm:text-[9px] md:text-[10px] font-extrabold tracking-[0.1em] md:tracking-[0.2em] text-[#00f0ff] whitespace-nowrap">
                  CAMERA MODE
                </span>
              </div>
              <span className="hidden sm:inline font-mono text-[7px] md:text-[8px] text-[#00f0ff]/50">ACTIVE</span>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-2 gap-1 md:gap-1.5">
              {cameraOptions.map((opt) => {
                const isActive = activeHighlight === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    onClick={() => selectCameraMode(opt.mode)}
                    className={`px-1 md:px-2 py-1 md:py-1.5 border rounded font-['Orbitron'] text-[8px] sm:text-[9px] font-bold tracking-wider transition-all duration-200 text-center uppercase select-none ${
                      isActive
                        ? 'bg-[#ff007f]/20 border-[#ff007f] text-[#ff007f] shadow-[0_0_10px_rgba(255,0,127,0.3)] font-black'
                        : 'bg-[#00f0ff]/5 border-[#00f0ff]/20 text-[#00f0ff]/80 hover:bg-[#00f0ff]/15 hover:border-[#00f0ff] hover:text-[#00f0ff] hover:scale-[1.03]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. BOTTOM TELEMETRY HUDS */}
      <div className="w-full flex justify-between items-end gap-6">
        
        {/* Speedometer Widget */}
        <div className="glass-panel p-5 border-[#00f0ff]/15 flex items-end gap-4 min-w-[200px] pointer-events-auto">
          <div className="relative w-16 h-16 flex items-center justify-center border-2 border-dashed border-[#00f0ff]/20 rounded-full">
            <div className="absolute inset-1 border border-white/5 rounded-full" />
            <span className="font-['Orbitron'] text-2xl font-black text-white leading-none">
              {speed}
            </span>
          </div>
          <div className="flex flex-col justify-end font-mono">
            <span className="font-['Orbitron'] text-[9px] font-bold tracking-widest text-[#8f9bb3]">TELEMETRY</span>
            <span className="font-['Orbitron'] text-xs font-semibold text-[#00f0ff] glow-text-cyan mt-0.5">
              KM/H
            </span>
            <span className="text-[9px] text-[#4e5566] mt-1.5 uppercase">
              RPM: {Math.round(rpm)}
            </span>
            <span className={`text-[9px] font-bold mt-0.5 ${boostActive ? 'text-[#ff007f]' : 'text-[#4e5566]'}`}>
              BOOST: {boostActive ? 'ACTIVE' : 'READY'}
            </span>
          </div>
        </div>

        {/* Minimap Widget */}
        <div className="glass-panel p-4 border-white/5 flex flex-col gap-2 min-w-[150px] items-center text-center">
          <span className="font-['Orbitron'] text-[9px] tracking-widest text-[#8f9bb3]">GPS MINIMAP</span>
          
          <div className="relative w-24 h-24 bg-black/40 rounded-full border border-[#00f0ff]/15 overflow-hidden flex items-center justify-center">
            <div className="absolute w-full h-px bg-white/5" />
            <div className="absolute h-full w-px bg-white/5" />
            <div className="absolute w-16 h-16 border border-dashed border-white/5 rounded-full" />
            <div className="absolute w-8 h-8 border border-dashed border-white/5 rounded-full" />
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
              {/* Route lines */}
              <polyline
                points={WAYPOINTS.map(wp => `${48 + wp.position.x * mapScale},${48 + wp.position.z * mapScale}`).join(' ')}
                fill="none"
                stroke={autoExploreActive ? "#00f0ff" : "#ff007f"}
                strokeWidth="1.2"
                strokeDasharray="2,2"
                opacity="0.4"
              />
              {/* Waypoint nodes */}
              {WAYPOINTS.slice(0, 11).map((wp, idx) => {
                const isDiscovered = discoveredDistricts.includes(idx);
                // Active destination is autoExploreIndex in tour mode, or detectedDistrictIndex in manual mode
                const isActive = autoExploreActive ? autoExploreIndex === idx : detectedDistrictIndex === idx;
                
                let color = '#3a3f50'; // hidden
                if (isActive) {
                  color = '#ff007f'; // destination active
                } else if (isDiscovered) {
                  color = '#00f0ff'; // discovered
                }
                
                return (
                  <circle
                    key={idx}
                    cx={48 + wp.position.x * mapScale}
                    cy={48 + wp.position.z * mapScale}
                    r={isActive ? 2.5 : 1.5}
                    fill={color}
                  />
                );
              })}
            </svg>

            {/* Central hub marker */}
            <div className="absolute w-1.5 h-1.5 bg-[#ff007f] rounded-full shadow-[0_0_6px_#ff007f]" />
            
            {/* Player vehicle position */}
            <div
              className="absolute w-2.5 h-2.5 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff] border border-white flex items-center justify-center z-10"
              style={{
                transform: `translate(${carCoords.x * mapScale}px, ${carCoords.z * mapScale}px)`
              }}
            >
              <div className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-ping" />
            </div>
          </div>
          
          <span className="font-mono text-[9px] text-[#4e5566] mt-1">
            X: {Math.round(carCoords.x)} // Z: {Math.round(carCoords.z)}
          </span>
        </div>
      </div>

      {/* 4. MOBILE VIRTUAL CONTROLS */}
      {!autoExploreActive && (
        <div className="absolute inset-x-0 bottom-0 pointer-events-none flex flex-col justify-end p-4 md:hidden">
          <div className="w-full flex justify-between items-end pointer-events-auto h-32">
            <div
              onTouchStart={handleJoystickStart}
              onTouchMove={handleJoystickMove}
              onTouchEnd={handleJoystickEnd}
              className="w-24 h-24 bg-black/60 border border-white/10 rounded-full flex items-center justify-center touch-none relative select-none"
            >
              <div
                className="w-10 h-10 bg-[#00f0ff]/20 border-2 border-[#00f0ff] rounded-full absolute shadow-[0_0_10px_#00f0ff]"
                style={{
                  transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`
                }}
              />
            </div>

            <div className="flex gap-4">
              <button
                onTouchStart={() => setInputs((p) => ({ ...p, backward: true }))}
                onTouchEnd={() => setInputs((p) => ({ ...p, backward: false }))}
                className="w-16 h-16 bg-[#ff007f]/10 border border-[#ff007f]/40 rounded-full font-['Orbitron'] text-xs font-bold text-[#ff007f] active:bg-[#ff007f]/30 active:scale-95 transition-all select-none"
              >
                BRAKE
              </button>

              <button
                onTouchStart={() => setInputs((p) => ({ ...p, forward: true }))}
                onTouchEnd={() => setInputs((p) => ({ ...p, forward: false }))}
                className="w-16 h-16 bg-[#00f0ff]/10 border border-[#00f0ff]/40 rounded-full font-['Orbitron'] text-xs font-bold text-[#00f0ff] active:bg-[#00f0ff]/30 active:scale-95 transition-all select-none"
              >
                DRIVE
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center gap-3 mt-4 pointer-events-auto pb-4">
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
      )}

    </div>
  );
};
export default HUD;
