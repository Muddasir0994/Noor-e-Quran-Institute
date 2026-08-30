## 2026-08-30 - DOMPurify usage
**Vulnerability:** XSS in Blog Editor Live Preview.
**Learning:** The blog editor's live preview rendered HTML securely because the innerHTML was passed without sanitization. In a more complete solution, the input itself needs to be sanitized before saving into the database.
**Prevention:** Use DOMPurify in every dangerouslySetInnerHTML block, and consider input validation at entry point.
