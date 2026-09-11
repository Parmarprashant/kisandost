import requests
import json

print("Testing Dataset-Driven Yield Predictor API\n")
print("="*60)

# Test cases for different crops with good and poor environmental conditions
test_cases = [
    {
        "name": "Rice - Good conditions",
        "crop": "Rice",
        "land_area": 1,
        "fertilizer_cost": 5000,
        "pesticide_cost": 2000,
        "state": "West Bengal",
        "ndvi": 0.75,
        "soil_moisture": 50,
        "rainfall": 600
    },
    {
        "name": "Rice - Poor conditions",
        "crop": "Rice",
        "land_area": 1,
        "fertilizer_cost": 1000,
        "pesticide_cost": 500,
        "state": "Rajasthan",
        "ndvi": 0.20,
        "soil_moisture": 20,
        "rainfall": 300
    },
    {
        "name": "Sugarcane - Good conditions",
        "crop": "Sugarcane",
        "land_area": 1,
        "fertilizer_cost": 15000,
        "pesticide_cost": 3000,
        "state": "Maharashtra",
        "ndvi": 0.80,
        "soil_moisture": 60,
        "rainfall": 800
    },
    {
        "name": "Sugarcane - Poor conditions",
        "crop": "Sugarcane",
        "land_area": 1,
        "fertilizer_cost": 5000,
        "pesticide_cost": 1000,
        "state": "Rajasthan",
        "ndvi": 0.15,
        "soil_moisture": 15,
        "rainfall": 200
    },
    {
        "name": "Wheat - Good conditions",
        "crop": "Wheat",
        "land_area": 1,
        "fertilizer_cost": 6000,
        "pesticide_cost": 1500,
        "state": "Punjab",
        "ndvi": 0.75,
        "soil_moisture": 50,
        "rainfall": 500
    },
    {
        "name": "Potato - Good conditions",
        "crop": "Potato",
        "land_area": 1,
        "fertilizer_cost": 8000,
        "pesticide_cost": 2500,
        "state": "Himachal Pradesh",
        "ndvi": 0.70,
        "soil_moisture": 45,
        "rainfall": 500
    },
]

for test in test_cases:
    print(f"\n📋 {test['name']}")
    print(f"   NDVI: {test['ndvi']}, Moisture: {test['soil_moisture']}%, Rain: {test['rainfall']}mm")
    
    try:
        response = requests.post(
            'http://localhost:8000/predict-yield',
            json=test,
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Predicted Yield: {result['predicted_yield']:.2f} tons/acre")
            print(f"   💰 Expected Revenue: ₹{result['expected_revenue']:,.0f}")
            print(f"   📊 Profit: ₹{result['predicted_profit']:,.0f}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

print("\n" + "="*60)
print("✅ Test completed!")
