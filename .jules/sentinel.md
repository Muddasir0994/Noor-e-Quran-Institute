## 2026-09-06 - DOMPurify usage with React className
**Vulnerability:** XSS via dangerouslySetInnerHTML
**Learning:** When using DOMPurify with React, fallback HTML strings passed to `DOMPurify.sanitize()` must use standard HTML attributes like `class`, not React props like `className`. DOMPurify parses standard HTML and strips `className`.
**Prevention:** Always use standard HTML syntax for strings passed into DOMPurify, even within a React codebase.
