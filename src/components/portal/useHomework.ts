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
  orderBy,
  serverTimestamp
} from '../../lib/firebase';

export interface HomeworkSubmission {
  id: string;
  studentEmail: string;
  studentName: string;
  teacherEmail: string;
  title: string;
  textAnswer: string;
  status: 'submitted' | 'reviewed';
  feedback?: string;
  submittedAt: any;
  reviewedAt?: any;
}

export async function submitHomework(input: {
  studentEmail: string;
  studentName: string;
  teacherEmail: string;
  title: string;
  textAnswer: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'homeworkSubmissions'), {
    ...input,
    status: 'submitted',
    feedback: '',
    submittedAt: serverTimestamp()
  });
  return ref.id;
}

export async function reviewHomework(id: string, feedback: string): Promise<void> {
  await updateDoc(doc(db, 'homeworkSubmissions', id), {
    status: 'reviewed',
    feedback,
    reviewedAt: serverTimestamp()
  });
}

// Realtime submissions for one teacher (their students' homework).
export function useHomeworkSubmissions(teacherEmail?: string): HomeworkSubmission[] {
  const [list, setList] = useState<HomeworkSubmission[]>([]);
  useEffect(() => {
    let unsub = () => {};
    if (!teacherEmail) return unsub;
    try {
      const q = query(
        collection(db, 'homeworkSubmissions'),
        where('teacherEmail', '==', teacherEmail),
        orderBy('submittedAt', 'desc')
      );
      unsub = onSnapshot(q, (snap) => {
        setList(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as HomeworkSubmission)));
      }, () => {});
    } catch {}
    return () => unsub();
  }, [teacherEmail]);
  return list;
}

// Realtime submissions for one student (their own history + feedback).
export function useMyHomework(studentEmail?: string): HomeworkSubmission[] {
  const [list, setList] = useState<HomeworkSubmission[]>([]);
  useEffect(() => {
    let unsub = () => {};
    if (!studentEmail) return unsub;
    try {
      const q = query(
        collection(db, 'homeworkSubmissions'),
        where('studentEmail', '==', studentEmail),
        orderBy('submittedAt', 'desc')
      );
      unsub = onSnapshot(q, (snap) => {
        setList(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as HomeworkSubmission)));
      }, () => {});
    } catch {}
    return () => unsub();
  }, [studentEmail]);
  return list;
}
