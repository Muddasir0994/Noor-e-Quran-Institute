import { useState, useEffect } from 'react';
import {
  db,
  doc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from '../../lib/firebase';

export interface PresenceEntry {
  email: string;
  name: string;
  role: 'teacher' | 'student';
  online: boolean;
  lastSeen: any;
}

// Sample student directory with portal login emails (matches seed data).
export const KNOWN_STUDENTS = [
  { id: 'stu-301', name: 'Ayaan Mahmood', email: 'tariq.mahmood@nhs.net', course: 'Quran Reading / Nazra', country: 'United Kingdom' },
  { id: 'stu-302', name: 'Hamza Farhan', email: 'farhan.akhtar@gmail.com', course: 'Quran Memorization / Hifz', country: 'Canada' },
  { id: 'stu-303', name: 'Zoya Ahmed', email: 'ahmed.raza@example.com', course: 'Noorani Qaida', country: 'United Kingdom' },
  { id: 'stu-304', name: 'Daniyal Qureshi', email: 'zainab.q@example.com', course: 'Quran with Tajweed', country: 'Canada' },
  { id: 'stu-305', name: 'Ibrahim Usmani', email: 'usman.tariq@example.com', course: 'Quran Reading / Nazra', country: 'UAE' }
];

// Publish this user's online presence; heartbeat every 30s; mark offline on exit.
export function usePresence(email?: string, name?: string, role?: 'teacher' | 'student') {
  useEffect(() => {
    if (!email) return;
    const ref = doc(db, 'presence', email);
    const payload = {
      email,
      name: name || email,
      role: role || 'student',
      online: true,
      lastSeen: serverTimestamp()
    };
    setDoc(ref, payload, { merge: true }).catch(() => {});
    const iv = setInterval(() => {
      updateDoc(ref, { lastSeen: serverTimestamp(), online: true }).catch(() => {});
    }, 30000);
    const markOffline = () => {
      updateDoc(ref, { online: false }).catch(() => {});
    };
    window.addEventListener('beforeunload', markOffline);
    return () => {
      clearInterval(iv);
      window.removeEventListener('beforeunload', markOffline);
      markOffline();
    };
  }, [email]); // eslint-disable-line react-hooks/exhaustive-deps
}

// Realtime list of all presence docs.
export function usePresenceList(): PresenceEntry[] {
  const [list, setList] = useState<PresenceEntry[]>([]);
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onSnapshot(
        collection(db, 'presence'),
        (snap) => {
          setList(snap.docs.map(d => ({ email: d.id, ...(d.data() as any) } as PresenceEntry)));
        },
        () => {}
      );
    } catch {}
    return () => unsub();
  }, []);
  return list;
}

// Online if explicitly online AND lastSeen within 2 minutes.
export function isOnline(entry?: PresenceEntry | null): boolean {
  if (!entry || entry.online === false) return false;
  try {
    const ts = entry.lastSeen?.toMillis ? entry.lastSeen.toMillis() : 0;
    if (!ts) return !!entry.online;
    return Date.now() - ts < 2 * 60 * 1000;
  } catch {
    return !!entry.online;
  }
}

// Human-readable "last seen" text for offline users.
export function lastSeenText(entry?: PresenceEntry | null): string {
  if (!entry) return 'Never seen';
  if (isOnline(entry)) return 'Online now';
  try {
    const ts = entry.lastSeen?.toMillis ? entry.lastSeen.toMillis() : 0;
    if (!ts) return 'Offline';
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } catch {
    return 'Offline';
  }
}
