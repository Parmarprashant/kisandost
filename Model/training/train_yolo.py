"""
YOLOv8n Pest Detection Training Script
"""
import os

def train_yolo(data_yaml="data.yaml", epochs=50, imgsz=640):
    print("="*60)
    print("🦗 KISANDOST - YOLOV8N PEST DETECTION TRAINING")
    print("="*60)
    print(f"📄 Config: {data_yaml} | Epochs: {epochs} | Image Size: {imgsz}")
    try:
        from ultralytics import YOLO
        model = YOLO("yolov8n.pt")
        print("✅ Base YOLOv8n initialized.")
    except ImportError:
        print("ℹ️ Ultralytics package required for local training: pip install ultralytics")

if __name__ == "__main__":
    train_yolo()
