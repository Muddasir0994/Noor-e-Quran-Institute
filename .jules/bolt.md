## 2024-04-18 - Unmemoized Array Filtering in Audio Components
**Learning:** In components that experience frequent state updates (like `ClassroomStudio.tsx` due to `activeAyahNumber` changing during audio playback), inline array filtering (e.g. `TAJWEED_RULES.filter()`) in the JSX causes `O(N)` re-evaluation on every render, blocking the main thread and potentially causing jank in the audio UI.
**Action:** Always wrap computationally expensive array derivations or filtering logic in `useMemo`, especially in large parent components handling multimedia or rapid state changes.
