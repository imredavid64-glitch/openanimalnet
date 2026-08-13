# Architecture

OpenAnimalNet is a **Next.js 14 App Router** application with a clear
separation between data ingestion, verification, and presentation.

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    External Sources (no API keys)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  GBIF    │  │ Wikidata │  │ Wikipedia│  │iNaturalist│   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼──────────────┼──────────────┼──────────────┼────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                       │
│  /api/v1/live/sync    /api/v1/animals    /api/v1/monitoring │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Globe   │  │ Dashboard│  │ Monitor  │  │ AI Tools │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Data Layer

### Source Registry (`src/data/sample/`)

All species data lives in TypeScript files that are imported directly at
build time. No database required.

- **`animals.ts`** — 28 species with full profiles, population history,
  migration routes, and five data categories
- **`sources.ts`** — Per-species verification keys (Wikidata ID, IUCN
  assessment ID, GBIF key, iNaturalist ID, Wikipedia title)
- **`alerts.ts`** — Monitoring alerts with severity, location, and species
  references
- **`shelters.ts`** — Companion animal shelter directory
- **`assistance.ts`** — Service animal organizations and accessible facilities

### Verification Tooling (`.freebuff/`)

Offline scripts that cross-check the source registry against live APIs:

| Script | Purpose | Run |
|--------|---------|-----|
| `verify-multisource.mjs` | Verify all species across 4 sources | `npm run verify:data` |
| `refresh-sources.mjs` | Wikidata + Wikipedia freshness check | `npm run refresh:data` |
| `check-taxonomy.mjs` | Taxonomic consistency check | `npm run check:taxonomy` |
| `generate-species.mjs` | Generate new species from Wikidata | `npm run species:add` |
| `fetch-animal-images.js` | Download species photos from Wikipedia | `node .freebuff/fetch-animal-images.js` |

### Live Ingestion (`src/lib/liveGbf.ts`)

The GBIF occurrence API is called server-side with a 60-second per-instance
cache. No API key is required. The response is filtered to georeferenced
occurrences within the last 365 days.

## Component Architecture

### Map Components

- **`InteractiveGlobe.tsx`** — Three.js globe with species markers, migration
  routes, conservation-status color coding, search, and filter chips
- **`SimpleWorldMap.tsx`** — Lightweight SVG world map (fallback for
  performance-constrained devices)
- **`MiniRouteMap.tsx`** — Per-species SVG map showing migration corridors
  with season coloring and distance labels

### AI Components

- **`ConflictPredictor.tsx`** — GPS-coordinate input → risk score based on
  distance to migration corridors + wildlife-trafficking proximity
- **`HabitatSimulator.tsx`** — Temperature/deforestation sliders → 30-year
  population projection chart
- **`AIAssistant.tsx`** — Natural-language interface to the dataset

### Monitor Components

- **`MonitoringAlerts.tsx`** — Alert list with severity filtering and
  click-to-expand details
- **`AlertActionCenter.tsx`** — Critical alert workflow: ranger dispatch,
  mitigation route generation, acoustic deterrent simulation, crime reporting

### Data Visualization

- **`StatsDashboard.tsx`** — Four-tab dashboard (Overview, Categories,
  Conservation, Monitoring) with real-time API data and Recharts visualizations
- **`ConservationOverview.tsx`** — Species grouped by IUCN status with
  population charts

## Styling

- **Tailwind CSS** with custom color tokens (primary, secondary, accent,
  success, warning, danger)
- **Dark mode** via class-based toggling (`.dark` class on `<html>`)
- **Framer Motion** for page transitions, scroll-triggered animations, and
  interactive hover effects
- **Custom fonts**: Inter (body), Playfair Display (headings), JetBrains Mono
  (data figures)

## Performance

- **Static generation** for all content pages (about, methodology, sources, etc.)
- **Dynamic rendering** only for pages with live data (globe, dashboard, monitor)
- **Code splitting** via Next.js dynamic imports for heavy components
  (Three.js, Recharts)
- **Image optimization** via `next/image` with remote patterns for Wikipedia
  and GBIF images
- **Rate limiting** at the API layer (60 req/min per IP) to protect against abuse

## Type System

All data structures are defined in `src/types/animal/types.ts`:

- `Animal` — Full species profile
- `AnimalData` — Five data categories with subcategories
- `SampleAlert` — Monitoring alert
- `SpeciesSource` — Verification keys per species
- `GeoPoint`, `MigrationRoute`, `PopulationPoint` — Geographic and temporal data

TypeScript strict mode is enabled. The CI pipeline runs `tsc --noEmit` to
catch type errors before they reach production.

## Testing Strategy

- **Unit tests** (`src/lib/*.test.ts`) — Filtering logic, rate limiter,
  geo-distance calculations (haversine, point-to-route)
- **API integration tests** (`tests/api.integration.test.ts`) — Full
  request/response cycle against a running server, verifying status codes,
  response shapes, rate limiting, and cache headers
- **CI** — Lint → unit tests → build → integration tests, run on every
  push and PR via GitHub Actions
