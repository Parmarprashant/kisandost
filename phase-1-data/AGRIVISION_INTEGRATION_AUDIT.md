# AgriVision Diagnostic Engine Integration Audit

## 1. Executive Summary & Purpose
This audit analyzes the existing disease-detection subsystem in the KisanDost platform (`https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run/`) and formalizes the integration contract for **AgriShield 360°**.

AgriShield 360° **DOES NOT** build a new diagnostic model, replace AgriVision, or duplicate pest/disease detection. Instead, AgriShield consumes AgriVision's diagnostic output as **one input** into a multi-signal risk engine combining crop variety, phenological growth stage (DAS), weather stress triggers, and disease diagnosis.

---

## 2. AgriVision Service Architecture

### 2.1 Deployment & Hosting
- **Hosting Platform:** Modal.run (`parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run`)
- **Framework:** FastAPI (Python)
- **Deployment Model:** Cloud Serverless Container (Modal.run worker). **It is NOT Edge AI or on-device inference.**
- **Primary Endpoint:** `POST https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run/api/v1/diagnose`
- **Health Check Endpoint:** `GET https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run/health`

### 2.2 KisanDost Wrapper Architecture
- **Server-Side API Proxy:** `kisan-dost/ventureHack/kisan-next/src/app/api/detect-disease/route.ts`
- **Service Client Library:** `kisan-dost/ventureHack/kisan-next/src/lib/agriVisionService.ts`
- **Client UI Consumer:** `kisan-dost/ventureHack/kisan-next/src/components/features/crop-disease/DiseaseDetector.tsx`

```
┌─────────────────────────────────────────────────────────────┐
│ Farmer Device (Browser)                                     │
│ - Uploads image / captures via camera                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/detect-disease (FormData)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ KisanDost Next.js App Router Proxy                          │
│ File: src/app/api/detect-disease/route.ts                    │
│ - Validates file presence and MIME type                     │
│ - Delegates to src/lib/agriVisionService.ts                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/v1/diagnose (multipart/form-data)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ AgriVision FastAPI Service (Modal.run)                      │
│ - Deep learning visual diagnostic inference                 │
│ - Returns condition, confidence, pathogen, recommendations  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. API Contract & Data Mapping

### 3.1 Request Specification
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Payload:**
  - `file`: Binary image data (`image/jpeg`, `image/png`, `image/webp`)
- **Headers:** Optional `Authorization` or `x-api-key` if configured via environment variables.

### 3.2 AgriVision Raw Response Schema
```json
{
  "diagnosis": {
    "primary_condition": "Wheat Leaf Rust (Puccinia triticina)",
    "pathogen_type": "fungal",
    "affected_plant_part": "leaf",
    "status": "confirmed"
  },
  "confidence": {
    "level": "High",
    "score": 0.94
  },
  "segmentation": {
    "infected_area_pct": 14.5,
    "heatmap_url": null
  },
  "management_recommendations": {
    "immediate_actions": [
      "Apply recommended systemic fungicide (Propiconazole 25% EC)",
      "Ensure proper field drainage and reduce excess nitrogen application"
    ],
    "preventive_measures": [
      "Plant rust-resistant certified cultivars",
      "Monitor temperature and relative humidity triggers"
    ]
  },
  "model_metadata": {
    "version": "v1.2",
    "timestamp": "2026-09-24T18:00:00Z"
  }
}
```

### 3.3 KisanDost Internal Mapping
KisanDost maps the external AgriVision response in `src/lib/agriVisionService.ts` to its internal diagnostic view:

| Raw AgriVision Field | KisanDost Mapped Field | Frontend Display Format |
|---|---|---|
| `diagnosis.primary_condition` | `diseaseName` | Plain string title |
| `confidence.level` | `confidence` | Converted/normalized (High: 94%, Medium: 78%, Low: 52%) |
| `diagnosis.pathogen_type` | `pathogenType` | Fungal / Bacterial / Viral / Pest / Deficiency |
| `management_recommendations.immediate_actions` | `treatmentSteps` | Array of step strings |
| `management_recommendations.preventive_measures` | `preventativeMeasures` | Array of preventive tip strings |

---

## 4. Current Limitations & Technical Deficits

### 4.1 Severity Assessment
- **Status:** `NOT_CURRENTLY_AVAILABLE`
- **Detail:** While the raw response contains `segmentation.infected_area_pct`, the existing KisanDost Next.js wrapper and UI component omit clinical severity indexing. There is no calibrated scale (Mild, Moderate, Severe, Critical) mapped to agronomic yield-loss impact.
- **AgriShield Requirement:** AgriShield must define an agronomic severity classifier in the risk engine based on infected area percentage and crop phenology milestone (e.g. 10% rust at vegetative stage is manageable, while 10% rust at heading/milking stage is critical).

### 4.2 Scan Persistence
- **Status:** `NOT_PERSISTED`
- **Detail:** All scans currently run through `src/app/api/detect-disease/route.ts` are completely ephemeral.
  - Image files are not archived in cloud object storage or filesystem.
  - Diagnostic outcomes are not saved to MongoDB.
  - Scans are not associated with a specific user, registered farm, or crop field record (`cropId`).
- **AgriShield Requirement:** AgriShield Phase 2 will introduce the `CropDiseaseScan` MongoDB schema to persist diagnostic history tied to `cropId`, `fieldId`, `growthStage`, and `das`.

### 4.3 Offline / Network Resilience
- **Detail:** In `src/lib/agriVisionService.ts`, if the external endpoint times out or fails (500/503), the service catches the error and either provides a fallback error payload or a simulated response.
- **AgriShield Requirement:** In AgriShield, diagnostic failures must gracefully downgrade without breaking the multi-signal risk engine; the risk score will simply calculate using weather triggers, age/stage, and historical regional risk when real-time AI scan is unavailable.

---

## 5. AgriVision ↔ AgriShield 360° Data Contract

| Property | AgriVision (Existing) | AgriShield 360° (New Layer) |
|---|---|---|
| **Role** | Pure image-based pathogen classification | Holistic 360° multi-signal crop health monitoring |
| **Input** | Leaf/crop photo | Photo + Crop ID + Variety + DAS + Weather Metrics + Farm Polygon |
| **Output** | Disease Name, Confidence, Generic Treatment | Risk Index (0-100), Stage Impact, Phenology Timeline, Action Plan |
| **Persistence** | None (Ephemeral in memory) | Stored in `CropDiseaseScan` collection linked to `FarmCrop` |
| **Hosting** | Cloud FastAPI on Modal.run | Next.js API Routes + MongoDB + Background Evaluation Engine |

---

## 6. Audit Verdict
- **Integration Status:** Fully compatible.
- **Action Required for Phase 2:**
  1. Add `CropDiseaseScan` persistence model in backend.
  2. Implement severity mapping adapter (`NOT_CURRENTLY_AVAILABLE` -> rule-based severity calculator).
  3. Wire diagnostic results into the multi-factor AgriShield Risk Evaluator.
