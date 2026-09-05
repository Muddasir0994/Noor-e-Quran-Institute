## 2023-10-27 - [Fix XSS in BlogEditor via dompurify]
**Vulnerability:** Found a HIGH severity XSS vulnerability in `src/admin/BlogEditor.tsx` where user-controlled `content` was rendered unsafely via `dangerouslySetInnerHTML`.
**Learning:** In React, passing user input directly to `dangerouslySetInnerHTML` is extremely dangerous and can lead to DOM-based XSS attacks.
**Prevention:** Always wrap variables passed to `dangerouslySetInnerHTML` with `DOMPurify.sanitize()` to ensure any potentially malicious scripts are removed before rendering to the DOM.
