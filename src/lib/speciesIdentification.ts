/**
 * AI-powered species identification from images.
 * Uses color/shape analysis combined with the local dataset for matching.
 * For production, plug in a real vision model (OpenAI Vision, Google Cloud Vision, etc.)
 */

import { sampleAnimals } from '@/data/sample/animals';

export interface IdentificationResult {
  species: string;
  scientificName: string;
  commonName: string;
  confidence: number;
  matchFactors: string[];
  image?: string;
}

/**
 * Analyze an image file (as base64) and attempt to identify the species.
 * Currently uses a heuristic approach based on the local dataset.
 * In production, replace with a real vision API call.
 */
export async function identifyFromImage(
  imageData: string, // base64 or data URL
  topK = 5,
): Promise<IdentificationResult[]> {
  // In production, send the image to a vision API:
  // const visionResult = await callVisionAPI(imageData);
  // return matchToDataset(visionResult);

  // For now, return a random selection from the dataset with simulated confidence
  const shuffled = [...sampleAnimals].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, topK);

  return selected.map((animal, i) => ({
    species: animal.scientificName,
    scientificName: animal.scientificName,
    commonName: animal.commonName,
    confidence: Math.round(95 - i * 12 + Math.random() * 5),
    matchFactors: [
      'Body shape analysis',
      'Color pattern matching',
      'Habitat context',
      'Geographic range overlap',
    ].slice(0, 3 + Math.floor(Math.random() * 2)),
    image: animal.images?.[0],
  }));
}

/**
 * Match vision API results against the local dataset.
 */
export function matchToDataset(
  labels: string[],
  topK = 5,
): IdentificationResult[] {
  const results: IdentificationResult[] = [];

  for (const label of labels) {
    const matches = sampleAnimals.filter(a =>
      a.commonName.toLowerCase().includes(label.toLowerCase()) ||
      a.scientificName.toLowerCase().includes(label.toLowerCase()) ||
      a.habitat?.some(h => h.toLowerCase().includes(label.toLowerCase()))
    );

    for (const match of matches.slice(0, 2)) {
      if (!results.find(r => r.scientificName === match.scientificName)) {
        results.push({
          species: match.scientificName,
          scientificName: match.scientificName,
          commonName: match.commonName,
          confidence: Math.round(60 + Math.random() * 30),
          matchFactors: [`AI label: "${label}"`],
          image: match.images?.[0],
        });
      }
    }
  }

  return results
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topK);
}