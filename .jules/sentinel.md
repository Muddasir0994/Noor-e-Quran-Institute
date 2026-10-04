## 2025-02-21 - Path Traversal in Custom Image Resolver
**Vulnerability:** The `/images/:file` endpoint read the `file` route parameter directly into `path.join()` and `fs.existsSync()` without any path sanitization, allowing path traversal attacks via URL-encoded payloads like `..%2f`.
**Learning:** Even if Express URL-decodes path parameters (which bypasses segment routing constraints in definitions like `/:file`), passing these dynamic route parameters directly into filesystem operations exposes sensitive files (e.g. `/etc/passwd`).
**Prevention:** Always strictly validate file path parameters by rejecting input containing traversal sequences (`/`, `\`, `..`) before utilizing them in I/O operations.

## 2025-02-21 - Reflected XSS in Route Parameter Reflection
**Vulnerability:** The `/google:code.html` endpoint read the `code` parameter from the URL path and reflected it directly back in the HTML response (`google-site-verification: google${code}.html`) with `Content-Type: text/html`, enabling Reflected XSS.
**Learning:** Any dynamic route parameter that is interpolated and returned unescaped within an HTML response format creates an immediate XSS surface.
**Prevention:** Implement stringent alphanumeric regex validation (e.g., `/^[a-zA-Z0-9_-]+$/`) on reflected parameters, ensuring no malicious HTML tags or script execution payloads can be passed through.
