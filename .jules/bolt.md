## 2024-10-27 - [Non-Blocking DataStore I/O]
**Learning:** Optimizing synchronous file writes (`fs.writeFileSync`) to asynchronous writes (`fs.promises.writeFile`) in singletons like `DataStore` requires a concurrency queueing or locking mechanism (e.g., `isWriting`/`pendingWrite` flags) to prevent file corruption caused by concurrent overlapping writes.
**Action:** Always implement a write queue lock when refactoring file I/O to be asynchronous in singleton instances.
