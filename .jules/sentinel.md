## 2025-03-22 - [HIGH] Missing Rate Limiting on 2FA Setup
**Vulnerability:** The `/api/auth/verify-2fa` endpoint used to verify the 6-digit TOTP code during initial 2FA setup was missing rate limiting, whereas the login equivalent (`/verify-login-2fa`) was protected.
**Learning:** If an attacker compromises a user's session before 2FA is fully established, they could initiate 2FA setup and brute-force the 6-digit code (10^6 combinations) to lock the legitimate user out of their account.
**Prevention:** Consistently apply rate limiting to ALL endpoints that verify security tokens, OTPs, or passwords, not just the primary authentication routes.

## 2025-03-24 - [MEDIUM] Insecure Random Generation for Uploaded Files
**Vulnerability:** File upload handlers (`backend/src/middleware/upload.js` and `backend/src/middleware/avatarUpload.js`) were generating filenames using a predictable suffix generated via `Math.round(Math.random() * 1E9)`.
**Learning:** `Math.random()` does not produce cryptographically secure random values. In certain contexts, attackers can predict the generated strings, which might lead to file overwriting or bypassing filename-based security measures.
**Prevention:** Always use cryptographically secure methods like `crypto.randomBytes(8).toString('hex')` or a dedicated library like `uuid` (version 4 or higher) for generating sensitive or unique random values (including temporary tokens and uploaded filenames).
