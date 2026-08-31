## 2025-02-27 - [Fix XSS Vulnerability]
**Vulnerability:** Found a Cross-Site Scripting (XSS) vulnerability in `src/admin/BlogEditor.tsx` where user-generated/dynamic content (`content`) was injected directly into the DOM using React's `dangerouslySetInnerHTML` without any sanitization.
**Learning:** `dangerouslySetInnerHTML` should never be used with unsanitized user-generated content.
**Prevention:** Always sanitize user-generated HTML content before passing it to `dangerouslySetInnerHTML`. We used `DOMPurify` to sanitize the HTML content.
