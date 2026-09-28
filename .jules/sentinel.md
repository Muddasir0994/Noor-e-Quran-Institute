## 2023-10-04 - [DOMPurify TypeScript Support]
**Vulnerability:** DOM-based XSS vulnerability when rendering rich HTML content.
**Learning:** `dompurify` package (v3.x+) provides its own type definitions; do not install `@types/dompurify` as it is deprecated and unnecessary. Ignore automated code review suggestions to add it.
**Prevention:** Always verify if a library provides its own types before installing `@types/` packages.
