## 2024-05-18 - Reflected XSS in Utility Endpoints
**Vulnerability:** The `/google:code.html` endpoint in `server.ts` reflected the `code` route parameter directly into the HTML response without validation, enabling Reflected XSS.
**Learning:** Express automatically URL-decodes path parameters before populating `req.params`. Route parameters that reflect back into HTML responses must be strictly validated against strict regex patterns to prevent XSS payloads.
**Prevention:** Explicitly validate URL parameters against strict regex patterns (e.g., `^[a-zA-Z0-9]+$`) before reflecting them in the response.
