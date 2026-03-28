## 2025-03-22 - [HIGH] Missing Rate Limiting on 2FA Setup
**Vulnerability:** The `/api/auth/verify-2fa` endpoint used to verify the 6-digit TOTP code during initial 2FA setup was missing rate limiting, whereas the login equivalent (`/verify-login-2fa`) was protected.
**Learning:** If an attacker compromises a user's session before 2FA is fully established, they could initiate 2FA setup and brute-force the 6-digit code (10^6 combinations) to lock the legitimate user out of their account.
**Prevention:** Consistently apply rate limiting to ALL endpoints that verify security tokens, OTPs, or passwords, not just the primary authentication routes.

## 2026-03-28 - [HIGH] Missing XSS Protection on addComment Endpoint
**Vulnerability:** The `addComment` controller in `backend/src/controllers/videos.js` directly saved user-provided comment content to the database without sanitization, leading to an XSS vulnerability.
**Learning:** The backend lacks a global `xss-clean` middleware, which means that individual endpoints handling user input must implement their own sanitization to prevent XSS. Relying solely on frontend mitigation is insufficient.
**Prevention:** Implement input sanitization at the backend level using a library like `xss` before saving user-generated content to the database.
