"""
Crop Yield Prediction Engine
Predicts yield (tons/hectare) based on crop type and environmental factors
"""

def predict_yield(crop, area, ndvi, soil_moisture, rainfall):
    """
    Predict crop yield based on environmental factors.
    
    Args:
        crop: Crop type (string)
        area: Land area in acres (float)
        ndvi: Vegetation health index (0-1, typically 0.1-0.95)
        soil_moisture: Soil moisture percentage (0-100)
        rainfall: Rainfall in mm (0-1000+)
    
    Returns:
        float: Predicted yield in tons per hectare
    """
    
    # Base yields by crop (tons/hectare)
    base_yields = {
        'wheat': 5.0,
        'rice': 6.0,
        'corn': 8.0,
        'sugarcane': 65.0,
        'cotton': 3.0,
        'soybean': 3.5,
        'jowar': 2.5,
        'bajra': 2.0,
        'arhar': 2.0,
        'gram': 2.0,
        'maize': 8.0,
        'linseed': 1.8,
        'barley': 4.5,
        'potato': 25.0,
        'tomato': 40.0,
        'onion': 35.0,
        'groundnut': 3.0,
    }
    
    base_yield = base_yields.get(crop.lower(), 4.0)
    
    # NDVI Factor (0.1-0.95 range) - Vegetation Health
    # Extremely responsive to vegetation changes
    if ndvi < 0.2:
        ndvi_factor = 0.1  # Bare soil - severe stress
    elif ndvi < 0.3:
        ndvi_factor = 0.25  # Very poor vegetation
    elif ndvi < 0.4:
        ndvi_factor = 0.45  # Poor vegetation
    elif ndvi < 0.5:
        ndvi_factor = 0.65  # Below average
    elif ndvi < 0.6:
        ndvi_factor = 0.85  # Fair
    elif ndvi < 0.7:
        ndvi_factor = 1.1   # Good
    elif ndvi < 0.8:
        ndvi_factor = 1.35  # Very good
    else:
        ndvi_factor = 1.6   # Excellent
    
    # Soil Moisture Factor (0-100%) - Water Availability
    # Gaussian curve with optimal around 40-50%
    optimal_moisture = 45
    deviation = abs(soil_moisture - optimal_moisture)
    
    if soil_moisture < 5:
        moisture_factor = 0.05  # Severe drought
    elif soil_moisture < 10:
        moisture_factor = 0.15  # Extreme drought
    elif soil_moisture < 15:
        moisture_factor = 0.35  # Severe drought stress
    elif soil_moisture < 20:
        moisture_factor = 0.6   # Moderate drought
    elif soil_moisture < 30:
        moisture_factor = 0.8   # Mild drought
    elif soil_moisture <= 50:
        # Optimal range - Gaussian
        gaussian = 1.0 - (deviation ** 2 / 800)
        moisture_factor = max(0.9, min(1.4, gaussian * 1.4))
    elif soil_moisture < 60:
        moisture_factor = 1.0   # Slightly above optimal
    elif soil_moisture < 70:
        moisture_factor = 0.85  # Wet conditions
    elif soil_moisture < 80:
        moisture_factor = 0.65  # Very wet - waterlogging risk
    else:
        moisture_factor = 0.3   # Severe waterlogging
    
    # Rainfall Factor (0-1000mm) - Precipitation Pattern
    # Optimal differs by crop, but generally 40-400mm season total
    if rainfall < 20:
        rainfall_factor = 0.15  # Severe drought
    elif rainfall < 40:
        rainfall_factor = 0.4   # Poor rainfall
    elif rainfall < 80:
        rainfall_factor = 0.7   # Below optimal
    elif rainfall < 150:
        rainfall_factor = 0.95  # Sub-optimal
    elif rainfall < 250:
        rainfall_factor = 1.15  # Good rainfall
    elif rainfall < 350:
        rainfall_factor = 1.3   # Optimal rainfall
    elif rainfall < 450:
        rainfall_factor = 1.25  # Slightly excessive
    elif rainfall < 600:
        rainfall_factor = 1.05  # High rainfall
    elif rainfall < 800:
        rainfall_factor = 0.8   # Very high - waterlogging risk
    else:
        rainfall_factor = 0.5   # Excessive - flooding/damage risk
    
    # Combine factors with weighted importance
    # NDVI: 50% (vegetation is critical)
    # Moisture: 35% (water availability crucial)
    # Rainfall: 15% (broader pattern already in moisture)
    combined_factor = (ndvi_factor * 0.50) + (moisture_factor * 0.35) + (rainfall_factor * 0.15)
    
    # Ensure realistic yield
    final_yield = base_yield * combined_factor
    
    # Clamp to reasonable range (0.1 to 2x base yield typically)
    if crop.lower() == 'sugarcane':
        final_yield = max(5.0, min(100.0, final_yield))
    else:
        final_yield = max(0.1, min(base_yield * 2.5, final_yield))
    
    return round(final_yield, 2)


# Example usage:
if __name__ == "__main__":
    # Test cases
    print("Test 1 - Good conditions:")
    yield1 = predict_yield("Sugarcane", 1.0, 0.75, 50, 300)
    print(f"  Sugarcane, NDVI=0.75, Moisture=50%, Rainfall=300mm: {yield1} tons/ha")
    
    print("\nTest 2 - Poor conditions:")
    yield2 = predict_yield("Sugarcane", 1.0, 0.10, 5, 50)
    print(f"  Sugarcane, NDVI=0.10, Moisture=5%, Rainfall=50mm: {yield2} tons/ha")
    
    print("\nTest 3 - Wheat, moderate conditions:")
    yield3 = predict_yield("Wheat", 2.0, 0.65, 35, 200)
    print(f"  Wheat, NDVI=0.65, Moisture=35%, Rainfall=200mm: {yield3} tons/ha")
