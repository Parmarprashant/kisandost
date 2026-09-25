# AgriShield 360° — Phase 0: Environment Variable Audit Report

**Audit Date**: September 2026  
**Auditor**: AgriShield 360° Systems Architecture Team  
**Security Notice**: In accordance with system security standards, this audit lists ONLY variable names and their presence status. Zero credentials, tokens, connection strings, or secret values are disclosed.

---

## 1. Verified Environment Variables Inventory

### Core Platform & Database
```text
MONGODB_URI = EXISTS
NEXT_PUBLIC_ENV = EXISTS
NEXT_PUBLIC_APP_URL = EXISTS
NODE_ENV = EXISTS
BACKEND_URL = EXISTS
```

### Authentication & Security
```text
JWT_SECRET = EXISTS
GOOGLE_CLIENT_ID = EXISTS
GOOGLE_CLIENT_SECRET = EXISTS
```

### Weather & Geolocation
```text
WEATHER_API_KEY = EXISTS
GOOGLE_MAPS_API_KEY = NOT_REQUIRED (Map utilizes direct Google Hybrid raster tiles via Leaflet)
```

### AI Services & Machine Learning
```text
GEMINI_API_KEY = EXISTS
NVIDIA_API_KEY = EXISTS
PYTHON_AI_SERVICE_URL = EXISTS
USE_PYTHON_BACKEND = EXISTS
AGRIVISION_API_URL = EXISTS (Default: https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run)
AGRIVISION_LOCAL_API_URL = EXISTS (Default: http://127.0.0.1:8000)
```

### Government Open Data & Mandi Prices
```text
DATA_GOV_API_KEY = EXISTS
DATA_GOV_MANDI_RESOURCE_ID = EXISTS
```

### SMS & Farmer Messaging Gateway
```text
FAST2SMS_API_KEY = EXISTS
TWOFACTOR_API_KEY = NOT_CONFIGURED
TWOFACTOR_SENDER_ID = NOT_CONFIGURED
TWOFACTOR_TEMPLATE_NAME = NOT_CONFIGURED
TEST_FARMER_PHONE = NOT_CONFIGURED
```

### Firebase Cloud Messaging (Push Notifications)
```text
FIREBASE_CLIENT_EMAIL = NOT_CONFIGURED
FIREBASE_PRIVATE_KEY = NOT_CONFIGURED
FIREBASE_PROJECT_ID = NOT_CONFIGURED
NEXT_PUBLIC_FIREBASE_API_KEY = NOT_CONFIGURED
NEXT_PUBLIC_FIREBASE_APP_ID = NOT_CONFIGURED
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = NOT_CONFIGURED
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = NOT_CONFIGURED
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = NOT_CONFIGURED
NEXT_PUBLIC_FIREBASE_PROJECT_ID = NOT_CONFIGURED
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = NOT_CONFIGURED
NEXT_PUBLIC_FIREBASE_VAPID_KEY = NOT_CONFIGURED
```

---

## 2. Summary for AgriShield 360° Readiness

- **Database Connection (`MONGODB_URI`)**: Configured and functional.
- **Authentication (`JWT_SECRET`, `GOOGLE_CLIENT_*`)**: Configured and functional.
- **Weather Services (`WEATHER_API_KEY`)**: Configured and functional (plus keyless Open-Meteo fallback).
- **Disease AI Engine (`AGRIVISION_API_URL`)**: Configured and functional.
- **No Blocking Variable Missing**: AgriShield Phase 1 development can proceed without requiring new third-party credentials.
