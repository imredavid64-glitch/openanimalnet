# Changelog

All notable changes to this project are documented in this file.

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
