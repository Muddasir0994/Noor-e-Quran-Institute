## 2024-05-18 - Optimized sync fs.writeFileSync to async fs.promises.writeFile in server/dataStore.ts
**Learning:** `server/dataStore.ts` uses a synchronous `fs.writeFileSync` in its `saveDatabase` method. This blocks the entire Node.js event loop on every save, which is triggered frequently (on every API request that modifies state) and severely degrades concurrent request handling.
**Action:** Always prefer `fs.promises.writeFile` with a concurrency queue/lock instead of `fs.writeFileSync` for hot-path file I/O in singletons.

## 2024-05-18 - Optimized sync fs.writeFileSync to async fs.promises.writeFile in singletons
**Learning:** Singletons like `server/dataStore.ts` and `server/seoCache.ts` were using synchronous `fs.writeFileSync` in their save methods. This blocks the entire Node.js event loop on every save, which severely degraded concurrent request handling. During graceful shutdown, failing to await these asynchronous operations can result in incomplete writes.
**Action:** Always prefer `fs.promises.writeFile` with a concurrency queue/lock (e.g., `while (pendingData)`) for file I/O in singletons. Ensure that `server.close()` callbacks explicitly await asynchronous operations (e.g., `await dataStore.flush()`) using a fallback `setTimeout` to prevent hanging processes.
