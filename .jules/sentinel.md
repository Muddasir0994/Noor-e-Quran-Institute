## 2025-03-09 - Prevent Reflected XSS in Route Parameters
**Vulnerability:** The `/google:code.html` endpoint in `server.ts` directly interpolated `req.params.code` into an HTML string and served it with `Content-Type: text/html`. This created a Reflected XSS vulnerability where an attacker could inject `<script>` tags into the URL parameters.
**Learning:** Even utility or verification endpoints (like Google Search Console verification) that seem harmless must have strict input validation, as their output is still rendered by the browser as HTML.
**Prevention:** Always validate URL parameters against a strict allowlist regex (e.g., `/^[a-zA-Z0-9_-]+$/`) before reflecting them back in `res.send()` or any HTML context.
