## 2024-05-24 - Async file writes in JSON DataStore

**Learning:** This codebase uses a custom `DataStore` singleton that synchronously serializes and writes the entire JSON database state to disk on every mutation (`fs.writeFileSync`). In a Node.js backend, this creates a severe bottleneck by blocking the main event loop, causing poor concurrency handling under load.
**Action:** When working with synchronous JSON-based data stores in Node.js, replace `fs.writeFileSync` with `fs.promises.writeFile` to avoid blocking the event loop. Always implement a concurrency queue/lock (e.g., `isWriting`/`pendingWrite`) to prevent concurrent file writes from corrupting the JSON file. Ensure explicit intermediate data states are tracked during active write locks so they are not lost upon retry.
