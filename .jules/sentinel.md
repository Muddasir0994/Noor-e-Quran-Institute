## 2024-10-31 - [High] DOM-based XSS Prevention
**Vulnerability:** Untrusted HTML was assigned to a temporary element's `innerHTML` in `src/pages/BlogListPage.tsx` to strip tags (`tmp.innerHTML = html`). This executes embedded scripts, leading to a DOM-based Cross-Site Scripting (XSS) vulnerability.
**Learning:** Extracting text from rich HTML content using `innerHTML` on an unattached DOM element is unsafe because modern browsers will still parse and potentially execute embedded payloads (like `<img src=x onerror=alert(1)>`).
**Prevention:** Always use `new DOMParser().parseFromString(html, 'text/html').body.textContent` when you need to safely extract text from an HTML string without executing it.
