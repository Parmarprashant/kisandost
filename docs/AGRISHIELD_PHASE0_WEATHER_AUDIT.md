# AgriShield 360° — Phase 0: Weather Audit Report

**Audit Date**: September 2026  
**Auditor**: AgriShield 360° Systems Architecture Team  
**Scope**: Complete read-only audit of weather providers, APIs, caching, and storage mechanisms in `kisan-dost/ventureHack/kisan-next/src/app/api/weather/route.ts` and `src/context/WeatherContext.tsx`.

---

## 1. Weather System Specifications

```text
Current weather provider: WeatherAPI.com (Primary) with automatic fallback to Open-Meteo (Secondary / Keyless Free Tier) and multi-tier IP geolocation (ipwho.is, freeipapi.com, ipapi.co)
API endpoint: 
  - Internal API Gateway: GET /api/weather
  - Upstream Primary: https://api.weatherapi.com/v1/current.json & https://api.weatherapi.com/v1/forecast.json
  - Upstream Fallback: https://api.open-meteo.com/v1/forecast & https://geocoding-api.open-meteo.com/v1/search
Required API key: Required for WeatherAPI.com; NOT required for Open-Meteo fallback
Environment variable: WEATHER_API_KEY
Latitude/longitude input: Query parameter ?q={lat,lon} (e.g. ?q=23.2156,72.6369) or ?q=city or ?q=auto:ip
Response fields:
  - location: { name, region, country, lat, lon, localtime }
  - current: { temp_c, temp_f, is_day, condition: { text, icon, code }, wind_kph, wind_degree, wind_dir, pressure_mb, humidity, cloud, feelslike_c, vis_km, uv, gust_kph, precip_mm }
  - forecast: { forecastday: [ { date, day: { maxtemp_c, mintemp_c, avgtemp_c, condition, will_it_rain, chance_of_rain, will_it_snow, chance_of_snow, avghumidity, avgvis_km, uv } } ] }
  - forecastError: string | null
Current weather storage: NOT_IMPLEMENTED (Transient fetch only; cached for 300s in Next.js memory cache; no database collection)
Historical weather storage: NOT_IMPLEMENTED (No past weather observations are archived in the database)
```

---

## 2. Functional Breakdown: Real Existing vs Not Implemented

### REAL EXISTING FUNCTIONALITY

1. **Dual-Provider Resilient Gateway (`src/app/api/weather/route.ts`)**:
   - Checks `process.env.WEATHER_API_KEY`. If configured, attempts to query WeatherAPI.com for current conditions and 5-day forecast.
   - If `WEATHER_API_KEY` is missing, invalid, rate-limited, or throws an error, it **automatically falls back** to Open-Meteo's open endpoints without downtime.
2. **Flexible Location Resolution**:
   - Handles exact GPS coordinates (`lat,lon`).
   - Handles named agricultural regions and districts (`Surat`, `Gandhinagar`, `Bhatinda`).
   - Handles `auto:ip` using a 4-tier fallback: `ipwho.is` -> `freeipapi.com` -> `ipapi.co` -> hardcoded agricultural coordinate `(23.2156, 72.6369)` (Gandhinagar, Gujarat).
3. **Daily Temperature Forecast Range**:
   - Returns 5 upcoming forecast days, each containing `maxtemp_c`, `mintemp_c`, and `avgtemp_c`.
   - Returns daily `avghumidity` and `chance_of_rain`.
4. **Agricultural Weather Heuristics (`src/lib/weatherAdvisory.ts`)**:
   - `getRainfallCondition(location)`: Classifies rainfall into "Heavy" (>=10mm), "Low" (0mm), or "Normal".
   - `getEnhancedAdvisory()`: Appends weather warnings (e.g. delayed spray during heavy rainfall to avoid runoff, monitoring fungal accumulation under high humidity).

---

### NOT IMPLEMENTED

1. **Database Storage for Weather Logs**:
   - **NOT IMPLEMENTED**. No collection exists in MongoDB to store daily observations. Every call to `/api/weather` fetches fresh external data.
2. **Historical Weather Archive**:
   - **NOT IMPLEMENTED**. The system cannot query what the temperature was 15, 30, or 60 days ago for a registered crop.
3. **Historical GDD Accumulation from Past Dates**:
   - **NOT IMPLEMENTED**. Because historical daily temperatures are not archived, GDD cannot currently be retroactively computed for crops planted months in the past unless Open-Meteo's Historical Weather API (`https://archive-api.open-meteo.com/v1/archive`) is utilized.
4. **Automated Scheduled Weather Logging**:
   - **NOT IMPLEMENTED**. There is no background worker or cron persisting daily weather observations per farm parcel.

---

## 3. AgriShield Phase 1 & 2 Recommendations

1. **For GDD Calculation Engine**:
   - Open-Meteo provides a free Historical Archive API (`https://archive-api.open-meteo.com/v1/archive?latitude=...&longitude=...&start_date=...&end_date=...&daily=temperature_2m_max,temperature_2m_min`) that requires no API key.
   - This can be leveraged to backfill daily $T_{max}$ and $T_{min}$ from `sowingDate` up to the current date.
   - Once backfilled, daily forecast temperatures from `/api/weather` can project future GDD accumulation towards maturity.
2. **For Weather-Trigger & Risk Engine**:
   - The existing `humidity` (>85%), `precip_mm`, and `temp_c` outputs from `/api/weather` can be evaluated directly against ICAR Phase 1 pest/disease favorable condition rules.
