## 2025-03-22 - [MEDIUM] Insecure Random Generation for File Names
**Vulnerability:** The application used `Math.random()` to generate unique suffixes for uploaded file names in `upload.js` and `avatarUpload.js`.
**Learning:** `Math.random()` is not cryptographically secure, which means file names could potentially be predicted, leading to unintended file overwrites or unauthorized access if filenames are meant to act as unguessable identifiers.
**Prevention:** Always use `crypto.randomBytes().toString('hex')` or similar cryptographically secure functions to generate random tokens, identifiers, or suffixes for sensitive or public-facing resources.
