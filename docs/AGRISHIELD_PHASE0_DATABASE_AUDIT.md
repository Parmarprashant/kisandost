# AgriShield 360° — Phase 0: Database Audit Report

**Audit Date**: September 2026  
**Auditor**: AgriShield 360° Systems Architecture Team  
**Scope**: Complete read-only audit of database technology, schemas, and models in `kisan-dost/ventureHack/kisan-next/src/models`.

---

## 1. Database Technology & Connection Architecture

- **Primary Database Technology**: **MongoDB** (NoSQL Document Store).
- **Object Data Modeling (ODM)**: **Mongoose 9.3.0** (`mongoose.connect(MONGODB_URI)` configured in `src/lib/mongodb.ts`).
- **Resilience Architecture**: Built with an in-memory fallback layer (`src/lib/memoryStore.ts`) that guarantees operations (such as creating and listing fields and crops) never crash if the MongoDB connection is unreachable.
- **Model Registration Pattern**: Standard Mongoose model instantiation pattern `mongoose.models.X || mongoose.model('X', Schema)` preventing Next.js hot-reload model overwrite errors.

---

## 2. Detailed Entity & Model Audit

---

### Entity: Users / Farmers
- **Table/Collection**: `users`
- **File/Model**: `src/models/User.ts`
- **Fields**:
  - `_id`: `ObjectId` (Primary Key)
  - `googleId`: `String` (Optional, unique, sparse)
  - `email`: `String` (Optional, unique, sparse, lowercase, trim)
  - `username`: `String` (Required, unique, trim)
  - `password`: `String` (Optional for Google OAuth users, hashed with bcryptjs)
  - `name`: `String` (Required)
  - `avatar`: `String` (URL)
  - `mobile`: `String`
  - `village`: `String`
  - `district`: `String`
  - `mainCrop`: `String`
  - `createdAt`: `Date`
  - `updatedAt`: `Date`
- **Relationships**: Parent entity. The `_id` (cast to string) is referenced as `farmerId` in `Field`, `Crop`, `FarmerCrop`, `YieldPrediction`, `UserMembership`, `NotificationToken`, and `authorId` in `FarmerPost`.
- **Can AgriShield reuse it**: **YES (100% REUSABLE)**. Represents the farmer identity across the platform.
- **Required modification**: None for existing fields. Optional: Add `defaultFieldId` or default GPS location coordinates.

---

### Entity: My Crops / Fields (Land Parcels)
- **Table/Collection**: `fields`
- **File/Model**: `src/models/Field.ts`
- **Fields**:
  - `_id`: `ObjectId` (Primary Key)
  - `farmerId`: `String` (Required, indexed)
  - `name`: `String` (Required, trim, e.g., "North Acre", "Khet 1")
  - `area`: `Number` (Required, min 0.01)
  - `areaUnit`: `String` (Enum: `['Acre', 'Hectare']`, default `'Acre'`)
  - `location`: Sub-document:
    - `village`: `String`
    - `taluka`: `String`
    - `district`: `String`
    - `state`: `String`
    - `latitude`: `Number` (default `null`)
    - `longitude`: `Number` (default `null`)
  - `soil`: Sub-document:
    - `type`: `String` (e.g. "Black Soil", "Loamy Soil", "Sandy Soil", etc.)
    - `soilTestAvailable`: `Boolean` (default `false`)
    - `pH`: `Number`
    - `nitrogen`: `Number`
    - `phosphorus`: `Number`
    - `potassium`: `Number`
    - `organicCarbon`: `Number`
  - `irrigation`: Sub-document:
    - `method`: `String` (e.g. "Drip", "Sprinkler", "Flood", "Rainfed")
    - `waterSource`: `String` (e.g. "Borewell", "Canal", "River", etc.)
    - `frequency`: `String`
  - `previousCrop`: `String` (default `'None'`)
  - `createdAt`: `Date`
  - `updatedAt`: `Date`
- **Relationships**: Belongs to `User` (`farmerId`). Has many `Crop` documents (`Crop.fieldId == Field._id`).
- **Can AgriShield reuse it**: **YES (CRUCIAL REUSE)**. This model is already perfectly structured for AgriShield farm registration.
- **Required modification**: 
  1. Add optional `polygonCoordinates` array (`[{ lat: Number, lng: Number }]` or GeoJSON `Polygon`) for field boundary mapping.

---

### Entity: Active Field Crops (Crop Cycle Instance)
- **Table/Collection**: `crops`
- **File/Model**: `src/models/Crop.ts`
- **Fields**:
  - `_id`: `ObjectId` (Primary Key)
  - `farmerId`: `String` (Required, indexed)
  - `fieldId`: `ObjectId` (Required, ref: `'Field'`, indexed)
  - `cropName`: `String` (Required, trim, e.g. "Wheat", "Rice", "Cotton")
  - `cropMasterId`: `String` (Optional reference to CropMaster)
  - `variety`: `String` (e.g. "HD 2967", "GW 322")
  - `sowingDate`: `Date` (Required)
  - `cultivatedArea`: `Number` (Required, validated <= Field.area)
  - `cultivatedAreaUnit`: `String` (Enum: `['Acre', 'Hectare']`)
  - `cultivationMethod`: `String` (Enum: `['Direct Sowing', 'Transplanting', 'Nursery → Transplanting', 'Other']`)
  - `status`: `String` (Enum: `['Active', 'Harvested', 'Removed']`, default `'Active'`)
  - `notes`: `String`
  - `createdAt`: `Date`
  - `updatedAt`: `Date`
- **Relationships**: Child of `Field` (`fieldId`) and `User` (`farmerId`). Can reference `CropMaster`.
- **Can AgriShield reuse it**: **YES (PRIMARY AGRISHIELD CYCLE ENTITY)**.
- **Required modification**: Extend schema for AgriShield monitoring:
  - `baseTemperature`: `Number` (from ICAR Phase 1 master)
  - `gddToMaturity`: `Number` (from ICAR Phase 1 master)
  - `accumulatedGdd`: `Number` (running sum calculated by GDD engine, default 0)
  - `currentGrowthStage`: `String` (current ICAR growth stage name)
  - `currentGrowthStageOrder`: `Number`
  - `expectedHarvestDate`: `Date`
  - `lastWeatherSyncAt`: `Date`

---

### Entity: Crop Master & Varieties (Reference Catalog)
- **Table/Collection**: `cropmasters`
- **File/Model**: `src/models/CropMaster.ts`
- **Fields**:
  - `_id`: `ObjectId` (Primary Key)
  - `cropName`: `String` (Required, unique, trim)
  - `varieties`: `[String]` (Array of variety name strings)
  - `active`: `Boolean` (default `true`)
  - `createdAt`: `Date`
  - `updatedAt`: `Date`
- **Relationships**: Referenced by `Crop.cropMasterId`.
- **Can AgriShield reuse it**: **REUSE AND UPGRADE**.
- **Required modification**: The existing model is flat (contains only string names). Must be upgraded to support structured variety entities with ICAR parameters (maturity days min/max, base temperature, GDD, region, disease resistance).

---

### Entity: Farmer Crop (Legacy SMS Subscription Model)
- **Table/Collection**: `farmercrops`
- **File/Model**: `src/models/FarmerCrop.ts`
- **Fields**:
  - `_id`: `ObjectId`
  - `farmerId`: `String` (Indexed)
  - `cropType`: `String`
  - `plantationDate`: `Date`
  - `landArea`: `Number`
  - `location`: `String`
  - `phoneNumber`: `String`
  - `lastAdvisorySent`: `String`
  - `initialAdvisorySent`: `Boolean`
  - `createdAt`, `updatedAt`: `Date`
- **Relationships**: Belongs to `User`.
- **Can AgriShield reuse it**: **NO (LEGACY)**. Replaced by the relational `Field` and `Crop` architecture.

---

### Entity: Weather
- **Table/Collection**: `NONE`
- **File/Model**: **NOT_IMPLEMENTED**
- **Fields**: None. Weather is fetched on-the-fly and cached in memory.
- **Relationships**: N/A
- **Can AgriShield reuse it**: **NOT_IMPLEMENTED**.
- **Required modification**: AgriShield requires daily temperature and weather logging to compute GDD and detect pest/disease risk conditions. A new `DailyWeatherLog` or `CropWeatherLog` collection will be needed in Phase 2.

---

### Entity: Disease Scans (User Scan History)
- **Table/Collection**: `NONE` (for user foliar disease scans)
- **File/Model**: **NOT_IMPLEMENTED**. (Note: `src/models/ScanHistory.ts` exists, but is strictly for pesticide anti-counterfeiting QR scans with fields `userId`, `qrCodeId`, `result: 'genuine'|'fake'|'notfound'`).
- **Fields**: N/A
- **Relationships**: N/A
- **Can AgriShield reuse it**: **NOT_IMPLEMENTED**.
- **Required modification**: A new collection `CropDiseaseScan` is needed to store: `cropId`, `fieldId`, `farmerId`, `imageUrl`, `detectedDisease`, `confidence`, `severityPercent`, `symptoms`, `recommendedActions`, `scanDate`.

---

### Entity: Crop Disease Encyclopedia (Reference Catalog)
- **Table/Collection**: `cropdiseases`
- **File/Model**: `src/models/CropDisease.ts`
- **Fields**:
  - `_id`: `ObjectId`
  - `cropName`: `String` (Required, lowercase, indexed)
  - `diseaseName`: `String` (Required, trim)
  - `description`: `String` (Required)
  - `symptoms`: `[String]`
  - `precautions`: `[String]`
  - `recommendedPesticides`: `[{ name: String, productId: String }]`
  - `recommendedFertilizers`: `[{ name: String, productId: String }]`
  - `createdAt`, `updatedAt`: `Date`
- **Relationships**: Links to `AgriProduct.productId`.
- **Can AgriShield reuse it**: **YES (EXCELLENT REFERENCE BASE)**.
- **Required modification**: Add fields for ICAR favorable weather conditions (`favorableTempMin`, `favorableTempMax`, `favorableHumidityMin`, `favorableRainfallCondition`, `vulnerableStages`).

---

### Entity: Products (Marketplace / Treatment Products)
- **Table/Collection**: `agriproducts`
- **File/Model**: `src/models/AgriProduct.ts`
- **Fields**:
  - `_id`: `ObjectId`
  - `productId`: `String` (Unique, indexed)
  - `productName`: `String`
  - `category`: `String` (`'pesticide' | 'fertilizer'`)
  - `price`: `Number`
  - `brand`: `String`
  - `description`: `String`
  - `usage`: `String`
  - `stock`: `Number`
  - `imageUrl`: `String`
- **Relationships**: Matched in `/api/detect-disease` and referenced in `CropDisease`.
- **Can AgriShield reuse it**: **YES (100% REUSABLE)** for treatment recommendations.

---

### Entity: Community (Farmer Posts & Discussions)
- **Table/Collection**: `farmerposts`, `communitycomments`, `communityreports`
- **File/Model**: `src/models/FarmerPost.ts`, `src/models/CommunityComment.ts`, `src/models/CommunityReport.ts`
- **Fields**:
  - `_id`: `ObjectId`
  - `authorId`: `ObjectId` (ref: `'User'`)
  - `authorName`: `String`
  - `postType`: `String` (`'Farmer Experience'`, `'Crop Problem'`, `'Ask Farmers'`, `'Success Story'`, `'Prevention Tip'`)
  - `crop`: `String`
  - `cropStage`: `String`
  - `location`: `{ state: String, district: String }`
  - `title`: `String`, `problem`: `String`
  - `symptoms`: `[String]`, `images`: `[String]`
  - `helpfulCount`: `Number`, `commentCount`: `Number`
- **Relationships**: Author links to `User`.
- **Can AgriShield reuse it**: **YES (100% REUSABLE)** for peer advisory sharing.

---

## 3. Database Summary Table

| Entity Name | Collection Name | Exists in Codebase | Reusable for AgriShield | Migration Needed |
|---|---|---|---|---|
| Farmers / Users | `users` | **YES** | **YES** | None |
| Land Parcels / Fields | `fields` | **YES** | **YES** | Optional polygon field |
| Cultivated Crops | `crops` | **YES** | **YES** | Add GDD & Stage tracking fields |
| Crop Master Catalog | `cropmasters` | **YES** | **YES** | Populate with ICAR Phase 1 data |
| Crop Disease Catalog | `cropdiseases` | **YES** | **YES** | Add weather triggers |
| Agro Products | `agriproducts` | **YES** | **YES** | None |
| Community Discussions | `farmerposts` | **YES** | **YES** | None |
| Weather Historical Logs | `weather_logs` | **NO (NOT IMPLEMENTED)** | **NO** | New collection required |
| Foliar Disease Scans | `disease_scans` | **NO (NOT IMPLEMENTED)** | **NO** | New collection required |
| Growth Stage Catalog | `growth_stages` | **NO (NOT IMPLEMENTED)** | **NO** | New collection required from ICAR |
