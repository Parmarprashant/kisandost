# AgriShield 360° / KisanDost — Phase 10 Architecture
## Multi-Lingual Advisory + Self-Hosted TTS + Multi-Modal Delivery

---

## 1. Executive Summary

Phase 10 introduces a governed, deterministic multi-modal notification and advisory delivery layer for the KisanDost / AgriShield 360° ecosystem. It converts validated agronomic risk events and expert verification verdicts into localized text, natural speech audio, WhatsApp alerts, and FCM push notifications.

```
VALIDATED AGRICULTURAL ADVISORY (Phase 8)
                 +
PHASE 9 VERIFIED DIAGNOSIS (Human-in-the-Loop)
                 ↓
STRUCTURED ADVISORY NARRATIVE (advisoryNarrative.ts)
                 ↓
DETERMINISTIC LOCALIZATION (advisoryRenderer.ts)
                 ↓
    +------------+------------+------------+
    |            |            |            |
    v            v            v            v
  TEXT         VOICE       WHATSAPP       SMS (Flagged)
(UI Card)   (Vexyl-TTS)    (Twilio)     (DLT Pending)
    |            |            |            |
    +------------+------------+------------+
                 ↓
        FARMER / TENANT (hi-IN, gu-IN, mr-IN)
```

---

## 2. Core Principles & Safety Boundaries

1. **Zero LLM Hallucination in Critical Path**: All agronomic actions, chemical dosages, spray methods, and pre-harvest intervals (PHI) strictly flow from Phase 8 CIB&RC validated rules. No LLM translates or modifies chemical instructions.
2. **Deterministic Localization**: Localization uses deterministic grammar templates and verified terminology dictionaries for Hindi (`hi-IN`), Gujarati (`gu-IN`), and Marathi (`mr-IN`).
3. **Non-Fatal Degradation**:
   - If Vexyl-TTS is offline: `voiceStatus = UNAVAILABLE`. Text advisories remain fully accessible.
   - If WhatsApp fails: In-app and FCM remain accessible.
   - Core advisory creation, risk evaluation, and expert verification tickets are **never blocked or rolled back** by messaging failures.
4. **Tenant Isolation**: Farmers can only access and dispatch advisories for their own farm zones. History queries enforce strict `farmerId` checks.

---

## 3. Supported Languages

| Language Code | Language | Native Label | Default Voice / Speaker | Formal Voice / Speaker |
|---|---|---|---|---|
| `hi-IN` | Hindi | हिन्दी | Divya (Calm / Instructional) | Rohit (Formal) |
| `gu-IN` | Gujarati | ગુજરાતી | Neha (Calm / Instructional) | Yash (Formal) |
| `mr-IN` | Marathi | मराठी | Sunita (Calm / Instructional) | Sanjay (Formal) |

### Fallback Hierarchy:
`Farmer Preference` → `Requested Language` → `hi-IN (Default Indic Fallback)`
*English is never silently substituted without explicit farmer request.*

---

## 4. Multi-Modal Pipeline Components

### 4.1 Structured Advisory Narrative (`src/lib/advisory/advisoryNarrative.ts`)
Converts internal MongoDB models (`IAgriAdvisory`, `IRiskEvent`, `IExpertTicket`) into a normalized `StructuredAdvisoryPayload` containing:
- `crop`
- `threat`
- `riskLevel` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `verifiedStatus` (`VERIFIED`, `NEEDS_MORE_EVIDENCE`, `IN_REVIEW`, `AI_ONLY`)
- `whyAlert`
- `recommendedActions`
- `chemicalAction` (only if validated in Phase 8)
- `nextCheck`

### 4.2 Localization Engine (`src/lib/i18n/`)
- `terminology.ts`: Canonical dictionaries for crops, diseases, risk ratings, and agronomic terms.
- `locales/hi-IN.ts`: Hindi deterministic templates.
- `locales/gu-IN.ts`: Gujarati deterministic templates.
- `locales/mr-IN.ts`: Marathi deterministic templates.
- `advisoryRenderer.ts`: Assembles localized text formats:
  - `title` & `summary`
  - `fullText` (Dashboard display)
  - `speechText` (Phonetically optimized for Vexyl-TTS)
  - `whatsappText` (Markdown formatted with emojis and bullets)
  - `smsText` (Concise summary within SMS limits)

### 4.3 Notification Orchestrator (`src/lib/notifications/notificationOrchestrator.ts`)
Applies Channel Policy:
- **LOW / STABLE Risk**: Suppressed for WhatsApp and SMS; dispatched only via FCM / in-app.
- **MEDIUM Risk**: FCM dispatched; WhatsApp optional.
- **HIGH / CRITICAL Risk**: FCM + WhatsApp + Voice synthesis.
- **Expert Review Completed**: FCM + WhatsApp notification.

Audits every delivery attempt in `LocalizedNotification` collection.
