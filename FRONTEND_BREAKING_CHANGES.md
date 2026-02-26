# Frontend Updates After Backend Security Fixes

This document describes **breaking changes** and required frontend updates after the backend security fixes (Clerk auth, payment verification, user enumeration, CORS, and contact form).

---

## 1. **POST /api/client/create** — Now Requires Authentication

**Change:** Creating a user row is now a **protected** endpoint. The backend uses the **Clerk token** to get the user's email and no longer accepts `email` in the request body.

**Frontend implementation:**
- Call **POST /api/client/create** only **after** the user is signed in with Clerk (e.g. on cart checkout).
- The API client sends **Authorization: Bearer \<token\>** via the request interceptor (Clerk `getToken()`).
- **Request body:** send only optional `full_name` and `phone`. Do **not** send `email`.

**Correct request:**
```json
POST /api/client/create
Headers: Authorization: Bearer <clerk_session_token>
Body: { "full_name": "John", "phone": "+1234567890" }
```

---

## 2. **GET /api/client/check** — Generic Response (No User Enumeration)

**Change:** The backend no longer returns `{ exists: true }` or `{ exists: false }`. It always returns a generic message.

**Frontend implementation:**
- Do **not** rely on an `exists` field. Use `getClientCheckMessage(email)` if you need to show the generic message (e.g. on a sign-in page).
- Cart checkout no longer calls client/check; it calls client/create (with token) then proceeds to checkout.
- Optionally add **CAPTCHA** on any form that calls client/check to reduce abuse.
- The API is **rate-limited**; handle **429** with a user-friendly message (see §8).

---

## 3. **GET /api/payments/verify-session** — Now Requires Authentication

**Change:** Session verification is **protected**. The backend returns PII only if the checkout session belongs to the current user.

**Frontend implementation:**
- **Authorization: Bearer \<token\>** is sent automatically by the API client on all requests when the user is signed in.
- The success page calls `verifySession(sessionId)`; PII (`customer_email`, `amount_total`, `currency`) is shown only when present in the response. If the backend omits them (e.g. session not owned by user), the UI still shows "Payment verified" without repeating PII.

---

## 4. **Strict CORS**

**Change:** The backend allows only the origin set in **FRONTEND_URL** (and in development, e.g. `http://localhost:3000`).

**Frontend:** Ensure the app is served from the same origin configured in the backend’s `FRONTEND_URL`.

---

## 5. **Contact Form (POST /api/form/insert)** — Backend Escapes Data

**Change:** The backend escapes contact form `category` and `message` before storing.

**Frontend:**
- Submit request unchanged; frontend still sends sanitized `category` and `message`.
- **When rendering contact form submissions in any admin UI**, treat stored values as plain text. Do not render raw HTML; escape or show as plain text to avoid XSS even if backend escaping were missing.

---

## 6. **Payment Update (POST /api/payments/update-session)**

No frontend change needed if you already call this after Stripe return with a valid `session_id` and send the Bearer token (api client does this).

---

## 7. **Stripe Webhook**

Backend-only; no frontend changes.

---

## 8. **Rate Limiting (429)**

**Change:** The API returns **429 Too Many Requests** when rate limits are exceeded (e.g. stricter limit on GET /api/client/check).

**Frontend implementation:**
- The API client sets a clear error message on 429 (e.g. "Too many attempts. Please try again later.") and optionally uses the `Retry-After` header.
- Cart and other flows show this message to the user (e.g. via `t.cart.tooManyAttempts` in locales) and do not retry immediately.

---

## Summary Table

| Endpoint | Auth required | Other changes |
|----------|---------------|---------------|
| GET /api/client/check | No | Response is generic (no `exists`); rate-limited. Use `getClientCheckMessage(email)`. |
| POST /api/client/create | **Yes** | Send Bearer token; do not send `email` in body. |
| GET /api/payments/verify-session | **Yes** | Bearer token sent by api client; PII only if session is user’s. |
| POST /api/payments/update-session | Yes | No change. |
| POST /api/form/insert | Yes | Backend escapes input. Admin UI: render submissions as plain text. |
