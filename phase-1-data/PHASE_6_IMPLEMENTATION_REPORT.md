# PHASE 6 — AGRISHIELD 360° RISK ENGINE — IMPLEMENTATION REPORT

**Date:** 2026-09-25
**System:** KisanDost / AgriShield 360° / My Crop
**Author:** Phase 6 Implementation Agent

---

## 1. Objective

Phase 6 implements an evidence-driven, explainable agricultural risk evaluation engine
for KisanDost. The engine combines already-existing data sources—crop lifecycle (Phase 3C),
diagnostic scans (Phase 4), historical weather (Phase 5), and ICAR reference catalogs
(Phase 1)—to produce deterministic, zero-hallucination risk assessments.

The engine does NOT:
- Invent thresholds, severity values, or confidence scores
- Apply ML/AI classifiers or weighted scoring
- Recommend treatments, pesticides, or irrigation changes
- Replace any prior phase functionality

---

## 2. Existing Architecture Inspected

Before implementation, the following existing components were audited:

| Component | File | Key Findings |
|-----------|------|--------------|
| RiskEvent model | `src/models/RiskEvent.ts` | Pre-existing schema with `riskStatus`, `riskScore`, `contributingFactors`. Extended for Phase 6. |
| PestDiseaseReference | `src/models/PestDiseaseReference.ts` | 1,503 ICAR records. ALL `symptoms`, `affected_stage`, `favorable_conditions` = `NOT_FOUND_IN_SOURCE`. |
| WeatherConditionReference | `src/models/WeatherConditionReference.ts` | 227 records. ALL `threshold: null`, ALL `duration: "NOT_FOUND_IN_SOURCE"`. |
| CropGrowthStage | `src/models/CropGrowthStage.ts` | Stage definitions with GDD ranges from Phase 3C. |
| ScanSession | `src/models/ScanSession.ts` | Phase 4 progressive scan session tracking. |
| CropDiseaseScan | `src/models/CropDiseaseScan.ts` | AgriVision diagnostic results per zone. |
| Phase 1 reference data | `phase-1-data/crop_pest_disease_reference.json` | 1,503 records, 5 crops (Rice, Wheat, Groundnut, Soybean, Cotton). |
| Phase 1 weather conditions | `phase-1-data/crop_weather_conditions.json` | 227 records, 3 condition types, 0 numeric thresholds. |
| Phase 1 validation report | `phase-1-data/PHASE_1_VALIDATION_REPORT.md` | Confirms qualitative-only data boundary. |
| Data boundary document | `phase-1-data/AGRISHIELD_DATA_BOUNDARY.md` | Establishes zero-hallucination constraints. |
| ICAR raw evidence | `phase-1-data/raw_source_evidence.md` | Source citations for all reference data. |

---

## 3. RiskEvent Changes

The existing `RiskEvent` model (`src/models/RiskEvent.ts`) was extended with:

### New Fields Added
- `threatId` (String, indexed) — Unique threat identifier matching ICAR catalog
- `threatName` (String) — Human-readable threat name
- `ruleId` (String, indexed) — References validated rule registry
- `riskLevel` (String enum) — Categorical risk level (NO_CONCERN / LOW / MODERATE / HIGH / CRITICAL / POTENTIAL_CONCERN / INSUFFICIENT_DATA / INCONCLUSIVE)
- `explanation` (String) — Human-readable risk explanation
- `missingEvidence` (String[]) — Explicit list of unavailable evidence
- `evaluatedAt` (Date, indexed) — When the evaluation was performed

### Extended Enums
- `riskStatus` enum extended: added `NO_CONCERN`, `POTENTIAL_CONCERN`, `INSUFFICIENT_DATA`, `INCONCLUSIVE`
- `riskLevel` enum added: full categorical risk level taxonomy

### Deduplication Index
```
{ cropCycleId: 1, zoneId: 1, threatId: 1, ruleId: 1 }
```
Named `unique_risk_event_per_context`. Ensures idempotent evaluation — repeated evaluations
update existing events rather than creating duplicates.

### Unchanged
- `riskScore` remains `Number, default: null` — **strictly null** under Zero Hallucination policy
- `contributingFactors` (Mixed) preserved with extended sub-schema
- `recommendedActions` (String[]) preserved but always empty (Phase 6 does not generate treatment plans)

---

## 4. Risk Engine Architecture

```
evaluateCropRisk(cropId, farmerId, targetZoneId?)
         │
         ├── 1. Ownership & Crop Verification
         ├── 2. Field Verification
         ├── 3. Zone Validation (if requested)
         ├── 4. Crop Cycle Evaluation (Phase 3C)
         ├── 5. Weather Observation Retrieval (Phase 5)
         ├── 6. Diagnostic Scan Retrieval (Phase 4)
         ├── 7. Variety Reference Retrieval (ICAR)
         ├── 8. Context Assembly
         ├── 9. Rule Loading (getRulesForCrop)
         ├── 10. Rule Evaluation (evaluateRule × N)
         ├── 11. Idempotent RiskEvent Persistence
         └── 12. Zone-by-Zone Breakdown
```

### Source Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/risk/riskTypes.ts` | TypeScript type definitions | Risk levels, statuses, evidence types, rule interface, context, summary |
| `src/lib/risk/riskEvidence.ts` | Evidence extraction & normalization | Stage evidence, weather evidence, scan evidence (zone-isolated), resistance evidence |
| `src/lib/risk/riskRules.ts` | Validated rules registry | 26 ICAR-grounded rules (20 computable, 6 non-computable) |
| `src/lib/risk/riskEvaluator.ts` | Deterministic rule evaluation | Single-rule evaluation with 6 decision paths |
| `src/lib/risk/riskEngine.ts` | Main orchestrator | Full pipeline from ownership to persistence |

---

## 5. Rules Implemented

### 20 Computable Scan-Based Rules

| Rule ID | Crop | Threat | Category |
|---------|------|--------|----------|
| RULE-RICE-SCAN-01 | Rice | Rice Blast (Magnaporthe oryzae) | FUNGAL |
| RULE-RICE-SCAN-02 | Rice | Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae) | BACTERIAL |
| RULE-RICE-SCAN-03 | Rice | Brown Spot (Bipolaris oryzae) | FUNGAL |
| RULE-RICE-SCAN-04 | Rice | Sheath Blight (Rhizoctonia solani) | FUNGAL |
| RULE-WHEAT-SCAN-01 | Wheat | Yellow Rust (Puccinia striiformis) | FUNGAL |
| RULE-WHEAT-SCAN-02 | Wheat | Brown Rust (Puccinia triticina) | FUNGAL |
| RULE-WHEAT-SCAN-03 | Wheat | Karnal Bunt (Tilletia indica) | FUNGAL |
| RULE-WHEAT-SCAN-04 | Wheat | Loose Smut (Ustilago tritici) | FUNGAL |
| RULE-COTTON-SCAN-01 | Cotton | Grey Mildew (Ramularia areola) | FUNGAL |
| RULE-COTTON-SCAN-02 | Cotton | Bacterial Blight (Xanthomonas citri pv. malvacearum) | BACTERIAL |
| RULE-COTTON-SCAN-03 | Cotton | Cotton Leaf Curl Virus (CLCuD) | VIRAL |
| RULE-COTTON-SCAN-04 | Cotton | Bollworm Complex (Helicoverpa armigera) | INSECT_PEST |
| RULE-GROUNDNUT-SCAN-01 | Groundnut | Early Leaf Spot (Cercospora arachidicola) | FUNGAL |
| RULE-GROUNDNUT-SCAN-02 | Groundnut | Late Leaf Spot (Phaeoisariopsis personata) | FUNGAL |
| RULE-GROUNDNUT-SCAN-03 | Groundnut | Rust (Puccinia arachidis) | FUNGAL |
| RULE-GROUNDNUT-SCAN-04 | Groundnut | Stem Rot (Sclerotium rolfsii) | FUNGAL |
| RULE-SOYBEAN-SCAN-01 | Soybean | Rust (Phakopsora pachyrhizi) | FUNGAL |
| RULE-SOYBEAN-SCAN-02 | Soybean | Yellow Mosaic Virus (MYMV) | VIRAL |
| RULE-SOYBEAN-SCAN-03 | Soybean | Anthracnose (Colletotrichum truncatum) | FUNGAL |
| RULE-SOYBEAN-SCAN-04 | Soybean | Charcoal Rot (Macrophomina phaseolina) | FUNGAL |

### Evaluation Logic (Computable Rules)

```
No active scans           → NO_CONCERN (no visual evidence)
Clean scan (no pathogen)  → NO_CONCERN
Matching pathogen detected → POTENTIAL_CONCERN
  + resistant cultivar     → POTENTIAL_CONCERN / riskLevel = LOW (mitigated)
Conflicting scans          → INCONCLUSIVE
```

---

## 6. Rules Intentionally NOT Implemented

### 6 Non-Computable Weather Stress Rules

| Rule ID | Crop | Threat | Reason |
|---------|------|--------|--------|
| RULE-WEATHER-WHEAT-01 | Wheat | Terminal Heat Stress | Source reports qualitative "elevated temperature / heat stress" — no numeric threshold in structured data |
| RULE-WEATHER-WHEAT-02 | Wheat | Vegetative Moisture Stress / Drought | Source omits computational numeric moisture deficit threshold |
| RULE-WEATHER-RICE-01 | Rice | High Temperature Stress (Floret Sterility) | Source omits computational numeric floret sterility temperature threshold |
| RULE-WEATHER-RICE-02 | Rice | Vegetative Drought Stress | Source omits computational numeric rainfall deficit threshold |
| RULE-WEATHER-COTTON-01 | Cotton | Waterlogging & Square Shedding | Source omits computational numeric saturation duration threshold |
| RULE-WEATHER-SOY-01 | Soybean | Seedling Mortality under Submergence | Source omits computational numeric inundation duration threshold |

These rules are **registered** in the rules registry with `isComputable: false` and
`uncomputableReason` explaining why. When evaluated, they return `INSUFFICIENT_DATA`
with an explicit `missingEvidence: ['WEATHER_THRESHOLD']` explanation.

### Why Not Invented

The Phase 1 Validation Report (Section 7) mentions qualitative thresholds like
"RH > 80–85%" and ">32–35°C" in narrative text, but these are NOT present in the
structured JSON data (`numericThresholdNote: null` for all 227 records). Under the
Zero Hallucination policy, we do not extract thresholds from narrative text and
hardcode them as computational parameters.

---

## 7. Evidence Model

### Evidence Source Types
- `AGRIVISION_SCAN` — AgriVision diagnostic scan result
- `WEATHER_OBSERVATION` — Phase 5 historical weather data
- `CROP_CYCLE_STAGE` — Phase 3C growth stage / DAS / GDD
- `VARIETY_REFERENCE` — ICAR variety catalog (cultivar resistance)
- `PEST_DISEASE_REFERENCE` — ICAR pest/disease catalog
- `WEATHER_CONDITION_REFERENCE` — ICAR weather condition catalog

### Evidence Structure (RiskEvidence)
```typescript
{
  sourceType: EvidenceSourceType;
  sourceId?: string;
  value: string;
  date?: string;
  metadata?: Record<string, unknown>;
}
```

### Evidence Extraction Functions
- `extractStageEvidence(context)` — Current growth stage name, DAS, GDD, progression mode
- `extractWeatherEvidence(context)` — Recent temperature extremes, rainfall, humidity from Phase 5
- `extractScanEvidence(context, targetZoneId)` — Zone-isolated scan results with temporal filtering (14-day active window)
- `extractResistanceEvidence(context)` — Cultivar resistance data from ICAR variety reference

---

## 8. Data Sufficiency Logic

The engine explicitly handles missing data at multiple levels:

1. **Rule level**: If `isComputable: false` → immediate `INSUFFICIENT_DATA` with
   `uncomputableReason` preserved in explanation

2. **Evidence level**: Each evidence extraction function returns empty arrays
   (not fabricated defaults) when data is unavailable

3. **Weather coverage**: Computed as `(available observations / 7) × 100%`. If
   zero observations are available, `weatherAvailable: false` is reported

4. **Stage data**: If crop cycle evaluation returns no current stage,
   `cropStageAvailable: false` is reported

5. **Scan data**: If no active scans exist (last 14 days), the rule evaluates to
   `NO_CONCERN` (absence of evidence is not evidence of threat)

6. **Variety data**: If no variety reference found, resistance mitigation is
   skipped (default path, no fabrication)

7. **Response level**: `evidenceCompleteness` object in API response explicitly
   reports which data sources were available

---

## 9. Conflict Handling

### Conflicting Scans → INCONCLUSIVE

When two active scans for the same zone produce contradictory results (one identifies
a pathogen, another does not, or identifies different pathogens), the evaluator returns:

- `status: 'INCONCLUSIVE'`
- `riskLevel: 'INCONCLUSIVE'`
- `explanation`: Describes the conflicting evidence
- `supportingEvidence`: Contains all conflicting scan evidence

### Aggregation Priority

When aggregating multiple threat evaluations:
1. Any `POTENTIAL_CONCERN` → overall `POTENTIAL_CONCERN`
2. Any `INCONCLUSIVE` → overall `INCONCLUSIVE`
3. Any `INSUFFICIENT_DATA` → overall `INSUFFICIENT_DATA`
4. All clear → overall `NO_CONCERN`

---

## 10. AgriVision Integration

Phase 6 consumes Phase 4 AgriVision diagnostic results as **read-only evidence**:

- Scans are retrieved from `CropDiseaseScan` collection
- Zone isolation is enforced: scans from Zone A are never applied to Zone B evaluation
- Temporal filtering: only scans within 14 days are considered "active"
- Scans older than 14 days are classified as "historical" and excluded from active evaluation
- A scan does NOT automatically mean confirmed disease — it is one evidence source
- AgriVision response semantics are preserved as-is (no invented interpretation)

---

## 11. Weather Integration

Phase 6 consumes Phase 5 historical weather observations:

- Retrieved from `WeatherObservation` collection (`isForecast: false`)
- Last 30 observations loaded, sorted by date descending
- Normalized to consistent structure: `minTemperatureC`, `maxTemperatureC`, `meanTemperatureC`,
  `rainfallMm`, `relativeHumidityPct`, `windSpeedKph`, `solarRadiationWm2`
- Missing values are `null` (never `0`)
- Weather data is used for context building only — **no weather thresholds are evaluated**
  because all 227 ICAR weather condition records lack numeric thresholds
- Weather reference IDs are stored in RiskEvent for traceability

---

## 12. Crop-Cycle Integration

Phase 6 consumes Phase 3C crop cycle state:

- `evaluateCropCycle(cropId, farmerId, { autoUpdateDb: false })` — read-only mode
- Extracts: `currentDas`, `progressionMode` (DYNAMIC_GDD / DAS_FALLBACK),
  `cumulativeGdd`, `currentStage`, `status`
- Growth stage name is used for context display
- Stage-specific rule applicability is available but currently informational
  (all 20 computable rules are scan-based, not stage-gated)
- Phase 3C is not modified or rewritten

---

## 13. Zone-Level Behavior

### Zone Isolation
- When `targetZoneId` is specified, only scans matching that zone are considered
- Scans from other zones are excluded from evidence
- RiskEvents are persisted with the specific `zoneId`

### Field-Level Evaluation
- When no `targetZoneId` is specified, the engine evaluates at the crop/field level
- Additionally, it iterates all field zones and produces a `zoneRisks` breakdown
- Each zone gets independent rule evaluation with its own scan evidence

### Deduplication per Context
- The compound index `{ cropCycleId, zoneId, threatId, ruleId }` ensures that
  repeated evaluations for the same crop + zone + threat + rule combination
  update the existing RiskEvent rather than creating duplicates

---

## 14. Security

### Farmer Ownership Enforcement
- `Crop.findOne({ _id: cropId, farmerId })` — ensures crop belongs to authenticated farmer
- `Field.findOne({ _id: crop.fieldId, farmerId })` — ensures field belongs to farmer
- `FarmZone.findOne({ _id: targetZoneId, fieldId: field._id, farmerId })` — ensures zone belongs to field and farmer
- `CropDiseaseScan.find({ cropCycleId: crop._id, farmerId })` — ensures only farmer's scans are accessed

### Authentication
- API routes use `const { userId } = await auth()` from `@/lib/auth`
- Unauthenticated requests return 401
- Cross-tenant access is impossible — all queries include `farmerId` filter

### Input Validation
- `mongoose.Types.ObjectId.isValid()` checks on `cropId` and `zoneId`
- Invalid format returns 400 error

---

## 15. Duplicate Prevention

### Idempotent Persistence via findOneAndUpdate
```typescript
await RiskEvent.findOneAndUpdate(
  {
    cropCycleId: crop._id,
    zoneId: targetZoneId ? new mongoose.Types.ObjectId(targetZoneId) : null,
    threatId: evaluation.threatId,
    ruleId: evaluation.ruleId,
  },
  { $set: { /* full evaluation data */ } },
  { upsert: true, new: true }
);
```

- First evaluation: creates new RiskEvent (upsert)
- Subsequent evaluations: updates existing RiskEvent with latest assessment
- Compound index `unique_risk_event_per_context` supports efficient lookup

---

## 16. API Endpoints

### GET `/api/crops/[id]/risk`
- **Authentication**: Required (`auth()`)
- **Parameters**: `id` (crop ObjectId, path)
- **Response**: Full `CropRiskSummary` with all evaluated threats and zone breakdown
- **File**: `src/app/api/crops/[id]/risk/route.ts`

### GET `/api/crops/[id]/zones/[zoneId]/risk`
- **Authentication**: Required (`auth()`)
- **Parameters**: `id` (crop ObjectId, path), `zoneId` (zone ObjectId, path)
- **Response**: Zone-specific `CropRiskSummary` with zone-isolated scan evidence
- **File**: `src/app/api/crops/[id]/zones/[zoneId]/risk/route.ts`

### Response Shape (CropRiskSummary)
```json
{
  "success": true,
  "cropId": "...",
  "fieldId": "...",
  "zoneId": "..." | null,
  "cropName": "...",
  "variety": "...",
  "overallStatus": "NO_CONCERN" | "POTENTIAL_CONCERN" | "INSUFFICIENT_DATA" | "INCONCLUSIVE",
  "overallLevel": "NO_CONCERN" | "LOW" | "POTENTIAL_CONCERN" | ...,
  "growthStage": {
    "name": "...",
    "currentDas": 45,
    "cumulativeGdd": 780,
    "progressionMode": "DYNAMIC_GDD" | "DAS_FALLBACK",
    "source": "Thermal Time Accumulation" | "Physiological DAS Fallback"
  },
  "evaluatedThreats": [...],
  "evidenceCompleteness": {
    "cropStageAvailable": true,
    "weatherAvailable": true,
    "weatherCoveragePercent": 100,
    "imageScanAvailable": false,
    "varietyDataAvailable": true
  },
  "zoneRisks": [...] | undefined,
  "lastEvaluatedAt": "..."
}
```

---

## 17. Test Results

### Phase 6 Test Suite (`scripts/test_phase6_risk_engine.ts`)

| Group | Description | Tests | Result |
|-------|-------------|-------|--------|
| 1 | RiskEvent Schema & Zero Hallucination | 8 | ✅ PASS |
| 2 | Validated Rules & Provenance Registry | 9 | ✅ PASS |
| 3 | Zero Hallucination Rule Evaluation | 13 | ✅ PASS |
| 4 | Multi-Tenant Security & Zone Isolation | 8 | ✅ PASS |
| **Total** | | **38/38** | **✅ ALL PASS** |

### Regression Suites

| Phase | Tests | Result |
|-------|-------|--------|
| Phase 3C — Crop Cycle Engine | 50/50 | ✅ PASS |
| Phase 4 — Progressive Zone Image Pipeline | 50/50 | ✅ PASS |
| Phase 5 — Historical Weather Extension | 40/40 | ✅ PASS |
| Phase 6 — Risk Engine | 38/38 | ✅ PASS |
| **Total** | **178/178** | **✅ ALL PASS** |

---

## 18. TypeScript Result

```
$ npx tsc --noEmit
(exit code 0 — no errors)
```

**TYPECHECK: PASS** — 0 errors, 0 warnings.

---

## 19. Build Result

```
$ npm run build
✓ Compiled successfully in 28.7s
✓ Generating static pages (108/108)
```

**BUILD: PASS**

Note: Pre-existing FirebaseAdmin warning about missing `project_id` in service account
is unrelated to Phase 6 and was present before this implementation.

---

## 20. Scientific Limitations

### Data Quality Constraints

1. **No numeric weather thresholds**: All 227 ICAR weather condition records have
   `threshold: null` and `duration: "NOT_FOUND_IN_SOURCE"`. Weather stress rules
   cannot be computationally evaluated until source data provides numeric thresholds.

2. **No symptoms/favorable conditions data**: All 1,503 ICAR pest/disease records
   have `symptoms: "NOT_FOUND_IN_SOURCE"`, `affected_stage: "NOT_FOUND_IN_SOURCE"`,
   `favorable_conditions: "NOT_FOUND_IN_SOURCE"`. Environmental trigger rules cannot
   be implemented.

3. **Limited crop coverage**: Only 5 crops (Rice, Wheat, Cotton, Groundnut, Soybean)
   have ICAR reference data. Other crops produce zero evaluated threats.

4. **Scan-only evaluation**: All 20 computable rules rely solely on AgriVision scan
   evidence. There is no automated environmental risk assessment capability until
   Phase 1 data quality improves.

5. **No validated scoring method**: `riskScore` is strictly `null` because no
   scientifically validated scoring algorithm exists in the source data. Categorical
   risk levels are the only supported risk representation.

6. **No stage-gated activation**: While rules have `applicableStageNames`, the current
   evaluation does not gate rules by growth stage because all rules are scan-based
   and pathogens can appear outside expected stages.

7. **No geographic filtering**: While rules have `geographicApplicability`, the
   current evaluation does not filter by geographic region because field location
   coordinates are optional and may be null.

### What Would Improve Coverage

- ICAR or other authoritative sources providing numeric thresholds for weather stress
- Structured symptom descriptions enabling image-based secondary verification
- Validated duration parameters for stress exposure
- Geographic risk zone mapping with computational boundaries
- Peer-reviewed scoring methodologies for agricultural risk quantification

---

## 21. Phase 7 Boundary

Phase 6 does **NOT** implement any of the following, which belong to future phases:

- ❌ IPM (Integrated Pest Management) recommendations
- ❌ Pesticide / fungicide recommendations
- ❌ Treatment plans or prescriptions
- ❌ Irrigation scheduling or recommendations
- ❌ Fertilizer recommendations
- ❌ Harvest window prediction
- ❌ Yield estimation
- ❌ Satellite / NDVI analysis
- ❌ Market price integration
- ❌ Insurance integration
- ❌ Advisory generation (Phase 7+)
- ❌ Alert/notification dispatch
- ❌ ML/AI classifiers
- ❌ Weighted scoring models
- ❌ Automatic remediation actions

The Risk Engine is a **read-only, evidence-combining, deterministic evaluator**. It produces
categorical risk assessments that can be consumed by future phases to generate farmer-facing
advisories, but it does not itself generate actionable recommendations.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/risk/riskTypes.ts` | TypeScript type definitions for risk engine |
| `src/lib/risk/riskEvidence.ts` | Evidence extraction and normalization |
| `src/lib/risk/riskRules.ts` | 26 ICAR-grounded validated risk rules |
| `src/lib/risk/riskEvaluator.ts` | Deterministic single-rule evaluator |
| `src/lib/risk/riskEngine.ts` | Main risk evaluation orchestrator |
| `src/app/api/crops/[id]/risk/route.ts` | Crop risk API endpoint |
| `src/app/api/crops/[id]/zones/[zoneId]/risk/route.ts` | Zone risk API endpoint |
| `phase-1-data/PHASE_6_RULE_AUDIT.md` | Rule traceability audit document |
| `scripts/test_phase6_risk_engine.ts` | 38-test validation suite |
| `phase-1-data/PHASE_6_IMPLEMENTATION_REPORT.md` | This report |

## Files Modified

| File | Change |
|------|--------|
| `src/models/RiskEvent.ts` | Extended with Phase 6 fields, enums, and dedup index |
| `src/app/[locale]/(app)/dashboard/my-crops/page.tsx` | Added minimal AgriShield Risk UI (button + result panel) |

---

*End of Phase 6 Implementation Report*
