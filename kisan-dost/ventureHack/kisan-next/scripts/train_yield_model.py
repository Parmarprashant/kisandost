import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

# Create dummy dataset based on the requested format:
# Crop | Nitrogen | Phosphorus | Potassium | Rainfall | Fertilizer | Yield
def create_dummy_data():
    crops = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Sugarcane']
    data = []
    
    for _ in range(1000):
        crop = np.random.choice(crops)
        nitrogen = np.random.randint(40, 140)
        phosphorus = np.random.randint(20, 90)
        potassium = np.random.randint(20, 90)
        rainfall = np.random.randint(400, 1200)
        fertilizer = np.random.randint(50, 200)
        
        # Simple yield logic with some noise
        base_yield = {
            'Wheat': 30, 'Rice': 40, 'Maize': 25, 'Cotton': 15, 'Sugarcane': 80
        }[crop]
        
        # Influence of nutrients and rainfall
        yield_val = base_yield + (nitrogen * 0.05) + (phosphorus * 0.03) + (potassium * 0.02) + (rainfall * 0.01) + (fertilizer * 0.05)
        yield_val += np.random.normal(0, 2)
        
        data.append([crop, nitrogen, phosphorus, potassium, rainfall, fertilizer, yield_val])
    
    df = pd.DataFrame(data, columns=['Crop', 'Nitrogen', 'Phosphorus', 'Potassium', 'Rainfall', 'Fertilizer', 'Yield'])
    return df

def train_model():
    print("Generating synthetic data...")
    df = create_dummy_data()
    
    # One-hot encode Crop
    df_encoded = pd.get_dummies(df, columns=['Crop'])
    
    X = df_encoded.drop('Yield', axis=1)
    y = df_encoded['Yield']
    
    print("Training Random Forest model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Save model and feature names
    model_path = os.path.join(os.path.dirname(__file__), 'yield_model.joblib')
    joblib.dump({
        'model': model,
        'features': X.columns.tolist()
    }, model_path)
    
    print(f"Model saved to {model_path}")
    print("Features trained on:", X.columns.tolist())

if __name__ == "__main__":
    train_model()
