# KisanDost Existing Database Architecture Audit

**Module:** AgriShield 360° / My Crop  
**Audit Target:** `kisan-dost/ventureHack/kisan-next/`  
**Date:** September 2026  
**Auditor:** AgriShield Data Architecture Team  

---

## 1. Executive Summary & Objective

Before introducing database schemas or data models for **AgriShield 360°** and the **My Crop** module, this audit provides a comprehensive, non-invasive architectural analysis of the existing KisanDost database layer.

The existing KisanDost platform uses **MongoDB** managed via **Mongoose** inside a Next.js (App Router) environment. It features existing user authentication, farm fields, planted crops, legacy SMS crop advisories, and diagnostic proxies.

---

## 2. Core Architectural Findings & Questions Addressed

### 2.1 Current Field Schema (`src/models/Field.ts`)
- **Collection Name:** `fields` (Model: `Field`)
- **Key Fields:**
  - `farmerId` (`String`, required, indexed): Holds the hex string representation of the authenticated user's `User._id`.
  - `name` (`String`, required, trimmed): Farm/plot display name (e.g., "North Acre", "Home Farm").
  - `area` (`Number`, required, min: 0.01): Total area.
  - `areaUnit` (`String`, enum: `['Acre', 'Hectare']`, default: `'Acre'`).
  - `location` (Embedded Subdocument):
    - `village`: `String`
    - `taluka`: `String`
    - `district`: `String`
    - `state`: `String`
    - `latitude`: `Number` (Centroid point)
    - `longitude`: `Number` (Centroid point)
  - `soil` (Embedded Subdocument): `type`, `soilTestAvailable`, `pH`, `nitrogen`, `phosphorus`, `potassium`, `organicCarbon`.
  - `irrigation` (Embedded Subdocument): `method`, `waterSource`, `frequency`.
  - `previousCrop`: `String` (e.g. "Cotton", "None").
  - `timestamps`: `createdAt`, `updatedAt`.
- **Architectural Observation:** The existing `Field` model represents a farmer's plot with a single point coordinate (`latitude`, `longitude`). It does NOT support GeoJSON polygon boundaries or subdivided monitoring micro-zones.

---

### 2.2 Current Crop Schemas (`src/models/Crop.ts`, `FarmerCrop.ts`, `CropMaster.ts`)
The codebase currently contains three distinct crop-related models with distinct scopes:

1. **`src/models/Crop.ts` (Planted Crop / Crop Instance):**
   - Represents a farmer's planted crop situated on a specific `Field`.
   - Fields:
     - `farmerId`: `String` (indexed)
     - `fieldId`: `Schema.Types.ObjectId`, ref: `'Field'` (indexed)
     - `cropName`: `String` (e.g. "Wheat")
     - `cropMasterId`: `String` (optional legacy reference)
     - `variety`: `String` (free-text string, e.g. "HD 2967")
     - `sowingDate`: `Date` (required)
     - `cultivatedArea`: `Number` (validated to not exceed `Field.area`)
     - `cultivatedAreaUnit`: `'Acre' | 'Hectare'`
     - `cultivationMethod`: `'Direct Sowing' | 'Transplanting' | 'Nursery → Transplanting' | 'Other'`
     - `status`: `'Active' | 'Harvested' | 'Removed'`
     - `notes`: `String`
     - `timestamps`: `createdAt`, `updatedAt`

2. **`src/models/FarmerCrop.ts` (Legacy SMS Advisory Model):**
   - Lightweight model created for phone-based cron advisories: `farmerId`, `cropType`, `plantationDate`, `landArea`, `location`, `phoneNumber`, `lastAdvisorySent`, `initialAdvisorySent`.

3. **`src/models/CropMaster.ts` (Rudimentary Master List):**
   - Simple dictionary: `{ cropName: String (unique), varieties: [String], active: Boolean }`.
   - Auto-seeded with 11 hardcoded static crops (Cotton, Wheat, Rice, Groundnut, Maize, Soybean, Tomato, Potato, Onion, Sugarcane, Mango) with simple string arrays of varieties.
   - Contains NO agronomic metadata, zero maturity days, zero regional zones, zero resistance data, and zero breeding lineage.

---

### 2.3 User / Farmer Representation (`src/models/User.ts` & `src/lib/auth.ts`)
- **Model:** `User` in `src/models/User.ts` with fields `_id`, `username`, `email`, `password`, `googleId`, `name`, `mobile`, `village`, `district`, `mainCrop`.
- **Auth Session:** Uses JWT stored in HTTP-only cookie `__kisan_auth_token` (`src/lib/auth.ts`).
- **Session Resolution:** `auth()` returns `{ userId: session.userId as string }`, where `userId` is the string representation of `User._id`.
- **Foreign Key Convention:** In `Field.ts`, `Crop.ts`, and `FarmerCrop.ts`, the reference to the farmer is stored as `farmerId: { type: String, required: true, index: true }`.

---

### 2.4 Relationship Between Field and Crop
- **Cardinality:** 1-to-Many (`1 Field -> N Crops`).
- **Referential Integrity:** `Crop.fieldId` is an `ObjectId` with `ref: 'Field'`.
- **Validation:** When creating a crop via `POST /api/fields/[id]/crops`, the API checks that `crop.cultivatedArea <= field.area`.
- **Query Pattern:** In `GET /api/fields`, fields are retrieved first, then all crops matching `{ fieldId: { $in: fieldIds } }` are fetched and joined in memory before returning to the frontend.

---

### 2.5 Mongoose Schema Patterns & Modeling Conventions
- All models use standard Mongoose schemas (`Schema`, `model`, `Document`).
- **Next.js Model Compilation Cache Guard:** Models prevent re-compilation errors using:
  ```typescript
  export const ModelName = mongoose.models.ModelName || mongoose.model<IInterface>('ModelName', Schema);
  ```
  or by purging the model cache on hot-reload:
  ```typescript
  if (mongoose.models.Field) delete mongoose.models.Field;
  export const Field = mongoose.model<IField>('Field', FieldSchema);
  ```
- **Timestamps:** Standard `{ timestamps: true }` generating `createdAt` and `updatedAt`.
- **String Types:** All IDs referencing users use `String` rather than `ObjectId` for seamless compatibility with Clerk/JWT tokens.

---

### 2.6 Location of Models & Architecture
- All schemas and TypeScript interfaces reside in: `kisan-dost/ventureHack/kisan-next/src/models/`.
- Auxiliary helpers and utilities reside in: `kisan-dost/ventureHack/kisan-next/src/lib/`.
- API endpoints reside in: `kisan-dost/ventureHack/kisan-next/src/app/api/`.

---

### 2.7 API Route Organization
- Follows Next.js 15 App Router structure: `src/app/api/[resource]/route.ts` and `src/app/api/[resource]/[id]/route.ts`.
- Standard handler signatures: `export async function GET(req: Request, { params }: ...)` and `export async function POST(req: Request)`.
- Authentication verification is executed at the top of protected handlers via:
  ```typescript
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  ```
- Graceful fallbacks: If MongoDB fails, several routes provide memory store fallbacks (`src/lib/memoryStore.ts`) to avoid crashing in offline development modes.

---

### 2.8 MongoDB Connection Architecture (`src/lib/mongodb.ts`)
- Centralized singleton connection in `src/lib/mongodb.ts`.
- Uses `global.mongoose` caching to survive Next.js Fast Refresh cycles.
- Features a custom Windows DNS fallback for Node.js c-ares (`1.1.1.1`, `8.8.8.8`) to prevent `querySrv ECONNREFUSED` issues with MongoDB Atlas `+srv` connection strings.
- Uses `MONGODB_URI` environment variable from `.env.local`.

---

### 2.9 Existing Fields Safe for Reuse
- `User._id` (string) as farmer identity anchor.
- `Field._id`, `Field.name`, `Field.area`, `Field.areaUnit`, `Field.location` (centroid coordinates).
- `Crop._id`, `Crop.fieldId`, `Crop.cropName`, `Crop.variety`, `Crop.sowingDate`, `Crop.cultivatedArea`, `Crop.status`.
- Weather API response format in `src/app/api/weather/route.ts` (`current.temp_c`, `current.humidity`, `current.precip_mm`, `current.wind_kph`, daily forecasts).

---

### 2.10 Fields & Concepts That Must NOT Be Duplicated
1. **DO NOT Overwrite `Crop.ts`:**
   - The existing `Crop.ts` represents a farmer's planted crop instance (runtime crop cycle).
   - The new agricultural master dataset must be named **`IcarCrop`** (or `CropMasterData`), NOT `Crop`.
2. **DO NOT Overwrite `ScanHistory.ts`:**
   - The existing `ScanHistory.ts` is explicitly built for agrochemical QR verification (`result: 'genuine' | 'fake' | 'notfound'`).
   - The crop disease scan persistence model must be named **`CropDiseaseScan`**.
3. **DO NOT Replace `Field` Abruptly:**
   - The existing `Field` model is heavily integrated with the frontend UI.
   - For AgriShield, we extend plot capability by introducing **`FarmZone`** (or geospatial polygons) that directly reference `fieldId: { type: Schema.Types.ObjectId, ref: 'Field' }`.
4. **DO NOT Fabricate GDD / Severity:**
   - All GDD fields in the schema MUST be `null` by default.
   - Disease scan severity MUST be `null` by default because AgriVision does not provide a validated clinical severity index.

---

## 3. AgriShield Architectural Fit & Naming Plan

```
EXISTING SYSTEM                          AGRISHIELD 360° ADDITIONS
═══════════════                          ═════════════════════════
User (Farmer Identity) ───────────────┬─► (Unchanged, references farmerId)
                                      │
Field (Farmer Plot & Centroid) ───────┼─► FarmZone (Plot Subdivisions & Micro-Zones)
                                      │
Crop (Farmer Planted Crop) ───────────┼─► CropCycle (Enriched lifecycle wrapper / state)
                                      │
                                      ├─► IcarCrop (Botanical master reference)
                                      ├─► IcarVariety (654 ICAR verified cultivars)
                                      ├─► CropGrowthStage (19 source-grounded milestones)
                                      ├─► PestDiseaseReference (1,503 pathogen records)
                                      └─► WeatherConditionReference (227 weather triggers)
                                      │
AgriVision (POST /api/v1/diagnose) ───┼─► CropDiseaseScan (Persists scans & metadata)
Weather API (OpenMeteo / WeatherAPI) ─┼─► WeatherObservation (Persists localized weather)
                                      │
                                      ├─► GddLog (Future GDD accumulator structure)
                                      ├─► ScanRequest (Adaptive scouting triggers)
                                      └─► RiskEvent (STABLE / ATTENTION / HIGH_RISK)
```

---

## 4. Conclusion & Audit Sign-Off
The existing KisanDost architecture is cleanly separated, uses consistent Mongoose patterns, and provides clear integration hooks. AgriShield 360° master models (Category A) and runtime models (Category B) can be introduced additively with **zero breaking changes** to existing APIs or models.
