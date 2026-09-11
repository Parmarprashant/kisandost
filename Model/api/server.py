"""
FastAPI Cloud Application Server
Endpoints:
- POST /api/v1/diagnose: Parallel multi-model inference and fallback
- GET /api/v1/health: System health and hardware telemetry
- GET /api/v1/classes: Supported crop disease and pest taxonomies
"""
import io
import sys
import os
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.pipeline import DiagnosticPipeline
from models.efficientnet_cbam import CROP_DISEASE_CLASSES
from models.yolo_pest import PEST_CLASSES

app = FastAPI(
    title="KisanDost Multi-Model Agricultural Diagnostic Cloud API",
    description="End-to-End Cloud AI Agriculture Diagnostic System with Parallel Multi-Model Inference and Smart Fallback",
    version="1.0.0"
)

# CORS middleware for Web and Mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pipeline once on startup
pipeline = DiagnosticPipeline()

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "online",
        "service": "KisanDost Multi-Model Cloud AI Engine",
        "models_loaded": {
            "classifier": "EfficientNet-B5 + CBAM",
            "pest_detector": "YOLOv8n",
            "segmenter": "U-Net (ResNet-34)",
            "smart_fallback": "Cloud Multimodal Vision"
        },
        "confidence_threshold": pipeline.confidence_threshold
    }

@app.get("/api/v1/classes")
async def list_classes():
    return {
        "crop_diseases": CROP_DISEASE_CLASSES,
        "pest_classes": PEST_CLASSES
    }

@app.post("/api/v1/diagnose")
async def diagnose_crop(
    file: UploadFile = File(...),
    land_acres: float = Form(1.0)
):
    try:
        # Validate file format
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPEG, PNG, WebP).")

        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Run pipeline
        result = pipeline.run(image, land_acres=land_acres)
        return JSONResponse(content=result)
    except Exception as e:
        print(f"[API Server Error] {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 STARTING KISANDOST MULTI-MODEL CLOUD API SERVER")
    print("="*60)
    print("📍 Server running at: http://localhost:8000")
    print("📚 Interactive Docs: http://localhost:8000/docs")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
