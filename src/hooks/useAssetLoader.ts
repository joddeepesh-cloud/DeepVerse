import { useEffect, useRef } from 'react';
import { useExperience } from '../context/ExperienceContext';

class SciFiSynth {
  public ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  // Engine Synthesizer nodes
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  // Turbo spool nodes
  private turboOsc: OscillatorNode | null = null;
  private turboGain: GainNode | null = null;

  // Wind rush nodes
  private windNoise: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;

  // Music nodes
  private musicInterval: any = null;
  private musicActive = false;

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
  }

  // Pre-load triggers
  playClick() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playWhoosh() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 2.5;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(8, now);
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(3000, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(150, now + duration);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
  }

  startAmbientHum() {
    this.init();
    if (!this.ctx || this.ambientOsc) return;
    const now = this.ctx.currentTime;
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();
    this.ambientOsc.type = 'sawtooth';
    this.ambientOsc.frequency.setValueAtTime(55, now);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, now);
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, now);
    lfoGain.gain.setValueAtTime(1.5, now);
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientOsc.detune);
    this.ambientGain.gain.setValueAtTime(0.04, now);
    this.ambientOsc.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    lfo.start(now);
    this.ambientOsc.start(now);
  }

  stopAmbientHum() {
    if (this.ambientOsc && this.ambientGain) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
        this.ambientGain.disconnect();
      } catch (e) {}
      this.ambientOsc = null;
      this.ambientGain = null;
    }
  }

  // GAME ENGINE SOUND SYNTHESIZER
  startEngine() {
    this.init();
    if (!this.ctx || this.engineOsc1) return;
    const now = this.ctx.currentTime;

    // 1. Dual detuned oscillators for thick cybernetic sound
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineGain = this.ctx.createGain();

    this.engineOsc1.type = 'sawtooth';
    this.engineOsc2.type = 'triangle'; // Mix sawtooth and triangle for richness

    this.engineOsc1.frequency.setValueAtTime(45, now); // Low starting frequency
    this.engineOsc2.frequency.setValueAtTime(45.5, now);
    this.engineOsc1.detune.setValueAtTime(-8, now);
    this.engineOsc2.detune.setValueAtTime(8, now);

    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(150, now);
    this.engineFilter.Q.setValueAtTime(4, now);

    this.engineGain.gain.setValueAtTime(0.14, now);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc1.start(now);
    this.engineOsc2.start(now);

    // 2. Turbo spool (High pitch whine)
    this.turboOsc = this.ctx.createOscillator();
    this.turboGain = this.ctx.createGain();
    this.turboOsc.type = 'sine';
    this.turboOsc.frequency.setValueAtTime(300, now);
    this.turboGain.gain.setValueAtTime(0.0, now); // off by default

    this.turboOsc.connect(this.turboGain);
    this.turboGain.connect(this.ctx.destination);
    this.turboOsc.start(now);

    // 3. Wind rush generator (White noise)
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.windNoise = this.ctx.createBufferSource();
    this.windNoise.buffer = buffer;
    this.windNoise.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.Q.setValueAtTime(2.0, now);
    this.windFilter.frequency.setValueAtTime(250, now);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.001, now);

    this.windNoise.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.ctx.destination);
    this.windNoise.start(now);

    // Start background synth track
    this.startMusic();
  }

  // Update engine sound parameters in R3F useFrame loop
  updateEngine(rpm: number, speed: number, isBraking: boolean, isBoosting: boolean) {
    if (!this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter) return;

    const now = this.ctx.currentTime;
    
    // Map RPM (800 - 8000) to base frequency (40 - 250Hz)
    const baseFreq = 40 + (rpm / 8000) * 160;
    
    // Smoothly transition engine frequency
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.01, now, 0.05);

    // Filter cut-off opens up as engine revs higher (makes it brighter/louder)
    const filterCutoff = 130 + (rpm / 8000) * 800 + (isBoosting ? 300 : 0);
    this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.06);

    // Adjust engine volume slightly with engine revs
    const targetGain = 0.08 + (rpm / 8000) * 0.12 + (isBoosting ? 0.05 : 0);
    this.engineGain!.gain.setTargetAtTime(targetGain, now, 0.05);

    // Turbo spool sound
    if (this.turboOsc && this.turboGain) {
      if (isBoosting) {
        this.turboOsc.frequency.setTargetAtTime(800 + (speed / 150) * 1200, now, 0.1);
        this.turboGain.gain.setTargetAtTime(0.04, now, 0.15);
      } else {
        this.turboOsc.frequency.setTargetAtTime(300, now, 0.2);
        this.turboGain.gain.setTargetAtTime(0.0, now, 0.25);
      }
    }

    // Wind rush based on velocity
    if (this.windFilter && this.windGain) {
      const windVolume = Math.min((speed / 160) * 0.08, 0.08);
      const windCutoff = 200 + (speed / 160) * 1000;
      this.windFilter.frequency.setTargetAtTime(windCutoff, now, 0.1);
      this.windGain.gain.setTargetAtTime(windVolume, now, 0.1);
    }

    // Dynamic brake squeak
    if (isBraking && speed > 25 && Math.random() > 0.96) {
      this.playBrakeSqueak();
    }
  }

  playBrakeSqueak() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    // extremely high-pitched squeal
    osc.frequency.setValueAtTime(2500, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
    
    gain.gain.setValueAtTime(0.015, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  // LOOPING FUTURISTIC ARPEGGIATOR MUSIC
  startMusic() {
    if (this.musicInterval || !this.ctx) return;
    this.musicActive = true;

    // Chord progressions in C minor: Cm -> Ab -> Fm -> Bb
    const chords = [
      [36, 48, 55, 60, 63], // Cm (C2, C3, G3, C4, Eb4)
      [32, 44, 51, 56, 60], // Ab (Ab1, Ab2, Eb3, Ab3, C4)
      [29, 41, 48, 53, 56], // Fm (F1, F2, C3, F3, Ab3)
      [34, 46, 53, 58, 62]  // Bb (Bb1, Bb2, F3, Bb3, D4)
    ];

    let chordIdx = 0;
    let step = 0;

    const playSynthNote = (midiNote: number, time: number, vol: number, dur: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      // soft low pass envelope
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, time);
      filter.frequency.exponentialRampToValueAtTime(1200, time + 0.05);
      filter.frequency.exponentialRampToValueAtTime(100, time + dur);

      gain.gain.setValueAtTime(0.0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + dur);
    };

    // Arpeggiator loop running at 130 BPM (16th notes = 115ms per step)
    const stepTime = 0.23; // 8th notes (230ms per step)
    
    this.musicInterval = setInterval(() => {
      if (!this.ctx || !this.musicActive) return;
      
      const currentChord = chords[chordIdx];
      
      // Play bass note on step 0 and 4
      if (step === 0) {
        playSynthNote(currentChord[0], this.ctx.currentTime, 0.04, stepTime * 4); // deep base
      } else if (step === 4) {
        playSynthNote(currentChord[1], this.ctx.currentTime, 0.03, stepTime * 4);
      }

      // Arpeggiate higher notes
      const noteIdx = 2 + (step % 3);
      playSynthNote(currentChord[noteIdx] + 12, this.ctx.currentTime, 0.02, stepTime * 0.8);

      step = (step + 1) % 8;
      if (step === 0) {
        chordIdx = (chordIdx + 1) % chords.length;
      }
    }, 230);
  }

  stopMusic() {
    this.musicActive = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  stopEngine() {
    this.stopMusic();
    if (this.engineOsc1) {
      try {
        this.engineOsc1.stop();
        this.engineOsc2!.stop();
        this.turboOsc!.stop();
        this.windNoise!.stop();

        this.engineOsc1.disconnect();
        this.engineOsc2!.disconnect();
        this.engineFilter!.disconnect();
        this.engineGain!.disconnect();
        this.turboOsc!.disconnect();
        this.turboGain!.disconnect();
        this.windNoise!.disconnect();
        this.windFilter!.disconnect();
        this.windGain!.disconnect();
      } catch (e) {}
      this.engineOsc1 = null;
      this.engineOsc2 = null;
      this.engineFilter = null;
      this.engineGain = null;
      this.turboOsc = null;
      this.turboGain = null;
      this.windNoise = null;
      this.windFilter = null;
      this.windGain = null;
    }
  }
}

export const synth = new SciFiSynth();

export const useAssetLoader = () => {
  const { setLoadingProgress, setIsLoaded } = useExperience();
  const stepRef = useRef<number>(0);
  const totalSteps = 100;

  useEffect(() => {
    let fontLoading = true;
    if (document.fonts) {
      document.fonts.ready.then(() => {
        fontLoading = false;
      });
    } else {
      fontLoading = false;
    }

    const interval = setInterval(() => {
      if (stepRef.current < totalSteps) {
        const increment = stepRef.current < 30 ? 2 : stepRef.current < 70 ? 1 : 3;
        stepRef.current = Math.min(stepRef.current + increment, totalSteps);
        setLoadingProgress(stepRef.current);
      } else if (!fontLoading) {
        clearInterval(interval);
        setIsLoaded(true);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [setLoadingProgress, setIsLoaded]);

  const getLoaderPhase = (progress: number) => {
    if (progress < 20) return 'INITIALIZING DEEPVERSE QUANTUM CORE...';
    if (progress < 40) return 'SYNTHESIZING AUDIO FREQUENCY CHANNELS...';
    if (progress < 60) return 'COMPILING NEON SHADERS & PARALLAX BUFFERS...';
    if (progress < 80) return 'ASSEMBLING PROCEDURAL CITY GRID...';
    if (progress < 95) return 'MAPPING HDR VOLUMETRICS & POST-EFFECTS...';
    return 'SYSTEM ONLINE. READY FOR COGNITIVE WARP.';
  };

  return {
    phase: getLoaderPhase(stepRef.current),
    synth
  };
};
export default useAssetLoader;
