import { useState, useEffect } from 'react';
import {
  db,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from '../../lib/firebase';

export interface PortalMessage {
  id: string;
  threadId: string;
  fromEmail: string;
  fromName: string;
  fromRole: 'teacher' | 'student';
  toEmail: string;
  text: string;
  read: boolean;
  createdAt: any;
}

// Stable thread id for a teacher-student pair (order-independent).
export function threadIdFor(a: string, b: string): string {
  return [a.toLowerCase(), b.toLowerCase()].sort().join('__');
}

export async function sendPortalMessage(input: {
  fromEmail: string;
  fromName: string;
  fromRole: 'teacher' | 'student';
  toEmail: string;
  text: string;
}): Promise<void> {
  await addDoc(collection(db, 'portalMessages'), {
    ...input,
    threadId: threadIdFor(input.fromEmail, input.toEmail),
    read: false,
    createdAt: serverTimestamp()
  });
}

export async function markThreadRead(threadId: string, myEmail: string): Promise<void> {
  // Best-effort: mark messages addressed to me in this thread as read.
  // (Client-side batch would be nicer; simple loop is fine at this scale.)
  try {
    const q = query(
      collection(db, 'portalMessages'),
      where('threadId', '==', threadId),
      where('toEmail', '==', myEmail),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => updateDoc(doc(db, 'portalMessages', d.id), { read: true })));
  } catch {}
}

// Realtime thread between two users.
export function useMessageThread(emailA?: string, emailB?: string): PortalMessage[] {
  const [msgs, setMsgs] = useState<PortalMessage[]>([]);
  useEffect(() => {
    let unsub = () => {};
    if (!emailA || !emailB) return unsub;
    try {
      const q = query(
        collection(db, 'portalMessages'),
        where('threadId', '==', threadIdFor(emailA, emailB)),
        orderBy('createdAt', 'asc')
      );
      unsub = onSnapshot(q, (snap) => {
        setMsgs(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as PortalMessage)));
      }, () => {});
    } catch {}
    return () => unsub();
  }, [emailA, emailB]);
  return msgs;
}

// Realtime unread count for one user.
export function useUnreadCount(myEmail?: string): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let unsub = () => {};
    if (!myEmail) return unsub;
    try {
      const q = query(
        collection(db, 'portalMessages'),
        where('toEmail', '==', myEmail),
        where('read', '==', false)
      );
      unsub = onSnapshot(q, (snap) => setCount(snap.size), () => {});
    } catch {}
    return () => unsub();
  }, [myEmail]);
  return count;
}
