import pandas as pd
import numpy as np

df = pd.read_csv('crop_yield.csv')
print('Dataset shape:', df.shape)
print('\nColumn names:')
print(df.columns.tolist())
print('\nFirst few rows:')
print(df.head(10))

print('\n=== CROP ANALYSIS ===')
print('\nUnique crops:')
crops = df['Crop'].unique()
print(crops)
print(f'\nTotal unique crops: {len(crops)}')

print('\n=== YIELD STATISTICS BY CROP ===')
crop_stats = df.groupby('Crop')['Yield'].describe()
print(crop_stats)

print('\n=== SAMPLES PER CROP ===')
print(df['Crop'].value_counts().sort_index())

print('\n=== AVERAGE YIELD BY CROP ===')
avg_yield = df.groupby('Crop')['Yield'].mean().sort_values(ascending=False)
print(avg_yield)

print('\n=== ENVIRONMENTAL FEATURES ===')
print('\nColumns containing environmental/feature data:')
for col in df.columns:
    if col not in ['Crop', 'yield']:
        print(f'  {col}: min={df[col].min()}, max={df[col].max()}, mean={df[col].mean():.2f}')
