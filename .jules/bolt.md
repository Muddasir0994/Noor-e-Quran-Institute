## 2026-10-31 - [Synchronous File Write Bottleneck Resolved]
**Learning:** Found multiple instances of `fs.writeFileSync` in `server/dataStore.ts`, `server/seoCache.ts`, and `server.ts` image upload which would block the Node.js event loop causing request delay under heavy concurrency.
**Action:** Replaced them with asynchronous queued non-blocking writes (`await fs.promises.writeFile`) with concurrency loops and added graceful shutdown routines (`server.close()`, `server.closeAllConnections()`, and `.flush()`) to ensure no data loss occurs when shutting down.
