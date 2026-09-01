## 2026-09-01 - [Reflected XSS via Path Parameter in Express]
**Vulnerability:** Found a Reflected XSS vulnerability in `server.ts` where `req.params.code` was directly injected into the response of the `/google:code.html` endpoint without sanitization or validation, and served with `Content-Type: text/html`.
**Learning:** URL path parameters must be treated as untrusted input just like query parameters or request bodies.
**Prevention:** Always validate and sanitize user inputs before returning them in server responses, especially for `text/html` endpoints. Use strict allowlist regexes for identifiers like verification codes.
