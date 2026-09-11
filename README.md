# VentureHack (KisanDost) 🌾

VentureHack (KisanDost) is a comprehensive digital platform designed to empower farmers with modern technology. It provides tools for disease detection, expense management, weather updates, and a marketplace for agricultural products.

## 🚀 Features

- **AI Disease Detection**: Identify crop diseases using AI models and receive treatment recommendations.
- **Agricultural Marketplace**: Buy and sell agricultural products and tools.
- **Expense Tracker**: Manage farm finances and track seasonal expenses.
- **Fertilizer Calculator**: Calculate precise fertilizer requirements for various crops.
- **Weather Integration**: Stay updated with real-time weather forecasts tailored for farming.
- **Community Forum**: Connect with other farmers and experts.

## 🛠 Tech Stack

### Frontend & Web App
- **Next.js 15+**: Modern React framework for the web interface.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Framer Motion**: For smooth animations and transitions.
- **Lucide React**: Icon library for a clean UI.

### Backend & AI
- **Python (Flask/FastAPI)**: AI service for model inference.
- **Mongoose / MongoDB**: Database for managing user data and products.
- **TensorFlow.js**: Client-side machine learning capabilities.
- **Google Generative AI**: Gemini integration for intelligent agricultural assistance.

### Mobile & Tools
- **Capacitor**: Cross-platform mobile app development.
- **Clerk**: Authentication and user management.
- **Next-Intl**: Internationalization support (English, Hindi, Gujarati).
- **Leaflet**: Interactive maps for location-based services.

## 🗺 Application Routes

| Route | Description |
| :--- | :--- |
| `/` | Landing page with project overview. |
| `/dashboard` | Central hub for farmer activities and summaries. |
| `/marketplace` | Buy and sell crops, tools, and fertilizers. |
| `/diseases` | Upload photos to detect crop diseases via AI. |
| `/expenses` | Log and visualize farm income and expenditures. |
| `/fertilizer-calculator` | Tool to determine optimal fertilizer ratios. |
| `/weather` | Localized weather forecasts and farming alerts. |
| `/communities` | Discussion boards for agricultural sharing. |
| `/tools` | Access to various farming utility tools. |
| `/pricing` | Information about premium features or service plans. |

## 📦 Project Structure

```text
├── ai-service/        # Python-based AI models and inference server
├── kisan-next/        # Next.js frontend application (Web & Mobile)
├── android/           # Native Android integration files
├── capacitor.config.json # Capacitor configuration
└── package.json       # Root project configuration
```

## 🛠 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+ (for AI service)

### Installation

1. **Frontend Setup**:
   ```bash
   cd kisan-next
   npm install
   npm run dev
   ```

2. **AI Service Setup**:
   ```bash
   cd ai-service
   pip install -r requirements.txt
   python server.py
   ```

---
Built with ❤️ for the farming community.
