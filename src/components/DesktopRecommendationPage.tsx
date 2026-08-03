import React, { useState } from 'react';
import { Monitor, Info, Smartphone, HelpCircle } from 'lucide-react';

interface DesktopRecommendationPageProps {
  onContinue: () => void;
}

export const DesktopRecommendationPage: React.FC<DesktopRecommendationPageProps> = ({ onContinue }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 md:p-8 bg-[#02020a] overflow-y-auto scanline-effect select-none font-sans">
      
      {/* Background Cyberpunk Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff007f]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#00f0ff]/5 blur-[120px] pointer-events-none" />

      {/* Main card panel */}
      <div className="glass-panel p-6 sm:p-10 border-[#00f0ff]/30 bg-black/90 shadow-[0_0_50px_rgba(0,240,255,0.15)] max-w-md w-full relative overflow-hidden animate-slide-in flex flex-col gap-6 text-center border">
        {/* Cyberpunk corner details */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#00f0ff]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#00f0ff]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#00f0ff]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#00f0ff]" />

        <div className="flex flex-col gap-1 items-center">
          <div className="relative w-16 h-16 flex items-center justify-center mb-1">
            {/* Pulsing ring */}
            <div className="absolute inset-0 border border-[#00f0ff]/20 rounded-full animate-ping opacity-45" />
            <Monitor className="w-10 h-10 text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" />
          </div>
          <h1 className="font-['Orbitron'] text-xl sm:text-2xl font-black text-white tracking-[0.2em] uppercase mt-2">
            DeepVerse Portfolio
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#ff007f] to-transparent my-2" />
        </div>

        <div className="flex flex-col gap-4 text-left font-mono">
          <div className="border-l-2 border-[#ff007f] pl-3 py-1 bg-[#ff007f]/5">
            <p className="text-white text-xs sm:text-sm font-bold leading-relaxed uppercase tracking-wider text-[#ff007f]">
              This portfolio is designed for desktop for the best experience.
            </p>
          </div>

          <p className="text-[#8f9bb3] text-[11px] sm:text-xs leading-relaxed uppercase tracking-wide">
            Please open this website on a PC/Laptop or enable Desktop Site in your browser.
          </p>
        </div>

        {/* Cyberpunk Action Buttons */}
        <div className="flex flex-col gap-3.5 w-full mt-4">
          <button
            onClick={() => setShowInstructions(true)}
            className="w-full py-4 px-6 rounded-md font-['Orbitron'] font-black text-xs tracking-[0.15em] text-[#00f0ff] bg-[#00f0ff]/10 border-2 border-[#00f0ff] hover:bg-[#00f0ff]/20 hover:text-white transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.25)] uppercase flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Desktop Mode Guide
          </button>

          <button
            onClick={onContinue}
            className="w-full py-3 px-6 rounded-md font-['Orbitron'] font-black text-[10px] tracking-widest text-[#8f9bb3] hover:text-[#ff007f] bg-transparent border border-white/10 hover:border-[#ff007f]/40 hover:bg-[#ff007f]/5 active:scale-95 transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Continue Anyway
          </button>
        </div>
      </div>

      {/* Floating Instructions Overlay Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 border-[#ff007f]/30 bg-black/95 shadow-[0_0_40px_rgba(255,0,127,0.2)] max-w-sm w-full relative overflow-hidden animate-scale-up flex flex-col gap-4 text-left border">
            {/* Cyberpunk corner details */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#ff007f]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#ff007f]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#ff007f]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#ff007f]" />

            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="font-['Orbitron'] text-xs sm:text-sm font-black text-[#ff007f] tracking-widest uppercase flex items-center gap-2">
                <Info className="w-4 h-4" />
                HOW TO ENABLE DESKTOP SITE
              </span>
            </div>

            <div className="flex flex-col gap-4 font-mono text-[11px] sm:text-xs text-[#8f9bb3]">
              <div className="flex flex-col gap-1">
                <span className="text-white font-bold tracking-wider text-[#00f0ff]">🌐 SAFARI (iOS)</span>
                <p className="leading-relaxed">
                  1. Tap the <span className="text-white font-semibold">aA</span> icon in the address bar.
                  <br />
                  2. Select <span className="text-white font-semibold">Request Desktop Website</span>.
                </p>
              </div>

              <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                <span className="text-white font-bold tracking-wider text-[#00f0ff]">🌐 CHROME (Android)</span>
                <p className="leading-relaxed">
                  1. Tap the three dots menu (<span className="text-white font-semibold">⋮</span>) in the top-right.
                  <br />
                  2. Check the box for <span className="text-white font-semibold">Desktop site</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="mt-2 py-3 px-6 text-center bg-[#ff007f]/10 border border-[#ff007f]/40 hover:border-[#ff007f] text-[#ff007f] font-['Orbitron'] font-black text-[10px] tracking-widest rounded transition-all cursor-pointer uppercase active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default DesktopRecommendationPage;
