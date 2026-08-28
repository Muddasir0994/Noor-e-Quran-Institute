## 2025-03-03 - Insecure Cross-Site Scripting (XSS) via dangerouslySetInnerHTML

**Vulnerability:**
The `dangerouslySetInnerHTML` prop in `src/admin/BlogEditor.tsx` was directly rendering user-controlled blog content without any sanitization. This allows an attacker to store arbitrary malicious JavaScript or HTML inside a blog post's content and execute it within the context of the application when the content is previewed or rendered for users, leading to Stored XSS.

**Learning:**
Never trust user-supplied input when rendering raw HTML in React applications using `dangerouslySetInnerHTML`. Directly passing unsanitized content exposes the application to severe XSS attacks.

**Prevention:**
Always sanitize HTML content using a robust sanitization library like `dompurify` before passing it to `dangerouslySetInnerHTML`. Ensure that `DOMPurify.sanitize()` is applied to any dynamic content intended to be rendered as HTML.
