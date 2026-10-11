## 2025-02-14 - Reflected XSS in Express Route Parameters
**Vulnerability:** The `/google:code.html` endpoint directly reflected the `code` parameter into the HTML response without any validation or sanitization, causing a Reflected Cross-Site Scripting (XSS) vulnerability.
**Learning:** Express automatically decodes URL-encoded parameters in routes. If those parameters are directly embedded into responses with `text/html` Content-Type, malicious payloads (e.g. `<script>`) will be executed by the browser.
**Prevention:** Always validate route parameters against strict regex patterns (e.g., `^[a-zA-Z0-9_-]+$`) when using them to dynamically construct HTML responses, or use proper HTML escaping.
