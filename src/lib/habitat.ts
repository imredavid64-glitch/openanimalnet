// Biome and Climate Shift data definitions

export interface Biome {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  temperatureRangeC: [number, number];
  primaryThreat: string;
  keySpecies: { name: string; speciesId: string; impactAtPlus2C: string }[];
}

export const BIOMES: Biome[] = [
  {
    id: 'rainforest',
    name: 'Tropical Rainforest',
    description: 'Dense, biodiversity-rich forest biomes with high rainfall and warm ambient temperatures.',
    color: '#10b981', // Emerald
    icon: '🌴',
    temperatureRangeC: [20, 34],
    primaryThreat: 'Deforestation & agricultural expansion',
    keySpecies: [
      { name: 'Bornean Orangutan', speciesId: 'bornean-orangutan', impactAtPlus2C: '-35% canopy food availability' },
      { name: 'Jaguar', speciesId: 'jaguar', impactAtPlus2C: 'Corridor fragmentation' },
    ],
  },
  {
    id: 'tundra',
    name: 'Arctic Tundra & Pack Ice',
    description: 'Cold, treeless biome characterized by permafrost, seasonal ice caps, and extreme winters.',
    color: '#06b6d4', // Cyan
    icon: '🧊',
    temperatureRangeC: [-35, 10],
    primaryThreat: 'Sea ice collapse & permafrost thaw',
    keySpecies: [
      { name: 'Polar Bear', speciesId: 'polar-bear', impactAtPlus2C: 'Loss of hunting ice platform' },
      { name: 'Arctic Tern', speciesId: 'arctic-tern', impactAtPlus2C: 'Shifted prey spawning timing' },
    ],
  },
  {
    id: 'ocean',
    name: 'Pelagic & Coral Reef Ocean',
    description: 'Marine ecosystems spanning open oceans, deep trenches, and fragile coastal coral reefs.',
    color: '#3b82f6', // Blue
    icon: '🌊',
    temperatureRangeC: [2, 30],
    primaryThreat: 'Ocean acidification & marine heatwaves',
    keySpecies: [
      { name: 'Humpback Whale', speciesId: 'humpback-whale', impactAtPlus2C: 'Krill population reduction' },
      { name: 'Leatherback Turtle', speciesId: 'leatherback-turtle', impactAtPlus2C: 'Nesting beach inundation' },
    ],
  },
  {
    id: 'savanna',
    name: 'Savanna & Grassland',
    description: 'Open woodlands and tropical grasslands subject to seasonal dry spells and wildlife migrations.',
    color: '#f59e0b', // Amber
    icon: '🌾',
    temperatureRangeC: [18, 38],
    primaryThreat: 'Desertification & prolonged drought',
    keySpecies: [
      { name: 'African Lion', speciesId: 'lion', impactAtPlus2C: 'Waterhole depletion & prey dispersal' },
      { name: 'Giraffe', speciesId: 'giraffe', impactAtPlus2C: 'Acacia canopy degradation' },
    ],
  },
];
