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
import { STATUS_BY_QID } from './iucn-taxonomy.mjs';

// Documented exceptions where Wikidata's P141 is stale or absent, verified
// against the IUCN Red List on 2026-08-11. Remove an entry once Wikidata
// catches up — the checker then validates the recorded status normally.
const STATUS_EXCEPTIONS = {
  // IUCN 2022 lists the monarch (Danaus plexippus, ID 159971) as Endangered;
  // Wikidata's P141 still reads Least Concern (pre-2022 assessment).
  159971: 'EN',
  // Amur leopard: the subspecies item (Q192967) carries no P627/P141 on
  // Wikidata. The subspecies is assessed Critically Endangered within the 2020
  // global Panthera pardus assessment (IUCN ID 15954).
  15954: 'CR',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function queryWikidata(scientificName) {
  const query = `SELECT ?item ?itemLabel ?iucn ?status WHERE {
    VALUES ?sciname { "${scientificName}" }
    ?item wdt:P225 ?sciname .
    OPTIONAL { ?item wdt:P627 ?iucn . }
    OPTIONAL { ?item wdt:P141 ?status . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;
  const url = `${WIKIDATA_ENDPOINT}?${new URLSearchParams({ query })}`;
  // Wikidata's SPARQL endpoint is rate-limited (429/502 under load); retry
  // with backoff so a transient hiccup doesn't false-positive the drift check.
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': 'OpenAnimalNet-data-check/1.0 (https://github.com/imredavid64-glitch/openanimalnet; data freshness checker)',
      },
    });
    if (res.ok) {
      const json = await res.json();
      return json.results.bindings;
    }
    if (attempt >= 4) throw new Error(`Wikidata HTTP ${res.status}`);
    await sleep(attempt * 3000);
  }
}

async function wikipediaExists(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  const res = await fetch(url);
  return res.ok;
}

async function checkSpecies(source) {
  const findings = [];
  let statusNote = null;
  try {
    const bindings = await queryWikidata(source.scientificName);
    const exact = bindings.find((b) => b.itemLabel?.value === source.scientificName) ?? bindings[0];
    if (!exact) {
      findings.push({ field: 'wikidata', ok: false, detail: 'no Wikidata item found for scientific name' });
    } else {
      const liveIucn = exact.iucn ? Number(exact.iucn.value) : null;
      if (liveIucn !== source.iucnId) {
        if (liveIucn === null && STATUS_EXCEPTIONS[source.iucnId]) {
          // Subspecies/other item carries no P627; recorded ID is the covering
          // assessment — accept.
          statusNote = statusNote ?? `IUCN ID exception (no P627 on Wikidata item; recorded ${source.iucnId})`;
        } else {
          findings.push({
            field: 'iucnId',
            ok: false,
            detail: `recorded ${source.iucnId ?? 'none'} vs live ${liveIucn ?? 'none'} (${exact.itemLabel.value})`,
          });
        }
      }
      const liveStatus = exact.status ? STATUS_BY_QID[exact.status.value.split('/').pop()] ?? '?' : 'NE';
      if (STATUS_EXCEPTIONS[source.iucnId]) {
        // Documented staleness/absence — accept the recorded status.
        statusNote = `status exception (Wikidata ${liveStatus}, recorded ${source.conservationStatus})`;
      } else if (liveStatus !== source.conservationStatus) {
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
  return { findings, statusNote };
}

async function main() {
  const failOnDrift = process.argv.includes('--fail');
  let mismatches = 0;
  console.log(`\nChecking ${speciesSources.length} species against live sources…\n`);

  for (const source of speciesSources) {
    const { findings, statusNote } = await checkSpecies(source);
    if (findings.length === 0) {
      console.log(
        `  ✓ ${source.commonName.padEnd(28)} ${source.conservationStatus} · IUCN ${source.iucnId ?? '—'} · wiki OK` +
          (statusNote ? ` · ${statusNote}` : '')
      );
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
