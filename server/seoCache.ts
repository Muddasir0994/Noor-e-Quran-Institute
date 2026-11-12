// Article SEO synced cache (BUG-1/BUG-5 fix, option A).
//
// Articles live in the Firestore `blogPosts` collection, but the server SEO
// renderer and sitemap generator only read the local dataStore — so article
// pages served generic slug-derived titles and the sitemap listed only the
// local articles. This module keeps an auto-refreshed local copy of each
// article's SEO fields, keyed by slug.
//
// Behavior:
// - On startup: load the last good copy from disk immediately (fast warm start),
//   then refresh from Firestore in the background.
// - Every N minutes (ARTICLE_SEO_REFRESH_MINUTES env, default 15): re-read
//   `blogPosts` from Firestore and persist the fresh copy to disk.
// - If Firestore is unavailable (no service account / network error / empty
//   result): log a warning and keep serving the previous copy. Never throws,
//   never breaks existing rendering.

import fs from 'fs';
import path from 'path';
import { isFirestoreEnabled, loadCollectionFromFirestore } from './firestore.js';

export interface ArticleSeoFaq {
  question: string;
  answer: string;
}

export interface ArticleSeoEntry {
  slug: string;
  title: string;
  description: string;
  author?: string;
  featuredImage?: string;
  createdAt?: string;
  updatedAt?: string;
  faqs: ArticleSeoFaq[];
}

const CACHE_FILE = path.join(process.cwd(), 'data', 'articleSeoCache.json');
const DEFAULT_REFRESH_MINUTES = 15;

let cache = new Map<string, ArticleSeoEntry>();
let lastRefreshAt: number | null = null;
let timer: NodeJS.Timeout | null = null;

const stripTags = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Extract FAQ Q&A pairs from article HTML — mirrors the client's extractFaqs
 * in src/pages/BlogPostPage.tsx so server JSON-LD matches client JSON-LD.
 */
export function extractFaqs(html: string): ArticleSeoFaq[] {
  const faqs: ArticleSeoFaq[] = [];
  if (!html) return faqs;
  const section = html.match(/<h2[^>]*>\s*Frequently Asked Questions\s*<\/h2>([\s\S]*?)(?=<h2|$)/i);
  if (!section) return faqs;
  const pairRe = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = pairRe.exec(section[1])) !== null) {
    const question = stripTags(m[1]);
    const answer = stripTags(m[2]);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

function entryFromDoc(doc: any): ArticleSeoEntry | null {
  const slug = String(doc.slug || '').trim();
  const title = stripTags(String(doc.title || ''));
  if (!slug || !title) return null;
  // Skip explicitly unpublished / draft posts; include everything else.
  if (doc.published === false || doc.status === 'draft') return null;
  return {
    slug,
    title,
    description: stripTags(String(doc.metaDescription || doc.summary || doc.description || '')),
    author: doc.author ? stripTags(String(doc.author)) : undefined,
    featuredImage: doc.featuredImage ? String(doc.featuredImage) : undefined,
    createdAt: doc.createdAt ? String(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? String(doc.updatedAt) : undefined,
    faqs: extractFaqs(String(doc.content || '')),
  };
}

/** Load the last persisted copy from disk (synchronous, runs at startup). */
export function loadCacheFromDisk(): number {
  try {
    if (!fs.existsSync(CACHE_FILE)) return 0;
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const entries: ArticleSeoEntry[] = Array.isArray(raw.entries) ? raw.entries : [];
    const next = new Map<string, ArticleSeoEntry>();
    for (const e of entries) {
      if (e && e.slug && e.title) next.set(e.slug, { ...e, faqs: Array.isArray(e.faqs) ? e.faqs : [] });
    }
    cache = next;
    lastRefreshAt = typeof raw.refreshedAt === 'number' ? raw.refreshedAt : null;
    console.log(`[seoCache] Loaded ${cache.size} article SEO entries from disk.`);
  } catch (e: any) {
    console.warn('[seoCache] Could not load disk cache:', e.message);
  }
  return cache.size;
}

let pendingSeoCacheData: string | null = null;
let seoCacheWritePromise: Promise<void> | null = null;

function persistCacheToDisk(): void {
  pendingSeoCacheData = JSON.stringify({ refreshedAt: Date.now(), entries: [...cache.values()] });
  if (!seoCacheWritePromise) {
    seoCacheWritePromise = processSeoCacheWriteQueue();
  }
}

async function processSeoCacheWriteQueue(): Promise<void> {
  while (pendingSeoCacheData) {
    const dataToWrite = pendingSeoCacheData;
    pendingSeoCacheData = null;
    try {
      await fs.promises.mkdir(path.dirname(CACHE_FILE), { recursive: true });
      await fs.promises.writeFile(CACHE_FILE, dataToWrite);
    } catch (e: any) {
      console.warn('[seoCache] Could not persist disk cache:', e.message);
    }
  }
  seoCacheWritePromise = null;
}

export async function flushArticleSeoCache(): Promise<void> {
  while (seoCacheWritePromise) {
    await seoCacheWritePromise;
  }
}

/**
 * Re-read `blogPosts` from Firestore and rebuild the cache.
 * Never throws; on any failure the previous copy keeps serving.
 *
 * Quota-outage fallback (2026-10-21): when the live Firestore read comes
 * back empty (free-tier quota exhausted — same failure that blanks
 * /api/blog-posts), rebuild from the committed repo snapshot
 * (server/blogPostsSnapshot.json), the same last-resort source the public
 * blog API uses, so the sitemap keeps listing every article.
 */
export async function refreshArticleSeoCache(): Promise<number> {
  if (!isFirestoreEnabled()) {
    console.log('[seoCache] Firestore not enabled — keeping existing article SEO cache.');
    return cache.size;
  }
  const fromDocs = (docs: any[]): Map<string, ArticleSeoEntry> => {
    const next = new Map<string, ArticleSeoEntry>();
    for (const d of docs) {
      const entry = entryFromDoc(d);
      if (entry) next.set(entry.slug, entry);
    }
    return next;
  };
  const fromSnapshotFile = (): Map<string, ArticleSeoEntry> => {
    try {
      const file = path.join(process.cwd(), 'server', 'blogPostsSnapshot.json');
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const docs: any[] = Array.isArray(parsed) ? parsed : [];
      console.log(`[seoCache] Falling back to committed blog snapshot (${docs.length} docs).`);
      return fromDocs(docs);
    } catch (e: any) {
      console.warn('[seoCache] Snapshot fallback failed:', e.message);
      return new Map();
    }
  };
  try {
    const docs = await loadCollectionFromFirestore('blogPosts');
    const next = docs.length > 0 ? fromDocs(docs) : fromSnapshotFile();
    if (next.size === 0) {
      console.warn('[seoCache] Firestore and snapshot both empty — keeping previous cache.');
      return cache.size;
    }
    cache = next;
    lastRefreshAt = Date.now();
    persistCacheToDisk();
    console.log(`[seoCache] Refreshed ${cache.size} article SEO entries.`);
  } catch (e: any) {
    console.error('[seoCache] Refresh failed — keeping previous cache:', e.message);
  }
  return cache.size;
}

/**
 * Remove one article's SEO entry by slug (e.g. right after the admin panel
 * deletes it). Never throws.
 */
export function removeArticleSeo(slug: string): void {
  try {
    if (slug && cache.delete(slug)) {
      persistCacheToDisk();
      console.log(`[seoCache] Removed article SEO entry for slug "${slug}".`);
    }
  } catch (e: any) {
    console.warn('[seoCache] remove failed:', e.message);
  }
}

/** Look up one article's SEO fields by slug (undefined on miss). */
export function getArticleSeo(slug: string): ArticleSeoEntry | undefined {
  return cache.get(slug);
}

/**
 * Immediately insert or replace one article's SEO entry (e.g. right after the
 * admin panel publishes it). Makes the crawler path and sitemap correct
 * without waiting for the next background refresh. Never throws.
 */
export function upsertArticleSeo(doc: any): void {
  try {
    const entry = entryFromDoc(doc);
    if (!entry) return;
    cache.set(entry.slug, entry);
    persistCacheToDisk();
    console.log(`[seoCache] Upserted article SEO entry for slug "${entry.slug}".`);
  } catch (e: any) {
    console.warn('[seoCache] upsert failed:', e.message);
  }
}

/** All cached article SEO entries (for the sitemap generator). */
export function getAllArticleSeo(): ArticleSeoEntry[] {
  return [...cache.values()];
}

export function getArticleSeoCacheStats(): { size: number; lastRefreshAt: number | null } {
  return { size: cache.size, lastRefreshAt };
}

/**
 * Start the cache: load disk copy now, refresh from Firestore in the
 * background, then re-refresh on the configured interval. Safe to call once
 * at server startup; never throws.
 */
export function startArticleSeoCache(): void {
  try {
    loadCacheFromDisk();
    // Initial refresh runs in the background so startup is never blocked.
    refreshArticleSeoCache().catch(() => {});
    const minutes = Number(process.env.ARTICLE_SEO_REFRESH_MINUTES) || DEFAULT_REFRESH_MINUTES;
    const ms = Math.max(1, minutes) * 60 * 1000;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      refreshArticleSeoCache().catch(() => {});
    }, ms);
    // Don't keep the Node process alive just for the refresh timer.
    (timer as any).unref?.();
    console.log(`[seoCache] Article SEO cache started; auto-refresh every ${minutes} min.`);
  } catch (e: any) {
    console.error('[seoCache] Failed to start article SEO cache:', e.message);
  }
}

/** Test hook: replace the in-memory cache (used by the smoke test). */
export function _setArticleSeoCacheForTest(entries: ArticleSeoEntry[]): void {
  cache = new Map(entries.map(e => [e.slug, e]));
}
