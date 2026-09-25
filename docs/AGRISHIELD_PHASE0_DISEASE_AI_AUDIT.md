# AgriShield 360° — Phase 0: Disease AI Audit Report

**Audit Date**: September 2026  
**Auditor**: AgriShield 360° Systems Architecture Team  
**Scope**: Complete read-only audit of the disease detection model, services, and endpoints in `kisan-dost/ventureHack/kisan-next/src/lib/agriVisionService.ts`, `src/lib/geminiService.ts`, and `src/app/api/detect-disease/route.ts`.

---

## 1. Disease Detection System Specifications

```text
Model: EfficientNet-B5 + CBAM (Convolutional Block Attention Module) + YOLOv8 + U-Net hierarchical pipeline (Secondary fallback: Google Gemini 1.5 Flash via geminiService.ts)
Location: Remote serverless GPU infrastructure hosted on Modal.com (Primary) with local FastAPI fallback
Input format: multipart/form-data with field name "file"
Image requirements: Clear close-up photograph of an individual affected leaf (JPEG, PNG, WebP); maximum file size 5MB (enforced in /api/detect-disease)
Output format: JSON
Disease classes: Bacterial blight, Anthracnose, Boll rot, Leaf spot, Rust, Healthy crop, plus broader multi-class Indian agricultural foliar pathogen classes
Confidence available: YES (Categorical confidence "high" / "medium" / "low" mapped to 94%, 78%, and 52% respectively)
Severity available: NOT_IMPLEMENTED (Upstream interface specifies optional raw.segmentation.infected_area_pct, but it is dropped during service transformation; no severity rating, classification, or percentage is returned to the frontend or persisted)
Model version: v1 (Endpoint: /api/v1/diagnose, unversioned model weight tags)
Inference location: Cloud Remote (Modal.com serverless GPU) / Localhost fallback (127.0.0.1:8000)
API endpoint: POST /api/detect-disease (Next.js Gateway) -> POST https://parmarprashant--agrivision-diagnostic-engine-fastapi-app.modal.run/api/v1/diagnose (Upstream Engine)
```

---

## 2. Upstream vs Downstream Payload Transformation

### Upstream Raw Response (`AgriVisionRawResponse`)
```typescript
{
  crop: { name: string; confidence: number; status: string };
  plant_part: { name: string; confidence: number; status: string };
  diagnosis: {
    name: string;
    type: string;
    confidence: string; // "high" | "medium" | "low"
    status: string;
    farmer_headline: string;
    farmer_subheading: string;
  };
  advisory: {
    urgency: string;
    disease_description: string;
    chemical_control: string[];
    organic_control: string[];
    cultural_practices: string[];
    expert_verification_note: string;
  };
  evidence: string[];
  recommendation: string;
  requires_expert_verification: boolean;
  pests: Record<string, unknown>;
  segmentation?: {
    infected_area_pct?: number; // Defined in TS interface but NOT passed through
  };
  focus_region?: {
    is_focused: boolean;
    box_normalized: [number, number, number, number];
    box_pixels: [number, number, number, number];
    message: string;
  };
}
```

### Downstream Next.js Gateway Response (`/api/detect-disease`)
```typescript
{
  cropName: string;
  diseaseName: string;
  confidence: number; // 0 to 100
  description: string;
  symptoms: string[];
  causes: string[];
  precautions: string[];
  recommendedPesticides: Array<{
    name: string;
    productId: string | null;
    price: number | null;
    brand: string | null;
  }>;
  recommendedFertilizers: Array<{
    name: string;
    productId: string | null;
    price: number | null;
    brand: string | null;
  }>;
  requiresExpertVerification: boolean;
  focusRegion?: {
    isFocused: boolean;
    boxNormalized: [number, number, number, number];
    boxPixels: [number, number, number, number];
    message: string;
  };
}
```

---

## 3. Secondary / Fallback AI Service (`src/lib/geminiService.ts`)

- **Model**: `gemini-flash-latest` (`@google/generative-ai` SDK).
- **Environment Variable**: `GEMINI_API_KEY`.
- **Purpose**: Previously used as the primary vision engine before AgriVision deployment; currently acts as an alternate diagnostic fallback and generates district-level farming advisories using NVIDIA's Llama 3 70B endpoint (`https://integrate.api.nvidia.com/v1/chat/completions`).
- **Severity available**: **NOT_IMPLEMENTED** (Gemini prompt strictly requests crop type, disease name, confidence 0-100, symptoms, causes, precautions, pesticides, fertilizers; severity is omitted).

---

## 4. Key Findings & AgriShield Integration Gap

1. **Confidence Available**: Verified. Confidence score is available and can directly feed AgriShield risk thresholds.
2. **Severity Available**: **NOT_IMPLEMENTED**. The system currently cannot tell a farmer if an infection is Mild (<10%), Moderate (10–30%), or Severe (>30%). For AgriShield Risk Engine, foliar lesion severity should be either exposed from the U-Net segmentation layer or derived.
3. **Database Persistence**: **NOT_IMPLEMENTED**. Disease scans are ephemeral. Diagnosis data exists only in the HTTP response and component React state. It is **never** saved to MongoDB or attached to a farmer's registered crop or field.
4. **AgriShield Requirement**: In Phase 2, when an image is diagnosed, AgriShield must persist a scan event referencing `farmerId`, `fieldId`, and `cropId` so the Risk Engine can incorporate detected pests/diseases into the crop-health score.
