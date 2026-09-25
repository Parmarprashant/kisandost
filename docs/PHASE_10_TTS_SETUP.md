# VEXYL-TTS Setup & Integration Guide
## Self-Hosted Indic Text-to-Speech Engine for AgriShield 360°

---

## 1. Overview

AgriShield 360° uses **VEXYL-TTS**, a self-hosted Indian language text-to-speech service derived from [vexyl-ai/vexyl-tts](https://github.com/vexyl-ai/vexyl-tts) wrapping the `ai4bharat/indic-parler-tts` architecture.

**Zero Google Cloud Dependencies**: No `GOOGLE_APPLICATION_CREDENTIALS`, Google Cloud TTS SDK, or external cloud voice bills. Audio synthesis operates with full data sovereignty on local or private infrastructure.

---

## 2. Directory Structure

```
kisandost/
├── services/
│   └── vexyl-tts/
│       ├── Dockerfile              # CPU-only container (Default)
│       ├── Dockerfile.gpu          # CUDA 12.1 GPU container
│       ├── requirements.txt        # FastAPI, Uvicorn, WebSockets, Soundfile
│       ├── vexyl_tts_server.py     # High-performance Indic speech server
│       └── README.md
└── kisan-dost/ventureHack/kisan-next/
    ├── services/vexyl-tts/         # Mirrored service directory
    └── src/lib/tts/
        ├── ttsConfig.ts            # Configuration, voice styles & fallbacks
        └── vexylTtsProvider.ts     # Next.js backend provider & LRU caching
```

---

## 3. Server Capabilities & Specifications

- **Default Port**: `8092` (Configurable via `PORT` or `VEXYL_TTS_PORT`)
- **Default Device**: `cpu` (Inference runs without requiring discrete GPU)
- **Audio Output**: 16-bit PCM WAV (`audio/wav`), 22050 Hz, Mono
- **Supported Languages**:
  - `hi-IN` (Hindi): Divya (Default / Calm), Rohit (Formal)
  - `gu-IN` (Gujarati): Neha (Default / Calm), Yash (Formal)
  - `mr-IN` (Marathi): Sunita (Default / Calm), Sanjay (Formal)
- **Voice Styles**:
  - `CALM`: Agricultural instructional cadence (default)
  - `FORMAL`: Authoritative, professional neutral
  - `URGENT`: Crisp, heightened alert prosody (high risk conditions)
  - `WARM`: Empathetic, friendly farmer guidance

---

## 4. REST API Endpoints

### 4.1 Health Check (Auth-Exempt)
```http
GET /health
```
Response:
```json
{
  "status": "ok",
  "service": "vexyl-tts",
  "version": "1.0.0",
  "device": "cpu",
  "languages": ["hi-IN", "gu-IN", "mr-IN"],
  "styles": ["CALM", "FORMAL", "URGENT", "WARM"],
  "cache_size": 12
}
```

### 4.2 Direct Synchronous Synthesis
```http
POST /synthesize
Content-Type: application/json
X-API-Key: <optional-secret>

{
  "text": "गेहूं में पाउडरी मिल्ड्यू का उच्च जोखिम पाया गया है।",
  "lang": "hi-IN",
  "style": "CALM",
  "speaker": "Divya"
}
```
Response:
```json
{
  "success": true,
  "job_id": "c1f7b037-3c3a-4a87-9d0d-3027693f7022",
  "status": "completed",
  "audio_base64": "UklGRuR9...",
  "content_type": "audio/wav",
  "duration_ms": 3200,
  "language": "hi-IN",
  "style": "CALM",
  "speaker": "Divya",
  "cached": false
}
```

### 4.3 Batch Synthesis API
- `POST /batch/synthesize`: Returns `job_id` and initial status.
- `GET /batch/status/{job_id}`: Polls processing state.
- `GET /batch/result/{job_id}?format=wav`: Streams binary WAV audio.

### 4.4 Real-time WebSocket Protocol
- `ws://localhost:8092/` or `ws://localhost:8092/ws`
- Immediate handshake: `{"type": "ready", "model": "indic-parler-tts", "languages": [...]}`
- Synthesis request: `{"type": "synthesize", "text": "...", "lang": "hi-IN", "request_id": "1"}`
- Audio stream response: `{"type": "audio", "audio": "<base64>", "request_id": "1"}`

---

## 5. Local Execution & Docker Deployment

### Local Python Mode
```bash
cd services/vexyl-tts
pip install -r requirements.txt
python vexyl_tts_server.py
```

### Docker CPU Mode
```bash
docker build -t vexyl-tts -f services/vexyl-tts/Dockerfile services/vexyl-tts
docker run -d -p 8092:8092 --name vexyl-tts-instance vexyl-tts
```

### Docker GPU Mode (NVIDIA CUDA)
```bash
docker build -t vexyl-tts:gpu -f services/vexyl-tts/Dockerfile.gpu services/vexyl-tts
docker run -d --gpus all -p 8092:8092 --name vexyl-tts-gpu vexyl-tts:gpu
```

---

## 6. Caching & Compute Optimization

Text-to-speech inference is compute-intensive. Phase 10 implements a deterministic two-tier cache:
1. **Cache Key Calculation**:
   ```ts
   hash = sha256(normalize(text) + '|' + lang + '|' + style + '|' + speaker)
   ```
2. **In-Memory LRU Cache**: Holds up to 500 synthesized advisory buffers.
3. **Deduplicated Disk Storage**: Repeated requests reuse existing `/uploads/audio/tts_{lang}_{hash}.wav` files, eliminating redundant audio processing.
