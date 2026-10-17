import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Course,
  PackagePlan,
  Lead,
  EnrollmentApplication,
  Student,
  Tutor,
  ScheduledClass,
  ClassProgressReport,
  StudentAssessment,
  Testimonial,
  Article,
  IslamicResource,
  ContactMessage,
  SystemNotification,
  DashboardStats,
  Note,
  AttendanceRecord,
  TrialClass,
  FeeReminder,
  HifzLog,
  TutorAvailability,
  Coupon,
  Referral
} from '../src/types.js';
import {
  ALL_COURSES,
  ALL_PACKAGES,
  INITIAL_TUTORS,
  INITIAL_TESTIMONIALS,
  INITIAL_ARTICLES,
  INITIAL_RESOURCES
} from '../src/data/academyData.js';

interface DatabaseSchema {
  courses: Course[];
  packages: PackagePlan[];
  leads: Lead[];
  enrollments: EnrollmentApplication[];
  students: Student[];
  tutors: Tutor[];
  classes: ScheduledClass[];
  progressReports: ClassProgressReport[];
  assessments: StudentAssessment[];
  testimonials: Testimonial[];
  articles: Article[];
  resources: IslamicResource[];
  contacts: ContactMessage[];
  notifications: SystemNotification[];
  adminTokens: string[];
  attendance: AttendanceRecord[];
  trials: TrialClass[];
  feeReminders: FeeReminder[];
  hifzLogs: HifzLog[];
  availability: TutorAvailability[];
  coupons: Coupon[];
  referrals: Referral[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'academy_db.json');

class DataStore {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          courses: parsed.courses?.length ? parsed.courses : ALL_COURSES,
          packages: parsed.packages?.length ? parsed.packages : ALL_PACKAGES,
          leads: parsed.leads || [],
          enrollments: parsed.enrollments || [],
          students: parsed.students || [],
          tutors: parsed.tutors?.length ? parsed.tutors : INITIAL_TUTORS,
          classes: parsed.classes || [],
          progressReports: parsed.progressReports || [],
          assessments: parsed.assessments || [],
          testimonials: parsed.testimonials?.length ? parsed.testimonials : INITIAL_TESTIMONIALS,
          articles: (() => {
            const dbArticles = parsed.articles || [];
            const merged = [...INITIAL_ARTICLES];
            for (const a of dbArticles) {
              if (!merged.some(m => m.id === a.id || m.slug === a.slug)) {
                merged.push(a);
              }
            }
            return merged;
          })(),
          resources: parsed.resources?.length ? parsed.resources : INITIAL_RESOURCES,
          contacts: parsed.contacts || [],
          notifications: parsed.notifications || [],
          adminTokens: parsed.adminTokens || [],
          attendance: parsed.attendance || [],
          trials: parsed.trials || [],
          feeReminders: parsed.feeReminders || [],
          hifzLogs: parsed.hifzLogs || [],
          availability: parsed.availability || [],
          coupons: parsed.coupons || [],
          referrals: parsed.referrals || []
        };
      } catch (err) {
        console.error('Error reading academy_db.json, seeding initial data:', err);
      }
    }

    const initialData: DatabaseSchema = {
      courses: ALL_COURSES,
      packages: ALL_PACKAGES,
      leads: [
        {
          id: 'lead-101',
          studentName: 'Zayd Ali',
          parentName: 'Imran Ali',
          email: 'imran.ali.uk@gmail.com',
          phone: '+44 7911 123456',
          country: 'United Kingdom',
          courseId: 'c-1',
          courseName: 'Noorani Qaida',
          tutorGender: 'Female',
          timeSlot: 'Evening',
          preferredDays: ['Monday', 'Tuesday', 'Wednesday'],
          preferredTimeRange: '5:00 PM - 7:00 PM (UK Time)',
          learningPace: 'Normal',
          notes: [{ id: 'n-1', text: 'Interested in female tutor for 6-year-old child', author: 'System', createdAt: new Date().toISOString() }],
          status: 'New Lead',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: 'lead-102',
          studentName: 'Maryam K.',
          parentName: 'Self (Adult)',
          email: 'maryam.k@outlook.com',
          phone: '+1 416 555 0192',
          country: 'Canada',
          courseId: 'c-3',
          courseName: 'Quran with Tajweed',
          tutorGender: 'Female',
          timeSlot: 'Night',
          preferredDays: ['Saturday', 'Sunday'],
          preferredTimeRange: '8:00 PM - 10:00 PM (EST)',
          learningPace: 'Normal',
          notes: [{ id: 'n-2', text: 'Wants to polish Tajweed rules and Makharij', author: 'System', createdAt: new Date().toISOString() }],
          status: 'Trial Scheduled',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ],
      enrollments: [
        {
          id: 'app-201',
          studentName: 'Ayaan Mahmood',
          studentEmail: 'ayaankids@gmail.com',
          phone: '+44 7700 900077',
          country: 'United Kingdom',
          parentName: 'Dr. Tariq Mahmood',
          parentPhone: '+44 7700 900077',
          parentEmail: 'tariq.mahmood@nhs.net',
          courseId: 'c-2',
          courseName: 'Quran Reading / Nazra',
          packageId: 'pkg-3days',
          packageName: 'Standard Learning (3 Days/Week)',
          tutorPreference: 'Female',
          timeSlot: 'Evening',
          preferredDays: ['Monday', 'Wednesday', 'Friday'],
          preferredTimeRange: '6:00 PM UK Time',
          learningPace: 'Normal',
          additionalNotes: 'Completed Qaida recently, ready for Juz 1 recitation.',
          status: 'Approved',
          assignedTutorId: 'tut-1',
          assignedTutorName: 'Ustadha Maryam Siddiqa',
          notes: [{ id: 'n-3', text: 'Assigned to Ustadha Maryam. Classes starting Monday.', author: 'Admin', createdAt: new Date().toISOString() }],
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
        }
      ],
      students: [
        {
          id: 'stu-301',
          studentName: 'Ayaan Mahmood',
          parentName: 'Dr. Tariq Mahmood',
          email: 'tariq.mahmood@nhs.net',
          phone: '+44 7700 900077',
          country: 'United Kingdom',
          courseId: 'c-2',
          courseName: 'Quran Reading / Nazra',
          packageId: 'pkg-3days',
          packageName: 'Standard Learning (3 Days/Week)',
          tutorId: 'tut-1',
          tutorName: 'Ustadha Maryam Siddiqa',
          preferredTime: 'Evening',
          preferredDays: ['Monday', 'Wednesday', 'Friday'],
          learningPace: 'Normal',
          status: 'Active',
          currentSurahOrLesson: 'Para 2 (Sayaqool)',
          notes: [{ id: 'n-4', text: 'Enrolled in 3 days/week plan. Excellent attendance.', author: 'Admin', createdAt: new Date().toISOString() }],
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
        },
        {
          id: 'stu-302',
          studentName: 'Hamza Farhan',
          parentName: 'Farhan Akhtar',
          email: 'farhan.akhtar@gmail.com',
          phone: '+1 647 123 4567',
          country: 'Canada',
          courseId: 'c-4',
          courseName: 'Quran Memorization / Hifz',
          packageId: 'pkg-5days',
          packageName: 'Intensive Track (5 Days/Week)',
          tutorId: 'tut-2',
          tutorName: 'Qari Hafiz Muhammad Bilal',
          preferredTime: 'Morning',
          preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          learningPace: 'Fast',
          status: 'Active',
          currentSurahOrLesson: 'Juz 6 (La Yuhibbullah)',
          notes: [{ id: 'n-5', text: 'Daily Sabaq 1 page, Sabqi 5 pages, Manzil 1/2 Juz.', author: 'Qari Bilal', createdAt: new Date().toISOString() }],
          createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'stu-303',
          studentName: 'Zoya Ahmed',
          parentName: 'Ahmed Raza',
          email: 'ahmed.raza@example.com',
          phone: '+44 7700 900088',
          country: 'United Kingdom',
          courseId: 'c-1',
          courseName: 'Noorani Qaida',
          packageId: 'pkg-2days',
          packageName: 'Starter Track (2 Days/Week)',
          tutorId: 'tut-1',
          tutorName: 'Ustadha Maryam Siddiqa',
          preferredTime: 'Afternoon',
          preferredDays: ['Tuesday', 'Thursday'],
          learningPace: 'Normal',
          status: 'Active',
          currentSurahOrLesson: 'Lesson 7: Standing Harakaat',
          notes: [{ id: 'n-6', text: 'Sample entry - replace with real student data.', author: 'Admin', createdAt: new Date().toISOString() }],
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: 'stu-304',
          studentName: 'Daniyal Qureshi',
          parentName: 'Zainab Qureshi',
          email: 'zainab.q@example.com',
          phone: '+1 416 123 4567',
          country: 'Canada',
          courseId: 'c-3',
          courseName: 'Quran with Tajweed',
          packageId: 'pkg-3days',
          packageName: 'Standard Learning (3 Days/Week)',
          tutorId: 'tut-4',
          tutorName: 'Shaykh Tariq Al-Azhari',
          preferredTime: 'Evening',
          preferredDays: ['Monday', 'Wednesday', 'Friday'],
          learningPace: 'Slow',
          status: 'Active',
          currentSurahOrLesson: 'Surah Al-Mulk (Ayah 12)',
          notes: [{ id: 'n-7', text: 'Sample entry - replace with real student data.', author: 'Admin', createdAt: new Date().toISOString() }],
          createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
        },
        {
          id: 'stu-305',
          studentName: 'Ibrahim Usmani',
          parentName: 'Usman Tariq',
          email: 'usman.tariq@example.com',
          phone: '+971 50 123 4567',
          country: 'UAE',
          courseId: 'c-2',
          courseName: 'Quran Reading / Nazra',
          packageId: 'pkg-2days',
          packageName: 'Starter Track (2 Days/Week)',
          tutorId: 'tut-5',
          tutorName: 'Qari Abdul Rehman Farooqi',
          preferredTime: 'Morning',
          preferredDays: ['Saturday', 'Sunday'],
          learningPace: 'Normal',
          status: 'On Trial',
          currentSurahOrLesson: 'Para 30 (Amma) - Surah An-Naba',
          notes: [{ id: 'n-8', text: 'Sample entry - replace with real student data.', author: 'Admin', createdAt: new Date().toISOString() }],
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
        }
      ],
      tutors: INITIAL_TUTORS,
      classes: [
        {
          id: 'cls-1',
          studentId: 'stu-301',
          studentName: 'Ayaan Mahmood',
          tutorId: 'tut-1',
          tutorName: 'Ustadha Maryam Siddiqa',
          courseName: 'Quran Reading / Nazra',
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '6:00 PM',
          timeZone: 'UK (GMT)',
          classDuration: 30,
          status: 'Scheduled',
          meetingLink: 'https://meet.google.com/aln-quran-class',
          notes: 'Focus on Madd Muttasil and stopping signs in Surah Baqarah'
        },
        {
          id: 'cls-2',
          studentId: 'stu-302',
          studentName: 'Hamza Farhan',
          tutorId: 'tut-2',
          tutorName: 'Qari Hafiz Muhammad Bilal',
          courseName: 'Quran Memorization / Hifz',
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          time: '7:30 AM',
          timeZone: 'EST (Canada)',
          classDuration: 30,
          status: 'Scheduled',
          meetingLink: 'https://meet.google.com/aln-hifz-class',
          notes: 'Daily Sabaq Surah An-Nisa Ayah 45-60'
        }
      ],
      progressReports: [
        {
          id: 'pr-1',
          studentId: 'stu-301',
          studentName: 'Ayaan Mahmood',
          tutorId: 'tut-1',
          tutorName: 'Ustadha Maryam Siddiqa',
          date: new Date().toISOString().split('T')[0],
          lessonCovered: 'Surah Al-Baqarah Verses 142 - 150',
          pronunciationScore: 9,
          tajweedScore: 8,
          retentionScore: 9,
          attendance: 'Present',
          mistakesAndDifficulties: 'Slight hesitation on heavy letter Qaf; repeated 3 times until mastered.',
          homework: 'Recite verses 142 to 150 twice at home before next session.',
          nextLessonGoal: 'Surah Al-Baqarah Verses 151 - 160 with focus on Ikhfa rules.',
          tutorRemarks: 'MashaAllah Ayaan showed great improvement in breath control and rhythm today!',
          createdAt: new Date().toISOString()
        }
      ],
      assessments: [
        {
          id: 'ass-1',
          studentId: 'stu-301',
          studentName: 'Ayaan Mahmood',
          month: 'January 2026',
          readingFluency: 'Excellent',
          tajweedAccuracy: 'Good',
          memorizationRetention: 'Excellent',
          overallGrade: 'A',
          learningPace: 'Normal',
          teacherRemarks: 'Ayaan is progressing with dedication. His Makharij on throat letters is completely clear.',
          assessedBy: 'Ustadha Maryam Siddiqa',
          assessedAt: new Date().toISOString()
        }
      ],
      testimonials: INITIAL_TESTIMONIALS,
      articles: INITIAL_ARTICLES,
      resources: INITIAL_RESOURCES,
      contacts: [],
      notifications: [],
      adminTokens: [],
      attendance: [],
      trials: [],
      feeReminders: [],
      hifzLogs: [],
      availability: [],
      coupons: [],
      referrals: []
    };

    this.saveDatabase(initialData);
    return initialData;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      const payload = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write academy_db.json:', err);
    }
  }

  // --- STATS ---
  public getStats(): DashboardStats {
    const totalLeads = this.data.leads.length;
    const newTrialRequests = this.data.leads.filter(l => l.status === 'New Lead' || l.status === 'Trial Scheduled').length;
    const activeStudents = this.data.students.filter(s => s.status === 'Active' || s.status === 'On Trial').length;
    const newEnrollments = this.data.enrollments.filter(e => e.status === 'New Application' || e.status === 'Trial Recommended').length;
    const totalTutors = this.data.tutors.length;
    const availableTutors = this.data.tutors.filter(t => t.status === 'Available').length;
    const totalCourses = this.data.courses.length;
    const totalPackages = this.data.packages.length;
    const convertedLeads = this.data.leads.filter(l => l.status === 'Converted').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    return {
      totalLeads,
      newTrialRequests,
      activeStudents,
      newEnrollments,
      totalTutors,
      availableTutors,
      totalCourses,
      totalPackages,
      conversionRate
    };
  }

  // --- COURSES ---
  public getCourses(): Course[] {
    return this.data.courses;
  }

  public getCourseBySlug(slug: string): Course | undefined {
    return this.data.courses.find(c => c.slug === slug || c.id === slug);
  }

  public addCourse(course: Omit<Course, 'id'>): Course {
    const newCourse: Course = {
      ...course,
      id: `c-${Date.now()}`
    };
    this.data.courses.push(newCourse);
    this.saveDatabase();
    return newCourse;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | null {
    const idx = this.data.courses.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.courses[idx] = { ...this.data.courses[idx], ...updates };
    this.saveDatabase();
    return this.data.courses[idx];
  }

  public deleteCourse(id: string): boolean {
    const initialLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter(c => c.id !== id);
    if (this.data.courses.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- PACKAGES ---
  public getPackages(): PackagePlan[] {
    return this.data.packages;
  }

  public addPackage(pkg: Omit<PackagePlan, 'id'>): PackagePlan {
    const newPkg: PackagePlan = {
      ...pkg,
      id: `pkg-${Date.now()}`
    };
    this.data.packages.push(newPkg);
    this.saveDatabase();
    return newPkg;
  }

  public updatePackage(id: string, updates: Partial<PackagePlan>): PackagePlan | null {
    const idx = this.data.packages.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.packages[idx] = { ...this.data.packages[idx], ...updates };
    this.saveDatabase();
    return this.data.packages[idx];
  }

  // --- LEADS / TRIALS ---
  public getLeads(): Lead[] {
    return this.data.leads;
  }

  public addLead(leadData: Omit<Lead, 'id' | 'notes' | 'status' | 'createdAt' | 'updatedAt'> & { initialNotes?: string }): Lead {
    const now = new Date().toISOString();
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      studentName: leadData.studentName,
      parentName: leadData.parentName || '',
      email: leadData.email || '',
      phone: leadData.phone,
      country: leadData.country || 'Worldwide',
      courseId: leadData.courseId,
      courseName: leadData.courseName,
      tutorGender: leadData.tutorGender || 'No Preference',
      timeSlot: leadData.timeSlot || 'Morning',
      preferredDays: leadData.preferredDays || ['Monday', 'Tuesday', 'Wednesday'],
      preferredTimeRange: leadData.preferredTimeRange || '',
      learningPace: leadData.learningPace || 'Normal',
      notes: leadData.initialNotes
        ? [{ id: `n-${Date.now()}`, text: leadData.initialNotes, author: 'Student/Parent', createdAt: now }]
        : [],
      status: 'New Lead',
      createdAt: now,
      updatedAt: now
    };

    this.data.leads.unshift(newLead);
    this.saveDatabase();
    return newLead;
  }

  public updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const idx = this.data.leads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.leads[idx] = { ...this.data.leads[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDatabase();
    return this.data.leads[idx];
  }

  public addLeadNote(id: string, text: string, author: string = 'Admin'): Lead | null {
    const lead = this.data.leads.find(l => l.id === id);
    if (!lead) return null;
    lead.notes.push({
      id: `n-${Date.now()}`,
      text,
      author,
      createdAt: new Date().toISOString()
    });
    lead.updatedAt = new Date().toISOString();
    this.saveDatabase();
    return lead;
  }

  // --- ENROLLMENTS ---
  public getEnrollments(): EnrollmentApplication[] {
    return this.data.enrollments;
  }

  public addEnrollment(appData: Omit<EnrollmentApplication, 'id' | 'status' | 'notes' | 'createdAt' | 'updatedAt'>): EnrollmentApplication {
    const now = new Date().toISOString();
    const newEnrollment: EnrollmentApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'New Application',
      notes: appData.additionalNotes
        ? [{ id: `n-${Date.now()}`, text: appData.additionalNotes, author: 'Applicant', createdAt: now }]
        : [],
      createdAt: now,
      updatedAt: now
    };

    this.data.enrollments.unshift(newEnrollment);
    this.saveDatabase();
    return newEnrollment;
  }

  public updateEnrollment(id: string, updates: Partial<EnrollmentApplication>): EnrollmentApplication | null {
    const idx = this.data.enrollments.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.enrollments[idx] = { ...this.data.enrollments[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDatabase();
    return this.data.enrollments[idx];
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    return this.data.students;
  }

  public addStudent(studentData: Omit<Student, 'id' | 'notes' | 'createdAt' | 'updatedAt'>): Student {
    const now = new Date().toISOString();
    const newStudent: Student = {
      ...studentData,
      id: `stu-${Date.now()}`,
      notes: [],
      createdAt: now,
      updatedAt: now
    };
    this.data.students.unshift(newStudent);
    this.saveDatabase();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | null {
    const idx = this.data.students.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.students[idx] = { ...this.data.students[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDatabase();
    return this.data.students[idx];
  }

  // --- TUTORS ---
  public getTutors(): Tutor[] {
    return this.data.tutors;
  }

  public addTutor(tutorData: Omit<Tutor, 'id' | 'createdAt' | 'activeStudentsCount'>): Tutor {
    const newTutor: Tutor = {
      ...tutorData,
      id: `tut-${Date.now()}`,
      activeStudentsCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.tutors.push(newTutor);
    this.saveDatabase();
    return newTutor;
  }

  public updateTutor(id: string, updates: Partial<Tutor>): Tutor | null {
    const idx = this.data.tutors.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.tutors[idx] = { ...this.data.tutors[idx], ...updates };
    this.saveDatabase();
    return this.data.tutors[idx];
  }

  // --- CLASSES & MAKEUP ---
  public getClasses(): ScheduledClass[] {
    return this.data.classes;
  }

  public addClass(classData: Omit<ScheduledClass, 'id'>): ScheduledClass {
    const newClass: ScheduledClass = {
      ...classData,
      id: `cls-${Date.now()}`
    };
    this.data.classes.unshift(newClass);
    this.saveDatabase();
    return newClass;
  }

  public updateClass(id: string, updates: Partial<ScheduledClass>): ScheduledClass | null {
    const idx = this.data.classes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.classes[idx] = { ...this.data.classes[idx], ...updates };
    this.saveDatabase();
    return this.data.classes[idx];
  }

  // --- PROGRESS REPORTS & NOTES ---
  public getProgressReports(): ClassProgressReport[] {
    return this.data.progressReports;
  }

  public addProgressReport(reportData: Omit<ClassProgressReport, 'id' | 'createdAt'>): ClassProgressReport {
    const newReport: ClassProgressReport = {
      ...reportData,
      id: `pr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.progressReports.unshift(newReport);
    this.saveDatabase();
    return newReport;
  }

  // --- ASSESSMENTS ---
  public getAssessments(): StudentAssessment[] {
    return this.data.assessments;
  }

  public addAssessment(assessmentData: Omit<StudentAssessment, 'id' | 'assessedAt'>): StudentAssessment {
    const newAssessment: StudentAssessment = {
      ...assessmentData,
      id: `ass-${Date.now()}`,
      assessedAt: new Date().toISOString()
    };
    this.data.assessments.unshift(newAssessment);
    this.saveDatabase();
    return newAssessment;
  }

  // --- TESTIMONIALS ---
  public getTestimonials(): Testimonial[] {
    return this.data.testimonials;
  }

  public addTestimonial(testimonialData: Omit<Testimonial, 'id' | 'date'>): Testimonial {
    const newTestimonial: Testimonial = {
      ...testimonialData,
      id: `t-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    this.data.testimonials.unshift(newTestimonial);
    this.saveDatabase();
    return newTestimonial;
  }

  public updateTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | null {
    const idx = this.data.testimonials.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.testimonials[idx] = { ...this.data.testimonials[idx], ...updates };
    this.saveDatabase();
    return this.data.testimonials[idx];
  }

  public deleteTestimonial(id: string): boolean {
    const initialLen = this.data.testimonials.length;
    this.data.testimonials = this.data.testimonials.filter(t => t.id !== id);
    if (this.data.testimonials.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- ARTICLES ---
  public getArticles(): Article[] {
    return this.data.articles;
  }

  public getArticleBySlug(slug: string): Article | undefined {
    return this.data.articles.find(a => a.slug === slug || a.id === slug);
  }

  public addArticle(articleData: Omit<Article, 'id' | 'publishedAt'>): Article {
    const newArticle: Article = {
      ...articleData,
      id: `art-${Date.now()}`,
      publishedAt: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    this.data.articles.unshift(newArticle);
    this.saveDatabase();
    return newArticle;
  }

  public updateArticle(id: string, updates: Partial<Article>): Article | null {
    const idx = this.data.articles.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.articles[idx] = { ...this.data.articles[idx], ...updates };
    this.saveDatabase();
    return this.data.articles[idx];
  }

  public deleteArticle(id: string): boolean {
    const initialLen = this.data.articles.length;
    this.data.articles = this.data.articles.filter(a => a.id !== id);
    if (this.data.articles.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- RESOURCES ---
  public getResources(): IslamicResource[] {
    return this.data.resources;
  }

  public addResource(resourceData: Omit<IslamicResource, 'id'>): IslamicResource {
    const newResource: IslamicResource = {
      ...resourceData,
      id: `res-${Date.now()}`
    };
    this.data.resources.unshift(newResource);
    this.saveDatabase();
    return newResource;
  }

  public deleteResource(id: string): boolean {
    const initialLen = this.data.resources.length;
    this.data.resources = this.data.resources.filter(r => r.id !== id);
    if (this.data.resources.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): SystemNotification[] {
    return this.data.notifications;
  }

  // --- CONTACTS ---
  public getContacts(): ContactMessage[] {
    return this.data.contacts;
  }

  public addContact(contactData: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): ContactMessage {
    const newContact: ContactMessage = {
      ...contactData,
      id: `msg-${Date.now()}`,
      status: 'New',
      createdAt: new Date().toISOString()
    };
    this.data.contacts.unshift(newContact);
    this.saveDatabase();
    return newContact;
  }

  // --- AUTH TOKENS ---
  // --- ATTENDANCE ---
  public getAttendanceByDate(date: string): AttendanceRecord[] {
    return this.data.attendance.filter(a => a.date === date);
  }

  public getAttendanceForStudent(studentId: string, limit = 60): AttendanceRecord[] {
    return this.data.attendance
      .filter(a => a.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  public markAttendance(
    date: string,
    records: { studentId: string; studentName: string; status: 'present' | 'absent' | 'leave' }[],
    markedBy = 'Admin'
  ): AttendanceRecord[] {
    const now = new Date().toISOString();
    const saved: AttendanceRecord[] = [];
    for (const r of records) {
      const existing = this.data.attendance.find(a => a.date === date && a.studentId === r.studentId);
      if (existing) {
        existing.status = r.status;
        existing.studentName = r.studentName;
        existing.markedBy = markedBy;
        existing.updatedAt = now;
        saved.push(existing);
      } else {
        const rec: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          date,
          studentId: r.studentId,
          studentName: r.studentName,
          status: r.status,
          markedBy,
          createdAt: now,
          updatedAt: now
        };
        this.data.attendance.push(rec);
        saved.push(rec);
      }
    }
    this.saveDatabase();
    return saved;
  }

  // --- TRIAL CLASSES ---
  public getTrials(): TrialClass[] {
    return [...this.data.trials].sort((a, b) =>
      (a.date + a.time).localeCompare(b.date + b.time)
    );
  }

  public addTrial(trialData: Omit<TrialClass, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: TrialClass['status'] }): TrialClass {
    const now = new Date().toISOString();
    const trial: TrialClass = {
      ...trialData,
      id: `trial-${Date.now()}`,
      status: trialData.status || 'scheduled',
      createdAt: now,
      updatedAt: now
    };
    this.data.trials.unshift(trial);
    this.saveDatabase();
    return trial;
  }

  public updateTrial(id: string, updates: Partial<TrialClass>): TrialClass | null {
    const idx = this.data.trials.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.trials[idx] = { ...this.data.trials[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDatabase();
    return this.data.trials[idx];
  }

  public deleteTrial(id: string): boolean {
    const idx = this.data.trials.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.trials.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  // --- FEE REMINDERS ---
  public getFeeReminders(): FeeReminder[] {
    return [...this.data.feeReminders].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  }

  public getFeeRemindersForInvoice(invoiceId: string): FeeReminder[] {
    return this.data.feeReminders.filter(r => r.invoiceId === invoiceId);
  }

  public addFeeReminder(remData: Omit<FeeReminder, 'id' | 'sentAt'>): FeeReminder {
    const reminder: FeeReminder = {
      ...remData,
      id: `rem-${Date.now()}`,
      sentAt: new Date().toISOString()
    };
    this.data.feeReminders.unshift(reminder);
    this.saveDatabase();
    return reminder;
  }


  // --- HIFZ LOGS (Sabaq/Sabqi/Manzil daily tracking) ---
  public getHifzLogsForStudent(studentId: string, limit = 90): HifzLog[] {
    return this.data.hifzLogs
      .filter(h => h.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  public addHifzLog(logData: Omit<HifzLog, 'id' | 'createdAt' | 'updatedAt'>): HifzLog {
    const now = new Date().toISOString();
    // one log per student per day: update if exists
    const existing = this.data.hifzLogs.find(h => h.studentId === logData.studentId && h.date === logData.date);
    if (existing) {
      Object.assign(existing, logData, { updatedAt: now });
      this.saveDatabase();
      return existing;
    }
    const log: HifzLog = { ...logData, id: `hifz-${Date.now()}`, createdAt: now, updatedAt: now };
    this.data.hifzLogs.push(log);
    this.saveDatabase();
    return log;
  }

  // --- TUTOR AVAILABILITY ---
  public getAvailability(): TutorAvailability[] {
    const order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    return [...this.data.availability].sort((a, b) =>
      order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime)
    );
  }

  public addAvailability(slot: Omit<TutorAvailability, 'id' | 'createdAt'>): TutorAvailability {
    const rec: TutorAvailability = { ...slot, id: `av-${Date.now()}`, createdAt: new Date().toISOString() };
    this.data.availability.push(rec);
    this.saveDatabase();
    return rec;
  }

  public deleteAvailability(id: string): boolean {
    const idx = this.data.availability.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.data.availability.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return [...this.data.coupons].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public addCoupon(c: Omit<Coupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>): Coupon | null {
    const code = (c.code || '').toUpperCase().trim();
    if (!code || this.data.coupons.some(x => x.code === code)) return null;
    const now = new Date().toISOString();
    const coupon: Coupon = { ...c, code, id: `cpn-${Date.now()}`, usedCount: 0, createdAt: now, updatedAt: now };
    this.data.coupons.unshift(coupon);
    this.saveDatabase();
    return coupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return null;
    if (updates.code) {
      const code = updates.code.toUpperCase().trim();
      if (this.data.coupons.some(x => x.code === code && x.id !== id)) return null;
      updates.code = code;
    }
    this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDatabase();
    return this.data.coupons[idx];
  }

  public validateCoupon(code: string): { valid: boolean; discountPercent?: number; reason?: string } {
    const c = this.data.coupons.find(x => x.code === (code || '').toUpperCase().trim());
    if (!c) return { valid: false, reason: 'Invalid coupon code.' };
    if (c.status !== 'active') return { valid: false, reason: 'This coupon is no longer active.' };
    if (c.expiresAt && c.expiresAt < new Date().toISOString().split('T')[0]) {
      return { valid: false, reason: 'This coupon has expired.' };
    }
    if (c.usedCount >= c.maxUses) return { valid: false, reason: 'This coupon has reached its usage limit.' };
    return { valid: true, discountPercent: c.discountPercent };
  }

  // --- REFERRALS ---
  public getReferrals(): Referral[] {
    return [...this.data.referrals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  public addReferral(r: Omit<Referral, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Referral {
    const now = new Date().toISOString();
    const rec: Referral = { ...r, id: `ref-${Date.now()}`, status: 'pending', createdAt: now, updatedAt: now };
    this.data.referrals.unshift(rec);
    this.saveDatabase();
    return rec;
  }

  public updateReferral(id: string, updates: Partial<Referral>): Referral | null {
    const idx = this.data.referrals.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.referrals[idx] = { ...this.data.referrals[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveDatabase();
    return this.data.referrals[idx];
  }

  public createAdminSession(): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.data.adminTokens.push(token);
    this.saveDatabase();
    return token;
  }

  public isValidToken(token: string): boolean {
    if (!token) return false;
    return this.data.adminTokens.includes(token);
  }

  public revokeToken(token: string) {
    this.data.adminTokens = this.data.adminTokens.filter(t => t !== token);
    this.saveDatabase();
  }
}

export const dataStore = new DataStore();
