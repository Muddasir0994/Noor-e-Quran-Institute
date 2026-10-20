// Committed snapshot of the blogPosts collection (server/blogPostsSnapshot.json).
//
// Why: the public blog reads Firestore on every request. When the Firestore
// free-tier daily read quota is exhausted (hit on 2026-10-20), every read
// fails and /api/blog-posts returned an empty list — the blog went blank.
// This snapshot is the last-resort fallback so the blog NEVER renders empty:
// handlers use live Firestore data when available and this snapshot when the
// live read fails or comes back empty. Refresh the file occasionally from a
// successful /api/blog-posts response.

import fs from 'fs';
import path from 'path';

let snapshot: any[] | null = null;

export function getBlogSnapshot(): any[] {
  if (snapshot) return snapshot;
  try {
    const file = path.join(process.cwd(), 'server', 'blogPostsSnapshot.json');
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
    snapshot = Array.isArray(parsed) ? parsed : [];
  } catch {
    snapshot = [];
  }
  return snapshot;
}
