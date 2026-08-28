import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from './firebase';
import {
  Lead,
  EnrollmentApplication,
  Student,
  ClassProgressReport,
  ContactMessage,
  Course,
  PackagePlan,
  Tutor,
  Testimonial,
  Article,
  BlogPost,
  IslamicResource,
  UserAccount,
  UserRole
} from '../types';
import {
  ALL_COURSES,
  ALL_PACKAGES,
  INITIAL_TUTORS,
  INITIAL_TESTIMONIALS,
  INITIAL_ARTICLES,
  INITIAL_RESOURCES
} from '../data/academyData';

// Collection References
const USERS_COL = 'users';
const LEADS_COL = 'leads';
const ENROLLMENTS_COL = 'enrollments';
const STUDENTS_COL = 'students';
const PROGRESS_COL = 'progressReports';
const CONTACT_COL = 'contactMessages';
const COURSES_COL = 'courses';
const TUTORS_COL = 'tutors';

// ==========================================
// 0. USER ACCOUNTS & PROFILES (STUDENT, TEACHER, ADMIN)
// ==========================================
export async function getUserAccountFromFirebase(uid: string): Promise<UserAccount | null> {
  try {
    const docSnap = await getDoc(doc(db, USERS_COL, uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserAccount;
    }
  } catch (err) {
    console.error('Error fetching user account:', err);
  }
  return null;
}

export async function getUserAccountByEmailFromFirebase(email: string): Promise<UserAccount | null> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const q = query(collection(db, USERS_COL), where('email', '==', cleanEmail), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as UserAccount;
    }
  } catch (err) {
    console.warn('Error fetching user by email from Firestore:', err);
  }
  return null;
}

export async function saveUserAccountToFirebase(user: UserAccount): Promise<void> {
  try {
    const docRef = doc(db, USERS_COL, user.uid);
    await setDoc(docRef, {
      ...user,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('✓ User profile saved to Firestore:', user.uid, user.role);
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
    throw err;
  }
}

export function subscribeToUserAccount(uid: string, callback: (user: UserAccount | null) => void) {
  try {
    const docRef = doc(db, USERS_COL, uid);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserAccount);
      } else {
        callback(null);
      }
    }, (err) => {
      console.warn('User account snapshot listener warning:', err);
    });
  } catch (err) {
    return () => {};
  }
}

export function subscribeToAllUsers(callback: (users: UserAccount[]) => void) {
  try {
    const q = query(collection(db, USERS_COL));
    return onSnapshot(q, (snapshot) => {
      const items: UserAccount[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as UserAccount);
      });
      callback(items);
    }, (err) => {
      console.warn('All users snapshot listener warning:', err);
    });
  } catch (err) {
    return () => {};
  }
}

export async function createTeacherAccountByAdmin(data: {
  displayName: string;
  email: string;
  password?: string;
  gender: 'Male' | 'Female';
  qualification: string;
  specialization: string;
  phone: string;
  bio?: string;
  assignedStudentIds?: string[];
}): Promise<UserAccount> {
  const teacherUid = 'teacher-' + Date.now();
  const newTeacher: UserAccount = {
    uid: teacherUid,
    email: data.email.trim().toLowerCase(),
    displayName: data.displayName.trim(),
    role: 'teacher',
    gender: data.gender,
    qualification: data.qualification,
    specialization: data.specialization,
    phone: data.phone,
    bio: data.bio || `Certified ${data.gender === 'Female' ? 'Female' : 'Male'} Quran & Islamic Studies Faculty at Noor E Quran Institute.`,
    status: 'Active',
    assignedStudentIds: data.assignedStudentIds || [],

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveUserAccountToFirebase(newTeacher);
  return newTeacher;
}

export async function updateTeacherAccountByAdmin(uid: string, updates: Partial<UserAccount>): Promise<void> {
  try {
    const docRef = doc(db, USERS_COL, uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    console.log('✓ Teacher configured by Admin in Firestore:', uid);
  } catch (err) {
    console.error('Error updating teacher account:', err);
    throw err;
  }
}

export async function deleteTeacherAccountByAdmin(uid: string): Promise<void> {
  try {
    await deleteDoc(doc(db, USERS_COL, uid));
    console.log('✓ Teacher account removed from Firestore:', uid);
  } catch (err) {
    console.error('Error deleting teacher account:', err);
    throw err;
  }
}


// ==========================================
// 1. LEADS / FREE TRIAL SUBMISSIONS
// ==========================================
export async function createLeadInFirebase(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
  const newLead: Lead = {
    ...leadData,
    id: 'lead-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, LEADS_COL, newLead.id);
    await setDoc(docRef, newLead);
    console.log('✓ Lead saved to Firebase Firestore:', newLead.id);
  } catch (err) {
    console.error('Error saving lead to Firestore:', err);
  }

  return newLead;
}

export function subscribeToLeads(callback: (leads: Lead[]) => void) {
  try {
    const q = query(collection(db, LEADS_COL), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: Lead[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Lead);
      });
      callback(items);
    }, (error) => {
      console.warn('Leads snapshot listener warning:', error);
    });
  } catch (err) {
    console.warn('subscribeToLeads catch:', err);
    return () => {};
  }
}

export async function updateLeadStatusInFirebase(leadId: string, status: Lead['status']): Promise<void> {
  try {
    const docRef = doc(db, LEADS_COL, leadId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error updating lead in Firebase:', err);
  }
}

// ==========================================
// 2. ENROLLMENT APPLICATIONS
// ==========================================
export async function createEnrollmentInFirebase(
  data: Omit<EnrollmentApplication, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EnrollmentApplication> {
  const newEnrollment: EnrollmentApplication = {
    ...data,
    id: 'enr-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, ENROLLMENTS_COL, newEnrollment.id);
    await setDoc(docRef, newEnrollment);
    console.log('✓ Enrollment saved to Firebase Firestore:', newEnrollment.id);
  } catch (err) {
    console.error('Error saving enrollment to Firestore:', err);
  }

  return newEnrollment;
}

export function subscribeToEnrollments(callback: (enrollments: EnrollmentApplication[]) => void) {
  try {
    const q = query(collection(db, ENROLLMENTS_COL), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: EnrollmentApplication[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as EnrollmentApplication);
      });
      callback(items);
    }, (error) => {
      console.warn('Enrollments snapshot listener warning:', error);
    });
  } catch (err) {
    console.warn('subscribeToEnrollments catch:', err);
    return () => {};
  }
}

// ==========================================
// 3. CONTACT MESSAGES / INQUIRIES
// ==========================================
export async function createContactMessageInFirebase(
  msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>
): Promise<ContactMessage> {
  const newMsg: ContactMessage = {
    ...msg,
    id: 'msg-' + Date.now(),
    status: 'New',
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, CONTACT_COL, newMsg.id);
    await setDoc(docRef, newMsg);
    console.log('✓ Contact message saved to Firestore:', newMsg.id);
  } catch (err) {
    console.error('Error saving contact message to Firestore:', err);
  }

  return newMsg;
}

// ==========================================
// 4. STUDENTS MANAGEMENT
// ==========================================
export async function saveStudentToFirebase(student: Student): Promise<void> {
  try {
    const docRef = doc(db, STUDENTS_COL, student.id);
    await setDoc(docRef, student, { merge: true });
  } catch (err) {
    console.error('Error saving student to Firebase:', err);
  }
}

export function subscribeToStudents(callback: (students: Student[]) => void) {
  try {
    const q = query(collection(db, STUDENTS_COL));
    return onSnapshot(q, (snapshot) => {
      const items: Student[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Student);
      });
      callback(items);
    }, (err) => {
      console.warn('Students listener notice:', err);
    });
  } catch (err) {
    return () => {};
  }
}

// ==========================================
// 5. DAILY SABAQ & PROGRESS REPORTS
// ==========================================
export async function saveProgressReportToFirebase(
  report: Omit<ClassProgressReport, 'id' | 'createdAt'>
): Promise<ClassProgressReport> {
  const newReport: ClassProgressReport = {
    ...report,
    id: 'pr-' + Date.now(),
    createdAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, PROGRESS_COL, newReport.id);
    await setDoc(docRef, newReport);
    console.log('✓ Sabaq Evaluation saved to Firestore:', newReport.id);
  } catch (err) {
    console.error('Error saving progress report to Firebase:', err);
  }

  return newReport;
}

export function subscribeToProgressReports(callback: (reports: ClassProgressReport[]) => void) {
  try {
    const q = query(collection(db, PROGRESS_COL), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: ClassProgressReport[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ClassProgressReport);
      });
      callback(items);
    }, (err) => {
      console.warn('Progress reports listener notice:', err);
    });
  } catch (err) {
    return () => {};
  }
}

// ==========================================
// 6. SEED BASELINE DATA TO FIREBASE (COURSES, TUTORS)
// ==========================================

async function seedDemoStudentsIfEmpty(): Promise<void> {
  const studentsSnap = await getDocs(collection(db, STUDENTS_COL));
  if (!studentsSnap.empty) {
    return;
  }

  const demoStudents: Student[] = [
    {
      id: 'stu-301',
      studentName: 'Ayaan Mahmood',
      parentName: 'Dr. Tariq Mahmood',
      email: 'tariq.mahmood@nhs.net',
      phone: '+44 7700 900077',
      country: 'United Kingdom',
      courseId: 'c-2',
      courseName: 'Quran Reading / Nazra with Tajweed',
      packageId: 'pkg-3days',
      packageName: 'Standard Learning (3 Days/Week)',
      tutorId: 'tut-1',
      tutorName: 'Ustadha Maryam Siddiqa',
      preferredTime: 'Evening',
      preferredDays: ['Monday', 'Wednesday', 'Friday'],
      learningPace: 'Normal',
      status: 'Active',
      currentSurahOrLesson: 'Surah Al-Baqarah (Ayah 142)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: []
    },
    {
      id: 'stu-302',
      studentName: 'Hamza Farhan',
      parentName: 'Farhan Akhtar',
      email: 'farhan.akhtar@gmail.com',
      phone: '+1 647 123 4567',
      country: 'Canada',
      courseId: 'c-4',
      courseName: 'Quran Memorization / Hifz Track',
      packageId: 'pkg-5days',
      packageName: 'Intensive Hifz (5 Days/Week)',
      tutorId: 'tut-2',
      tutorName: 'Qari Hafiz Muhammad Bilal',
      preferredTime: 'Morning',
      preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      learningPace: 'Fast',
      status: 'Active',
      currentSurahOrLesson: 'Juz 6 (Surah An-Nisa Ayah 45)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: []
    }
  ];

  for (const st of demoStudents) {
    await setDoc(doc(db, STUDENTS_COL, st.id), st);
  }
  console.log('✓ Seeded demo students into Firestore.');
}

async function seedInitialUsersIfEmpty(): Promise<void> {
  const usersSnap = await getDocs(collection(db, USERS_COL));
  if (!usersSnap.empty) {
    return;
  }

  const initialUsers: UserAccount[] = [
    {
      uid: 'teacher-maryam',
      email: 'maryam.siddiqa@alnoorquraan.com',
      displayName: 'Ustadha Maryam Siddiqa',
      role: 'teacher',
      gender: 'Female',
      qualification: 'Wifaq-ul-Madaris Al-Arabia (Aalimah Degree), Qariyah Certificate',
      specialization: 'Noorani Qaida, Tajweed Mastery for Sisters & Kids',
      phone: '+92 301 9876543',
      bio: '10+ years teaching experience with sisters and young kids across UK, USA, and Canada.',
      status: 'Active',
      assignedStudentIds: ['stu-301'],

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uid: 'teacher-bilal',
      email: 'bilal.qari@alnoorquraan.com',
      displayName: 'Qari Hafiz Muhammad Bilal',
      role: 'teacher',
      gender: 'Male',
      qualification: 'Hafiz-e-Quran, Qiraat Sab’ah Specialist (Jamia Ashrafia)',
      specialization: 'Hifz Track, Tajweed Rules & Makharij Precision',
      phone: '+92 321 4567890',
      bio: 'Specialist in 1-on-1 Quran Memorization and voice modulation with students in North America and Europe.',
      status: 'Active',
      assignedStudentIds: ['stu-302'],

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uid: 'admin-main',
      email: 'admin@alnoorquraan.com',
      displayName: 'Academy Principal & Admin',
      role: 'admin',
      gender: 'Male',
      phone: '+92 327 4496163',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  for (const u of initialUsers) {
    await setDoc(doc(db, USERS_COL, u.uid), u);
  }
  console.log('✓ Seeded initial teachers and admin accounts into Firestore.');
}

export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    await seedDemoStudentsIfEmpty();
    await seedInitialUsersIfEmpty();
  } catch (err) {
    console.warn('Seeding check note:', err);
  }
}

// ==========================================
// BLOG POSTS (CMS)
// ==========================================
const BLOG_COL = 'blogPosts';

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(collection(db, BLOG_COL), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
  } catch (err) {
    console.warn('Error fetching blog posts:', err);
    return [];
  }
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const q = query(
      collection(db, BLOG_COL),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
  } catch (err) {
    console.warn('Error fetching published blog posts:', err);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const q = query(collection(db, BLOG_COL), where('slug', '==', slug), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as BlogPost;
    }
  } catch (err) {
    console.warn('Error fetching blog post by slug:', err);
  }
  return null;
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
  try {
    await setDoc(doc(db, BLOG_COL, post.id), post);
  } catch (err) {
    console.error('Error saving blog post:', err);
    throw err;
  }
}

export async function deleteBlogPost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BLOG_COL, id));
  } catch (err) {
    console.error('Error deleting blog post:', err);
    throw err;
  }
}
