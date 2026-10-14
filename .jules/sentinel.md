## 2023-10-27 - Express URL-Decoding Bypass for Path Traversal

**Vulnerability:** Path Traversal via URL-encoded payloads (`%2E%2E%2F`) in Express route parameters (e.g., `/images/:file`).
**Learning:** Express automatically URL-decodes route parameters *before* populating `req.params`. Therefore, an attacker can supply a payload like `%2F` (slash) or `%2E%2E` (dot-dot), bypassing the expected segment boundaries of `/:file` and allowing directory traversal if the parameter is subsequently used in a filesystem operation (e.g., `path.join()`).
**Prevention:** Always explicitly validate route parameters used for filesystem operations against a strict regex (e.g., `^[a-zA-Z0-9_-]+$`) or explicitly check for and reject traversal characters (`/`, `\`, `..`) even if they appear as standard route segments.
