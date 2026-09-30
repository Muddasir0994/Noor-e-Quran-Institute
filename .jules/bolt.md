## 2024-05-18 - Async Database Writes with Queue
**Learning:** Synchronous file writes (`fs.writeFileSync`) in singletons like `DataStore` can significantly block the Node.js event loop under concurrent load, degrading performance. Converting to `fs.promises.writeFile` without a locking/queue mechanism leads to data loss from overlapping writes.
**Action:** Implement a `while (this.pendingData)` concurrency loop for async file writes to ensure data integrity during high load, and provide a `flush()` method wrapped in `while (this.writePromise)` for safe process exits during graceful shutdown.
