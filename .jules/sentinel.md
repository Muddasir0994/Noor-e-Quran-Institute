
## 2024-05-24 - Fix Reflected XSS and Path Traversal in Server Routes
**Vulnerability:** Found two vulnerabilities in Express routes:
1. Reflected XSS in `/google:code.html` where `req.params.code` was interpolated directly into an HTML response without validation.
2. Path Traversal in `/images/:file` where `req.params.file` was joined into a file path without checking for directory traversal characters.

**Learning:** Express automatically URL-decodes path parameters before populating `req.params`. Even if routing constraints normally prevent slashes, URL-encoded payloads like `%2F` or `%2E%2E` can bypass these constraints. Furthermore, any parameter reflected directly into an HTML response must be validated or sanitized to prevent executing malicious scripts.

**Prevention:**
- For parameters reflected into HTML, strictly validate the format (e.g., using a regex like `/^[a-zA-Z0-9_-]+$/`) before rendering.
- For parameters used in filesystem operations, explicitly reject filenames that include traversal characters (e.g., `..`, `/`, `\`) even if they are extracted from route parameters.
