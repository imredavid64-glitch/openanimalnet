#!/usr/bin/env node
/**
 * Fix the 9 species that had broken regex replacements.
 */

import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve('src/data/sample/animals.ts');

const SPECIES_FIXES = {
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

  for (const [id, fix] of Object.entries(SPECIES_FIXES)) {
    // Find the species block - look for the broken pattern
    const brokenPattern = new RegExp(`(id: \"${id}\",[\\s\\S]*?populationEstimate:\\s*\\d+,[\\s\\S]*?)(dataCategories:|isMonitored:|lastUpdated:)[\\s\\S]*?(\\s*\\n    \\},)`);

    // Better approach: find the species block boundaries and rebuild correctly
    const startPattern = `id: \"${id}\",`;
    const startIdx = content.indexOf(startPattern);
    if (startIdx === -1) {
      console.log(`⚠️  Could not find ${id}`);
      continue;
    }

    // Find the end of this species object (next "  },")
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

    // Check if it's broken (has $2 or populationHistory inside dataCategories)
    if (!speciesBlock.includes('$2') && !speciesBlock.includes('dataCategories:\n    populationHistory')) {
      console.log(`⏭️  ${id} appears OK`);
      continue;
    }

    console.log(`🔧 Fixing ${id}...`);

    // Rebuild the species object properly
    const newBlock = rebuildSpeciesBlock(speciesBlock, fix);
    content = content.slice(0, startIdx) + newBlock + content.slice(endIdx);
    console.log(`✅ Fixed ${id}`);
  }

  fs.writeFileSync(DATA_FILE, content);
  console.log('\n🎉 All species fixed');
}

function rebuildSpeciesBlock(oldBlock, fix) {
  // Extract key fields from old block
  const idMatch = oldBlock.match(/id:\s*\"([^\"]+)\"/);
  const commonNameMatch = oldBlock.match(/commonName:\s*\"([^\"]+)\"/);
  const scientificNameMatch = oldBlock.match(/scientificName:\s*\"([^\"]+)\"/);
  const categoryMatch = oldBlock.match(/category:\s*\"([^\"]+)\"/);
  const descriptionMatch = oldBlock.match(/description:\s*\"([\s\S]*?)\"/);
  const imagesMatch = oldBlock.match(/images:\s*\[([\s\S]*?)\]/);
  const conservationStatusMatch = oldBlock.match(/conservationStatus:\s*\"([^\"]+)\"/);
  const taxonomyMatch = oldBlock.match(/taxonomy:\s*\{([\s\S]*?)\}/);
  const locationMatch = oldBlock.match(/location:\s*\{([\s\S]*?)\}/);
  const habitatMatch = oldBlock.match(/habitat:\s*\[([\s\S]*?)\]/);
  const populationEstimateMatch = oldBlock.match(/populationEstimate:\s*(\d+)/);
  const isMonitoredMatch = oldBlock.match(/isMonitored:\s*(true|false)/);
  const lastUpdatedMatch = oldBlock.match(/lastUpdated:\s*([^\n,]+)/);
  const dataCategoriesMatch = oldBlock.match(/dataCategories:\s*\[([\s\S]*?)\]/);

  const historyStr = fix.populationHistory.map(p => `      { year: ${p.year}, estimate: ${p.estimate} }`).join(',\n');

  return `  {
  id: "${idMatch?.[1] || ''}",
  commonName: "${commonNameMatch?.[1] || ''}",
  scientificName: "${scientificNameMatch?.[1] || ''}",
  category: "${categoryMatch?.[1] || ''}",
  description: "${descriptionMatch?.[1] || ''}",
  images: [${imagesMatch?.[1] || ''}],
  conservationStatus: "${conservationStatusMatch?.[1] || ''}",
  taxonomy: {${taxonomyMatch?.[1] || ''}},
  location: {${locationMatch?.[1] || ''}},
  habitat: [${habitatMatch?.[1] || ''}],
  populationEstimate: ${populationEstimateMatch?.[1] || '0'},
  populationHistory: [
${historyStr}
    ],
  populationHistoryNote: "${fix.populationHistoryNote}",
  isMonitored: ${isMonitoredMatch?.[1] || 'true'},
  lastUpdated: ${lastUpdatedMatch?.[1] || "new Date('2026-08-11')"},
  dataCategories: [${dataCategoriesMatch?.[1] || ''}],
  },
`;
}

main().catch(e => { console.error(e); process.exit(1); });