// CI taxonomy check: for every species in the sample dataset, resolve the
// Wikidata item by scientific name, walk the P171 ancestor chain, pick the
// most specific extant class (bestClass), and compare it to the class
// recorded in src/data/sample/animals.ts.
//
// Exit code 1 if any recorded class disagrees with live Wikidata (the kind of
// bug that produced the African penguin's "Reptilia" class). Lookup failures
// (transient API errors, unknown species) are warnings, not failures, so the
// weekly job doesn't flake on network hiccups.
//
// Usage:
//   node .freebuff/check-taxonomy.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { bestClass } from './iucn-taxonomy.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ANIMALS_PATH = join(__dirname, '..', 'src', 'data', 'sample', 'animals.ts');

const UA = 'OpenAnimalNet-taxonomy-check/1.0 (maintenance script)';
const WIKIDATA = 'https://query.wikidata.org/sparql';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sparql(query, tries = 3) {
  const url = `${WIKIDATA}?${new URLSearchParams({ query })}`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA },
    });
    if (res.ok) return (await res.json()).results.bindings;
    if (attempt >= tries) throw new Error(`Wikidata HTTP ${res.status}`);
    await sleep(attempt * 2500);
  }
}

// Parse the sampleAnimals array (it can't be imported directly — it uses
// path-alias imports for its types).
function parseSpecies() {
  const src = readFileSync(ANIMALS_PATH, 'utf8');
  const chunks = src.split(/^  \{\n    id: /m).slice(1);
  return chunks.map((chunk) => {
    const id = chunk.slice(1, chunk.indexOf("',"));
    const scientificName = chunk.match(/scientificName: '([^']+)'/)?.[1] ?? null;
    const conservationStatus = chunk.match(/conservationStatus: '([^']+)'/)?.[1] ?? null;
    const klass = chunk.match(/      class: '([^']+)'/)?.[1] ?? null;
    return { id, scientificName, conservationStatus, class: klass };
  });
}

async function liveClass(scientificName) {
  const bindings = await sparql(`SELECT ?anc ?ancSciname ?rankLabel WHERE {
    VALUES ?sciname { "${scientificName}" }
    ?item wdt:P225 ?sciname .
    ?item wdt:P171+ ?anc .
    OPTIONAL { ?anc wdt:P105 ?rank . }
    OPTIONAL { ?anc wdt:P225 ?ancSciname . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`);
  const classRanks = [];
  for (const row of bindings) {
    if (row.rankLabel?.value?.toLowerCase() !== 'class') continue;
    classRanks.push(row.ancSciname?.value ?? row.anc.value.split('/').pop());
  }
  if (classRanks.length === 0) return null;
  return bestClass(classRanks);
}

async function main() {
  const species = parseSpecies();
  console.log(`Checking ${species.length} species against live Wikidata…\n`);

  let failures = 0;
  let warnings = 0;
  for (const sp of species) {
    let live;
    try {
      live = await liveClass(sp.scientificName);
    } catch (e) {
      console.log(`  ⚠ ${sp.id.padEnd(24)} lookup failed (${e.message}) — skipped`);
      warnings++;
      continue;
    }
    if (!live) {
      console.log(`  ⚠ ${sp.id.padEnd(24)} no class found on Wikidata (${sp.scientificName}) — could not verify`);
      warnings++;
      continue;
    }
    const recorded = sp.class;
    if (!recorded) {
      console.log(`  ⚠ ${sp.id.padEnd(24)} no class recorded in animals.ts — fill it in`);
      warnings++;
      continue;
    }
    if (recorded.toLowerCase() === live.toLowerCase()) {
      console.log(`  ✓ ${sp.id.padEnd(24)} ${recorded} (matches Wikidata)`);
    } else {
      console.log(`  ✗ ${sp.id.padEnd(24)} recorded ${recorded}, Wikidata says ${live}`);
      failures++;
    }
  }

  console.log(`\n${species.length - failures - warnings}/${species.length} verified, ${failures} mismatch(es), ${warnings} warning(s)`);
  if (failures > 0) {
    console.error('\nFAIL: taxonomy mismatches found — fix the recorded classes (run `node .freebuff/generate-species.mjs` for a live reference).');
    process.exit(1);
  }
  process.exit(0);
}

main();
