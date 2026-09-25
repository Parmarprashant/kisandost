# Phase 7 — Firebase Cloud Messaging (FCM) Integration & Architecture

**Date:** 2026-09-25  
**Project:** Kisan-Dost / AgriShield 360°  
**Module:** Phase 7 Event-Driven Push Notifications  

---

## 1. Overview & Architecture

Firebase Cloud Messaging (FCM) is utilized **strictly as a notification transport layer** for KisanDost / AgriShield 360°.

> [!IMPORTANT]
> **Database Authority:**  
> MongoDB remains the sole source of truth for all agronomic entities, risk evaluations, advisories, and interventions. No business logic or farmer records are stored in Firestore or Realtime Database.

```mermaid
flowchart TD
    A["Phase 6 RiskEvent (HIGH_RISK / ATTENTION)"] --> B["Phase 7 Advisory Resolver"]
    B --> C["Advisory Generated in MongoDB"]
    B --> D["AgriShield Notifier (advisoryNotifier.ts)"]
    D --> E{"Deduplication Guard"}
    E -- Already Sent -- --> F["Skip Notification (SKIPPED)"]
    E -- Unique Event -- --> G{"Firebase Admin Configured?"}
    G -- No / Error -- --> H["Store AgriNotification (UNAVAILABLE) - Non-Fatal!"]
    G -- Yes -- --> I["FCM Multicast (sendEachForMulticast)"]
    I --> J["Farmer Mobile/Web Device"]
    I --> K["Store AgriNotification (SENT)"]
```

---

## 2. Non-Fatal Transport Requirement (Hard Safety Constraint)

Under **Section 20 of the AgriShield Master Prompt**, push notification failures **MUST NEVER BLOCK** or roll back agricultural advisories:

- If Firebase environment variables are missing, invalid, or expired:
  1. The `RiskEvent` is evaluated successfully.
  2. The `AgriAdvisory` is persisted with full cultural, biological, and chemical actions.
  3. `FarmerIntervention` scheduling and confirmation functions normally.
  4. An `AgriNotification` record is saved in MongoDB with `deliveryStatus = 'UNAVAILABLE'`.
  5. The platform logs a clear diagnostic message without crashing.

---

## 3. Environment Variables & Credentials

The integration requires standard Firebase Web and Admin credentials:

### Client-Side Variables (Public Identifiers)
Configured in `.env.local` for frontend browser notification registration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kisandost-29975.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kisandost-29975
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kisandost-29975.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=85851576793
NEXT_PUBLIC_FIREBASE_APP_ID=1:85851576793:web:...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BN... (Existing Public VAPID Key)
```

### Server-Side Variables (Confidential Admin SDK)
Used only on backend Node.js server routes:
```env
FIREBASE_PROJECT_ID=kisandost-29975
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@kisandost-29975.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgI...\n-----END PRIVATE KEY-----\n"
```
> [!CAUTION]
> Never commit service account private keys to Git, include them in client bundles, or place them in public directories.

---

## 4. Notification Policy & Deduplication (Section 21)

To prevent notification fatigue and false alarms, notifications obey deterministic rules:

| Risk / Event State | Policy | Trigger Condition |
|---|---|---|
| **`HIGH_RISK`** | **Notify Once** | Dispatched immediately upon critical threshold or disease confirmation. Deduplicated per unique `[farmerId, riskEventId]`. |
| **`ATTENTION` / `MODERATE`** | **Notify on Action Needed** | Dispatched only when preventive farmer intervention or monitoring is required. |
| **`STABLE` / `LOW` / `NO_CONCERN`** | **Suppressed** | **No push notification.** Suppressed at the resolver level to prevent alert fatigue. |
| **`INCONCLUSIVE`** | **Rescan Request Only** | Dispatched only to request a fresh photo or prompt for agronomist review. No treatment notification. |
| **`INSUFFICIENT_DATA`** | **Evidence Request Only** | Dispatched only if missing weather or field sensor data requires farmer input. |
| **Intervention Reminder** | **Scheduled Reminder** | Dispatched when a scheduled cultural or chemical intervention is due. |

---

## 5. Token Management & Service Worker

- **Device Token Storage:** [`src/models/NotificationToken.ts`](file:///d:/1winbackup/desktop/Ganpat%20University/kisandost/kisan-dost/ventureHack/kisan-next/src/models/NotificationToken.ts) records active FCM tokens indexed by `userId`.
- **Automatic Dead Token Pruning:** If Firebase responds with `messaging/invalid-registration-token` or `messaging/registration-token-not-registered`, the token is immediately marked `isActive: false` in MongoDB.
- **Service Worker:** [`public/firebase-messaging-sw.js`](file:///d:/1winbackup/desktop/Ganpat%20University/kisandost/kisan-dost/ventureHack/kisan-next/public/firebase-messaging-sw.js) handles background push notifications, icon display, and click navigation to the relevant `/crops/[id]` advisory screen.
