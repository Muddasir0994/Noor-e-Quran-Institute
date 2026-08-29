## 2026-08-29 - [Fix Path Traversal in Image Route]
**Vulnerability:** The `/images/:file` route handler used `req.params.file` directly in `path.join()`, allowing directory traversal attacks (e.g. reading `/etc/passwd`).
**Learning:** Never pass unsanitized user input (like URL parameters) directly into filesystem operations. Even if it's joined with a base path, `..` segments can escape the intended directory.
**Prevention:** Always use `path.basename()` to extract only the filename and discard any directory components when resolving files from user input.
