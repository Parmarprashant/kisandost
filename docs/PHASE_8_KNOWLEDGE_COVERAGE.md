# Phase 8 — Agricultural Knowledge Coverage Audit & Gap Report
### Authoritative Reconciled Baseline (Direct MongoDB State)

**System:** KisanDost / AgriShield 360° / Phase 8 Knowledge Governance  
**Date:** 2026-09-25  
**Audit Baseline:** Reconciled Direct MongoDB Atlas State (`agri_ipm_rules` Collection)  
**Registered Sources:** 16 registered sources (15 current/official agricultural-regulatory sources + 1 historical non-regulatory treatise)  
**Scope:** Priority Crops (Wheat, Rice, Maize, Mustard, Chickpea) & Cotton Reference Baseline  

---

## 1. Executive Summary & Authoritative Reconciliation

This document provides the authoritative, reconciled coverage matrix reflecting the **27 agricultural knowledge rules** currently stored, governed, and validated in the production database.

### 1.1. Authoritative Reconciled Rule Count Summary
- **Total Rules in Database:** **27 rules**
- **`VALIDATED` Rules (Farmer-Actionable):** **24 rules**
- **Quarantined Rules (Non-Actionable):** **3 rules**
  - `VALIDATION_REQUIRED`: 1 rule (`IPM-CANDIDATE-UNVERIFIED-01`, Rice Stem Rot — missing verified PHI)
  - `CONFLICTING_SOURCES`: 1 rule (`IPM-CANDIDATE-CONFLICT-01`, Wheat Powdery Mildew — dosage discrepancy)
  - `REJECTED`: 1 rule (`IPM-CANDIDATE-BANNED-01`, Mustard Sawfly — contains statutory banned Endosulfan; `isCurrent: false`)

### 1.2. Priority Crop Rule Distribution
| Crop Name | Total Rules | VALIDATED Rules | Quarantined Rules | Quarantine Reason |
| :--- | :---: | :---: | :---: | :--- |
| **Wheat** (*Triticum aestivum*) | **6** | 5 | 1 | Powdery Mildew held at `CONFLICTING_SOURCES` (dosage conflict) |
| **Rice / Paddy** (*Oryza sativa*) | **7** | 6 | 1 | Stem Rot held at `VALIDATION_REQUIRED` (missing verified PHI) |
| **Maize** (*Zea mays*) | **4** | 4 | 0 | 100% Validated (Banded Blight, Fall Armyworm, Stem Borer, Turcicum Blight) |
| **Mustard** (*Brassica juncea*) | **5** | 4 | 1 | Mustard Sawfly marked `REJECTED` (banned Endosulfan; `isCurrent: false`) |
| **Chickpea** (*Cicer arietinum*) | **4** | 4 | 0 | 100% Validated (Pod Borer, Fusarium Wilt, Ascochyta Blight, Dry Root Rot) |
| **Cotton** *(Reference Baseline)* | **1** | 1 | 0 | 100% Validated (Bacterial Blight reference rule) |
| **TOTAL** | **27** | **24** | **3** | **Zero leakage into advisory resolver** |

---

## 2. Exhaustive Rule-by-Rule Knowledge Coverage Matrix

### 2.1. Wheat (*Triticum aestivum*) — 6 Rules (5 Validated, 1 Conflicting)

| Rule Code | Target Threat | Type | Status | Growth Stages | Economic Threshold Level (ETL) | Non-Chemical Controls (Cultural / Biological) | Chemical Intervention & Safety Parameters | Source Provenance Citation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IPM-WHEAT-YRUST-01` | **Yellow Rust** (*Puccinia striiformis*) | Disease | `VALIDATED` | Tillering, Booting, Heading | 1 active pustule focus in field | Resistant cvs (HD-2967, PBW-550), timely sowing; *T. viride* foliar bio-spray | **Propiconazole 25% EC** @ 500 ml/ha in 500 L water. PHI: 30d, REI: 24h. | DPPQS Wheat Package (2014), p. 29 |
| `IPM-WHEAT-BRUST-01` | **Leaf / Brown Rust** (*Puccinia triticina*) | Disease | `VALIDATED` | Flag Leaf, Heading | 1-2 pustules per leaf | Balanced N/K fertilization; bio-agents | **Tebuconazole 25.9% m/m** @ 500 ml/ha in 500 L water. PHI: 30d, REI: 24h. | DPPQS Wheat Package (2014), p. 31 |
| `IPM-WHEAT-KBUNT-01` | **Karnal Bunt** (*Tilletia indica*) | Disease | `VALIDATED` | Flowering, Grain Fill | Traces of fishy rotting grains in field | 3-yr rotation, deep summer plow; seed bio-priming | **Foliar chemical strictly withheld** (Soil/air borne; strictly seed certification & cultural). | DPPQS Wheat Package (2014), p. 34 |
| `IPM-WHEAT-LSMUT-01` | **Loose Smut** (*Ustilago tritici*) | Disease | `VALIDATED` | Heading, Booting | Presence of any smutted earhead in seed crop | Solar heat seed treatment (May-June), rogue smutted heads in bags; *T. harzianum* | **Carboxin 75% WP** @ 2.5 g/kg seed (seed treatment only). PHI: 90d, REI: 24h. | DPPQS Wheat Package (2014), p. 33 |
| `IPM-WHEAT-APHID-01` | **Wheat Aphid** (*Sitobion avenae*) | Pest | `VALIDATED` | Booting, Heading, Grain Fill | 5 aphids per earhead | Sowing by 3rd week Nov, yellow sticky traps; Syrphid flies, Ladybird beetles | **Dimethoate 30% EC** @ 660 ml/ha. (Statutory allowed on wheat; banned on raw veg). PHI: 14d, REI: 24h. | DPPQS Wheat Package (2014), p. 25 |
| `IPM-CANDIDATE-CONFLICT-01` | **Powdery Mildew** (*Blumeria graminis*) | Disease | `CONFLICTING_SOURCES` | Tillering, Heading | Initial white superficial powdery patches | Avoid high plant density, clip lower leaves; *Ampelomyces quisqualis* | **Sulfur 80% WP** @ 3.0 kg/ha. **QUARANTINED:** Dosage discrepancy between historical (5 kg) and CIB&RC (2.5 kg). Missing verified PHI. | Cross-Source Compendium, p. 45 |

---

### 2.2. Rice / Paddy (*Oryza sativa*) — 7 Rules (6 Validated, 1 Quarantined)

| Rule Code | Target Threat | Type | Status | Growth Stages | Economic Threshold Level (ETL) | Non-Chemical Controls (Cultural / Biological) | Chemical Intervention & Safety Parameters | Source Provenance Citation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IPM-RICE-BLAST-01` | **Rice Blast** (*Magnaporthe oryzae*) | Disease | `VALIDATED` | Tillering, Panicle, Heading | 2-5% leaf area affected | Split N application, silicon amendments; *Pseudomonas fluorescens* bio-agent | **Tricyclazole 75% WP** @ 300-400 g/ha in 500 L water. PHI: 30d, REI: 24h. | NCIPM / DRR Rice Package (2014), p. 28 |
| `IPM-RICE-BLB-01` | **Bacterial Leaf Blight** (*X. oryzae*) | Disease | `VALIDATED` | Tillering, Panicle | 5% leaf area blighted | Drain standing water for 48h, avoid tip clipping during transplanting; plant extracts | **Copper Oxychloride 50% WP + Streptocycline** @ 1000 g + 60 g/ha. PHI: 14d, REI: 12h. | NCIPM / DRR Rice Package (2014), p. 32 |
| `IPM-RICE-BPH-01` | **Brown Planthopper** (*Nilaparvata lugens*) | Pest | `VALIDATED` | Tillering, Panicle | 5-10 hoppers/hill | Alternate wetting & drying (AWD), create 30 cm alleyways every 2m; Mirid bugs, spiders | **Pymetrozine 50% WG** @ 300 g/ha or Triflumuron 480 SC. PHI: 19d, REI: 24h. | NCIPM / DRR Rice Package (2014), p. 19 |
| `IPM-CANDIDATE-UNVERIFIED-01` | **Stem Rot** (*Sclerotium oryzae*) | Disease | `VALIDATION_REQUIRED` | Tillering, Heading | Stem lodging patches | Burn stubble after harvest, drain standing water; *Trichoderma* soil application | **Carbendazim 50% WP**. **QUARANTINED:** Held at `VALIDATION_REQUIRED` due to unverified PHI waiting period. | NCIPM / DRR Rice Package (2014), p. 30 |
| `IPM-RICE-YSB-01` | **Yellow Stem Borer** (*Scirpophaga incertulas*) | Pest | `VALIDATED` | Seedling, Tillering, Panicle | 1 egg mass/m² or 5% dead hearts | Clip seedling tips prior to planting, pheromone traps (8/ha); *Trichogramma japonicum* | **Chlorantraniliprole 0.4% GR** @ 10 kg/ha broadcasting in 2-3 cm standing water. PHI: 21d, REI: 24h. | NCIPM / DRR Rice Package (2014), p. 15 |
| `IPM-RICE-SHBLIGHT-01` | **Sheath Blight** (*Rhizoctonia solani*) | Disease | `VALIDATED` | Tillering, Booting, Heading | Lesions reaching 20% of sheath height | Clean bund sanitation, avoid excessive urea; *Trichoderma harzianum* foliar bio-spray | **Validamycin 3% L** @ 1000 ml/ha or Hexaconazole 5% SC @ 1000 ml/ha. PHI: 30d, REI: 24h. | NCIPM / DRR Rice Package (2014), p. 30 |
| `IPM-HIST-RICE-CULT-01` | **Paddy Weed & Water Stress** | Abiotic / Weed | `VALIDATED` | Tillering, Vegetative | Weed cover > 15% between hills | Periodic field draining to aerate root zone (historical AWD principle), inter-cultivation with hand rake hoes | **Chemical option withheld** (Historical agronomic treatise; non-chemical cultural practice). | N.G. Mukerji 1915 Treatise, Ch. XXIV, p. 164 |

---

### 2.3. Maize (*Zea mays*) — 4 Rules (4 Validated, 0 Quarantined)

| Rule Code | Target Threat | Type | Status | Growth Stages | Economic Threshold Level (ETL) | Non-Chemical Controls (Cultural / Biological) | Chemical Intervention & Safety Parameters | Source Provenance Citation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IPM-MAIZE-BLSB-01` | **Banded Leaf & Sheath Blight** (*R. solani*) | Disease | `VALIDATED` | Knee High, Tasseling, Silking | Lesions reaching 2nd leaf above ground | Strip 2-3 bottom leaves, facilitate field drainage; *Trichoderma harzianum* seed/soil coat | **Validamycin 3% L** @ 1000 ml/ha directed at basal sheaths. PHI: 21d, REI: 24h. | NCIPM / DMR Maize Package (2014), p. 26 |
| `IPM-MAIZE-FAW-01` | **Fall Armyworm** (*Spodoptera frugiperda*) | Pest | `VALIDATED` | Seedling, Knee High, Tasseling | 5% infested whorls (seedling); 10% (mid-whorl) | Synchronized planting, intercrop cowpea, apply sand/dry soil into central whorls; *Bt* kurstaki | **Chlorantraniliprole 18.5% SC** @ 200 ml/ha directed into whorls with nozzle cone removed. PHI: 25d, REI: 24h. | NCIPM / DMR Maize Package (2014), p. 14 |
| `IPM-MAIZE-STEMBORER-01` | **Maize Stem Borer** (*Chilo partellus*) | Pest | `VALIDATED` | 2-5 WAP (Seedling, Vegetative) | 10% dead hearts in field | Rogue dead hearts, destroy crop stubble after harvest; *Trichogramma chilonis* egg release | **Chlorantraniliprole 18.5% SC** @ 200 ml/ha whorl application. (Banned granulars Carbofuran/Phorate excluded). PHI: 20d, REI: 24h. | NCIPM / DMR Maize Package (2014), p. 21 |
| `IPM-MAIZE-TLB-01` | **Turcicum Leaf Blight** (*Exserohilum turcicum*) | Disease | `VALIDATED` | Knee High, Grain Fill | 1-2 distinct spindle spots/leaf before silking | Grow resistant hybrids, rotate non-host crops, deep summer plow; *Trichoderma viride* seed bio-primer | **Mancozeb 75% WP** @ 1.5 kg/ha in 500 L water on initial lower leaf spots. PHI: 21d, REI: 24h. | NCIPM / DMR Maize Package (2014), p. 31 |

---

### 2.4. Mustard / Rapeseed (*Brassica juncea*) — 5 Rules (4 Validated, 1 Quarantined)

| Rule Code | Target Threat | Type | Status | Growth Stages | Economic Threshold Level (ETL) | Non-Chemical Controls (Cultural / Biological) | Chemical Intervention & Safety Parameters | Source Provenance Citation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IPM-MUSTARD-WRUST-01` | **White Rust** (*Albugo candida*) | Disease | `VALIDATED` | Vegetative, Flowering, Podding | Pustules on lower leaves or staghead distortion | Early sowing (10-25 Oct), rogue staghead hypertrophies; *Trichoderma viride* seed coat | **Metalaxyl-M + Mancozeb 72% WP** @ 1.5 kg/ha in 500 L water at 45-50 DAS. PHI: 40d, REI: 24h. | NIPHM / DRMR Mustard Package (2014), p. 24 |
| `IPM-MUSTARD-APHID-01` | **Mustard Aphid** (*Lipaphis erysimi*) | Pest | `VALIDATED` | Flowering, Podding | 20-25 aphids/10cm central shoot | Sowing before Oct 20, yellow sticky traps (15/ha); Ladybird beetles, *Verticillium lecanii* | **Dimethoate 30% EC** @ 660 ml/ha afternoon spray. (Allowed on mustard; safe for honeybees in afternoon). PHI: 20d, REI: 24h. | NIPHM / DRMR Mustard Package (2014), p. 16 |
| `IPM-MUSTARD-ALT-01` | **Alternaria Blight** (*Alternaria brassicae*) | Disease | `VALIDATED` | Vegetative, Flowering, Podding | 2% pod area covered or 5-10% leaf area | Wide row spacing (45x15 cm) for canopy drying, destroy crop residue; *T. harzianum* foliar | **Mancozeb 75% WP** @ 1.5 kg/ha in 500 L water upon first appearance of concentric spots. PHI: 21d, REI: 24h. | NIPHM / DRMR Mustard Package (2014), p. 28 |
| `IPM-MUSTARD-PBUG-01` | **Painted Bug** (*Bagrada hilaris*) | Pest | `VALIDATED` | Seedling, Pod Development | 2 bugs per meter row or 1 bug/seedling | Light irrigation 3-4 WAP reduces nymph survival, clean field borders; Reduviid bugs, spiders | **Dimethoate 30% EC** @ 660 ml/ha afternoon foliar spray. PHI: 20d, REI: 24h. | NIPHM / DRMR Mustard Package (2014), p. 19 |
| `IPM-CANDIDATE-BANNED-01` | **Mustard Sawfly** (*Athalia lugens proxima*) | Pest | `REJECTED` | Seedling | Early morning leaf skeletonization | Summer deep ploughing, hand pick grubs into kerosene water; insectivorous birds | **Endosulfan 35% EC**. **QUARANTINED & REJECTED:** Endosulfan is legally BANNED in India under Insecticides Act 1968. `isCurrent: false`. | Archaic Field Extract (1998), p. 12 |

---

### 2.5. Chickpea (*Cicer arietinum*) — 4 Rules (4 Validated, 0 Quarantined)

| Rule Code | Target Threat | Type | Status | Growth Stages | Economic Threshold Level (ETL) | Non-Chemical Controls (Cultural / Biological) | Chemical Intervention & Safety Parameters | Source Provenance Citation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IPM-CHICKPEA-BORER-01` | **Gram Pod Borer** (*Helicoverpa armigera*) | Pest | `VALIDATED` | Vegetative, Flowering, Podding | 1-2 larvae/m row or 5-6 moths/trap for 3 days | Intercrop coriander/mustard (6:1), install 20 bird perches/ha; HaNPV @ 250 LE/ha, *Bt* | **Chlorantraniliprole 18.5% SC** @ 125 ml/ha in 500 L water. PHI: 29d, REI: 24h. | NIPHM / IIPR Chickpea Package (2014), p. 24 |
| `IPM-CHICKPEA-WILT-01` | **Fusarium Wilt** (*F. oxysporum f. sp. ciceris*) | Disease | `VALIDATED` | Seedling, Vegetative, Flowering | Initial appearance of wilting plant patches | 3-4 year rotation with cereals, resistant cvs (JG-315, Avrodhi), deep sowing (8-10 cm); *T. viride* seed coat | **Foliar chemical strictly withheld** (Soil-borne vascular wilt cannot be cured with standing crop foliar sprays). | NIPHM / IIPR Chickpea Package (2014), p. 29 |
| `IPM-CHICKPEA-ASCO-01` | **Ascochyta Blight** (*Ascochyta rabiei*) | Disease | `VALIDATED` | Vegetative, Flowering, Podding | Appearance of initial blight spots in cool rain | Certified seed, intercrop wheat/barley (4:2), rogue out broken terminal stems; *T. viride* seed primer | **Chlorothalonil 75% WP** @ 1.5 kg/ha in 500 L water following unseasonal winter rains. PHI: 14d, REI: 24h. | NCIPM / IIPR Chickpea Package (2014), p. 32 |
| `IPM-CHICKPEA-DRROT-01` | **Dry Root Rot** (*Rhizoctonia bataticola*) | Disease | `VALIDATED` | Flowering, Podding | Appearance of straw-colored dried plants | Timely sowing, maintain soil moisture at podding with light irrigation, 3-yr rotation; *T. viride* seed coat | **Foliar chemical strictly withheld** (Soil-borne root rot cannot be cured with standing foliar fungicides). | NCIPM / IIPR Chickpea Package (2014), p. 35 |

---

### 2.6. Cotton (*Gossypium hirsutum*) — 1 Rule (Reference Baseline)

| Rule Code | Target Threat | Type | Status | Growth Stages | Economic Threshold Level (ETL) | Non-Chemical Controls (Cultural / Biological) | Chemical Intervention & Safety Parameters | Source Provenance Citation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `IPM-COTTON-BLIGHT-01` | **Bacterial Blight** (*Xanthomonas citri pv. malvacearum*) | Disease | `VALIDATED` | Seedling, Squaring, Boll Formation | Angular water-soaked leaf spots | Clean sanitation, acid delinting of seed, destroy cotton stalks after picking; *Pseudomonas fluorescens* | **Copper Oxychloride 50% WP + Streptomycin** @ 1250 g + 50 g/ha. PHI: 30d, REI: 24h. | CICR / NIPHM Cotton Package (2014), p. 18 |

---

## 3. Historical Literature Audit: *Handbook of Indian Agriculture* (1915 TXT)

- **Source Filename:** `353268719-Handbook-of-Indian-Agriculture-1000064340.txt` (~2.53 MB)
- **Title & Author:** *Handbook of Indian Agriculture (3rd Edition, 1915)* by Nitya Gopal Mukerji, M.A. (Sibpur Agricultural College, Thacker Spink & Co, Calcutta)
- **Source Classification:** `HISTORICAL_TREATISE`, 1915, non-regulatory (`isRegulatoryAuthority: false`)
- **Workspace Search for ICAR Handbook TXT:** A comprehensive workspace-wide recursive search verified that **no separate "ICAR Handbook of Agriculture TXT"** exists. The Mukerji 1915 treatise is the sole agricultural TXT present.
- **Audit Findings:**
  1. Preserved Chapter/Section provenance (Part III: Crops; Part VII: Insect & Fungus Pests).
  2. Traditional agronomic practices (periodic soil drainage, bund maintenance, manual rake weeding, green manuring with *Sesbania*) extracted as valid cultural rules (e.g. `IPM-HIST-RICE-CULT-01`).
  3. Obsolete chemical references (Paris Green, lead arsenate, crude kerosene) were audited and classified as `SUPERSEDED` and `REJECTED` under modern Indian law (Insecticides Act, 1968).

---

## 4. Automated Quality Audit Metrics (Live Database Scan)

Execution of `runKnowledgeQualityAudit()` against the live MongoDB collection confirms:

```json
{
  "totalRulesScanned": 27,
  "totalSourcesRegistered": 16,
  "criticalIssuesCount": 0,
  "warningIssuesCount": 0,
  "isProductionReady": true,
  "breakdownByCrop": {
    "Wheat":    { "total": 6, "validated": 5, "quarantined": 1 },
    "Rice":     { "total": 7, "validated": 6, "quarantined": 1 },
    "Maize":    { "total": 4, "validated": 4, "quarantined": 0 },
    "Mustard":  { "total": 5, "validated": 4, "quarantined": 1 },
    "Chickpea": { "total": 4, "validated": 4, "quarantined": 0 },
    "Cotton":   { "total": 1, "validated": 1, "quarantined": 0 }
  },
  "reconciledTotals": {
    "totalDatabaseRules": 27,
    "validatedProductionRules": 24,
    "quarantinedRules": 3
  }
}
```

---
*Verified and Reconciled against MongoDB Atlas on 2026-09-25.*
