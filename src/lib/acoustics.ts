// Bioacoustic spectrogram simulation library and sample sound signatures

export interface SoundSignature {
  id: string;
  speciesId: string;
  commonName: string;
  scientificName: string;
  callType: string; // e.g. "Echolocation pulse", "Mating song", "Roar", "Warning howl"
  frequencyRangeHz: [number, number]; // e.g. [20, 300]
  peakFreqHz: number;
  durationSec: number;
  waveformPattern: number[]; // Array of 20 normalized amplitude values [0-1] for display
  spectrogramPoints: { timeSec: number; freqHz: number; intensity: number }[]; // 0-1 intensity
  description: string;
  habitat: string;
}

export const SAMPLE_AUDIO_SIGNATURES: SoundSignature[] = [
  {
    id: 'audio-001',
    speciesId: 'humpback-whale',
    commonName: 'Humpback Whale',
    scientificName: 'Megaptera novaeangliae',
    callType: 'Low-Frequency Breeding Song',
    frequencyRangeHz: [30, 4000],
    peakFreqHz: 250,
    durationSec: 8.5,
    waveformPattern: [0.1, 0.4, 0.8, 0.95, 0.7, 0.3, 0.2, 0.6, 0.85, 1.0, 0.75, 0.4, 0.2, 0.5, 0.9, 0.8, 0.4, 0.3, 0.1, 0.05],
    spectrogramPoints: [
      { timeSec: 0.5, freqHz: 150, intensity: 0.8 },
      { timeSec: 1.2, freqHz: 250, intensity: 1.0 },
      { timeSec: 2.0, freqHz: 450, intensity: 0.7 },
      { timeSec: 3.5, freqHz: 200, intensity: 0.9 },
      { timeSec: 5.0, freqHz: 800, intensity: 0.6 },
      { timeSec: 6.8, freqHz: 300, intensity: 0.85 },
    ],
    description: 'Complex recurring sequence of low sounds used for long-distance oceanic communication.',
    habitat: 'Oceans / pelagic',
  },
  {
    id: 'audio-002',
    speciesId: 'timber-wolf',
    commonName: 'Timber Wolf',
    scientificName: 'Canis lupus',
    callType: 'Pack Rally Howl',
    frequencyRangeHz: [150, 1200],
    peakFreqHz: 450,
    durationSec: 5.2,
    waveformPattern: [0.05, 0.2, 0.5, 0.85, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1, 0.05, 0.02],
    spectrogramPoints: [
      { timeSec: 0.5, freqHz: 250, intensity: 0.5 },
      { timeSec: 1.5, freqHz: 450, intensity: 0.95 },
      { timeSec: 3.0, freqHz: 500, intensity: 0.8 },
      { timeSec: 4.2, freqHz: 380, intensity: 0.6 },
    ],
    description: 'Smooth harmonic howl rising to a sustained pitch used for pack coordination across territory.',
    habitat: 'Boreal forest & tundra',
  },
  {
    id: 'audio-003',
    speciesId: 'lion',
    commonName: 'African Lion',
    scientificName: 'Panthera leo',
    callType: 'Territorial Roar Sequence',
    frequencyRangeHz: [40, 800],
    peakFreqHz: 180,
    durationSec: 6.0,
    waveformPattern: [0.2, 0.8, 0.95, 0.6, 0.1, 0.7, 0.85, 0.5, 0.1, 0.6, 0.75, 0.4, 0.1, 0.5, 0.6, 0.3, 0.1, 0.3, 0.2, 0.05],
    spectrogramPoints: [
      { timeSec: 0.4, freqHz: 180, intensity: 1.0 },
      { timeSec: 1.8, freqHz: 220, intensity: 0.85 },
      { timeSec: 3.1, freqHz: 150, intensity: 0.75 },
      { timeSec: 4.5, freqHz: 120, intensity: 0.6 },
    ],
    description: 'Deep resonant roars ending in rhythmic grunts, audible up to 8 km away in open savanna.',
    habitat: 'Savanna & grassland',
  },
  {
    id: 'audio-004',
    speciesId: 'african-elephant',
    commonName: 'African Bush Elephant',
    scientificName: 'Loxodonta africana',
    callType: 'Infrasonic Contact Call',
    frequencyRangeHz: [14, 250],
    peakFreqHz: 20,
    durationSec: 7.0,
    waveformPattern: [0.1, 0.3, 0.6, 0.8, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.2, 0.15, 0.1, 0.05],
    spectrogramPoints: [
      { timeSec: 1.0, freqHz: 20, intensity: 0.95 },
      { timeSec: 3.0, freqHz: 22, intensity: 0.9 },
      { timeSec: 5.0, freqHz: 18, intensity: 0.7 },
    ],
    description: 'Ultra-low infrasound rumble traveling through soil and air over tens of kilometers.',
    habitat: 'Savanna & forest',
  },
  {
    id: 'audio-005',
    speciesId: 'arctic-tern',
    commonName: 'Arctic Tern',
    scientificName: 'Sterna paradisaea',
    callType: 'High-Pitch Colony Warning Chitter',
    frequencyRangeHz: [2500, 8500],
    peakFreqHz: 5200,
    durationSec: 3.2,
    waveformPattern: [0.8, 0.2, 0.9, 0.1, 0.85, 0.15, 0.95, 0.2, 0.7, 0.1, 0.8, 0.2, 0.6, 0.1, 0.5, 0.1, 0.4, 0.05, 0.2, 0.01],
    spectrogramPoints: [
      { timeSec: 0.3, freqHz: 5200, intensity: 0.9 },
      { timeSec: 0.8, freqHz: 6100, intensity: 0.85 },
      { timeSec: 1.5, freqHz: 4800, intensity: 0.95 },
      { timeSec: 2.4, freqHz: 7200, intensity: 0.7 },
    ],
    description: 'Rapid staccato metallic chatter emitted when protecting nesting territories from predators.',
    habitat: 'Coastal tundra & ocean',
  },
];

export function matchAudioSignature(
  freqHz: number,
  tolerancePercent = 30
): { signature: SoundSignature; matchScore: number }[] {
  return SAMPLE_AUDIO_SIGNATURES.map((sig) => {
    const minBound = sig.frequencyRangeHz[0];
    const maxBound = sig.frequencyRangeHz[1];
    
    let score = 0;
    if (freqHz >= minBound && freqHz <= maxBound) {
      const mid = (minBound + maxBound) / 2;
      const distance = Math.abs(freqHz - sig.peakFreqHz);
      const range = maxBound - minBound;
      score = Math.max(10, Math.round(100 - (distance / range) * 100));
    } else {
      const distFromMin = Math.abs(freqHz - minBound);
      const distFromMax = Math.abs(freqHz - maxBound);
      const closestDist = Math.min(distFromMin, distFromMax);
      const penalty = (closestDist / 1000) * (tolerancePercent / 10);
      score = Math.max(0, Math.round(40 - penalty));
    }
    return { signature: sig, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
