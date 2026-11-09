## 2024-11-09 - Fix DOM-based XSS in BlogListPage

**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `src/pages/BlogListPage.tsx`. The `stripHtml` function created a temporary `div` and assigned un-sanitized user-supplied HTML content (blog post content) directly to its `innerHTML` property.
**Learning:** Extracting text content from HTML via `innerHTML` execution on a temporary DOM node without sanitization leads to execution of malicious scripts if the HTML contains event handlers (e.g. `<img src=x onerror=alert(1)>`) or script tags (though standard browsers block execution of `<script>` tags injected via `innerHTML`, event handlers still fire).
**Prevention:** Use `new DOMParser().parseFromString(html, 'text/html').body.textContent` instead of creating an off-screen DOM node and setting `innerHTML` directly.
