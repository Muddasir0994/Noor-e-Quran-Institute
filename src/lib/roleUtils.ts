// Shared role utilities for portal auth gating.
// A user is a teacher if their email matches a faculty email in INITIAL_TUTORS.

import { INITIAL_TUTORS } from '../data/academyData';

const TUTOR_EMAILS = new Set(
  INITIAL_TUTORS.map(t => (t.email || '').trim().toLowerCase()).filter(Boolean)
);

// Extra known faculty emails (in case seed data changes)
const EXTRA_TEACHER_EMAILS = new Set([
  'maryam.tutor@alnoor.edu',
  'bilal.qari@alnoor.edu',
  'ayesha.tutor@alnoor.edu',
  'tariq.azhari@alnoor.edu',
  'abdulrehman.tutor@alnoor.edu',
]);

export function isTeacherEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return TUTOR_EMAILS.has(clean) || EXTRA_TEACHER_EMAILS.has(clean);
}

export function getRoleForEmail(email: string | undefined | null): 'teacher' | 'student' {
  return isTeacherEmail(email) ? 'teacher' : 'student';
}
