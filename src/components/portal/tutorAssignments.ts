// Teacher ↔ Student assignment mapping.
// Source of truth: Firestore `students` collection (each student has tutorId).
// This mirrors the seed data; when real students are added, the admin assigns
// a tutor and this mapping should be updated (or fetched from the API).

export interface AssignedTutor {
  id: string;
  name: string;
  email: string;
  specialization: string;
}

export const TUTOR_DIRECTORY: AssignedTutor[] = [
  { id: 'tut-muddasir', name: 'M Muddasir Hameed', email: 'contact.noorequraninstitute@gmail.com', specialization: 'Noorani Qaida, Nazra Quran, Tajweed, Hifz, Islamic Studies' },
];

// student login email (lowercase) → tutor id
export const STUDENT_TUTOR_MAP: Record<string, string> = {
  'tariq.mahmood@nhs.net': 'tut-muddasir',   // Ayaan Mahmood → M Muddasir Hameed
  'farhan.akhtar@gmail.com': 'tut-muddasir',  // Hamza Farhan → M Muddasir Hameed
  'ahmed.raza@example.com': 'tut-muddasir',   // Zoya Ahmed → M Muddasir Hameed
  'zainab.q@example.com': 'tut-muddasir',     // Daniyal Qureshi → M Muddasir Hameed
  'usman.tariq@example.com': 'tut-muddasir',  // Ibrahim Usmani → M Muddasir Hameed
};

export function getTutorById(id: string): AssignedTutor | undefined {
  return TUTOR_DIRECTORY.find(t => t.id === id);
}

export function getTutorByEmail(email: string): AssignedTutor | undefined {
  return TUTOR_DIRECTORY.find(t => t.email.toLowerCase() === email.toLowerCase());
}

// The ONE tutor assigned to a student (by student login email).
export function getAssignedTutor(studentEmail?: string | null): AssignedTutor | undefined {
  if (!studentEmail) return undefined;
  const tutorId = STUDENT_TUTOR_MAP[studentEmail.toLowerCase()];
  return tutorId ? getTutorById(tutorId) : undefined;
}

// All student emails assigned to a tutor (by tutor login email).
export function getAssignedStudentEmails(tutorEmail?: string | null): string[] {
  if (!tutorEmail) return [];
  const tutor = getTutorByEmail(tutorEmail);
  if (!tutor) return [];
  return Object.entries(STUDENT_TUTOR_MAP)
    .filter(([, tutorId]) => tutorId === tutor.id)
    .map(([studentEmail]) => studentEmail);
}

// Full student directory (mirrors Firestore `students` seed data).
export interface DirectoryStudent {
  id: string;
  studentName: string;
  email: string;
  parentName: string;
  country: string;
  courseName: string;
  tutorId: string;
  currentLesson: string;
}

export const STUDENT_DIRECTORY: DirectoryStudent[] = [
  { id: 'stu-301', studentName: 'Ayaan Mahmood', email: 'tariq.mahmood@nhs.net', parentName: 'Dr. Tariq Mahmood', country: 'United Kingdom', courseName: 'Quran Reading / Nazra', tutorId: 'tut-muddasir', currentLesson: 'Surah Al-Baqarah (Ayah 142)' },
  { id: 'stu-302', studentName: 'Hamza Farhan', email: 'farhan.akhtar@gmail.com', parentName: 'Farhan Akhtar', country: 'Canada', courseName: 'Quran Memorization / Hifz', tutorId: 'tut-muddasir', currentLesson: 'Juz 12 — Sabaq in progress' },
  { id: 'stu-303', studentName: 'Zoya Ahmed', email: 'ahmed.raza@example.com', parentName: 'Ahmed Raza', country: 'United Kingdom', courseName: 'Noorani Qaida', tutorId: 'tut-muddasir', currentLesson: 'Noorani Qaida — Lesson 8' },
  { id: 'stu-304', studentName: 'Daniyal Qureshi', email: 'zainab.q@example.com', parentName: 'Zainab Qureshi', country: 'Canada', courseName: 'Quran with Tajweed', tutorId: 'tut-muddasir', currentLesson: 'Surah Al-Imran (Ayah 45)' },
  { id: 'stu-305', studentName: 'Ibrahim Usmani', email: 'usman.tariq@example.com', parentName: 'Usman Tariq', country: 'UAE', courseName: 'Quran Reading / Nazra', tutorId: 'tut-muddasir', currentLesson: 'Surah An-Nisa (Ayah 20)' },
];

// Look up a student by their login email.
export function getStudentByEmail(email?: string | null): DirectoryStudent | undefined {
  if (!email) return undefined;
  return STUDENT_DIRECTORY.find(s => s.email.toLowerCase() === email.toLowerCase());
}
