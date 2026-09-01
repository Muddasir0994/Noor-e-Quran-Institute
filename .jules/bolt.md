## 2025-05-18 - Attempted to cache fully injected HTML route responses
**Learning:** Found that caching the full HTML string (including injected SEO tags) in the Express `app.get('*')` handler without a TTL or cache invalidation strategy leads to serving stale dynamic content (e.g., if course metadata updates). The baseline server already effectively caches the base HTML via `cachedBaseHtml`, meaning the only "CPU" work being done per request is the string-replacement of SEO metadata.
**Action:** Abandoned caching the fully-injected HTML responses to ensure correctness of dynamic content. Must look for an alternative performance optimization that is safe and does not sacrifice correctness.

## 2025-05-18 - Identified Synchronous File Writes in DataStore
**Learning:** Found that `DataStore` uses `fs.writeFileSync(DB_FILE, ...)` synchronously for every mutation (addLead, updateCourse, etc). While the DB size might be small, high concurrent API traffic mutating state will block the NodeJS event loop for all users during the JSON stringify and file I/O operations.
**Action:** Replace `fs.writeFileSync` with asynchronous `fs.promises.writeFile` to prevent event loop blocking, which improves overall backend concurrency and responsiveness.
