## 2024-05-24 - Async FS Write Optimization for Singletons
**Learning:** In highly concurrent environments like this application, doing a synchronous file write (fs.writeFileSync) inside a database store (dataStore.ts) on every API request blocks the main event loop, causing massive request delays under load.
**Action:** Always optimize heavy singletons storing JSON data to disk by using asynchronous fs.promises.writeFile with a concurrency loop (while (this.pendingData)) and flush methods hooked into the app's graceful shutdown procedure.
