import React from 'react';
import { Sky } from '../components/City/Sky';
import { Mountains } from '../components/City/Mountains';
import { Roads } from '../components/City/Roads';
import { Buildings } from '../components/City/Buildings';
import { Hologram } from '../components/City/Hologram';
import { Particles } from '../components/City/Particles';
import { Vehicle } from '../components/City/Vehicle';
import { Traffic } from '../components/City/Traffic';
import { Drones } from '../components/City/Drones';
import { Billboards } from '../components/City/Billboards';

export const EnvironmentManager: React.FC = () => {
  return (
    <group name="Environment">
      {/* Three.js Fog to blend the rendering boundary nicely */}
      <fog attach="fog" args={['#03030d', 15, 175]} />

      {/* Procedural Twinkling Sky Dome */}
      <Sky />

      {/* Distant Boundary Low-poly Peaks */}
      <Mountains />

      {/* Cyber Avenues and Infrastructure */}
      <Roads />

      {/* Skyscraper Facade Towers */}
      <Buildings />

      {/* Neon Hologram Projections */}
      <Hologram />

      {/* Ambient Drifting Dust Particles */}
      <Particles />

      {/* Drivable futuristic sports car */}
      <Vehicle />

      {/* Ambient hovercars traffic lanes */}
      <Traffic />

      {/* Flying spotlight surveillance drones */}
      <Drones />

      {/* Holographic advertising billboards on skyscraper roofs */}
      <Billboards />
    </group>
  );
};
export default EnvironmentManager;
