# Security Issues

This document lists identified security issues and recommendations for the Clerk-01 project.

**Frontend fixes applied:** Open redirect (1), unencoded `session_id` (2), production console logging (3), cancel-order email (5), contact-form sanitization (6), error typing (7), env/API note (8). Backend/design items (4 user enumeration, 5 backend auth, 6 backend escape, 8 backend CORS/auth) still need to be implemented where applicable.

---

## 1. Open Redirect (Sign-in) — FIXED (frontend)

**Location:** `app/sign-in/[[...sign-in]]/SignInClient.tsx`

**Issue:** The `redirect_url` query parameter is taken from the URL, decoded, and passed to Clerk’s `fallbackRedirectUrl` without validation. An attacker can send a user to a malicious link after sign-in.

**Example:**  
`/sign-in?redirect_url=https%3A%2F%2Fevil.com` → after sign-in, user may be sent to `https://evil.com`.

**Recommendation:** Allow only relative, same-origin URLs (e.g. same host, path starting with `/`). Reject or ignore any `redirect_url` that is an absolute URL or points to another origin.

**Fix applied:** `SignInClient.tsx` now validates `redirect_url`: only path-only URLs (starting with `/`, not `//`, no protocol) are used; otherwise fallback to `/`.

---

## 2. Unencoded `session_id` in API URL — FIXED

**Location:** `lib/api.ts` — `verifySession()`

**Issue:** `sessionId` is interpolated into the query string without encoding:

```ts
`/payments/verify-session?session_id=${sessionId}`
```

If `sessionId` contains `&`, `=`, or other special characters, the request can be malformed or interpreted incorrectly.

**Recommendation:** Use `encodeURIComponent(sessionId)` when building the URL.

**Fix applied:** `lib/api.ts` `verifySession()` now uses `encodeURIComponent(sessionId)` in the query string.

---

## 3. Sensitive Data in Console (Production) — FIXED

**Location:** `lib/api.ts` — response interceptor

**Issue:** Error responses are logged with `console.error('Bad Request:', data)` and similar. In production, this can leak request/response payloads (e.g. validation errors, internal messages) to the browser console and any logging/monitoring that captures console output.

**Recommendation:** In production, avoid logging full response bodies; log only status codes and minimal, non-sensitive identifiers, or disable detailed error logging for production.

**Fix applied:** Response interceptor in `lib/api.ts` logs full bodies only when `NODE_ENV !== 'production'`; in production only status code is logged.

---

## 4. User Enumeration

**Location:** `lib/api.ts` — `checkUserExists(email)`

**Issue:** The `/client/check?email=...` endpoint reveals whether an email exists in the system. This allows enumeration of registered users (e.g. for targeted phishing or account probing).

**Recommendation:** Either remove this endpoint where not strictly needed, or return a generic response (e.g. “If this email is registered, we have sent instructions”) so that success/failure does not reveal existence. Apply rate limiting and/or CAPTCHA to prevent automated enumeration.

**Note:** JSDoc on `checkUserExists` in `lib/api.ts` documents that backend should return a generic response and use rate limiting; backend change required.

---

## 5. Cancel Order and Email in Payload

**Location:** `lib/api.ts` — `cancelOrder(payload)`; payload includes `email`.

**Issue:** The client sends `email` in the cancel request. If the backend trusts this email instead of deriving identity from the auth token (e.g. Clerk), a user could attempt to cancel another user’s order by supplying a different email.

**Recommendation:** Backend should determine the acting user from the authenticated session (e.g. Clerk token) and ignore or override any client-supplied `email` for authorization. Ensure cancel is only allowed for orders belonging to that user.

**Fix applied:** Client no longer sends `email` in cancel payload; `cancelOrder` uses only `batch_num`, `start_date`, `end_date`. Backend must derive user from Authorization token. Type and JSDoc updated in `lib/api.ts`; `Cancel.tsx` no longer passes email.

---

## 6. Contact Form Input and XSS — FIXED (frontend sanitization)

**Location:** Contact form submission (e.g. `lib/api.ts` — `submitContactForm`); backend/form handling and any admin UI that displays submissions.

**Issue:** If `email`, `category`, or `message` are ever rendered in HTML (e.g. in an admin dashboard) without encoding or sanitization, stored XSS is possible.

**Recommendation:** Sanitize and/or escape all form fields before storing and before rendering in HTML. Use a safe HTML sanitizer if rich content is ever allowed; otherwise treat as plain text and escape on output.

**Fix applied:** `lib/api.ts` sanitizes contact form fields before send (strip HTML tags, remove `<>"'`, trim, length limits). Backend must still escape when rendering in admin UI.

---

## 7. Weak Type Safety on Error Data — FIXED

**Location:** `lib/api.ts` — `error.response.data as any`

**Issue:** Casting `error.response.data` to `any` disables type checking and can hide misuse of the error payload.

**Recommendation:** Define a small type (e.g. `{ error?: string; errors?: unknown[] }`) and use it instead of `any` where error shapes are known.

**Fix applied:** `ApiErrorData` interface added in `lib/api.ts`; response interceptor uses `error.response.data as ApiErrorData`.

---

## 8. Environment and API Exposure

**Location:** Use of `NEXT_PUBLIC_API_URL` and backend configuration.

**Issue:** `NEXT_PUBLIC_*` variables are exposed to the client. The backend API must enforce authentication, authorization, and CORS so that only intended origins and authenticated users can access protected routes.

**Recommendation:** Ensure backend validates Clerk tokens (or equivalent) on all protected routes, uses strict CORS, and does not rely on client-supplied URLs or secrets. Keep secrets (e.g. `CLERK_SECRET_KEY`) only in server-side environment variables.

**Note:** Comment added in `lib/api.ts` at axios create: backend must enforce auth, CORS, and server-only secrets.

---

## Summary

| # | Issue                     | Severity (typical) | Area        |
|---|---------------------------|--------------------|------------|
| 1 | Open redirect (sign-in)   | High               | Frontend   |
| 2 | Unencoded `session_id`    | Low–Medium         | Frontend   |
| 3 | Console logging in prod   | Low–Medium         | Frontend   |
| 4 | User enumeration         | Medium             | API/Design |
| 5 | Cancel order / email      | High (if backend trusts client email) | Backend   |
| 6 | Contact form / XSS        | Medium (if rendered unsanitized) | Backend/Admin |
| 7 | Error data `as any`       | Low                | Code quality |
| 8 | API / env exposure        | Depends on backend | Config/Backend |

Address high-severity items first (open redirect and cancel-order authorization), then medium (enumeration, XSS, logging), and tighten types and config as part of ongoing hardening.
