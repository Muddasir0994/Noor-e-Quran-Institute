## 2026-09-10 - Reflected XSS in Google Verification Endpoint
**Vulnerability:** Found a Reflected Cross-Site Scripting (XSS) vulnerability in `server.ts` where the route parameter `req.params.code` was reflected directly into the HTML response (`res.send`) without any validation or sanitization at the endpoint `/google:code.html`.
**Learning:** Even utility endpoints like search console verification need strict input validation. Direct reflection of request variables into the `Content-Type: text/html` response allows arbitrary script injection.
**Prevention:** Always validate and sanitize route parameters against strict regex patterns (e.g., alphanumeric only) before reflecting them in HTML responses, and consider using secure templating engines over string concatenation.
