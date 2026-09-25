# AgriShield 360° — Phase 3A: GDD Extraction Report

This report provides the exhaustive agronomic audit and summary metrics for the thermal-time and Growing Degree Days (GDD) research extracted from agricultural research sources across Gujarat, Maharashtra, and benchmark Indian agro-climatic zones.

## Extraction Audit Summary

1. **Number of files analyzed**: `24` (All 24 PDF files in `dataSet/gdd/`)
2. **Number of crops represented**: `15` (Banana, Black Gram, Castor, Chickpea, Cotton, Groundnut, Indian Mustard, Pearl Millet, Pigeonpea, Rabi Sorghum, Rice, Sesame, Sorghum, Soybean, Wheat)
3. **Number of varieties represented**: `78`
4. **Number of GDD records extracted**: `1024`
5. **Number of records with base temperature ($T_b$)**: `732` (71.5%)
6. **Number of records without base temperature ($T_b = null$)**: `292` (28.5%)
7. **Number with stage-specific (periodic) GDD**: `324`
8. **Number with maturity GDD**: `203`
9. **Number with explicit calculation method / formula**: `1024`
10. **Number of conflicting records audited**: `100` (Detailed in `GDD_CONFLICTS.md`)
11. **Number of sources with no usable numerical GDD**: `10` (Detailed in `GDD_MISSING_DATA.md`)

## Crop-by-Crop Coverage Table

| Crop | Sources | Varieties | GDD Records | Base Temp Available | Stage GDD Available | Maturity GDD Available |
|---|---|---|---|---|---|---|
| **Banana** | 1 (Atricle+1+IJH79(3).pdf) | 11 | 66 | 13.0 °C | Yes | Yes |
| **Black Gram** | 1 (6-5-171-443.pdf) | 1 | 18 | 10.0 °C | Yes | Yes |
| **Castor** | 1 (6-5-171-443.pdf) | 1 | 18 | 10.0 °C | Yes | Yes |
| **Chickpea** | 1 (2011.pdf) | 1 | 24 | Not reported (null) | No | Yes |
| **Cotton** | 1 (6-5-171-443.pdf) | 1 | 18 | 15.5 °C | Yes | Yes |
| **Groundnut** | 2 (6-5-171-443.pdf, Bhutiya3182025JSRR139829.pdf) | 5 | 25 | 10.0 °C | Yes | Yes |
| **Indian Mustard** | 1 (40502_2014_Article_72.pdf) | 23 | 69 | 5.0 °C | No | Yes |
| **Pearl Millet** | 5 (18.RESPONSEOFPEARLMILLETVARIETIESTOHEAT.pdf, 6-5-171-443.pdf, 65077-163616-1-SM.pdf, RA_00064.pdf, Thermal_requirement_of_pearl_millet_varieties_in_S.pdf) | 10 | 205 | 10.0 °C, 12.0 °C, 7.0 °C, Not reported (null) | Yes | Yes |
| **Pigeonpea** | 1 (AssessmentofGrowingDegreeDays.pdf) | 4 | 192 | 10.0 °C | No | Yes |
| **Rabi Sorghum** | 1 (2011.pdf) | 3 | 96 | Not reported (null) | Yes | Yes |
| **Rice** | 1 (2015-16.pdf) | 1 | 30 | Not reported (null) | No | Yes |
| **Sesame** | 1 (6-5-171-443.pdf) | 1 | 18 | 10.0 °C | Yes | Yes |
| **Sorghum** | 1 (RA_00064.pdf) | 6 | 60 | 7.0 °C | No | Yes |
| **Soybean** | 2 (A-42352.pdf, D. Usha Sri and M. G. Jadhav.pdf) | 8 | 148 | 10.0 °C | Yes | Yes |
| **Wheat** | 2 (2011.pdf, BOOKLET_2009.pdf) | 2 | 37 | Not reported (null) | No | Yes |


## Geographic Distribution

- **Gujarat Sources**:
  - JAU Targhadia (Rajkot, North Saurashtra Zone-VI): Cotton, Spreading Groundnut, Pearl Millet, Castor, Sesame, Black Gram (108 records)
  - JAU Jamnagar (South Saurashtra Zone): Pearl Millet (6 records)
  - JAU Junagadh (South Saurashtra Zone): Summer Groundnut (7 records)
  - AAU Anand (Middle Gujarat Zone III): Wheat cv. GW-496 (1 record)
- **Maharashtra Sources**:
  - MPKV Rahuri / ZARS Solapur (Scarcity Zone): Pearl Millet cv. WCC-75 (105 records), Pearl Millet cultivars Shanti, MRB-204, Dhanashakti (72 records), Rabi Sorghum (96 records)
  - VNMKV Parbhani (Marathwada Region): Soybean cv. MAUS-71, MAUS-158, MAUS-162 (88 records)
  - MPKV Rahuri / Pune (Western Maharashtra): Pigeonpea cv. Vipula, Rajeshwari, BDN 711, ICPH 2740 (192 records)
- **Benchmark / Central India Sources**:
  - CSAUAT Kanpur (Uttar Pradesh): Indian Mustard 22 genotypes (69 records)
  - IGKV Raipur (Chhattisgarh): Soybean cv. JS 97-52, JS 335, JS 93-05 (60 records)
  - ICAR-NRCB Tiruchirappalli (Tamil Nadu): Banana 11 cultivars (66 records)
  - AICRPAM Jabalpur (Madhya Pradesh): Chickpea (24 records)
  - AICRPAM Udaipur (Rajasthan): Wheat (36 records)
  - AICRPAM Pusa (Bihar): Kharif Rice (30 records)
  - ICRISAT Patancheru (Telangana / Benchmark): Pearl Millet cv. BJ-104 & Sorghum maturity classes (64 records)

## Data Integrity Attestation

1. **Zero Base Temperature Invention**: Base temperature was recorded strictly from text. Where omitted in the original paper (`65077-163616-1-SM.pdf`, `BOOKLET_2009.pdf`, `2011.pdf`, `2015-16.pdf`), it is preserved as `null` with explicit notes.
2. **Zero Cross-Source Averaging**: Conflicting values between South Saurashtra ($T_b = 12^\circ\text{C}$) and Scarcity Zone Solapur ($T_b = 10^\circ\text{C}$) for Pearl Millet are not blended.
3. **Verbatim Fidelity**: All stage names (`BallFormation`, `Full pegging`, `Capsule Formation`, `Soft dough`, `Hard dough`, `CRI`) preserve exact author terminology.
4. **Isolation Boundary Maintained**: ZERO modifications were made to database schemas, APIs, frontend components, `Crop.ts`, `IcarCrop.ts`, or existing KisanDost application code.

## Final Status

**PHASE 3A — GDD SOURCE EXTRACTION: COMPLETE**
