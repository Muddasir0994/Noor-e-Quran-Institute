## 2024-10-15 - React List Filtering Optimization
**Learning:** In React components like `CoursesPage.tsx` and `BlogListPage.tsx`, filtering large arrays (like course or blog post lists) directly within the render body causes expensive re-evaluations on every render, even when the underlying list or search queries haven't changed.
**Action:** Always wrap derived list calculations (filtering, sorting) in `useMemo` with appropriate dependency arrays to prevent synchronous performance bottlenecks during React's render phase.
