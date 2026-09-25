# AgriShield 360° — Phase 9 API Reference

**Base URL:** `/api/expert`  
**Authentication:** HTTP-only Cookie (`__kisan_auth_token`) or `Authorization: Bearer <jwt>`  
**RBAC System:** Farmer (`farmer`), Expert (`expert`), Reviewer (`reviewer`), Administrator (`admin`)

---

## 1. Endpoint Summary

| Method | Endpoint | Authorized Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/expert/tickets` | Farmer, Expert, Reviewer, Admin | List verification tickets (strictly tenant-isolated for farmers and assigned experts) |
| `POST` | `/api/expert/tickets` | Farmer, Reviewer, Admin | Create a new verification ticket |
| `GET` | `/api/expert/tickets/:id` | Farmer (owner), Expert (assigned), Reviewer, Admin | Retrieve ticket details, scan context, weather, risk events, and audit trail |
| `PATCH` | `/api/expert/tickets/:id/assign` | Reviewer, Admin | Assign verified expert to an open ticket |
| `PATCH` | `/api/expert/tickets/:id/start` | Assigned Expert | Start review, transitioning case to `IN_REVIEW` |
| `POST` | `/api/expert/tickets/:id/review` | Assigned Expert | Submit final clinical diagnosis and expert notes |
| `PATCH` | `/api/expert/tickets/:id/request-evidence` | Assigned Expert | Request supplementary photos from farmer (`NEEDS_MORE_EVIDENCE`) |
| `PATCH` | `/api/expert/tickets/:id/evidence` | Farmer (owner) | Upload requested additional photograph |
| `PATCH` | `/api/expert/tickets/:id/cancel` | Farmer (owner), Reviewer, Admin | Cancel open verification request |
| `GET` | `/api/expert/profiles` | Authenticated Users | List expert profiles with filters (`status`, `crop`, `district`) |
| `POST` | `/api/expert/profiles` | Authenticated Users | Submit candidate expert credentials |
| `PATCH` | `/api/expert/profiles/:id` | Admin | Approve, reject, or suspend an expert profile |
| `GET` | `/api/expert/scans/:scanId` | Farmer (owner), Assigned Expert, Admin | Fetch full diagnostic context for a crop scan |
| `GET` | `/api/expert/institutions` | Authenticated Users | Query institutional discovery catalog (KVKs & ICAR Directory) |

---

## 2. Selected Endpoint Specifications

### `POST /api/expert/tickets`
Creates a human verification request.
- **Request Body:**
  ```json
  {
    "scanId": "65b2f8a1c9e7a4b8d1234567",
    "requestedReason": "Symptoms resemble both leaf rust and stripe rust. Need expert confirmation.",
    "triggerType": "FARMER_REQUEST"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Expert verification ticket created successfully",
    "ticket": {
      "_id": "6798e1a2f4c3b2a1d0001111",
      "farmerId": "farmer_12345",
      "cropName": "Wheat",
      "aiPredictedDisease": "Wheat Leaf Rust (Puccinia triticina)",
      "aiConfidenceScore": 0.58,
      "status": "OPEN",
      "priority": "MEDIUM",
      "triggerType": "LOW_CONFIDENCE"
    }
  }
  ```

### `POST /api/expert/tickets/:id/review`
Submits final clinical verdict.
- **Request Body:**
  ```json
  {
    "expertDecision": "CORRECTED",
    "finalDiagnosis": "Wheat Yellow Rust (Puccinia striiformis)",
    "expertNotes": "Pustules arranged in linear stripes between veins confirm stripe/yellow rust rather than brown leaf rust.",
    "evidenceReviewed": ["Foliar Lesion Margins", "Linear Stripe Distribution"]
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Expert review submitted successfully",
    "ticket": { "status": "VERIFIED" },
    "review": {
      "expertDecision": "CORRECTED",
      "finalDiagnosis": "Wheat Yellow Rust (Puccinia striiformis)",
      "aiPredictionSnapshot": { "diseaseName": "Wheat Leaf Rust (Puccinia triticina)" }
    }
  }
  ```

### `PATCH /api/expert/tickets/:id/request-evidence`
Requests more images from the farmer.
- **Request Body:**
  ```json
  {
    "requestedEvidence": "Close-up photograph of lower leaf underside in natural morning daylight",
    "requestedPlantPart": "leaf",
    "requestedPhotoAngle": "closeup",
    "expertNotes": "Canopy photo is blurred. Need macro shot to distinguish pustule structure."
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Additional evidence requested from farmer",
    "ticket": { "status": "NEEDS_MORE_EVIDENCE" }
  }
  ```

---

## 3. Error Codes & Security Responses

- `401 Unauthorized`: Missing or invalid session token.
- `403 Forbidden`: Cross-tenant access attempt (e.g. Farmer accessing another farmer's ticket, or unassigned expert modifying a case).
- `404 Not Found`: Ticket, scan, or expert profile does not exist.
- `400 Bad Request`: Validation failure (e.g. missing required notes for inconclusive decisions).
