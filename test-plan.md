1. **Optimize file writes in `server/dataStore.ts`**
   - Replace synchronous `fs.writeFileSync` with asynchronous `fs.promises.writeFile`.
   - Implement a concurrency lock/queue using `isWriting`, `pendingWrite`, `pendingData`, and `writePromise` properties to prevent file corruption and race conditions.
   - Add an async `flush()` method using a `while(this.writePromise)` loop to ensure all dynamically added writes complete.

2. **Verify modification of `server/dataStore.ts`**
   - Use `read_file` to confirm the changes have been applied correctly.

3. **Implement graceful shutdown in `server.ts`**
   - Save the Express server instance returned by `app.listen`.
   - Attach `SIGINT` and `SIGTERM` signal handlers.
   - In the handlers, call `server.closeAllConnections()` and `server.close()` to stop accepting new requests.
   - Await `dataStore.flush()` inside the close callback to save pending data.
   - Add a 10-second `setTimeout` fallback to force process exit if graceful cleanup hangs.

4. **Verify modification of `server.ts`**
   - Use `read_file` to ensure the server gracefully handles shutdowns.

5. **Journal learning in `.jules/bolt.md`**
   - Create or update the `.jules/bolt.md` file with a journal entry about optimizing the event loop blocking file writes in singletons.

6. **Verify journaling**
   - Use `read_file` to verify the journal entry is correctly formatted.

7. **Complete pre-commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

8. **Submit the PR**
   - Use the submit tool to present the performance improvement as the Bolt agent.
