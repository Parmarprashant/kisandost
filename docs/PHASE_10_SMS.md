# Domestic SMS Architecture & India DLT Compliance
## AgriShield 360° / KisanDost — Phase 10

---

## 1. Overview & Current Status

In Phase 10, the SMS delivery layer is implemented via Twilio Messaging API in `src/lib/notifications/smsProvider.ts`.

However, in accordance with Section 17 of the Phase 10 specification, **domestic SMS delivery is disabled by default via feature flag**:

```env
SMS_ENABLED=false
```

---

## 2. Regulatory Background: India TRAI DLT Framework

The Telecom Regulatory Authority of India (TRAI) enforces strict regulations on Commercial Communications under the **TCCCPR 2018** (Telecom Commercial Communications Customer Preference Regulations).

To legally dispatch SMS to Indian (+91) mobile numbers, an entity must fulfill the **Distributed Ledger Technology (DLT)** registration process across Indian telecom operators (Jio, Airtel, Vodafone Idea, BSNL):

### Required DLT Registration Steps for Production SMS:
1. **Principal Entity (PE) Registration**:
   - Register corporate identity, GST, and PAN with an operator DLT portal (e.g., Vilpower, DLT-Connect).
   - Generates a unique Principal Entity ID (`PE_ID`).
2. **Header (Sender ID) Registration**:
   - Register a 6-character alphabetic header (e.g., `KISAND`, `AGRSHL`).
   - Categorized as *Service Implicit* (for transactional OTP/critical agricultural risk alerts).
3. **Content Template Registration**:
   - Every message format must be pre-approved with exact static text and `{var}` placeholders.
   - Example:
     `KisanDost: {#var#} me {#var#} ka ucch jokhim paya gaya. Salaha app me dekhein.`
   - Generates a Content Template ID (`CT_ID`).
4. **Twilio DLT Association**:
   - The registered `PE_ID` and `CT_ID` must be passed in Twilio Messaging Service parameters for India domestic routing.

---

## 3. Safe Development Mode (`SMS_ENABLED=false`)

Until the organization completes official TRAI DLT onboarding:
- `smsProvider.ts` inspects `isSmsEnabled()`.
- If `false`, any attempt to dispatch SMS is safely skipped with status `SKIPPED`.
- The audit trail explicitly logs:
  `SMS_DISABLED_DLT_PENDING: India domestic SMS requires TRAI DLT/Sender ID registration before production dispatch.`
- The farmer still receives the advisory via **In-App Card**, **FCM Push Notification**, and **WhatsApp**.

---

## 4. Production Enablement Checklist

To enable live SMS when DLT registration is active:
1. Set `SMS_ENABLED=true` in `.env.local` or production environment.
2. Provide approved `TWILIO_SMS_FROM` (e.g., approved shortcode or alphanumeric Sender ID).
3. Ensure template text matches the exact character-for-character registered DLT string.
