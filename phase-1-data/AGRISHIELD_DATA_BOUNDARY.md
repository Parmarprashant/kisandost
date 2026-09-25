# AgriShield 360° Data Boundary & Functional Architecture

## 1. System Scope & Architecture Overview
This document formalizes the boundary lines between:
1. **Part A: Existing KisanDost Platform Capabilities** (Legacy & Core Services)
2. **Part B: AgriShield 360° New Core Capabilities** (Phase 1 & Phase 2 Delivery)
3. **Part C: Future Capabilities & Extensions** (Post-Phase 2 Roadmap)

This strict separation ensures zero regressions to existing user flows while establishing an enterprise-grade crop-health intelligence engine.

---

## 2. Functional Boundary Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PART A: EXISTING KISANDOST FOUNDATION                                           │
│ - JWT / Session Auth & User Profiles                                            │
│ - Basic Crop Registry (Name, Sowing Date, Field lat/long)                       │
│ - Weather Forecast View (OpenWeatherMap / WeatherAPI proxy)                     │
│ - AgriVision Diagnostic Engine (Modal.run FastAPI proxy, ephemeral scans)       │
│ - Mandi Rates & Market Price Feeds                                              │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Enriches & Consumes
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PART B: AGRISHIELD 360° NEW CAPABILITIES (CURRENT ROLLOUT)                      │
│ - ICAR-Grounded Variety Registry (654 verified cultivars across 5 MVP crops)    │
│ - Phenological Milestone Engine (DAS calculation, stage transitions)            │
│ - Multi-Factor Weather Risk Triggers (Relative humidity, heat stress, rainfall) │
│ - AgriVision Scan Persistence (`CropDiseaseScan` MongoDB model)                 │
│ - Composite Risk Engine (Triangulates stage + weather + pathogen -> Risk Index) │
│ - Unified Crop Dashboard (`/my-crops` tabbed health monitor & alert cards)      │
│ - Geospatial Farm Polygons (GeoJSON micro-zone field boundaries)                │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Future Integration
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ PART C: FUTURE CAPABILITIES (ROADMAP)                                           │
│ - Sentinel-2 / Landsat NDVI & EVI Satellite Vegetative Monitoring               │
│ - Dynamic GDD / Thermal Unit Calculation (Pending field micrometeorology data)   │
│ - Chemical / Biological Integrated Pest Management (IPM) prescription generator │
│ - Agronomist Tele-Consultation & Human Verification Workflow                    │
│ - AI Yield & Harvest Date Prediction Models                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Boundary Details

### Part A: Existing KisanDost Platform (Retained & Unaltered)
- **User Identity & Farm Profiling:**
  - Phone number / OTP and password-based authentication.
  - Farm coordinates stored as single points (`latitude`, `longitude`).
- **Crop Registration:**
  - Basic crop records (`CropName`, `SowingDate`, `Area`, `SoilType`).
- **External Weather Integration:**
  - Real-time weather proxy fetching ambient temperature, humidity, rainfall, and wind speed for farm latitude/longitude.
- **Pathogen Diagnosis (AgriVision):**
  - Standalone image diagnostic endpoint (`/api/detect-disease` -> Modal FastAPI).
  - Diagnostic outcomes returned directly to the UI without saving to user records.

---

### Part B: AgriShield 360° Core Engine (Additive Architecture)
- **Verified Variety Intelligence:**
  - 654 ICAR-validated cultivars with verified days-to-maturity, regional adaptation zones, and breeding institute lineage.
  - Replaces free-text variety inputs with curated, validated dropdown selections.
- **Phenology & Growth Stage Engine:**
  - Tracks Days After Sowing (DAS) for each active crop.
  - Computes active phenological stage (e.g., Germination, Tillering/Vegetative, Flowering/Heading, Maturity).
- **Scan History Persistence (`CropDiseaseScan`):**
  - Connects AgriVision scans to the specific `cropId` and `farmId`.
  - Records: Timestamp, Photo URL, Detected Disease, Confidence, Affected Area %, Inferred Stage at scan, and Remediation Status.
- **Multi-Factor Risk Assessment Engine:**
  - Computes composite risk status:
    - `STABLE` (Low Risk: < 35)
    - `ATTENTION` (Moderate Risk: 35–69)
    - `HIGH RISK` (Critical Risk: 70–100)
  - Inputs:
    1. **Stage Vulnerability:** Certain stages are hypersensitive to specific pathogens (e.g., Rice Blast at Panicle Initiation).
    2. **Weather Risk:** Sustained RH > 85%, temperature anomalies, unseasonal rainfall.
    3. **Pathogen Presence:** AgriVision positive identification.
    4. **Variety Resistance:** Matches variety resistance genes/traits documented in ICAR records.
- **AgriShield Unified Dashboard:**
  - Integrated directly into the existing `/my-crops` screen.
  - Visual status ring, phenology timeline bar, active weather threat alerts, and diagnostic action plan.
- **Geospatial Field Polygons:**
  - Extension of field coordinates to GeoJSON MultiPolygon structures for plot-level health segmentation.

---

### Part C: Future Capabilities (Excluded from Current Phase)
- **Satellite Spectral Indices:**
  - Calculation of NDVI (Normalized Difference Vegetation Index) and NDWI (Water Index) via Copernicus Sentinel API. Excluded from Phase 1/2 to preserve local execution speed and eliminate costly satellite API quotas.
- **GDD / Thermal Unit Accumulation:**
  - Explicitly deferred because the ICAR Annual Reports contain **zero base temperature and GDD constants**. Will be integrated only when authoritative micrometeorological base-temp tables are curated from external agronomy standards.
- **Prescription & Chemical Recommendations:**
  - Auto-generating dosage rates for pesticides/fungicides requires local agrochemical compliance certifications; current engine outputs ICAR cultural/preventative practices and high-level non-chemical management tips.
- **Agronomist Tele-Review:**
  - Expert escalation portal for disputed AgriVision confidence scans (< 60%).

---

## 4. Data Exchange & Integration Contracts

### 4.1 Input from Existing Platform to AgriShield
```typescript
interface AgriShieldInputContext {
  userId: string;
  fieldId: string;
  cropId: string;
  sowingDate: Date;
  icarCropId: "wheat" | "rice" | "cotton" | "groundnut" | "soybean";
  icarVarietyId: string;
  currentWeather: {
    tempC: number;
    relativeHumidity: number;
    precipitationMm: number;
    cloudCoverPct: number;
  };
  latestScan?: {
    diseaseName: string;
    pathogenType: string;
    confidence: number;
    infectedAreaPct?: number;
    scannedAt: Date;
  };
}
```

### 4.2 AgriShield Engine Output
```typescript
interface AgriShieldEvaluationOutput {
  cropId: string;
  evaluatedAt: Date;
  daysAfterSowing: number;
  currentStage: {
    stageId: string;
    stageName: string;
    dasStart: number;
    dasEnd: number;
    progressPct: number;
  };
  riskAssessment: {
    compositeScore: number; // 0 - 100
    status: "STABLE" | "ATTENTION" | "HIGH_RISK";
    contributingFactors: {
      weatherThreat: { active: boolean; alerts: string[] };
      diseaseThreat: { active: boolean; diagnosis?: string; severity: string };
      stageVulnerability: { level: "LOW" | "MEDIUM" | "HIGH"; description: string };
    };
  };
  recommendations: Array<{
    category: "CULTURAL" | "IRRIGATION" | "PROTECTION" | "MONITORING";
    title: string;
    description: string;
    priority: "ROUTINE" | "URGENT" | "CRITICAL";
  }>;
}
```

---

## 5. Architectural Non-Interference Guarantee
1. **Zero Database Overwrite:** AgriShield uses dedicated collections (`icar_crops`, `icar_varieties`, `crop_disease_scans`, `agrishield_evaluations`) with optional reference keys into existing `User` and `Crop` collections.
2. **Zero Route Disruption:** Existing `/api/detect-disease`, `/api/weather`, and `/api/crops` continue to function without signature changes. AgriShield endpoints will reside under `/api/agrishield/*`.
3. **Additive UI:** AgriShield components embed seamlessly within the existing `/my-crops` page layout via modular React components.
