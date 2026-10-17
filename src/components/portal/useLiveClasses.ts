import { useState, useEffect } from 'react';
import {
  db,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from '../../lib/firebase';

export interface LiveClass {
  id: string;
  teacherEmail: string;
  teacherName: string;
  teacherId: string;
  meetingLink: string;
  startedAt: any;
  status: 'live' | 'ended';
}

// Realtime list of currently-live classes.
export function useLiveClasses(): LiveClass[] {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  useEffect(() => {
    let unsub = () => {};
    try {
      const q = query(collection(db, 'liveClasses'), where('status', '==', 'live'));
      unsub = onSnapshot(q, (snap) => {
        setClasses(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as LiveClass)));
      }, () => {});
    } catch {}
    return () => unsub();
  }, []);
  return classes;
}

// Start a live class: creates a Jitsi meeting and registers it in Firestore.
export async function startLiveClass(
  teacherId: string,
  teacherEmail: string,
  teacherName: string
): Promise<{ id: string; meetingLink: string }> {
  const meetingLink = `https://meet.jit.si/noor-quran-${teacherId}-${Date.now()}`;
  const ref = await addDoc(collection(db, 'liveClasses'), {
    teacherId,
    teacherEmail,
    teacherName,
    meetingLink,
    startedAt: serverTimestamp(),
    status: 'live'
  });
  return { id: ref.id, meetingLink };
}

// End a live class.
export async function endLiveClass(classId: string): Promise<void> {
  await updateDoc(doc(db, 'liveClasses', classId), { status: 'ended' });
}
