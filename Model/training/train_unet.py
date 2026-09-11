"""
U-Net (ResNet-34) Lesion & Leaf Segmentation Training Script
"""
import os

def train_unet(dataset_path="segmentation_data", epochs=30, batch_size=8):
    print("="*60)
    print("🍃 KISANDOST - U-NET RESNET-34 LESION SEGMENTATION TRAINING")
    print("="*60)
    print(f"📁 Dataset: {dataset_path} | Epochs: {epochs} | Batch Size: {batch_size}")
    print("🎯 Loss: Dice Loss + Binary Cross Entropy (BCE)")
    print("="*60)

if __name__ == "__main__":
    train_unet()
