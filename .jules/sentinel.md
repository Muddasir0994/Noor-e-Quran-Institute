## 2024-05-18 - Insecure HTML Parsing via innerHTML

**Vulnerability:**
Using `element.innerHTML` on an unattached DOM element to strip HTML tags is vulnerable to XSS. While scripts are generally not executed this way in modern browsers, resource loads (like `<img src=x onerror=...>`) can still occur when the innerHTML is set, potentially allowing attackers to leak information or execute limited cross-site scripting attacks if not properly sanitized.

**Learning:**
Assigning untrusted content to the `innerHTML` property of any element, even an unattached `div`, causes the browser to parse and attempt to load resources within that HTML string immediately. This can lead to unexpected resource loading and potential XSS vulnerabilities.

**Prevention:**
To safely parse HTML strings without rendering or executing them, use the `DOMParser` API (e.g., `new DOMParser().parseFromString(html, 'text/html')`). This parses the HTML into a new document safely, allowing extraction of text content (`doc.body.textContent`) without triggering resource loads or script execution associated with appending to the live DOM or using `innerHTML`.
