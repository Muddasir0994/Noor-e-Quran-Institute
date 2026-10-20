// Server-side Firestore initialization (Firebase Admin SDK).
// Uses FIREBASE_SERVICE_ACCOUNT env var (the service account JSON string).
// If not configured, the server falls back to the local JSON database.

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'gen-lang-client-0405182011';
const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID ||
  'ai-studio-alnoorquraanacad-b7bdb98c-a1e7-4d2a-856a-2d7a6decb70d';

let app: App | null = null;
let db: Firestore | null = null;
let enabled = false;

export function initFirestore(): boolean {
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saJson) {
    console.log('[firestore] FIREBASE_SERVICE_ACCOUNT not set — using local JSON database only.');
    return false;
  }
  try {
    const sa = JSON.parse(saJson);
    app = getApps().length === 0
      ? initializeApp({ credential: cert(sa), projectId: PROJECT_ID })
      : getApps()[0];
    db = getFirestore(app, DATABASE_ID);
    enabled = true;
    console.log(`[firestore] Connected to project ${PROJECT_ID}, database ${DATABASE_ID}.`);
    return true;
  } catch (e: any) {
    console.error('[firestore] Initialization failed, using local JSON database:', e.message);
    return false;
  }
}

export function isFirestoreEnabled(): boolean {
  return enabled && db !== null;
}

export function getFirestoreDb(): Firestore | null {
  return db;
}

// Write-through helper: sync one document to Firestore (fire-and-forget safe).
export async function syncDocToFirestore(collection: string, id: string, data: any): Promise<void> {
  if (!isFirestoreEnabled() || !db) return;
  try {
    // strip undefined values (Firestore rejects them)
    const clean = JSON.parse(JSON.stringify(data));
    await db.collection(collection).doc(id).set(clean, { merge: true });
  } catch (e: any) {
    console.error(`[firestore] sync failed ${collection}/${id}:`, e.message);
  }
}

export async function deleteDocFromFirestore(collection: string, id: string): Promise<void> {
  if (!isFirestoreEnabled() || !db) return;
  try {
    await db.collection(collection).doc(id).delete();
  } catch (e: any) {
    console.error(`[firestore] delete failed ${collection}/${id}:`, e.message);
  }
}

// Load an entire collection from Firestore into plain objects.
// Resilience (2026-10-20): results are cached in memory for 2 minutes so
// public endpoints don't burn a full collection read on every request, and
// when a read fails (e.g. free-tier daily quota exhausted) or comes back
// empty after a previously successful load, the last good copy is served —
// a transient Firestore failure must never blank out public content.
const collectionCache = new Map<string, { at: number; docs: any[] }>();
const COLLECTION_CACHE_TTL_MS = 120_000;

export async function loadCollectionFromFirestore(collection: string): Promise<any[]> {
  const hit = collectionCache.get(collection);
  if (hit && Date.now() - hit.at < COLLECTION_CACHE_TTL_MS) {
    return hit.docs;
  }
  if (!isFirestoreEnabled() || !db) return hit?.docs ?? [];
  try {
    const snap = await db.collection(collection).get();
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (docs.length > 0) {
      collectionCache.set(collection, { at: Date.now(), docs });
      return docs;
    }
    return hit?.docs ?? docs;
  } catch (e: any) {
    console.error(`[firestore] load failed ${collection}:`, e.message);
    return hit?.docs ?? [];
  }
}
