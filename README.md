<div align="center">

# 🌾 KisanDost (किसान दोस्त / કિસાન દોસ્ત)
### *Empowering Indian Farmers with Multimodal AI, Satellite Telemetry & Real-Time Market Intelligence*

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CUDA_12.8-ee4c2c?style=for-the-badge&logo=pytorch)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Modal](https://img.shields.io/badge/Modal-Cloud_GPU-00C7B7?style=for-the-badge)](https://modal.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_v9-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

**[Live Web App (Vercel)](https://kisandost.vercel.app)** • **[Modal GPU Diagnostic API](https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run/docs)** • **[Documentation](./docs/)**

</div>

---

## 📖 Executive Summary

**KisanDost** is a comprehensive, production-grade precision agriculture intelligence platform architected specifically for smallholder and commercial farmers across India. Smallholder farming accounts for over 85% of Indian agriculture, yet farmers face devastating losses due to:
- Delayed identification of foliar crop diseases and pest outbreaks.
- Lack of field-level satellite monitoring and soil moisture analytics.
- Unpredictable crop yields and opaque local market (Mandi) pricing.
- Digital and linguistic literacy barriers that hinder access to modern agronomic advisories.

**KisanDost bridges this gap** by uniting multi-stream deep neural vision, satellite remote sensing, ICAR-calibrated integrated pest management (IPM), machine learning yield forecasting, real-time APMC Mandi price discovery, and self-hosted Indic voice synthesis into a single, intuitive, multilingual digital companion.

---

## 🏛️ System Architecture

KisanDost operates as an interconnected, distributed microservices ecosystem designed for high fault-tolerance, low-latency mobile delivery, and edge/cloud hybrid scalability:

```mermaid
flowchart TB
    subgraph ClientLayer ["Farmer Client Layer (Multilingual: hi, gu, mr, en)"]
        WebPWA["Next.js 15 PWA / Responsive Web App\n(Mapbox GL JS + Lucide + Tailwind)"]
        VoiceIO["Voice Assistant UI\n(Audio Recording & Playback)"]
    end

    subgraph EdgeGateway ["Application & Edge Gateway (Port 3000)"]
        NextServer["Next.js Server & App Router\n(Internationalization via next-intl)"]
        AuthModule["Custom JWT & OAuth Engine\n(Google OAuth + Phone OTP)"]
        MandiProxy["APMC Mandi Price Aggregator"]
        RiskEngine["ICAR Agronomic Risk & Advisory Engine"]
    end

    subgraph AIServices ["AI & Machine Learning Microservices"]
        direction TB
        AgriVisionLocal["AgriVision Diagnostic Engine\n(:8000 / PyTorch CUDA RTX 5060)\n• EfficientNet-B5 + CBAM (Classification)\n• YOLOv8n (Pest Detection)\n• ResNet-34 U-Net (Lesion Severity)"]
        AgriVisionModal["Modal Serverless Cloud GPU\n(FastAPI / T4 GPU Fallback)"]
        YieldAI["Yield & Profit Predictor Service\n(:8001 / FastAPI + Scikit-Learn)\n• Multi-variate Crop Yield Modeling\n• NDVI & Soil Moisture Factors"]
        VexylTTS["Vexyl-TTS Voice Microservice\n(:8092 / Indic Speech Synthesis)\n• Hindi, Gujarati, Marathi Audio WAV"]
    end

    subgraph DataIntegrations ["External Telemetry & Cloud Storage"]
        MongoDB[("MongoDB Atlas\n(Users, Crops, Zones, Scans, Advisories)")]
        GovMandi["data.gov.in API\n(Real-Time National Mandi Rates)"]
        WeatherAPI["Open-Meteo & WeatherAPI\n(Hyperlocal Forecasts & Geolocation)"]
        TwilioService["Twilio Dispatcher\n(WhatsApp & SMS Alerts)"]
        FirebaseFCM["Firebase Admin SDK\n(Web Push Notifications)"]
    end

    WebPWA --> NextServer
    VoiceIO --> VexylTTS
    NextServer --> AuthModule
    NextServer --> MandiProxy
    NextServer --> RiskEngine
    NextServer --> MongoDB

    RiskEngine --> AgriVisionLocal
    RiskEngine -.->|Cloud GPU Fallback| AgriVisionModal
    NextServer --> YieldAI

    MandiProxy --> GovMandi
    NextServer --> WeatherAPI
    RiskEngine --> TwilioService
    RiskEngine --> FirebaseFCM
```

---

## 🌟 Key Capabilities & Feature Matrix

### 1. 🛰️ Satellite Farm Telemetry & GPS Field Zoning
- **Mapbox Standard Satellite Integration**: High-resolution orbital imagery allows farmers to locate their fields, inspect terrain features, and precisely draw multi-vertex field boundaries.
- **Automated Monitoring Zones (Z01–Z06)**: Spatial subdivision algorithms divide polygon fields into micro-zones for targeted crop scouting and localized treatment application.
- **Two-Stage GPS In-Field Navigation**: Fast network-based coarse location refined with high-precision GPS positioning. Point-in-polygon matching automatically determines which agricultural zone the farmer is currently inspecting.
- **Satellite Vegetation Indices**: Ingestion of normalized difference vegetation index (NDVI) and root-zone soil moisture indicators to track crop vigor remotely.

### 2. 🔬 AgriVision Multi-Stream Neural Diagnostic Engine
The computer vision subsystem implements a multi-stream hierarchical diagnostic pipeline:
- **Stream 1: Foliar Pathology Classification**: `EfficientNet-B5` with Convolutional Block Attention Modules (`CBAM`) trained to recognize foliar symptoms across 38+ crop-pathology categories.
- **Stream 2: Pest Detection & Density Estimation**: `YOLOv8n` object detection model detecting insects, aphids, mites, and caterpillars directly on foliage.
- **Stream 3: Lesion Severity Quantification**: `ResNet-34 U-Net` segmenter that isolates necrotic leaf tissue to calculate accurate percentage infection metrics.
- **Quality & Out-of-Distribution (OOD) Gates**: Pre-inference Laplacian variance filters out blurry or unreadable photos, while energy-score thresholds prevent hallucinations on non-crop imagery.
- **Dual-Stream Attention Fallback**: In low-connectivity or high-latency scenarios, diagnostics seamlessly fall back to an ensemble cloud pipeline with zero vendor branding leakage.

### 3. 📈 Hyperlocal Yield & Profit Optimizer
- **Empirical Agronomic Regression**: Computes expected crop yield (quintals/acre), projected revenue, total input expenditure, and estimated net profit.
- **Environmental Context Dependency**: Integrates field land area, fertilizer budget, pesticide expenses, irrigation methods, state-level historical yields, and real-time NDVI vegetation health indices.
- **Actionable Optimization Advice**: Generates tailored suggestions to maximize Return on Investment (ROI) while minimizing chemical input wastage.

### 4. 💰 Real-Time APMC Mandi Price Discovery
- **Official Government API Integration**: Connected directly to `data.gov.in` (Ministry of Agriculture & Farmers Welfare, Resource ID `9ef84268-d588-465a-a308-a864a43d0070`).
- **Hyperlocal APMC Intelligence**: Provides state-wise, district-wise, and commodity-wise minimum, maximum, and modal prices (₹/quintal) updated daily.
- **Fair Price Negotiation**: Equips smallholder farmers with up-to-date market rates to protect against exploitative middleman commission structures.

### 5. 🎙️ Vexyl-TTS & Vernacular Accessibility
- **Self-Hosted Indic Voice Synthesis**: Built to overcome low literacy barriers in rural communities by delivering spoken advisories.
- **Multilingual Support**: High-fidelity speech models for:
  - 🇮🇳 **Hindi (`hi-IN`)**: Female (Divya) & Male (Rohit) voices
  - 🇮🇳 **Gujarati (`gu-IN`)**: Female (Neha) & Male (Yash) voices
  - 🇮🇳 **Marathi (`mr-IN`)**: Female (Sunita) & Male (Sanjay) voices
- **Real-Time Streaming**: Supports both low-overhead WebSocket streaming (`/ws`) and direct REST endpoints (`/synthesize`) with dynamic PCM WAV synthesis.

### 6. 🛡️ ICAR-Calibrated IPM Advisory & Multichannel Alerts
- **Standardized Protocols**: Treatment recommendations follow ICAR (Indian Council of Agricultural Research) and Integrated Pest Management (IPM) guidelines, balancing chemical control with organic and cultural remedies.
- **Twilio WhatsApp & SMS Notifications**: High-risk disease discoveries or severe weather alerts trigger automated SMS/WhatsApp alerts directly to registered mobile devices.
- **Web Push Notifications**: Firebase Cloud Messaging (FCM) keeps farmers informed of time-critical spray schedules, irrigation windows, and market price spikes.

---

## 🗂️ Repository Structure

```
kisandost/
├── kisan-dost/
│   └── ventureHack/
│       ├── kisan-next/                    # Next.js 15 Fullstack Web Application
│       │   ├── src/
│       │   │   ├── app/                   # App Router pages & API endpoints
│       │   │   │   ├── [locale]/          # Localized application routes (en, hi, gu, mr)
│       │   │   │   │   ├── auth/          # Authentication & onboarding
│       │   │   │   │   ├── dashboard/     # Unified farmer dashboard
│       │   │   │   │   │   ├── my-crops/  # Satellite map & GPS field zoning
│       │   │   │   │   │   ├── advisory/  # Diagnostic & disease scanning
│       │   │   │   │   │   └── yield/     # Yield & profit forecasting
│       │   │   │   │   ├── marketplace/   # APMC Mandi rates & agricultural inputs
│       │   │   │   │   └── community/     # Peer-to-peer farmer forums
│       │   │   │   └── api/               # Server-side API endpoints & proxies
│       │   │   ├── components/            # Reusable UI & GIS components
│       │   │   │   ├── farmer-tools/      # FarmBoundaryEditor (Mapbox GL JS)
│       │   │   │   ├── layout/            # Navigation, headers & footers
│       │   │   │   └── ui/                # Accessible design system (shadcn/ui)
│       │   │   ├── lib/                   # Database, auth, and external API connectors
│       │   │   ├── models/                # Mongoose schemas (Crop, DiseaseScan, Advisory)
│       │   │   └── messages/              # i18n translation dictionaries
│       │   ├── public/                    # Static branding, logo, and web assets
│       │   ├── next.config.ts             # Next.js optimization configuration
│       │   └── package.json               # Frontend dependencies & scripts
│       │
│       └── ai-service/                    # Yield Prediction Microservice (Port 8001)
│           ├── server.py                  # FastAPI application & endpoints
│           ├── predictor.py               # ML model pipeline & feature engineering
│           ├── crop_profiles.json         # Agronomic constants across Indian crops
│           └── requirements.txt           # Python dependencies
│
├── crop-diseases-model/                   # AgriVision Neural Diagnostic Engine (Port 8000)
│   ├── api/
│   │   ├── server.py                      # FastAPI inference API
│   │   └── schemas.py                     # Diagnostic request/response schemas
│   ├── models/
│   │   ├── efficientnet_cbam.py           # EfficientNet-B5 with CBAM attention
│   │   ├── yolo_pest.py                   # YOLOv8 pest detection wrapper
│   │   └── unet_segmenter.py              # ResNet-34 U-Net foliar segmenter
│   ├── inference/
│   │   ├── pipeline.py                    # Hierarchical multi-stream diagnostic pipeline
│   │   └── crop_taxonomy.py               # Canonical crop-pathology taxonomy
│   ├── modal_app.py                       # Serverless cloud GPU deployment (Modal.com)
│   └── weights/                           # Model checkpoints & calibration thresholds
│
├── services/
│   └── vexyl-tts/                         # Vexyl-TTS Voice Microservice (Port 8092)
│       ├── vexyl_tts_server.py            # Indic text-to-speech FastAPI service
│       └── requirements.txt               # Audio synthesis dependencies
│
└── docs/                                  # Architectural specifications & audits
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file inside `kisandost/kisan-dost/ventureHack/kisan-next/`:

| Environment Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/ventureHack` |
| `JWT_SECRET` | Secret key for JWT session encryption | `your_secure_random_jwt_secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your_google_client_id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET`| Google OAuth Client Secret | `your_google_client_secret` |
| `NEXT_PUBLIC_APP_URL` | Base application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox GL JS Public Token | `pk.eyJ1IjoieW91ci11c2VybmFtZSI...` |
| `AGRIVISION_API_URL` | AgriVision Local/Modal Model URL | `http://127.0.0.1:8000` |
| `PYTHON_AI_SERVICE_URL` | Yield Prediction Backend URL | `http://localhost:8001` |
| `VEXYL_TTS_URL` | Indic Text-to-Speech Service URL | `http://127.0.0.1:8092` |
| `DATA_GOV_API_KEY` | India Open Government Data API Key | `your_data_gov_in_api_key` |
| `WEATHER_API_KEY` | WeatherAPI.com API Key | `your_weather_api_key` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `your_twilio_token` |
| `TWILIO_WHATSAPP_FROM`| Twilio WhatsApp Sender Number | `whatsapp:+14155238886` |
| `TWILIO_SMS_FROM` | Twilio SMS Sender Number | `+18147884028` |
| `FIREBASE_PROJECT_ID` | Firebase Project Identifier | `kisan-dost-bd105` |
| `FIREBASE_CLIENT_EMAIL`| Firebase Admin Service Account Email| `firebase-adminsdk@...iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY`| Firebase Admin Private Key | `-----BEGIN PRIVATE KEY-----\n...` |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v20.x or higher
- **Python**: v3.10 or v3.11 with `pip`
- **NVIDIA GPU** *(Optional for local PyTorch CUDA inference; CPU fallback supported)*

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Parmarprashant/kisandost.git
cd kisandost
```

---

### Step 2: Launch the Next.js Web Application
```bash
cd kisan-dost/ventureHack/kisan-next
npm install
npm run dev
```
> The web interface will be available at **`http://localhost:3000`**.

---

### Step 3: Launch the AgriVision AI Disease Engine (Port 8000)
```bash
# In a separate terminal
cd crop-diseases-model
pip install -r requirements.txt
python -m uvicorn api.server:app --host 127.0.0.1 --port 8000
```
> API Docs: **`http://127.0.0.1:8000/docs`** | Health Check: **`http://127.0.0.1:8000/api/v1/health`**

---

### Step 4: Launch the Yield Prediction AI Service (Port 8001)
```bash
# In a separate terminal
cd kisan-dost/ventureHack/ai-service
pip install -r requirements.txt
python -m uvicorn server:app --host 127.0.0.1 --port 8001
```
> API Docs: **`http://127.0.0.1:8001/docs`** | Health Check: **`http://127.0.0.1:8001/health`**

---

### Step 5: Launch the Vexyl-TTS Voice Service (Port 8092)
```bash
# In a separate terminal
cd services/vexyl-tts
pip install -r requirements.txt
python -m uvicorn vexyl_tts_server:app --host 127.0.0.1 --port 8092
```
> API Docs: **`http://127.0.0.1:8092/docs`** | Health Check: **`http://127.0.0.1:8092/health`**

---

## ☁️ Cloud & Serverless Deployment

| Component | Target Platform | Deployment Strategy |
| :--- | :--- | :--- |
| **Frontend & API Gateway** | **Vercel** | Git-triggered CI/CD from `main` branch with optimized edge asset caching. |
| **AgriVision Neural Engine** | **Modal.com** | Serverless GPU deployment (`modal deploy modal_app.py`) providing on-demand T4/A10G GPU cold starts in <5s. |
| **Database** | **MongoDB Atlas** | Distributed multi-region replica set with automated indexing and Mongoose ODM. |
| **Government Mandi Feeds** | **data.gov.in** | Scheduled ISR (Incremental Static Regeneration) caching to prevent rate-limit bottlenecks. |

---

## 🎯 Alignment with UN Sustainable Development Goals (SDGs)

KisanDost is engineered to address key global targets outlined in the **United Nations 2030 Agenda for Sustainable Development**:

- 🎯 **SDG 1: No Poverty (Target 1.4)**: Equal access to economic resources, technology, and real-time market price parity for rural smallholders.
- 🎯 **SDG 2: Zero Hunger (Target 2.3 & 2.4)**: Doubling agricultural productivity through early pest/pathogen eradication and sustainable farming practices.
- 🎯 **SDG 8: Decent Work & Economic Growth (Target 8.2)**: Increasing economic output through technological upgrading and digital empowerment.
- 🎯 **SDG 12: Responsible Consumption & Production (Target 12.4)**: Reducing excess chemical pesticide runoff through precision-targeted ICAR IPM advisories.

---

## 👥 Contributors & Acknowledgements

Developed with dedication for the **Smart India Hackathon (SIH)** and India's agricultural community.

- **Parmar Prashant** ([@Parmarprashant](https://github.com/Parmarprashant))
- **Manan Patel** ([@patelmanan112](https://github.com/patelmanan112))
- **Aryan Patel** ([@Aryansabasana](https://github.com/Aryansabasana))
- **Anisha Chhajer Jain** ([@Anisha-Chhajer-Jain](https://github.com/Anisha-Chhajer-Jain))

*Special thanks to ICAR (Indian Council of Agricultural Research) open data initiatives, Open-Meteo, data.gov.in, and the Mapbox community for making geospatial and agricultural telemetry accessible.*

---

<div align="center">
  <sub>Built with ❤️ for Indian Agriculture • Jai Jawan, Jai Kisan 🇮🇳</sub>
</div>
