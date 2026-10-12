## 2023-11-20 - Fix Reflected XSS and Path Traversal in Express routes
**Vulnerability:**
- The `req.params.code` and `req.params.file` parameters were implicitly assumed to be safe and were reflected into responses or concatenated with file paths. Express automatically URL-decodes path parameters before populating `req.params`, so values like `%2E%2E` bypass routing constraints and lead to path traversal in filesystem operations, while raw input creates Reflected XSS vulnerabilities if reflected inside HTML files.
**Learning:**
- Always explicitly validate variables extracted from `req.params`, especially if used inside file paths or rendered inside HTML strings, even if they're from dynamically matched route components. Express auto-decoding behaviors mean parameter constraints are not inherently secure against XSS/Traversal.
**Prevention:**
- Use strictly bounded regular expressions (e.g., `/^[a-zA-Z0-9_-]+$/`) to whitelist the expected format for Express path parameters before using them.
