# KisanDost 🌾 — AI-Powered Precision Agriculture Platform

KisanDost is a full-stack precision agriculture platform built for Indian farmers. It combines neural AI crop disease diagnosis, satellite farm mapping, GPS zone scouting, multilingual voice assistance, yield & profit prediction, and real-time weather — all in one unified web app.

---

## 🚀 Core Features

| Feature | Description |
|---------|-------------|
| 🛰️ **Satellite Farm Map** | Mapbox Standard Satellite — draw field boundaries, generate monitoring zones, test GPS coordinates |
| 🧠 **AgriVision AI Disease Engine** | EfficientNet-B5 + CBAM neural model with Gemini Vision fallback for crop disease diagnosis |
| 📊 **Yield & Profit Predictor** | ML-based yield forecasting and profit simulation per crop/field |
| 🌦️ **Real-Time Weather** | Open-Meteo + WeatherAPI with automatic IP geolocation fallback |
| 🌱 **My Crops** | Full crop lifecycle management — sow, track GDD/DAS progression, scan for disease |
| 🎙️ **Vexyl-TTS** | Indic language text-to-speech voice assistant (Hindi, Gujarati, English) |
| 💬 **KisanDost AI Chat** | Gemini-powered agricultural advisory chatbot |
| 📦 **Marketplace** | Buy/sell crops, tools, and inputs with real-time mandi pricing |
| 👨‍🌾 **Expert Connect** | Consult verified agronomists with scheduled sessions |
| 📣 **SMS/WhatsApp Alerts** | Twilio-powered disease & weather advisory notifications |
| 🌍 **i18n** | Full English, Hindi, and Gujarati localization via next-intl |

---

## 🛠 Tech Stack

### Frontend (Web)
- **Next.js 15** — App Router, Server Components, `next-intl`
- **Mapbox GL JS** — Standard Satellite map with polygon drawing & GPS zone resolution
- **Tailwind CSS + shadcn/ui** — Design system
- **Lucide React** — Icons

### AI & Backend Services
- **AgriVision Engine** — EfficientNet-B5 + CBAM, deployed on Modal cloud GPU (FastAPI/uvicorn)
- **Gemini 2.5 Flash** — Multimodal vision fallback + chat advisory
- **Python Yield AI** — FastAPI service on port 8001 (uvicorn)
- **Vexyl-TTS** — Indic TTS microservice on port 8092

### Database & Auth
- **MongoDB Atlas** — via Mongoose ODM
- **Custom JWT Auth** — Google OAuth + email/password

### Notifications
- **Twilio** — SMS + WhatsApp alerts
- **Firebase FCM** — Web push notifications

---

## 📦 Project Structure

```
kisandost/
├── kisan-next/                     # Next.js 15 web application
│   ├── src/
│   │   ├── app/                    # App Router pages & API routes
│   │   │   ├── [locale]/(app)/     # Localized page routes
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── my-crops/   # Satellite map + disease scouting
│   │   │   │   │   ├── add-crop/   # Crop registration
│   │   │   │   │   ├── yield-predictor/
│   │   │   │   │   └── profit-predictor/
│   │   │   │   └── ...
│   │   │   └── api/                # Next.js API routes
│   │   ├── components/
│   │   │   ├── farmer-tools/       # FarmBoundaryEditor (Mapbox), AIMapComponent
│   │   │   └── ui/                 # shadcn/ui components
│   │   └── lib/                    # agriVisionService, geminiService, geoUtils
│   └── .env.local                  # Environment config (see below)
│
├── crop-diseases-model/            # AgriVision AI model
│   └── inference/
│       ├── pipeline.py             # EfficientNet-B5 + CBAM inference (modal.run)
│       └── crop_taxonomy.py        # Supported crop taxonomy
│
└── vexyl_tts_server.py             # Indic TTS microservice
```

---

## ⚙️ Environment Variables (`.env.local`)

```env
# MongoDB
MONGODB_URI=...

# Auth
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AI Services
GEMINI_API_KEY=...
AGRIVISION_API_URL=http://127.0.0.1:8000       # Local AgriVision
AGRIVISION_LOCAL_API_URL=http://127.0.0.1:8000
PYTHON_AI_SERVICE_URL=http://localhost:8001     # Yield predictor

# Maps
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1...

# Weather
WEATHER_API_KEY=...

# TTS
VEXYL_TTS_URL=http://127.0.0.1:8092

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_SMS_FROM=...

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
FIREBASE_PRIVATE_KEY=...
```

---

## 🚀 Running Locally

### 1. Next.js Web App
```bash
cd kisan-next
npm install
# Run with 8GB heap to handle Mapbox + heavy bundles on Windows
node --max-old-space-size=8192 node_modules/next/dist/bin/next dev
```
→ http://localhost:3000

### 2. AgriVision AI Engine (GPU — port 8000)
```bash
cd crop-diseases-model
python start_server_production.py
```

### 3. Yield Predictor (port 8001)
```bash
cd kisan-next   # or wherever server.py is
python -m uvicorn server:app --host 127.0.0.1 --port 8001
```

### 4. Vexyl-TTS Voice Service (port 8092)
```bash
python vexyl_tts_server.py
```

---

## 🛰️ My Crops — Spatial Map

The **MyCrops** page features a full Mapbox Standard Satellite map with:
- **Draw Boundary** — click to place polygon vertices on the satellite image
- **Generate Monitoring Zones** — auto-subdivides the boundary into spatial scouting zones (Z01–Z06)
- **Test GPS** — two-stage location: fast network (WiFi/IP) → GPS refinement. Places a red pin on the map, auto-opens popup with coordinates + zone match result

---

Built with ❤️ for India's farming community.
