## 2024-10-17 - Optimize List Filtering Performance

**Learning:** In React components with search or category filtering (like `CoursesPage.tsx`, `BlogListPage.tsx`, and `ClassroomStudio.tsx`), derived list calculations running synchronously during every render can cause measurable performance bottlenecks, especially on slower devices or as lists grow.
**Action:** Always wrap derived list filtering calculations (using `.filter()`, `.map()`, etc. on state variables) in a `useMemo()` hook to prevent expensive re-evaluations on every render.
