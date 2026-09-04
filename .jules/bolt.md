## 2025-03-09 - Asynchronous DataStore with Queueing
**Learning:** `DataStore` was blocking the Express event loop synchronously when writing `academy_db.json`. Simply using `fs.promises.writeFile` without locking leads to file corruption if multiple writes happen concurrently.
**Action:** Always implement a boolean locking state (`isWriting`/`pendingWrite`) or queue when adapting synchronous singleton writers to asynchronous in Node.js.
