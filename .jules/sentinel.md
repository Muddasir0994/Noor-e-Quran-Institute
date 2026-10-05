## 2024-05-24 - DOMPurify Class Name Stripping in React HTML Fallbacks
**Vulnerability:** XSS vulnerability was identified when rendering user-generated content from `BlogEditor.tsx` inside `dangerouslySetInnerHTML`.
**Learning:** When using `DOMPurify.sanitize()` with an HTML fallback string containing CSS classes in React, such as `<p className="text-gray-400">`, DOMPurify parses standard HTML and therefore strips the React-specific `className` attribute as an invalid HTML attribute, destroying the styled fallback.
**Prevention:** When providing HTML string fallbacks inside `DOMPurify.sanitize()`, always use the standard HTML `class` attribute instead of React's `className` prop. Additionally, always sanitize user-generated rich text content passed into `dangerouslySetInnerHTML`.
