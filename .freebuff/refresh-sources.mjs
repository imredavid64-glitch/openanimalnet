#!/usr/bin/env node
/**
 * Data freshness checker.
 *
 * Re-verifies every species in the sample dataset against live sources:
 *   - IUCN Red List assessment ID + conservation status, from Wikidata
 *     (properties P627 "IUCN taxon ID" and P141 "IUCN Red List status")
 *   - Wikipedia article existence, from the Wikipedia REST API
 *
 * Prints a ✓/⚠ report. Exits 0 on success (or 1 with --fail when any entry
 * drifted from its recorded source). No dependencies — runs on Node ≥ 22.6
 * (type stripping) against the shared registry in src/data/sample/sources.ts.
 *
 * Usage:
 *   node .freebuff/refresh-sources.mjs            # report only
 *   node .freebuff/refresh-sources.mjs --fail     # exit 1 on any mismatch
 */

import { speciesSources } from '../src/data/sample/sources.ts';

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';

// Wikidata Q-IDs for IUCN Red List categories (property P141 values).
const STATUS_BY_QID = {
  Q21983152: 'CR', // Critically Endangered
  Q96377276: 'EN', // Endangered
  Q278113: 'VU',   // Vulnerable
  Q214984: 'NT',   // Near Threatened
  Q211005: 'LC',   // Least Concern
  Q3245245: 'DD',  // Data Deficient
  Q209175: 'EX',   // Extinct
  Q552752: 'EW',   // Extinct in the Wild
};

async function queryWikidata(scientificName) {
  const query = `SELECT ?item ?itemLabel ?iucn ?status WHERE {
    VALUES ?sciname { "${scientificName}" }
    ?item wdt:P225 ?sciname .
    OPTIONAL { ?item wdt:P627 ?iucn . }
    OPTIONAL { ?item wdt:P141 ?status . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;
  const url = `${WIKIDATA_ENDPOINT}?${new URLSearchParams({ query })}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'OpenAnimalNet-data-check/1.0 (https://github.com/imredavid64-glitch/openanimalnet; data freshness checker)',
    },
  });
  if (!res.ok) throw new Error(`Wikidata HTTP ${res.status}`);
  const json = await res.json();
  return json.results.bindings;
}

async function wikipediaExists(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  const res = await fetch(url);
  return res.ok;
}

async function checkSpecies(source) {
  const findings = [];
  try {
    const bindings = await queryWikidata(source.scientificName);
    const exact = bindings.find((b) => b.itemLabel?.value === source.scientificName) ?? bindings[0];
    if (!exact) {
      findings.push({ field: 'wikidata', ok: false, detail: 'no Wikidata item found for scientific name' });
    } else {
      const liveIucn = exact.iucn ? Number(exact.iucn.value) : null;
      if (liveIucn !== source.iucnId) {
        findings.push({
          field: 'iucnId',
          ok: false,
          detail: `recorded ${source.iucnId ?? 'none'} vs live ${liveIucn ?? 'none'} (${exact.itemLabel.value})`,
        });
      }
      const liveStatus = exact.status ? STATUS_BY_QID[exact.status.value.split('/').pop()] ?? '?' : 'NE';
      if (liveStatus !== source.conservationStatus) {
        findings.push({
          field: 'status',
          ok: false,
          detail: `recorded ${source.conservationStatus} vs live ${liveStatus}`,
        });
      }
    }

    const wikiOk = await wikipediaExists(source.wikipediaTitle);
    if (!wikiOk) {
      findings.push({ field: 'wikipedia', ok: false, detail: `article "${source.wikipediaTitle}" not found` });
    }
  } catch (err) {
    findings.push({ field: 'network', ok: false, detail: err.message });
  }
  return findings;
}

async function main() {
  const failOnDrift = process.argv.includes('--fail');
  let mismatches = 0;
  console.log(`\nChecking ${speciesSources.length} species against live sources…\n`);

  for (const source of speciesSources) {
    const findings = await checkSpecies(source);
    if (findings.length === 0) {
      console.log(`  ✓ ${source.commonName.padEnd(28)} ${source.conservationStatus} · IUCN ${source.iucnId ?? '—'} · wiki OK`);
    } else {
      mismatches += findings.length;
      console.log(`  ⚠ ${source.commonName.padEnd(28)}`);
      for (const f of findings) {
        console.log(`      ${f.field}: ${f.detail}`);
      }
    }
  }

  const status = mismatches === 0 ? 'ALL CURRENT' : `${mismatches} drift(s) found`;
  console.log(`\n${'─'.repeat(52)}\n${status}\n`);
  if (mismatches > 0 && failOnDrift) process.exit(1);
}

main().catch((err) => {
  console.error('refresh-sources failed:', err);
  process.exit(1);
});
