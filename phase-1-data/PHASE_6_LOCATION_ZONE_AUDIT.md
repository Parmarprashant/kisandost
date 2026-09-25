# AgriShield 360° / My Crop — Location, Field, Zone, Crop & Risk Integration Audit

**Date:** 2026-09-25  
**Platform:** KisanDost  
**Module:** My Crop (powered by AgriShield 360°)  
**Scope:** Spatial & Data Lineage Audit across Phases 0–6  

---

## 1. Executive Summary

This audit verifies and clarifies the architectural connections between:
```
Farmer
  ↓
Field
  ↓
Field Location (village, taluka, district, state, lat, lon)
  ↓
Field Boundary (GeoJSON Polygon)
  ↓
Monitoring Zones (Z01, Z02, Z03, Z04)
  ↓
Crop
  ↓
Crop → zoneId (Optional association to monitoring zone)
  ↓
Zone-specific Scan (Phase 4 AgriVision multi-angle sessions)
  ↓
AgriVision Evidence (Preserved without clinical severity fabrication)
  ↓
Risk Engine (Phase 6 deterministic, zero-hallucination evaluation)
  ↓
RiskEvent (Idempotently stored per crop, zone, threat, rule)
```

And the environmental connection:
```
Field Geographic Location (coordinates)
  ↓
WeatherObservation (Phase 5 historical weather cache)
  ↓
Risk Engine Context (Weather completeness report)
```

---

## 2. Spatial & Data Relationship Audit

### 2.1 Farmer → Field Relationship
- **Status:** **IMPLEMENTED**
- **Evidence Model:** `src/models/Field.ts`
  - `farmerId: { type: String, required: true, index: true }`
- **APIs Responsible:**
  - `GET /api/fields` — Enforces `{ farmerId: userId }` query filter
  - `POST /api/fields` — Injects authenticated `{ farmerId: userId }`
  - `GET /api/fields/[id]` — Enforces ownership check `{ _id: id, farmerId: userId }`
- **Security Rule:** A farmer can only query, view, update, or delete fields belonging to their own user identity. Cross-tenant access returns 401/404.

---

### 2.2 Field → Location Relationship
- **Status:** **IMPLEMENTED**
- **Evidence Model:** `src/models/Field.ts`
  - Sub-schema `IFieldLocation`:
    ```typescript
    village?: string;
    taluka?: string;
    district?: string;
    state?: string;
    latitude?: number;  // Centroid coordinate
    longitude?: number; // Centroid coordinate
    ```
- **APIs Responsible:**
  - `src/app/api/fields/route.ts` — Accepts `location` during creation
  - `src/app/api/fields/[id]/boundary/route.ts` — Returns field `location`
- **UI Presentation:**
  - In `src/app/[locale]/(app)/dashboard/my-crops/page.tsx`, location is summarized as `[village, district, state].filter(Boolean).join(", ")`.
  - Fallback when missing: `"Location unavailable"`.
  - No fabricated coordinates or guessed locations.

---

### 2.3 Field → Boundary Relationship
- **Status:** **IMPLEMENTED**
- **Evidence Model:** `src/models/Field.ts`
  - `boundary?: IGeoPolygon` (`type: 'Polygon'`, `coordinates: number[][][]`)
- **Spatial Utility:** `src/lib/geoUtils.ts`
  - `validateGeoPolygon`: Strict GeoJSON polygon validation (closed ring, non-intersecting, valid range)
  - `calculateGeodesicArea`: Geodesic Shoelace formula with Earth radius curvature correction
  - `convertArea`: Square meters to Acre/Hectare
- **APIs Responsible:**
  - `GET /api/fields/[id]/boundary` — Returns GeoJSON boundary and calculated geodesic area
  - `POST /api/fields/[id]/boundary` — Validates GeoJSON, saves normalized polygon, updates field area
  - `DELETE /api/fields/[id]/boundary` — Deletes boundary and deactivates associated zones
- **UI Presentation:**
  - `src/components/farmer-tools/FarmBoundaryEditor.tsx` — Interactive Leaflet editor for vertex drawing, polygon rendering, and area measurement.

---

### 2.4 Field → Zone Relationship
- **Status:** **IMPLEMENTED**
- **Terminology:** **"Monitoring Zone"** (e.g. Z01, Z02, Z03, Z04).
  - Explicitly NOT soil, disease, cadastral, satellite, or irrigation zones.
- **Evidence Model:** `src/models/FarmZone.ts`
  - `farmerId: string`
  - `fieldId: ObjectId, ref: 'Field'`
  - `zoneName: string`
  - `zoneCode: string` (e.g., "Z01", "Z02")
  - `polygon?: IGeoPolygon`
  - `area?: number`
  - `active: boolean`
- **Spatial Utility:** `src/lib/geoUtils.ts`
  - `generateMonitoringZones`: Deterministic Sutherland-Hodgman polygon clipping into 4 quadrants (NW, NE, SW, SE) strictly inside the farm boundary.
- **APIs Responsible:**
  - `GET /api/fields/[id]/zones` — Lists active monitoring zones for field
  - `POST /api/fields/[id]/zones` — Partitions boundary into geometric monitoring zones
  - `DELETE /api/fields/[id]/zones` — Clears zones
  - `POST /api/fields/[id]/resolve-point` — Point-in-Polygon check to match GPS coordinates to a specific monitoring zone

---

### 2.5 Crop → Field Relationship
- **Status:** **IMPLEMENTED**
- **Evidence Model:** `src/models/Crop.ts`
  - `fieldId: { type: Schema.Types.ObjectId, ref: 'Field', required: true, index: true }`
  - `farmerId: { type: String, required: true, index: true }`
- **APIs Responsible:**
  - `GET /api/fields` — Populates crops for each field
  - `GET /api/fields/[id]/crops` — Returns crops belonging to the field and farmer
  - `POST /api/fields/[id]/crops` — Creates crop with validated field ownership and area constraint (`cropArea <= fieldArea`)
  - `GET /api/crops/[id]` — Populates `fieldId`
- **Rule:** Every crop belongs to exactly one parent Field.

---

### 2.6 Crop → Zone Relationship
- **Status:** **IMPLEMENTED**
- **Evidence Model:** `src/models/Crop.ts`
  - `zoneId?: mongoose.Types.ObjectId, ref: 'FarmZone', default: null, index: true`
- **Traceability:**
  - When `crop.zoneId` is set: `Crop` → `FarmZone` (belonging to `Crop.fieldId`).
  - When `crop.zoneId` is NOT set: The crop is not tied to a specific micro-zone.
- **APIs Responsible:**
  - `POST /api/fields/[id]/crops` — Accepts optional `zoneId`, validates zone belongs to field and farmer
  - `PUT /api/crops/[id]` — Allows assigning/unassigning `zoneId` with strict field ownership validation
  - `GET /api/crops/[id]` — Populates `zoneId` with zone metadata
- **UI Presentation:**
  - In `src/app/[locale]/(app)/dashboard/my-crops/page.tsx` and `src/app/[locale]/(app)/crops/[id]/page.tsx`:
    - If assigned: displays `{zone.zoneCode} ({zone.zoneName})`
    - If unassigned: displays `"Zone not assigned"`
    - **ZERO FABRICATION:** No zone is ever guessed or fabricated from crop name.

---

### 2.7 Zone → Scan Relationship
- **Status:** **IMPLEMENTED**
- **Evidence Models:**
  - `src/models/CropDiseaseScan.ts`: `fieldId`, `zoneId`, `cropCycleId`, `scanSessionId`, `screeningResult`, `viewAngle`, `diagnosis`, `confidence`
  - `src/models/ScanSession.ts`: `cropId`, `fieldId`, `zoneId`, `status`, `result`, `scanIds`
- **Service Responsible:** `src/lib/gdd/zoneScanService.ts`
  - `validateZoneScoutingContext`: Validates `Farmer -> Crop -> Field -> Zone`
- **Evidence Isolation:**
  - `extractScanEvidence` in `src/lib/risk/riskEvidence.ts` filters scans strictly by `targetZoneId`.
  - Evidence from Zone A never leaks into Zone B.
- **UI Messaging:**
  - When concerns are detected in a zone scan session, the UI states:
    `"Potential concern detected in Zone Z02"`
    instead of field-wide or farm-wide claims.

---

### 2.8 Field → Weather Relationship
- **Status:** **IMPLEMENTED**
- **Evidence Model:** `src/models/WeatherObservation.ts`
  - `latitude`, `longitude`, `latitudeRounded`, `longitudeRounded`
  - `observationDate` (UTC midnight)
  - `tempMinC`, `tempMaxC`, `tempC`, `precipitationMm`, `relativeHumidityPct`, `windSpeedKph`, `solarRadiationWm2`
  - `fieldId` (optional reference)
- **Service Responsible:** `src/lib/weather/historicalWeatherService.ts`
  - Retrieves weather strictly using `field.location.latitude` and `field.location.longitude`.
- **Zero Fabrication Rule:**
  - Zones do NOT have independent GPS coordinates.
  - Weather is strictly resolved at Field level coordinates:
    `Zone -> Field -> Field Coordinates -> WeatherObservation`.
  - Missing weather observations remain `null`, never `0`.

---

### 2.9 Crop → Risk Relationship
- **Status:** **IMPLEMENTED**
- **Evidence Model:** `src/models/RiskEvent.ts`
  - `cropCycleId: ObjectId, ref: 'Crop'`
  - `threatId`, `threatName`, `ruleId`, `riskStatus`, `riskLevel`
  - `riskScore: null` (Strictly null under Zero Hallucination policy)
  - `explanation`, `missingEvidence`, `evaluatedAt`
- **API Responsible:**
  - `GET /api/crops/[id]/risk`
- **Engine Responsible:** `src/lib/risk/riskEngine.ts`
  - Multi-source contextual evaluation combining Phase 3C phenology, Phase 5 weather, Phase 4 scans, and ICAR Phase 1 references.
  - Idempotent deduplication via compound index `{ cropCycleId: 1, zoneId: 1, threatId: 1, ruleId: 1 }`.

---

### 2.10 Zone → Risk Relationship
- **Status:** **IMPLEMENTED**
- **API Responsible:**
  - `GET /api/crops/[id]/zones/[zoneId]/risk`
- **Engine Responsible:** `src/lib/risk/riskEngine.ts` (`targetZoneId: zoneId`)
  - Verifies authenticated farmer ownership of crop, field, and that zone belongs to field.
  - Strictly isolates scan evidence to `targetZoneId`.
  - Persists `RiskEvent` with `zoneId`.
  - Cross-tenant access is strictly blocked (returns 403 Forbidden).

---

## 3. Geographic Risk Filtering Status

- **Status:** **NOT IMPLEMENTED**
- **Truthful Documentation:**
  - In Phase 6, rules in `src/lib/risk/riskRules.ts` record `geographicApplicability: string[]` (e.g. `['Gujarat', 'Maharashtra']`, `['NWPZ', 'NEPZ']`).
  - However, because field coordinates are optional and may be null, and because agricultural geographic boundaries are qualitative in ICAR sources, **no runtime geographic filtering is performed**.
  - All applicable rules for the crop species are evaluated based on available visual scans, phenology, and weather data.

---

## 4. Summary Matrix

| Relationship | Status | Model / Utility | API Responsible |
|---|---|---|---|
| **Farmer → Field** | IMPLEMENTED | `Field.ts` (`farmerId`) | `GET /api/fields` |
| **Field → Location** | IMPLEMENTED | `Field.ts` (`location`) | `GET /api/fields`, `POST /api/fields` |
| **Field → Boundary** | IMPLEMENTED | `Field.ts` (`boundary`), `geoUtils.ts` | `/api/fields/[id]/boundary` |
| **Field → Zone** | IMPLEMENTED | `FarmZone.ts`, `geoUtils.ts` | `/api/fields/[id]/zones` |
| **Crop → Field** | IMPLEMENTED | `Crop.ts` (`fieldId`) | `/api/fields/[id]/crops`, `/api/crops/[id]` |
| **Crop → Zone** | IMPLEMENTED | `Crop.ts` (`zoneId`) | `/api/fields/[id]/crops`, `/api/crops/[id]` |
| **Zone → Scan** | IMPLEMENTED | `CropDiseaseScan.ts`, `ScanSession.ts` | `/api/crops/[id]/zones/[zoneId]/scan` |
| **Field → Weather** | IMPLEMENTED | `WeatherObservation.ts` | `/api/crops/[id]/weather/history` |
| **Crop → Risk** | IMPLEMENTED | `RiskEvent.ts`, `riskEngine.ts` | `GET /api/crops/[id]/risk` |
| **Zone → Risk** | IMPLEMENTED | `RiskEvent.ts`, `riskEngine.ts` | `GET /api/crops/[id]/zones/[zoneId]/risk` |
| **Geographic Filtering** | NOT IMPLEMENTED | `riskRules.ts` (recorded only) | Documented scientific limitation |
