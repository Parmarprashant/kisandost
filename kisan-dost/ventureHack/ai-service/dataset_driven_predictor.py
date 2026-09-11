"""
Dataset-driven yield predictor using crop_yield.csv patterns.
This predictor uses crop-specific baseline yields and environmental sensitivities
extracted from historical agricultural data.
"""

import json
import numpy as np
from pathlib import Path

# Load crop profiles
profiles_path = Path(__file__).parent / 'crop_profiles.json'
with open(profiles_path) as f:
    crop_profiles = json.load(f)

def normalize_value(value, min_val, max_val):
    """Normalize value to 0-1 range"""
    if max_val == min_val:
        return 0.5
    return max(0, min((value - min_val) / (max_val - min_val), 1))

def predict_yield_dataset_driven(
    crop: str,
    area_acres: float,
    ndvi: float = 0.5,
    soil_moisture: float = 50,
    rainfall: float = 500
) -> dict:
    """
    Predict crop yield using dataset-driven crop profiles and environmental factors.
    
    Args:
        crop: Crop name
        area_acres: Area in acres (not used directly in yield calculation, for reference)
        ndvi: Normalized Difference Vegetation Index (0.1-0.95, higher is better)
        soil_moisture: Soil moisture percentage (0-100)
        rainfall: Annual rainfall in mm (0-1000)
    
    Returns:
        dict with yield_tons_per_acre and details
    """
    
    # Validate inputs
    if crop not in crop_profiles:
        # Return generic prediction if crop not in profiles
        base_yield = 5.0  # Generic baseline
        crop_info = "unknown"
    else:
        profile = crop_profiles[crop]
        base_yield = profile['avg_yield']
        crop_info = crop
    
    # Environmental factor normalization (0-1 scale where 1 is ideal)
    # NDVI: higher is better (0.7+ is healthy)
    ndvi_normalized = normalize_value(ndvi, 0.1, 0.95)
    
    # Soil moisture: 40-60% is ideal
    optimal_moisture_range = (40, 60)
    if optimal_moisture_range[0] <= soil_moisture <= optimal_moisture_range[1]:
        moisture_normalized = 1.0
    else:
        # Penalty for being too dry or too wet
        center = 50
        distance = abs(soil_moisture - center)
        moisture_normalized = max(0.1, 1.0 - (distance / 50))
    
    # Rainfall: depends on crop, but generally 300-1000mm is good
    # Most crops don't like extreme rainfall
    if crop == 'Wheat':
        # Wheat prefers drier conditions (400-600mm optimum)
        rainfall_normalized = 1.0 - normalize_value(rainfall, 100, 1000)
    elif crop in ['Sugarcane', 'Rice']:
        # These prefer more water (500-1000mm)
        rainfall_normalized = normalize_value(rainfall, 200, 1000)
    else:
        # Generic crops prefer moderate (400-700mm)
        if 400 <= rainfall <= 700:
            rainfall_normalized = 1.0
        else:
            distance = min(abs(rainfall - 400), abs(rainfall - 700))
            rainfall_normalized = max(0.3, 1.0 - (distance / 400))
    
    # Combine environmental factors into environmental multiplier
    # All factors contribute equally to health
    environmental_health = (ndvi_normalized + moisture_normalized + rainfall_normalized) / 3
    
    # Apply crop-specific environmental sensitivities from dataset
    if crop in crop_profiles:
        profile = crop_profiles[crop]
        
        # Use crop's actual yield range from dataset
        min_yield = profile['min_yield']
        max_yield = profile['max_yield']
        avg_yield = profile['avg_yield']
        
        # Calculate yield as blend of poor to excellent conditions
        # Poor conditions = 10th percentile, Excellent = 90th percentile
        predicted_yield = min_yield + (max_yield - min_yield) * environmental_health
    else:
        # Generic calculation for unknown crops
        predicted_yield = base_yield * (0.5 + environmental_health)
    
    # Apply area multiplier (for reference, doesn't affect per-acre yield)
    # This is just for total production estimate
    total_production_tons = predicted_yield * area_acres
    
    return {
        'crop': crop_info,
        'yield_tons_per_acre': round(predicted_yield, 2),
        'estimated_total_production_tons': round(total_production_tons, 2),
        'environmental_health_score': round(environmental_health, 3),
        'ndvi_health': round(ndvi_normalized, 3),
        'moisture_health': round(moisture_normalized, 3),
        'rainfall_suitability': round(rainfall_normalized, 3),
        'confidence': 'high' if crop in crop_profiles else 'low'
    }

# Test the predictor
if __name__ == '__main__':
    print("=== Dataset-Driven Yield Predictor ===\n")
    
    # Test with different crops and conditions
    test_cases = [
        {'crop': 'Rice', 'ndvi': 0.75, 'soil_moisture': 50, 'rainfall': 600, 'area_acres': 1},
        {'crop': 'Rice', 'ndvi': 0.20, 'soil_moisture': 20, 'rainfall': 300, 'area_acres': 1},
        {'crop': 'Wheat', 'ndvi': 0.75, 'soil_moisture': 50, 'rainfall': 500, 'area_acres': 1},
        {'crop': 'Wheat', 'ndvi': 0.20, 'soil_moisture': 20, 'rainfall': 800, 'area_acres': 1},
        {'crop': 'Sugarcane', 'ndvi': 0.80, 'soil_moisture': 60, 'rainfall': 800, 'area_acres': 1},
        {'crop': 'Sugarcane', 'ndvi': 0.15, 'soil_moisture': 15, 'rainfall': 200, 'area_acres': 1},
        {'crop': 'Potato', 'ndvi': 0.70, 'soil_moisture': 45, 'rainfall': 500, 'area_acres': 1},
        {'crop': 'Onion', 'ndvi': 0.65, 'soil_moisture': 30, 'rainfall': 400, 'area_acres': 1},
    ]
    
    for test in test_cases:
        result = predict_yield_dataset_driven(**test)
        moisture_val = test['soil_moisture']
        print(f"{result['crop']:15} | NDVI={test['ndvi']} Moisture={moisture_val}% Rain={test['rainfall']}mm")
        print(f"  → {result['yield_tons_per_acre']} tons/acre (Health: {result['environmental_health_score']})")
        print()
