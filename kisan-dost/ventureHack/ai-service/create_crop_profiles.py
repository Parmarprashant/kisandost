import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

df = pd.read_csv('crop_yield.csv')

print("=== ANALYZING CROP-SPECIFIC ENVIRONMENTAL CORRELATIONS ===\n")

# Focus on major crops with sufficient data
major_crops = ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Potato', 'Onion', 'Cotton(lint)', 'Groundnut']

for crop in major_crops:
    crop_data = df[df['Crop'] == crop].copy()
    if len(crop_data) > 20:
        print(f"\n{crop}:")
        print(f"  Samples: {len(crop_data)}")
        print(f"  Yield range: {crop_data['Yield'].min():.2f} - {crop_data['Yield'].max():.2f} (avg: {crop_data['Yield'].mean():.2f})")
        
        # Correlations with environmental factors
        corr_rainfall = crop_data[['Annual_Rainfall', 'Yield']].corr().iloc[0, 1]
        corr_fertilizer = crop_data[['Fertilizer', 'Yield']].corr().iloc[0, 1]
        corr_pesticide = crop_data[['Pesticide', 'Yield']].corr().iloc[0, 1]
        
        print(f"  Correlation rainfall→yield: {corr_rainfall:.3f}")
        print(f"  Correlation fertilizer→yield: {corr_fertilizer:.3f}")
        print(f"  Correlation pesticide→yield: {corr_pesticide:.3f}")
        
        # Environmental factor ranges
        print(f"  Rainfall range: {crop_data['Annual_Rainfall'].min():.0f} - {crop_data['Annual_Rainfall'].max():.0f} mm")
        print(f"  Fertilizer range: {crop_data['Fertilizer'].min():.0f} - {crop_data['Fertilizer'].max():.0f}")
        print(f"  Pesticide range: {crop_data['Pesticide'].min():.0f} - {crop_data['Pesticide'].max():.0f}")

print("\n\n=== CREATING CROP-SPECIFIC ENVIRONMENTAL PROFILES ===\n")

# Create profiles for data-driven predictions
crop_profiles = {}
for crop in df['Crop'].unique():
    crop_data = df[df['Crop'] == crop].copy()
    if len(crop_data) >= 10:  # Only crops with enough data
        # Quantiles for environmental response modeling
        crop_profiles[crop] = {
            'avg_yield': crop_data['Yield'].mean(),
            'min_yield': crop_data['Yield'].quantile(0.1),  # 10th percentile (poor conditions)
            'max_yield': crop_data['Yield'].quantile(0.9),  # 90th percentile (good conditions)
            'avg_rainfall': crop_data['Annual_Rainfall'].mean(),
            'avg_fertilizer': crop_data['Fertilizer'].mean(),
            'avg_pesticide': crop_data['Pesticide'].mean(),
            'rainfall_sensitivity': crop_data[['Annual_Rainfall', 'Yield']].corr().iloc[0, 1] if len(crop_data) > 2 else 0,
            'fertilizer_sensitivity': crop_data[['Fertilizer', 'Yield']].corr().iloc[0, 1] if len(crop_data) > 2 else 0,
            'pesticide_sensitivity': crop_data[['Pesticide', 'Yield']].corr().iloc[0, 1] if len(crop_data) > 2 else 0,
        }

# Show key crops
print("Crop Profiles Summary:")
print("Crop | Avg Yield | Min Yield | Max Yield | Rainfall Sens | Fert Sens | Pest Sens")
print("-" * 90)
for crop in ['Rice', 'Wheat', 'Maize', 'Sugarcane', 'Potato', 'Onion']:
    if crop in crop_profiles:
        prof = crop_profiles[crop]
        print(f"{crop:15} | {prof['avg_yield']:8.2f} | {prof['min_yield']:8.2f} | {prof['max_yield']:8.2f} | "
              f"{prof['rainfall_sensitivity']:13.3f} | {prof['fertilizer_sensitivity']:9.3f} | {prof['pesticide_sensitivity']:9.3f}")

# Save profiles for use in predictor
import json
with open('crop_profiles.json', 'w') as f:
    # Convert numpy types to native Python for JSON serialization
    profiles_clean = {}
    for crop, data in crop_profiles.items():
        profiles_clean[crop] = {k: float(v) if isinstance(v, (np.floating, np.integer)) else v 
                               for k, v in data.items()}
    json.dump(profiles_clean, f, indent=2)
    print("\n✓ Saved crop_profiles.json")
