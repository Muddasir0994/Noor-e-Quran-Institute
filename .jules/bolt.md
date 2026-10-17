## 2025-03-09 - SEO Metadata Injection Caching
**Learning:** The Express server dynamically resolved and injected complex SEO metadata and crawler-specific prerendered HTML strings on every single frontend request. Under load, this string manipulation (`html.replace`) became a significant CPU bottleneck. Caching the fully-injected HTML output per-path (with a TTL to handle dynamic data updates) reduces response latency dramatically.
**Action:** Always consider an LRU/Map cache with TTL when dealing with expensive dynamic SSR or meta-tag injection loops, partitioning the cache by relevant variables (like `req.path` and crawler user-agents).

## 2025-03-09 - TypeScript Caching Nuances
**Learning:** When implementing LRU caches in TypeScript, be extremely careful about the types stored in the cache map. Do not dynamically swap string values for objects, and ensure the type definition explicitly permits the fields you are trying to access (like `timestamp` and `html`).
**Action:** Always strictly type the LRU Cache Map structure (e.g. `Map<string, { html: string, timestamp: number }>`) and double check types before assigning cached values back to variables.
