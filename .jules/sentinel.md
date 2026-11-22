## 2024-05-18 - XSS in Blog Post Rendering
**Vulnerability:** The `src/pages/BlogPostPage.tsx` and `src/admin/BlogEditor.tsx` files use `dangerouslySetInnerHTML` or similar direct content rendering without sanitization, leading to a Cross-Site Scripting (XSS) vulnerability.
**Learning:** React's `dangerouslySetInnerHTML` bypasses its built-in XSS protections. If user-generated content (like blog posts) is not sanitized before rendering, attackers can inject malicious scripts.
**Prevention:** Always sanitize HTML content before passing it to `dangerouslySetInnerHTML` using a library like `dompurify`.

## 2024-05-18 - HTML Injection in Admin Notification Emails
**Vulnerability:** Various backend endpoints (`/api/book-trial`, `/api/enroll`, `/api/contact`) collected unvalidated user inputs (such as names, messages, notes) and directly interpolated them into HTML strings sent as emails via Nodemailer to the admin.
**Learning:** Even though the content is rendered in an email client and not a web browser, unescaped user input in HTML emails constitutes an HTML Injection vulnerability. This could allow an attacker to inject malicious links, tracking pixels, or misleading content that appears legitimate within an administrative alert.
**Prevention:** Always globally define and apply an HTML escaping utility (e.g., `escapeHtml`) to all user-supplied data before interpolating it into HTML email bodies.
## 2024-11-04 - [HTML Injection in OTP Emails]
**Vulnerability:** The `sendStudentOtpEmail` function in `server.ts` interpolated user-provided input (`studentName`) into the HTML email template directly without escaping it, allowing for HTML injection and phishing links.
**Learning:** Even internal helper functions sending automated emails must treat user input as untrusted. If unescaped, malicious actors can abuse email notifications to send phishing links that appear to come from the application's verified domain.
**Prevention:** Always HTML-escape user input using functions like `escapeHtml` before placing it inside email templates, or use a templating engine with automatic contextual escaping.
