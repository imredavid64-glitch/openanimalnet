# OpenAnimalNet API Reference

> **Interactive testing**: import [`docs/openapi.yaml`](openapi.yaml) into
> [Swagger Editor](https://editor.swagger.io), Postman, or Insomnia to test
> endpoints interactively.

All endpoints are rate-limited to **60 requests per minute per IP** and return
`Cache-Control: public, s-maxage=60` headers. Responses use a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 28 }
}
```

---

## Animals

### `GET /api/v1/animals`

List all species with optional filtering and pagination.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | `string` | Filter by animal category: `mammals`, `birds`, `reptiles`, `amphibians`, `fish`, `invertebrates`, `insects`, `marine` |
| `conservationStatus` | `string` | Filter by IUCN status: `CR`, `EN`, `VU`, `NT`, `LC`, `DD`, `NE` |
| `dataCategories` | `string` | Comma-separated data category filter: `biological`, `behavioral`, `ecological`, `population`, `health`, `agricultural`, `shelter`, `human-interaction` |
| `isMonitored` | `boolean` | Filter by monitoring status |
| `search` | `string` | Full-text search across common name, scientific name, and description |
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Results per page (default: 20, max: 100) |

**Example:**

```bash
curl "http://localhost:3000/api/v1/animals?category=mammals&conservationStatus=EN&limit=5"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "elephant-001",
      "commonName": "African Bush Elephant",
      "scientificName": "Loxodonta africana",
      "category": "mammals",
      "conservationStatus": "EN",
      "populationEstimate": 415000,
      "isMonitored": true,
      "location": { "latitude": -2.3333, "longitude": 37.0833 },
      "habitat": ["savanna", "forest", "desert"],
      "dataCategories": ["biological", "behavioral", "ecological", "population", "health", "human-interaction"]
    }
  ],
  "meta": { "page": 1, "limit": 5, "total": 9 }
}
```

---

### `GET /api/v1/animals/:id`

Full profile for one species, including all five data category sub-objects.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Species ID (e.g., `elephant-001`, `lion-001`) |

**Example:**

```bash
curl "http://localhost:3000/api/v1/animals/lion-001"
```

**Response includes:**

- Full taxonomy (kingdom through species)
- Location with lat/lng, altitude, accuracy, timestamp, and source
- Habitat array
- Population estimate and history
- Migration routes with waypoints, seasons, and distances
- All five data categories with subcategory data
- GBIF key and iNaturalist ID for cross-referencing

---

## Populations

### `GET /api/v1/populations`

Population estimates and conservation metrics for all species.

**Example:**

```bash
curl "http://localhost:3000/api/v1/populations"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalSpecies": 28,
    "byStatus": {
      "CR": 5,
      "EN": 9,
      "VU": 8,
      "NT": 1,
      "LC": 2,
      "DD": 1,
      "NE": 1
    },
    "species": [
      {
        "id": "elephant-001",
        "commonName": "African Bush Elephant",
        "populationEstimate": 415000,
        "conservationStatus": "EN"
      }
    ]
  }
}
```

---

## Monitoring

### `GET /api/v1/monitoring/alerts`

Active monitoring alerts, filterable by severity.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `string` | Filter by severity: `critical`, `warning`, `info` |

**Example:**

```bash
curl "http://localhost:3000/api/v1/monitoring/alerts?type=critical"
```

---

### `GET /api/v1/monitoring/stats`

Aggregated dashboard statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalAnimals": 28,
    "monitoredAnimals": 28,
    "activeAlerts": 8,
    "monitoringCoverage": {
      "mammals": 1.0,
      "birds": 1.0,
      "reptiles": 1.0,
      "amphibians": 1.0,
      "fish": 0,
      "marine": 1.0
    }
  }
}
```

---

## Locations

### `GET /api/v1/locations`

Recent telemetry locations for all monitored animals.

**Example:**

```bash
curl "http://localhost:3000/api/v1/locations"
```

---

## Live Sync

### `GET /api/v1/live/sync`

Fetch recent georeferenced occurrences from GBIF for a specific species.
Results are cached for 60 seconds per species.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | Species ID (e.g., `lion-001`) |

**Example:**

```bash
curl "http://localhost:3000/api/v1/live/sync?id=lion-001"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "animalId": "lion-001",
    "scientificName": "Panthera leo",
    "gbifKey": 5219404,
    "occurrences": [
      {
        "key": 4000000001,
        "decimalLatitude": -25.5,
        "decimalLongitude": 28.1,
        "country": "ZA",
        "eventDate": "2026-07-15",
        "basisOfRecord": "HUMAN_OBSERVATION"
      }
    ],
    "fetchedAt": "2026-08-13T22:00:00.000Z",
    "count": 16059
  }
}
```

---

## Rate Limiting

All endpoints are rate-limited to **60 requests per minute per IP**. When the
limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
```

With HTTP status `429` and a `Retry-After` header.

---

## Error Responses

All errors follow the envelope format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 404 | Species or resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
