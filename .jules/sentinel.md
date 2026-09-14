
## 2024-09-14 - Prevent Reflected XSS in Express Route Parameters
**Vulnerability:** The Google Search Console verification endpoint (`/google:code.html`) reflected the user-controlled `req.params.code` directly into the `res.send()` output without validation or sanitization, introducing a Reflected Cross-Site Scripting (XSS) vulnerability.
**Learning:** Even utility or static-like endpoints in Express (such as site verification routes) are susceptible to Reflected XSS if they reflect URL parameters back in the response body.
**Prevention:** Always explicitly validate and sanitize route parameters (e.g., against strict regex patterns like alphanumeric characters) before reflecting them in `res.send()` or HTML responses.
