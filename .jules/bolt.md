## 2024-05-25 - [Async Database Saving]
**Learning:** In DataStore, synchronous file writing with `fs.writeFileSync` can block the main thread and impact backend performance under load.
**Action:** Replace `fs.writeFileSync` with asynchronous `fs.promises.writeFile` and implement a concurrency lock/queue mechanism for pending writes to prevent file corruption and maintain performance.
