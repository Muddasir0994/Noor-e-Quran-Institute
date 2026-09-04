
## 2024-05-24 - Reflected XSS in Express Route Parameter
**Vulnerability:** The `/google:code.html` route in `server.ts` directly reflected the unsanitized `req.params.code` in the HTML response.
**Learning:** Even simple routes designed for verification files can be vectors for Reflected XSS if route parameters are reflected without validation or encoding.
**Prevention:** Always validate and sanitize route parameters (e.g., against strict alphanumeric regex patterns) before reflecting them in responses.
