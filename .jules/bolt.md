## 2024-06-25 - Synchronous writes in singletons

**Learning:** Using `fs.writeFileSync` inside a frequently called method (`saveDatabase`) within a singleton like `DataStore` freezes the Node.js event loop during heavy concurrent load. This blocks the Express server from accepting new requests, resulting in serious performance degradation and potential data loss if rapid concurrent writes overlap.

**Action:** Always use an asynchronous write approach with a queue/lock mechanism (e.g., `fs.promises.writeFile` with a `this.pendingData` loop) for data stores. Combine this with an async `.flush()` method, using a `while(this.writePromise)` loop, tied into the server's graceful shutdown flow to guarantee all pending I/O clears before process exit.
