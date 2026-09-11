## 2024-05-18 - Reflected XSS in Google site verification endpoint
**Vulnerability:** The `/google:code.html` endpoint in `server.ts` directly reflected the `code` parameter into the response string without any validation or sanitization, allowing malicious HTML/JS to be executed if a user clicked a crafted link.
**Learning:** Even utility routes meant for simple verification can be vectors for XSS if user input from the URL parameters is directly concatenated into the HTML response.
**Prevention:** Always validate URL parameters against a strict allowlist (e.g., alphanumeric regex) before reflecting them in the response, and return a 400 Bad Request error if validation fails.
