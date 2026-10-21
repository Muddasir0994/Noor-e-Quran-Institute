## 2024-05-18 - XSS in Blog Post Rendering
**Vulnerability:** The `src/pages/BlogPostPage.tsx` and `src/admin/BlogEditor.tsx` files use `dangerouslySetInnerHTML` or similar direct content rendering without sanitization, leading to a Cross-Site Scripting (XSS) vulnerability.
**Learning:** React's `dangerouslySetInnerHTML` bypasses its built-in XSS protections. If user-generated content (like blog posts) is not sanitized before rendering, attackers can inject malicious scripts.
**Prevention:** Always sanitize HTML content before passing it to `dangerouslySetInnerHTML` using a library like `dompurify`.

## 2024-05-18 - HTML Injection in Admin Notification Emails
**Vulnerability:** Various backend endpoints (`/api/book-trial`, `/api/enroll`, `/api/contact`) collected unvalidated user inputs (such as names, messages, notes) and directly interpolated them into HTML strings sent as emails via Nodemailer to the admin.
**Learning:** Even though the content is rendered in an email client and not a web browser, unescaped user input in HTML emails constitutes an HTML Injection vulnerability. This could allow an attacker to inject malicious links, tracking pixels, or misleading content that appears legitimate within an administrative alert.
**Prevention:** Always globally define and apply an HTML escaping utility (e.g., `escapeHtml`) to all user-supplied data before interpolating it into HTML email bodies.
