# AgriShield 360° — GDD Engine Readiness & Architecture Specification

This document defines the computational readiness of each crop parameter set for the AgriShield Phase 3 Crop Cycle Engine, details the in-depth agronomic analysis for 9 target crops, and specifies the database architectural recommendations.

## 1. Engine Readiness Classification

Every crop and parameter set is evaluated into one of three operational states:
- **`READY_FOR_GDD_ENGINE`**: Both explicit base temperature ($T_b$) and phenophasic/maturity GDD values are source-grounded and validated. Ready for daily thermal integration using weather station/API inputs.
- **`PARTIAL_GDD_SUPPORT`**: Stage or maturity GDD values exist, but base temperature is omitted (`null`), requiring source-backed literature resolution before dynamic engine execution.
- **`DAS_ONLY`**: Crops where only ICAR Phase 1 DAS phenology exists and no usable primary numerical GDD dataset is established.

### Readiness Summary by Crop

| Crop | Primary Readiness Status | Validated Base Temp ($T_b$) | Available Parameter Sets | Engine Activation Mode |
|---|---|---|---|---|
| **Cotton** | `READY_FOR_GDD_ENGINE` | 15.5 °C | 3 sets (Gujarat: Onset, +15d, +30d) | Dynamic GDD Engine Active (Base 15.5°C) |
| **Pigeonpea** | `READY_FOR_GDD_ENGINE` | 10.0 °C | 32 sets (Maharashtra: 4 cvs, 4 sowings, 2 yrs) | Dynamic GDD Engine Active (Base 10.0°C) |
| **Castor** | `READY_FOR_GDD_ENGINE` | 10.0 °C | 3 sets (Gujarat: Onset, +15d, +30d) | Dynamic GDD Engine Active (Base 10.0°C) |
| **Sesame** | `READY_FOR_GDD_ENGINE` | 10.0 °C | 3 sets (Gujarat: Onset, +15d, +30d) | Dynamic GDD Engine Active (Base 10.0°C) |
| **Black Gram** | `READY_FOR_GDD_ENGINE` | 10.0 °C | 3 sets (Gujarat: Onset, +15d, +30d) | Dynamic GDD Engine Active (Base 10.0°C) |
| **Banana** | `READY_FOR_GDD_ENGINE` | 13.0 °C | 11 sets (Tamil Nadu: 11 commercial cvs) | Dynamic GDD Engine Active (Base 13.0°C) |
| **Indian Mustard** | `READY_FOR_GDD_ENGINE` | 5.0 °C | 23 sets (Central Plain: 22 genotypes) | Dynamic GDD Engine Active (Base 5.0°C) |
| **Pearl Millet** | `READY_FOR_GDD_ENGINE` (Multi-Set) | 10.0 °C / 12.0 °C / 7.0 °C | 19 sets (GJ Summer, GJ Kharif, MH Kharif, ICRISAT) | Location/Season-Conditioned Binding |
| **Groundnut** | `READY_FOR_GDD_ENGINE` (Multi-Set) | 10.0 °C | 10 sets (GJ Kharif Spreading, GJ Summer Bunch) | Season/Subspecies-Conditioned Binding |
| **Soybean** | `READY_FOR_GDD_ENGINE` (Multi-Set) | 10.0 °C | 20 sets (MH Parbhani, CG Raipur) | Cultivar-Conditioned Binding |
| **Sorghum** | `READY_FOR_GDD_ENGINE` (Benchmark) | 7.0 °C | 6 sets (Benchmark 6 maturity classes) | Benchmark GDD Active |
| **Wheat** | `PARTIAL_GDD_SUPPORT` | Missing in tables (`null`) | 5 sets (AAU Anand maturity only; Udaipur 9 stages) | Hybrid Engine: DAS primary, GDD monitoring |
| **Chickpea** | `PARTIAL_GDD_SUPPORT` | Missing in tables (`null`) | 6 sets (Jabalpur 6 sowings) | Hybrid Engine: DAS primary, GDD monitoring |
| **Rabi Sorghum** | `PARTIAL_GDD_SUPPORT` | Missing in tables (`null`) | 12 sets (Solapur 3 cvs, 4 sowings) | Hybrid Engine: DAS primary, GDD monitoring |
| **Rice** | `PARTIAL_GDD_SUPPORT` | Missing in tables (`null`) | 5 sets (Pusa Samastipur 4 sowings) | Hybrid Engine: DAS primary, GDD monitoring |
| **Mango** | `DAS_ONLY` | Not reported | 0 usable numerical sets (Agresco qualitative) | DAS Phenology Engine Only |

## 2. In-Depth Agronomic Review for 9 Target Crops

### 1. Pearl Millet (Pennisetum glaucum)

**Parameter Sets Existing**: 4 distinct contextual groups across 19 parameter sets:
  - *Set A (South Saurashtra, Gujarat — Summer)*: `PS-028` to `PS-033` (cvs. GHB 558, GHB 538, Proagro 9444; $T_b = 12.0^\circ\text{C}$; Maturity GDD: 1963–2213 °C day).
  - *Set B (North Saurashtra, Gujarat — Kharif)*: `PS-022` to `PS-024` (cv. GHB-558; $T_b = 10.0^\circ\text{C}$; Maturity GDD: 1375–1641 °C day).
  - *Set C (Scarcity Zone, Maharashtra — Kharif)*: `PS-034` to `PS-042` (cvs. Shanti, MRB-204, Dhanashakti; $T_b = 10.0^\circ\text{C}$; Maturity GDD: 967–2105 °C day).
  - *Set D (Solapur Historical — Kharif)*: `PS-080` to `PS-094` (cv. WCC-75; 5 years, $T_b = null$).
  - *Set E (Benchmark ICRISAT)*: `PS-144` (cv. BJ-104; $T_b = 7.0^\circ\text{C}$; GDD: 1390 °C day).
**Why They Must Remain Separate**: Blending Jamnagar's summer base temp ($12^\circ\text{C}$) with Solapur's kharif base temp ($10^\circ\text{C}$) or ICRISAT's screening base temp ($7^\circ\text{C}$) destroys mathematical integrity. Summer pearl millet accumulates heat units in 40°C+ ambient air over 93 days, whereas rainfed kharif crops face cooler, overcast monsoon skies and mature in 75–85 days.

### 2. Groundnut (Arachis hypogaea)

**Parameter Sets Existing**: 2 distinct agro-climatic & botanical groups across 10 parameter sets:
  - *Set A (North Saurashtra, Gujarat — Kharif Spreading)*: `PS-010` to `PS-012` (cv. GG-13; $T_b = 10.0^\circ\text{C}$; Maturity GDD: 1715–2325 °C day).
  - *Set B (South Saurashtra, Gujarat — Summer Bunch)*: `PS-043` to `PS-049` (cvs. GJG-31, GG-34, GG-37; $T_b = 10.0^\circ\text{C}$; Maturity GDD: 2101–2310 °C day).
**Why They Must Remain Separate**: Habit of growth (spreading vs bunch) and seasonal moisture environment dictate vastly different thermal responses. Kharif GG-13 shows a sharp 610 °C day drop under delayed sowing due to autumn soil moisture exhaustion in Saurashtra vertisols, whereas irrigated summer bunch groundnut maintains high thermal accumulation (2100–2310 °C day).

### 3. Soybean (Glycine max)

**Parameter Sets Existing**: 2 distinct regional groups across 20 parameter sets:
  - *Set A (Marathwada, Maharashtra)*: `PS-050` to `PS-057` (cvs. MAUS-71, MAUS-158, MAUS-162; $T_b = 10.0^\circ\text{C}$; Maturity GDD: 2371–3164 °C day across 10 discrete stages).
  - *Set B (Chhattisgarh Plains / Central India)*: `PS-058` to `PS-069` (cvs. JS 97-52, JS 335, JS 93-05; $T_b = 10.0^\circ\text{C}$; Maturity GDD: 1453–1913 °C day across 5 stages).
**Why They Must Remain Separate**: The MAUS cultivars are long-duration types bred specifically for the black soils of Marathwada, requiring up to 3164 °C day. Applying MAUS parameters to quick-maturing JS 93-05 (1453 °C day) would cause the AgriShield engine to miscalculate flowering and podding risk windows by several weeks.

### 4. Wheat (Triticum aestivum)

**Parameter Sets Existing**: 2 parameter groups across 5 parameter sets:
  - *Set A (Middle Gujarat Zone III — AAU Anand)*: `PS-095` (cv. GW-496; Normal sown; Maturity GDD: $1815 \pm 57\ ^\circ\text{C}\text{ day}$; $T_b = null$).
  - *Set B (Sub-humid Southern Plain — MPUAT Udaipur)*: `PS-108` to `PS-111` (Pooled cultivars; 4 sowing dates; 9 stages from emergence to maturity GDD: 1640–1895 °C day; $T_b = null$).
**Why They Must Remain Separate**: Anand represents hot, irrigated central Gujarat conditions (sown when temperature approaches 24.5°C), while Udaipur represents continental northern winter regimes. Furthermore, base temperature is omitted in both source texts; therefore, the engine must use DAS as primary gatekeeper while tracking thermal progress.

### 5. Rice (Oryza sativa)

**Parameter Sets Existing**: 1 group across 5 parameter sets:
  - *Set A (North West Alluvial Plain — Pusa, Samastipur)*: `PS-139` to `PS-143` (Kharif rice; 4 sowing windows 31 May to 15 July; pooled 2009–2014; stages: tillering, booting, 50% earhead, milk, dough, maturity GDD: 2299–2623 day °C; $T_b = null$).
**Why They Must Remain Separate**: Rice in eastern gangetic plains differs from Gujarat/Maharashtra coastal or drilled paddy. As $T_b$ is not reported in Table 4.6, Rice is classified as `PARTIAL_GDD_SUPPORT`.

### 6. Cotton (Gossypium hirsutum)

**Parameter Sets Existing**: 1 robust group across 3 parameter sets:
  - *Set A (North Saurashtra Zone-VI — JAU Targhadia)*: `PS-001` to `PS-003` (cv. G.Cot Hybrid-8; 3 sowing dates: onset of monsoon, +15d, +30d; $T_b = 15.5^\circ\text{C}$; stages: germination, branching, flowering, boll formation, maturity; Total GDD: 2224–3120 °C day).
**Why They Must Remain Separate**: Cotton has a uniquely high base temperature ($T_b = 15.5^\circ\text{C}$), completely distinct from cereals ($10^\circ\text{C}$) or winter crops ($5^\circ\text{C}$). Sowing delay from monsoon onset reduces cotton thermal accumulation from 3120 down to 2224 °C day due to cessation of monsoonal rains.

### 7. Pigeonpea (Cajanus cajan)

**Parameter Sets Existing**: 1 highly detailed multi-treatment group across 32 parameter sets:
  - *Set A (Western Maharashtra Scarcity Zone — MPKV Rahuri / Pune)*: `PS-070` to `PS-079` (cvs. Vipula, Rajeshwari, BDN 711, ICPH 2740; 4 sowing windows 24th to 30th MW; evaluated across 2 full consecutive years 2017-18 and 2018-19; $T_b = 10.0^\circ\text{C}$; 6 cumulative stages P1 to P6; Total GDD: 2008–2748 degree-days).
**Why They Must Remain Separate**: Sowing windows strongly influence total degree-day consumption (D1 sown crop accumulated 2748 GDD vs D4 sown crop accumulating only 2008 GDD). Cultivar ICPH 2740 consistently required ~250–300 GDD more than early-maturing Rajeshwari.

### 8. Chickpea (Cicer arietinum)

**Parameter Sets Existing**: 1 group across 6 parameter sets:
  - *Set A (Kymore Plateau — JNKVV Jabalpur)*: `PS-102` to `PS-107` (Pooled cvs. JG-315 and JG-11; 6 staggered sowing dates 11 Oct to 19 Jan; stages: 50% flowering, pod initiation, maturity, harvest; Maturity GDD: 1265–2002 degree-days; $T_b = null$).
**Why They Must Remain Separate**: Early sown winter chickpea (October) accumulates 2002 GDD while late December sowings accumulate only 1265 GDD due to winter chilling. $T_b$ was not specified in Table 5.10, so it remains `PARTIAL_GDD_SUPPORT`.

### 9. Sorghum (Sorghum bicolor)

**Parameter Sets Existing**: 2 distinct groups across 18 parameter sets:
  - *Set A (Scarcity Zone, Maharashtra — Rabi Sorghum)*: `PS-096` to `PS-101` (cvs. M 35-1, Mauli, Vasudha; 4 staggered rabi sowings; 8 phenological stages; $T_b = null$).
  - *Set B (Benchmark Models — ICRISAT SORGF)*: `PS-145` to `PS-150` (6 maturity classes: Very Early, Early, Medium Early, Medium, Medium Late, Late; 10 phenological stages; $T_b = 7.0^\circ\text{C}$; Maturity GDD: 1125–1500 GDD).
**Why They Must Remain Separate**: Rabi sorghum in Maharashtra is grown on receding post-monsoon soil moisture in winter (M 35-1 'Maldandi' is photoperiod sensitive), whereas the ICRISAT benchmark curves represent standard warm-season sorghum physiology.

## 3. Database Architecture Recommendation

### Evaluation of Existing Mongoose Models
- **`IcarCrop` & `IcarVariety`**: Designed in Phase 1C for ICAR baseline taxonomy, crop calendar seasons, and DAS phenology (e.g. `min_days`, `max_days`, `recommended_zones`). They are strictly scalar and crop/variety-level. Adding location-dependent, season-dependent GDD matrices with conflicting base temperatures into `IcarVariety` would violate database normalization and pollute ICAR national baseline records.
- **`CropGrowthStage`**: Designed for chronological stage definitions (sequence, name, description, water requirements). It does not accommodate regional variations where the same stage has different thermal targets in Gujarat vs Maharashtra.
- **`GddLog`**: An operational transaction log recording daily temperature and running GDD accumulation for an active `CropCycle`. It is a consumer of parameters, not a parameter definition schema.

### Recommendation: Dedicated `GddParameterSet` Model
> [!IMPORTANT]
> **Architectural Conclusion**: The existing models are INSUFFICIENT to represent multi-source, location-conditioned, and season-conditioned GDD parameters without data corruption. A new dedicated Mongoose model, **`GddParameterSet`**, is strongly recommended for Phase 3 implementation.

### Proposed `GddParameterSet` Schema (Specification Only — NOT Yet Implemented)

```typescript
// Recommended schema for Phase 3 Crop Cycle Engine implementation
interface IGddStageThreshold {
  stageName: string;            // e.g. 'Flowering', 'BallFormation'
  standardizedStage: string;    // 'germination' | 'vegetative' | 'flowering' | 'grain_filling' | 'maturity'
  periodicGdd: number;          // GDD required within this stage
  cumulativeGdd: number;        // Accumulated GDD from sowing/emergence
  unit: string;                 // '°C day' | 'degree-days'
}

interface IGddParameterSet {
  parameterSetId: string;       // Unique ID, e.g. 'PS-COT-GUJ-001'
  cropName: string;             // 'Cotton', 'Pearl Millet', etc.
  cropId?: Types.ObjectId;      // Foreign key to IcarCrop (optional loose coupling)
  varietyName?: string;         // 'G.Cot Hybrid-8', 'GHB-558', or null for pooled
  varietyId?: Types.ObjectId;   // Foreign key to IcarVariety (optional)
  regionRelevance: 'GUJARAT' | 'MAHARASHTRA' | 'OTHER_INDIAN' | 'INTERNATIONAL';
  state: string;                // 'Gujarat', 'Maharashtra', etc.
  district?: string;            // 'Rajkot', 'Jamnagar', 'Solapur'
  agroclimaticZone?: string;    // 'North Saurashtra Zone-VI', 'Scarcity Zone'
  season: 'Kharif' | 'Rabi' | 'Summer' | 'Annual';
  sowingWindow?: string;        // 'Onset of monsoon', '4th SMW', '15th Feb'
  baseTemperature: number;      // e.g. 15.5, 12.0, 10.0, 5.0 (null if unconfirmed)
  upperThreshold?: number;      // Optional upper cutoff
  calculationFormula: string;   // '[(Tmax + Tmin)/2] - Tb'
  stages: IGddStageThreshold[]; // Phenophasic progression array
  maturityGdd: number;          // Total crop duration thermal requirement
  qualityClassification: 'SOURCE_COMPLETE' | 'PARTIAL' | 'CONFLICTED' | 'NOT_USABLE_FOR_ENGINE';
  engineReadiness: 'READY_FOR_GDD_ENGINE' | 'PARTIAL_GDD_SUPPORT' | 'DAS_ONLY';
  conflictGroupId?: string;     // 'CONFLICT-PM-01', 'CONFLICT-GN-01', etc.
  sourceCitation: {
    sourceFile: string;
    authors: string;
    publicationYear: number;
    tableOrPage: string;
  };
  isDefaultFallback: boolean;   // False by default; prevents unintentional fallback
}
```
