# AgriShield 360° — Phase 9: Expert Verification & Human-In-The-Loop

**Status:** Certified Production Ready  
**Date:** September 2026  
**Security Model:** Strict Tenant Isolation & Multi-Role RBAC (Farmer, Expert, Reviewer, Admin)  
**Historical Guarantee:** Zero Silent Mutation (Immutable AI Predictions & Immutable Decision Snapshots)  
**AI Retraining Gate:** Non-Automatic (Training Candidates Stored with `CANDIDATE` Status)

---

## 1. Executive Summary & Objective

In agricultural diagnostic artificial intelligence, automated vision models occasionally encounter low lighting, ambiguous symptom presentation, atypical nutritional co-deficiencies, or unfamiliar crop stages, yielding low-confidence scores or inconclusive screening results.

Phase 9 establishes a **Human-in-the-Loop Expert Verification Layer** over the existing AgriVision diagnostic engine and Phase 7/8 risk and advisory architectures.

```
                  ┌─────────────────────────────────────────┐
                  │    Automated Crop Disease AI Scan       │
                  │   (AgriVision Model, FastApi/Modal)     │
                  └────────────────────┬────────────────────┘
                                       │
                    Confidence < 0.70 OR Inconclusive
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │      Deterministic Expert Ticket        │
                  │    (Status: OPEN, Priority Ranked)      │
                  └────────────────────┬────────────────────┘
                                       │
                        Admin / Reviewer Assignment
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │   Verified Agronomic Specialist Claim   │
                  │      (Status: ASSIGNED → IN_REVIEW)     │
                  └────────────────────┬────────────────────┘
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 │                                           │
                 ▼                                           ▼
       Needs More Evidence                          Clinical Decision Made
   (Photo Angle, Symptoms)                       (Confirm, Correct, Alt, etc.)
                 │                                           │
          Farmer Uploads                                     ▼
                 │                                  ┌───────────────────────────┐
                 └─────────────────────────────────►│   Final Human Verdict     │
                                                    │    (Status: VERIFIED)     │
                                                    └─────────────┬─────────────┘
                                                                  │
                                      ┌───────────────────────────┴───────────────────────────┐
                                      ▼                                                       ▼
                       ┌─────────────────────────────┐                         ┌─────────────────────────────┐
                       │  Immutable ExpertReview     │                         │ Verified Training Candidate │
                       │ (AI Snapshot + Human Notes) │                         │  (Status: CANDIDATE Only)   │
                       └─────────────────────────────┘                         └─────────────────────────────┘
```

---

## 2. Core Architectural Guarantees

1. **Zero-Mutation Historical Preservation:**
   An expert verification decision **never modifies or overwrites the original AI scan diagnosis**. The original `CropDiseaseScan` record remains 100% historically intact.
2. **Immutable AI Snapshot inside Review:**
   Every `ExpertReview` permanently encapsulates `aiPredictionSnapshot` (predicted pathogen, plant part, service name), `aiConfidenceSnapshot` (score and level), and `aiScreeningSnapshot`.
3. **Strict Tenant & Expert Isolation (Anti-IDOR):**
   - Farmers can only view and request reviews on their own scan sessions.
   - Experts can only view, start, and review tickets explicitly assigned to them.
   - Platform Administrators and Reviewers can inspect cross-tenant records for governance.
4. **Deterministic Priority Scoring:**
   Ticket priorities are derived systematically based on confidence brackets and clinical triggers (`CRITICAL` for score < 0.40; `HIGH` for inconclusive with low confidence; `MEDIUM` for score < 0.70).
5. **Deduplication Protection:**
   Submitting multiple review requests for the same unresolved scan returns the existing open ticket, preventing duplicate queue congestion.
6. **Regulatory Advisory Protection:**
   Free-text notes written by experts are preserved as clinical evidence and audit trails. Expert reviews do not invent pesticide recommendations. Downstream advisories strictly reference validated CIB&RC IPM rules.

---

## 3. Data Models

### A. ExpertProfile (`expert_profiles`)
Represents an accredited human agricultural scientist or extension specialist.

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | `ObjectId?` | Optional reference to platform `User` account |
| `fullName` | `String` | Scientist full name |
| `institutionName` | `String` | Institutional affiliation (e.g. KVK, ICAR Institute, SAU) |
| `institutionType` | `String` | `KVK`, `ICAR_INSTITUTE`, `SAU`, `DU`, `NGO` |
| `designation` | `String?` | Title (e.g. Senior Scientist, Plant Protection Specialist) |
| `specialization` | `[String]` | Domains (e.g. Plant Pathology, Entomology, Agronomy) |
| `crops` | `[String]` | Certified crops (e.g. Wheat, Rice, Mustard) |
| `districts` | `[String]` | Operational districts |
| `states` | `[String]` | Operational states |
| `officialEmail` | `String?` | Institutional contact email |
| `officialPhone` | `String?` | Institutional contact phone |
| `sourceType` | `String` | `ICAR_KVK`, `ICAR_DIRECTORY`, `ADMIN_VERIFIED`, `MANUAL_ENTRY` |
| `sourceReference`| `String` | Provenance reference (e.g. `KVK.txt Line 45`) |
| `verificationStatus` | `String` | `PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED` |
| `verifiedBy` | `String?` | User ID of reviewing administrator |
| `verifiedAt` | `Date?` | Approval timestamp |
| `isActive` | `Boolean` | Operational availability flag |

### B. ExpertTicket (`expert_tickets`)
Represents a verification case awaiting human clinical judgment.

| Field | Type | Description |
| :--- | :--- | :--- |
| `farmerId` | `String` | Tenant identifier of the crop owner |
| `fieldId` | `ObjectId` | Reference to agricultural field |
| `zoneId` | `ObjectId?` | Optional reference to management zone |
| `cropCycleId` | `ObjectId` | Reference to active runtime crop |
| `scanId` | `ObjectId` | Reference to underlying `CropDiseaseScan` |
| `riskEventId` | `ObjectId?` | Optional reference to associated `RiskEvent` |
| `status` | `String` | `OPEN`, `ASSIGNED`, `IN_REVIEW`, `NEEDS_MORE_EVIDENCE`, `VERIFIED`, `CANCELLED` |
| `priority` | `String` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `triggerType` | `String` | `LOW_CONFIDENCE`, `INCONCLUSIVE`, `FARMER_REQUEST`, `REVIEWER_REQUEST`, `ADMIN_REQUEST`, `DISPUTED_RESULT`, `RISK_ESCALATION` |
| `cropName` | `String` | Name of crop under review |
| `aiPredictedDisease` | `String` | Disease diagnosed by automated AI model |
| `aiConfidenceScore` | `Number` | Confidence score (0.0 to 1.0) |
| `imageUrl` | `String` | Primary diagnostic photograph |
| `assignedExpertId` | `ObjectId?`| Reference to assigned `ExpertProfile` |
| `assignedUserId` | `ObjectId?` | Reference to assigned expert `User` |
| `evidenceRequest` | `Object?` | Structured details of supplementary photos requested |
| `completedReviewId`| `ObjectId?`| Reference to completed `ExpertReview` |

### C. ExpertReview (`expert_reviews`)
Immutable clinical decision record.

| Field | Type | Description |
| :--- | :--- | :--- |
| `ticketId` | `ObjectId` | Reference to `ExpertTicket` |
| `expertId` | `ObjectId` | Reference to `ExpertProfile` |
| `expertUserId` | `ObjectId` | Reference to reviewing user |
| `scanId` | `ObjectId` | Reference to underlying scan |
| `aiPredictionSnapshot` | `Object` | Frozen snapshot of AI condition, pathogen type, plant part |
| `aiConfidenceSnapshot` | `Object` | Frozen snapshot of AI score and level |
| `aiScreeningSnapshot` | `String?` | Frozen screening result (`INCONCLUSIVE`, etc.) |
| `expertDecision` | `String` | `CONFIRMED_AI`, `CORRECTED`, `ALTERNATIVE_DIAGNOSIS`, `NO_DISEASE`, `INCONCLUSIVE`, `NEEDS_MORE_IMAGES` |
| `finalDiagnosis` | `String` | Clinical diagnosis confirmed or corrected by expert |
| `expertNotes` | `String` | Diagnostic reasoning and observations |
| `evidenceReviewed` | `[String]` | Clinical checklist of evaluated diagnostic markers |
| `verifiedTrainingSampleId` | `ObjectId?` | Reference to candidate training hook record |
| `linkedRiskEventId` | `ObjectId?` | Reference to updated verified RiskEvent |

### D. ExpertAuditLog (`expert_audit_logs`)
Append-only tamper-resistant log of every action in the verification workflow.

### E. VerifiedTrainingSample (`verified_training_samples`)
Training candidate hook holding expert-validated pairs. Default status is strictly `CANDIDATE`. Automatic retraining is disabled.

---

## 4. Verification Workflow & State Machine

```
              ┌───────────────┐
              │  OPEN TICKET  │
              └───────┬───────┘
                      │  Admin assigns verified expert
                      ▼
              ┌───────────────┐
              │   ASSIGNED    │
              └───────┬───────┘
                      │  Expert opens workstation
                      ▼
              ┌───────────────┐
   ┌─────────►│   IN_REVIEW   │◄────────┐
   │          └───────┬───────┘         │
   │                  │                 │
   │  Farmer uploads  │ Expert requests │
   │   photos & notes │ more evidence   │
   │                  ▼                 │
   │          ┌───────────────────────┐ │
   └──────────┤  NEEDS_MORE_EVIDENCE  ├─┘
              └───────────────────────┘
                      │
                      │ Expert submits final decision
                      ▼
              ┌───────────────┐
              │   VERIFIED    │ (Terminal State)
              └───────────────┘
```

---

## 5. Security & Tenant Isolation Enforcement

Every query for farmer-owned records strictly includes `farmerId: user._id.toString()`. Cross-tenant ticket creation attempts are rejected with HTTP 403 Forbidden. Experts are barred from opening or modifying cases not explicitly assigned to them.
