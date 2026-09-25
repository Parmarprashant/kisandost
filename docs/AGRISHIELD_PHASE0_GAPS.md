# AgriShield 360° — Phase 0: Gap Analysis Report

**Audit Date**: September 2026  
**Auditor**: AgriShield 360° Systems Architecture Team  
**Scope**: Definitive gap categorization based on direct inspection of the codebase.

---

### 1. CONFIRMED (Verified Directly from Code)

1. **Frontend Architecture**: Next.js 15.5.14 with React 19.2.3, Tailwind CSS v4, Framer Motion, and `next-intl` (English, Hindi, Gujarati, Marathi).
2. **Authentication & Session**: Self-hosted JWT authentication via `jose` and `bcryptjs` using HTTP-only cookie `__kisan_auth_token`, plus Google OAuth 2.0 and demo login (`demo_farmer`).
3. **Database Architecture**: MongoDB with Mongoose 9.3.0 (`src/lib/mongodb.ts`) featuring an in-memory fallback layer (`src/lib/memoryStore.ts`).
4. **Relational Field & Crop Data Model**: `Field` schema (`src/models/Field.ts`) and `Crop` schema (`src/models/Crop.ts`) with production CRUD endpoints at `/api/fields`, `/api/fields/[id]`, `/api/fields/[id]/crops`, and `/api/crops/[id]`.
5. **GIS Point Mapping**: Leaflet 1.9.4 and `react-leaflet` 5.0.0 in `FarmMap.tsx` using Google Hybrid satellite tiles with click-to-pin coordinate capture and reverse geocoding.
6. **Weather Pipeline**: Dual-provider API gateway at `/api/weather` (WeatherAPI.com primary + Open-Meteo open fallback) returning current conditions and 5-day daily forecast ($T_{max}, T_{min}$, humidity, precipitation).
7. **Disease AI Model**: EfficientNet-B5+CBAM + YOLOv8 + U-Net hosted on Modal.com serverless GPU cluster, proxied through `/api/detect-disease`.
8. **UI Component Library**: Complete set of Radix / Tailwind UI components (`Button`, `Card`, `Input`, `Select`, `Badge`, `Dialog`, `Sonner`, `DualText`).
9. **Mobile Prototype**: Flutter client (`kisan_app`) with Riverpod and GoRouter, configured to point to Next.js API gateway.

---

### 2. MISSING (Things That Do Not Exist in Codebase)

1. **My Crops Frontend Implementation**: The route `/dashboard/my-crops` (`src/app/[locale]/(app)/dashboard/my-crops/page.tsx`) contains only a stub with the text *"This section is currently under maintenance."*
2. **Disease Scan History Persistence**: Diagnosis outputs from `/api/detect-disease` are never written to MongoDB. They exist strictly in client React memory and are lost on page navigation.
3. **Disease Severity Metric**: Severity percentage and severity level (Mild / Moderate / Severe) are **NOT_IMPLEMENTED** in the API or UI.
4. **Historical Weather Storage**: MongoDB contains no collection for weather logs. Past temperatures and rainfall are not saved.
5. **Field Polygon Geometries**: No polygon display, editing, or vertex storage exists in `FarmMap.tsx` or `Field.ts`.
6. **Active Growth-Stage Engine**: The endpoint `/api/crop-stage` is a static stub returning `{ daysAfterSowing: 0, currentStage: 'Active' }`.
7. **ICAR Agricultural Knowledge Base**: The database does not contain base temperatures, GDD to maturity, growth stage thermal units, or verified ICAR variety profiles for Wheat, Rice, Cotton, Groundnut, or Soybean.

---

### 3. ASSUMED (Things That Cannot Yet Be Confirmed)

1. **Modal.com AI Engine Uptime**: Assumed that the remote Modal.com deployment (`https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run`) will maintain stable uptime and free-tier allocation during live testing.
2. **Open-Meteo Rate Limits**: Assumed that Open-Meteo's historical and forecast APIs will continue to respond reliably for keyless batch requests.
3. **WeatherAPI.com Quota**: Assumed that the key in `.env.local` has active monthly credit; however, the codebase already has graceful fallback to Open-Meteo if depleted.

---

### 4. NEEDS MODIFICATION (Existing Components That Must Be Extended)

1. **`src/models/Crop.ts`**: Must add properties for:
   - `baseTemperature`: Base temperature ($T_{base}$) for GDD
   - `gddToMaturity`: Thermal time required for maturity
   - `accumulatedGdd`: Running sum of GDD
   - `currentGrowthStage`: Current growth stage name
   - `expectedHarvestDate`: Dynamically updated harvest prediction date
2. **`src/models/CropMaster.ts`**: Must be upgraded from plain string arrays to structured variety entities containing ICAR maturity, ecology, and yield attributes.
3. **`src/app/api/detect-disease/route.ts`**: Must accept optional `fieldId` and `cropId` parameters and save scan records to the database.
4. **`src/app/[locale]/(app)/dashboard/add-crop/page.tsx`**: Must be updated to post to `/api/fields/[id]/crops` instead of the legacy `/api/farmer-crops` stub, and load verified varieties from the ICAR Crop Master.

---

### 5. NEW COMPONENTS REQUIRED (AgriShield Components to Build)

1. **Phase 1 ICAR Reference Data Foundation**:
   - `phase-1-data/crops.json`
   - `phase-1-data/varieties.json`
   - `phase-1-data/growth_stages.json`
   - `phase-1-data/crop_pest_disease_reference.json`
   - `phase-1-data/crop_weather_conditions.json`
   - `phase-1-data/GDD_DATA_AUDIT.md`
   - `phase-1-data/DATA_CONFLICTS.md`
2. **AgriShield 360° My Crops Dashboard Screen**:
   - Full interactive dashboard at `src/app/[locale]/(app)/dashboard/my-crops/page.tsx` featuring:
     - Field and crop cycle switcher
     - Current growth stage visual stepper
     - GDD progress gauge ($\text{Accumulated GDD} / \text{Target GDD}$)
     - Real-time weather trigger & disease risk badge
     - Expected harvest countdown
3. **AgriShield Core Calculation Engines**:
   - `gddEngine.ts`: Daily GDD increment calculator using $\max(0, \frac{T_{max} + T_{min}}{2} - T_{base})$ and Open-Meteo historical backfill.
   - `stageEngine.ts`: Growth stage determination based on accumulated GDD against ICAR stage boundaries.
   - `riskEngine.ts`: Evaluation of current/forecast temperature, humidity, and rainfall against ICAR favorable disease rules.
4. **New Database Collections**:
   - `CropDiseaseScan`: To persist leaf diagnostic history linked to field and crop.
   - `DailyWeatherLog`: To cache daily temperature and precipitation readings for each registered field parcel.
