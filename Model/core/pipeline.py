"""
Unified Cloud AI Pipeline Orchestrator
Coordinates parallel inference across:
- EfficientNet-B5 + CBAM (Classification)
- YOLOv8n (Pest Detection)
- U-Net ResNet-34 (Lesion Severity Segmentation)
- Smart Fallback: Cloud Multimodal Vision (Confidence < 0.80)
"""
from PIL import Image
from models.efficientnet_cbam import EfficientNetB5_CBAM
from models.yolo_pest import YOLOPestDetector
from models.unet_segmenter import UNetResNet34Segmenter
from core.gemini_fallback import MultimodalVisionFallback
from core.advisory_engine import generate_advisory

class DiagnosticPipeline:
    def __init__(self):
        print("[Pipeline] Initializing Multi-Model Stack...")
        self.classifier = EfficientNetB5_CBAM()
        self.pest_detector = YOLOPestDetector()
        self.segmenter = UNetResNet34Segmenter()
        self.fallback_engine = MultimodalVisionFallback()
        self.confidence_threshold = 0.80
        print("[Pipeline] Multi-Model Stack Initialized Successfully.")

    def run(self, image: Image.Image, land_acres: float = 1.0):
        """
        Executes the end-to-end diagnostic workflow.
        """
        # 1. Parallel Sub-Inference
        cls_result = self.classifier.predict(image)
        pest_result = self.pest_detector.detect(image)
        seg_result = self.segmenter.segment(image)

        confidence = cls_result["confidence"]
        predicted_disease = cls_result["predicted_class"]
        used_fallback = False
        fallback_details = None

        # 2. Confidence Gating
        if confidence < self.confidence_threshold:
            # Trigger Smart Fallback
            fallback_details = self.fallback_engine.analyze_fallback(
                image, candidate_classes=cls_result["top3"]
            )
            used_fallback = True
            predicted_disease = fallback_details["primary_diagnosis"]
            confidence = fallback_details["confidence"]

        # 3. Agronomic Advisory Generation
        advisory = generate_advisory(
            disease_name=predicted_disease,
            pest_count=pest_result["pest_count"],
            severity_pct=seg_result["lesion_severity_pct"],
            land_acres=land_acres
        )

        # 4. Construct Unified Payload
        response_payload = {
            "status": "success",
            "pipeline_summary": {
                "active_branch": "Smart Cloud Fallback" if used_fallback else "Primary Model Stack",
                "classification_model": "Cloud Multimodal Vision" if used_fallback else "EfficientNet-B5 + CBAM",
                "pest_detector_model": "YOLOv8n",
                "segmentation_model": "U-Net (ResNet-34)",
                "confidence_threshold_applied": self.confidence_threshold
            },
            "diagnosis": {
                "disease_name": predicted_disease,
                "confidence": confidence,
                "confidence_percentage": f"{round(confidence * 100, 1)}%",
                "top_candidates": cls_result["top3"] if not used_fallback else [
                    {"class_name": predicted_disease, "confidence": confidence}
                ]
            },
            "pest_assessment": {
                "pests_detected_count": pest_result["pest_count"],
                "detections": pest_result["detections"]
            },
            "lesion_quantification": {
                "lesion_severity_pct": seg_result["lesion_severity_pct"],
                "severity_category": seg_result["severity_category"],
                "severity_level": seg_result["severity_level"],
                "leaf_area_pixels": seg_result["leaf_area_pixels"],
                "lesion_area_pixels": seg_result["lesion_area_pixels"]
            },
            "advisory": advisory,
            "fallback_metadata": fallback_details if used_fallback else {"triggered": False}
        }

        return response_payload
