# AgriShield 360° — Normalized GDD Conflict Matrix

In accordance with Phase 3B validation principles, scientific discrepancies between sources are preserved as empirical realities rather than eliminated through false consensus or mathematical averaging.

## Master Conflict Table

| Crop | Variety | Parameter | Value | Unit | Location | Season | Source | Experimental Context | Conflict Group ID |
|---|---|---|---|---|---|---|---|---|---|
| **Pearl Millet** | GHB 558, GHB 538, Proagro 9444 | Base Temperature (Tb) | **12.0** | °C | Jamnagar, Gujarat | Summer | `Bhuva & Detroja (2018)` | Summer irrigated trials; cites Ong (1983) | `CONFLICT-PM-01` |
| **Pearl Millet** | Shanti, Mahyco MRB-204, Dhanashakti | Base Temperature (Tb) | **10.0** | °C | Solapur, Maharashtra | Kharif | `Wankhede et al. (2018)` | Rainfed scarcity zone trials; cites Ong (1983) | `CONFLICT-PM-01` |
| **Pearl Millet** | GHB-558 | Base Temperature (Tb) | **10.0** | °C | Targhadia, Gujarat | Kharif | `Vora et al. (2018)` | Rainfed North Saurashtra trials; cites Major et al. (1975) | `CONFLICT-PM-01` |
| **Pearl Millet** | BJ-104 | Base Temperature (Tb) | **7.0** | °C | Patancheru, Telangana | Multi-season | `ICRISAT (1984)` | Physiological baseline screening in semi-arid tropics | `CONFLICT-PM-01` |
| **Pearl Millet** | GHB-558 | Maturity GDD | **2057.0** | °C day | Jamnagar, Gujarat | Summer | `Bhuva & Detroja (2018)` | Summer irrigated (93.1 days, Tb=12°C) | `CONFLICT-PM-02` |
| **Pearl Millet** | GHB-558 | Maturity GDD | **1641.0** | °C day | Targhadia, Gujarat | Kharif (D1) | `Vora et al. (2018)` | Kharif rainfed onset of monsoon (Tb=10°C) | `CONFLICT-PM-02` |
| **Pearl Millet** | GHB-558 | Maturity GDD | **1452.0** | °C day | Targhadia, Gujarat | Kharif (D2) | `Vora et al. (2018)` | Kharif rainfed 15 days after onset (Tb=10°C) | `CONFLICT-PM-02` |
| **Pearl Millet** | GHB-558 | Maturity GDD | **1375.0** | °C day | Targhadia, Gujarat | Kharif (D3) | `Vora et al. (2018)` | Kharif rainfed 30 days after onset (Tb=10°C) | `CONFLICT-PM-02` |
| **Groundnut** | GG-13 (Spreading) | Maturity GDD | **2325.0** | °C day | Targhadia, Gujarat | Kharif (D1) | `Vora et al. (2018)` | Kharif rainfed normal onset (Tb=10°C) | `CONFLICT-GN-01` |
| **Groundnut** | GG-13 (Spreading) | Maturity GDD | **1715.0** | °C day | Targhadia, Gujarat | Kharif (D3) | `Vora et al. (2018)` | Kharif rainfed late sown terminal drought (Tb=10°C) | `CONFLICT-GN-01` |
| **Groundnut** | GJG-31 (Bunch) | Maturity GDD | **2107.0** | °C day | Junagadh, Gujarat | Summer | `Bhutiya et al. (2025)` | Summer irrigated trials (Tb=10°C) | `CONFLICT-GN-01` |
| **Groundnut** | GG-34 (Bunch) | Maturity GDD | **2310.0** | °C day | Junagadh, Gujarat | Summer | `Bhutiya et al. (2025)` | Summer irrigated trials (Tb=10°C) | `CONFLICT-GN-01` |
| **Groundnut** | GG-37 (Bunch) | Maturity GDD | **2149.0** | °C day | Junagadh, Gujarat | Summer | `Bhutiya et al. (2025)` | Summer irrigated trials (Tb=10°C) | `CONFLICT-GN-01` |
| **Soybean** | MAUS-71 | Maturity GDD | **2371.8** | °C day | Parbhani, Maharashtra | Kharif | `Usha Sri & Jadhav (2020)` | Marathwada long-duration cultivar (Tb=10°C) | `CONFLICT-SB-01` |
| **Soybean** | MAUS-158 | Maturity GDD | **3163.9** | °C day | Parbhani, Maharashtra | Kharif | `Usha Sri & Jadhav (2020)` | Marathwada long-duration cultivar (Tb=10°C) | `CONFLICT-SB-01` |
| **Soybean** | MAUS-162 | Maturity GDD | **2746.5** | °C day | Parbhani, Maharashtra | Kharif | `Usha Sri & Jadhav (2020)` | Marathwada long-duration cultivar (Tb=10°C) | `CONFLICT-SB-01` |
| **Soybean** | JS-335 | Maturity GDD | **1718.4 - 1860.6** | degree-days | Raipur, Chhattisgarh | Kharif | `Kaushik et al. (2015)` | National medium-duration standard across 4 sowings (Tb=10°C) | `CONFLICT-SB-01` |
| **Soybean** | JS 93-05 | Maturity GDD | **1453.8 - 1640.4** | degree-days | Raipur, Chhattisgarh | Kharif | `Kaushik et al. (2015)` | Early-maturing national cultivar across 4 sowings (Tb=10°C) | `CONFLICT-SB-01` |
| **Soybean** | JS 97-52 | Maturity GDD | **1753.4 - 1913.2** | degree-days | Raipur, Chhattisgarh | Kharif | `Kaushik et al. (2015)` | Medium-duration cultivar across 4 sowings (Tb=10°C) | `CONFLICT-SB-01` |


## Conflict Group Analysis & Engine Handling Rules

### 1. `CONFLICT-PM-01` — Pearl Millet Base Temperature Multi-Value Divergence
- **Nature of Conflict**: Three distinct base temperatures are reported across peer-reviewed sources: $7.0^\circ\text{C}$ (ICRISAT Patancheru), $10.0^\circ\text{C}$ (Solapur, MH and Targhadia, GJ), and $12.0^\circ\text{C}$ (Jamnagar, GJ).
- **Engine Rule**: Under no circumstances should the engine select an arithmetic mean (e.g. 9.67°C). If the farm location is in **South Saurashtra (Jamnagar/Junagadh/Porbandar)** and growing summer pearl millet, the engine binds to the **$T_b = 12.0^\circ\text{C}$** parameter set (`PS-028` to `PS-033`). If located in **North Saurashtra (Rajkot/Surendranagar)** for kharif, it binds to **$T_b = 10.0^\circ\text{C}$** (`PS-022` to `PS-024`). If in **Maharashtra Scarcity Zone (Solapur/Ahmednagar)**, it binds to Solapur kharif sets (`PS-034` to `PS-042`).

### 2. `CONFLICT-PM-02` — Pearl Millet GHB-558 Seasonal Requirement Discrepancy
- **Nature of Conflict**: Variety GHB-558 requires 2057 °C day at Jamnagar during Summer, but only 1375–1641 °C day at Targhadia during Kharif.
- **Engine Rule**: Keep separate parameter sets partitioned by `season: 'Summer'` vs `season: 'Kharif'`. When a farmer creates a summer crop cycle, the engine selects the Summer parameter set; for monsoon sowing, it selects the Kharif parameter set.

### 3. `CONFLICT-GN-01` — Groundnut Seasonal & Growth Habit Divergence
- **Nature of Conflict**: Kharif spreading cultivar GG-13 requires 1715–2325 °C day under rainfed conditions, while summer bunch cultivars GJG-31, GG-34, GG-37 require 2100–2310 °C day under irrigation.
- **Engine Rule**: Maintain distinct parameter sets based on `subspecies` (spreading vs bunch) and `season` (Summer vs Kharif). Spreading groundnut under delayed kharif sowing exhibits severe GDD decline due to moisture stress.

### 4. `CONFLICT-SB-01` — Soybean Regional Breeding Duration Differences
- **Nature of Conflict**: VNMKV Parbhani cultivars (MAUS series) consume 2370–3160 °C day, whereas central national varieties (JS-335, JS 93-05) at Raipur consume 1450–1860 °C day.
- **Engine Rule**: Parameter sets must match the specific cultivar. A farmer growing JS-335 must not use the MAUS-158 parameter set even within Maharashtra.
