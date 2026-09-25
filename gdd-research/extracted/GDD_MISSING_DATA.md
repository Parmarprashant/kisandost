# AgriShield 360° — Missing GDD Data & Gap Audit

In compliance with Phase 3A integrity standards, this audit catalogs all experimental records with missing base temperatures, crops discussed without numerical tables, and documents analyzed that yielded zero usable numerical GDD data.

## 1. Experimental Records with Omitted Base Temperature ($T_b = null$)

The following experimental papers report detailed numerical GDD degree-day values but do **NOT** print the numerical value of base temperature in the text or tables. In accordance with Rule 3, $T_b$ is preserved as `null` with ZERO invention:

1. **`65077-163616-1-SM.pdf` (Jadhav et al. 1994)**:
   - **Crop**: Pearl Millet (*Pennisetum americanum* cv. WCC-75)
   - **Location**: Solapur, Maharashtra (5 successive years, 1988–1992)
   - **Total Records Affected**: 105 records
   - **Text Excerpt**: *"GDD = (Maximum + Minimum)/2 - Base temperature following formula given by Iwata (1984)"*
   - **Gap**: The numerical threshold (whether 10.0°C, 12.0°C, or other) is omitted in the paper.

2. **`BOOKLET_2009.pdf` (Combined Joint AGRESCO 2009)**:
   - **Crop**: Wheat (*Triticum aestivum* cv. GW-496)
   - **Location**: Anand, Gujarat (Middle Gujarat Zone III)
   - **Total Records Affected**: 1 record
   - **Text Excerpt**: *"Growing degree days (GDD) requirement for wheat crop were found 1815 ± 57."*
   - **Gap**: Recommendation summary does not cite the exact base temperature used (standard DSSAT CERES-Wheat default is 5.0°C, but not printed in recommendation text; preserved as `null`).

3. **`2011.pdf` (AICRPAM Annual Report 2011-12)**:
   - **Crops**: Rabi Sorghum (Solapur, 96 records), Wheat (Udaipur, 36 records), Chickpea (Jabalpur, 24 records)
   - **Total Records Affected**: 156 records
   - **Gap**: Table 5.6, Table 5.9, and Table 5.10 list GDD values across phenological stages but do not specify $T_b$ in the table column headers or table footnotes.

4. **`2015-16.pdf` (AICRPAM Annual Report 2015-16)**:
   - **Crop**: Kharif Rice (Pusa, Samastipur, 30 records)
   - **Total Records Affected**: 30 records
   - **Gap**: Table 4.6 lists accumulated heat units (day °C) across 6 stages but omits the explicit base temperature in the table.

## 2. Crops Discussed with Phenological Stages but Lacking Numerical GDD

1. **Mango (*Mangifera indica* cv. Kesar)**:
   - **Source**: `14th_agresco_proceeding_20251226_769.pdf` (Junagadh Agricultural University, Section 14.4.2.1) & `IX Agresco proceedings.pdf` (Section 9.4.2.1)
   - **Discussion**: *"Estimation of effect of growing degree days (GDD) on phenology, flowering and yield on different mango varieties under Saurashtra Agro-climatic condition... The GDD requirements of different varieties were found unique and a mango variety Kesar requires low GDD for maturity with higher Heat Use Efficiency. Approved."*
   - **Status**: Research confirmed and approved by AGRESCO, but numerical degree-day values are omitted in the proceedings summary booklet. Requires primary department research report.

2. **Groundnut at Anand & Mustard at Mohanpur/Jorhat**:
   - **Source**: `AR03-04.pdf` (CRIDA AICRPAM Annual Report 2003-04)
   - **Discussion**: Reports percentage variance explained by heat units (89–99%) for groundnut cultivars at Anand, and correlation with aphid appearance in mustard, but contains no baseline GDD degree-day table.

## 3. Documents Yielding Zero Usable Numerical GDD Tables

| File Name | Type | Reason for Zero Usable GDD Data |
|---|---|---|
| `14th_agresco_proceeding_20251226_769.pdf` | Combined Joint AGRESCO Proceedings 2017-18 (Junagadh Agricultural University) | Discusses GDD influence on mango cv. Kesar ('variety Kesar requires low GDD for maturity with higher Heat Use Efficiency'), but provides no numerical table. |
| `IX Agresco proceedings.pdf` | 9th Combined Joint AGRESCO Proceedings (Junagadh Agricultural University) | Mentions accepted agenda topic 'The effect of growing degree days (GDD) on phenology, flowering and yield of different mango varieties', but contains no numerical data. |
| `AR03-04.pdf` | AICRP on Agrometeorology Annual Report 2003-04 (ICAR - CRIDA) | Mentions heat units accounting for biomass in groundnut at Anand and GDD correlation with aphids in mustard at Mohanpur, but no primary GDD tables. |
| `Frontiers in Genetics_14_01-24_2023.pdf` | Genomics and breeding review (Frontiers in Genetics) | Conceptual review mentioning thermal indices in breeding, zero experimental GDD figures. |
| `Genomic Designing Pearl Millet_chapter6.pdf` | Genomic Designing of Climate-Smart Cereal Crops (Springer) | Breeding and molecular genetics chapter, zero agro-meteorological GDD figures. |
| `RA_00065.pdf` | ICRISAT Research Report (ICRISAT) | Mentions frost-free period and GDD conceptually in Mexico valley sorghum diagram, no numerical tables. |
| `mss-abst-jr.pdf` | Symposium Abstract (Academic conference) | Short 1-page conference abstract without GDD tables. |
| `18.RESPONSEOFPEARLMILLETVARIETIESTOHEAT (1).pdf` | Exact duplicate of 18.RESPONSEOFPEARLMILLETVARIETIESTOHEAT.pdf (MPKV Rahuri / ZARS Solapur) | Identical duplicate file in source directory. |
| `S4.pdf` | Exact duplicate of Thermal_requirement_of_pearl_millet_varieties_in_S.pdf (JAU Jamnagar) | Identical duplicate file in source directory. |
| `ThermalRequirementofKharifcrop.pdf` | Exact duplicate of 6-5-171-443.pdf (JAU Targhadia) | Identical duplicate file in source directory. |

## 4. Growth Stages Reported Solely as Cumulative / Maturity Totals

- **Summer Groundnut (Bhutiya et al. 2025)**: Only final physiological maturity GDD is tabulated (Table 2); individual intermediate stage durations (emergence, pegging, pod development) are not split into numerical GDD intervals in the main tables.
- **Wheat at Anand (BOOKLET_2009.pdf)**: Only total maturity GDD ($1815 \pm 57\ ^\circ\text{C}\text{ day}$) is provided in the recommendation text.
- **Indian Mustard (Singh et al. 2014)**: Reports anthesis, 50% flowering, and physiological maturity GDD, but omits early vegetative / rosette stage thermal time.
