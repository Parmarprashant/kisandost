#!/usr/bin/env python3
"""
Test script to verify that yield prediction model depends on environmental state
Tests that NDVI and soil_moisture directly impact predictions
"""

import requests
import json
from typing import Dict, Any

# API endpoint
API_URL = "http://localhost:8000/predict-yield"

def test_prediction(test_name: str, ndvi: float, soil_moisture: float, rainfall: float = 300) -> Dict[str, Any]:
    """Make a prediction request and return the result"""
    print(f"\n{'='*70}")
    print(f"🧪 TEST: {test_name}")
    print(f"{'='*70}")
    print(f"📊 Input Parameters:")
    print(f"   NDVI: {ndvi:.3f} (range: 0.1-0.95)")
    print(f"   Soil Moisture: {soil_moisture:.1f}% (range: 0-100)")
    print(f"   Rainfall: {rainfall}mm")
    
    payload = {
        "crop": "wheat",
        "land_area": 10.0,
        "fertilizer_cost": 50000,
        "pesticide_cost": 15000,
        "irrigation_cost": 20000,
        "state": "Rajasthan",
        "season": "Kharif",
        "ndvi": ndvi,
        "soil_moisture": soil_moisture,
        "rainfall": rainfall
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ ERROR: {response.status_code}")
            print(f"   {response.text}")
            return None
        
        result = response.json()
        
        print(f"\n🎯 PREDICTION RESULT:")
        print(f"   Predicted Yield: {result.get('predicted_yield', 'N/A'):.2f} tons/acre")
        print(f"   Expected Revenue: ₹{result.get('expected_revenue', 0):,.0f}")
        print(f"   Total Cost: ₹{result.get('total_cost', 0):,.0f}")
        print(f"   Predicted Profit: ₹{result.get('predicted_profit', 0):,.0f}")
        print(f"   Confidence: {result.get('confidence', 0)*100:.0f}%")
        print(f"   Recommendation: {result.get('recommendation', 'N/A')}")
        
        return result
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None


def compare_predictions(results: list) -> None:
    """Compare predictions to verify environmental dependency"""
    print(f"\n{'='*70}")
    print(f"📈 ENVIRONMENTAL DEPENDENCY ANALYSIS")
    print(f"{'='*70}")
    
    if len(results) < 2:
        print("❌ Not enough predictions to compare")
        return
    
    base_yield = results[0].get('predicted_yield', 0) if results[0] else 0
    
    for i in range(1, len(results)):
        if not results[i]:
            continue
        
        yield_i = results[i].get('predicted_yield', 0)
        diff = yield_i - base_yield
        pct_change = (diff / base_yield * 100) if base_yield != 0 else 0
        
        print(f"\nTest {i} vs Test 1:")
        print(f"   Yield Difference: {diff:+.2f} tons/acre ({pct_change:+.1f}%)")
        
        if abs(pct_change) > 5:
            print(f"   ✅ GOOD: Environmental factors caused {abs(pct_change):.1f}% yield change")
        else:
            print(f"   ⚠️  WARNING: Environmental factors had minimal impact ({abs(pct_change):.1f}%)")
            print(f"      Expected >5% change for environmental dependency")


def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("🌾 KISAN DOST - ENVIRONMENTAL STATE DEPENDENCY TEST")
    print("="*70)
    print("\nThis script verifies that yield predictions depend on:")
    print("  • NDVI (Vegetation Health): 0.1-0.95")
    print("  • Soil Moisture: 0-100%")
    print("  • Rainfall: 0-1000mm")
    
    results = []
    
    # TEST 1: Optimal environmental conditions
    print(f"\n{'🌟'*35}")
    print("SCENARIO 1: OPTIMAL CONDITIONS")
    print(f"{'🌟'*35}")
    print("Healthy vegetation, good moisture, adequate rainfall")
    r1 = test_prediction(
        "Optimal Environment",
        ndvi=0.80,      # Healthy vegetation
        soil_moisture=50,   # Optimal moisture
        rainfall=350        # Adequate rainfall
    )
    results.append(r1)
    
    # TEST 2: Stressed environmental conditions
    print(f"\n{'🔴'*35}")
    print("SCENARIO 2: STRESSED CONDITIONS")
    print(f"{'🔴'*35}")
    print("Poor vegetation, low moisture, inadequate rainfall")
    r2 = test_prediction(
        "Stressed Environment",
        ndvi=0.15,      # Poor vegetation (bare soil)
        soil_moisture=10,   # Dry
        rainfall=80         # Low rainfall
    )
    results.append(r2)
    
    # TEST 3: Mixed conditions
    print(f"\n{'🟡'*35}")
    print("SCENARIO 3: MODERATE CONDITIONS")
    print(f"{'🟡'*35}")
    print("Moderate vegetation, moderate moisture")
    r3 = test_prediction(
        "Moderate Environment",
        ndvi=0.50,      # Moderate vegetation
        soil_moisture=40,   # Fair moisture
        rainfall=250        # Moderate rainfall
    )
    results.append(r3)
    
    # TEST 4: NDVI variation (all else equal)
    print(f"\n{'🍃'*35}")
    print("SCENARIO 4: NDVI SENSITIVITY TEST")
    print(f"{'🍃'*35}")
    print("Keeping moisture/rainfall constant, varying NDVI")
    
    ndvi_results = []
    for ndvi_val in [0.2, 0.5, 0.8]:
        r = test_prediction(
            f"NDVI={ndvi_val} (Fixed moisture/rainfall)",
            ndvi=ndvi_val,
            soil_moisture=45,
            rainfall=300
        )
        ndvi_results.append(r)
        results.append(r)
    
    # TEST 5: Moisture variation (all else equal)
    print(f"\n{'💧'*35}")
    print("SCENARIO 5: SOIL MOISTURE SENSITIVITY TEST")
    print(f"{'💧'*35}")
    print("Keeping NDVI/rainfall constant, varying moisture")
    
    moisture_results = []
    for moisture_val in [15, 45, 75]:
        r = test_prediction(
            f"Soil Moisture={moisture_val}% (Fixed NDVI/rainfall)",
            ndvi=0.65,
            soil_moisture=moisture_val,
            rainfall=300
        )
        moisture_results.append(r)
        results.append(r)
    
    # Analysis
    compare_predictions(results)
    
    # Detailed NDVI analysis
    print(f"\n{'='*70}")
    print("📊 NDVI SENSITIVITY ANALYSIS")
    print(f"{'='*70}")
    if all(ndvi_results):
        yields = [r.get('predicted_yield', 0) for r in ndvi_results]
        for i, (ndvi_val, yield_val) in enumerate(zip([0.2, 0.5, 0.8], yields)):
            print(f"NDVI {ndvi_val:.1f} → Yield {yield_val:.2f} tons/acre")
        
        yield_range = max(yields) - min(yields)
        if yield_range > 1.0:
            print(f"✅ STRONG NDVI DEPENDENCY: {yield_range:.2f} tons/acre range")
        elif yield_range > 0.5:
            print(f"⚠️  MODERATE NDVI DEPENDENCY: {yield_range:.2f} tons/acre range")
        else:
            print(f"❌ WEAK NDVI DEPENDENCY: {yield_range:.2f} tons/acre range")
    
    # Detailed Moisture analysis
    print(f"\n{'='*70}")
    print("💧 SOIL MOISTURE SENSITIVITY ANALYSIS")
    print(f"{'='*70}")
    if all(moisture_results):
        yields = [r.get('predicted_yield', 0) for r in moisture_results]
        for i, (moisture_val, yield_val) in enumerate(zip([15, 45, 75], yields)):
            print(f"Moisture {moisture_val:2d}% → Yield {yield_val:.2f} tons/acre")
        
        yield_range = max(yields) - min(yields)
        if yield_range > 1.0:
            print(f"✅ STRONG MOISTURE DEPENDENCY: {yield_range:.2f} tons/acre range")
        elif yield_range > 0.5:
            print(f"⚠️  MODERATE MOISTURE DEPENDENCY: {yield_range:.2f} tons/acre range")
        else:
            print(f"❌ WEAK MOISTURE DEPENDENCY: {yield_range:.2f} tons/acre range")
    
    print(f"\n{'='*70}")
    print("✅ TEST COMPLETE")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    print("\n⏳ Waiting for API server at http://localhost:8000...")
    print("   Make sure AI service is running: python server.py")
    print("   Press Ctrl+C to cancel\n")
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Test cancelled by user")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
