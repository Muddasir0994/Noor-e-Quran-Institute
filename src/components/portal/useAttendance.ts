import { useState, useEffect } from 'react';
import {
  db,
  collection,
  addDoc,
  setDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from '../../lib/firebase';

export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface AttendanceRecord {
  id: string;
  studentId?: string;
  studentEmail: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string;
  markedAt: any;
}

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function markAttendance(input: {
  studentId?: string;
  studentEmail: string;
  studentName: string;
  status: AttendanceStatus;
  markedBy: string;
}): Promise<void> {
  const date = todayKey();
  // One doc per student per day. Unified ID with the server dataStore:
  // att-<date>-<studentId>. Fall back to the legacy email-based ID only
  // when the portal does not know the studentId.
  const id = input.studentId
    ? `att-${date}-${input.studentId}`
    : `${input.studentEmail.toLowerCase()}_${date}`;
  const payload: Record<string, any> = {
    studentEmail: input.studentEmail,
    studentName: input.studentName,
    status: input.status,
    markedBy: input.markedBy,
    date,
    markedAt: serverTimestamp()
  };
  if (input.studentId) payload.studentId = input.studentId;
  await setDoc(doc(db, 'attendance', id), payload, { merge: true });
}

// Realtime map of today's attendance: email -> status.
export function useTodayAttendance(): Record<string, AttendanceStatus> {
  const [map, setMap] = useState<Record<string, AttendanceStatus>>({});
  useEffect(() => {
    let unsub = () => {};
    try {
      const q = query(collection(db, 'attendance'), where('date', '==', todayKey()));
      unsub = onSnapshot(q, (snap) => {
        const m: Record<string, AttendanceStatus> = {};
        snap.docs.forEach(d => {
          const data = d.data() as any;
          if (data.studentEmail) m[data.studentEmail.toLowerCase()] = data.status;
        });
        setMap(m);
      }, () => {});
    } catch {}
    return () => unsub();
  }, []);
  return map;
}

// Attendance history for one student (most recent first).
export function useStudentAttendance(studentEmail?: string): AttendanceRecord[] {
  const [list, setList] = useState<AttendanceRecord[]>([]);
  useEffect(() => {
    let unsub = () => {};
    if (!studentEmail) return unsub;
    try {
      const q = query(
        collection(db, 'attendance'),
        where('studentEmail', '==', studentEmail)
      );
      unsub = onSnapshot(q, (snap) => {
        const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as AttendanceRecord));
        rows.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setList(rows.slice(0, 30));
      }, () => {});
    } catch {}
    return () => unsub();
  }, [studentEmail]);
  return list;
}
