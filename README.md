# OpenAnimalNet

**Global Animal Data Platform**

OpenAnimalNet is a comprehensive platform for monitoring, analyzing, and exploring animal data from around the world. Track biological, behavioral, ecological, and conservation data for all species.

## Features

- **Interactive Globe**: Visualize animal locations and movements on a 3D interactive globe
- **Real-time Monitoring**: Track animals with live GPS data and receive alerts
- **Comprehensive Data**: Access biological, behavioral, ecological, population, and health data
- **AI Assistant**: Get intelligent insights and analysis using natural language queries
- **Advanced Filtering**: Filter animals by category, conservation status, data type, and more
- **Beautiful UI**: Modern, responsive design with smooth animations

## Animal Data Categories

### 1. Biological & Physiological Data
- Biometrics & Physical Traits
- Genomic & Molecular Data
- Physiological Metrics
- Endocrine & Blood Chemistry

### 2. Behavioral & Spatial Data
- Telemetry & Spatial Tracking
- Bioacoustics
- Ethological Activity Budgets
- Biomechanics & Motion

### 3. Ecological & Environmental Data
- Habitat Conditions
- Dietary & Trophic Data
- Interspecies Interactions

### 4. Population & Demographic Data
- Abundance & Density
- Demographic Rates
- Conservation Metrics

### 5. Health, Disease & Zoonotic Risk Data
- Pathogen Surveillance
- Veterinary Medical Records
- Zoonoses & Vector Tracking

### 6. Agricultural & Livestock Production Data
- Yield & Performance
- Feed & Resource Intake
- Reproductive Efficiency

### 7. Shelter, Welfare & Companion Animal Data
- Intake & Outcome Metrics
- Shelter Operations
- Welfare & Behavioral Diagnostics

### 8. Human-Animal Interaction & Threat Data
- Human-Wildlife Conflict
- Wildlife Crime & Poaching
- Infrastructure Hazards

## Getting Started

1. **Install Dependencies**
```bash
npm install
```

2. **Run the Development Server**
```bash
npm run dev
```

3. **Open in Browser**
   [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, Framer Motion
- **3D Visualization**: Three.js, React Three Fiber
- **Mapping**: Leaflet, React Leaflet
- **Charts**: Recharts

## API

The platform ships a public JSON API under `/api/v1/*` (all endpoints are rate
limited to 60 req/min per IP and send cache headers):

| Endpoint | Description |
| --- | --- |
| `GET /api/v1/animals` | List species — filters: `category`, `conservationStatus`, `dataCategories`, `isMonitored`, `search`; pagination: `page`, `limit` |
| `GET /api/v1/animals/:id` | Full profile for one species, including all five data categories |
| `GET /api/v1/populations` | Population estimates and conservation metrics |
| `GET /api/v1/monitoring/alerts` | Active alerts, filterable by `type` (`critical` \| `warning` \| `info`) |
| `GET /api/v1/monitoring/stats` | Aggregated dashboard statistics and population trends |
| `GET /api/v1/locations` | Recent telemetry locations for monitored animals |

Example:

```bash
curl "http://localhost:3000/api/v1/animals?category=mammals&limit=5"
```

## Testing

```bash
npm test        # unit tests (filtering, rate limiter) — no server needed
npm run test:api  # API integration tests — requires a running server
```

The integration suite hits the server at `http://localhost:3100` by default;
point it elsewhere with `API_BASE_URL`:

```bash
API_BASE_URL=http://localhost:3000 npm run test:api
```

Data freshness — re-verify every species' IUCN assessment ID, status, and
Wikipedia article against live sources (Wikidata + Wikipedia, no API keys):

```bash
npm run refresh:data
```

Every species links to its primary sources on the
[Data Sources page](/sources) and on each animal's detail page. Species pages
also chart the species' historical population series (censuses/surveys) in the
Population Data tab.

New species can be generated from live Wikidata/Wikipedia data instead of
hand-written — taxonomy, IUCN assessment ID, status, photo, and description
are pulled automatically (census figures are reviewed by hand):

```bash
npm run species:add -- "Panthera uncia"        # print a preview
npm run species:add -- --apply "Panthera uncia" # write files + fetch the photo
# --apply then auto-runs the freshness checker (npm run refresh:data -- --fail)
```

Multiple species at once: `npm run species:add -- --apply "Phocoena sinus" "Ailurus fulgens"`.
After a successful apply the registry is re-verified against live sources in
the same command, so a bad edit fails immediately. Continuous
integration (lint, unit tests, build, API integration tests) runs on GitHub
Actions for every push and pull request — see `.github/workflows/ci.yml`.

## Deploy & data freshness

- **Auto-deploy**: every push to `main` deploys production to Vercel via
  GitHub Actions (`.github/workflows/deploy.yml`).
- **Data drift watch**: a weekly scheduled check (`.github/workflows/data-drift.yml`)
  re-verifies every species' IUCN ID/status and Wikipedia article against live
  sources and fails if anything drifted.

## Project Structure

```
openanimalnet/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── data/               # Sample data
│   ├── lib/                # Utilities and services
│   ├── styles/             # Global styles
│   └── types/              # TypeScript types
├── public/                # Static assets
└── package.json            # Dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License
