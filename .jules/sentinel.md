## 2026-03-14 - Prevent DoS and NoSQLi via query object parsing
**Vulnerability:** Express's qs query parser allows attackers to pass objects via URL brackets (e.g., `?tags[$ne]=1`). In `videos.js`, this object was directly split (`req.query.tags.split(',')`), causing a server crash (DoS). In other cases, passing these objects directly into MongoDB queries could lead to NoSQL injection.
**Learning:** Always explicitly validate that request query parameters expected to be strings are actually strings (`typeof === 'string'`) before using them in string operations or database queries, especially when using the default `qs` parser.
**Prevention:** Implement strict type validation (`typeof req.query.field === 'string'`) for all query parameters expected to be strings.

## 2026-03-18 - Prevent TOTP 2FA Brute Force
**Vulnerability:** The authentication endpoint (`/api/auth/verify-login-2fa`) used for verifying 6-digit TOTP tokens during login was not rate-limited. Since TOTP tokens are valid for 30 seconds and consist of only 6 digits (1,000,000 combinations), a lack of rate-limiting enables attackers to brute-force the 2FA token if they possess valid credentials.
**Learning:** All endpoints that accept short, time-limited cryptographic tokens (like 6-digit TOTPs or SMS codes) must be strictly rate-limited to a low number of attempts (e.g., 5 attempts per 15 minutes) to computationally prevent brute-forcing within the token's validity window.
**Prevention:** Always apply `express-rate-limit` (or similar) specifically tailored to 2FA verification endpoints.

## 2026-03-24 - Prevent Stored XSS via Comment Input
**Vulnerability:** The backend application does not have a global XSS sanitization middleware and blindly trusts user input in `addComment` within `backend/src/controllers/videos.js`. An attacker could add malicious scripts to their comment, leading to a Stored Cross-Site Scripting (XSS) attack when users view the comment.
**Learning:** Never trust user input, especially for text fields displayed to other users (like comments). Input must always be properly sanitized to avoid stored script injections.
**Prevention:** Always implement explicit input sanitization using a well-established security library like `xss` on all text inputs that will be rendered directly in the application's UI.
