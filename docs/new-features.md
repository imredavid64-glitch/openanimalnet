# OpenAnimalNet: New Features & Interactive Tools Guide

This guide covers the newly implemented account-free interactive features, ecological simulation tools, developer API playground, and open data export studio added to OpenAnimalNet.

---

## 1. Acoustic Wildlife Identification Simulator (`/acoustics`)
Designed for bioacoustic monitoring and bio-acoustics research.
- **Features:**
  - Frequency tuner sliding from 20 Hz (infrasound / elephant rumbles) to 8,000 Hz (ultrasonic bird chitters).
  - Real-time spectrogram wave visualization.
  - Automatic species match scoring against reference signatures (Humpback Whale, Timber Wolf, Lion, Elephant, Arctic Tern).
- **Usage:** Navigate to **Acoustics** in the navbar, adjust the frequency slider or click reference cards to test acoustic signatures.

---

## 2. Species Ranger Field Challenge (`/challenge`)
Gamified field identification training for naturalists and students.
- **Features:**
  - High-resolution species identification quiz with field clues and instant educational feedback.
  - Persistent badge collection system (`Junior Field Scout`, `Wildlife Tracker`, `Senior Wildlife Ranger`) saved locally to browser `localStorage`.
- **Usage:** Navigate to **Challenge** in the navbar to test your identification skills and earn field badges.

---

## 3. Biome & Climate Shift Explorer (`/habitat`)
Ecological modeling tool illustrating climate change impacts on global biomes.
- **Features:**
  - Global warming scenario scrubber (+0.5°C to +4.0°C above pre-industrial levels).
  - Dynamic ecosystem stress meter calculating capacity loss per biome (Tropical Rainforest, Arctic Tundra, Pelagic Ocean, Savanna).
  - Vulnerable indicator species impact breakdowns with direct links to species profiles.
- **Usage:** Navigate to **Habitat** in the navbar, adjust the warming slider, and select biomes to explore projected impacts.

---

## 4. Interactive API Playground (`/api/playground`)
Developer console for exploring OpenAnimalNet REST endpoints.
- **Features:**
  - Live execution of endpoints (`/api/v1/animals`, `/api/v1/populations`, `/api/v1/locations`, `/api/v1/monitoring/stats`).
  - Query parameter customization (limits, categories, search filters).
  - Live HTTP status codes and formatted JSON response viewer.
- **Usage:** Navigate to **API Playground** in the navbar to test API calls interactively.

---

## 5. Multi-Format Data Export Studio (`/data/export`)
Open data export utilities for researchers and GIS professionals.
- **Features:**
  - One-click GeoJSON export (`.geojson`) compatible with QGIS, ArcGIS, and Leaflet.
  - Tabular CSV export (`.csv`) for Excel, Google Sheets, R, and pandas.
  - Complete JSON catalog export (`.json`) containing full biological profiles and census timelines.
- **Usage:** Navigate to **Export** in the navbar to download datasets instantly.
