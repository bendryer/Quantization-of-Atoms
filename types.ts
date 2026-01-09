export interface SimulationState {
  l: number; // Angular mode (Azimuthal)
  n: number; // Radial mode
  isPlaying: boolean;
  speed: number;
  amplitude: number;
  showNodalLines: boolean;
  resolution: number;
  viewMode: 'DRUM' | 'ORBITAL' | 'STRING';
  zoom: number;
  slicePosition: number; // 0 to 1, controls Z-plane cut
  radialClip: number; // 0 to 1, controls max radius
  particleBrightness: number; // Visual brightness multiplier for particles
  probPower: number; // Probability distribution power law (contrast)
}

export interface BesselRoot {
  l: number;
  roots: number[];
}

export enum ModeType {
  DRUM = 'DRUM',
  ORBITAL = 'ORBITAL',
  STRING = 'STRING',
}