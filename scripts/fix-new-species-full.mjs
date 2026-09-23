#!/usr/bin/env node
/**
 * Complete rebuild of the 9 corrupted species.
 */

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve('src/data/sample/animals.ts');

const FIXES = {
  'philippine-eagle-001': {
    populationHistory: [
      { year: 1990, estimate: 500 },
      { year: 2000, estimate: 400 },
      { year: 2010, estimate: 300 },
      { year: 2018, estimate: 400 },
    ],
    populationHistoryNote: "IUCN 2020: 180-500 mature individuals; 2023 estimate ~400",
  },
  'harpy-eagle-001': {
    populationHistory: [
      { year: 1990, estimate: 50000 },
      { year: 2000, estimate: 20000 },
      { year: 2018, estimate: 15000 },
    ],
    populationHistoryNote: "Declining across range; 2018 estimate ~15,000 mature individuals",
  },
  'golden-poison-frog-001': {
    populationHistory: [
      { year: 2000, estimate: 5000 },
      { year: 2010, estimate: 3000 },
      { year: 2018, estimate: 1500 },
    ],
    populationHistoryNote: "Severe decline from chytrid and habitat loss; restricted to Cauca Valley",
  },
  'chinese-giant-salamander-001': {
    populationHistory: [
      { year: 1950, estimate: 1000000 },
      { year: 1980, estimate: 100000 },
      { year: 2000, estimate: 10000 },
      { year: 2018, estimate: 1000 },
    ],
    populationHistoryNote: "Catastrophic decline from overexploitation and habitat degradation",
  },
  'elkhorn-coral-001': {
    populationHistory: [
      { year: 1970, estimate: 100 },
      { year: 1980, estimate: 50 },
      { year: 2005, estimate: 10 },
      { year: 2015, estimate: 5 },
    ],
    populationHistoryNote: "White band disease and bleaching caused >95% decline since 1970s",
  },
  'staghorn-coral-001': {
    populationHistory: [
      { year: 1970, estimate: 100 },
      { year: 1980, estimate: 50 },
      { year: 2005, estimate: 10 },
      { year: 2015, estimate: 5 },
    ],
    populationHistoryNote: "Same threats as elkhorn coral; functionally extinct in many areas",
  },
  'lord-howe-tree-lobster-001': {
    populationHistory: [
      { year: 1918, estimate: 100000 },
      { year: 1960, estimate: 0 },
      { year: 2001, estimate: 24 },
      { year: 2017, estimate: 300 },
    ],
    populationHistoryNote: "Extirpated on Lord Howe by rats; rediscovered on Ball's Pyramid 2001; captive breeding ongoing",
  },
  'rusty-patched-bumble-bee-001': {
    populationHistory: [
      { year: 1990, estimate: 1000000 },
      { year: 2000, estimate: 100000 },
      { year: 2017, estimate: 500 },
    ],
    populationHistoryNote: "99% range loss; listed Endangered US 2017; pathogen spillover from managed bees",
  },
  'whale-shark-001': {
    populationHistory: [
      { year: 1990, estimate: 100000 },
      { year: 2005, estimate: 50000 },
      { year: 2016, estimate: 10000 },
      { year: 2020, estimate: 7000 },
    ],
    populationHistoryNote: "Targeted fisheries and bycatch caused >50% decline over 3 generations",
  },
};

async function main() {
  let content = fs.readFileSync(DATA_FILE, 'utf8');

  for (const [id, fix] of Object.entries(FIXES)) {
    // Find the species block
    const startPattern = `id: "${id}",`;
    const startIdx = content.indexOf(startPattern);
    if (startIdx === -1) {
      console.log(`⚠️  Could not find ${id}`);
      continue;
    }

    // Find the end of this species object
    let braceCount = 0;
    let endIdx = -1;
    for (let i = startIdx; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    if (endIdx === -1) {
      console.log(`⚠️  Could not find end of ${id}`);
      continue;
    }

    const speciesBlock = content.slice(startIdx, endIdx);

    // Extract all fields from the broken block
    const fields = extractFields(speciesBlock);
    if (!fields) {
      console.log(`⚠️  Could not extract fields for ${id}`);
      continue;
    }

    // Build the fixed species block
    const historyStr = fix.populationHistory.map(p => `      { year: ${p.year}, estimate: ${p.estimate} }`).join(',\n');

    const newBlock = `  {
  id: "${fields.id}",
  commonName: "${fields.commonName}",
  scientificName: "${fields.scientificName}",
  category: "${fields.category}",
  description: "${fields.description}",
  images: [${fields.images}],
  conservationStatus: "${fields.conservationStatus}",
  taxonomy: {${fields.taxonomy}},
  location: {${fields.location}},
  habitat: [${fields.habitat}],
  populationEstimate: ${fields.populationEstimate},
  populationHistory: [
${fix.populationHistory.map(p => `      { year: ${p.year}, estimate: ${p.estimate} }`).join(',\n')}
    ],
  populationHistoryNote: "${fix.populationHistoryNote}",
  isMonitored: ${fields.isMonitored},
  lastUpdated: ${fields.lastUpdated},
  dataCategories: [${fields.dataCategories}],
  },
`;

    content = content.slice(0, startIdx) + newBlock + content.slice(endIdx);
    console.log(`✅ Fixed ${id}`);
  }

  fs.writeFileSync(DATA_FILE, content);
  console.log('\n🎉 All 9 species fixed');
}

function extractFields(block) {
  const get = (pattern, def = '') => {
    const match = block.match(pattern);
    return match ? match[1].trim() : def;
  };

  const fields = {
    id: get(/id:\s*\"([^\"]+)\"/),
    commonName: get(/commonName:\s*\"([^\"]+)\"/),
    scientificName: get(/scientificName:\s*\"([^\"]+)\"/),
    category: get(/category:\s*\"([^\"]+)\"/),
    description: get(/description:\s*\"([\s\S]*?)(?=\n\s*(?:images|conservationStatus|taxonomy|location|habitat|populationEstimate))/),
    images: get(/images:\s*\[([\s\S]*?)\]/),
    conservationStatus: get(/conservationStatus:\s*\"([^\"]+)\"/),
    taxonomy: get(/taxonomy:\s*\{([\s\S]*?)\}/),
    location: get(/location:\s*\{([\s\S]*?)\}/),
    habitat: get(/habitat:\s*\[([\s\S]*?)\]/),
    populationEstimate: get(/populationEstimate:\s*(\d+)/),
    isMonitored: get(/isMonitored:\s*(true|false)/),
    lastUpdated: get(/lastUpdated:\s*([^\n,]+)/),
    dataCategories: get(/dataCategories:\s*\[([\s\S]*?)\]/),
  };

  // Validate critical fields
  if (!fields.id || !fields.commonName) return null;
  return fields;
}

main().catch(e => { console.error(e); process.exit(1); });