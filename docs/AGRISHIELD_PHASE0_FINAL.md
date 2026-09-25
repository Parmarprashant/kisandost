# AgriShield 360° — Phase 0: Final Architecture & Readiness Report

**Project**: AgriShield 360° Crop-Health Monitoring Module  
**Parent Platform**: KisanDost / VentureHack  
**Audit Status**: Complete Read-Only Audit  
**Date**: September 2026  

---

## 1. Existing System Architecture

KisanDost / VentureHack is an agricultural intelligence platform designed to empower small- and medium-scale Indian farmers. The repository contains a complete fullstack production application alongside microservices and mobile client prototypes:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   KISANDOST PLATFORM                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   CLIENT LAYER                                                                         │
│   ├── Next.js 15.5.14 PWA Web Client (React 19.2, Tailwind v4, next-intl)              │
│   └── Flutter Mobile App Prototype (kisan_app: Dart 3.13, Riverpod, GoRouter, Dio)     │
│                                                                                        │
│   API GATEWAY & BACKEND SERVICES                                                       │
│   ├── Next.js App Router Route Handlers (43+ API endpoints under /api/*)               │
│   ├── JWT Stateless Auth Engine (jose, bcryptjs, HTTP-only cookie __kisan_auth_token)   │
│   └── In-Memory Resilience Fallback Layer (memoryStore.ts)                             │
│                                                                                        │
│   DATA & STORAGE LAYER                                                                 │
│   ├── MongoDB NoSQL Database (21 Mongoose models in src/models)                        │
│   └── Local Disk / Base64 File Storage (public/uploads/community)                      │
│                                                                                        │
│   AI & EXTERNAL INTELLIGENCE INTEGRATIONS                                              │
│   ├── AgriVision Diagnostic Engine (Modal.com serverless GPU: EfficientNet-B5+YOLOv8)  │
│   ├── Gemini 1.5 Flash Vision & NVIDIA Llama 3 70B (geminiService.ts)                  │
│   ├── Python ML Yield Predictor Service (ai-service: FastAPI, scikit-learn, Port 8000) │
│   ├── Weather Gateway (WeatherAPI.com primary + Open-Meteo keyless fallback)           │
│   ├── Spatial & Geocoding (Leaflet Google Hybrid tiles, Nominatim OpenStreetMap)       │
│   └── Communications (Fast2SMS API, Firebase Cloud Messaging FCM)                      │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

- **Web Application**: Next.js 15.5.14 (React 19.2.3, React-DOM 19.2.3) with Tailwind CSS v4 and Framer Motion.
- **Routing**: Next.js App Router localized structure (`/[locale]/...`) supporting 4 languages (English `en`, Hindi `hi`, Gujarati `gu`, Marathi `mr`) managed by `next-intl`.
- **Primary Screens**: 21 unique web pages including `/dashboard`, `/weather`, `/diseases`, `/fertilizer-calculator`, `/tools`, `/communities`, `/marketplace`, and `/auth`.
- **Target Route**: `/dashboard/my-crops` currently renders a placeholder screen indicating *"This section is currently under maintenance."* This is the designated host screen for the AgriShield 360° module.
- **Mobile Prototype**: Flutter client (`kisan_app`) with 5-tab scaffold (`/home`, `/farm`, `/diagnose`, `/insights`, `/more`). `/home` has a live weather card; the other four tabs are placeholders.

---

## 3. Backend Architecture

- **Gateway**: Next.js API route handlers in `src/app/api/`.
- **Python Microservice**: FastAPI server on port 8000 (`ai-service/server.py`) serving trained Random Forest crop yield models.
- **Resilience**: The backend features an in-memory data store (`src/lib/memoryStore.ts`) that intercepts MongoDB connection drops and allows field and crop creation/retrieval to proceed uninterrupted.

---

## 4. Database Architecture

- **Database Engine**: MongoDB via Mongoose 9.3.0 (`src/lib/mongodb.ts`).
- **Existing Schema Inventory**:
  - `User.ts`: Farmer profiles (name, username, password hash, mobile, village, district, main crop).
  - `Field.ts`: Land parcels (farmerId, name, area, areaUnit, location coordinates, soil, irrigation, previous crop).
  - `Crop.ts`: Active crop cycles (farmerId, fieldId, cropName, variety, sowingDate, cultivatedArea, status, notes).
  - `CropMaster.ts`: Reference catalog of crops and varieties.
  - `CropDisease.ts`: Reference catalog of crop diseases, symptoms, precautions, and remedies.
  - `AgriProduct.ts`: Commercial fertilizers and pesticides.
  - `FarmerPost.ts`: Farmer community discussions and peer problem logs.
  - `YieldPrediction.ts`: Historical yield prediction logs.
  - `CropAdvisory.ts`: Sowing-day-based pesticide spray recommendations.

---

## 5. Authentication

- **Provider**: Custom JWT + Google OAuth 2.0.
- **Security**: Passwords hashed with bcrypt (10 rounds). Tokens signed with HS256 algorithm using `JWT_SECRET` via `jose`.
- **Session Transport**: Stored in HTTP-only, secure, `SameSite=Lax` cookie `__kisan_auth_token`.
- **Authorization**: Endpoint helper `auth()` extracts `{ userId }`. Unauthenticated requests receive `401 Unauthorized`.
- **AgriShield Binding**: Every `Field` and `Crop` record is scoped by `farmerId == userId`, ensuring complete multi-tenant tenant isolation.

---

## 6. Disease AI Engine

- **Model**: Custom deep hierarchical pipeline: EfficientNet-B5+CBAM (classification) + YOLOv8 (localization & focus region) + U-Net (segmentation).
- **Inference Location**: Serverless cloud GPU cluster on Modal.com (`https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run`).
- **Endpoint**: Internal proxy `POST /api/detect-disease` forwarding to `POST /api/v1/diagnose`.
- **Confidence**: Available (mapped to percentage numbers 94%, 78%, 52%).
- **Severity**: **NOT_IMPLEMENTED**. Upstream interface specifies `infected_area_pct`, but it is dropped during service transformation and is not returned to the user or database.

---

## 7. Weather Engine

- **Providers**: Dual-provider architecture. WeatherAPI.com (Primary) with automatic fallback to Open-Meteo (Keyless open API).
- **Endpoint**: `GET /api/weather?q=...` supporting exact coordinates (`lat,lon`), city names, or IP geolocation.
- **Capabilities**: Current weather plus 5-day daily forecast ($T_{max}, T_{min}, T_{avg}$, humidity, rain probability).
- **Storage**: **NOT_IMPLEMENTED**. Data is transiently fetched with 300s Next.js caching. No database table stores past weather.

---

## 8. Maps & GIS

- **Library**: Leaflet 1.9.4 & React-Leaflet 5.0.0 (`FarmMap.tsx`).
- **Imagery**: Google Maps Hybrid Satellite Raster tiles via direct URL. No Google Maps API key required.
- **Capabilities**:
  - GPS Point Display: **CONFIRMED & WORKING**.
  - Polygon Display: **NOT IMPLEMENTED**.
  - Polygon Editing: **NOT IMPLEMENTED**.
  - Polygon Storage: **NOT IMPLEMENTED** (Field model stores single latitude and longitude).

---

## 9. Image Storage

- **Implementation**: Handled in `src/app/api/community/upload/route.ts`.
- **Storage Destination**: Local filesystem at `public/uploads/community/`.
- **Fallback**: Automatically converts image buffer to in-memory Base64 data URL (`data:image/...;base64,...`) on serverless platforms (e.g. Vercel) where the local filesystem is read-only.

---

## 10. Existing Reusable Components

- Complete UI Atomic Library (`src/components/ui/`): `Button`, `Card`, `Input`, `Select`, `Badge`, `Dialog`, `Sonner`, `DualText`.
- Navigation & Header: `Navbar.tsx`, `Footer.tsx`, `LanguageSwitcher.tsx`.
- Maps: `FarmMap.tsx` (for picking farm coordinates).
- Products: `AgriProduct.ts` (for chemical remedy lookups).
- Context: `AuthProvider.tsx` (user identity), `WeatherContext.tsx` (live weather feed).

---

## 11. Missing Components

1. **AgriShield `/my-crop` Frontend Dashboard**: Requires replacing the placeholder in `src/app/[locale]/(app)/dashboard/my-crops/page.tsx`.
2. **ICAR 2022–2026 Reference Dataset**: Verified base temperatures, maturity days, and GDD thresholds for MVP crops (Wheat, Rice, Cotton, Groundnut, Soybean).
3. **AgriShield GDD Calculation Engine**: Service to calculate daily GDD and stage transitions.
4. **AgriShield Weather Risk Engine**: Rule evaluation service matching live weather against pest/disease trigger conditions.
5. **Disease Scan Persistence**: MongoDB collection to log user leaf scans against specific crops and fields.

---

## 12. Phase 1 Dependencies

1. **ICAR 2022–2026 Reports Extraction**: Compiling the 5 MVP crop profiles (Wheat, Rice, Cotton, Groundnut, Soybean) into structured JSON.
2. **GDD Data Audit**: Formally auditing whether base temperatures and GDD values are explicitly present or marked `NOT_FOUND_IN_SOURCE`.
3. **Data Conflicts Resolution**: Documenting conflicting recommendations across report years (2022, 2023, 2024, 2025).

---

## 13. Risks & Blockers

| Risk / Blocker | Severity | Mitigation Strategy |
|---|:---:|---|
| **Lack of Historical Weather in DB** | Medium | Use Open-Meteo's free Historical Archive API to backfill daily $T_{max}$ and $T_{min}$ from `sowingDate` to today when calculating GDD. |
| **Missing GDD in ICAR Reports** | High | Strictly follow rule: Write `NOT_FOUND_IN_SOURCE` rather than hallucinating agricultural values. |
| **Disease Severity Not Implemented** | Low | Rely on AI diagnostic confidence score and ICAR weather trigger rules until segmentation severity is exposed. |
| **Modal.com Cold Starts** | Low | `agriVisionService.ts` already implements a 45-second timeout and fallback endpoints to absorb cold starts. |

---

## 14. Phase 0 Audit Verification Checklist

```text
[X] Frontend architecture confirmed
[X] Backend architecture confirmed
[X] Database confirmed
[X] Authentication confirmed
[X] Disease AI confirmed
[X] Weather API confirmed
[X] Map library confirmed
[X] My Crops data model confirmed
[X] Existing reusable APIs documented
[X] Missing components documented
[X] Environment variable names documented
[X] Phase 1 dependencies identified
```

---

## PHASE 0 STATUS:
**COMPLETE**

All technical layers, models, APIs, and dependencies of the existing KisanDost / VentureHack platform have been completely audited and documented without modifying existing business logic. Phase 1 Data Foundation extraction from the ICAR Crop Science reports can now proceed with clear architectural boundaries.
