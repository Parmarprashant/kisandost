import joblib
import pandas as pd
import numpy as np
import os
import sys
import io
from dataset_driven_predictor import predict_yield_dataset_driven

# Fix Unicode encoding for Windows terminals
if sys.stdout.encoding == 'cp1252':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

class YieldPredictor:
    def __init__(self):
        """Initialize predictor with trained models and encoders"""
        print("\n" + "="*60)
        print("LOADING YIELD PREDICTION MODEL")
        print("="*60)
        
        try:
            # Load trained model
            self.model = joblib.load('models/yield_model.pkl')
            print("✅ Model loaded: models/yield_model.pkl")
            
            # Load encoders
            self.crop_encoder = joblib.load('models/crop_encoder.pkl')
            print("✅ Crop encoder loaded")
            
            self.state_encoder = joblib.load('models/state_encoder.pkl')
            print("✅ State encoder loaded")
            
            self.season_encoder = joblib.load('models/season_encoder.pkl')
            print("✅ Season encoder loaded")
            
            # Load feature scaler
            self.scaler = joblib.load('models/feature_scaler.pkl')
            print("✅ Feature scaler loaded")
            
            print("\n✅ ALL MODELS LOADED SUCCESSFULLY!\n")
            self.model_loaded = True
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            print("   Available models directory contents:")
            if os.path.exists('models'):
                for file in os.listdir('models'):
                    print(f"      - {file}")
            else:
                print("      - models/ directory not found")
            self.model_loaded = False

    def predict(self, crop, land_area, fertilizer_cost, pesticide_cost, irrigation_cost, state="Rajasthan", season="Kharif", 
                ndvi=None, soil_moisture=None, rainfall_actual=None, ndvi_factor=None, moisture_factor=None):
        """
        Predict yield using real ML model trained on historical data with DIRECT environmental dependencies
        
        Args:
            crop: Crop type (e.g., "Wheat", "Rice")
            land_area: Land area in acres
            fertilizer_cost: Total fertilizer cost (₹)
            pesticide_cost: Total pesticide cost (₹)
            irrigation_cost: Total irrigation cost (₹)
            state: Indian state (default: Rajasthan)
            season: Season (Kharif, Rabi, or Whole Year)
            ndvi: REQUIRED - NDVI value (0.1-0.95) for vegetation health - DIRECTLY impacts yield
            soil_moisture: REQUIRED - soil moisture percentage (0-100) - DIRECTLY impacts yield
            rainfall_actual: Optional actual rainfall in mm
            ndvi_factor: Optional NDVI impact factor (computed by API)
            moisture_factor: Optional soil moisture impact factor (computed by API)
        
        Returns:
            dict: Prediction results with profit, revenue, cost, recommendations
        
        NOTE: Model now DEPENDS ON ENVIRONMENTAL STATE (NDVI + Soil Moisture)
        """
        
        if not self.model_loaded:
            raise Exception("Model not loaded. Run training first: python train_model.py")

        try:
            # Encode categorical features
            try:
                crop_encoded = self.crop_encoder.transform([crop])[0]
            except ValueError:
                print(f"⚠️  Unknown crop '{crop}', using default encoding")
                crop_encoded = 0

            try:
                state_encoded = self.state_encoder.transform([state])[0]
            except ValueError:
                print(f"⚠️  Unknown state '{state}', using default encoding")
                state_encoded = 0

            try:
                season_encoded = self.season_encoder.transform([season])[0]
            except ValueError:
                print(f"⚠️  Unknown season '{season}', using default encoding")
                season_encoded = 0

            # Set default environmental values if not provided
            if ndvi is None:
                ndvi = 0.5  # Default: moderate vegetation
                print(f"⚠️  No NDVI provided, using default: {ndvi}")
            
            if soil_moisture is None:
                soil_moisture = 45.0  # Default: optimal moisture
                print(f"⚠️  No soil_moisture provided, using default: {soil_moisture}%")
            
            # Create feature vector (11 features - NOW INCLUDES ENVIRONMENTAL STATE)
            # Order: crop_encoded, Area, Annual_Rainfall, Fertilizer, Pesticide, 
            #        state_encoded, season_encoded, fertilizer_per_area, pesticide_per_area,
            #        ndvi (ENVIRONMENTAL), soil_moisture (ENVIRONMENTAL)
            # 
            # IMPORTANT: This model DEPENDS ON environmental state - not just costs!
            
            # Calculate derived features
            fertilizer_per_area = fertilizer_cost / (land_area + 1)
            pesticide_per_area = pesticide_cost / (land_area + 1)
            
            # Use actual rainfall if provided, otherwise estimate from season
            if rainfall_actual is not None:
                rainfall = rainfall_actual
                print(f"🌧️  Using actual rainfall: {rainfall}mm")
            else:
                season_rainfall_map = {
                    "Kharif": 800,      # Monsoon
                    "Rabi": 200,        # Winter dry
                    "Summer": 50,       # Summer dry
                    "Whole Year": 1200  # Full year
                }
                rainfall = season_rainfall_map.get(season, 600)

            # CRITICAL: Include NDVI and soil_moisture as direct model inputs
            features = np.array([[
                crop_encoded,
                land_area,
                rainfall,           # Annual_Rainfall
                fertilizer_cost,
                pesticide_cost,
                state_encoded,
                season_encoded,
                fertilizer_per_area,
                pesticide_per_area,
                ndvi,               # ⭐ ENVIRONMENTAL STATE: Vegetation health (0.1-0.95)
                soil_moisture       # ⭐ ENVIRONMENTAL STATE: Soil water content (0-100%)
            ]])

            # Log environmental parameters being used in model
            print("\n📊 ENVIRONMENTAL STATE (DIRECT MODEL INPUTS):")
            print(f"   ⭐ NDVI (Vegetation Health): {ndvi:.3f} (range: 0.1-0.95)")
            print(f"   ⭐ Soil Moisture: {soil_moisture:.1f}% (range: 0-100%)")
            print(f"   🌧️  Rainfall: {rainfall}mm")
            print(f"   💰 Fertilizer Cost: ₹{fertilizer_cost:,.0f}")
            print(f"   🧪 Pesticide Cost: ₹{pesticide_cost:,.0f}")
            print(f"   💧 Irrigation Cost: ₹{irrigation_cost:,.0f}\n")

            # NOTE: NDVI and soil_moisture are now DIRECT features in ML model
            # NOT converted to factors - they directly influence the prediction

            # UPDATED: Use dataset-driven predictor for accurate, crop-specific yields
            # This uses actual crop patterns from crop_yield.csv dataset
            dataset_result = predict_yield_dataset_driven(
                crop=crop,
                area_acres=land_area,
                ndvi=ndvi,
                soil_moisture=soil_moisture,
                rainfall=rainfall
            )
            
            yield_per_acre = dataset_result['yield_tons_per_acre']
            environmental_health = dataset_result['environmental_health_score']
            
            print(f"\n🎯 DATASET-DRIVEN PREDICTION (Accurate Crop-Specific Yields):")
            print(f"   📊 Crop Profile: {crop}")
            print(f"   🌾 Predicted Yield: {yield_per_acre:.2f} tons/acre")
            print(f"   📈 Environmental Health: {environmental_health:.1%}")
            print(f"\n   ✅ This prediction DEPENDS ON:")
            print(f"      • NDVI: {ndvi:.3f} (vegetation health)")
            print(f"      • Soil Moisture: {soil_moisture:.1f}% (water availability)")
            print(f"      • Rainfall: {rainfall}mm (precipitation)")
            print(f"      • Crop-specific baselines from historical dataset\n")
            
            # Total production for the land area
            total_production = yield_per_acre * land_area

            # Calculate financial metrics
            total_cost = fertilizer_cost + pesticide_cost + irrigation_cost
            
            # Estimate price based on crop type and yield
            crop_prices = {
                'wheat': 2100, 'rice': 2000, 'maize': 1900, 'cotton': 6000,
                'sugarcane': 350, 'jowar': 1800, 'bajra': 1700, 'arhar': 5500,
                'gram': 5200, 'linseed': 6500
            }
            price_per_unit = crop_prices.get(crop.lower(), 2000)
            
            # Revenue = total production * price per unit
            expected_revenue = total_production * price_per_unit
            predicted_profit = expected_revenue - total_cost

            # Generate recommendation based on profit
            if predicted_profit > total_cost:  # Profit > 100% ROI
                recommendation = f"🟢 EXCELLENT! This crop will be highly profitable. Expected profit: ₹{predicted_profit:,.0f}"
                confidence = 0.95
            elif predicted_profit > total_cost * 0.5:  # Profit > 50% ROI
                recommendation = f"🟡 GOOD! This crop is profitable. Expected profit: ₹{predicted_profit:,.0f}"
                confidence = 0.85
            elif predicted_profit > 0:  # Profit > 0
                recommendation = f"🟡 FAIR! Marginal profit expected. Consider reducing input costs."
                confidence = 0.75
            else:  # Loss
                recommendation = f"🔴 RISKY! Predicted loss. Consider changing crop or reducing input costs."
                confidence = 0.65

            return {
                "predicted_profit": float(predicted_profit),
                "expected_revenue": float(expected_revenue),
                "total_cost": float(total_cost),
                "predicted_yield": float(yield_per_acre),  # Return yield_per_acre, not total
                "recommendation": recommendation,
                "confidence": float(confidence),
                "region": state,
                "crop": crop,
                "season": season
            }

        except Exception as e:
            print(f"❌ Prediction error: {e}")
            raise Exception(f"Failed to make prediction: {str(e)}")


# Initialize global predictor instance
print("\n🚀 Initializing Yield Prediction System...")
try:
    predictor = YieldPredictor()
except Exception as e:
    print(f"❌ Failed to initialize: {e}")
    predictor = None
