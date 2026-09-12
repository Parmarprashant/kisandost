from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from predictor import predictor

app = FastAPI(
    title="KisanDost Yield Prediction API",
    description="AI-powered crop yield prediction service for KisanDost Agriculture Platform.",
    version="1.0.0"
)

class YieldPredictionRequest(BaseModel):
    crop: str = Field(..., description="Type of crop (e.g. Wheat, Rice)")
    land_area: float = Field(..., description="Land area in acres")
    fertilizer_cost: float = Field(..., description="Total fertilizer cost in ₹")
    pesticide_cost: float = Field(..., description="Total pesticide cost in ₹")
    irrigation_cost: Optional[float] = Field(0.0, description="Total irrigation cost in ₹")
    state: str = Field(default="Rajasthan", description="State or region for regional context")
    season: Optional[str] = Field(default="Kharif", description="Season (Kharif, Rabi, Whole Year)")
    # Environmental factors - NOW REQUIRED for model dependency
    ndvi: float = Field(..., description="⭐ REQUIRED - NDVI score (0.1-0.95) for vegetation health")
    soil_moisture: float = Field(..., description="⭐ REQUIRED - Soil moisture percentage (0-100%)")
    rainfall: Optional[float] = Field(None, description="Rainfall in mm")
    # Legacy factors (no longer required)
    ndvi_factor: Optional[float] = Field(None, description="[LEGACY] NDVI impact factor")
    moisture_factor: Optional[float] = Field(None, description="[LEGACY] Moisture impact factor")

class YieldPredictionResponse(BaseModel):
    predicted_profit: float
    expected_revenue: float
    total_cost: float
    predicted_yield: Optional[float] = None
    recommendation: str
    confidence: float
    region: str
    crop: Optional[str] = None
    season: Optional[str] = None

@app.post("/predict-yield", response_model=YieldPredictionResponse)
async def predict_yield_endpoint(request: YieldPredictionRequest):
    try:
        # Validate environmental parameters (now required for model dependency)
        print(f"\n📋 YIELD PREDICTION REQUEST:")
        print(f"   🌾 Crop: {request.crop}")
        print(f"   📍 Land Area: {request.land_area} acres")
        print(f"   🗺️  State: {request.state}")
        print(f"   📅 Season: {request.season}")
        print(f"\n   ⭐ ENVIRONMENTAL STATE (Required):")
        print(f"      • NDVI: {request.ndvi:.3f} (vegetation health)")
        print(f"      • Soil Moisture: {request.soil_moisture:.1f}% (water availability)")
        
        # Validate NDVI range
        if not (0.1 <= request.ndvi <= 0.95):
            raise ValueError(f"NDVI must be between 0.1 and 0.95, got {request.ndvi}")
        
        # Validate soil moisture range
        if not (0 <= request.soil_moisture <= 100):
            raise ValueError(f"Soil moisture must be between 0 and 100%, got {request.soil_moisture}")
        
        if request.rainfall is not None:
            print(f"      • Rainfall: {request.rainfall}mm")
        
        result = predictor.predict(
            crop=request.crop,
            land_area=request.land_area,
            fertilizer_cost=request.fertilizer_cost,
            pesticide_cost=request.pesticide_cost,
            irrigation_cost=request.irrigation_cost or 0.0,
            state=request.state,
            season=request.season,
            # Pass environmental state (now required)
            ndvi=request.ndvi,
            soil_moisture=request.soil_moisture,
            rainfall_actual=request.rainfall,
            # Legacy factors (kept for backward compatibility)
            ndvi_factor=request.ndvi_factor,
            moisture_factor=request.moisture_factor
        )
        return result
    except ValueError as e:
        print(f"❌ Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok", "model_loaded": predictor.model is not None}

# Run the server
if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    print("\n" + "="*60)
    print("🚀 STARTING YIELD PREDICTION API SERVER")
    print("="*60)
    print(f"📍 Server running at: http://localhost:{port}")
    print(f"📚 API Documentation: http://localhost:{port}/docs")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=port)
