# Data Sources & Verification

OpenAnimalNet cross-references every species against **four independent live
sources** to ensure accuracy. No API keys are required for any of them.

## Sources

### 1. Wikidata / IUCN Red List

The primary source for conservation status. Each species has an IUCN assessment
ID (e.g., `Q219386` for African Lion) that links to the official IUCN Red List
entry. The verifier checks that:

- The IUCN assessment ID exists and is valid
- The conservation status matches what we record (CR/EN/VU/NT/LC/DD/NE)
- The Wikipedia article exists for the species

**API**: Wikidata SPARQL endpoint (`query.wikidata.org`)

### 2. Wikipedia

Provides the species description, photos (via Wikimedia Commons), and links to
further reading. Each species has a `wikipediaTitle` that maps to an English
Wikipedia article.

**API**: MediaWiki REST API (`en.wikipedia.org/api/rest_v1`)

### 3. GBIF (Global Biodiversity Information Facility)

The backbone taxonomy service. Each species has a `gbifKey` that resolves to an
accepted taxonomic record. The verifier checks that:

- The scientific name resolves to an accepted record (handling synonyms)
- The taxonomic family matches what we record
- The GBIF key is current (not pointing to a merged/suppressed record)

**API**: GBIF Species API (`api.gbif.org/v1/species`)

GBIF is also the source for **live occurrence data** — the `/api/v1/live/sync`
endpoint pulls recent georeferenced occurrences from the GBIF Occurrence API
(`api.gbif.org/v1/occurrence/search`) with a 60-second cache.

### 4. iNaturalist

Provides independently observed conservation status. Each species has an
`inaturalistId` that maps to a taxon record. The verifier checks that:

- The taxon exists and matches our scientific name
- The iNaturalist conservation status matches our recorded status

**API**: iNaturalist API v1 (`api.inaturalist.org/v1`)

## Verification Scripts

### Quick verify (read-only)

```bash
npm run verify:data
```

Cross-checks all 28 species across all four sources. Exits with code 0 if all
pass, non-zero if any drift is detected.

### Verify and fix keys

```bash
npm run verify:data -- --apply
```

Same as above, but also writes resolved GBIF keys and iNaturalist IDs back to
`src/data/sample/sources.ts`. Use after adding new species or when a key needs
updating.

### CI mode (fail on drift)

```bash
npm run verify:data -- --fail
```

Exits with non-zero status if any problems are found. Used in the weekly
data-drift CI job.

### Wikidata + Wikipedia only

```bash
npm run refresh:data
```

Faster check against just Wikidata and Wikipedia. Good for quick freshness
checks.

### Taxonomy consistency

```bash
npm run check:taxonomy
```

Verifies that taxonomic classifications (kingdom, phylum, class, order, family,
genus, species) are consistent across the dataset and match external sources.

## Adding New Species

```bash
# Preview what would be generated:
npm run species:add -- "Panthera uncia"

# Generate and write files:
npm run species:add -- --apply "Panthera uncia"

# Multiple species at once:
npm run species:add -- --apply "Phocoena sinus" "Ailurus fulgens"
```

The generator pulls taxonomy, IUCN assessment ID, status, photo, and
description from Wikidata/Wikipedia. Population estimates and census figures
should be reviewed by hand.

## Data Freshness

A weekly scheduled GitHub Action (`.github/workflows/data-drift.yml`) runs the
full verification suite and fails if any species has drifted from the live
sources. This catches:

- IUCN status changes (e.g., a species being uplisted from VU to EN)
- Taxonomic reclassifications
- Wikipedia article deletions or renames
- GBIF key deprecations

## Population History Data

Every species profile includes a `populationHistory` array with documented
data points from census reports, surveys, and IUCN assessments. Each entry
has a `populationHistoryNote` citing the source:

| Species | Source |
|---------|--------|
| African Elephant | Great Elephant Census (2016) |
| Bengal Tiger | All-India Tiger Census |
| Bald Eagle | USFWS nesting pair surveys |
| Blue Whale | NOAA/IWC global estimate |
| Polar Bear | IUCN Polar Bear Specialist Group |
| Koala | National Koala Monitoring Program (2025) |
| Red Panda | IUCN 2015 assessment |
| Proboscis Monkey | Sabah/Sarawak surveys (2008-2019) |

## Source Links on Profiles

Each animal profile page links to:

- **Wikipedia** article for the species
- **IUCN Red List** assessment page
- **GBIF** species page (with taxonomic details)
- **iNaturalist** taxon page (with observation counts)

The `/sources` page provides an overview of all verification sources and their
role in ensuring data accuracy.
