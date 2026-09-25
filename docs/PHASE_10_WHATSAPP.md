# WhatsApp Integration & Twilio Sandbox Guide
## AgriShield 360° / KisanDost — Phase 10

---

## 1. Overview

KisanDost delivers multi-lingual agricultural alerts, verified expert diagnoses, and action reminders via WhatsApp using the Twilio Messaging API.

Development utilizes the **Twilio WhatsApp Sandbox**, allowing immediate end-to-end message dispatch to connected test devices without requiring Meta business onboarding during early phases.

---

## 2. Configuration & Environment Variables

Credentials must be configured on the server side in `.env.local`:

```env
# Twilio Account SID (From Twilio Console)
TWILIO_ACCOUNT_SID=AC_your_account_sid_here

# Twilio Auth Token (Keep strictly confidential)
TWILIO_AUTH_TOKEN=your_auth_token_here

# Twilio WhatsApp Sender (Sandbox default)
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Security Rules:
- **Never expose `TWILIO_AUTH_TOKEN` in the frontend or public git commits.**
- **Never expose raw provider secrets in client-side bundles.**
- All dispatches execute from secure Next.js server actions or API endpoints (`/api/notifications/send`).

---

## 3. Sandbox vs Production Operational Differences

| Feature | Twilio WhatsApp Sandbox | Production Registered Sender |
|---|---|---|
| **Sender Number** | Shared (`+1 415 523 8886`) | Dedicated Business Number |
| **Recipient Opt-in** | Requires sandbox join code (e.g. `join <keyword>`) | Farmer opts in during onboarding |
| **Templates** | Twilio pre-approved sandbox templates only | Custom Meta-approved business templates |
| **Direct Messages** | Allowed within 24-hr session window | Allowed within 24-hr session window |
| **Setup Overhead** | Instant (Zero business paperwork) | Requires Meta Business Verification |

---

## 4. WhatsApp Template Registry (`whatsappTemplates.ts`)

To avoid hard-coded strings, templates are configured in `src/lib/notifications/whatsappTemplates.ts`:

```ts
export type WhatsAppTemplateKey =
  | 'HIGH_RISK'
  | 'EXPERT_VERIFIED'
  | 'ACTION_REMINDER'
  | 'REVIEW_COMPLETED'
  | 'EVIDENCE_REQUIRED';
```

In Sandbox mode, the provider automatically falls back to Twilio's pre-approved Content SID:
`HXb95625a48730bfacdd37e01f7b0373c3`

---

## 5. Non-Fatal Degradation

If Twilio returns a 4xx/5xx status or the recipient is not opted into the sandbox:
1. The error is captured and persisted in `LocalizedNotification` (`deliveryStatus = 'FAILED'`).
2. **The agricultural core workflow NEVER fails**:
   - The advisory remains published in the database.
   - In-app alerts and FCM push notifications remain fully functional.
   - Farm risk calculations remain unaffected.
