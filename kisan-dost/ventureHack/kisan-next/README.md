# KisanDost - Digital Companion for Indian Farmers

KisanDost is a professional, multilingual Progressive Web App (PWA) designed to empower small and medium-scale farmers in India. It provides precision agriculture tools, real-time weather advisories, expert disease management, and an advanced AI Profit Intelligence system.

---

## 🚀 Core Features & Implementation

### 1. Unified Authentication & User Syncing
- **Provider**: [Clerk](https://clerk.com/) (Google OAuth).
- **Implementation**: We use Clerk for secure, passwordless login. 
- **Data Sync**: A specialized **Webhook Architecture** (`/api/webhooks/clerk`) listens for `user.created` events. When a farmer signs up, their profile is automatically mirrored into our **MongoDB** database, allowing us to attach farm-specific data (Mobile, Village, Primary Crop) to their account during the onboarding flow.

### 2. Multi-Language Support (i18n)
- **Framework**: `next-intl` (App Router).
- **Supported Languages**: English (EN), Hindi (HI), Gujarati (GU).
- **Logic**: All UI strings and even deeply nested crop/disease data are extracted into JSON translation files (`/messages/*.json`). The app uses the URL locale (e.g., `/hi/diseases`) to dynamically switch namespaces, ensuring a comfortable experience for farmers in their native language.

### 3. AI-Powered Fertilizer Calculator
- **Purpose**: Prevents over-fertilization, saves costs, and optimizes yield.
- **Calculation Logic**:
    - **Base Requirement**: Each crop (Wheat, Rice, etc.) has a standard N-P-K (Nitrogen, Phosphorus, Potassium) requirement per acre stored in `src/data/fertilizers.ts`.
    - **Adjustments**:
        - **Soil Type**: Sandy soil increases requirements by 20% (due to leaching), while Clay decreases them by 10% (better retention).
        - **Existing Levels**: Farmers can input current NPK test results, which are subtracted from the target dosage.
    - **Fertilizer Conversion**: The tool converts NPK requirements into specific bag counts for **Urea (46% N)**, **DAP (18% N, 46% P)**, and **MOP (60% K)**.

### 4. Disease & Pest Management
- **Data Source**: A comprehensive, 29-crop encyclopedia (`src/data/crop-diseases.ts`).
- **UI Design**: A custom two-column "Care Card" layout featuring:
    - **Symptoms**: High-contrast blocks with visual icons for easy identification in the field.
    - **Favorable Conditions**: Guidance on weather patterns that trigger outbreaks.
    - **Pest Control**: Direct "Action Items" for prevention and chemical/biological control.

### 5. Smart Weather & Farmer Advisory
- **Data Source**: [WeatherAPI.com](https://www.weatherapi.com/) via a secure server-side Proxy (`/api/weather`).
- **Advisory Logic**: The system interprets data into actionable tips:
    - **Heat Alert**: Triggered at >40°C or high UV (>8).
    - **Fungal Risk**: Triggered when humidity >85% without rain.
    - **Work Planning**: Advises against spraying during strong winds (>40 km/h) or heavy rain.

### 6. NDVI Health Monitoring (Visualized)
- **Implementation**: The dashboard visualizes **NDVI (Normalized Difference Vegetation Index)** using high-quality conic gradients.
- **Scale**:
    - **0.7 - 1.0**: Healthy (Green)
    - **0.4 - 0.7**: Moderate (Yellow)
    - **Below 0.4**: Stress (Red)

---

## 🧪 Scientific & AI Methodology

The application employs several data science and mathematical models to provide precision agricultural advice:

### 1. Yield Prediction (ML Microservice)
KisanDost includes a state-of-the-art **AI Profit Intelligence Tool** powered by a dedicated Python/FastAPI microservice. Instead of hardcoded formulas, the application utilizes a **Random Forest Regressor** (via `scikit-learn`) trained on datasets containing historical crop environmental requirements and yields.

**Architecture Flow:**
1. The Next.js frontend collects data via the Profit Predictor form.
2. The Python service runs inference against the trained `yield_model.pkl` and returns the predicted yield (per hectare) and a calculated confidence score.
3. Total predicted yield is calculated as: `Predicted Yield (Per Hectare/Acre) × Land Area`.

### 2. Nutrient Prediction (Linear Regression)
The **Fertilizer Calculator** maps input variables such as Crop Type, Soil Characteristic ($S$), and Current Soil Saturation ($N_{curr}$) to a predicted target dosage ($Y$):
$$Y = (R_{crop} \times S_{coeff}) - N_{curr}$$

### 3. Optical Remote Sensing Theory (NDVI)
The apps health monitoring is based on the **Spectral Reflectance** of chlorophyll. By calculating the ratio between Near-Infrared (NIR) and Red light, the app identifies plant vigor.
$$NDVI = \frac{NIR - Red}{NIR + Red}$$

### 4. Profit Computations & Benchmarking
- **Estimated Revenue**: `Predicted Yield × Market Price`.
- **Net Profit**: `Estimated Revenue - Estimated Input Costs`.
- **Visualization**: Using **Recharts**, the UI maps the predicted yield against State and National benchmarks.

---

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS + Framer Motion
- **Components**: Shadcn UI (Radix UI)
- **Database**: MongoDB (Mongoose)
- **Auth**: Clerk (Google OAuth)

## 📦 Getting Started

1. **Clone the repo** and navigate to `kisan-next`.
2. **Setup .env.local**:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   WEBHOOK_SECRET=...
   MONGODB_URI=...
   WEATHER_API_KEY=...
   ```
3. **Run**: `npm install` then `npm run dev`.

---

*Designed with ❤️ for the Indian Farmer.*
