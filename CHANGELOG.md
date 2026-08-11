# Changelog

All notable changes to this project are documented in this file.

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
