## 2025-03-22 - [HIGH] Missing Rate Limiting on 2FA Setup
**Vulnerability:** The `/api/auth/verify-2fa` endpoint used to verify the 6-digit TOTP code during initial 2FA setup was missing rate limiting, whereas the login equivalent (`/verify-login-2fa`) was protected.
**Learning:** If an attacker compromises a user's session before 2FA is fully established, they could initiate 2FA setup and brute-force the 6-digit code (10^6 combinations) to lock the legitimate user out of their account.
**Prevention:** Consistently apply rate limiting to ALL endpoints that verify security tokens, OTPs, or passwords, not just the primary authentication routes.
