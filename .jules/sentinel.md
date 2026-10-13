## 2023-10-27 - Cross-Site Scripting (XSS) via dangerouslySetInnerHTML
**Vulnerability:** Untrusted HTML content generated in `BlogEditor.tsx` was rendered directly in `BlogPostPage.tsx` using `dangerouslySetInnerHTML={{ __html: post.content }}`.
**Learning:** React's `dangerouslySetInnerHTML` bypasses its built-in XSS protection. If user-generated rich text is rendered directly, any malicious scripts (e.g., `<script>` tags, `onload` handlers) in the content will execute in the victim's browser.
**Prevention:** Always sanitize untrusted HTML input before rendering it with `dangerouslySetInnerHTML`. Use a robust HTML sanitizer like `DOMPurify` (`DOMPurify.sanitize(content)`) to strip out malicious scripts and event handlers while preserving safe HTML formatting.
