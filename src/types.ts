export type TutorGenderPreference = 'Male' | 'Female' | 'No Preference';

export type TimeSlot = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export type LearningPace = 'Slow' | 'Normal' | 'Fast';

export type LeadStatus =
  | 'New Lead'
  | 'Contacted'
  | 'Trial Scheduled'
  | 'Trial Started'
  | 'Trial Completed'
  | 'Converted'
  | 'Not Interested'
  | 'Closed';

export type EnrollmentStatus =
  | 'New Application'
  | 'Contacted'
  | 'Trial Recommended'
  | 'Approved'
  | 'Tutor Assigned'
  | 'Active'
  | 'Completed'
  | 'Cancelled';

export type StudentStatus = 'Active' | 'On Trial' | 'Graduated' | 'Paused' | 'Cancelled';

export type TutorStatus = 'Available' | 'Assigned' | 'Unavailable' | 'Inactive';

export interface Note {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  arabicName?: string;
  category: 'kids' | 'recitation' | 'hifz' | 'tajweed' | 'islamic_studies' | 'women' | 'adults' | 'slow_learners';
  shortDescription: string;
  description: string;
  audience: string;
  duration: string;
  classesPerWeek: string;
  feePKR: number;
  feeUSD: number;
  featured: boolean;
  status: 'active' | 'archived';
  highlights: string[];
  imageUrl?: string;
  syllabus?: string[];
  prerequisites?: string;
  learningOutcomes?: string[];
}

export interface PackagePlan {
  id: string;
  name: string;
  code: 'pkg-2days' | 'pkg-3days' | 'pkg-5days' | 'pkg-weekend';
  daysPerWeek: string;
  classesPerMonth: number;
  classDurationMinutes: number;
  monthlyFeePKR: number;
  monthlyFeeUSD: number;
  monthlyFeeGBP: number;
  monthlyFeeEUR: number;
  monthlyFeeAED: number;
  monthlyFeeCAD: number;
  monthlyFeeAUD: number;
  isPopular?: boolean;
  badge?: string;
  features: string[];
  description: string;
}

export interface Tutor {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  qualification: string;
  specialization: string;
  languages: string[];
  experienceYears: number;
  availableTimings: string;
  availability?: string;
  studentsCapacity: number;
  activeStudentsCount: number;
  phone: string;
  email: string;
  photoUrl?: string;
  rating?: number;
  bio?: string;
  status: TutorStatus;
  createdAt: string;
}

export interface ScheduledClass {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  courseName: string;
  days: string[];
  time: string;
  timeZone: string;
  classDuration: number;
  status: 'Scheduled' | 'Completed' | 'Missed' | 'Makeup Requested' | 'Cancelled';
  meetingLink?: string;
  notes?: string;
}

export interface ClassProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  date: string;
  lessonCovered: string;
  pronunciationScore: number; // 1-10
  tajweedScore: number; // 1-10
  retentionScore: number; // 1-10
  attendance: 'Present' | 'Absent' | 'Late';
  mistakesAndDifficulties: string;
  homework: string;
  nextLessonGoal: string;
  tutorRemarks: string;
  createdAt: string;
}

export interface StudentAssessment {
  id: string;
  studentId: string;
  studentName: string;
  month: string;
  readingFluency: 'Excellent' | 'Good' | 'Needs Work';
  tajweedAccuracy: 'Excellent' | 'Good' | 'Needs Work';
  memorizationRetention: 'Excellent' | 'Good' | 'Needs Work';
  overallGrade: 'A+' | 'A' | 'B+' | 'B' | 'Needs Improvement';
  learningPace: LearningPace;
  teacherRemarks: string;
  assessedBy: string;
  assessedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  studentOrParent: string;
  location: string;
  countryFlag?: string;
  courseName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'published' | 'pending';
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: 'Tajweed' | 'Quran Learning' | 'Parenting' | 'Kids' | 'Hifz' | 'Duas & Salah' | 'Islamic Studies';
  author: string;
  readTime: string;
  publishedAt: string;
  summary: string;
  content: string;
  status: 'published' | 'draft';
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  metaDescription: string;
  featuredImage: string;
  content: string;
  category: 'Tajweed' | 'Quran Learning' | 'Parenting' | 'Kids' | 'Hifz' | 'Duas & Salah' | 'Islamic Studies';
  tags: string[];
  author: string;
  readTime: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IslamicResource {
  id: string;
  title: string;
  category: 'Qaida & Arabic' | 'Tajweed Rules' | 'Daily Duas' | 'Salah & Prayer' | 'Kids Worksheets' | 'Hifz Tracker';
  description: string;
  fileSize: string;
  fileType: 'PDF' | 'Guide' | 'Worksheet';
  downloadUrl: string;
  featured?: boolean;
}

export interface Lead {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  country: string;
  courseId: string;
  courseName: string;
  tutorGender: TutorGenderPreference;
  timeSlot: TimeSlot;
  preferredDays?: string[];
  preferredTimeRange?: string;
  learningPace?: LearningPace;
  notes: Note[];
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentApplication {
  id: string;
  studentName: string;
  studentEmail?: string;
  phone: string;
  country: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  courseId: string;
  courseName: string;
  packageId?: string;
  packageName?: string;
  tutorPreference: TutorGenderPreference;
  timeSlot: TimeSlot;
  preferredDays?: string[];
  preferredTimeRange?: string;
  learningPace?: LearningPace;
  monthlyFee?: number;
  paymentStatus?: 'Paid' | 'Pending' | 'Waived';
  additionalNotes?: string;
  assignedTutorId?: string;
  assignedTutorName?: string;
  status: EnrollmentStatus;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  country: string;
  courseId: string;
  courseName: string;
  packageId?: string;
  packageName?: string;
  tutorId?: string;
  tutorName?: string;
  preferredTime: TimeSlot;
  preferredDays?: string[];
  learningPace: LearningPace;
  status: StudentStatus;
  currentSurahOrLesson?: string;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  country?: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'Replied';
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  type: 'trial_submitted' | 'enrollment_submitted' | 'admin_alert' | 'tutor_assigned' | 'contact_received';
  recipient: string;
  subject: string;
  content: string;
  status: 'Sent' | 'Pending' | 'Failed';
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  newTrialRequests: number;
  activeStudents: number;
  newEnrollments: number;
  totalTutors: number;
  availableTutors: number;
  totalCourses: number;
  totalPackages: number;
  conversionRate: number;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  phone?: string;
  country?: string;
  parentName?: string;
  courseId?: string;
  courseName?: string;
  packageId?: string;
  packageName?: string;
  tutorId?: string;
  tutorName?: string;
  assignedTutorName?: string;
  currentSurahOrLesson?: string;
  preferredTime?: TimeSlot;
  preferredDays?: string[];
  learningPace?: LearningPace;
  specialization?: string;
  qualification?: string;
  gender?: 'Male' | 'Female';
  status: 'Active' | 'Pending' | 'Suspended';
  assignedStudentIds?: string[];
  bio?: string;
  /** @deprecated Do not store passwords in plain text. This field is no longer used. */
  initialPassword?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface SiteSettings {
  announcementBarText: string;
  announcementBarEnabled: boolean;
  announcementBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  primaryWhatsApp: string;
  officialEmail: string;
  emergencyPhone: string;
  address: string;
  freeTrialDays: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  category: 'banner' | 'tutor' | 'course' | 'blog' | 'document' | 'icon';
  url: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  channel: 'whatsapp' | 'email' | 'both';
  subject?: string;
  body: string;
  availableVariables: string[];
}

export interface PageSeoConfig {
  pagePath: string;
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  parentName: string;
  phone: string;
  courseName: string;
  packageName: string;
  amount: number;
  currency: 'PKR' | 'USD' | 'GBP' | 'EUR' | 'AED' | 'CAD' | 'AUD';
  billingMonth: string;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Waived';
  paymentMethod?: 'Bank Transfer' | 'JazzCash' | 'Easypaisa' | 'Stripe / Card' | 'PayPal';
}

export interface StudentReportCard {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  tutorName: string;
  evaluationMonth: string;
  currentSabaq: string;
  readingGrade: 'A+' | 'A' | 'B+' | 'B' | 'Needs Practice';
  tajweedGrade: 'A+' | 'A' | 'B+' | 'B' | 'Needs Practice';
  attendancePercentage: number;
  hifzSurahCount?: number;
  teacherRemarks: string;
  generatedDate: string;
}

export interface TutorPayroll {
  id: string;
  tutorId: string;
  tutorName: string;
  billingMonth: string;
  classesConducted: number;
  ratePerClassPKR: number;
  totalPayoutPKR: number;
  status: 'Paid' | 'Pending';
  paidDate?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'Student' | 'Enrollment' | 'Faculty' | 'Course' | 'Finance' | 'Settings' | 'System';
  user: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'leave';
  markedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrialClass {
  id: string;
  leadId?: string;
  studentName: string;
  phone: string;
  email?: string;
  courseId?: string;
  courseName?: string;
  tutorId?: string;
  tutorName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'converted' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeReminder {
  id: string;
  invoiceId: string;
  studentName: string;
  phone: string;
  amount: number;
  currency: string;
  channel: 'whatsapp' | 'email';
  sentAt: string;
  sentBy?: string;
}
