# VEXYL-TTS Indic Text-To-Speech Microservice

Self-hosted Indian language text-to-speech service wrapping Indic Parler TTS architecture for KisanDost / AgriShield 360°.

## Features

- **Languages Supported**:
  - `hi-IN`: Hindi (Speakers: Divya [default/calm], Rohit [formal])
  - `gu-IN`: Gujarati (Speakers: Neha [default/calm], Yash [formal])
  - `mr-IN`: Marathi (Speakers: Sunita [default/calm], Sanjay [formal])
- **Styles**: `CALM` (agricultural instructional default), `FORMAL`, `URGENT` (high risk alerts), `WARM`
- **Protocols**:
  - Direct REST: `POST /synthesize`
  - Batch REST: `POST /batch/synthesize`, `GET /batch/status/{job_id}`, `GET /batch/result/{job_id}`
  - WebSocket: `ws://localhost:8092/`
  - Health check: `GET /health`
- **Zero Google Cloud Dependencies**: No `GOOGLE_APPLICATION_CREDENTIALS` or Google Cloud TTS SDKs.
- **CPU & GPU Ready**: Runs out-of-the-box in CPU mode with optional CUDA support.
- **In-memory LRU Cache**: Eliminates redundant compute for recurring agricultural advisories.

## Setup & Running

### Option 1: Direct Python
```bash
cd services/vexyl-tts
pip install -r requirements.txt
python vexyl_tts_server.py
```

### Option 2: Docker
```bash
docker build -t vexyl-tts services/vexyl-tts
docker run -p 8092:8092 vexyl-tts
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VEXYL_TTS_HOST` | `0.0.0.0` | Bind host |
| `VEXYL_TTS_PORT` | `8092` | Bind port |
| `VEXYL_TTS_DEVICE` | `cpu` | Device (`cpu` or `cuda`) |
| `VEXYL_TTS_API_KEY` | `""` | Optional auth token checked via `X-API-Key` |
| `VEXYL_TTS_CACHE_SIZE` | `500` | LRU cache capacity |
