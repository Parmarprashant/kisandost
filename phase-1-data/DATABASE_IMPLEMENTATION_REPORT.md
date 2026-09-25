# AgriShield 360° / My Crop — Phase 1C Database Implementation Report

**Platform:** KisanDost  
**Module:** My Crop (powered by AgriShield 360°)  
**Implementation Phase:** Phase 1C — Database Foundation & Master Data Seeding  
**Status:** **COMPLETE**  
**Date:** September 2026  

---

## 1. Models Created

Five Category A Master Data Models and six Category B Runtime Models were created in `kisan-dost/ventureHack/kisan-next/src/models/`:

### Category A: Agricultural Master Data
1. **`IcarCrop.ts`** (`icar_crops`): Botanical master model for 46 crops (5 priority crops + 41 candidate crops) with botanical classification, primary seasons, and ICAR report traceability.
2. **`IcarVariety.ts`** (`icar_varieties`): Authoritative reference catalog for 654 ICAR released and notified cultivars with certified maturity days, adaptation zones, and breeding institute lineage.
3. **`CropGrowthStage.ts`** (`crop_growth_stages`): 19 source-grounded phenological milestone records defined strictly by Days After Sowing (DAS).
4. **`PestDiseaseReference.ts`** (`pest_disease_references`): 1,503 deduplicated pathogen and pest reference records categorized into Fungal, Bacterial, Viral, Insect Pest, and Nematode.
5. **`WeatherConditionReference.ts`** (`weather_condition_references`): 227 qualitative meteorological trigger records from ICAR trials.

### Category B: Farmer Runtime Data
6. **`FarmZone.ts`** (`farm_zones`): Micro-zone management subdivisions belonging to an existing `Field`, supporting GeoJSON polygon boundaries.
7. **`CropDiseaseScan.ts`** (`crop_disease_scans`): Persists external **AgriVision Diagnostic Engine** outputs (`POST /api/v1/diagnose`), linking diagnosis, confidence, and photo evidence to a specific crop cycle.
8. **`WeatherObservation.ts`** (`weather_observations`): Logs meteorological observations and 5-day forecasts fetched from the existing weather proxy (`/api/weather`).
9. **`GddLog.ts`** (`gdd_logs`): Daily thermal unit tracking structure with nullable GDD and base temperature fields.
10. **`RiskEvent.ts`** (`risk_events`): Multi-signal risk assessment ledger recording composite status (`STABLE`, `ATTENTION`, `HIGH_RISK`).
11. **`ScanRequest.ts`** (`scan_requests`): Adaptive scouting prompt dispatched when weather conditions or vulnerable crop stages warrant field inspection.

---

## 2. Existing Models Extended

1. **`Field.ts` (`src/models/Field.ts`):**
   - **Extended:** Added optional GeoJSON boundary polygon:
     ```typescript
     boundary?: {
       type: 'Polygon';
       coordinates: number[][][]; // [longitude, latitude]
     }
     ```
   - **Backward Compatibility:** All existing fields (`farmerId`, `name`, `area`, `areaUnit`, centroid `location`, `soil`, `irrigation`, `previousCrop`) remain 100% intact. Zero breaking changes to `/api/fields` or `/api/fields/[id]`.

2. **`Crop.ts` (`src/models/Crop.ts`):**
   - **Extended:** Added optional AgriShield runtime fields:
     ```typescript
     zoneId?: mongoose.Types.ObjectId;   // Ref: FarmZone
     icarCropId?: string;               // Slug to IcarCrop ("wheat")
     varietyId?: string;                // Slug to IcarVariety ("wheat_hd-3298")
     expectedHarvestDate?: Date;
     currentDas?: number;               // Days After Sowing
     currentStageId?: string;           // Active phenological milestone
     healthStatus?: 'STABLE' | 'ATTENTION' | 'HIGH_RISK';
     ```
   - **CropCycle Architecture Resolution:** Exported `CropCycle` as an alias to `Crop` (`export const CropCycle = Crop; export type ICropCycle = ICrop;`). This completely avoids duplicating records or maintaining two parallel collections for the exact same planted crop.

---

## 3. Collections & Naming Registry

| Logical Model | Collection Name | Category | Primary Identifier |
|---|---|---|---|
| `IcarCrop` | `icar_crops` | Master Data | `cropId` (string slug) |
| `IcarVariety` | `icar_varieties` | Master Data | `varietyId` (string slug) |
| `CropGrowthStage` | `crop_growth_stages` | Master Data | Compound `{ cropId, stageOrder, stageName }` |
| `PestDiseaseReference` | `pest_disease_references` | Master Data | `referenceId` (string slug) |
| `WeatherConditionReference` | `weather_condition_references` | Master Data | `triggerId` (string slug) |
| `Field` | `fields` | Runtime (Existing) | `_id` (ObjectId) |
| `FarmZone` | `farm_zones` | Runtime | `_id` (ObjectId) |
| `Crop` / `CropCycle` | `crops` | Runtime (Existing/Extended) | `_id` (ObjectId) |
| `CropDiseaseScan` | `crop_disease_scans` | Runtime | `_id` (ObjectId) |
| `WeatherObservation` | `weather_observations` | Runtime | `_id` (ObjectId) |
| `GddLog` | `gdd_logs` | Runtime | `_id` (ObjectId) |
| `RiskEvent` | `risk_events` | Runtime | `_id` (ObjectId) |
| `ScanRequest` | `scan_requests` | Runtime | `_id` (ObjectId) |

---

## 4. Entity Relationships

```
[ User (Farmer) ]
       │ 1
       │
       ▼ N
[ Field (Farm Plot) ] ──────────────┐ 1
       │ 1                          │
       ▼ N                          ▼ N
[ FarmZone (Micro-Zones) ]     [ Crop / CropCycle ] ◄─── [ IcarVariety ] ◄─── [ IcarCrop ]
       │                            │                                ▲             ▲
       │ 1                          ├────────────────────────────────┼─────────────┤
       ▼ N                          ▼ N                              │             │
[ WeatherObservation ]        [ CropDiseaseScan ]                    │             │
                                    │                                ▼             ▼
                                    ▼ 1                      [ GrowthStage ] [ WeatherCondition ]
                              [ RiskEvent ]                          ▲             ▲
                                    │                                │             │
                                    ▼ 1                      [ PestDiseaseReference ]
                              [ ScanRequest ]
```

---

## 5. Indexes Defined

- **`IcarCrop`**: `cropId` (unique), `isPriorityCrop: 1`, `active: 1`.
- **`IcarVariety`**: `varietyId` (unique), `cropId: 1`, compound `{ cropId: 1, varietyName: 1 }`.
- **`CropGrowthStage`**: compound `{ cropId: 1, stageOrder: 1 }`, compound `{ cropId: 1, dasStart: 1, dasEnd: 1 }`.
- **`PestDiseaseReference`**: `referenceId` (unique), `cropId: 1`, compound `{ cropId: 1, commonName: 1 }`, compound `{ cropId: 1, category: 1 }`.
- **`WeatherConditionReference`**: `triggerId` (unique), `cropId: 1`, compound `{ cropId: 1, conditionType: 1 }`, compound `{ cropId: 1, triggerCategory: 1 }`.
- **`FarmZone`**: `farmerId: 1`, `fieldId: 1`, compound `{ fieldId: 1, zoneCode: 1 }`.
- **`CropDiseaseScan`**: compound `{ cropCycleId: 1, capturedAt: -1 }`, compound `{ fieldId: 1, capturedAt: -1 }`, compound `{ farmerId: 1, capturedAt: -1 }`.
- **`WeatherObservation`**: compound `{ fieldId: 1, observationDate: -1 }`.
- **`GddLog`**: compound `{ cropCycleId: 1, logDate: -1 }`.
- **`RiskEvent`**: compound `{ cropCycleId: 1, createdAt: -1 }`, compound `{ fieldId: 1, createdAt: -1 }`.
- **`ScanRequest`**: compound `{ cropCycleId: 1, status: 1 }`, compound `{ farmerId: 1, status: 1 }`.

---

## 6. Validation Rules & Non-Hallucination Compliance

1. **GDD Non-Hallucination:**
   - `baseTemperatureC: null` in `IcarCrop`, `IcarVariety`, and `GddLog`.
   - `targetGdd: null` in `IcarCrop` and `IcarVariety`.
   - `gddStart: null` and `gddEnd: null` in `CropGrowthStage`.
   - `dailyGDD: null` and `cumulativeGDD: null` in `GddLog`.
   - Zero thermal constants were fabricated.
2. **BBCH Non-Hallucination:**
   - Zero BBCH codes or arbitrary decimal scales were introduced. Stages use source-grounded DAS windows.
3. **AgriVision Severity Non-Hallucination:**
   - `severity: null` in `CropDiseaseScan`. AgriVision on Modal.run currently does not provide validated clinical severity; this field remains strictly nullable.
4. **Risk Score Non-Hallucination:**
   - `riskScore: null` in `RiskEvent`. Multi-signal rule-weight calculations are explicitly deferred to Phase 6.

---

## 7. Seed Script & Source Data Inventory

- **Script Path:** `kisan-dost/ventureHack/kisan-next/scripts/seed_icar_master_data.ts`
- **Execution Command (Dry Run):** `npx tsx scripts/seed_icar_master_data.ts`
- **Execution Command (Live Write):** `npx tsx scripts/seed_icar_master_data.ts --execute`
- **Idempotence Standard:** All write operations utilize MongoDB `bulkWrite` with `{ updateOne: { filter: { id }, update: { $set: doc }, upsert: true } }`. Running the seed script multiple times produces zero duplicate master records.

### Dry-Run Validation Results

```
┌─────────┬────────────────────────────────┬────────────────┬─────────────────┬──────────────────────────────┬─────────────────┬────────────────┬─────────────┐
│ (index) │ Collection                     │ Source Records │ Validated Clean │ Duplicate Keys Disambiguated │ GDD Fields Null │ Base Temp Null │ Status      │
├─────────┼────────────────────────────────┼────────────────┼─────────────────┼──────────────────────────────┼─────────────────┼────────────────┼─────────────┤
│ 0       │ 'icar_crops'                   │ 46             │ 46              │ 0                            │ 46              │ 46             │ 'VALIDATED' │
│ 1       │ 'icar_varieties'               │ 654            │ 654             │ 1                            │ 654             │ 654            │ 'VALIDATED' │
│ 2       │ 'crop_growth_stages'           │ 19             │ 19              │ 0                            │ 19              │ 19             │ 'VALIDATED' │
│ 3       │ 'pest_disease_references'      │ 1503           │ 1503            │ 1441                         │ 1503            │ 1503           │ 'VALIDATED' │
│ 4       │ 'weather_condition_references' │ 227            │ 227             │ 212                          │ 227             │ 227            │ 'VALIDATED' │
└─────────┴────────────────────────────────┴────────────────┴─────────────────┴──────────────────────────────┴─────────────────┴────────────────┴─────────────┘
```

- **Disambiguation Detail:** The 1 duplicate key in `icar_varieties` corresponds to `ACH 909-2 BG II`, which appeared with hyphenation variants across two report years. It was disambiguated by appending the release year slug (`cotton_ach-909-2-bg-ii_2023-24`), preserving all 654 source records.

---

## 8. AgriVision Integration Architecture

- **Diagnostic Endpoint:** `POST https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run/api/v1/diagnose`
- **Deployment:** Cloud serverless container (Modal.run FastAPI), **NOT Edge AI**.
- **Scan Persistence:** `CropDiseaseScan` model permanently stores the returned diagnosis, confidence score, raw payload, and photo URL, resolving the `NOT_PERSISTED` gap in KisanDost.
- **Severity Handling:** Distinguishes model confidence (e.g. 0.94) from agronomic severity (`null`).

---

## 9. Database Safety Guarantees

1. **Targeting Rule:** Master data seeding targets ONLY the 5 new master collections (`icar_crops`, `icar_varieties`, `crop_growth_stages`, `pest_disease_references`, `weather_condition_references`).
2. **Zero Destructive Actions:** The seed script NEVER calls `dropDatabase()` or `dropCollection()`.
3. **Data Protection:** Existing `fields`, `crops`, `users`, and `farmer_crops` records are completely untouched.

---

## 10. Remaining Work for Subsequent Phases

- **Phase 2:** Implement My Crop UI tabs in `/my-crops` and register farm zones.
- **Phase 3:** Crop Lifecycle Engine (DAS calculation cron and stage transitions).
- **Phase 4:** Weather observation cron linking OpenMeteo/WeatherAPI to farm locations.
- **Phase 5:** Wire `CropDiseaseScan` persistence into `/api/detect-disease`.
- **Phase 6:** Implement deterministic Multi-Signal Risk Engine (`STABLE`, `ATTENTION`, `HIGH_RISK`).
