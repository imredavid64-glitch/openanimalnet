# Changelog

All notable changes to this project are documented in this file.

## [1.5.0] - 2026-08-12

### Added
- **Bulk species generation**: 8 new species (27 total) added with the
  generator — Red Panda (EN), Axolotl (CR, first amphibian), African Penguin
  (CR, first bird), Leatherback Sea Turtle (VU), Proboscis Monkey (EN),
  Saiga Antelope (NT), Golden Lion Tamarin (EN), and Vaquita (CR, ~10
  remaining). Each has a real photo, a Wikidata-verified IUCN assessment,
  and current census figures checked against 2023–2026 sources. Population
  timeline series added for the vaquita's collapse (567→8), saiga's
  recovery (21k→4.6M), African penguin (70k→8.75k pairs), leatherback nests
  (90.6k→54.3k), axolotl (6,000→36), and golden lion tamarin (200→4,800).
- **`npm run species:add`** — the generator is now wired into a command:
  `npm run species:add -- "Panthera uncia"` (add `-- --apply` to write the
  files). Auto-verifies the registry against live Wikidata after applying.
- **Generator robustness**: when the lead image is an SVG diagram (e.g. the
  vaquita's size chart), the generator now falls back to the article's first
  real JPEG photo. Images are deduplicated and human-review fields
  (population, habitat, location) get filled in after generation.

### Fixed
- **Two more wrong IUCN status QIDs in the checker/generator**: Q214984 is
  the taxonomy rank "division", not Near Threatened (correct: Q719675);
  Q209175 is the actress Kim Cattrall, not Extinct (correct: Q237350);
  Q552752 is a cardinal, not Extinct in the Wild (correct: Q239509). The
  old values were never exercised until the Saiga (NT) was added.
- African penguin was generated with class Reptilia and category "reptiles"
  (Wikidata's P171 chain passes birds through Reptilia); corrected to Aves
  / "birds". Leatherback's synonym name "Trunkback Turtle" corrected.

## [1.4.0] - 2026-08-11

### Added
- **Population timeline chart**: every animal detail page now charts the
  species' historical population series (censuses/surveys) with the current
  estimate and a per-species unit/caveat note. 12 of 19 species have verified
  series (e.g. Amur leopard's recovery 25→130, monarch's western collapse
  4.5M→9,119, Komodo 5,000→3,458) — each figure checked against current
  sources on 2026-08-11.
- **Species generator** (`node .freebuff/generate-species.mjs [--apply]`):
  builds complete Animal + SpeciesSource entries from live Wikidata/Wikipedia
  — full taxonomy via the P171 ancestor chain, IUCN assessment ID (P627),
  conservation status (P141), lead photo, and description. Census figures
  remain a human-reviewed TODO step. Proved by adding the **Snow Leopard**
  (19th species, VU, ~7,500 per latest IUCN CatSG estimate).

### Fixed
- Generator: the JPEG magic check compared 3 bytes against a 2-byte string
  (never matched); fixed to a prefix check.

## [1.3.0] - 2026-08-11

### Added
- **7 new species** (18 total): Polar Bear (VU), Bornean Orangutan (CR),
  Amur Leopard (CR), Giraffe (VU), Koala (VU), Monarch Butterfly (EN),
  Komodo Dragon (EN) — each with a real photo, verified IUCN assessment ID,
  current population estimate, and source links.
- **Source links on animal detail pages**: every species page now shows its
  Wikipedia article, IUCN Red List assessment, and the source note for its
  population figure.
- **Auto-deploy on push**: `.github/workflows/deploy.yml` deploys production
  to Vercel via `vercel-action` on every push to `main` (secrets:
  `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`).
- **Data drift watch**: `.github/workflows/data-drift.yml` runs the freshness
  checker weekly (Mondays 03:00 UTC, manually triggerable) and fails if any
  species' IUCN status/ID or Wikipedia article has drifted.

### Fixed
- The freshness checker's Critically Endangered mapping was wrong: Wikidata
  Q21983152 is a mountain range, not a status — the correct CR QID is Q219127
  (would have mis-reported any CR species).
- Freshness checker now retries Wikidata's transient 429/502s with backoff and
  documents two known Wikidata gaps (monarch P141 stale at LC vs IUCN 2022 EN;
  Amur leopard subspecies item lacks P627/P141) as explicit exceptions.

## [1.2.0] - 2026-08-11

### Added
- **Data Sources page** (`/sources`): a source index linking every species to
  its Wikipedia article and official IUCN Red List assessment, with population
  notes. IUCN assessment IDs were verified via Wikidata (P627) on 2026-08-11.
- **Data freshness checker** (`npm run refresh:data`): re-verifies every
  species' IUCN assessment ID and status against live Wikidata and checks each
  Wikipedia article exists — no dependencies, Node-only.

### Fixed
- **Western honey bee** status corrected from Not Evaluated to **Data
  Deficient** (it has a 2014 global IUCN assessment; Wikidata ID 42463639).

### Changed
- Methodology page now cites the bee's DD assessment and links to the sources
  index; footer links to the new page.
- Local git operations on this machine sped up from minutes to milliseconds by
  packing all objects into a single pack file (the antivirus scanners were
  blocking reads of loose objects); see `.freebuff/run.md`.

## [1.1.0] - 2026-08-10

### Added
- **Pages**: 20 previously-missing routes now render — `/about`, `/methodology`,
  `/partners`, `/careers`, `/docs`, `/api`, `/community`, `/contact`,
  `/privacy`, `/terms`, `/cookies`, a `/data` explorer hub with the five data
  category pages, `/monitor/coverage`, and `/monitor/[id]` (data-driven
  per-animal monitoring page).
- **Alert detail pages**: each monitoring alert has a dedicated route at
  `/monitor/alerts/[id]`; alert cards and the detail modal link to them.
- **API**: six public JSON endpoints under `/api/v1/*` (animals with filters
  and pagination, animal profiles, populations, monitoring alerts, monitoring
  stats, telemetry locations) with per-IP rate limiting and cache headers.
- **Dashboard**: metric cards now fetch live stats from `/api/v1/monitoring/stats`
  with a loading state and graceful fallback to bundled data.
- **Dark mode**: navbar toggle with `localStorage` persistence and a no-flash
  inline script; Tailwind switched to class-based dark mode.
- **Tests**: 19 unit tests (filtering, rate limiter) and 12 API integration
  tests, runnable via `npm test` and `npm run test:api`.
- **CI**: GitHub Actions workflow running lint, unit tests, build, and API
  integration tests on every push and pull request.
- **Globe texture**: real equirectangular earth map at `public/images/earth.jpg`.

### Fixed
- TypeScript errors in `SimpleWorldMap`, `MonitoringAlerts`, `StatsDashboard`,
  and the missing `target` in `tsconfig.json` (6 errors total).
- React hydration errors (418/423/425) caused by `Date.now()` sample alert
  timestamps; timestamps are now fixed and time elements carry
  `suppressHydrationWarning`.
- The `/animal` page ignored `?category=` and `?isMonitored=` URL params; they
  now initialize the filters on load.
- Removed three unused dependencies (`zustand`, `date-fns`, `tailwind-merge`)
  and an unused import in the animal page.

### Changed
- Alert sample data moved to a shared module (`src/data/sample/alerts.ts`);
  population trend data moved into `sampleMonitoringData`.
- Animal filter/sort logic extracted into a pure, unit-tested module
  (`src/lib/animalFiltering.ts`).

## [1.0.0] - 2026-08-08

- Initial release: interactive globe, monitoring alerts, animal database,
  dashboard, AI assistant, and full data model.
