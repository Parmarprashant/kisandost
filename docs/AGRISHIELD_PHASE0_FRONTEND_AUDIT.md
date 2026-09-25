# AgriShield 360° — Phase 0: Frontend Audit Report

**Audit Date**: September 2026  
**Auditor**: AgriShield 360° Systems Architecture Team  
**Scope**: Complete read-only inspection of `kisan-dost/ventureHack/kisan-next` and `kisan_app` codebases.

---

## 1. Executive Summary & Framework Overview

The KisanDost / VentureHack platform contains two frontend implementations:
1. **Primary Production Frontend (`kisan-next`)**: A high-performance multilingual Progressive Web App (PWA) built on **Next.js 15.5.14** and **React 19.2.3** utilizing the App Router architecture, Tailwind CSS v4, Framer Motion, and Leaflet GIS maps.
2. **Mobile Prototype Frontend (`kisan_app`)**: A cross-platform mobile client written in **Flutter (Dart SDK ^3.13.3)** utilizing Riverpod, GoRouter, Dio, and cached network imaging, designed to consume the Next.js API endpoints (`/api/*`).

### Dependency & Framework Inventory

| Layer / Technology | Next.js Web App (`kisan-next`) | Flutter App (`kisan_app`) |
|---|---|---|
| **Core Framework** | Next.js 15.5.14 (React 19.2.3, React-DOM 19.2.3) | Flutter 3.x (Dart SDK ^3.13.3) |
| **Routing System** | Next.js App Router with `next-intl` (v4.8.3) localized segments (`/[locale]/...`) | `go_router` (v18.0.1) with `ShellRoute` 5-tab scaffold |
| **Styling & Animation** | Tailwind CSS v4 (`@tailwindcss/postcss`), Framer Motion (v12.36.0), `tw-animate-css` | Flutter Material 3 (`ThemeData`, `AppColors`) |
| **UI Component Library** | Shadcn UI / Radix primitives (`@base-ui/react` v1.3.0, `lucide-react` v0.577.0) | Flutter Material & Cupertino Icons |
| **State Management** | React Context (`WeatherContext`, `AuthProvider`) + Component State | `flutter_riverpod` (v3.4.3) |
| **API / Networking** | Native `fetch` with Next.js revalidation cache | `dio` (v5.11.1) with custom `ApiException` wrapper |
| **GIS / Mapping** | `leaflet` (v1.9.4) & `react-leaflet` (v5.0.0) | `geolocator` (v14.0.3), `geocoding` (v5.0.0) |
| **Internationalization** | `next-intl` (English `en`, Hindi `hi`, Gujarati `gu`, Marathi `mr`) | Flutter `intl` (v0.20.3) + `.arb` localizations (`app_*.arb`) |
| **Charts & Data Viz** | `recharts` (v3.8.0) | `fl_chart` (v1.2.0) |
| **Notifications & Toast** | `sonner` (v2.0.7), Firebase Messaging (FCM v12.11.0) | Not implemented in mobile UI |
| **Camera & Media** | Native browser `<input type="file" accept="image/*" capture>` | `image_picker` (v1.2.3), `flutter_image_compress` (v2.5.1) |

---

## 2. Complete Route & Screen Inventory

### A. Next.js Web / PWA Routes (`kisan-dost/ventureHack/kisan-next/src/app`)

| Route Path | File Location | Screen / Component Name | Implementation State | Purpose |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` | Root redirect | **Working** | Redirects to default locale (`/en`, `/hi`, etc.) |
| `/[locale]` | `src/app/[locale]/page.tsx` | LandingPage | **Working** | Public marketing showcase, hero section, features |
| `/[locale]/auth` | `src/app/[locale]/auth/page.tsx` | AuthPage (`AuthContent`) | **Working** | Farmer Sign-in, Sign-up, Demo login, Google OAuth redirect, language selection |
| `/[locale]/onboarding` | `src/app/[locale]/onboarding/page.tsx` | OnboardingPage | **Working** | Post-signup profile collection (district, mobile, village, main crop) |
| `/[locale]/crop-suggestion` | `src/app/[locale]/crop-suggestion/page.tsx` | CropSuggestionPage | **Working** | AI-driven crop suggestions based on district, season, and soil |
| `/[locale]/dashboard` | `src/app/[locale]/(app)/dashboard/page.tsx` | DashboardPage | **Working** | Farmer command center: NDVI meter, weather widget, alerts, quick tools |
| `/[locale]/dashboard/my-crops` | `src/app/[locale]/(app)/dashboard/my-crops/page.tsx` | MyCropsPage | **STUB / PLACEHOLDER** | Shows *"This section is currently under maintenance."* |
| `/[locale]/dashboard/add-crop` | `src/app/[locale]/(app)/dashboard/add-crop/page.tsx` | AddCropPage | **Working (Partial)** | Form to submit crop to `/api/farmer-crops` for SMS alerts |
| `/[locale]/dashboard/disease-detector` | `src/app/[locale]/(app)/dashboard/disease-detector/page.tsx` | DiseaseDetectorPage | **Working** | Drag-and-drop/camera image upload, calls `/api/detect-disease`, renders AI diagnosis |
| `/[locale]/dashboard/pesticide-scanner` | `src/app/[locale]/(app)/dashboard/pesticide-scanner/page.tsx` | PesticideScannerPage | **Working** | QR camera scanner via `html5-qrcode` to verify chemical authenticity |
| `/[locale]/dashboard/profit-predictor` | `src/app/[locale]/(app)/dashboard/profit-predictor/page.tsx` | ProfitPredictorPage | **Working** | Revenue vs expense profit calculation and Recharts breakdown |
| `/[locale]/dashboard/yield-predictor` | `src/app/[locale]/(app)/dashboard/yield-predictor/page.tsx` | YieldPredictorPage | **Working** | Satellite Leaflet farm map + Python ML yield predictor form |
| `/[locale]/diseases` | `src/app/[locale]/(app)/diseases/page.tsx` | DiseasesPage | **Working** | 29-crop encyclopedia of foliar symptoms, causes, and chemical controls |
| `/[locale]/fertilizer-calculator` | `src/app/[locale]/(app)/fertilizer-calculator/page.tsx` | FertilizerCalculatorPage | **Working** | NPK soil requirement & Urea/DAP/MOP bag conversion tool |
| `/[locale]/weather` | `src/app/[locale]/(app)/weather/page.tsx` | WeatherPage | **Working** | 5-day forecast, hourly timeline, agricultural sprays & heat warnings |
| `/[locale]/communities` | `src/app/[locale]/(app)/communities/page.tsx` | CommunitiesPage | **Working** | Farmer peer-to-peer discussion board, problems, experiences, solutions |
| `/[locale]/marketplace/product/[productId]` | `src/app/[locale]/(app)/marketplace/product/[productId]/page.tsx` | ProductDetailPage | **Working** | Agro-chemical product view with vendor price and purchase inquiry |
| `/[locale]/products` | `src/app/[locale]/(app)/products/page.tsx` | ProductsListingPage | **Working** | Catalog of certified fertilizers and pesticides |
| `/[locale]/products/[id]` | `src/app/[locale]/(app)/products/[id]/page.tsx` | ProductSinglePage | **Working** | Alternate product detail view |
| `/[locale]/pricing` | `src/app/[locale]/(app)/pricing/page.tsx` | PricingPage | **Working** | Free tier vs Premium Farmer Club tier comparison |
| `/[locale]/tools` | `src/app/[locale]/(app)/tools/page.tsx` | ToolsDirectoryPage | **Working** | Grid directory of all available agricultural calculators and utilities |

### B. Flutter Mobile Routes (`kisan_app/lib/app/router.dart`)

| Route Path | File Location | Screen / Component Name | Implementation State | Purpose |
|---|---|---|---|---|
| `/home` | `lib/features/home/home_screen.dart` | `HomeScreen` | **Working** | Mobile home screen: Live WeatherCard, language switcher sheet, quick actions |
| `/farm` | `lib/features/shared/placeholder_screen.dart` | `PlaceholderScreen` | **STUB** | Labeled: *"P0-7 — fields, crops, add-field wizard"* |
| `/diagnose` | `lib/features/shared/placeholder_screen.dart` | `PlaceholderScreen` | **STUB** | Labeled: *"P0-4 — camera → AgriVision → diagnosis"* |
| `/insights` | `lib/features/shared/placeholder_screen.dart` | `PlaceholderScreen` | **STUB** | Labeled: *"P0-6 mandi prices · P1-1/P1-2 predictors"* |
| `/more` | `lib/features/shared/placeholder_screen.dart` | `PlaceholderScreen` | **STUB** | Labeled: *"P0-9 community · P1-4 schemes · P1-5 products"* |

---

## 3. Feature-by-Feature Deep Audit

### Feature: Authentication Screen & Session Provider
- **File**: `kisan-dost/ventureHack/kisan-next/src/app/[locale]/auth/page.tsx` & `src/components/providers/AuthProvider.tsx`
- **Purpose**: Provides credentials-based registration (Full Name, Username/Mobile, Password, Main Crop) and login, one-click demo farmer login (`demo_farmer`), and Google OAuth continuation. Wraps entire client tree with `AuthProvider` which maintains `user` state and provides `login()`, `logout()`, and `checkSession()` via `/api/auth/me`.
- **Reusable for AgriShield**: **YES (100% REUSABLE)**. The authenticated farmer `user.id` is available globally in client context and securely stored in HTTP-only cookie `__kisan_auth_token`.
- **What must change**: Ensure that when entering the AgriShield module or `/dashboard/my-crops`, unauthenticated users are smoothly redirected to `/[locale]/auth`.
- **Dependencies**: `@/components/providers/AuthProvider`, `jose`, `bcryptjs`, `next/navigation`, `lucide-react`.

---

### Feature: My Crops Page
- **File**: `kisan-dost/ventureHack/kisan-next/src/app/[locale]/(app)/dashboard/my-crops/page.tsx`
- **Purpose**: Designated destination for farmers to monitor active field crops, growth progress, and lifecycle advisories.
- **Reusable for AgriShield**: **YES (PRIMARY HOST TARGET FOR AGRISHIELD 360°)**.
- **What must change**: The current file is an empty placeholder containing only a Sprout icon and the text *"This section is currently under maintenance."* It must be replaced with the comprehensive AgriShield 360° interface:
  1. Active farm field selector
  2. Registered crop overview (Wheat, Rice, Cotton, Groundnut, Soybean)
  3. GDD accumulation and growth-stage progress bar
  4. Real-time weather trigger alerts (heat/humidity/drought risk)
  5. One-click link to add field/crop and run diagnosis.
- **Dependencies**: `next-intl`, `@/components/ui/card`, `@/components/ui/button`, `lucide-react`.

---

### Feature: Add Crop Form
- **File**: `kisan-dost/ventureHack/kisan-next/src/app/[locale]/(app)/dashboard/add-crop/page.tsx`
- **Purpose**: Collects single crop enrollment: Crop Type (`cotton`, `wheat`, `rice`, `sugarcane`, `soybean`), Plantation Date, Land Area (Acres), Farm Location, and Phone Number for SMS advisory.
- **Reusable for AgriShield**: **PARTIAL (REQUIRES EXTENSION)**.
- **What must change**: 
  1. Currently hardcoded to 5 simple lowercase strings without variety selection.
  2. Submits to `/api/farmer-crops` (which is a stub) rather than the relational `/api/fields/[id]/crops` or new AgriShield schema.
  3. Must add **Variety Selection** populated from Phase 1 ICAR Master dataset.
  4. Must support sowing date, cultivation method, and association with a specific field.
- **Dependencies**: `@/components/ui/select`, `@/components/ui/input`, `@/components/ui/card`, `sonner`.

---

### Feature: Disease Detector Interface
- **File**: `kisan-dost/ventureHack/kisan-next/src/app/[locale]/(app)/dashboard/disease-detector/page.tsx`
- **Purpose**: Drag-and-drop file upload and camera capture for crop foliage. Submits `multipart/form-data` with key `file` to `/api/detect-disease` (which connects to AgriVision AI on Modal/FastAPI). Displays crop name, disease name, confidence badge, botanical symptoms, causes, precautions, and recommended products.
- **Reusable for AgriShield**: **YES (HIGHLY REUSABLE)**.
- **What must change**:
  1. Currently stores results only in local component state (`useState(null)`). It does **not** persist scan records to a database table or link them to a farmer's registered crop or field.
  2. AgriShield Risk Engine needs disease scans to be logged against the active `crop_id` and `field_id`.
  3. Add severity score display once segmentation/severity is exposed.
- **Dependencies**: `/api/detect-disease`, `@/lib/agriVisionService`, `lucide-react`, `sonner`.

---

### Feature: Weather Dashboard & Context
- **File**: `kisan-dost/ventureHack/kisan-next/src/app/[locale]/(app)/weather/page.tsx` & `src/context/WeatherContext.tsx`
- **Purpose**: Client context fetches weather from `/api/weather?q=...` based on geolocation or user search. The page displays current temperature, humidity, wind, UV index, cloud cover, 5-day forecast, spray suitability, and fungal risk alerts.
- **Reusable for AgriShield**: **YES (HIGHLY REUSABLE)**.
- **What must change**:
  1. Weather data is currently ephemeral (stored in memory/session context only).
  2. AgriShield GDD Engine requires daily maximum and minimum temperatures ($T_{max}$, $T_{min}$) to compute $\text{GDD} = \max(0, \frac{T_{max} + T_{min}}{2} - T_{base})$.
  3. The daily forecast in `WeatherContext` already captures `maxtemp_c` and `mintemp_c` from WeatherAPI/Open-Meteo, which can feed directly into the AgriShield GDD calculator.
- **Dependencies**: `/api/weather`, `@/context/WeatherContext`, `lucide-react`.

---

### Feature: Map & GIS Components
- **File**: `kisan-dost/ventureHack/kisan-next/src/components/farmer-tools/FarmMap.tsx` & `AIMapComponent.tsx`
- **Purpose**: Render an interactive Leaflet map using Google Hybrid satellite tiles (`https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}`). Allows clicking to place a single location pin (`Marker`) and triggers `onLocationSelect(lat, lon)`.
- **Reusable for AgriShield**: **PARTIAL (REUSABLE FOR POINT LOCATION, NEEDS EXTENSION FOR POLYGONS)**.
- **What must change**:
  1. Currently only supports a single GPS point (`[lat, lon]`).
  2. Field boundary polygons (`Polygon` / `GeoJSON`) are **not implemented**.
  3. Must add `react-leaflet` polygon drawing/display utilities if farm boundary tracing is required.
- **Dependencies**: `leaflet`, `react-leaflet`, `leaflet/dist/leaflet.css`.

---

### Feature: Disease Encyclopedia
- **File**: `kisan-dost/ventureHack/kisan-next/src/app/[locale]/(app)/diseases/page.tsx`
- **Purpose**: Searchable, filterable encyclopedia containing 29 crops and 100+ disease profiles sourced from `src/data/crop-diseases.ts`.
- **Reusable for AgriShield**: **YES (VALUABLE REFERENCE DATA)**.
- **What must change**: Align disease terminology and favorable weather triggers with the ICAR Crop Science reference dataset extracted in Phase 1.
- **Dependencies**: `src/data/crop-diseases.ts`, `lucide-react`, `next-intl`.

---

### Feature: Yield & Profit Predictor Forms
- **File**: `kisan-dost/ventureHack/kisan-next/src/components/farmer-tools/YieldPredictorForm.tsx` & `ProfitPredictorForm.tsx`
- **Purpose**: Multi-step wizard collecting crop, soil type, irrigation type, farm size, NDVI, moisture, and rainfall. Submits to `/api/yield-prediction` which proxies to the Python AI service.
- **Reusable for AgriShield**: **YES (BENCHMARK & FUTURE HARVEST ENGINE)**.
- **What must change**: Can feed AgriShield's Stage-based harvest prediction engine.
- **Dependencies**: `recharts`, `lucide-react`, `FarmMap.tsx`.

---

### Feature: Reusable UI Component Library (`src/components/ui/`)
- **File**: `kisan-dost/ventureHack/kisan-next/src/components/ui/*`
- **Purpose**: Provides atomic UI primitives:
  - `Button` (`button.tsx`): Variants (default, destructive, outline, secondary, ghost, link) with loading state support.
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` (`card.tsx`): Consistent container styling.
  - `Input` (`input.tsx`): Clean text, numeric, date, and tel inputs.
  - `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` (`select.tsx`): Accessible custom dropdowns.
  - `Badge` (`badge.tsx`): Status indicator tags.
  - `Dialog` (`dialog.tsx`): Accessible modals.
  - `Skeleton` (`skeleton.tsx`): Animated pulse placeholders during data fetching.
  - `Sonner` (`sonner.tsx`): Modern toast notification system.
  - `DualText` (`DualText.tsx`): Helper component displaying bilingual labels (English + vernacular).
- **Reusable for AgriShield**: **YES (100% REUSABLE)**.
- **What must change**: None. AgriShield UI can be assembled cleanly using these exact components.
- **Dependencies**: `clsx`, `tailwind-merge`, `class-variance-authority`.
