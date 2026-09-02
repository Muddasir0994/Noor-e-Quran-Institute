## 2026-09-02 - Unsafe DOM Manipulation for HTML Stripping
**Vulnerability:** DOM-based XSS was possible in `stripHtml` due to untrusted input being assigned to `tmp.innerHTML` (e.g., `<img src=x onerror=...>`), causing the browser to immediately evaluate embedded script tags, even if the element is not appended to the main document.
**Learning:** Utilities that try to cleanly extract plain text from HTML by directly using `.innerHTML` on a dummy DOM element are dangerous in a browser environment.
**Prevention:** Use `new DOMParser().parseFromString(html, 'text/html').body.textContent` instead, which safely parses the HTML as a document without evaluating scripts.
