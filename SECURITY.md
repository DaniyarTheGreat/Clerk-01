# Security Issues

This document lists identified security issues and recommendations for the Clerk-01 project.

---

## 1. Open Redirect (Sign-in)

**Location:** `app/sign-in/[[...sign-in]]/SignInClient.tsx`

**Issue:** The `redirect_url` query parameter is taken from the URL, decoded, and passed to Clerk’s `fallbackRedirectUrl` without validation. An attacker can send a user to a malicious link after sign-in.

**Example:**  
`/sign-in?redirect_url=https%3A%2F%2Fevil.com` → after sign-in, user may be sent to `https://evil.com`.

**Recommendation:** Allow only relative, same-origin URLs (e.g. same host, path starting with `/`). Reject or ignore any `redirect_url` that is an absolute URL or points to another origin.

---

## 2. Unencoded `session_id` in API URL

**Location:** `lib/api.ts` — `verifySession()`

**Issue:** `sessionId` is interpolated into the query string without encoding:

```ts
`/payments/verify-session?session_id=${sessionId}`
```

If `sessionId` contains `&`, `=`, or other special characters, the request can be malformed or interpreted incorrectly.

**Recommendation:** Use `encodeURIComponent(sessionId)` when building the URL.

---

## 3. Sensitive Data in Console (Production)

**Location:** `lib/api.ts` — response interceptor

**Issue:** Error responses are logged with `console.error('Bad Request:', data)` and similar. In production, this can leak request/response payloads (e.g. validation errors, internal messages) to the browser console and any logging/monitoring that captures console output.

**Recommendation:** In production, avoid logging full response bodies; log only status codes and minimal, non-sensitive identifiers, or disable detailed error logging for production.

---

## 4. User Enumeration

**Location:** `lib/api.ts` — `checkUserExists(email)`

**Issue:** The `/client/check?email=...` endpoint reveals whether an email exists in the system. This allows enumeration of registered users (e.g. for targeted phishing or account probing).

**Recommendation:** Either remove this endpoint where not strictly needed, or return a generic response (e.g. “If this email is registered, we have sent instructions”) so that success/failure does not reveal existence. Apply rate limiting and/or CAPTCHA to prevent automated enumeration.

---

## 5. Cancel Order and Email in Payload

**Location:** `lib/api.ts` — `cancelOrder(payload)`; payload includes `email`.

**Issue:** The client sends `email` in the cancel request. If the backend trusts this email instead of deriving identity from the auth token (e.g. Clerk), a user could attempt to cancel another user’s order by supplying a different email.

**Recommendation:** Backend should determine the acting user from the authenticated session (e.g. Clerk token) and ignore or override any client-supplied `email` for authorization. Ensure cancel is only allowed for orders belonging to that user.

---

## 6. Contact Form Input and XSS

**Location:** Contact form submission (e.g. `lib/api.ts` — `submitContactForm`); backend/form handling and any admin UI that displays submissions.

**Issue:** If `email`, `category`, or `message` are ever rendered in HTML (e.g. in an admin dashboard) without encoding or sanitization, stored XSS is possible.

**Recommendation:** Sanitize and/or escape all form fields before storing and before rendering in HTML. Use a safe HTML sanitizer if rich content is ever allowed; otherwise treat as plain text and escape on output.

---

## 7. Weak Type Safety on Error Data

**Location:** `lib/api.ts` — `error.response.data as any`

**Issue:** Casting `error.response.data` to `any` disables type checking and can hide misuse of the error payload.

**Recommendation:** Define a small type (e.g. `{ error?: string; errors?: unknown[] }`) and use it instead of `any` where error shapes are known.

---

## 8. Environment and API Exposure

**Location:** Use of `NEXT_PUBLIC_API_URL` and backend configuration.

**Issue:** `NEXT_PUBLIC_*` variables are exposed to the client. The backend API must enforce authentication, authorization, and CORS so that only intended origins and authenticated users can access protected routes.

**Recommendation:** Ensure backend validates Clerk tokens (or equivalent) on all protected routes, uses strict CORS, and does not rely on client-supplied URLs or secrets. Keep secrets (e.g. `CLERK_SECRET_KEY`) only in server-side environment variables.

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
