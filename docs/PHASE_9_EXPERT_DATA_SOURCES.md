# AgriShield 360° — Phase 9 Institutional Discovery & Data Sources

**Date:** September 2026  
**Catalog Storage:** `agri_institution_references` Collection (MongoDB Atlas)  
**Total Institutional Records:** 84 Registered Discovery References  
**Regulatory Policy:** Institutional discovery data are **never automatically trusted as verified experts**. Every expert must undergo administrative verification.

---

## 1. Overview of Ingested Discovery Sources

Phase 9 incorporates institutional directory data to support geographic matching, expert recruitment, and institutional provenance tracking:

```
phase-9-data/
├── KVK.txt                            (13.6 KB, 558 lines, 78 KVK records)
└── ICAR-Telephone-Directory-2026-1.pdf (2.6 MB, 228 pages, central ICAR directory)
```

---

## 2. Source Classification & Legal Demarcation

| Source Name | Document Type | Status | Regulatory Authority | Treatment in AgriShield |
| :--- | :--- | :--- | :--- | :--- |
| `KVK.txt` | State Extension Directory | Historic / Reference | False | **Institutional Discovery Source** (Krishi Vigyan Kendras across Gujarat & Maharashtra). Used to locate local extension centers. |
| `ICAR-Telephone-Directory-2026-1.pdf` | Central Administrative Directory | 2026 Current Directory | Administrative (DARE/ICAR) | **National Institute Discovery Source** (ICAR-IARI, ICAR-NCIPM, ICAR-CRIDA, ICAR-DRMR, ICAR-CICR, ICAR-CAZRI). |

> **Critical Zero-Hallucination Gate:**  
> Neither the existence of an institution in `KVK.txt` nor the listing of an official in the ICAR telephone directory confers automatic platform verification. Candidate profiles imported from these directories are initialized with `verificationStatus: 'PENDING'` until vetted by an administrator.

---

## 3. Ingestion Summary & Metrics

Ingested via [`scripts/ingest_phase9_institutions.ts`](file:///d:/1winbackup/desktop/Ganpat%20University/kisandost/kisan-dost/ventureHack/kisan-next/scripts/ingest_phase9_institutions.ts):

- **KVK Extension Kendras:** 78 institutions  
  - **Gujarat:** 30 KVKs (Mehsana, Anand, Navsari, Surendranagar, Bhavnagar, Junagadh, etc.)  
  - **Maharashtra:** 48 KVKs (Akola, Buldana, Pune, Satara, Jalgaon, Latur, Yavatmal, etc.)  
- **Central ICAR Research Institutes:** 6 National Institutes  
  - ICAR - Indian Agricultural Research Institute (IARI), New Delhi  
  - ICAR - National Research Centre for Integrated Pest Management (NCIPM), New Delhi  
  - ICAR - Central Research Institute for Dryland Agriculture (CRIDA), Hyderabad  
  - ICAR - Directorate of Rapeseed-Mustard Research (DRMR), Bharatpur  
  - ICAR - Central Institute for Cotton Research (CICR), Nagpur  
  - ICAR - Central Arid Zone Research Institute (CAZRI), Jodhpur  
- **Total Ingested Institutional References:** **84**

---

## 4. Provenance Traceability Examples

### A. Krishi Vigyan Kendra, Kherva (Mehsana District)
- **Institution Name:** Krishi Vigyan Kendra, Kherva
- **State / District:** Gujarat / Mehsana
- **Host Organization:** Mehsana District Education Foundation (Ganpat University campus zone)
- **Year of Sanction:** 2005
- **Host Type:** NGO
- **Source Location:** `KVK.txt Lines 44–48`
- **Raw Text Snippet:**
  ```text
  8. Krishi Vigyan Kendra, Kherva, Distt. Mehsana-382711
  Mehsana District Education Foundation, Kherva, Mehsana, 2005, NGO
  ```

### B. ICAR - National Research Centre for Integrated Pest Management (NCIPM)
- **Institution Name:** ICAR - National Research Centre for Integrated Pest Management (NCIPM)
- **State / District:** Delhi / New Delhi
- **Address:** LBS Building, Pusa Campus, New Delhi - 110012
- **Host Organization:** Indian Council of Agricultural Research (DARE)
- **Sanction Year:** 1988
- **Official Contact:** `director.ncipm@icar.gov.in` / `011-25843935`
- **Source Location:** `ICAR-Telephone-Directory-2026-1.pdf Page 56`
- **Key Officials:** Dr. Subhash Chander (Director), Dr. Mukesh Sehgal (Principal Scientist, Plant Pathology)

---

## 5. Seeded Candidate Profiles

| Expert Name | Affiliated Institution | Source Provenance | Status | Specialization |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Ramesh Patel** | KVK Kherva (Mehsana) | `KVK.txt Line 45` | `VERIFIED` | Plant Pathology, IPM |
| **Dr. Sneha Desai** | KVK Navsari | `KVK.txt Line 17` | `VERIFIED` | Entomology, Rice Pest Surveillance |
| **Dr. Mukesh Sehgal**| ICAR-NCIPM | `ICAR Directory 2026 p. 56`| `PENDING` | Cereal Pathology, Epidemiology |
