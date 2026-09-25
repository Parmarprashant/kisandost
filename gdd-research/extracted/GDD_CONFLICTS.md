# AgriShield 360° — GDD Conflict Audit

In accordance with Phase 3A Data Integrity Rules, when two sources report different GDD values or conflicting base temperatures for the same crop, cultivar, or stage, **no cross-source averaging or resolution is performed**.

All conflicts are documented here with verbatim evidence, source parameters, experimental conditions, and documented reasons.

## Conflict 1: Pearl Millet Base Temperature Discrepancy ($T_b = 7.0^\circ\text{C}$ vs $10.0^\circ\text{C}$ vs $12.0^\circ\text{C}$)

| Parameter | Source A (South Saurashtra, Gujarat) | Source B (Scarcity Zone, Maharashtra) | Source C (North Saurashtra, Gujarat) | Source D (ICRISAT Patancheru, Telangana) |
|---|---|---|---|---|
| **Crop** | Pearl Millet (*Pennisetum glaucum*) | Pearl Millet (*Pennisetum glaucum*) | Pearl Millet (*Pennisetum glaucum*) | Pearl Millet (*Pennisetum glaucum*) |
| **Source File** | `Thermal_requirement_of_pearl_millet_varieties_in_S.pdf` | `18.RESPONSEOFPEARLMILLETVARIETIESTOHEAT.pdf` | `6-5-171-443.pdf` | `RA_00064.pdf` |
| **Authors** | Bhuva & Detroja (2018) | Wankhede, Jadhav & Shaikh (2018) | Vora et al. (2018) | ICRISAT Agroclimatology Group (1984) |
| **Location** | JAU Jamnagar, Gujarat | ZARS Solapur, MPKV Rahuri, MH | JAU Targhadia, Rajkot, Gujarat | ICRISAT Center, Patancheru |
| **Base Temperature ($T_b$)** | **$12.0^\circ\text{C}$** | **$10.0^\circ\text{C}$** | **$10.0^\circ\text{C}$** | **$7.0^\circ\text{C}$** |
| **Citation for $T_b$** | Explicitly cites Ong (1983) | Explicitly cites Ong (1983) | Cites Major et al. (1975) | ICRISAT physiological baseline |
| **Season** | Summer (Irrigated) | Kharif (Rainfed) | Kharif (Rainfed) | Multi-season rainy/postrainy |
| **Impact on GDD** | Maturity GDD: 1963–2213 °C day | Maturity GDD: 967–2105 °C day | Maturity GDD: 1375–1641 °C day | Maturity GDD: ~1390 °C day |
| **Documented Reason** | Both Bhuva & Detroja and Wankhede cite Ong (1983), but Bhuva adopts $T_b = 12.0^\circ\text{C}$ specifically for summer crop germplasm in South Saurashtra, whereas Wankhede adopts $T_b = 10.0^\circ\text{C}$ for monsoon kharif sowings in Solapur, and ICRISAT established $T_b = 7.0^\circ\text{C}$ for cold tolerance screening. Zero mathematical conversion or blending may be applied. |

## Conflict 2: Pearl Millet GHB-558 Maturity Thermal Requirement (Jamnagar vs Targhadia)

- **Crop**: Pearl Millet
- **Cultivar**: GHB-558
- **Stage**: Physiological Maturity (Total crop duration)

| Parameter | Dataset A (Jamnagar, South Saurashtra) | Dataset B (Targhadia, North Saurashtra) |
|---|---|---|
| **Source** | Bhuva & Detroja (2018), `Thermal_requirement_of_pearl_millet_varieties_in_S.pdf` | Vora et al. (2018), `6-5-171-443.pdf` |
| **Maturity GDD** | **2057.0 °C day** (pooled 3-year mean) | **1375.0 – 1641.0 °C day** (1st date: 1641, 2nd: 1452, 3rd: 1375) |
| **Base Temperature ($T_b$)** | $12.0^\circ\text{C}$ | $10.0^\circ\text{C}$ |
| **Season & Regime** | Summer season, Irrigated (93.1 calendar days) | Kharif season, Rainfed (78–85 calendar days) |
| **Documented Reason** | Crop season difference: Summer pearl millet experiences high ambient daytime temperatures and longer photoperiods requiring ~93 days and accumulating >2000 °C day even with higher base temp (12°C). Kharif rainfed pearl millet at Targhadia matures faster under monsoon cloud cover and rainfall, accumulating only 1375–1641 °C day. |

## Conflict 3: Groundnut Kharif Spreading vs Summer Bunch Thermal Requirement

- **Crop**: Groundnut (*Arachis hypogaea* L.)
- **Stage**: Physiological Maturity

| Parameter | Dataset A: Summer Groundnut (Junagadh) | Dataset B: Kharif Spreading Groundnut (Targhadia) |
|---|---|---|
| **Source** | Bhutiya et al. (2025), `Bhutiya3182025JSRR139829.pdf` | Vora et al. (2018), `6-5-171-443.pdf` |
| **Cultivars** | GJG-31 (2107 °C day), GG-34 (2310 °C day), GG-37 (2149 °C day) | GG-13 (1715 – 2325 °C day; 1st date: 2325, 2nd: 2066, 3rd: 1715) |
| **Base Temperature** | $10.0^\circ\text{C}$ | $10.0^\circ\text{C}$ |
| **Season & Sowing** | Summer 2024 (Feb-March sowings, Irrigated) | Kharif (July-August onset of monsoon sowings, Rainfed) |
| **Documented Reason** | Sowing window and seasonal temperature profile: Summer groundnut requires 2100–2310 °C day under rising summer heat. Kharif spreading groundnut exhibits sharp decline with delayed sowing (from 2325 down to 1715 °C day) due to terminal moisture stress and cooling autumn night temperatures in North Saurashtra. |

## Conflict 4: Soybean Multi-Region GDD Variations (Parbhani, MH vs Raipur, CG)

- **Crop**: Soybean (*Glycine max*)
- **Cultivars**: JS-335, JS 93-05, MAUS varieties
- **Base Temperature**: $10.0^\circ\text{C}$ in both papers

| Parameter | Marathwada Region (Parbhani, MH) | Chhattisgarh Plains (Raipur, CG) |
|---|---|---|
| **Source** | Usha Sri & Jadhav (2020), `D. Usha Sri and M. G. Jadhav.pdf` | Kaushik et al. (2015), `A-42352.pdf` |
| **Cultivars Studied** | MAUS-71 (2371.8 °C day), MAUS-158 (3163.9 °C day), MAUS-162 (2746.5 °C day) | JS 97-52 (1753–1913 °C day), JS-335 (1718–1860 °C day), JS 93-05 (1453–1640 °C day) |
| **Documented Reason** | Duration maturity group genetics: The MAUS series bred by VNMKV for Marathwada are longer duration cultivars (accumulating 2370–3160 °C day), whereas national standard early-to-medium varieties JS-335 and JS 93-05 at Raipur mature with 1450–1860 °C day. |
