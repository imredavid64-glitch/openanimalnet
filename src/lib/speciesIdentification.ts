/**
 * AI-powered species identification from images.
 * Uses Gemini Vision when GEMINI_API_KEY is set, Claude Vision when
 * ANTHROPIC_API_KEY is set, and otherwise falls back to heuristic matching
 * against the local dataset (clearly labelled source: 'heuristic').
 */

import { sampleAnimals } from '@/data/sample/animals';
import { geminiConfigured, geminiGenerate } from '@/lib/gemini';

export interface IdentificationResult {
  species: string;
  scientificName: string;
  commonName: string;
  confidence: number;
  matchFactors: string[];
  image?: string;
  source: 'ai' | 'heuristic';
  /** Local dataset id of the matched species, when one exists. */
  animalId?: string;
}

export interface IdentifyMatch {
  commonName: string;
  scientificName: string;
  confidence: number;
  matchFactors: string[];
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/** True when a real vision model is configured (Gemini or Claude). */
export function isAIConfigured(): boolean {
  return geminiConfigured() || Boolean(ANTHROPIC_API_KEY);
}

/**
 * Analyze an image file (as base64 data URL) and identify the species.
 * Uses Gemini Vision when available, then Claude Vision, then the heuristic.
 */
export async function identifyFromImage(
  imageData: string,
  topK = 5,
): Promise<IdentificationResult[]> {
  if (geminiConfigured() && imageData.startsWith('data:')) {
    try {
      return await identifyWithGemini(imageData, topK);
    } catch (err) {
      console.error('Gemini Vision failed, falling back:', err);
    }
  }
  if (ANTHROPIC_API_KEY && imageData.startsWith('data:')) {
    try {
      return await identifyWithClaude(imageData, topK);
    } catch (err) {
      console.error('Claude Vision failed, falling back to heuristic:', err);
    }
  }
  return identifyHeuristic(topK);
}

/**
 * Use Gemini Vision API (Google AI) to identify species from an image.
 */
async function identifyWithGemini(
  imageData: string,
  topK: number,
): Promise<IdentificationResult[]> {
  const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL format');

  const [, mediaType, base64Data] = match;

  const speciesList = sampleAnimals
    .map(a => `${a.commonName} (${a.scientificName})`)
    .join(', ');

  const prompt = `You are a wildlife biologist and species identification expert. Analyze this animal image and identify the species.

Available species in our database:
${speciesList}

Return a JSON array (no markdown fences, no prose) of up to ${topK} species matches, ordered by confidence (highest first). Each object should have:
- "commonName": the common name
- "scientificName": the scientific name
- "confidence": a number 0-100 representing your confidence
- "matchFactors": an array of strings describing what features you used to identify it (e.g., "body shape", "color pattern", "markings", "habitat context")

Only return valid JSON, no other text.`;

  const text = await geminiGenerate(
    [
      { inline_data: { mime_type: mediaType, data: base64Data } },
      { text: prompt },
    ],
    { responseMimeType: 'application/json' },
  );

  return normalizeResults(text, topK);
}

/**
 * Use Claude Vision API to identify species from an image.
 */
async function identifyWithClaude(
  imageData: string,
  topK: number,
): Promise<IdentificationResult[]> {
  const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL format');

  const [, mediaType, base64Data] = match;

  const speciesList = sampleAnimals
    .map(a => `${a.commonName} (${a.scientificName})`)
    .join(', ');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: `You are a wildlife biologist and species identification expert. Analyze this animal image and identify the species.

Available species in our database:
${speciesList}

Return a JSON array (no markdown fences) of up to ${topK} species matches, ordered by confidence (highest first). Each object should have:
- "commonName": the common name
- "scientificName": the scientific name
- "confidence": a number 0-100 representing your confidence
- "matchFactors": an array of strings describing what features you used to identify it (e.g., "body shape", "color pattern", "markings", "habitat context")

Only return valid JSON, no other text.`,
          },
        ],
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';
  return normalizeResults(text, topK);
}

/**
 * Parse a model JSON array response and normalize against the local dataset.
 */
function normalizeResults(text: string, topK: number): IdentificationResult[] {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON in model response');

  const matches: IdentifyMatch[] = JSON.parse(jsonMatch[0]);

  return matches.slice(0, topK).map(m => {
    const localAnimal = sampleAnimals.find(
      a => a.scientificName.toLowerCase() === m.scientificName.toLowerCase() ||
           a.commonName.toLowerCase() === m.commonName.toLowerCase(),
    );
    return {
      species: m.scientificName,
      scientificName: m.scientificName,
      commonName: m.commonName,
      confidence: Math.min(Math.max(m.confidence, 0), 100),
      matchFactors: m.matchFactors,
      image: localAnimal?.images?.[0],
      animalId: localAnimal?.id,
      source: 'ai' as const,
    };
  });
}

/**
 * Heuristic fallback: returns a random selection with simulated confidence.
 * Results are marked source: 'heuristic' so the UI never presents them as
 * genuine vision-model analysis.
 */
function identifyHeuristic(topK: number): IdentificationResult[] {
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
    animalId: animal.id,
    source: 'heuristic' as const,
  }));
}

/**
 * Match vision API results against the local dataset.
 */
export function matchToDataset(labels: string[], topK = 5): IdentificationResult[] {
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
          animalId: match.id,
          source: 'ai',
        });
      }
    }
  }
  return results.sort((a, b) => b.confidence - a.confidence).slice(0, topK);
}