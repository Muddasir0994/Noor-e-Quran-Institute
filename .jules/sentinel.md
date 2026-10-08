## 2024-05-24 - CRITICAL: Express URL-Decodes Path Parameters Before Routing Constraint Checks

**Vulnerability:** A critical Path Traversal vulnerability was found in the `/images/:file` endpoint where `req.params.file` was blindly appended via `path.join()`. Payloads such as `..%2f..%2f..%2fetc%2fpasswd` successfully bypassed route constraints because Express automatically URL-decodes path parameters before populating `req.params`, allowing traversal strings (`../`) into filesystem operations.
**Learning:** Express's automatic decoding means standard route path segment matches (`/:file`) do not strictly boundary-box malicious path strings if URL encoded versions of directory traversal symbols (`%2f` and `%2e%2e`) are provided by an attacker.
**Prevention:** Always explicitly validate path parameters used in filesystem operations for traversal characters (`/`, `\`, `..`), rather than relying purely on URL routing constraints to isolate parameter values.

## 2024-05-24 - HIGH: Reflected XSS from Unvalidated Express Route Parameter Reflection

**Vulnerability:** A High severity Reflected XSS vulnerability was identified on the Google Search Console verification utility route (`/google:code.html`), where the unvalidated `:code` path parameter was reflected directly into the HTML response payload via string interpolation, allowing script execution via payloads like `<script>alert(1)</script>`.
**Learning:** Returning path parameters or query strings inside a raw HTML string payload without encoding or strict validation creates immediate Reflected XSS exposure, even in seemingly benign utility endpoints.
**Prevention:** Strictly enforce format validation on route parameters using regex (e.g. `^[a-zA-Z0-9_-]+$`) prior to rendering them in responses, or appropriately encode output to HTML entities.
