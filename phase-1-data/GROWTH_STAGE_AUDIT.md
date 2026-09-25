# AgriShield 360° — Growth Stage & Phenological Milestones Audit

## 1. Executive Summary

As part of **Phase 1B (Data Validation)**, all 19 records in `phase-1-data/growth_stages.json` were audited to establish their structural classification, source authenticity, and mathematical GDD boundaries.

```text
Total Growth Stage Records in growth_stages.json : 19
Classification                                   : Crop-Specific Phenological Milestones
Wheat Stages                                    : 5 stages
Rice Stages                                     : 5 stages
Cotton Stages                                   : 3 stages
Groundnut Stages                                : 3 stages
Soybean Stages                                  : 3 stages
GDD Boundaries Found (gdd_start, gdd_end)       : 0 (Preserved as null)
```

In accordance with **Project Rule 1 ('DO NOT INVENT DATA')** and **Project Rule 2 ('NEVER ESTIMATE MISSING VALUES')**, general agronomic textbook BBCH tables (00–99 scales) and synthetic GDD limits have **NOT been invented**. The 19 records represent exact phenological stages and critical vulnerability windows documented in the four ICAR Annual Reports.

---

## 2. Structural Classification: Milestones vs General Definitions

The 19 records represent **source-grounded crop-specific phenological milestones** rather than generic textbook descriptions. Each milestone corresponds to an empirically measured physiological phase in ICAR trials:

1. **Diagnostic Milestones:** Growth stages where pathogens or pests actively infect tissues, or where ICAR developed diagnostic assays (e.g., qPCR detection of Karnal bunt at heading/flowering; AI pheromone traps at boll development).
2. **Stress Vulnerability Windows:** Stages where abiotic weather extremes (drought, terminal heat stress, waterlogging, high night temperature) trigger severe yield penalties.
3. **Agronomic Intervention Gates:** Stages requiring specific management inputs (e.g., zero-tillage irrigation at Crown-Root Initiation; seed coating for stand emergence).

---

## 3. Crop-by-Crop Growth Stage Inventory

### 3.1 Wheat (*Triticum aestivum / durum*) — 5 Stages
| Stage Order | Stage Name | Duration / Days | Source Section & Citation | Agronomic Context & Risk Significance |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Seedling stage** | `null` | 2023–24 p.143 (Crop Protection) | Evaluated for coleoptile length, seedling shoot length, and stripe rust (*Puccinia striiformis*) seedling resistance pathotypes at Flowerdale. |
| **2** | **Crown-root initiation (CRI)** | 16 DAS | 2024–25 p.66 (Crop Management) | Critical initial irrigation gate documented at 16 Days After Sowing (DAS) under zero-tillage conservation agriculture. |
| **3** | **Vegetative stage** | `null` | 2025–26 p.121 (Basic Research) | Canopy expansion and foliar disease surveillance window; benchmarked across nearly 17,000 leaf images for health monitoring. |
| **4** | **Heading & Flowering stage** | `null` | 2024–25 p.289 (Diagnostics) | Critical phase for inflorescence emergence; vulnerable to Karnal bunt (*Tilletia indica*) and loose/flag smut; monitored via qPCR assays. |
| **5** | **Grain filling & Maturity stage** | 105–171 days | 2022–23 p.35 (Crop Improvement) | Terminal grain filling window sensitive to elevated temperature (>32°C) and forced maturity; mitigated by early sowing in NWPZ. |

### 3.2 Rice (*Oryza sativa*) — 5 Stages
| Stage Order | Stage Name | Duration / Days | Source Section & Citation | Agronomic Context & Risk Significance |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Germination stage** | `null` | 2024–25 p.124 (Mechanization) | Stand establishment phase; direct-seeded rice (DSR) seed pelleting technology engineered for uniform germination. |
| **2** | **Seedling stage** | 15 days | 2023–24 p.164 (Basic Research) | Nursery/early root phase; rhizosphere exudates, sugars, and organic acids profiled at 15 days under field conditions. |
| **3** | **Tillering stage** | `null` | 2025–26 p.120 (Basic Research) | Vegetative tiller multiplication; evaluated in dwarf high-tillering mutants (Samundchini Mutant-S49) for biomass potential. |
| **4** | **Flowering & Anthesis stage** | `null` | 2024–25 p.166 (Basic Research) | Inflorescence anthesis; highly vulnerable to High Night Temperature (HNT) inducing pollen sterility and floret abortion. |
| **5** | **Physiological Maturity stage** | 84–160 days | 2022–23 p.28 (Crop Improvement) | Harvest maturity ranging from 84 days (extra-early CR Dhan 320) to 160 days (late lowland Kalinga Dhan 1202). |

### 3.3 Cotton (*Gossypium spp.*) — 3 Stages
| Stage Order | Stage Name | Duration / Days | Source Section & Citation | Agronomic Context & Risk Significance |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Vegetative & Squaring stage** | `null` | 2022–23 p.51 (Crop Improvement) | Early vegetative growth and square formation; primary risk window for sucking pests (jassids, whitefly, thrips, aphids). |
| **2** | **Critical Flowering stage** | `null` | 2025–26 p.207 (Crop Management) | High water-demand window; drought or waterlogging causes blossom and square drop. |
| **3** | **Boll development & Opening stage** | 135–185 days | 2025–26 p.50 (Crop Protection) | Boll enlargement and fiber maturation; primary vulnerability window for pink bollworm (*Pectinophora gossypiella*); monitored via AI smart traps. |

### 3.4 Groundnut (*Arachis hypogaea*) — 3 Stages
| Stage Order | Stage Name | Duration / Days | Source Section & Citation | Agronomic Context & Risk Significance |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Germination & Emergence stage** | `null` | 2024–25 p.53 (Biotechnology) | Stand establishment; regulated by *AhDoG1L* seed dormancy genes; protected by multi-input seed polymer coatings. |
| **2** | **Flowering & Pegging stage** | `null` | 2022–23 p.180 (Basic Research) | Subterranean peg penetration into soil; critical vulnerability window to moisture deficit and high soil surface temperatures in MAGIC trials. |
| **3** | **Pod development & Maturity stage** | 90–131 days | 2022–23 p.43 (Crop Improvement) | Underground pod filling and shell hardening; maturity reached in 90–95 days (early VRI 10) to 131 days (Kalinga Groundnut 101). |

### 3.5 Soybean (*Glycine max*) — 3 Stages
| Stage Order | Stage Name | Duration / Days | Source Section & Citation | Agronomic Context & Risk Significance |
| :---: | :--- | :---: | :--- | :--- |
| **1** | **Germination & Emergence stage** | `null` | 2024–25 p.105 (Genetic Resources) | Ambient storage seed vigor (viability >80% at 1–3 years); sensitive to soil crusting and early waterlogging. |
| **2** | **Flowering stage** | `null` | 2024–25 p.103 (Genetic Resources) | Floral bud initiation and blooming; sensitive to moisture stress and high canopy temperatures. |
| **3** | **Pod development & Maturity stage** | 90–126 days | 2022–23 p.44 (Crop Improvement) | Pod blighting (*Colletotrichum*) and charcoal rot vulnerability window; pod shattering tolerance evaluated up to 8–10 days post-maturity. |

---

## 4. GDD and Thermal Accumulation Audit

```text
gdd_start : null (NOT_FOUND_IN_SOURCE)
gdd_end   : null (NOT_FOUND_IN_SOURCE)
```

- **Absence Confirmation:** The four ICAR Annual Reports contain zero empirical GDD values, thermal constants, or degree-day thresholds for any growth stage.
- **Engine Design Impact:** In AgriShield Phase 1, the Crop Cycle Engine will use **Days After Sowing (DAS)** and **Percentage of Total Varietal Maturity Days** as the primary phenological progression model.
- **Phase 2 Expansion:** When validated agrometeorological trial monographs (ICAR-CRIDA / AICRP on Agrometeorology) are integrated in Phase 2, `gdd_start` and `gdd_end` boundaries will be populated without altering the structural stage schema.

---

## 5. Summary & Recommendation

1. The **19 growth stage records** are verified, valid, and source-grounded.
2. They map directly to critical risk detection windows in the AgriShield Risk Engine.
3. No artificial stage boundaries were introduced.
4. The growth stage dataset is **READY FOR MONGODB SEEDING**.
