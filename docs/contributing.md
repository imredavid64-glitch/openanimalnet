# Contributing to OpenAnimalNet

Thank you for your interest in contributing! This guide will help you get set up
and understand the project conventions.

## Prerequisites

- **Node.js ≥ 22.6** (required for TypeScript type stripping in tests)
- **npm** (the project uses `package-lock.json`)
- **Git**

## Getting Started

```bash
# Clone the repository
git clone https://github.com/imredavid64-glitch/openanimalnet.git
cd openanimalnet

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**No environment variables or API keys required** — all external data is
fetched server-side from public APIs.

## Project Structure

```
openanimalnet/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/v1/         # REST API endpoints
│   │   ├── animal/         # Species profiles
│   │   ├── monitor/        # Monitoring dashboard & alerts
│   │   ├── ai/             # AI analysis tools
│   │   ├── reunite/        # Companion animal hub
│   │   ├── assistance/     # Service animal registry
│   │   ├── migration/      # Migration explorer
│   │   └── ...
│   ├── components/          # React components
│   │   ├── map/            # Globe, maps, route visualizations
│   │   ├── ai/             # Conflict predictor, habitat simulator
│   │   ├── monitor/        # Alerts, action center
│   │   ├── animal/         # Animal cards, filters, categories
│   │   ├── layout/         # Navbar, footer, page templates
│   │   └── icons.tsx       # SVG icon system
│   ├── data/sample/         # Species data, alerts, shelters
│   ├── lib/                 # Utilities (geo, rate limiting, GBIF)
│   └── types/              # TypeScript type definitions
├── .freebuff/               # Offline data tooling scripts
├── tests/                   # API integration tests
├── docs/                    # Documentation
└── .github/workflows/       # CI/CD pipelines
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:api` | Run API integration tests (requires server) |
| `npm run verify:data` | Verify all species against 4 live sources |
| `npm run refresh:data` | Wikidata + Wikipedia freshness check |
| `npm run check:taxonomy` | Taxonomy consistency check |
| `npm run species:add` | Generate new species from Wikidata |

## Code Conventions

### TypeScript

- Strict mode is enabled — all code must type-check
- Use explicit types for function parameters and return values
- Prefer `interface` for object shapes, `type` for unions/intersections

### React

- Functional components only (no class components)
- Use `'use client'` directive only when the component needs browser APIs
  or React hooks
- Prefer composition over prop drilling

### Styling

- **Tailwind CSS** for all styling — no CSS modules or styled-components
- Use the custom color tokens: `primary-*`, `secondary-*`, `accent-*`,
  `success-*`, `warning-*`, `danger-*`
- Dark mode: use `dark:` variants with the class-based strategy
- Animations: use Framer Motion, not CSS animations

### Icons

Use the SVG icon system in `src/components/icons.tsx`. Do not use emoji for
UI elements — the site uses consistent SVG icons throughout.

### Data

- All species data lives in `src/data/sample/`
- Every population estimate and conservation status must have a source citation
- Use `populationHistory` with documented data points, not fabricated numbers
- Cross-reference new data against at least one external source before adding

### API Routes

- All endpoints live under `src/app/api/v1/`
- Use the `applyRateLimit` middleware for rate limiting
- Return the standard `{ success, data, error }` envelope
- Include `Cache-Control` headers via `API_CACHE_CONTROL`

## Running Tests

```bash
# Unit tests (no server needed)
npm test

# API integration tests (starts server automatically in CI)
npm run test:api

# Type checking
npx tsc --noEmit

# Full verification suite
npm run verify:data
```

## Adding a New Page

1. Create `src/app/your-page/page.tsx`
2. Use the `StaticPage` component for consistent layout:

```tsx
import StaticPage from '@/components/layout/StaticPage';
import { YourIcon } from '@/components/icons';

export default function YourPage() {
  return (
    <StaticPage
      title="Your Page Title"
      description="Page description"
      icon={<YourIcon className="w-12 h-12" />}
    >
      {/* Page content */}
    </StaticPage>
  );
}
```

3. Add a link in the footer (`src/components/layout/Footer.tsx`)
4. Run `npm test` to verify nothing breaks

## Adding a New Species

```bash
# Preview
npm run species:add -- "Genus species"

# Generate files
npm run species:add -- --apply "Genus species"
```

Then review the generated entry in `src/data/sample/animals.ts` and verify
the population data against IUCN/Wikipedia.

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run the full test suite: `npm test && npx tsc --noEmit`
4. Run data verification if you changed species data: `npm run verify:data`
5. Commit with a clear, descriptive message
6. Push and open a PR against `main`

CI will automatically run lint, tests, build, and integration tests.

## Reporting Issues

When reporting a bug, please include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/device info
- Screenshots if applicable

For data accuracy issues, please include the source you believe is correct
and a link to the reference.
