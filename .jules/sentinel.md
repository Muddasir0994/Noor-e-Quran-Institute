## 2025-03-08 - Fix Reflected XSS in Google Site Verification Endpoint
**Vulnerability:** The `/google:code.html` endpoint reflected the route parameter (`req.params.code`) directly into the `text/html` response without validation or sanitization, introducing a Reflected XSS vulnerability.
**Learning:** Route parameters shouldn't be implicitly trusted, even in seemingly static utility or verification endpoints, as attackers can inject arbitrary script payloads.
**Prevention:** Always validate route parameters against a strict allow-list regex (e.g., `/^[a-zA-Z0-9_-]+$/`) before reflecting them in responses.
