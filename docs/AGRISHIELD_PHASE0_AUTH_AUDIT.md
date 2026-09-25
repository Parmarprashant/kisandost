# AgriShield 360° — Phase 0: Authentication Audit Report

**Audit Date**: September 2026  
**Auditor**: AgriShield 360° Systems Architecture Team  
**Scope**: Complete read-only audit of identity, session management, and authorization in `kisan-dost/ventureHack/kisan-next/src/lib/auth.ts`, `src/models/User.ts`, `src/middleware.ts`, and `src/components/providers/AuthProvider.tsx`.

---

## 1. Authentication Specifications

```text
Auth provider: Custom JWT Authentication + Google OAuth 2.0 (Note: Clerk was referenced in early repo documentation, but was fully replaced in code with a self-hosted bcrypt + jose JWT implementation).
Login mechanism:
  1. Standard Credentials: POST /api/auth/login with JSON { username, password }. Password is verified against bcrypt hash.
  2. Quick Demo Login: One-click farmer button in auth/page.tsx authenticating as "demo_farmer" (auto-creates if absent).
  3. Google OAuth 2.0: GET /api/auth/google initiates consent flow; GET /api/auth/google/callback exchanges code, fetches profile, creates/finds User, and issues token.
Registration mechanism: POST /api/auth/register with JSON { username, password, name, mobile, mainCrop }. Hashes password with bcrypt (salt rounds: 10), saves MongoDB User record, issues JWT, sets HTTP-only cookie.
Token/session mechanism: Stateless HS256 JWT generated via 'jose' library, signed with process.env.JWT_SECRET (fallback: 'fallback_secret_key_for_development'), valid for 7 days. Stored in an HTTP-only, SameSite=Lax, Path=/ cookie named "__kisan_auth_token".
User ID format: MongoDB ObjectId 24-character hexadecimal string (e.g. "65f8a92b1c4e7d0012345678"), stored in JWT payload as { userId: string }.
Protected API mechanism: Server-side helper auth() in src/lib/auth.ts reads cookie "__kisan_auth_token", executes jwtVerify(token, key), and returns { userId }. Protected endpoints return 401 Unauthorized if userId is null.
Protected frontend routes: Client-side protection via useAuth() hook and AuthProvider. If user is null or session expired, user is redirected to /[locale]/auth. Middleware.ts currently does not block pages at edge.
```

---

## 2. Authentication Flow Diagram

```
Farmer Browser                           Next.js API Gateway                MongoDB
      │                                           │                            │
      │ 1. POST /api/auth/login {user, pwd}       │                            │
      ├──────────────────────────────────────────>│                            │
      │                                           │ 2. User.findOne(username)  │
      │                                           ├───────────────────────────>│
      │                                           │<───────────────────────────┤
      │                                           │ 3. bcrypt.compare(pwd)     │
      │                                           │ 4. SignJWT({userId})       │
      │<──────────────────────────────────────────┤                            │
      │ 5. Set-Cookie: __kisan_auth_token=jwt     │                            │
      │                                           │                            │
      │ 6. GET /api/fields (Cookie included)      │                            │
      ├──────────────────────────────────────────>│                            │
      │                                           │ 7. auth() -> verifyToken() │
      │                                           │ 8. Field.find({farmerId})  │
      │                                           ├───────────────────────────>│
      │                                           │<───────────────────────────┤
      │<──────────────────────────────────────────┤                            │
      │ 9. Response: [Fields for farmerId]        │                            │
```

---

## 3. Associating AgriShield Farm / Field with Authenticated Farmer

AgriShield 360° will directly utilize the existing relational data model established in `src/models/Field.ts` and `src/models/Crop.ts`:

1. **Farmer Identity Binding**:
   - Whenever an authenticated farmer visits `/dashboard/my-crops` or calls any AgriShield API, the backend calls `const { userId } = await auth();`.
   - If `!userId`, the request is rejected with `401 Unauthorized`.

2. **Field Ownership**:
   - A field represents a farmer's physical land parcel.
   - When registered via `POST /api/fields`, `Field.create({ farmerId: userId, name, area, location: { latitude, longitude, ... }, ... })` permanently binds the parcel to the farmer's `userId`.
   - All subsequent field queries are scoped strictly to `{ farmerId: userId }`, ensuring zero multi-tenant data leakage.

3. **Crop Cycle Binding**:
   - When a crop is registered on that field via `POST /api/fields/[id]/crops`, the crop record stores both `fieldId: field._id` and `farmerId: userId`.
   - AgriShield's GDD calculator, stage engine, weather risk engine, and harvest predictor will query crops by `farmerId: userId` and `fieldId`, guaranteeing that every recommendation is calculated specifically for that farmer's plot.
