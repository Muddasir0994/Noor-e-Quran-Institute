## 2024-05-24 - Async Database Writes
**Learning:** Synchronous file operations like `fs.writeFileSync` block the Node.js event loop, severely degrading performance for concurrent API requests.
**Action:** Always prefer asynchronous file operations (`fs.promises.writeFile`) with a lock or queue to ensure thread-safety while preserving concurrency.
## 2024-05-24 - Async Lock Mechanism Fix
**Learning:** When creating a recursive locking/queuing mechanism for asynchronous operations like `fs.promises.writeFile`, capturing the payload in a closure before the asynchronous operation causes data staleness. Re-running the lock blindly causes infinite recursion if not resetting `pendingWrite` appropriately inside the retry.
**Action:** Always fetch the latest state from the singleton *inside* the asynchronous execution closure right before writing, clear the `pendingData` buffer, and reset the `pendingWrite` flag before waiting to capture new events appropriately.
