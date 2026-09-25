# AgriShield 360° — Phase 0: Backend & API Audit Report

**Audit Date**: September 2026  
**Auditor**: AgriShield 360° Systems Architecture Team  
**Scope**: Complete read-only audit of all backend API endpoints in `kisan-dost/ventureHack/kisan-next/src/app/api` and `kisan-dost/ventureHack/ai-service`.

---

## 1. Backend Architecture & API Gateway Overview

The backend architecture consists of two cooperative services:
1. **Next.js 15 App Router API Gateway (`src/app/api/...`)**: Handles farmer authentication, JWT cookie verification, MongoDB database operations via Mongoose, proxying to external APIs (WeatherAPI.com, Open-Meteo, Modal.com AgriVision), and fallback in-memory data resilience.
2. **Python AI Microservice (`ai-service/server.py`)**: A FastAPI / Uvicorn server running on port `8000` exposing trained machine learning models (`RandomForestRegressor` via `yield_model.pkl`) with feature encoders (`crop_encoder.pkl`, `state_encoder.pkl`, `season_encoder.pkl`).

---

## 2. Comprehensive Endpoint Catalog

---

### Authentication APIs

```text
METHOD: POST
ENDPOINT: /api/auth/register
AUTH REQUIRED: No
REQUEST: { username: string, password?: string, name: string, mobile?: string, mainCrop?: string }
RESPONSE: 201 { success: true, user: { id, username, name, mobile, mainCrop } } (Sets HTTP-only cookie __kisan_auth_token)
DATABASE USED: MongoDB (User collection)
AGRIShield REUSE/MODIFICATION: REUSE directly for farmer authentication.
```

```text
METHOD: POST
ENDPOINT: /api/auth/login
AUTH REQUIRED: No
REQUEST: { username: string, password?: string }
RESPONSE: 200 { success: true, user: { id, username, name, mobile, mainCrop } } (Sets HTTP-only cookie __kisan_auth_token)
DATABASE USED: MongoDB (User collection)
AGRIShield REUSE/MODIFICATION: REUSE directly for farmer authentication.
```

```text
METHOD: GET
ENDPOINT: /api/auth/me
AUTH REQUIRED: Yes (via __kisan_auth_token cookie)
REQUEST: None
RESPONSE: 200 { user: { id, username, name, mobile, mainCrop, village, district } } | 401 { error: 'Unauthorized' }
DATABASE USED: MongoDB (User collection)
AGRIShield REUSE/MODIFICATION: REUSE to identify the current farmer in AgriShield.
```

```text
METHOD: POST
ENDPOINT: /api/auth/logout
AUTH REQUIRED: No
REQUEST: None
RESPONSE: 200 { success: true } (Clears __kisan_auth_token cookie)
DATABASE USED: None
AGRIShield REUSE/MODIFICATION: REUSE.
```

```text
METHOD: GET
ENDPOINT: /api/auth/google
AUTH REQUIRED: No
REQUEST: None (Browser navigation)
RESPONSE: 302 Redirect to Google OAuth consent screen
DATABASE USED: None
AGRIShield REUSE/MODIFICATION: REUSE for Google Single Sign-On.
```

```text
METHOD: GET
ENDPOINT: /api/auth/google/callback
AUTH REQUIRED: No (Processes OAuth authorization code from query param)
REQUEST: Query: ?code=...
RESPONSE: 302 Redirect to /auth?success=google_login with session cookie set
DATABASE USED: MongoDB (User collection: creates or links user by googleId)
AGRIShield REUSE/MODIFICATION: REUSE.
```

---

### Fields & Land Parcel APIs

```text
METHOD: GET
ENDPOINT: /api/fields
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: None
RESPONSE: 200 [ { _id, farmerId, name, area, areaUnit, location: { village, taluka, district, state, latitude, longitude }, soil, irrigation, previousCrop, crops: [...] } ]
DATABASE USED: MongoDB (Field and Crop collections, with fallback to MemoryStore)
AGRIShield REUSE/MODIFICATION: REUSE. This is the primary foundation for AgriShield field selection and GIS location resolution.
```

```text
METHOD: POST
ENDPOINT: /api/fields
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: { name: string, area: number, areaUnit: 'Acre' | 'Hectare', location?: { village, taluka, district, state, latitude, longitude }, soil?: { type, soilTestAvailable, pH, nitrogen, phosphorus, potassium, organicCarbon }, irrigation?: { method, waterSource, frequency }, previousCrop?: string }
RESPONSE: 201 { _id, farmerId, name, area, areaUnit, location, soil, irrigation, previousCrop, createdAt }
DATABASE USED: MongoDB (Field collection, with fallback to MemoryStore)
AGRIShield REUSE/MODIFICATION: REUSE and EXTEND: Add optional field polygon/boundary coordinate array for Phase 2 GIS mapping.
```

```text
METHOD: GET
ENDPOINT: /api/fields/[id]
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: Path param: id
RESPONSE: 200 { _id, farmerId, name, area, areaUnit, location, soil, irrigation, previousCrop, crops: [...] }
DATABASE USED: MongoDB (Field and Crop collections)
AGRIShield REUSE/MODIFICATION: REUSE for field-level AgriShield health dashboard.
```

```text
METHOD: PUT
ENDPOINT: /api/fields/[id]
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: Path param: id; Body: Partial field update { name, area, areaUnit, location, soil, irrigation, previousCrop }
RESPONSE: 200 { updatedField }
DATABASE USED: MongoDB (Field collection)
AGRIShield REUSE/MODIFICATION: REUSE.
```

```text
METHOD: DELETE
ENDPOINT: /api/fields/[id]
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: Path param: id
RESPONSE: 200 { message: 'Field and crops deleted successfully' } (Cascades deletion to Crop collection)
DATABASE USED: MongoDB (Field and Crop collections)
AGRIShield REUSE/MODIFICATION: REUSE.
```

---

### Crop Registration & Management APIs

```text
METHOD: GET
ENDPOINT: /api/fields/[id]/crops
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: Path param: id (fieldId)
RESPONSE: 200 [ { _id, farmerId, fieldId, cropName, cropMasterId, variety, sowingDate, cultivatedArea, cultivatedAreaUnit, cultivationMethod, status, notes } ]
DATABASE USED: MongoDB (Crop collection, with fallback to MemoryStore)
AGRIShield REUSE/MODIFICATION: REUSE. Primary endpoint for AgriShield to list crops cultivated in a given field.
```

```text
METHOD: POST
ENDPOINT: /api/fields/[id]/crops
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: Path param: id (fieldId); Body: { cropName: string, cropMasterId?: string, variety?: string, sowingDate: string (ISO/date), cultivatedArea: number, cultivatedAreaUnit?: 'Acre'|'Hectare', cultivationMethod?: string, notes?: string }
RESPONSE: 201 { _id, farmerId, fieldId, cropName, variety, sowingDate, cultivatedArea, status: 'Active', ... }
DATABASE USED: MongoDB (Crop collection, with area limit validation against Field collection)
AGRIShield REUSE/MODIFICATION: REUSE and EXTEND: Validate crop and variety against ICAR Phase 1 Master tables; initialize GDD calculation tracking baseline.
```

```text
METHOD: GET
ENDPOINT: /api/crops/[id]
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: Path param: id (cropId)
RESPONSE: 200 { _id, farmerId, fieldId (populated), cropName, variety, sowingDate, cultivatedArea, status, ... }
DATABASE USED: MongoDB (Crop collection populated with Field)
AGRIShield REUSE/MODIFICATION: REUSE as the primary data feed for AgriShield 360° individual crop health view.
```

```text
METHOD: PUT
ENDPOINT: /api/crops/[id]
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: Path param: id; Body: Partial crop update
RESPONSE: 200 { updatedCrop }
DATABASE USED: MongoDB (Crop collection)
AGRIShield REUSE/MODIFICATION: REUSE to update crop status (e.g., mark as 'Harvested', update notes).
```

```text
METHOD: DELETE
ENDPOINT: /api/crops/[id]
AUTH REQUIRED: Yes (via auth() helper)
REQUEST: Path param: id
RESPONSE: 200 { message: 'Crop deleted successfully' }
DATABASE USED: MongoDB (Crop collection)
AGRIShield REUSE/MODIFICATION: REUSE.
```

```text
METHOD: GET
ENDPOINT: /api/crop-master
AUTH REQUIRED: No
REQUEST: None
RESPONSE: 200 [ { cropName: 'Cotton', varieties: ['Bt Cotton', 'Desi Cotton', ...], active: true }, ... 11 crops total ]
DATABASE USED: MongoDB (CropMaster collection, auto-seeds default 11 crops if empty)
AGRIShield REUSE/MODIFICATION: MODIFY / UPGRADE: Replace the hardcoded 11-crop default with the verified ICAR 2022–2026 Phase 1 dataset (MVP crops: Wheat, Rice, Cotton, Groundnut, Soybean) with comprehensive variety lists.
```

```text
METHOD: GET
ENDPOINT: /api/crop-stage
AUTH REQUIRED: No
REQUEST: None
RESPONSE: 200 { daysAfterSowing: 0, currentStage: 'Active', currentAdvisory: null, nextAdvisory: null }
DATABASE USED: None (Stub response)
AGRIShield REUSE/MODIFICATION: REPLACE with AgriShield Growth-Stage Engine: Calculate real stage using ICAR GDD thresholds and sowing date.
```

```text
METHOD: GET
ENDPOINT: /api/farmer-crops
AUTH REQUIRED: No
REQUEST: None
RESPONSE: 200 [] (Stub response)
DATABASE USED: None
AGRIShield REUSE/MODIFICATION: LEGACY STUB. Deprecate in favor of `/api/fields/[id]/crops`.
```

```text
METHOD: POST
ENDPOINT: /api/farmer-crops
AUTH REQUIRED: No
REQUEST: { cropType, plantationDate, landArea, location, phoneNumber }
RESPONSE: 200 { message: 'Success' } (Stub response)
DATABASE USED: None
AGRIShield REUSE/MODIFICATION: LEGACY STUB. Redirect frontend callers to `/api/fields/[id]/crops`.
```

```text
METHOD: GET
ENDPOINT: /api/my-crops
AUTH REQUIRED: No
REQUEST: None
RESPONSE: 200 [] (Stub response)
DATABASE USED: None
AGRIShield REUSE/MODIFICATION: LEGACY STUB. Connect directly to `/api/fields` + `/api/fields/[id]/crops` or upgrade to serve AgriShield 360° aggregated summaries.
```

---

### Weather & Environmental APIs

```text
METHOD: GET
ENDPOINT: /api/weather
AUTH REQUIRED: No
REQUEST: Query param: ?q={location|lat,lon|auto:ip}
RESPONSE: 200 { location: { name, region, country, lat, lon, localtime }, current: { temp_c, temp_f, is_day, condition, wind_kph, pressure_mb, humidity, cloud, uv, precip_mm }, forecast: { forecastday: [ { date, day: { maxtemp_c, mintemp_c, avgtemp_c, condition, chance_of_rain, avghumidity, uv } } ] } }
DATABASE USED: None (Transient fetch with Next.js 300s cache)
AGRIShield REUSE/MODIFICATION: REUSE for live weather and 5-day forecast. Extract `maxtemp_c` and `mintemp_c` for AgriShield GDD daily increments and humidity/temperature thresholds for Disease Risk Engine.
```

```text
METHOD: GET
ENDPOINT: /api/location/reverse
AUTH REQUIRED: No
REQUEST: Query params: ?lat=...&lon=...
RESPONSE: 200 Nominatim OpenStreetMap reverse geocoded JSON (address, village, district, state)
DATABASE USED: None (External OpenStreetMap Nominatim proxy)
AGRIShield REUSE/MODIFICATION: REUSE to auto-detect farmer village and district from map click.
```

---

### Disease Detection & AI APIs

```text
METHOD: POST
ENDPOINT: /api/detect-disease
AUTH REQUIRED: No
REQUEST: FormData with key "file" (binary image blob <= 5MB)
RESPONSE: 200 { cropName: string, diseaseName: string, confidence: number, description: string, symptoms: string[], causes: string[], precautions: string[], recommendedPesticides: [...], recommendedFertilizers: [...], requiresExpertVerification: boolean, focusRegion?: { isFocused, boxNormalized, message } }
DATABASE USED: MongoDB (Reads AgriProduct collection to match commercial remedies)
AGRIShield REUSE/MODIFICATION: REUSE. Add authentication and persist diagnosis output to an AgriShield `disease_scans` collection linked to the active crop.
```

---

### Yield Prediction & Machine Learning APIs

```text
METHOD: POST
ENDPOINT: /api/yield-prediction
AUTH REQUIRED: No
REQUEST: { crop: string, area: number, ndvi: number, soilMoisture: number, rainfall: number, state?: string }
RESPONSE: 200 { predicted_yield: number, yield_per_acre: number, confidence_score: number, backend: 'python' | 'local', insights: [...] }
DATABASE USED: MongoDB (Saves to YieldPrediction collection)
AGRIShield REUSE/MODIFICATION: REUSE. Can serve as the harvest yield estimation baseline for AgriShield.
```

```text
METHOD: POST (FastAPI Python AI Microservice)
ENDPOINT: http://localhost:8000/predict-yield
AUTH REQUIRED: No
REQUEST: { crop: string, land_area: number, fertilizer_cost: number, pesticide_cost: number, irrigation_cost: number, seed_cost: number, state: string }
RESPONSE: 200 { predicted_profit: number, estimated_revenue: number, total_cost: number, predicted_yield_per_acre: number, confidence_score: number }
DATABASE USED: None (In-memory scikit-learn model inference)
AGRIShield REUSE/MODIFICATION: REUSE as an external ML service for harvest yield predictions.
```

```text
METHOD: GET (FastAPI Python AI Microservice)
ENDPOINT: http://localhost:8000/health
AUTH REQUIRED: No
REQUEST: None
RESPONSE: 200 { status: 'ok', model_loaded: true }
DATABASE USED: None
AGRIShield REUSE/MODIFICATION: Health check utility.
```

---

### Marketplace, Community & Utility APIs

```text
METHOD: GET
ENDPOINT: /api/marketplace/[productId]
AUTH REQUIRED: No
REQUEST: Path param: productId
RESPONSE: 200 AgriProduct document
DATABASE USED: MongoDB (AgriProduct collection)
AGRIShield REUSE/MODIFICATION: REUSE for chemical treatment product lookups.
```

```text
METHOD: GET
ENDPOINT: /api/community/posts
AUTH REQUIRED: No
REQUEST: Query params: ?crop=...&type=...&page=...
RESPONSE: 200 [ FarmerPost documents ]
DATABASE USED: MongoDB (FarmerPost collection)
AGRIShield REUSE/MODIFICATION: REUSE for farmer community sharing.
```

```text
METHOD: POST
ENDPOINT: /api/community/upload
AUTH REQUIRED: No
REQUEST: FormData with "file" (<= 5MB)
RESPONSE: 200 { success: true, url: '/uploads/community/filename' | 'data:image/...;base64,...' }
DATABASE USED: None (Local filesystem / public/uploads/community, with Base64 fallback)
AGRIShield REUSE/MODIFICATION: REUSE for uploading foliar leaf photos and farm field images.
```

```text
METHOD: POST
ENDPOINT: /api/verify-pesticide
AUTH REQUIRED: No
REQUEST: { qrCodeId: string, userId?: string }
RESPONSE: 200 { isAuthentic: boolean, productDetails: {...}, scanLogId: string }
DATABASE USED: MongoDB (PesticideDatabase and ScanHistory collections)
AGRIShield REUSE/MODIFICATION: REUSE for chemical verification.
```

```text
METHOD: GET
ENDPOINT: /api/cron/process-advisories
AUTH REQUIRED: No (Designed for automated cron invocation)
REQUEST: None
RESPONSE: 200 { processed: number, sentSms: number, sentPush: number }
DATABASE USED: MongoDB (FarmerCrop, CropAdvisory, NotificationToken, SmsLog, PushLog)
AGRIShield REUSE/MODIFICATION: REUSE / EXTEND: Upgrade to evaluate AgriShield weather triggers and GDD stages.
```
