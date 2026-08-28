## 2026-08-28 - [Fix XSS Vulnerability]
**Vulnerability:** XSS vulnerability in blog rendering using dangerouslySetInnerHTML.
**Learning:** React `dangerouslySetInnerHTML` allows XSS when rendering user-submitted HTML data, e.g. from rich text editors.
**Prevention:** Always sanitize HTML input before passing to `dangerouslySetInnerHTML`, for example using `dompurify`.
