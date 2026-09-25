# Phase 8 — Agricultural Source Document & Regulatory Catalog
### Registered Source Register & Provenance Baseline

**System:** KisanDost / AgriShield 360° / Phase 8 Knowledge Governance  
**Date:** 2026-09-25  
**Audit Scope:** `kisandost/Temp-data/` Directory  
**Status:** Canonical & Source-Verified Baseline  
**Registered Sources:** 16 registered sources (15 current/official agricultural-regulatory sources + 1 historical non-regulatory treatise)  

---

## 1. Executive Summary & Inventory Overview

This catalog provides an exhaustive, verifiable audit of all agricultural literature, standard operating packages (AESA/IPM), official regulatory registries (CIB&RC / DPPQS), and historical reference texts present in the `kisandost/Temp-data/` workspace directory.

In accordance with **Phase 8 Specification (Section 2 & Section 22)**:
- All duplicate files ending in `1.pdf` are explicitly audited, categorized as duplicates, and excluded from ingestion.
- Zero files are deleted from the disk.
- All non-"1" primary sources and regulatory datasets are cataloged with verified internal document metadata, page counts, and jurisdictional scopes.

```
kisandost/Temp-data/ Physical Inventory (21 Files)
├── Primary Agricultural Packages: 6 files (5 Crop IPM + 1 Basic Agriculture)
├── Duplicate Crop Packages: 5 files (*1.pdf - AUDITED & EXCLUDED)
├── Historical Knowledge Text: 1 file (.txt, 2.53 MB - N.G. Mukerji 1915)
└── Central Regulatory Registries: 9 files (CIB&RC / DPPQS / DAC&FW)

Total Registered Sources in DB: 16 sources
├── 15 current/official agricultural-regulatory sources (6 packages + 9 CIB&RC registries)
└── 1 historical non-regulatory treatise (Handbook of Indian Agriculture, 1915)
```

---

## 2. Duplicate Document Audit & Exclusion Register

The following 5 files are confirmed binary/content duplicates of their respective primary files and are strictly **EXCLUDED** from the ingestion pipeline:

| Duplicate Filename | Primary File | File Size (Bytes) | Pages | Hash/Content Status | Ingestion Decision |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `Chickpea1.pdf` | `Chickpea.pdf` | 1,883,531 | 56 | Exact Duplicate | **EXCLUDE / IGNORE** |
| `Maize1.pdf` | `Maize.pdf` | 1,716,026 | 56 | Exact Duplicate | **EXCLUDE / IGNORE** |
| `Mustard1.pdf` | `Mustard.pdf` | 2,000,368 | 59 | Exact Duplicate | **EXCLUDE / IGNORE** |
| `Rice1.pdf` | `Rice.pdf` | 1,591,897 | 53 | Exact Duplicate | **EXCLUDE / IGNORE** |
| `Wheat1.pdf` | `Wheat.pdf` | 7,024,394 | 83 | Exact Duplicate | **EXCLUDE / IGNORE** |

> [!IMPORTANT]
> **Safety Rule**: Duplicate files remain untouched on the filesystem to preserve audit integrity, but the Phase 8 ingestion script explicitly skips any file matching `*1.pdf`.

---

## 3. Primary Agricultural Extension & IPM Packages (6 Official Packages)

These 6 primary packages represent verified field guidelines issued by the Ministry of Agriculture & Farmers Welfare (Government of India), National Institute of Plant Health Management (NIPHM), National Centre for Integrated Pest Management (NCIPM), and international development partners.

### 3.1. Wheat IPM Package
- **Filename:** `Wheat.pdf`
- **File Size:** 7,024,394 bytes
- **Total Pages:** 83 pages
- **Title:** *AESA Based IPM Package - Wheat*
- **Issuing Organizations:** 
  - Directorate of Plant Protection, Quarantine & Storage (DPPQ&S), Faridabad, Haryana
  - National Institute of Plant Health Management (NIPHM), Hyderabad, Telangana
  - Department of Agriculture and Cooperation, Ministry of Agriculture, Government of India
- **Document Type:** Agro-Eco System Analysis (AESA) & Integrated Pest Management Package
- **Crop Coverage:** Wheat (*Triticum aestivum*, *T. durum*)
- **Target Pathogens & Pests:** Yellow/Stripe Rust (*Puccinia striiformis*), Brown/Leaf Rust (*P. triticina*), Black/Stem Rust (*P. graminis*), Karnal Bunt (*Tilletia indica*), Loose Smut (*Ustilago tritici*), Powdery Mildew (*Blumeria graminis*), Aphids, Termites, Armyworm, Pink Stem Borer.
- **Key Agronomic Features:** Economic Threshold Levels (ETL), Pests vs. Defenders agro-ecosystem balance, biological control (Trichoderma, Pseudomonas), mandatory seed treatment protocols, registered chemical fungicides with dosage, dilution, and pre-harvest intervals (PHI).

### 3.2. Rice IPM Package
- **Filename:** `Rice.pdf`
- **File Size:** 1,591,897 bytes
- **Total Pages:** 53 pages
- **Title:** *Integrated Pest Management Package for Rice*
- **Publication Year:** 2014
- **Issuing Organizations:** 
  - National Centre for Integrated Pest Management (NCIPM), LBS Building, IARI, New Delhi
  - Directorate of Plant Protection, Quarantine & Storage (DPPQ&S), Faridabad
  - Directorate of Rice Research (DRR), Hyderabad
- **Document Type:** National Crop Specific IPM Standard Package
- **Crop Coverage:** Rice / Paddy (*Oryza sativa*)
- **Target Pathogens & Pests:** Blast (*Magnaporthe oryzae*), Bacterial Leaf Blight (*Xanthomonas oryzae*), Sheath Blight (*Rhizoctonia solani*), False Smut (*Ustilaginoidea virens*), Brown Plant Hopper (BPH), Yellow Stem Borer, Gall Midge, Leaf Folder, Rice Hispa.
- **Key Agronomic Features:** Stage-wise pest monitoring, Light trap and Pheromone trap protocols, ETL limits (e.g. 1 egg mass/m² or 5-10% dead hearts for stem borer), neem formulations, botanical extracts, chemical bactericides & fungicides with PHI.

### 3.3. Maize IPM Package
- **Filename:** `Maize.pdf`
- **File Size:** 1,716,026 bytes
- **Total Pages:** 56 pages
- **Title:** *Integrated Pest Management Package for Maize*
- **Issuing Organizations:** 
  - National Centre for Integrated Pest Management (NCIPM), New Delhi
  - Directorate of Plant Protection, Quarantine & Storage (DPPQ&S), Faridabad
  - Directorate of Maize Research (DMR), Pusa Campus, New Delhi
- **Document Type:** National Crop Specific IPM Standard Package
- **Crop Coverage:** Maize / Corn (*Zea mays*)
- **Target Pathogens & Pests:** Maize Stem Borer (*Chilo partellus*), Fall Armyworm (*Spodoptera frugiperda*), Shoot Fly (*Atherigona soccata*), Turcicum Leaf Blight (*Exserohilum turcicum*), Maydis Leaf Blight (*Bipolaris maydis*), Banded Leaf and Sheath Blight (*Rhizoctonia solani f. sp. sasakii*), Downy Mildew.
- **Key Agronomic Features:** Dead heart assessment, intercropping with cowpea/pulses, parasitoid releases (*Trichogramma chilonis*), whorl application techniques, strict chemical spray guidelines.

### 3.4. Mustard / Rapeseed IPM Package
- **Filename:** `Mustard.pdf`
- **File Size:** 2,000,368 bytes
- **Total Pages:** 59 pages
- **Title:** *AESA Based IPM Package - Mustard / Rapeseed*
- **Issuing Organizations:** 
  - National Institute of Plant Health Management (NIPHM), Hyderabad
  - Directorate of Plant Protection, Quarantine & Storage (DPPQ&S), Faridabad
  - Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur, Rajasthan
- **Document Type:** Agro-Eco System Analysis (AESA) IPM Package
- **Crop Coverage:** Mustard, Rapeseed, Toria, Sarson, Rai (*Brassica juncea*, *B. campestris*)
- **Target Pathogens & Pests:** Mustard Aphid (*Lipaphis erysimi*), Painted Bug (*Bagrada hilaris*), Sawfly (*Athalia lugens proxima*), White Rust (*Albugo candida*), Alternaria Blight (*Alternaria brassicae*), Sclerotinia Stem Rot, Powdery Mildew.
- **Key Agronomic Features:** Thermal limit interactions, aphid colony score on central shoot, natural predators (ladybird beetles, syrphid flies, *Diaeretiella rapae*), border cropping with yellow sarson, foliar chemical mitigations with safety intervals.

### 3.5. Chickpea IPM Package
- **Filename:** `Chickpea.pdf`
- **File Size:** 1,883,531 bytes
- **Total Pages:** 56 pages
- **Title:** *Integrated Pest Management for Chickpea*
- **Issuing Organizations:** 
  - National Centre for Integrated Pest Management (NCIPM), New Delhi
  - Directorate of Plant Protection, Quarantine & Storage (DPPQ&S), Faridabad
  - Indian Institute of Pulses Research (IIPR), Kanpur, Uttar Pradesh
- **Document Type:** National Pulse Protection IPM Package
- **Crop Coverage:** Chickpea / Bengal Gram / Chana (*Cicer arietinum*)
- **Target Pathogens & Pests:** Gram Pod Borer (*Helicoverpa armigera*), Cutworms (*Agrotis ipsilon*), Fusarium Wilt (*Fusarium oxysporum f. sp. ciceris*), Ascochyta Blight (*Ascochyta rabiei*), Dry Root Rot (*Rhizoctonia bataticola*), Collar Rot (*Sclerotium rolfsii*).
- **Key Agronomic Features:** Strict rejection of foliar chemical fungicides for vascular wilt (soil-borne/vascular pathology requiring crop rotation, Trichoderma seed treatment, and resistant cultivars), pheromone monitoring for *Helicoverpa* (ETL: 1 larva/meter row or 3-4 moths/trap/day), bird perches (50/ha), HaNPV bio-control, and safe chemical pod-filling protections.

### 3.6. Farmer's Handbook on Basic Agriculture
- **Filename:** `farmerbook.pdf`
- **File Size:** 4,509,327 bytes
- **Total Pages:** 154 pages
- **Title:** *Farmer's Handbook on Basic Agriculture*
- **Issuing Organizations:** 
  - Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH, Germany
  - National Institute of Agricultural Extension Management (MANAGE), Hyderabad, Ministry of Agriculture & Farmers Welfare, Government of India
- **Document Type:** Foundational Agricultural & Extension Training Manual
- **Key Agronomic Features:** General agronomic principles, soil fertility management, organic manures, weed control mechanics, seed treatment fundamentals, post-harvest grain handling, agricultural engineering principles.

---

## 4. Historical Agricultural Literature (TXT Source)

### 4.1. Workspace Audit Status
> **Statement on ICAR Handbook TXT:**  
> A comprehensive recursive search of the entire workspace confirmed that an **ICAR Handbook of Agriculture TXT is not found in the accessible workspace**. The sole agricultural TXT file present is N.G. Mukerji's 1915 historical treatise. No synthetic documents were invented.

### 4.2. Handbook of Indian Agriculture (1915 TXT)
- **Filename:** `353268719-Handbook-of-Indian-Agriculture-1000064340.txt`
- **File Size:** 2,536,052 bytes (~2.53 MB)
- **Title:** *Handbook of Indian Agriculture*
- **Author:** Nitya Gopal Mukerji, M.A. (Fellow of the Highland and Agricultural Society, Scotland; Professor of Agriculture and Agricultural Chemistry, Civil Engineering College, Sibpur, Bengal)
- **Publisher / Publication Year:** Thacker, Spink & Co, Calcutta (3rd Revised Edition, 1915)
- **Document Type:** Historical Reference Treatise on Indian Agronomy
- **Source Classification:** `HISTORICAL_TREATISE`, 1915, non-regulatory (`isRegulatoryAuthority: false`)
- **Structure:** 8 Parts, 141 Chapters:
  - *Part I: Soils* (Ch. I–IX: Geological strata, physical & chemical classification, soil fertility, rainfall)
  - *Part II: Implements* (Ch. X–XVII: Theories of tillage, motive power, ploughs, irrigation systems, water-lifts)
  - *Part III: Crops* (Ch. XVIII–LXXXIII: Botanical & economic classifications, rotation, Rice (Ch. XXIV), Wheat (Ch. XXVI), Maize (Ch. XXIX), Pulses/Gram (Ch. XXXIII), Mustard/Rape (Ch. XXXV), Oilseeds, Fibres, Spices)
  - *Part IV: Manures* (Ch. LXXXIV–XC: Nitrogenous, phosphatic, potash, calcareous manures, gypsum)
  - *Part V: Methods of Analysis* (Ch. XCI–XCIX: Soil, bone-meal, superphosphate, oil-cake analysis)
  - *Part VI: Cattle & Livestock* (Ch. C–CXVI: Cattle breeds, nutrition, silage, dairy)
  - *Part VII: Insect and Fungus Pests* (Ch. CXVII–CXXXVII: General remedies against pests and parasites, agricultural zoology, insects, paddy pests, cutworms, white ants, plant lice, zymotic diseases, higher fungi, rusts, smuts)
  - *Part VIII: Famines* (Ch. CXXXVIII–CXLI: Drought resilience, land revenue, protection and relief)
- **Governance & Legal Status:** 
  - **NON-REGULATORY SOURCE**: This historical volume is used **strictly for traditional cultural practices, botanical descriptions, and historical agronomic context**.
  - **PROHIBITION**: It must **NEVER** be used as a legal or regulatory source for chemical pesticide or fungicide recommendations. Any historical chemical references (e.g., Paris Green, lead arsenate, copper sulphate drenches) are archaic and superseded by modern CIB&RC statutes.

---

## 5. Regulatory CIB&RC / DPPQS Registries (9 Statutory Authorities)

These 9 regulatory documents establish the legal boundaries for all agrochemical and bio-pesticide recommendations in India under the Insecticides Act, 1968.

| Document Filename | Authority | Cutoff / Date | Pages | Category / Regulatory Function |
| :--- | :--- | :--- | :---: | :--- |
| `updated_mup_insecticide_as_on_31.03.2026_c.pdf` | CIB&RC / DPPQS | 31.03.2026 | 109 | **Insecticides MUP**: Approved crop-pest label claims, active ingredients, formulations, dosages, dilution, and waiting periods (PHI). |
| `2._chemical_mup_fungicide_as_on_31.03.2026_0.pdf` | CIB&RC / DPPQS | 31.03.2026 | 83 | **Fungicides MUP**: Approved label claims for chemical fungicides (single and combination formulations), dosage, target diseases, and PHI. |
| `3._bio_pesticide_mup_biofungicide_as_on_31.03.2026.pdf` | CIB&RC / DPPQS | 31.03.2026 | 20 | **Bio-Fungicides MUP**: Approved biological agents (*Trichoderma viride*, *T. harzianum*, *Pseudomonas fluorescens*, *Bacillus subtilis*), target crops, diseases, and seed/soil rates. |
| `4._herbicides_mup_as_on_31.03.2026.pdf` | CIB&RC / DPPQS | 31.03.2026 | 76 | **Herbicides MUP**: Approved weedicides, pre-emergence/post-emergence timing, target weeds in major field crops, dosages, and PHI. |
| `5._pgr_mup_as_on_31.03.2026.pdf` | CIB&RC / DPPQS | 31.03.2026 | 13 | **Plant Growth Regulators (PGR) MUP**: Registered plant growth promoters and regulators, approved crops, stages, and safety limits. |
| `6._mup_bio_insecticide_31.03.2026.pdf` | CIB&RC / DPPQS | 31.03.2026 | 19 | **Bio-Insecticides MUP**: Registered biological insecticides (*Beauveria bassiana*, *Metarhizium anisopliae*, *Verticillium lecanii*, NPVs, Bt formulations). |
| `list_of_pesticides_which_are_banned_refused_registration_and_restricted_in_use.pdf` | CIB&RC / DPPQS | 31.07.2026 | 6 | **Statutory Exclusion List**: 49 Banned Pesticides, 2 Banned for Manufacture (export only), 18 Refused Registration, and 14 Restricted Use Pesticides. |
| `list_pf_pesticide_formulations_registered_as_on_31.03.2026.pdf` | CIB&RC / DPPQS | 31.03.2026 | 28 | **Registered Formulations Registry**: Comprehensive list of legally registered commercial formulation codes (EC, WP, SC, WDG, SL, SG, FS) in India. |
| `476th RC MOM.pdf` | Registration Committee | 10.09.2026 | 191 | **CIB&RC Committee Minutes**: Latest statutory decisions, new molecule registrations, label claim expansions, and endorsements under Chairman Dr. P.K. Singh. |

---

## 6. Regulatory Safety Cross-Reference Rules

To ensure strict zero-hallucination and zero-violation of Indian agricultural law:

1. **Banned Substance Check**: If any active ingredient appears in `list_of_pesticides_which_are_banned_refused_registration_and_restricted_in_use.pdf` (e.g. Alachlor, Benomyl, Carbaryl, Diazinon, Dichlorvos, Endosulfan, Phorate, Phosphamidon, Triazophos, Trichlorfon), it is **strictly blacklisted** and marked `REJECTED`.
2. **Crop-Pest Label Claim Matching**: A chemical formulation is only actionable if explicitly approved for the *exact crop* and *target pathogen* in the respective MUP document (`updated_mup_insecticide_...` or `2._chemical_mup_fungicide_...`). Approval on Crop A does NOT imply approval on Crop B.
3. **Mandatory PHI & Dosage Requirement**: Even if a chemical is registered, if the applicable MUP record lacks dosage, formulation concentration, dilution water, or waiting period (PHI), the chemical action is withheld with `offered: false` and `unavailabilityReason: "Chemical recommendation unavailable because the source information is incomplete or not validated."`

---
*Catalog finalized and sealed for Phase 8 Knowledge Governance.*
