// Data sources registry — the authoritative source links for every species in
// the sample dataset. Wikipedia article titles were resolved via the Wikipedia
// REST API; IUCN Red List assessment IDs were verified against Wikidata
// (property P627, the IUCN taxon ID) on 2026-08-11.
//
// This file is intentionally free of path aliases so plain Node (e.g. the
// `.freebuff/refresh-sources.mjs` checker) can import it directly.

export interface SpeciesSource {
  animalId: string;
  commonName: string;
  scientificName: string;
  /** Wikipedia article title (URL-encoded when building the link). */
  wikipediaTitle: string;
  /** IUCN Red List assessment ID, or null for species with no assessment. */
  iucnId: number | null;
  conservationStatus: string;
  /** Short human-readable source note for the population estimate. */
  populationNote: string;
}

export const speciesSources: SpeciesSource[] = [
  {
    animalId: 'lion-001',
    commonName: 'African Lion',
    scientificName: 'Panthera leo',
    wikipediaTitle: 'Lion',
    iucnId: 15951,
    conservationStatus: 'VU',
    populationNote: '~23,000 wild (IUCN 2023 assessment)',
  },
  {
    animalId: 'elephant-001',
    commonName: 'African Bush Elephant',
    scientificName: 'Loxodonta africana',
    wikipediaTitle: 'African bush elephant',
    iucnId: 181008073,
    conservationStatus: 'EN',
    populationNote: '~415,000 (2016 Great Elephant Census; IUCN 2021)',
  },
  {
    animalId: 'tiger-001',
    commonName: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    wikipediaTitle: 'Bengal tiger',
    iucnId: 136899,
    conservationStatus: 'EN',
    populationNote: '3,682 in India (2022 All-India Tiger Census); ~5,574 global (2015)',
  },
  {
    animalId: 'eagle-001',
    commonName: 'Bald Eagle',
    scientificName: 'Haliaeetus leucocephalus',
    wikipediaTitle: 'Bald eagle',
    iucnId: 22695144,
    conservationStatus: 'LC',
    populationNote: '~316,700 (USFWS 2020 breeding survey)',
  },
  {
    animalId: 'whale-001',
    commonName: 'Blue Whale',
    scientificName: 'Balaenoptera musculus',
    wikipediaTitle: 'Blue whale',
    iucnId: 2477,
    conservationStatus: 'EN',
    populationNote: '~15,000 (NOAA/IWC global estimate)',
  },
  {
    animalId: 'panda-001',
    commonName: 'Giant Panda',
    scientificName: 'Ailuropoda melanoleuca',
    wikipediaTitle: 'Giant panda',
    iucnId: 712,
    conservationStatus: 'VU',
    populationNote: '~1,900 wild (2024 census)',
  },
  {
    animalId: 'shark-001',
    commonName: 'Great White Shark',
    scientificName: 'Carcharodon carcharias',
    wikipediaTitle: 'Great white shark',
    iucnId: 3855,
    conservationStatus: 'VU',
    populationNote: 'Uncertain, 30–49% decline (IUCN 2018 assessment)',
  },
  {
    animalId: 'gorilla-001',
    commonName: 'Mountain Gorilla',
    scientificName: 'Gorilla beringei beringei',
    wikipediaTitle: 'Mountain gorilla',
    iucnId: 39999,
    conservationStatus: 'EN',
    populationNote: '1,063 (2018 Virunga census, reference figure)',
  },
  {
    animalId: 'dolphin-001',
    commonName: 'Common Bottlenose Dolphin',
    scientificName: 'Tursiops truncatus',
    wikipediaTitle: 'Common bottlenose dolphin',
    iucnId: 22563,
    conservationStatus: 'LC',
    populationNote: '~600,000 est. (regional surveys, global total unknown)',
  },
  {
    animalId: 'bee-001',
    commonName: 'Western Honey Bee',
    scientificName: 'Apis mellifera',
    wikipediaTitle: 'Western honey bee',
    iucnId: 42463639,
    conservationStatus: 'DD',
    populationNote: 'Managed colonies >80M; wild populations not quantified (IUCN 2014, Data Deficient)',
  },
  {
    animalId: 'cow-001',
    commonName: 'Holstein Cow',
    scientificName: 'Bos taurus',
    wikipediaTitle: 'Holstein Friesian',
    iucnId: null,
    conservationStatus: 'NE',
    populationNote: 'Domesticated breed — not IUCN-assessed; ~9M dairy cows in the US, majority Holstein',
  },
];
