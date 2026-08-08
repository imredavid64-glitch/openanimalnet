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
- **State Management**: Zustand
- **Charts**: Recharts

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
