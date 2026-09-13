## 2024-05-24 - Reflected XSS in Express Route Parameters
**Vulnerability:** The Google Site Verification endpoint (`/google:code.html`) took a route parameter `req.params.code` and immediately rendered it inside the HTML response using `res.send()` without any validation or sanitization, causing a Reflected XSS vulnerability.
**Learning:** Even utility or verification endpoints are vectors for attack if they reflect unvalidated user input directly into the response payload.
**Prevention:** Always validate and sanitize route parameters using strict regex patterns (like alphanumeric) before reflecting them in `res.send()` or HTML responses.
