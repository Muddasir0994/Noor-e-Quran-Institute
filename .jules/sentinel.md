## 2024-05-18 - XSS in Blog Post Rendering
**Vulnerability:** The `src/pages/BlogPostPage.tsx` and `src/admin/BlogEditor.tsx` files use `dangerouslySetInnerHTML` or similar direct content rendering without sanitization, leading to a Cross-Site Scripting (XSS) vulnerability.
**Learning:** React's `dangerouslySetInnerHTML` bypasses its built-in XSS protections. If user-generated content (like blog posts) is not sanitized before rendering, attackers can inject malicious scripts.
**Prevention:** Always sanitize HTML content before passing it to `dangerouslySetInnerHTML` using a library like `dompurify`.
