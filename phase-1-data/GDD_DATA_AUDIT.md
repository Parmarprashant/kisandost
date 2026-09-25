# AgriShield 360° — Dedicated GDD & Thermal Units Data Audit

## 1. Audit Methodology & Scope

An exhaustive, verbatim regex and semantic scan of all four official ICAR Annual Reports was conducted across 105,627 lines of source text:
- `ICAR-Annual-Report-2022-23-English.txt` (28,783 lines)
- `ICAR-Annual-Report-2023-24-English.txt` (27,441 lines)
- `ICAR-Annual-Report-2024-25-English.txt` (27,604 lines)
- `ICAR-Annual-Report-2025-26-English.txt` (21,800 lines)

The search targeted all agronomic thermal accumulation metrics:
- `GDD` / `Growing Degree Days` / `Growing Degree Units`
- `thermal units` / `thermal time` / `heat units`
- `base temperature` / `base temp`

## 2. Audit Findings & Exact Occurrences

| Search Term | Matches in 2022-23 | Matches in 2023-24 | Matches in 2024-25 | Matches in 2025-26 | Agronomic GDD Found? |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Growing Degree Days / GDD** | 0 | 0 | 0 | 0 | **NOT_FOUND_IN_ICAR_REPORTS** |
| **Growing Degree Units** | 0 | 0 | 0 | 0 | **NOT_FOUND_IN_ICAR_REPORTS** |
| **Thermal Units** | 0 | 0 | 0 | 0 | **NOT_FOUND_IN_ICAR_REPORTS** |
| **Thermal Time** | 0 | 0 | 0 | 0 | **NOT_FOUND_IN_ICAR_REPORTS** |
| **Heat Units** | 0 | 0 | 0 | 0 | **NOT_FOUND_IN_ICAR_REPORTS** |
| **Base Temperature** | 0 | 0 | 0 | 0 | **NOT_FOUND_IN_ICAR_REPORTS** |

### Context of Non-Agronomic 'Thermal' Matches
The term 'thermal' appeared 59 times across the four reports, but exclusively in non-agronomic engineering or laboratory contexts:
1. **Loop-Mediated Isothermal Amplification (LAMP):** Rapid on-site molecular diagnostics assays for GM proteinase inhibitor (2023-24 p.161), sugarcane top borer detection device (2023-24 p.151), cassava mealybug detection (2024-25 p.52).
2. **Thermal Imaging:** Aerial canopy temperature estimation for drought screening in breeding populations (2024-25 p.276).
3. **Renewable Energy & Solar Engineering:** Tunnel-type PV/thermal hybrid solar dryer for ber and date palm (2025-26 p.22), solar thermal storage units for tobacco curing (2025-26 p.27).

## 3. Dedicated GDD Audit Table for Priority Crops

| Crop | Variety | Base Temperature | GDD to Maturity | Stage GDD | Report | Page | Evidence Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| Wheat | GW 513 | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 35 | Maturity 119 days, black rust resistant (Calendar maturity in days only) |
| Wheat | Karan Aditya (DBW 332) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 35 | Maturity 156 days, yellow/brown rust resistant (Calendar maturity in days only) |
| Wheat | DBW 327 (Karan Shivani) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 36 | Maturity 155 days, heat and drought tolerant (Calendar maturity in days only) |
| Wheat | Pusa Wheat Kranti (HI-1674) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2025-26 | 22 | Maturity 112–126 days, stem/leaf rust resistant (Calendar maturity in days only) |
| Rice | Sahyadri Panchmukhi | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 27 | Maturity 130–135 days, blast tolerant (Calendar maturity in days only) |
| Rice | Pusa Basmati 1847 (IET 27722) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 27 | Maturity 115–120 days, BLB and blast resistant (Calendar maturity in days only) |
| Rice | CR Dhan 320 (IET 27914) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 28 | Maturity 84–88 days, early irrigated (Calendar maturity in days only) |
| Rice | Pusa DST Rice 1 | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2025-26 | 39 | Drought and salt tolerant mutant of MTU1010 (Calendar maturity in days only) |
| Cotton | RS 2818 | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 51 | Maturity 165–175 days, CLCuD and BLB tolerant (Calendar maturity in days only) |
| Cotton | Suvarna Shubhra (AKH 09-5) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 51 | Maturity 150–160 days, jassid and grey mildew tolerant (Calendar maturity in days only) |
| Cotton | Gujarat Desi Cotton 5 | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2025-26 | 34 | Non-Bt arboreum variety, rainfed (Calendar maturity in days only) |
| Groundnut | Gujarat Groundnut 35 (Sorath Gold) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 43 | Maturity 105 days, tikka and rust tolerant (Calendar maturity in days only) |
| Groundnut | GG 40 (ICGV 16668) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2023-24 | 33 | Maturity 113 days, high oleic acid, rust/stem-rot resistant (Calendar maturity in days only) |
| Groundnut | Kalinga Groundnut 101 | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 43 | Maturity 125–131 days, drought tolerant (Calendar maturity in days only) |
| Soybean | Phule Durva (KDS 992) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 43 | Maturity 101 days, purple seed stain resistant (Calendar maturity in days only) |
| Soybean | AISb 50 | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2022-23 | 44 | Maturity 99–104 days, pod blight resistant (Calendar maturity in days only) |
| Soybean | JS 21-72 (Jawahar Soybean 21-72) | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | `NOT_FOUND_IN_ICAR_REPORTS` | ICAR 2023-24 | 33 | Maturity 94–100 days, YMV and charcoal rot resistant (Calendar maturity in days only) |

## 4. Conclusion & Critical Recommendation

ICAR Annual Reports are high-level institutional milestone reports that record varietal releases with **calendar duration in days** (e.g. `maturity 115–120 days`), grain yield (q/ha), pest/disease resistance, and regional recommendation zones. They **do not publish physiological Growing Degree Days (GDD), thermal accumulation thresholds, or base temperatures** for crops.

> [!IMPORTANT]
> In strict accordance with **Rule 1 ('DO NOT INVENT DATA')** and **Rule 2 ('NEVER ESTIMATE MISSING VALUES')**, all `base_temperature_c` and `gdd_to_maturity` fields are preserved as `null`. Phase 2 GDD engine modeling will require incorporating agrometeorological trial bulletins (AICRP on Agrometeorology / ICAR-CRIDA monographs) or validated reference datasets.
