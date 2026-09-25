# PHASE 6 — AGRISHIELD 360° RULE AUDIT DOCUMENT
**KisanDost / AgriShield 360° / My Crop**

**Date:** 2026-09-25  
**Audit Purpose:** Comprehensive traceability registry of all candidate agricultural risk rules. Strictly records which rules are computationally evaluable vs uncomputable under the Zero Hallucination Policy.

---

## 1. Audit Summary Statistics

- **Total reference relationships in catalog:** 1,503 (Pest/Disease references) + 227 (Weather Condition references)
- **Total candidate rules cataloged:** 26
- **Computationally evaluable rules:** 20 (Scan-verified pathogen rules with ICAR provenance)
- **Non-computable rules (preserved as INSUFFICIENT_DATA):** 6 (Qualitative meteorological stresses lacking numeric thresholds in ICAR source texts)
- **Rules with invented thresholds:** **EXACTLY ZERO (0)**

---

## 2. Category A: Scan-Verified Pathogen Rules (Computationally Evaluable)

These rules link ICAR certified pathogen threats with AgriVision diagnostic evidence in specific monitoring zones.

### Rule ID: `RULE-RICE-SCAN-01`
- **Crop:** Rice (*Oryza sativa*)
- **Threat:** Rice Blast / Leaf & Neck Blast (*Magnaporthe oryzae*)
- **Weather condition:** Warm humid conditions (Qualitative ICAR trait note)
- **Crop stage:** Tillering, Panicle Initiation & Flowering
- **Geographic scope:** All India (Kharif/Rabi rice tracts)
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23, 2023-24
- **Source document:** `crop_pest_disease_reference.json` (Entry `rice_neck-blast-magnaporthe-oryzae`)
- **Exact source evidence:** "Screening of breeding lines for leaf and neck blast resistance under uniform blast nursery trials across national locations."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-RICE-SCAN-02`
- **Crop:** Rice (*Oryza sativa*)
- **Threat:** Bacterial Leaf Blight (*Xanthomonas oryzae* pv. *oryzae*)
- **Weather condition:** High rainfall / humid weather (Qualitative note)
- **Crop stage:** Maximum Tillering to Heading
- **Geographic scope:** Punjab, Haryana, Coastal areas, Gangetic Plains
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23 p.27
- **Source document:** `crop_pest_disease_reference.json` (Entry `rice_bacterial-leaf-blight`)
- **Exact source evidence:** "Evaluation of Xa-gene introgressed lines against prevailing Xanthomonas oryzae pathotypes."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-RICE-SCAN-03`
- **Crop:** Rice (*Oryza sativa*)
- **Threat:** Brown Spot (*Bipolaris oryzae*)
- **Weather condition:** High humidity with soil nutritional stress
- **Crop stage:** Seedling to Grain Filling
- **Geographic scope:** Rainfed upland and shallow lowlands
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23 p.27
- **Source document:** `crop_pest_disease_reference.json` (Entry `rice_brown-spot`)
- **Exact source evidence:** "Resistance screening in national disease nursery trials for upland rice varieties."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-RICE-SCAN-04`
- **Crop:** Rice (*Oryza sativa*)
- **Threat:** Sheath Blight (*Rhizoctonia solani*)
- **Weather condition:** High nitrogen regimes with dense canopy wetness
- **Crop stage:** Tillering to Panicle Exsertion
- **Geographic scope:** Irrigated high-input ecologies
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2023-24
- **Source document:** `crop_pest_disease_reference.json` (Entry `rice_sheath-blight`)
- **Exact source evidence:** "Multi-location screening for sheath blight tolerance in semi-dwarf cultivars."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-RICE-SCAN-05`
- **Crop:** Rice (*Oryza sativa*)
- **Threat:** Brown Planthopper (*Nilaparvata lugens*)
- **Weather condition:** Warm, humid microclimate with cloudy spells
- **Crop stage:** Maximum Tillering to Milk stage
- **Geographic scope:** Irrigated and coastal rice belts
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23 p.28
- **Source document:** `crop_pest_disease_reference.json` (Entry `rice_gall-midge-orseolia-oryzae`)
- **Exact source evidence:** "BPH bioassay screening under controlled greenhouse and field infestation conditions."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-WHEAT-SCAN-01`
- **Crop:** Wheat (*Triticum aestivum*)
- **Threat:** Leaf Rust / Brown Rust (*Puccinia triticina*)
- **Weather condition:** Moderate temperatures with dew / leaf moisture
- **Crop stage:** Heading, Anthesis & Grain Filling (65–105 DAS)
- **Geographic scope:** NWPZ, NEPZ, Central Zone, Peninsular Zone
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23, 2023-24
- **Source document:** `crop_pest_disease_reference.json` (Entry `wheat_leaf-rust`)
- **Exact source evidence:** "Adult plant resistance and seedling resistance testing against Pt pathotype 77-5."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-WHEAT-SCAN-02`
- **Crop:** Wheat (*Triticum aestivum*)
- **Threat:** Stripe Rust / Yellow Rust (*Puccinia striiformis*)
- **Weather condition:** Cool, moist weather with night dew
- **Crop stage:** Tillering to Heading (25–85 DAS)
- **Geographic scope:** NWPZ and Northern Hills Zone (Punjab, Haryana, HP, J&K)
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23, 2024-25
- **Source document:** `crop_pest_disease_reference.json` (Entry `wheat_stripe-rust`)
- **Exact source evidence:** "Stripe rust severity scoring on advanced varietal trial lines using modified Cobb scale."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-WHEAT-SCAN-03`
- **Crop:** Wheat (*Triticum aestivum*)
- **Threat:** Stem Rust / Black Rust (*Puccinia graminis* f. sp. *tritici*)
- **Weather condition:** Warm days following damp mornings
- **Crop stage:** Heading to Maturity (75–120 DAS)
- **Geographic scope:** Central Zone & Peninsular Zone (Madhya Pradesh, Maharashtra, Karnataka)
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23
- **Source document:** `crop_pest_disease_reference.json` (Entry `wheat_stem-rust`)
- **Exact source evidence:** "Field evaluation against virulent pathotypes 40A and 117-6 in Central India."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-WHEAT-SCAN-04`
- **Crop:** Wheat (*Triticum aestivum*)
- **Threat:** Spot Blotch / Foliar Blight (*Bipolaris sorokiniana*)
- **Weather condition:** Warm, humid conditions in eastern plains
- **Crop stage:** Anthesis to Dough stage (70–115 DAS)
- **Geographic scope:** NEPZ (Eastern UP, Bihar, West Bengal)
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2023-24
- **Source document:** `crop_pest_disease_reference.json` (Entry `wheat_spot-blotch`)
- **Exact source evidence:** "Evaluation of spot blotch resistance under high temperature and humidity regimes in eastern gangetic plains."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-WHEAT-SCAN-05`
- **Crop:** Wheat (*Triticum aestivum*)
- **Threat:** Powdery Mildew (*Blumeria graminis*)
- **Weather condition:** Cool, overcast, dry weather
- **Crop stage:** Vegetative to Heading (30–80 DAS)
- **Geographic scope:** Northern Hills Zone
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23
- **Source document:** `crop_pest_disease_reference.json` (Entry `wheat_powdery-mildew`)
- **Exact source evidence:** "Screening in temperate hill ecology under natural disease pressure."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-COTTON-SCAN-01`
- **Crop:** Cotton (*Gossypium hirsutum / arboreum*)
- **Threat:** Pink Bollworm (*Pectinophora gossypiella*)
- **Weather condition:** Warm humid weather during flowering and boll retention
- **Crop stage:** Flowering & Boll Development (60–120 DAS)
- **Geographic scope:** Central and South Zones (Gujarat, Maharashtra, Telangana)
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23 p.31
- **Source document:** `crop_pest_disease_reference.json` (Entry `cotton_pink-bollworm`)
- **Exact source evidence:** "Rosetted flower and green boll destruct monitoring for Cry1Ac/Cry2Ab survivorship."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-COTTON-SCAN-02`
- **Crop:** Cotton (*Gossypium hirsutum*)
- **Threat:** Whitefly (*Bemisia tabaci*)
- **Weather condition:** Dry warm weather with low rainfall
- **Crop stage:** Seedling to Square Formation (20–60 DAS)
- **Geographic scope:** North Zone (Punjab, Haryana, Rajasthan) and Central Zone
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23, 2023-24
- **Source document:** `crop_pest_disease_reference.json` (Entry `cotton_whitefly`)
- **Exact source evidence:** "Whitefly population dynamics and vector transmission indexing."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-COTTON-SCAN-03`
- **Crop:** Cotton (*Gossypium hirsutum*)
- **Threat:** Cotton Leaf Curl Virus (CLCuV)
- **Weather condition:** Follows high whitefly vector activity
- **Crop stage:** Early Vegetative to Square Formation (15–60 DAS)
- **Geographic scope:** North Zone
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23
- **Source document:** `crop_pest_disease_reference.json` (Entry `cotton_leaf-curl-virus`)
- **Exact source evidence:** "Evaluation of CLCuV disease index under hotspot screening trials."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-COTTON-SCAN-04`
- **Crop:** Cotton (*Gossypium hirsutum*)
- **Threat:** Bacterial Blight (*Xanthomonas citri* pv. *malvacearum*)
- **Weather condition:** Warm rainy spells with wind-driven rain
- **Crop stage:** Square formation to Boll Opening
- **Geographic scope:** Central and South Zones
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2023-24
- **Source document:** `crop_pest_disease_reference.json` (Entry `cotton_bacterial-blight`)
- **Exact source evidence:** "Angular leaf spot and black arm symptom screening."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-COTTON-SCAN-05`
- **Crop:** Cotton (*Gossypium hirsutum*)
- **Threat:** Alternaria Leaf Spot (*Alternaria macrospora*)
- **Weather condition:** Intermittent showers with warm humidity
- **Crop stage:** Boll Development to Bursting
- **Geographic scope:** Central Zone (Gujarat, Maharashtra)
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2023-24
- **Source document:** `crop_pest_disease_reference.json` (Entry `cotton_alternaria-leaf-spot`)
- **Exact source evidence:** "Foliar blight severity assessment in arboreum and hirsutum trials."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-GND-SCAN-01`
- **Crop:** Groundnut (*Arachis hypogaea*)
- **Threat:** Tikka Leaf Spot / Early & Late Leaf Spot (*Cercospora arachidicola* / *Phaeoisariopsis personata*)
- **Weather condition:** High relative humidity with leaf surface wetness
- **Crop stage:** Flowering, Pegging & Pod Development (35–90 DAS)
- **Geographic scope:** Saurashtra (Gujarat), Andhra Pradesh, Tamil Nadu
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23 p.34
- **Source document:** `crop_pest_disease_reference.json` (Entry `groundnut_tikka-leaf-spot`)
- **Exact source evidence:** "Late leaf spot and rust screening on 1–9 modified scale in AICRP trials."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-GND-SCAN-02`
- **Crop:** Groundnut (*Arachis hypogaea*)
- **Threat:** Collar Rot / Stem Rot (*Sclerotium rolfsii*)
- **Weather condition:** High soil temperature with soil moisture fluctuation
- **Crop stage:** Emergence & Early Vegetative (0–30 DAS)
- **Geographic scope:** Gujarat, Maharashtra, Karnataka
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23
- **Source document:** `crop_pest_disease_reference.json` (Entry `groundnut_collar-rot`)
- **Exact source evidence:** "Seedling mortality evaluation in sick plots."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-GND-SCAN-03`
- **Crop:** Groundnut (*Arachis hypogaea*)
- **Threat:** Peanut Bud Necrosis Virus (PBNV)
- **Weather condition:** Thrips vector proliferation during dry intervals
- **Crop stage:** Vegetative to Flowering
- **Geographic scope:** Peninsular India
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2023-24
- **Source document:** `crop_pest_disease_reference.json` (Entry `groundnut_peanut-bud-necrosis`)
- **Exact source evidence:** "Vector transmission assays and field incidence recording."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-SOY-SCAN-01`
- **Crop:** Soybean (*Glycine max*)
- **Threat:** Yellow Mosaic Virus (YMV)
- **Weather condition:** High whitefly vector activity during dry spells
- **Crop stage:** Early Vegetative to Flowering (20–55 DAS)
- **Geographic scope:** Central Zone (Madhya Pradesh, Maharashtra)
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2022-23 p.36
- **Source document:** `crop_pest_disease_reference.json` (Entry `soybean_yellow-mosaic-virus`)
- **Exact source evidence:** "Screening for mungbean yellow mosaic India virus resistance."
- **Computationally evaluable:** Yes

### Rule ID: `RULE-SOY-SCAN-02`
- **Crop:** Soybean (*Glycine max*)
- **Threat:** Charcoal Rot (*Macrophomina phaseolina*)
- **Weather condition:** Post-flowering drought with elevated soil temperature
- **Crop stage:** Pod Initiation & Seed Filling (50–90 DAS)
- **Geographic scope:** Rainfed tracts of Central India
- **Required evidence:** `SCAN_RESULT`
- **Source:** ICAR Annual Report 2023-24
- **Source document:** `crop_pest_disease_reference.json` (Entry `soybean_charcoal-rot`)
- **Exact source evidence:** "Evaluation under moisture stress conditions in sick plots."
- **Computationally evaluable:** Yes

---

## 3. Category B: Qualitative Meteorological Stresses (Non-Computable)

These rules are documented in `crop_weather_conditions.json` and ICAR reports, but **lack numeric thresholds in the primary text**. Under the Zero Hallucination policy, they are strictly evaluated as `INSUFFICIENT_DATA` rather than guessing cutoffs.

### Rule ID: `RULE-WEATHER-WHEAT-01`
- **Crop:** Wheat (*Triticum aestivum*)
- **Threat:** Terminal Heat Stress (Physiological Disorder)
- **Weather condition:** "elevated temperature / heat stress"
- **Crop stage:** Flowering / Grain filling stage (65–105 DAS)
- **Geographic scope:** NWPZ, NEPZ, Central Zone
- **Required evidence:** `PHENOLOGY_STAGE`, `WEATHER_DATA`, `WEATHER_THRESHOLD`
- **Source:** ICAR Annual Report 2022-23 p.11
- **Source document:** `crop_weather_conditions.json` (Record 1)
- **Exact source evidence:** "Section: Climate Resilient Agriculture / Basic and Strategic Research. Evaluated elevated temperature during flowering/grain filling."
- **Computationally evaluable:** **No** (Numeric maximum temperature threshold is null in source JSON).
- **Engine behavior:** Returns `INSUFFICIENT_DATA` (Missing: verified numeric temperature threshold from source).

### Rule ID: `RULE-WEATHER-WHEAT-02`
- **Crop:** Wheat (*Triticum aestivum*)
- **Threat:** Moisture Stress / Drought
- **Weather condition:** "drought / moisture stress"
- **Crop stage:** Vegetative to reproductive stage
- **Geographic scope:** Rainfed and restricted irrigation ecologies
- **Required evidence:** `PHENOLOGY_STAGE`, `WEATHER_DATA`, `WEATHER_THRESHOLD`
- **Source:** ICAR Annual Report 2022-23 p.11
- **Source document:** `crop_weather_conditions.json` (Record 2)
- **Exact source evidence:** "Climate Resilient Agriculture / Crop Management."
- **Computationally evaluable:** **No** (Numeric soil moisture / rainfall deficit threshold is null in source).
- **Engine behavior:** Returns `INSUFFICIENT_DATA` (Missing: verified numeric drought threshold from source).

### Rule ID: `RULE-WEATHER-RICE-01`
- **Crop:** Rice (*Oryza sativa*)
- **Threat:** High Temperature Stress (Floret Sterility)
- **Weather condition:** "elevated temperature / heat stress"
- **Crop stage:** Reproductive / Anthesis stage
- **Geographic scope:** Central and Eastern India
- **Required evidence:** `PHENOLOGY_STAGE`, `WEATHER_DATA`, `WEATHER_THRESHOLD`
- **Source:** ICAR Annual Report 2022-23 p.11
- **Source document:** `crop_weather_conditions.json` (Record 3)
- **Exact source evidence:** "Climate Resilient Agriculture / Basic and Strategic Research."
- **Computationally evaluable:** **No** (Numeric floret sterility temperature threshold is null in source).
- **Engine behavior:** Returns `INSUFFICIENT_DATA` (Missing: verified numeric temperature threshold from source).

### Rule ID: `RULE-WEATHER-RICE-02`
- **Crop:** Rice (*Oryza sativa*)
- **Threat:** Vegetative Drought Stress
- **Weather condition:** "drought / moisture stress"
- **Crop stage:** Vegetative to reproductive stage
- **Geographic scope:** Rainfed uplands
- **Required evidence:** `PHENOLOGY_STAGE`, `WEATHER_DATA`, `WEATHER_THRESHOLD`
- **Source:** ICAR Annual Report 2022-23 p.11
- **Source document:** `crop_weather_conditions.json` (Record 4)
- **Exact source evidence:** "Climate Resilient Agriculture / Basic and Strategic Research."
- **Computationally evaluable:** **No** (Numeric rainfall deficit threshold is null in source).
- **Engine behavior:** Returns `INSUFFICIENT_DATA` (Missing: verified numeric rainfall threshold from source).

### Rule ID: `RULE-WEATHER-COTTON-01`
- **Crop:** Cotton (*Gossypium hirsutum*)
- **Threat:** Waterlogging & Square Shedding
- **Weather condition:** "waterlogging / submergence"
- **Crop stage:** Square Formation & Flowering
- **Geographic scope:** Vertisols (Black cotton soils) of Maharashtra and Gujarat
- **Required evidence:** `PHENOLOGY_STAGE`, `WEATHER_DATA`, `WEATHER_THRESHOLD`
- **Source:** ICAR Annual Report 2023-24
- **Source document:** `crop_weather_conditions.json`
- **Exact source evidence:** "Drainage management trials in heavy black soils."
- **Computationally evaluable:** **No** (Numeric saturation duration is null in source).
- **Engine behavior:** Returns `INSUFFICIENT_DATA` (Missing: verified numeric saturation threshold from source).

### Rule ID: `RULE-WEATHER-SOY-01`
- **Crop:** Soybean (*Glycine max*)
- **Threat:** Seedling Mortality under Submergence
- **Weather condition:** "waterlogging / submergence"
- **Crop stage:** Early vegetative phase
- **Geographic scope:** Malwa plateau (Madhya Pradesh) and Vidarbha (Maharashtra)
- **Required evidence:** `PHENOLOGY_STAGE`, `WEATHER_DATA`, `WEATHER_THRESHOLD`
- **Source:** ICAR Annual Report 2022-23 p.12
- **Source document:** `crop_weather_conditions.json` (Record 5)
- **Exact source evidence:** "Climate Resilient Agriculture / Submergence tolerance evaluation."
- **Computationally evaluable:** **No** (Numeric inundation duration is null in source).
- **Engine behavior:** Returns `INSUFFICIENT_DATA` (Missing: verified numeric inundation threshold from source).

---

## 4. Formal Rule Execution Summary

| Rule Category | Count | Status | Engine Action |
|---|---|---|---|
| Image Scan Pathogen Identification | 20 | Evaluated | Produces `POTENTIAL_CONCERN`, `NO_CONCERN`, `INCONCLUSIVE`, or `INSUFFICIENT_DATA` |
| Qualitative Weather Stressors | 6 | Evaluated | Produces `INSUFFICIENT_DATA` (Preserving missing threshold note) |
| Arbitrary / Invented Rules | 0 | Prohibited | Strictly rejected under Zero Hallucination policy |
