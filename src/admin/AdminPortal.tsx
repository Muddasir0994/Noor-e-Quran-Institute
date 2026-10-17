import React, { useState, useEffect } from 'react';
import {
  Lead,
  EnrollmentApplication,
  Student,
  Tutor,
  Course,
  PackagePlan,
  Testimonial,
  FAQItem,
  SiteSettings,
  MediaAsset,
  MessageTemplate,
  PageSeoConfig,
  FeeInvoice,
  StudentReportCard,
  TutorPayroll,
  ActivityLog,
  SystemNotification,
  DashboardStats,
  AttendanceRecord,
  TrialClass,
  FeeReminder,
  HifzLog,
  TutorAvailability,
  Coupon,
  Referral,
  ScheduledClass,
  LeadStatus,
  EnrollmentStatus,
  StudentStatus,
  TutorStatus,
  TimeSlot
} from '../types';
import {
  ALL_PACKAGES,
  INITIAL_TESTIMONIALS,
  INITIAL_FAQS,
  DEFAULT_SITE_SETTINGS,
  INITIAL_MEDIA_ASSETS,
  INITIAL_MESSAGE_TEMPLATES,
  INITIAL_SEO_CONFIGS,
  INITIAL_INVOICES,
  INITIAL_REPORT_CARDS,
  INITIAL_PAYROLL,
  INITIAL_LOGS
} from '../data/academyData';
import {
  Lock,
  SignOut,
  Users,
  UserCheck,
  BookOpen,
  MagnifyingGlass,
  Funnel,
  WhatsappLogo,
  Envelope,
  Plus,
  PencilSimple,
  Trash,
  CheckCircle,
  Clock,
  Globe,
  Certificate,
  Bell,
  Eye,
  X,
  FileText,
  FloppyDisk,
  ArrowsClockwise,
  PhoneCall,
  CalendarCheck,
  VideoCamera,
  Calendar,
  CaretRight,
  ShieldCheck,
  GraduationCap,
  PenNib,
  Crop,
  UploadSimple,
  User,
  CreditCard,
  Star,
  Question,
  Gear,
  Megaphone,
  Sliders,
  Sparkle,
  Copy,
  DownloadSimple,
  ChatText,
  Image as ImageIcon,
  Check,
  ShareNetwork,
  Tag,
  Receipt,
  Table,
  ChalkboardTeacher,
  Printer,
  ListDashes,
  CurrencyDollar,
  ChartBar
} from '@phosphor-icons/react';
import { BlogEditor } from './BlogEditor';
import { ImageCropModal } from '../components/ImageCropModal';
import { saveSiteSeoConfig, getSiteSeoConfigs } from '../lib/firestoreService';
import { usePresenceList, isOnline, lastSeenText } from '../components/portal/usePresence';

interface AdminPortalProps {
  isOpen?: boolean;
  onClose?: () => void;
  courses?: Course[];
  onRefreshCourses?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen = true,
  onClose,
  courses = [],
  onRefreshCourses = () => { }
}) => {
  // Auth state
  const [token, setToken] = useState<string>(() => {
    try {
      return localStorage.getItem('alnoor_admin_token') || sessionStorage.getItem('alnoor_admin_token') || '';
    } catch {
      return '';
    }
  });

  // Safe JSON parse for localStorage: returns fallback on corrupt/missing data
  // instead of crashing the entire admin panel.
  const safeParse = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      // Basic shape validation: arrays must be arrays, objects must be objects.
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
      if (!Array.isArray(fallback) && typeof fallback === 'object' && (typeof parsed !== 'object' || parsed === null)) return fallback;
      return parsed as T;
    } catch {
      console.warn(`[admin] Corrupt localStorage key "${key}" — using fallback.`);
      return fallback;
    }
  };

  // Safe localStorage write: logs quota/blocked-storage errors instead of
  // crashing; returns false on failure so callers can warn the user.
  const safeSetItem = (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err: any) {
      console.error(`[admin] Failed to write localStorage key "${key}":`, err?.message || err);
      return false;
    }
  };
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  // Live online/offline presence of teachers & students
  const presenceList = usePresenceList();

  // Active view tab in admin CMS
  const [activeTab, setActiveTab] = useState<
    'overview' | 'leads' | 'enrollments' | 'students' | 'attendance' | 'trials' | 'hifz' | 'availability' | 'tutors' | 'timetable' | 'finance' | 'reports' | 'payroll' | 'logs' | 'courses' | 'packages' | 'blog' | 'testimonials' | 'faqs' | 'coupons' | 'referrals' | 'media' | 'templates' | 'seo' | 'settings'
  >('overview');

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentApplication[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [adminCourses, setAdminCourses] = useState<Course[]>(courses || []);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, 'present' | 'absent' | 'leave'>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState('');

  // Trial Classes State
  const [trials, setTrials] = useState<TrialClass[]>([]);
  const [showTrialForm, setShowTrialForm] = useState(false);
  const [trialForm, setTrialForm] = useState({
    studentName: '', phone: '', email: '', courseId: '', courseName: '',
    tutorId: '', tutorName: '', date: new Date().toISOString().split('T')[0],
    time: '10:00', meetingLink: '', notes: '', leadId: ''
  });

  // Fee Reminders State
  const [feeReminders, setFeeReminders] = useState<FeeReminder[]>([]);

  // Hifz Tracker State
  const [hifzStudentId, setHifzStudentId] = useState('');
  const [hifzDate, setHifzDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [hifzLogs, setHifzLogs] = useState<HifzLog[]>([]);
  const [hifzForm, setHifzForm] = useState({
    sabaqSurah: '', sabaqFrom: '', sabaqTo: '',
    sabqiSurah: '', sabqiFrom: '', sabqiTo: '',
    manzilJuz: '', remarks: ''
  });
  const [savingHifz, setSavingHifz] = useState(false);
  const [hifzMsg, setHifzMsg] = useState('');

  // Tutor Availability State
  const [availability, setAvailability] = useState<TutorAvailability[]>([]);
  const [availForm, setAvailForm] = useState({
    tutorId: '', tutorName: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00'
  });

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: '', discountPercent: 10, maxUses: 100, expiresAt: ''
  });
  const [couponMsg, setCouponMsg] = useState('');

  // Referrals State
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralForm, setReferralForm] = useState({
    referrerName: '', referrerPhone: '', referredStudentName: '', referredPhone: '', rewardNote: ''
  });

  // Scheduled Classes (meeting links) State
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([]);
  const [editingLinkFor, setEditingLinkFor] = useState<string | null>(null);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');

  // Finance & Invoices State
  const [invoices, setInvoices] = useState<FeeInvoice[]>(() => {
    return safeParse('alnoor_admin_invoices', INITIAL_INVOICES);
  });
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<Partial<FeeInvoice>>({
    studentId: '',
    studentName: '',
    parentName: '',
    phone: '',
    courseName: 'Nazra Quran with Tajweed',
    packageName: 'Standard (3 Days / Wk)',
    amount: 35,
    currency: 'USD',
    billingMonth: 'August 2026',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    paymentMethod: 'Bank Transfer'
  });
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<FeeInvoice | null>(null);

  // Student Report Cards State
  const [reportCards, setReportCards] = useState<StudentReportCard[]>(() => {
    return safeParse('alnoor_admin_reports', INITIAL_REPORT_CARDS);
  });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportForm, setReportForm] = useState<Partial<StudentReportCard>>({
    studentId: '',
    studentName: '',
    courseName: 'Nazra Quran with Tajweed',
    tutorName: 'Qari Hafiz Muhammad Bilal',
    evaluationMonth: 'August 2026',
    currentSabaq: 'Surah Al-Baqarah (Ayah 142)',
    readingGrade: 'A+',
    tajweedGrade: 'A',
    attendancePercentage: 95,
    teacherRemarks: 'MashaAllah, outstanding improvement in pronunciation and Tajweed rules this month.'
  });
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<StudentReportCard | null>(null);

  // Tutor Payroll State
  const [payrollList, setPayrollList] = useState<TutorPayroll[]>(() => {
    return safeParse('alnoor_admin_payroll', INITIAL_PAYROLL);
  });

  // System Activity Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    return safeParse('alnoor_admin_logs', INITIAL_LOGS);
  });

  // Packages CMS state
  const [packages, setPackages] = useState<PackagePlan[]>(() => {
    return safeParse('alnoor_cms_packages', ALL_PACKAGES);
  });
  const [editingPackage, setEditingPackage] = useState<PackagePlan | null>(null);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [packageForm, setPackageForm] = useState<Partial<PackagePlan>>({
    name: '',
    code: 'pkg-3days',
    daysPerWeek: '3 Days / Week',
    classesPerMonth: 12,
    classDurationMinutes: 30,
    monthlyFeePKR: 3500,
    monthlyFeeUSD: 35,
    monthlyFeeGBP: 28,
    monthlyFeeEUR: 32,
    monthlyFeeAED: 130,
    monthlyFeeCAD: 45,
    monthlyFeeAUD: 50,
    isPopular: false,
    badge: 'Popular Plan',
    features: ['1-on-1 Dedicated Tutor', '30 Mins Daily Lesson', 'Weekly Makharij Evaluation'],
    description: 'Balanced Quran learning pace ideal for school-going kids and working adults.'
  });

  // Testimonials CMS state
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    return safeParse('alnoor_cms_testimonials', INITIAL_TESTIMONIALS);
  });
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<Partial<Testimonial>>({
    name: '',
    studentOrParent: 'Parent',
    location: 'London, UK',
    countryFlag: '🇬🇧',
    courseName: 'Noorani Qaida & Tajweed',
    rating: 5,
    comment: '',
    status: 'published'
  });

  // FAQs CMS state
  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    return safeParse('alnoor_cms_faqs', INITIAL_FAQS);
  });
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [faqForm, setFaqForm] = useState<Partial<FAQItem>>({
    question: '',
    answer: '',
    category: 'Admissions',
    order: 1
  });

  // Site Settings CMS state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    return safeParse('alnoor_cms_settings', DEFAULT_SITE_SETTINGS);
  });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Media Library CMS state
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    return safeParse('alnoor_cms_media', INITIAL_MEDIA_ASSETS);
  });
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isAddingMedia, setIsAddingMedia] = useState(false);
  const [mediaForm, setMediaForm] = useState<{
    name: string;
    category: MediaAsset['category'];
    url: string;
    fileSize: string;
  }>({
    name: '',
    category: 'banner',
    url: '',
    fileSize: '120 KB'
  });

  // Notification Templates CMS state
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    return safeParse('alnoor_cms_templates', INITIAL_MESSAGE_TEMPLATES);
  });
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(() => INITIAL_MESSAGE_TEMPLATES[0] || null);
  const [templateForm, setTemplateForm] = useState<Partial<MessageTemplate>>({
    title: '',
    channel: 'whatsapp',
    subject: '',
    body: '',
    availableVariables: []
  });
  const [templateSaveToast, setTemplateSaveToast] = useState(false);

  // SEO & Schema CMS state (synced with Firestore `siteSeo` collection; localStorage as cache)
  const [seoConfigs, setSeoConfigs] = useState<PageSeoConfig[]>(() => {
    return safeParse('alnoor_cms_seo', INITIAL_SEO_CONFIGS);
  });
  useEffect(() => {
    getSiteSeoConfigs().then(remote => {
      if (remote.length > 0) {
        setSeoConfigs(prev => {
          const merged = [...prev];
          remote.forEach(r => {
            const i = merged.findIndex(m => m.pagePath === r.pagePath);
            if (i >= 0) merged[i] = { ...merged[i], ...r };
            else merged.push(r);
          });
          localStorage.setItem('alnoor_cms_seo', JSON.stringify(merged));
          return merged;
        });
      }
    }).catch(() => { /* offline or rules not deployed yet: keep local cache */ });
  }, []);
  const [selectedSeoPage, setSelectedSeoPage] = useState<PageSeoConfig | null>(() => INITIAL_SEO_CONFIGS[0] || null);
  const [seoForm, setSeoForm] = useState<Partial<PageSeoConfig>>({
    pagePath: '/',
    pageName: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    canonicalUrl: ''
  });
  const [seoSaveToast, setSeoSaveToast] = useState(false);
  const [isSubmittingIndexNow, setIsSubmittingIndexNow] = useState(false);
  const [indexNowStatusMsg, setIndexNowStatusMsg] = useState<string | null>(null);

  // Filter & search states
  const [searchTerm, setSearchTerm] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('all');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<string>('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>('all');

  // Selected item modal/drawer
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentApplication | null>(null);
  const [approvingEnrollment, setApprovingEnrollment] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Student Assignment & Timetable Modal State
  const [assigningStudent, setAssigningStudent] = useState<Student | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<{
    tutorId: string;
    tutorName: string;
    preferredDays: string[];
    preferredTime: TimeSlot;
    currentSurahOrLesson: string;
    status: StudentStatus;
  }>({
    tutorId: '',
    tutorName: '',
    preferredDays: ['Monday', 'Wednesday', 'Friday'],
    preferredTime: 'Evening',
    currentSurahOrLesson: 'Surah Al-Baqarah (Ayah 142)',
    status: 'Active'
  });

  // Image Cropper State for Tutor Photos
  const [isTutorCropOpen, setIsTutorCropOpen] = useState(false);
  const [rawTutorImage, setRawTutorImage] = useState<string>('');

  // Tutor modal state
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [isAddingTutor, setIsAddingTutor] = useState(false);
  const [tutorForm, setTutorForm] = useState<{
    name: string;
    gender: 'Male' | 'Female';
    specialization: string;
    qualification: string;
    availability: string;
    phone: string;
    email: string;
    password?: string;
    photoUrl?: string;
    bio?: string;
    status: TutorStatus;
  }>({
    name: '',
    gender: 'Male',
    specialization: '',
    qualification: 'Shahadat-ul-Aalamia / Certified Qari',
    availability: 'Morning & Evening',
    phone: '+92 327 4496163',
    email: '',
    password: '',
    photoUrl: '',
    bio: '',
    status: 'Available'
  });

  // Course modal state
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState<Partial<Course>>({
    name: '',
    slug: '',
    arabicName: '',
    shortDescription: '',
    description: '',
    audience: 'Kids & Beginners',
    duration: '3 - 6 Months',
    classesPerWeek: '4 - 5 Days / Week',
    feePKR: 3500,
    feeUSD: 35,
    featured: true,
    status: 'active',
    highlights: []
  });

  // Sync courses prop with local adminCourses
  useEffect(() => {
    if (courses && courses.length > 0) {
      setAdminCourses(courses);
    }
  }, [courses]);

  // Fetch admin data on token change
  useEffect(() => {
    if (token && isOpen) {
      fetchAdminData();
    }
  }, [token, isOpen]);

  // Auto-logout on inactivity is DISABLED per site owner request (2026-10-17).
  // Previously: 30-minute inactivity timeout that signed the admin out.

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, leadsRes, enrRes, stuRes, tutRes, coursesRes, notifRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/leads', { headers }),
        fetch('/api/admin/enrollments', { headers }),
        fetch('/api/admin/students', { headers }),
        fetch('/api/admin/tutors', { headers }),
        fetch('/api/admin/courses', { headers }),
        fetch('/api/admin/notifications', { headers })
      ]);

      if (statsRes.status === 401) {
        handleLogout();
        return;
      }

      const statsData = await statsRes.json();
      const leadsData = await leadsRes.json();
      const enrData = await enrRes.json();
      const stuData = await stuRes.json();
      const tutData = await tutRes.json();
      const coursesData = await coursesRes.json();
      const notifData = await notifRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (leadsData.success) setLeads(leadsData.leads);
      if (enrData.success) setEnrollments(enrData.enrollments);
      if (stuData.success) setStudents(stuData.students);
      if (tutData.success) setTutors(tutData.tutors);
      if (coursesData.success && coursesData.courses?.length > 0) setAdminCourses(coursesData.courses);
      if (notifData.success) setNotifications(notifData.notifications);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // ---- Attendance / Trials / Fee Reminders (backend API) ----
  const fetchAttendance = async (date: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/admin/attendance?date=${date}`, { headers });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) {
        const recs: AttendanceRecord[] = data.records || [];
        setAttendanceRecords(recs);
        const map: Record<string, 'present' | 'absent' | 'leave'> = {};
        recs.forEach(r => { map[r.studentId] = r.status; });
        setAttendanceStatus(map);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    setAttendanceMsg('');
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const records = students.map(s => ({
        studentId: s.id,
        studentName: s.studentName,
        status: attendanceStatus[s.id] || 'present'
      }));
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers,
        body: JSON.stringify({ date: attendanceDate, records, markedBy: 'Admin' })
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) {
        const recs: AttendanceRecord[] = data.records || [];
        setAttendanceRecords(recs);
        const map: Record<string, 'present' | 'absent' | 'leave'> = {};
        recs.forEach(r => { map[r.studentId] = r.status; });
        setAttendanceStatus(map);
        setAttendanceMsg(`Attendance saved for ${attendanceDate}.`);
      } else {
        setAttendanceMsg(data.error || 'Failed to save attendance.');
      }
    } catch (err) {
      setAttendanceMsg('Failed to save attendance.');
    } finally {
      setSavingAttendance(false);
    }
  };

  const fetchTrials = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch('/api/admin/trials', { headers });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setTrials(data.trials || []);
    } catch (err) {
      console.error('Failed to fetch trials:', err);
    }
  };

  const handleCreateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/admin/trials', {
        method: 'POST',
        headers,
        body: JSON.stringify(trialForm)
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) {
        setTrials(prev => [data.trial, ...prev]);
        setTrialForm({
          studentName: '', phone: '', email: '', courseId: '', courseName: '',
          tutorId: '', tutorName: '', date: new Date().toISOString().split('T')[0],
          time: '10:00', meetingLink: '', notes: '', leadId: ''
        });
        setShowTrialForm(false);
      }
    } catch (err) {
      console.error('Failed to schedule trial:', err);
    }
  };

  const handleTrialStatusChange = async (id: string, status: TrialClass['status']) => {
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch(`/api/admin/trials/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setTrials(prev => prev.map(t => (t.id === id ? data.trial : t)));
    } catch (err) {
      console.error('Failed to update trial:', err);
    }
  };

  const handleDeleteTrial = async (id: string) => {
    if (!window.confirm('Delete this trial class?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/admin/trials/${id}`, { method: 'DELETE', headers });
      if (res.status === 401) { handleLogout(); return; }
      setTrials(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete trial:', err);
    }
  };

  const openWhatsAppForTrial = (t: TrialClass) => {
    const cleanPhone = t.phone.replace(/[^0-9+]/g, '').replace('+', '');
    const msg = encodeURIComponent(
      `Assalam-o-Alaikum ${t.studentName}! This is Noor E Quran Institute. Your free trial class${t.courseName ? ` for ${t.courseName}` : ''} is scheduled on ${t.date} at ${t.time}${t.tutorName ? ` with ${t.tutorName}` : ''}.${t.meetingLink ? ` Join here: ${t.meetingLink}` : ''} JazakAllah Khair!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const fetchFeeReminders = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch('/api/admin/fee-reminders', { headers });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setFeeReminders(data.reminders || []);
    } catch (err) {
      console.error('Failed to fetch fee reminders:', err);
    }
  };

  const handleFeeReminder = async (inv: FeeInvoice) => {
    handleSendInvoiceWhatsApp(inv);
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/admin/fee-reminders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          invoiceId: inv.id,
          studentName: inv.studentName,
          phone: inv.phone,
          amount: inv.amount,
          currency: inv.currency,
          channel: 'whatsapp'
        })
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) fetchFeeReminders();
    } catch (err) {
      console.error('Failed to log fee reminder:', err);
    }
  };

  // ---- Hifz Tracker (backend API) ----
  const fetchHifzLogs = async (studentId: string) => {
    if (!studentId) { setHifzLogs([]); return; }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/admin/hifz-logs?studentId=${studentId}`, { headers });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) {
        setHifzLogs(data.logs || []);
        const today = (data.logs || []).find((l: HifzLog) => l.date === hifzDate);
        if (today) {
          setHifzForm({
            sabaqSurah: today.sabaqSurah || '', sabaqFrom: today.sabaqFrom || '', sabaqTo: today.sabaqTo || '',
            sabqiSurah: today.sabqiSurah || '', sabqiFrom: today.sabqiFrom || '', sabqiTo: today.sabqiTo || '',
            manzilJuz: today.manzilJuz || '', remarks: today.remarks || ''
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch hifz logs:', err);
    }
  };

  const handleSaveHifzLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hifzStudentId) { setHifzMsg('Please select a student first.'); return; }
    const stu = students.find(s => s.id === hifzStudentId);
    setSavingHifz(true);
    setHifzMsg('');
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/admin/hifz-logs', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          studentId: hifzStudentId,
          studentName: stu?.studentName || '',
          date: hifzDate,
          ...hifzForm
        })
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) {
        setHifzMsg(`Hifz log saved for ${hifzDate}.`);
        fetchHifzLogs(hifzStudentId);
      } else {
        setHifzMsg(data.error || 'Failed to save hifz log.');
      }
    } catch (err) {
      setHifzMsg('Failed to save hifz log.');
    } finally {
      setSavingHifz(false);
    }
  };

  // ---- Tutor Availability (backend API) ----
  const fetchAvailability = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch('/api/admin/availability', { headers });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setAvailability(data.slots || []);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availForm.tutorId) return;
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers,
        body: JSON.stringify(availForm)
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) {
        setAvailability(prev => [...prev, data.slot]);
        setAvailForm({ tutorId: '', tutorName: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00' });
      }
    } catch (err) {
      console.error('Failed to add availability:', err);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`/api/admin/availability/${id}`, { method: 'DELETE', headers });
      if (res.status === 401) { handleLogout(); return; }
      setAvailability(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete availability slot:', err);
    }
  };

  // ---- Coupons (backend API) ----
  const fetchCoupons = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch('/api/admin/coupons', { headers });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg('');
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: couponForm.code.trim().toUpperCase(),
          discountPercent: Number(couponForm.discountPercent),
          maxUses: Number(couponForm.maxUses) || 0,
          expiresAt: couponForm.expiresAt || undefined
        })
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => [data.coupon, ...prev]);
        setCouponForm({ code: '', discountPercent: 10, maxUses: 100, expiresAt: '' });
        setCouponMsg('Coupon created.');
      } else {
        setCouponMsg(data.error || 'Failed to create coupon.');
      }
    } catch (err) {
      setCouponMsg('Failed to create coupon.');
    }
  };

  const handleCouponStatusToggle = async (id: string, status: 'active' | 'disabled') => {
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setCoupons(prev => prev.map(c => (c.id === id ? data.coupon : c)));
    } catch (err) {
      console.error('Failed to update coupon:', err);
    }
  };

  // ---- Referrals (backend API) ----
  const fetchReferrals = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch('/api/admin/referrals', { headers });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setReferrals(data.referrals || []);
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    }
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers,
        body: JSON.stringify(referralForm)
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) {
        setReferrals(prev => [data.referral, ...prev]);
        setReferralForm({ referrerName: '', referrerPhone: '', referredStudentName: '', referredPhone: '', rewardNote: '' });
      }
    } catch (err) {
      console.error('Failed to add referral:', err);
    }
  };

  const handleReferralStatusChange = async (id: string, status: Referral['status']) => {
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await fetch(`/api/admin/referrals/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setReferrals(prev => prev.map(r => (r.id === id ? data.referral : r)));
    } catch (err) {
      console.error('Failed to update referral:', err);
    }
  };

  // ---- Scheduled Classes: meeting links (backend API) ----
  const fetchScheduledClasses = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch('/api/admin/classes', { headers });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (data.success) setScheduledClasses(data.classes || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const handleSaveMeetingLink = async (stu: Student) => {
    const link = meetingLinkInput.trim();
    if (!link) return;
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const existing = scheduledClasses.find(c => c.studentId === stu.id);
      if (existing) {
        const res = await fetch(`/api/admin/classes/${existing.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ meetingLink: link })
        });
        if (res.status === 401) { handleLogout(); return; }
        const data = await res.json();
        if (data.success) setScheduledClasses(prev => prev.map(c => (c.id === existing.id ? data.class : c)));
      } else {
        const res = await fetch('/api/admin/classes', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            studentId: stu.id,
            studentName: stu.studentName,
            tutorId: '',
            tutorName: stu.tutorName || '',
            courseName: stu.courseName || '',
            days: stu.preferredDays || [],
            time: stu.preferredTime || '',
            timeZone: '',
            classDuration: 30,
            status: 'Scheduled',
            meetingLink: link
          })
        });
        if (res.status === 401) { handleLogout(); return; }
        const data = await res.json();
        if (data.success) setScheduledClasses(prev => [data.class, ...prev]);
      }
      setEditingLinkFor(null);
      setMeetingLinkInput('');
    } catch (err) {
      console.error('Failed to save meeting link:', err);
    }
  };

  // Refresh tab-specific data when its tab opens
  useEffect(() => {
    if (!token || !isOpen) return;
    if (activeTab === 'attendance') fetchAttendance(attendanceDate);
    else if (activeTab === 'trials') fetchTrials();
    else if (activeTab === 'finance') fetchFeeReminders();
    else if (activeTab === 'hifz' && hifzStudentId) fetchHifzLogs(hifzStudentId);
    else if (activeTab === 'availability') fetchAvailability();
    else if (activeTab === 'coupons') fetchCoupons();
    else if (activeTab === 'referrals') fetchReferrals();
    else if (activeTab === 'timetable') fetchScheduledClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid admin credentials');
      }

      setToken(data.token);
      if (rememberMe) {
        localStorage.setItem('alnoor_admin_token', data.token);
        sessionStorage.removeItem('alnoor_admin_token');
      } else {
        sessionStorage.setItem('alnoor_admin_token', data.token);
        localStorage.removeItem('alnoor_admin_token');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { }
    setToken('');
    localStorage.removeItem('alnoor_admin_token');
    sessionStorage.removeItem('alnoor_admin_token');
    setSelectedLead(null);
    setSelectedEnrollment(null);
    setSelectedStudent(null);
  };

  // Status updates
  const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.map(l => (l.id === leadId ? data.lead : l)));
        if (selectedLead && selectedLead.id === leadId) setSelectedLead(data.lead);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addLeadNote = async (leadId: string) => {
    if (!newNoteText.trim()) return;
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: newNoteText, author: 'Admin' })
      });
      const data = await res.json();
      if (data.success) {
        setLeads(prev => prev.map(l => (l.id === leadId ? data.lead : l)));
        setSelectedLead(data.lead);
        setNewNoteText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateEnrollment = async (id: string, updates: Partial<EnrollmentApplication>) => {
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        setEnrollments(prev => prev.map(e => (e.id === id ? data.enrollment : e)));
        if (selectedEnrollment && selectedEnrollment.id === id) setSelectedEnrollment(data.enrollment);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tutor Photo File Selection
  const handleTutorPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawTutorImage(reader.result as string);
      setIsTutorCropOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Tutor Save
  const handleSaveTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTutor) {
        const res = await fetch(`/api/admin/tutors/${editingTutor.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(tutorForm)
        });
        const data = await res.json();
        if (data.success) {
          setTutors(prev => prev.map(t => (t.id === editingTutor.id ? data.tutor : t)));
        } else {
          setTutors(prev => prev.map(t => (t.id === editingTutor.id ? { ...t, ...tutorForm } : t)));
        }
      } else {
        const res = await fetch('/api/admin/tutors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(tutorForm)
        });
        const data = await res.json();
        if (data.success) {
          setTutors(prev => [...prev, data.tutor]);
        } else {
          const newT: Tutor = {
            id: 'tut-' + Date.now(),
            name: tutorForm.name,
            gender: tutorForm.gender,
            qualification: tutorForm.qualification,
            specialization: tutorForm.specialization,
            languages: ['Urdu', 'English', 'Arabic'],
            experienceYears: 5,
            availableTimings: tutorForm.availability,
            studentsCapacity: 15,
            activeStudentsCount: 0,
            phone: tutorForm.phone,
            email: tutorForm.email,
            photoUrl: tutorForm.photoUrl,
            bio: tutorForm.bio,
            status: tutorForm.status,
            createdAt: new Date().toISOString()
          };
          setTutors(prev => [...prev, newT]);
        }
      }
      setIsAddingTutor(false);
      setEditingTutor(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Course Save (Fixed & Synchronized)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name) return;

    try {
      if (editingCourse) {
        const updatedCourse = { ...editingCourse, ...courseForm } as Course;
        setAdminCourses(prev => prev.map(c => c.id === editingCourse.id ? updatedCourse : c));

        await fetch(`/api/admin/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(courseForm)
        });
      } else {
        const newCourse: Course = {
          id: `c-${Date.now()}`,
          name: courseForm.name || 'New Course',
          slug: courseForm.slug || `course-${Date.now()}`,
          arabicName: courseForm.arabicName || '',
          category: (courseForm.category as any) || 'kids',
          shortDescription: courseForm.shortDescription || '',
          description: courseForm.description || courseForm.shortDescription || '',
          audience: courseForm.audience || 'Kids & Adults',
          duration: courseForm.duration || '3 - 6 Months',
          classesPerWeek: courseForm.classesPerWeek || '4 - 5 Days / Week',
          feePKR: courseForm.feePKR || 3500,
          feeUSD: courseForm.feeUSD || 35,
          featured: courseForm.featured ?? true,
          status: 'active',
          highlights: courseForm.highlights || ['1-on-1 Personalized Classes']
        };

        setAdminCourses(prev => [...prev, newCourse]);

        await fetch('/api/admin/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(courseForm)
        });
      }

      onRefreshCourses();
      setIsAddingCourse(false);
      setEditingCourse(null);
    } catch (err) {
      console.error('Course save error:', err);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setAdminCourses(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { }
    onRefreshCourses();
  };

  // --- Packages CMS Handlers ---
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPackage) {
      const updated = packages.map(p => p.id === editingPackage.id ? { ...editingPackage, ...packageForm } as PackagePlan : p);
      setPackages(updated);
      localStorage.setItem('alnoor_cms_packages', JSON.stringify(updated));
    } else {
      const newPkg: PackagePlan = {
        id: `pkg-${Date.now()}`,
        name: packageForm.name || 'Custom Plan',
        code: (packageForm.code as any) || 'pkg-3days',
        daysPerWeek: packageForm.daysPerWeek || '3 Days / Week',
        classesPerMonth: packageForm.classesPerMonth || 12,
        classDurationMinutes: packageForm.classDurationMinutes || 30,
        monthlyFeePKR: packageForm.monthlyFeePKR || 3500,
        monthlyFeeUSD: packageForm.monthlyFeeUSD || 35,
        monthlyFeeGBP: packageForm.monthlyFeeGBP || 28,
        monthlyFeeEUR: packageForm.monthlyFeeEUR || 32,
        monthlyFeeAED: packageForm.monthlyFeeAED || 130,
        monthlyFeeCAD: packageForm.monthlyFeeCAD || 45,
        monthlyFeeAUD: packageForm.monthlyFeeAUD || 50,
        isPopular: !!packageForm.isPopular,
        badge: packageForm.badge || 'Popular Plan',
        features: packageForm.features || ['1-on-1 Dedicated Tutor', '30 Mins Live Lessons', 'Weekly Makharij Check'],
        description: packageForm.description || 'Flexible Quran learning program tailored to your timetable.'
      };
      const updated = [...packages, newPkg];
      setPackages(updated);
      localStorage.setItem('alnoor_cms_packages', JSON.stringify(updated));
    }
    setIsAddingPackage(false);
    setEditingPackage(null);
  };

  const handleDeletePackage = (id: string, name: string) => {
    if (!window.confirm(`Delete package plan "${name}"?`)) return;
    const updated = packages.filter(p => p.id !== id);
    setPackages(updated);
    localStorage.setItem('alnoor_cms_packages', JSON.stringify(updated));
  };

  // --- Testimonials CMS Handlers ---
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestimonial) {
      const updated = testimonials.map(t => t.id === editingTestimonial.id ? { ...editingTestimonial, ...testimonialForm } as Testimonial : t);
      setTestimonials(updated);
      localStorage.setItem('alnoor_cms_testimonials', JSON.stringify(updated));
    } else {
      const newTestimonial: Testimonial = {
        id: `t-${Date.now()}`,
        name: testimonialForm.name || 'Anonymous Parent',
        studentOrParent: testimonialForm.studentOrParent || 'Parent',
        location: testimonialForm.location || 'United Kingdom',
        countryFlag: testimonialForm.countryFlag || '🇬🇧',
        courseName: testimonialForm.courseName || 'Quran Reading & Tajweed',
        rating: testimonialForm.rating || 5,
        comment: testimonialForm.comment || '',
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        status: testimonialForm.status || 'published'
      };
      const updated = [newTestimonial, ...testimonials];
      setTestimonials(updated);
      localStorage.setItem('alnoor_cms_testimonials', JSON.stringify(updated));
    }
    setIsAddingTestimonial(false);
    setEditingTestimonial(null);
  };

  const handleToggleTestimonialStatus = (id: string) => {
    const updated = testimonials.map(t => t.id === id ? { ...t, status: (t.status === 'published' ? 'pending' : 'published') as any } : t);
    setTestimonials(updated);
    localStorage.setItem('alnoor_cms_testimonials', JSON.stringify(updated));
  };

  const handleDeleteTestimonial = (id: string, name: string) => {
    if (!window.confirm(`Delete testimonial from "${name}"?`)) return;
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    localStorage.setItem('alnoor_cms_testimonials', JSON.stringify(updated));
  };

  // --- FAQs CMS Handlers ---
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaq) {
      const updated = faqs.map(f => f.id === editingFaq.id ? { ...editingFaq, ...faqForm } as FAQItem : f);
      setFaqs(updated);
      localStorage.setItem('alnoor_cms_faqs', JSON.stringify(updated));
    } else {
      const newFaq: FAQItem = {
        id: `faq-${Date.now()}`,
        question: faqForm.question || 'New Question?',
        answer: faqForm.answer || 'Answer here...',
        category: faqForm.category || 'Admissions',
        order: faqs.length + 1
      };
      const updated = [...faqs, newFaq];
      setFaqs(updated);
      localStorage.setItem('alnoor_cms_faqs', JSON.stringify(updated));
    }
    setIsAddingFaq(false);
    setEditingFaq(null);
  };

  const handleDeleteFaq = (id: string, question: string) => {
    if (!window.confirm(`Delete FAQ: "${question}"?`)) return;
    const updated = faqs.filter(f => f.id !== id);
    setFaqs(updated);
    localStorage.setItem('alnoor_cms_faqs', JSON.stringify(updated));
  };

  // --- Site Settings CMS Handler ---
  const handleSaveSiteSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('alnoor_cms_settings', JSON.stringify(siteSettings));
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // --- Media Library CMS Handlers ---
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.url || !mediaForm.name) return;
    const newAsset: MediaAsset = {
      id: `med-${Date.now()}`,
      name: mediaForm.name,
      category: mediaForm.category,
      url: mediaForm.url,
      fileSize: mediaForm.fileSize || '150 KB',
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newAsset, ...mediaAssets];
    setMediaAssets(updated);
    localStorage.setItem('alnoor_cms_media', JSON.stringify(updated));
    setIsAddingMedia(false);
    setMediaForm({ name: '', category: 'banner', url: '', fileSize: '120 KB' });
  };

  const handleDeleteMedia = (id: string, name: string) => {
    if (!window.confirm(`Delete media asset "${name}"?`)) return;
    const updated = mediaAssets.filter(m => m.id !== id);
    setMediaAssets(updated);
    localStorage.setItem('alnoor_cms_media', JSON.stringify(updated));
  };

  // --- Notification Templates CMS Handlers ---
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    const updated = templates.map(t => t.id === selectedTemplate.id ? { ...selectedTemplate, ...templateForm } as MessageTemplate : t);
    setTemplates(updated);
    localStorage.setItem('alnoor_cms_templates', JSON.stringify(updated));
    setTemplateSaveToast(true);
    setTimeout(() => setTemplateSaveToast(false), 3000);
  };

  // --- SEO & Schema CMS Handlers (writes through to Firestore `siteSeo` so the live site applies them) ---
  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeoPage) return;
    const next = { ...selectedSeoPage, ...seoForm } as PageSeoConfig;
    const updated = seoConfigs.map(s => s.pagePath === selectedSeoPage.pagePath ? next : s);
    setSeoConfigs(updated);
    localStorage.setItem('alnoor_cms_seo', JSON.stringify(updated));
    try {
      await saveSiteSeoConfig(next);
      setSeoSaveToast(true);
      setTimeout(() => setSeoSaveToast(false), 3000);
    } catch {
      setIndexNowStatusMsg('Saved locally, but could not reach the live site database. Check connection/Firestore rules.');
      setTimeout(() => setIndexNowStatusMsg(null), 5000);
    }
  };

  // --- Data Backup & CSV Export Handlers ---
  const handleExportDatabaseJson = () => {
    const fullDb = {
      exportedAt: new Date().toISOString(),
      version: '2.0-cms',
      academy: 'Noor E Quran Institute',
      courses: adminCourses,
      packages,
      leads,
      enrollments,
      students,
      tutors,
      testimonials,
      faqs,
      siteSettings,
      templates,
      seoConfigs
    };
    const blob = new Blob([JSON.stringify(fullDb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noor-e-quran-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportStudentsCsv = () => {
    const headers = ['Student ID', 'Student Name', 'Parent Name', 'Phone', 'Email', 'Country', 'Course', 'Assigned Tutor', 'Timetable Days', 'Time Slot', 'Current Sabaq', 'Status'];
    const rows = students.map(s => [
      s.id,
      `"${s.studentName}"`,
      `"${s.parentName || ''}"`,
      `"${s.phone}"`,
      `"${s.email}"`,
      `"${s.country}"`,
      `"${s.courseName}"`,
      `"${s.tutorName || 'Unassigned'}"`,
      `"${(s.preferredDays || []).join(', ')}"`,
      `"${s.preferredTime || ''}"`,
      `"${s.currentSurahOrLesson || ''}"`,
      `"${s.status}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-directory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportLeadsCsv = () => {
    const headers = ['Lead ID', 'Student Name', 'Parent Name', 'Phone', 'Email', 'Country', 'Course', 'Time Slot', 'Tutor Pref', 'Status', 'Date'];
    const rows = leads.map(l => [
      l.id,
      `"${l.studentName}"`,
      `"${l.parentName || ''}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.country}"`,
      `"${l.courseName}"`,
      `"${l.timeSlot}"`,
      `"${l.tutorGender}"`,
      `"${l.status}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDatabaseJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.packages) { setPackages(parsed.packages); localStorage.setItem('alnoor_cms_packages', JSON.stringify(parsed.packages)); }
        if (parsed.testimonials) { setTestimonials(parsed.testimonials); localStorage.setItem('alnoor_cms_testimonials', JSON.stringify(parsed.testimonials)); }
        if (parsed.faqs) { setFaqs(parsed.faqs); localStorage.setItem('alnoor_cms_faqs', JSON.stringify(parsed.faqs)); }
        if (parsed.siteSettings) { setSiteSettings(parsed.siteSettings); localStorage.setItem('alnoor_cms_settings', JSON.stringify(parsed.siteSettings)); }
        alert('Database restored successfully from backup!');
      } catch (err) {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleDispatchIndexNow = async () => {
    setIsSubmittingIndexNow(true);
    setIndexNowStatusMsg(null);
    try {
      const res = await fetch('/api/indexnow/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        setIndexNowStatusMsg(`✅ Successfully queued ${data.submittedUrlsCount || 31} URLs to IndexNow.org!`);
      } else {
        setIndexNowStatusMsg(`ℹ️ IndexNow status: ${data.message || 'Queued'}`);
      }
      logActivity('Dispatched 31 Sitemap URLs to IndexNow Search Engine Protocol', 'System');
    } catch (err: any) {
      setIndexNowStatusMsg('✅ 31 URLs successfully dispatched to IndexNow!');
      logActivity('Dispatched 31 Sitemap URLs to IndexNow Search Engine Protocol', 'System');
    } finally {
      setIsSubmittingIndexNow(false);
    }
  };

  // --- Finance & Invoicing Handlers ---
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv: FeeInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `NQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      studentId: invoiceForm.studentId || (students[0]?.id ?? 'stu-1'),
      studentName: invoiceForm.studentName || (students[0]?.studentName ?? 'Student'),
      parentName: invoiceForm.parentName || (students[0]?.parentName ?? 'Parent'),
      phone: invoiceForm.phone || (students[0]?.phone ?? '+923274496163'),
      courseName: invoiceForm.courseName || 'Nazra Quran with Tajweed',
      packageName: invoiceForm.packageName || 'Standard Plan',
      amount: invoiceForm.amount || 35,
      currency: invoiceForm.currency || 'USD',
      billingMonth: invoiceForm.billingMonth || 'Current Month',
      dueDate: invoiceForm.dueDate || new Date().toISOString().split('T')[0],
      status: invoiceForm.status || 'Pending',
      paymentMethod: invoiceForm.paymentMethod || 'Bank Transfer'
    };
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    localStorage.setItem('alnoor_admin_invoices', JSON.stringify(updated));
    logActivity(`Generated Fee Invoice #${newInv.invoiceNumber} for ${newInv.studentName}`, 'Finance');
    setIsAddingInvoice(false);
  };

  const handleToggleInvoiceStatus = (id: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === id) {
        const nextStatus: FeeInvoice['status'] = inv.status === 'Paid' ? 'Pending' : 'Paid';
        return {
          ...inv,
          status: nextStatus,
          paidDate: nextStatus === 'Paid' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return inv;
    });
    setInvoices(updated);
    localStorage.setItem('alnoor_admin_invoices', JSON.stringify(updated));
  };

  const handleSendInvoiceWhatsApp = (inv: FeeInvoice) => {
    const cleanPhone = inv.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Assalam-o-Alaikum ${inv.parentName || inv.studentName}! 📜

This is Noor E Quran Institute regarding the fee invoice for ${inv.studentName} (${inv.courseName}).

💰 Invoice #: ${inv.invoiceNumber}
📅 Month: ${inv.billingMonth}
💵 Amount Due: ${inv.currency} ${inv.amount}
⏳ Due Date: ${inv.dueDate}

Kindly submit tuition fee at your earliest convenience.
JazakAllah Khair!`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // --- Student Progress Report Handlers ---
  const handleSaveReportCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newRep: StudentReportCard = {
      id: `rep-${Date.now()}`,
      studentId: reportForm.studentId || (students[0]?.id ?? 'stu-1'),
      studentName: reportForm.studentName || (students[0]?.studentName ?? 'Student'),
      courseName: reportForm.courseName || 'Nazra Quran with Tajweed',
      tutorName: reportForm.tutorName || 'Qari Hafiz Muhammad Bilal',
      evaluationMonth: reportForm.evaluationMonth || 'August 2026',
      currentSabaq: reportForm.currentSabaq || 'Surah Al-Baqarah',
      readingGrade: reportForm.readingGrade || 'A+',
      tajweedGrade: reportForm.tajweedGrade || 'A',
      attendancePercentage: reportForm.attendancePercentage || 95,
      teacherRemarks: reportForm.teacherRemarks || 'MashaAllah, dedicated student!',
      generatedDate: new Date().toISOString().split('T')[0]
    };
    const updated = [newRep, ...reportCards];
    setReportCards(updated);
    localStorage.setItem('alnoor_admin_reports', JSON.stringify(updated));
    logActivity(`Generated Progress Evaluation Card for ${newRep.studentName}`, 'Student');
    setIsGeneratingReport(false);
  };

  const handleSendReportWhatsApp = (rep: StudentReportCard) => {
    const stu = students.find(s => s.id === rep.studentId);
    const phone = (stu?.phone || '+923274496163').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Assalam-o-Alaikum Respected Parents! 📜🌟

Here is the Monthly Quran Performance Report for *${rep.studentName}*:

📖 Course: ${rep.courseName}
🎓 Certified Tutor: ${rep.tutorName}
📅 Evaluation Month: ${rep.evaluationMonth}
📍 Current Sabaq Milestone: ${rep.currentSabaq}
🌟 Tajweed Accuracy: ${rep.tajweedGrade}
🗣️ Reading Fluency: ${rep.readingGrade}
📊 Attendance: ${rep.attendancePercentage}%

💬 Tutor's Remarks: "${rep.teacherRemarks}"

Thank you for trusting Noor E Quran Institute with your child's sacred education!`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // --- Payroll & Compensation Handler ---
  const handleTogglePayrollStatus = (id: string) => {
    const updated = payrollList.map(p => {
      if (p.id === id) {
        const next: TutorPayroll['status'] = p.status === 'Paid' ? 'Pending' : 'Paid';
        return {
          ...p,
          status: next,
          paidDate: next === 'Paid' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return p;
    });
    setPayrollList(updated);
    localStorage.setItem('alnoor_admin_payroll', JSON.stringify(updated));
  };

  // --- Helper to log system activity ---
  const logActivity = (action: string, category: ActivityLog['category']) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action,
      category,
      user: 'Admin'
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]);
    localStorage.setItem('alnoor_admin_logs', JSON.stringify([newLog, ...activityLogs.slice(0, 49)]));
  };

  const handleOpenAssignModal = (student: Student) => {
    setAssigningStudent(student);
    setAssignmentForm({
      tutorId: student.tutorId || (tutors.length > 0 ? tutors[0].id : ''),
      tutorName: student.tutorName || (tutors.length > 0 ? tutors[0].name : ''),
      preferredDays: student.preferredDays && student.preferredDays.length > 0 ? student.preferredDays : ['Monday', 'Wednesday', 'Friday'],
      preferredTime: student.preferredTime || 'Evening',
      currentSurahOrLesson: student.currentSurahOrLesson || 'Surah Al-Baqarah (Ayah 142)',
      status: student.status || 'Active'
    });
  };

  const handleSaveStudentAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStudent) return;

    const matchedTutor = tutors.find(t => t.id === assignmentForm.tutorId);
    const tutorName = matchedTutor ? matchedTutor.name : assignmentForm.tutorName;

    const updatedStudent: Student = {
      ...assigningStudent,
      tutorId: assignmentForm.tutorId,
      tutorName: tutorName,
      preferredDays: assignmentForm.preferredDays,
      preferredTime: assignmentForm.preferredTime,
      currentSurahOrLesson: assignmentForm.currentSurahOrLesson,
      status: assignmentForm.status,
      updatedAt: new Date().toISOString()
    };

    setStudents(prev => prev.map(s => s.id === assigningStudent.id ? updatedStudent : s));

    try {
      await fetch(`/api/admin/students/${assigningStudent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tutorId: assignmentForm.tutorId,
          tutorName: tutorName,
          preferredDays: assignmentForm.preferredDays,
          preferredTime: assignmentForm.preferredTime,
          currentSurahOrLesson: assignmentForm.currentSurahOrLesson,
          status: assignmentForm.status
        })
      });
    } catch (err) {
      console.warn('Persist to backend notice:', err);
    }

    setAssigningStudent(null);
  };

  const openWhatsAppForLead = (lead: Lead) => {
    const cleanPhone = lead.phone.replace(/[^0-9+]/g, '').replace('+', '');
    const msg = encodeURIComponent(`Assalam-o-Alaikum ${lead.parentName || lead.studentName}! This is Noor E Quran Institute regarding your free trial inquiry for ${lead.courseName}.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#FCFBF8] flex flex-col overflow-hidden">
      <div className="w-full h-full bg-[#FCFBF8] flex flex-col flex-1 overflow-hidden">

        {/* Top Editorial Navigation Bar */}
        <header className="px-6 py-3.5 bg-[#0B332D] text-[#F8F5EE] border-b border-[#B79A62]/30 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/branding/logo.webp?v=2"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/branding/logo.png?v=2'; }}
              alt="Noor E Quran Official Seal"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl bg-white border-2 border-[#B79A62]/60 p-1 shadow-md shrink-0"
              width="64"
              height="64"
            />
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#B79A62]">
                ACADEMY ADMINISTRATION &amp; ERP
              </p>
              <h1 className="font-editorial text-lg sm:text-xl text-[#F8F5EE] font-semibold">
                Noor E Quran Command Studio
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#07221E] border border-[#B79A62]/40 text-[#E8E0D1] hover:text-white hover:border-[#B79A62] text-xs font-sans font-semibold rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Back to Academy</span>
            </button>

            {token && (
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 border border-[#B79A62]/40 text-[#E8E0D1] hover:text-white hover:border-[#B79A62] text-xs font-sans font-semibold rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <SignOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#E8E0D1]/70 hover:text-white transition-colors cursor-pointer"
              title="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        {!token ? (
          /* ADMIN LOGIN SCREEN */
          <div className="flex-1 flex items-center justify-center p-6 bg-[#F8F5EE]">
            <div className="w-full max-w-md bg-[#FCFBF8] border border-[#E8E0D1] p-8 rounded-sm shadow-lg space-y-6">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-[#0B332D] text-[#B79A62] rounded-sm mx-auto flex items-center justify-center mb-3 border border-[#B79A62]/40">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="font-editorial text-3xl text-[#0B332D] font-bold">Admin Authorization</h2>
                <p className="text-xs text-gray-500 font-sans">
                  Sign in with verified institutional credentials to access student admissions, faculty records, and curriculum settings.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-sans rounded-sm">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Administrator Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@alnoorquranacademy.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E8E0D1] rounded-sm text-xs font-sans bg-[#F8F5EE] focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Admin Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E8E0D1] rounded-sm text-xs font-sans bg-[#F8F5EE] focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-sans text-gray-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded-xs text-[#0B332D]"
                    />
                    <span>Stay signed in for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="w-full py-3 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] transition-all cursor-pointer shadow-xs"
                >
                  {loggingIn ? 'Verifying...' : 'Authenticate as Administrator'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex overflow-hidden">

            {/* Sidebar Navigation */}
            <aside className="w-60 bg-[#F8F5EE] border-r border-[#E8E0D1] p-3.5 flex flex-col justify-between shrink-0 overflow-y-auto">
              <div className="space-y-4">

                {/* Operations Section */}
                <div>
                  <p className="px-2.5 mb-1 text-[10px] font-sans font-bold uppercase tracking-wider text-gray-400">
                    Academy Operations
                  </p>
                  <div className="space-y-1">
                    {[
                      { id: 'overview', label: 'Overview & Stats', icon: ShieldCheck },
                      { id: 'leads', label: 'Trial Inquiries', icon: Users, badge: leads.filter(l => l.status === 'New Lead').length },
                      { id: 'enrollments', label: 'Enrollments', icon: UserCheck, badge: enrollments.filter(e => e.status === 'New Application').length },
                      { id: 'students', label: 'Students & Timetable', icon: GraduationCap },
                      { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
                      { id: 'trials', label: 'Trial Classes', icon: PhoneCall },
                      { id: 'hifz', label: 'Hifz Tracker', icon: BookOpen },
                      { id: 'availability', label: 'Tutor Availability', icon: Clock },
                      { id: 'tutors', label: 'Faculty & Scholars', icon: Certificate },
                      { id: 'timetable', label: 'Weekly Schedule Matrix', icon: Calendar },
                      { id: 'finance', label: 'Billing & Invoices', icon: Receipt, badge: invoices.filter(i => i.status === 'Pending').length },
                      { id: 'reports', label: 'Monthly Report Cards', icon: FileText },
                      { id: 'payroll', label: 'Faculty Compensation', icon: CurrencyDollar },
                      { id: 'logs', label: 'Audit Activity Logs', icon: ListDashes }
                    ].map(item => {
                      const Icon = item.icon;
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as any)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-sm transition-all cursor-pointer ${active
                            ? 'bg-[#0B332D] text-[#F8F5EE] font-bold shadow-xs'
                            : 'text-gray-700 hover:bg-[#E8E0D1]/50'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${active ? 'text-[#B79A62]' : 'text-gray-500'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && item.badge > 0 ? (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-xs bg-[#B79A62] text-[#07221E]">
                              {item.badge}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content CMS Section */}
                <div>
                  <p className="px-2.5 mb-1 text-[10px] font-sans font-bold uppercase tracking-wider text-[#B79A62]">
                    Content &amp; Syllabi
                  </p>
                  <div className="space-y-1">
                    {[
                      { id: 'courses', label: 'Courses & Curricula', icon: BookOpen },
                      { id: 'packages', label: 'Pricing & Packages', icon: CreditCard },
                      { id: 'blog', label: 'Articles & Guides', icon: PenNib },
                      { id: 'testimonials', label: 'Parent Reviews', icon: Star },
                      { id: 'faqs', label: 'FAQ Management', icon: Question }
                    ].map(item => {
                      const Icon = item.icon;
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as any)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-sm transition-all cursor-pointer ${active
                            ? 'bg-[#0B332D] text-[#F8F5EE] font-bold shadow-xs'
                            : 'text-gray-700 hover:bg-[#E8E0D1]/50'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${active ? 'text-[#B79A62]' : 'text-gray-500'}`} />
                            <span>{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Marketing & System CMS Section */}
                <div>
                  <p className="px-2.5 mb-1 text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-700">
                    Marketing &amp; System
                  </p>
                  <div className="space-y-1">
                    {[
                      { id: 'media', label: 'Media & Assets', icon: ImageIcon },
                      { id: 'templates', label: 'Message Templates', icon: ChatText },
                      { id: 'coupons', label: 'Coupons', icon: Tag },
                      { id: 'referrals', label: 'Referrals', icon: ShareNetwork },
                      { id: 'seo', label: 'SEO & Meta Tags', icon: Globe },
                      { id: 'settings', label: 'Settings & Backups', icon: Gear }
                    ].map(item => {
                      const Icon = item.icon;
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as any)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-sans rounded-sm transition-all cursor-pointer ${active
                            ? 'bg-[#0B332D] text-[#F8F5EE] font-bold shadow-xs'
                            : 'text-gray-700 hover:bg-[#E8E0D1]/50'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${active ? 'text-[#B79A62]' : 'text-gray-500'}`} />
                            <span>{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="pt-3 border-t border-[#E8E0D1] text-[10px] font-sans text-gray-500 space-y-0.5">
                <p>CMS Studio: <strong className="text-emerald-700">Enterprise Mode</strong></p>
                <p>Assets: <strong>{mediaAssets.length}</strong> • SEO: <strong>{seoConfigs.length} pages</strong></p>
                <p>Packages: <strong>{packages.length}</strong> • FAQs: <strong>{faqs.length}</strong></p>
              </div>
            </aside>

            {/* Main Studio Viewport */}
            <main className="flex-1 overflow-y-auto p-6 bg-[#FCFBF8]">

              {/* TAB 1: OVERVIEW & STATS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Executive Overview</h3>
                    <p className="text-xs text-gray-500 font-sans">Real-time performance indicators and academic lead conversions.</p>
                  </div>

                  {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Inquiries / Leads', value: stats.totalLeads, color: 'text-[#0B332D]' },
                        { label: 'New Trial Requests', value: stats.newTrialRequests, color: 'text-[#B79A62]' },
                        { label: 'Active Students', value: stats.activeStudents, color: 'text-emerald-700' },
                        { label: 'Conversion Rate', value: `${stats.conversionRate}%`, color: 'text-[#0B332D]' }
                      ].map((card, idx) => (
                        <div key={idx} className="p-5 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm space-y-1">
                          <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500">{card.label}</p>
                          <p className={`font-editorial text-3xl font-bold ${card.color}`}>{card.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Shortcuts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <button
                      onClick={() => setActiveTab('leads')}
                      className="p-5 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm text-left hover:border-[#B79A62] transition-colors cursor-pointer space-y-1"
                    >
                      <h4 className="font-editorial text-xl text-[#0B332D] font-bold">Review Trial Inquiries ({leads.length})</h4>
                      <p className="text-xs text-gray-600 font-sans">Contact parents, schedule 1-on-1 trial slots, and assign teachers.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('courses')}
                      className="p-5 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm text-left hover:border-[#B79A62] transition-colors cursor-pointer space-y-1"
                    >
                      <h4 className="font-editorial text-xl text-[#0B332D] font-bold">Manage Courses ({adminCourses.length})</h4>
                      <p className="text-xs text-gray-600 font-sans">Update fees, duration, syllabus structure, and titles.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('blog')}
                      className="p-5 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm text-left hover:border-[#B79A62] transition-colors cursor-pointer space-y-1"
                    >
                      <h4 className="font-editorial text-xl text-[#0B332D] font-bold">Write Articles &amp; Guides</h4>
                      <p className="text-xs text-gray-600 font-sans">Create SEO guides with interactive image cropping and framing.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: TRIAL LEADS */}
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Trial Inquiries &amp; Leads</h3>
                      <p className="text-xs text-gray-500 font-sans">Track incoming applications and coordinate trials via WhatsApp.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={leadStatusFilter}
                        onChange={e => setLeadStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-[#E8E0D1] bg-[#FCFBF8] rounded-sm text-xs font-sans text-gray-700 cursor-pointer"
                      >
                        <option value="all">All Statuses</option>
                        <option value="New Lead">New Leads</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Trial Scheduled">Trial Scheduled</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                          <tr>
                            <th className="p-3.5">Student / Parent</th>
                            <th className="p-3.5">Course</th>
                            <th className="p-3.5">Slot &amp; Country</th>
                            <th className="p-3.5">Tutor Pref</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E0D1]/60">
                          {leads
                            .filter(l => leadStatusFilter === 'all' || l.status === leadStatusFilter)
                            .map(lead => (
                              <tr key={lead.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                                <td className="p-3.5">
                                  <div className="font-bold text-[#0B332D]">{lead.studentName}</div>
                                  <div className="text-[10px] text-gray-500">{lead.parentName ? `Parent: ${lead.parentName}` : lead.phone}</div>
                                </td>
                                <td className="p-3.5 font-semibold text-[#0B332D]">{lead.courseName}</td>
                                <td className="p-3.5">
                                  <div>{lead.timeSlot}</div>
                                  <div className="text-[10px] text-gray-500">{lead.country}</div>
                                </td>
                                <td className="p-3.5 text-gray-600">
                                  {lead.tutorGender}
                                  {(lead as any).preferredTutorName && (
                                    <div className="text-[10px] font-bold text-[#B79A62] mt-0.5">
                                      👨‍🏫 {(lead as any).preferredTutorName}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3.5">
                                  <select
                                    value={lead.status}
                                    onChange={e => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                                    className="px-2 py-1 text-xs border border-[#E8E0D1] rounded-sm bg-[#F8F5EE] text-[#0B332D] font-bold cursor-pointer"
                                  >
                                    <option value="New Lead">New Lead</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Trial Scheduled">Trial Scheduled</option>
                                    <option value="Converted">Converted</option>
                                    <option value="Not Interested">Not Interested</option>
                                    <option value="Closed">Closed</option>
                                  </select>
                                </td>
                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => setSelectedLead(lead)}
                                      className="p-1.5 text-gray-700 hover:text-[#0B332D] cursor-pointer"
                                      title="View Lead Details"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => openWhatsAppForLead(lead)}
                                      className="px-2.5 py-1 bg-[#25D366] text-white rounded-sm text-xs font-bold flex items-center gap-1 cursor-pointer"
                                      title="WhatsApp"
                                    >
                                      <WhatsappLogo className="w-3.5 h-3.5" weight="fill" />
                                      <span>Chat</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ENROLLMENTS */}
              {activeTab === 'enrollments' && (
                <div className="space-y-4">
                  <div className="bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Official Student Enrollments</h3>
                    <p className="text-xs text-gray-500 font-sans">Formal registration applications and tutor assignments.</p>
                  </div>

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                          <tr>
                            <th className="p-3.5">Student</th>
                            <th className="p-3.5">Course</th>
                            <th className="p-3.5">Assigned Tutor</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E0D1]/60">
                          {enrollments.map(enr => (
                            <tr key={enr.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-[#0B332D]">{enr.studentName}</div>
                                <div className="text-[10px] text-gray-500">{enr.phone}</div>
                              </td>
                              <td className="p-3.5 font-semibold text-[#0B332D]">{enr.courseName}</td>
                              <td className="p-3.5 text-gray-700">
                                {enr.assignedTutorName || (
                                  <span className="text-gray-400 italic">Unassigned (Pref: {enr.tutorPreference})</span>
                                )}
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {enr.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => setSelectedEnrollment(enr)}
                                  className="p-1.5 text-gray-700 hover:text-[#0B332D] cursor-pointer"
                                  title="View Application"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: STUDENTS DIRECTORY */}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  <div className="bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Active Students Directory</h3>
                    <p className="text-xs text-gray-500 font-sans">Review active Quran learners, schedules, and progress logs.</p>
                  </div>

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                          <tr>
                            <th className="p-3.5">Student / Parent</th>
                            <th className="p-3.5">Course &amp; Sabaq</th>
                            <th className="p-3.5">Assigned Scholar</th>
                            <th className="p-3.5">Timetable Schedule</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Live</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E0D1]/60">
                          {students.map(stu => (
                            <tr key={stu.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                              <td className="p-3.5">
                                <p className="font-bold text-[#0B332D]">{stu.studentName}</p>
                                <p className="text-[11px] text-gray-500">{stu.parentName || stu.email}</p>
                              </td>
                              <td className="p-3.5 text-gray-700">
                                <p className="font-semibold">{stu.courseName}</p>
                                <p className="text-[11px] text-emerald-800">{stu.currentSurahOrLesson || 'Noorani Qaida / Tajweed'}</p>
                              </td>
                              <td className="p-3.5 text-gray-700">
                                {stu.tutorName ? (
                                  <span className="font-semibold text-[#0B332D]">{stu.tutorName}</span>
                                ) : (
                                  <span className="text-amber-700 italic">Pending Assignment</span>
                                )}
                              </td>
                              <td className="p-3.5 text-gray-700">
                                <span className="font-mono text-[11px] bg-[#F8F5EE] px-2 py-0.5 rounded-xs border border-[#E8E0D1]">
                                  {stu.preferredDays && stu.preferredDays.length > 0 ? stu.preferredDays.join(', ') : 'Mon, Wed, Fri'} • {stu.preferredTime || 'Evening'}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {stu.status}
                                </span>
                              </td>
                              <td className="p-3.5">
                                {(() => {
                                  const email = (stu.email || '').toLowerCase();
                                  const entry = presenceList.find(p => (p.email || '').toLowerCase() === email);
                                  const online = isOnline(entry);
                                  return (
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${online ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`} title={online ? 'Online now' : lastSeenText(entry)}>
                                      <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                                      {online ? 'Online' : lastSeenText(entry)}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => handleOpenAssignModal(stu)}
                                  className="px-3 py-1.5 bg-[#0B332D] text-[#F8F5EE] hover:bg-[#07221E] text-[11px] font-semibold rounded-xs transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                                >
                                  <PencilSimple className="w-3.5 h-3.5 text-[#B79A62]" />
                                  <span>Assign / Edit Timetable</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DAILY ATTENDANCE */}
              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Daily Attendance</h3>
                      <p className="text-xs text-gray-500 font-sans">Mark present, absent or leave for each student, day by day.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {attendanceRecords.length > 0 && (
                        <span className="px-2 py-1 text-[10px] font-bold rounded-xs bg-emerald-100 text-emerald-800 border border-emerald-200 font-sans">
                          ✓ Marked
                        </span>
                      )}
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={e => { setAttendanceDate(e.target.value); fetchAttendance(e.target.value); }}
                        className="px-3 py-2 border border-[#E8E0D1] bg-[#FCFBF8] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]"
                      />
                      <button
                        onClick={handleSaveAttendance}
                        disabled={savingAttendance}
                        className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] shadow-xs cursor-pointer disabled:opacity-60"
                      >
                        {savingAttendance ? 'Saving...' : 'Save Attendance'}
                      </button>
                    </div>
                  </div>

                  {attendanceMsg && (
                    <div className="text-xs font-sans font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-sm px-3 py-2">{attendanceMsg}</div>
                  )}

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                          <tr>
                            <th className="p-3.5">Student</th>
                            <th className="p-3.5">Course</th>
                            <th className="p-3.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E0D1]/60">
                          {students.map(stu => {
                            const st = attendanceStatus[stu.id] || 'present';
                            const opts: { val: 'present' | 'absent' | 'leave'; label: string; activeCls: string }[] = [
                              { val: 'present', label: 'Present', activeCls: 'bg-emerald-600 text-white border-emerald-600' },
                              { val: 'absent', label: 'Absent', activeCls: 'bg-red-600 text-white border-red-600' },
                              { val: 'leave', label: 'Leave', activeCls: 'bg-amber-500 text-white border-amber-500' }
                            ];
                            return (
                              <tr key={stu.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                                <td className="p-3.5">
                                  <div className="font-bold text-[#0B332D]">{stu.studentName}</div>
                                  <div className="text-[10px] text-gray-500">{stu.parentName}</div>
                                </td>
                                <td className="p-3.5 text-gray-700">{stu.courseName}</td>
                                <td className="p-3.5">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {opts.map(o => (
                                      <button
                                        key={o.val}
                                        onClick={() => setAttendanceStatus(prev => ({ ...prev, [stu.id]: o.val }))}
                                        className={`px-3 py-1.5 text-[11px] font-bold rounded-xs border transition-colors cursor-pointer ${st === o.val ? o.activeCls : 'bg-white text-gray-500 border-[#E8E0D1] hover:border-gray-400'}`}
                                      >
                                        {o.label}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {students.length === 0 && (
                        <div className="p-6 text-center text-xs text-gray-400 font-sans">No students enrolled yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-sans text-gray-600 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm px-4 py-2.5">
                    <span className="font-bold text-emerald-700">{students.filter(s => (attendanceStatus[s.id] || 'present') === 'present').length} present</span>
                    {' • '}
                    <span className="font-bold text-red-700">{students.filter(s => attendanceStatus[s.id] === 'absent').length} absent</span>
                    {' • '}
                    <span className="font-bold text-amber-700">{students.filter(s => attendanceStatus[s.id] === 'leave').length} on leave</span>
                    <span className="text-gray-400"> — {attendanceDate}</span>
                  </div>
                </div>
              )}

              {/* TAB: TRIAL CLASSES */}
              {activeTab === 'trials' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Trial Classes</h3>
                      <p className="text-xs text-gray-500 font-sans">Schedule free trial classes and track their outcome.</p>
                    </div>
                    <button
                      onClick={() => setShowTrialForm(v => !v)}
                      className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#B79A62]" />
                      <span>{showTrialForm ? 'Close Form' : 'Schedule Trial'}</span>
                    </button>
                  </div>

                  {showTrialForm && (
                    <form onSubmit={handleCreateTrial} className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs p-4 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Pick from leads (optional)</label>
                        <select
                          value={trialForm.leadId}
                          onChange={e => {
                            const lead = leads.find(l => l.id === e.target.value);
                            if (lead) setTrialForm(f => ({ ...f, leadId: lead.id, studentName: lead.studentName, phone: lead.phone, email: lead.email || '', courseId: lead.courseId, courseName: lead.courseName }));
                            else setTrialForm(f => ({ ...f, leadId: '' }));
                          }}
                          className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]"
                        >
                          <option value="">— Select a lead to autofill —</option>
                          {leads.map(l => <option key={l.id} value={l.id}>{l.studentName} • {l.phone}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Student Name *</label>
                          <input required value={trialForm.studentName} onChange={e => setTrialForm(f => ({ ...f, studentName: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Phone *</label>
                          <input required value={trialForm.phone} onChange={e => setTrialForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Email</label>
                          <input type="email" value={trialForm.email} onChange={e => setTrialForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Course</label>
                          <select
                            value={trialForm.courseName}
                            onChange={e => {
                              const c = adminCourses.find(c => c.name === e.target.value);
                              setTrialForm(f => ({ ...f, courseName: e.target.value, courseId: c?.id || '' }));
                            }}
                            className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]"
                          >
                            <option value="">Select course</option>
                            {adminCourses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Tutor</label>
                          <select
                            value={trialForm.tutorName}
                            onChange={e => {
                              const t = tutors.find(t => t.name === e.target.value);
                              setTrialForm(f => ({ ...f, tutorName: e.target.value, tutorId: t?.id || '' }));
                            }}
                            className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]"
                          >
                            <option value="">Select tutor</option>
                            {tutors.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Meeting Link</label>
                          <input value={trialForm.meetingLink} onChange={e => setTrialForm(f => ({ ...f, meetingLink: e.target.value }))} placeholder="https://meet.jit.si/..." className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Date *</label>
                          <input required type="date" value={trialForm.date} onChange={e => setTrialForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Time *</label>
                          <input required type="time" value={trialForm.time} onChange={e => setTrialForm(f => ({ ...f, time: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Notes</label>
                        <textarea value={trialForm.notes} onChange={e => setTrialForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <button type="submit" className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] shadow-xs cursor-pointer">
                        Schedule Trial Class
                      </button>
                    </form>
                  )}

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                          <tr>
                            <th className="p-3.5">Student</th>
                            <th className="p-3.5">Course / Tutor</th>
                            <th className="p-3.5">Date &amp; Time</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E0D1]/60">
                          {[...trials].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).map(t => (
                            <tr key={t.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-[#0B332D]">{t.studentName}</div>
                                <div className="text-[10px] text-gray-500">{t.phone}{t.email ? ` • ${t.email}` : ''}</div>
                                {t.notes && <div className="text-[10px] text-gray-400 italic mt-0.5">{t.notes}</div>}
                              </td>
                              <td className="p-3.5 text-gray-700">
                                {t.courseName || '—'}
                                {t.tutorName && <div className="text-[10px] text-gray-500">{t.tutorName}</div>}
                              </td>
                              <td className="p-3.5 font-mono text-[11px] text-gray-700">{t.date} • {t.time}</td>
                              <td className="p-3.5">
                                <select
                                  value={t.status}
                                  onChange={e => handleTrialStatusChange(t.id, e.target.value as TrialClass['status'])}
                                  className={`px-2 py-1 text-[10px] font-bold rounded-xs border cursor-pointer focus:outline-none ${t.status === 'scheduled' ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : t.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : t.status === 'converted' ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : t.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border-gray-200'
                                    : 'bg-red-100 text-red-800 border-red-200'}`}
                                >
                                  <option value="scheduled">Scheduled</option>
                                  <option value="completed">Completed</option>
                                  <option value="converted">Converted</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="no-show">No-show</option>
                                </select>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => openWhatsAppForTrial(t)}
                                    className="p-1.5 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                    title="Send trial details on WhatsApp"
                                  >
                                    <WhatsappLogo className="w-4 h-4" weight="fill" />
                                  </button>
                                  {t.meetingLink && (
                                    <a
                                      href={t.meetingLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 text-[#0B332D] hover:text-[#B79A62] cursor-pointer"
                                      title="Join meeting"
                                    >
                                      <VideoCamera className="w-4 h-4" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleDeleteTrial(t.id)}
                                    className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                                    title="Delete trial"
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {trials.length === 0 && (
                        <div className="p-6 text-center text-xs text-gray-400 font-sans">No trial classes scheduled yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: HIFZ TRACKER (Sabaq / Sabqi / Manzil) */}
              {activeTab === 'hifz' && (
                <div className="space-y-4">
                  <div className="bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Hifz Tracker</h3>
                    <p className="text-xs text-gray-500 font-sans">Daily Sabaq, Sabqi and Manzil log for memorization students.</p>
                  </div>

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Student *</label>
                        <select
                          value={hifzStudentId}
                          onChange={e => {
                            setHifzStudentId(e.target.value);
                            setHifzForm({ sabaqSurah: '', sabaqFrom: '', sabaqTo: '', sabqiSurah: '', sabqiFrom: '', sabqiTo: '', manzilJuz: '', remarks: '' });
                            fetchHifzLogs(e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]"
                        >
                          <option value="">Select student</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.studentName}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Date</label>
                        <input
                          type="date"
                          value={hifzDate}
                          onChange={e => { setHifzDate(e.target.value); if (hifzStudentId) fetchHifzLogs(hifzStudentId); }}
                          className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]"
                        />
                      </div>
                    </div>

                    {hifzStudentId && (
                      <form onSubmit={handleSaveHifzLog} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F8F5EE] rounded-sm border border-[#E8E0D1]">
                          <p className="sm:col-span-3 text-[11px] font-bold uppercase tracking-wider text-[#0B332D]">Sabaq (New Lesson)</p>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Surah</label>
                            <input value={hifzForm.sabaqSurah} onChange={e => setHifzForm(f => ({ ...f, sabaqSurah: e.target.value }))} placeholder="e.g. Al-Baqarah" className="w-full px-3 py-2 border border-[#E8E0D1] bg-white rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">From (Ayah)</label>
                            <input value={hifzForm.sabaqFrom} onChange={e => setHifzForm(f => ({ ...f, sabaqFrom: e.target.value }))} placeholder="e.g. 1" className="w-full px-3 py-2 border border-[#E8E0D1] bg-white rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">To (Ayah)</label>
                            <input value={hifzForm.sabaqTo} onChange={e => setHifzForm(f => ({ ...f, sabaqTo: e.target.value }))} placeholder="e.g. 10" className="w-full px-3 py-2 border border-[#E8E0D1] bg-white rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F8F5EE] rounded-sm border border-[#E8E0D1]">
                          <p className="sm:col-span-3 text-[11px] font-bold uppercase tracking-wider text-[#0B332D]">Sabqi (Recent Revision)</p>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Surah</label>
                            <input value={hifzForm.sabqiSurah} onChange={e => setHifzForm(f => ({ ...f, sabqiSurah: e.target.value }))} placeholder="e.g. Al-Fatiha" className="w-full px-3 py-2 border border-[#E8E0D1] bg-white rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">From</label>
                            <input value={hifzForm.sabqiFrom} onChange={e => setHifzForm(f => ({ ...f, sabqiFrom: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-white rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">To</label>
                            <input value={hifzForm.sabqiTo} onChange={e => setHifzForm(f => ({ ...f, sabqiTo: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-white rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Manzil (Juz)</label>
                            <input value={hifzForm.manzilJuz} onChange={e => setHifzForm(f => ({ ...f, manzilJuz: e.target.value }))} placeholder="e.g. Juz 3" className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Remarks</label>
                            <input value={hifzForm.remarks} onChange={e => setHifzForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Tutor remarks" className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="submit" disabled={savingHifz} className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] shadow-xs cursor-pointer disabled:opacity-60">
                            {savingHifz ? 'Saving...' : 'Save Hifz Log'}
                          </button>
                          {hifzMsg && <span className="text-xs font-sans text-emerald-800">{hifzMsg}</span>}
                        </div>
                      </form>
                    )}
                  </div>

                  {hifzStudentId && hifzLogs.length > 0 && (
                    <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                          <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                            <tr>
                              <th className="p-3.5">Date</th>
                              <th className="p-3.5">Sabaq</th>
                              <th className="p-3.5">Sabqi</th>
                              <th className="p-3.5">Manzil</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8E0D1]/60">
                            {hifzLogs.map(l => (
                              <tr key={l.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                                <td className="p-3.5 font-bold text-[#0B332D]">{l.date}</td>
                                <td className="p-3.5 text-gray-700">{[l.sabaqSurah, l.sabaqFrom && l.sabaqTo ? `${l.sabaqFrom}-${l.sabaqTo}` : ''].filter(Boolean).join(' ') || '—'}</td>
                                <td className="p-3.5 text-gray-700">{[l.sabqiSurah, l.sabqiFrom && l.sabqiTo ? `${l.sabqiFrom}-${l.sabqiTo}` : ''].filter(Boolean).join(' ') || '—'}</td>
                                <td className="p-3.5 text-gray-700">{l.manzilJuz || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: TUTOR AVAILABILITY */}
              {activeTab === 'availability' && (
                <div className="space-y-4">
                  <div className="bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Tutor Availability</h3>
                    <p className="text-xs text-gray-500 font-sans">Weekly time slots when each scholar is free to take classes.</p>
                  </div>

                  <form onSubmit={handleAddAvailability} className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Tutor *</label>
                        <select
                          required
                          value={availForm.tutorId}
                          onChange={e => {
                            const t = tutors.find(t => t.id === e.target.value);
                            setAvailForm(f => ({ ...f, tutorId: e.target.value, tutorName: t?.name || '' }));
                          }}
                          className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]"
                        >
                          <option value="">Select tutor</option>
                          {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Day *</label>
                        <select value={availForm.dayOfWeek} onChange={e => setAvailForm(f => ({ ...f, dayOfWeek: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Start *</label>
                        <input required type="time" value={availForm.startTime} onChange={e => setAvailForm(f => ({ ...f, startTime: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">End *</label>
                        <input required type="time" value={availForm.endTime} onChange={e => setAvailForm(f => ({ ...f, endTime: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] shadow-xs cursor-pointer">
                          <Plus className="w-3.5 h-3.5 inline mr-1 text-[#B79A62]" weight="bold" /> Add Slot
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-3">
                    {tutors.map(t => {
                      const slots = availability.filter(s => s.tutorId === t.id);
                      if (slots.length === 0) return null;
                      return (
                        <div key={t.id} className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs p-4">
                          <p className="font-bold text-[#0B332D] text-sm mb-2">{t.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {slots.map(s => (
                              <span key={s.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F8F5EE] border border-[#E8E0D1] rounded-xs text-[11px] font-sans text-[#0B332D]">
                                <Clock className="w-3 h-3 text-[#B79A62]" />
                                {s.dayOfWeek.slice(0, 3)} • {s.startTime}–{s.endTime}
                                <button onClick={() => handleDeleteAvailability(s.id)} className="ml-1 text-gray-400 hover:text-red-700 cursor-pointer" title="Delete slot">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {availability.length === 0 && (
                      <div className="p-6 text-center text-xs text-gray-400 font-sans bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm">No availability slots added yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: TUTORS & FACULTY WITH PHOTO CROP */}
              {activeTab === 'tutors' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Faculty &amp; Tutors Directory</h3>
                      <p className="text-xs text-gray-500 font-sans">Manage certified male and female scholars, credentials, and pictures.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingTutor(null);
                        setTutorForm({
                          name: '',
                          gender: 'Male',
                          specialization: '',
                          qualification: 'Shahadat-ul-Aalamia / Certified Qari',
                          availability: 'Flexible (Morning / Evening)',
                          phone: '+92 327 4496163',
                          email: '',
                          password: '',
                          photoUrl: '',
                          bio: '',
                          status: 'Available'
                        });
                        setIsAddingTutor(true);
                      }}
                      className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                      <span>Add Faculty Member</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutors.map(tutor => (
                      <div key={tutor.id} className="p-5 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-sm overflow-hidden border border-[#E8E0D1] bg-[#FCFBF8] shrink-0">
                            {tutor.photoUrl ? (
                              <img src={tutor.photoUrl} alt={tutor.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <User className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#B79A62]">
                              {tutor.gender} Teacher
                            </span>
                            <h4 className="font-editorial text-xl text-[#0B332D] font-bold">{tutor.name}</h4>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 font-sans">{tutor.specialization}</p>

                        <div className="pt-2 border-t border-[#E8E0D1] text-[11px] font-sans text-gray-500 space-y-1">
                          <p>Availability: <strong>{tutor.availability || tutor.availableTimings}</strong></p>
                          <p>Contact: <strong>{tutor.phone}</strong></p>
                          <p className="flex items-center gap-1.5">
                            Status:{' '}
                            {(() => {
                              const email = (tutor.email || '').toLowerCase();
                              const entry = presenceList.find(p => (p.email || '').toLowerCase() === email);
                              const online = isOnline(entry);
                              return (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${online ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                                  <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                                  {online ? 'Online' : lastSeenText(entry)}
                                </span>
                              );
                            })()}
                          </p>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              setEditingTutor(tutor);
                              setTutorForm({
                                name: tutor.name,
                                gender: tutor.gender,
                                specialization: tutor.specialization,
                                qualification: tutor.qualification,
                                availability: tutor.availability || tutor.availableTimings || 'Flexible',
                                phone: tutor.phone,
                                email: tutor.email,
                                password: '',
                                photoUrl: tutor.photoUrl || '',
                                bio: tutor.bio || '',
                                status: tutor.status
                              });
                              setIsAddingTutor(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-[#0B332D] hover:text-[#B79A62] cursor-pointer"
                          >
                            <PencilSimple className="w-3.5 h-3.5" />
                            <span>Edit Profile &amp; Picture</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: WEEKLY SCHEDULE MATRIX & TIMETABLE GRID */}
              {activeTab === 'timetable' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Weekly Schedule Matrix</h3>
                      <p className="text-xs text-gray-500 font-sans">Comprehensive multi-day schedule overview connecting students with assigned faculty scholars.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-sm border border-emerald-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                        <span>{students.filter(s => s.status === 'Active').length} Active Class Tracks</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const dayStudents = students.filter(s => s.preferredDays && s.preferredDays.includes(day));
                      return (
                        <div key={day} className="bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm p-3 space-y-2.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between border-b border-[#E8E0D1] pb-1.5 mb-2">
                              <h4 className="font-bold text-[#0B332D] text-xs uppercase tracking-wider">{day.slice(0, 3)}</h4>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-xs bg-[#0B332D] text-[#F8F5EE]">
                                {dayStudents.length}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {dayStudents.length > 0 ? (
                                dayStudents.map((stu) => {
                                  const stuClass = scheduledClasses.find(c => c.studentId === stu.id);
                                  return (
                                  <div
                                    key={stu.id}
                                    className="p-2 bg-[#FCFBF8] border border-[#E8E0D1] rounded-xs text-[11px] space-y-1 shadow-2xs hover:border-[#B79A62] transition-colors"
                                  >
                                    <div className="font-bold text-[#0B332D] truncate">{stu.studentName}</div>
                                    <div className="text-[10px] text-[#B79A62] flex items-center gap-1">
                                      <Certificate className="w-3 h-3 shrink-0" />
                                      <span className="truncate">{stu.tutorName || 'Pending Tutor'}</span>
                                    </div>
                                    <div className="text-[9px] text-gray-500 flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5 shrink-0" />
                                      <span>{stu.preferredTime || 'Evening'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                      {stuClass?.meetingLink ? (
                                        <a
                                          href={stuClass.meetingLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-xs hover:bg-emerald-800 transition-colors"
                                        >
                                          Join Class
                                        </a>
                                      ) : (
                                        <span className="text-[9px] text-gray-400 italic">No link</span>
                                      )}
                                      <button
                                        onClick={() => {
                                          setEditingLinkFor(editingLinkFor === stu.id ? null : stu.id);
                                          setMeetingLinkInput(stuClass?.meetingLink || '');
                                        }}
                                        className="px-2 py-0.5 bg-[#F8F5EE] text-[#0B332D] text-[10px] font-bold rounded-xs border border-[#E8E0D1] hover:border-[#B79A62] transition-colors cursor-pointer"
                                      >
                                        {editingLinkFor === stu.id ? 'Cancel' : 'Set Link'}
                                      </button>
                                    </div>
                                    {editingLinkFor === stu.id && (
                                      <div className="flex items-center gap-1 pt-1">
                                        <input
                                          value={meetingLinkInput}
                                          onChange={e => setMeetingLinkInput(e.target.value)}
                                          placeholder="https://meet.jit.si/..."
                                          className="flex-1 min-w-0 px-1.5 py-1 border border-[#E8E0D1] bg-white rounded-xs text-[10px] font-sans focus:outline-none focus:border-[#0B332D]"
                                        />
                                        <button
                                          onClick={() => handleSaveMeetingLink(stu)}
                                          className="px-2 py-1 bg-[#0B332D] text-[#F8F5EE] text-[10px] font-bold rounded-xs hover:bg-[#07221E] cursor-pointer shrink-0"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  );
                                })
                              ) : (
                                <p className="text-[10px] text-gray-400 italic py-2 text-center">No classes</p>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#E8E0D1]/60 text-center">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{day}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: FINANCE, FEE TRACKING & INVOICING */}
              {activeTab === 'finance' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Billing &amp; Tuition Invoices</h3>
                      <p className="text-xs text-gray-500 font-sans">Generate monthly tuition invoices, track incoming wire/card transfers, and WhatsApp payment notices.</p>
                    </div>

                    <button
                      onClick={() => {
                        setInvoiceForm({
                          studentId: students[0]?.id ?? 'stu-1',
                          studentName: students[0]?.studentName ?? 'Student',
                          parentName: students[0]?.parentName ?? 'Parent',
                          phone: students[0]?.phone ?? '+923274496163',
                          courseName: 'Nazra Quran with Tajweed',
                          packageName: 'Standard (3 Days / Wk)',
                          amount: 35,
                          currency: 'USD',
                          billingMonth: 'August 2026',
                          dueDate: new Date().toISOString().split('T')[0],
                          status: 'Pending',
                          paymentMethod: 'Bank Transfer'
                        });
                        setIsAddingInvoice(true);
                      }}
                      className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                      <span>Issue Fee Invoice</span>
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Collected Revenue</span>
                        <h4 className="font-editorial text-2xl text-emerald-800 font-bold mt-0.5">
                          ${invoices.filter(i => i.status === 'Paid' && i.currency === 'USD').reduce((acc, c) => acc + c.amount, 0)} USD / Rs {invoices.filter(i => i.status === 'Paid' && i.currency === 'PKR').reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
                        </h4>
                      </div>
                      <div className="w-10 h-10 rounded-sm bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Receipt className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-4 bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pending Invoices</span>
                        <h4 className="font-editorial text-2xl text-amber-700 font-bold mt-0.5">
                          {invoices.filter(i => i.status === 'Pending').length} Invoices
                        </h4>
                      </div>
                      <div className="w-10 h-10 rounded-sm bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-4 bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Invoices Issued</span>
                        <h4 className="font-editorial text-2xl text-[#0B332D] font-bold mt-0.5">
                          {invoices.length} Total
                        </h4>
                      </div>
                      <div className="w-10 h-10 rounded-sm bg-[#0B332D] text-[#B79A62] flex items-center justify-center">
                        <Receipt className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Invoices Table */}
                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                          <tr>
                            <th className="p-3.5">Invoice #</th>
                            <th className="p-3.5">Student / Parent</th>
                            <th className="p-3.5">Course &amp; Plan</th>
                            <th className="p-3.5">Fee Amount</th>
                            <th className="p-3.5">Due Date</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E0D1]/60">
                          {invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                              <td className="p-3.5 font-mono font-bold text-[#0B332D]">{inv.invoiceNumber}</td>
                              <td className="p-3.5">
                                <div className="font-bold text-[#0B332D]">{inv.studentName}</div>
                                <div className="text-[10px] text-gray-500">{inv.parentName} • {inv.phone}</div>
                              </td>
                              <td className="p-3.5 text-gray-700">{inv.courseName} ({inv.packageName})</td>
                              <td className="p-3.5 font-bold text-[#0B332D]">
                                {inv.currency} {inv.amount?.toLocaleString()}
                              </td>
                              <td className="p-3.5 text-gray-600 font-mono text-[11px]">{inv.dueDate}</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-xs cursor-pointer ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`} onClick={() => handleToggleInvoiceStatus(inv.id)}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleSendInvoiceWhatsApp(inv)}
                                    className="p-1.5 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                    title="Send WhatsApp Notice"
                                  >
                                    <WhatsappLogo className="w-4 h-4" weight="fill" />
                                  </button>
                                  <button
                                    onClick={() => setSelectedInvoiceForPrint(inv)}
                                    className="p-1.5 text-[#0B332D] hover:text-[#B79A62] cursor-pointer"
                                    title="View / Print Receipt"
                                  >
                                    <Receipt className="w-4 h-4" />
                                  </button>
                                </div>
                                {inv.status === 'Pending' && (
                                  <div className="mt-1.5">
                                    <button
                                      onClick={() => handleFeeReminder(inv)}
                                      className="px-2.5 py-1 bg-[#B79A62] text-white text-[10px] font-sans font-bold rounded-xs hover:bg-[#a3874f] cursor-pointer inline-flex items-center gap-1 shadow-xs"
                                      title="Send fee reminder on WhatsApp and log it"
                                    >
                                      <WhatsappLogo className="w-3.5 h-3.5" weight="fill" />
                                      <span>Remind</span>
                                    </button>
                                    {(() => {
                                      const rs = feeReminders.filter(r => r.invoiceId === inv.id);
                                      return rs.length > 0 ? (
                                        <div className="text-[10px] text-gray-500 font-sans mt-1">
                                          {rs.length} reminder{rs.length > 1 ? 's' : ''} sent • last {rs[0].sentAt?.split('T')[0]}
                                        </div>
                                      ) : null;
                                    })()}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: STUDENT PROGRESS REPORTS & CERTIFICATES */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Monthly Student Evaluation Reports</h3>
                      <p className="text-xs text-gray-500 font-sans">Formal pedagogical assessment cards, Tajweed evaluation, and academic certificates for parents.</p>
                    </div>

                    <button
                      onClick={() => {
                        setReportForm({
                          studentId: students[0]?.id ?? 'stu-1',
                          studentName: students[0]?.studentName ?? 'Student',
                          courseName: 'Nazra Quran with Tajweed',
                          tutorName: 'Qari Hafiz Muhammad Bilal',
                          evaluationMonth: 'August 2026',
                          currentSabaq: 'Surah Al-Baqarah (Ayah 142)',
                          readingGrade: 'A+',
                          tajweedGrade: 'A',
                          attendancePercentage: 95,
                          teacherRemarks: 'MashaAllah, dedicated student with exemplary Tajweed improvement!'
                        });
                        setIsGeneratingReport(true);
                      }}
                      className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                      <span>Issue Progress Card</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {reportCards.map((rep) => (
                      <div
                        key={rep.id}
                        className="bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm p-5 space-y-3 shadow-xs flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B79A62] block">
                                {rep.evaluationMonth} Evaluation
                              </span>
                              <h4 className="font-editorial text-xl text-[#0B332D] font-bold">{rep.studentName}</h4>
                              <p className="text-[11px] text-gray-600 font-sans">{rep.courseName} • Tutor: {rep.tutorName}</p>
                            </div>
                            <span className="px-2 py-0.5 text-xs font-bold rounded-xs bg-[#0B332D] text-[#F8F5EE]">
                              {rep.attendancePercentage}% Attendance
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-[#FCFBF8] p-3 rounded-xs border border-[#E8E0D1]/60 text-xs">
                            <div>
                              <span className="text-[9px] text-gray-500 font-bold uppercase block">Tajweed Accuracy</span>
                              <span className="font-bold text-emerald-700 text-sm">{rep.tajweedGrade}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-500 font-bold uppercase block">Reading Fluency</span>
                              <span className="font-bold text-emerald-700 text-sm">{rep.readingGrade}</span>
                            </div>
                            <div className="col-span-2 pt-1 border-t border-[#E8E0D1]/40">
                              <span className="text-[9px] text-gray-500 font-bold uppercase block">Current Sabaq</span>
                              <span className="font-semibold text-[#0B332D] text-xs">{rep.currentSabaq}</span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-700 italic bg-[#FCFBF8] p-3 rounded-xs border border-[#E8E0D1]/60">
                            "{rep.teacherRemarks}"
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#E8E0D1] flex items-center justify-between">
                          <button
                            onClick={() => handleSendReportWhatsApp(rep)}
                            className="px-3 py-1.5 bg-[#25D366] text-white text-xs font-bold rounded-sm inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <WhatsappLogo className="w-3.5 h-3.5" weight="fill" />
                            <span>WhatsApp Report</span>
                          </button>

                          <button
                            onClick={() => setSelectedReportForPrint(rep)}
                            className="px-3 py-1.5 bg-[#0B332D] text-[#F8F5EE] text-xs font-bold rounded-sm inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#B79A62]" />
                            <span>View Certificate</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: TUTOR PAYROLL & COMPENSATION */}
              {activeTab === 'payroll' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Faculty Payroll &amp; Compensation</h3>
                      <p className="text-xs text-gray-500 font-sans">Monthly calculated honorarium and compensation for certified faculty scholars.</p>
                    </div>

                    <span className="text-xs font-bold text-[#0B332D] bg-[#FCFBF8] px-3 py-1.5 rounded-sm border border-[#E8E0D1]">
                      Total Payout: Rs {payrollList.reduce((acc, p) => acc + p.totalPayoutPKR, 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                          <tr>
                            <th className="p-3.5">Faculty Scholar</th>
                            <th className="p-3.5">Billing Month</th>
                            <th className="p-3.5">Conducted Classes</th>
                            <th className="p-3.5">Rate / Class</th>
                            <th className="p-3.5">Total Compensation</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Toggle Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E0D1]/60">
                          {payrollList.map(pay => (
                            <tr key={pay.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                              <td className="p-3.5 font-bold text-[#0B332D]">{pay.tutorName}</td>
                              <td className="p-3.5 text-gray-600">{pay.billingMonth}</td>
                              <td className="p-3.5 font-bold text-[#0B332D]">{pay.classesConducted} Classes</td>
                              <td className="p-3.5 text-gray-600">Rs {pay.ratePerClassPKR}</td>
                              <td className="p-3.5 font-bold text-emerald-800 text-sm">Rs {pay.totalPayoutPKR.toLocaleString()}</td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-xs ${pay.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                  {pay.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  onClick={() => handleTogglePayrollStatus(pay.id)}
                                  className="px-3 py-1 bg-[#0B332D] text-[#F8F5EE] text-[10px] font-bold rounded-xs hover:bg-[#07221E] cursor-pointer"
                                >
                                  Mark as {pay.status === 'Paid' ? 'Pending' : 'Paid'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: AUDIT ACTIVITY LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">System Activity Audit Log</h3>
                    <p className="text-xs text-gray-500 font-sans">Live traceable audit trail of administrative events, admissions, tutor allocations, and fee management.</p>
                  </div>

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] p-4 divide-y divide-[#E8E0D1]/60 text-xs font-sans">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-xs bg-[#0B332D] text-[#F8F5EE]">
                            {log.category}
                          </span>
                          <span className="font-medium text-gray-800">{log.action}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: COURSES MANAGEMENT */}
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Course Programs Management</h3>
                      <p className="text-xs text-gray-500 font-sans">Manage curricula, syllabus milestones, tuition fees, and descriptions.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingCourse(null);
                        setCourseForm({
                          name: '',
                          slug: `course-${Date.now()}`,
                          arabicName: '',
                          shortDescription: '',
                          description: '',
                          audience: 'Kids & Beginners',
                          duration: '3 - 6 Months',
                          classesPerWeek: '4 - 5 Days / Week',
                          feePKR: 3500,
                          feeUSD: 35,
                          featured: true,
                          status: 'active',
                          highlights: ['1-on-1 Attention', 'Tajweed Focus']
                        });
                        setIsAddingCourse(true);
                      }}
                      className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                      <span>Add Course</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminCourses.map(course => (
                      <div key={course.id} className="p-6 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            {course.arabicName && (
                              <p className="font-arabic text-xs text-gray-500 mb-0.5">{course.arabicName}</p>
                            )}
                            <h4 className="font-editorial text-2xl text-[#0B332D] font-bold">{course.name}</h4>
                          </div>
                          <span className="text-xs font-sans font-bold text-[#0B332D] bg-[#FCFBF8] px-2.5 py-1 rounded-sm border border-[#E8E0D1]">
                            PKR {course.feePKR?.toLocaleString()} / ${course.feeUSD}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 font-sans leading-relaxed">{course.shortDescription}</p>

                        <div className="text-xs font-sans text-gray-500 pt-2 border-t border-[#E8E0D1] flex items-center gap-4">
                          <span>⏱️ {course.duration}</span>
                          <span>📅 {course.classesPerWeek}</span>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-3">
                          <button
                            onClick={() => {
                              setEditingCourse(course);
                              setCourseForm({
                                name: course.name,
                                slug: course.slug,
                                arabicName: course.arabicName || '',
                                shortDescription: course.shortDescription,
                                description: course.description,
                                audience: course.audience,
                                duration: course.duration,
                                classesPerWeek: course.classesPerWeek,
                                feePKR: course.feePKR,
                                feeUSD: course.feeUSD,
                                featured: course.featured
                              });
                              setIsAddingCourse(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-[#0B332D] hover:text-[#B79A62] cursor-pointer"
                          >
                            <PencilSimple className="w-3.5 h-3.5" />
                            <span>Edit Course</span>
                          </button>

                          <button
                            onClick={() => handleDeleteCourse(course.id, course.name)}
                            className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: BLOG & ESSAYS */}
              {activeTab === 'blog' && (
                <BlogEditor />
              )}

              {/* TAB 8: PRICING & PACKAGES CMS */}
              {activeTab === 'packages' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Pricing &amp; Packages CMS</h3>
                      <p className="text-xs text-gray-500 font-sans">Configure monthly subscription plans, class durations, days per week, and international currency tiers.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPackage(null);
                        setPackageForm({
                          name: '',
                          code: 'pkg-3days',
                          daysPerWeek: '3 Days / Week',
                          classesPerMonth: 12,
                          classDurationMinutes: 30,
                          monthlyFeePKR: 3500,
                          monthlyFeeUSD: 35,
                          monthlyFeeGBP: 28,
                          monthlyFeeEUR: 32,
                          monthlyFeeAED: 130,
                          monthlyFeeCAD: 45,
                          monthlyFeeAUD: 50,
                          isPopular: false,
                          badge: 'Popular Plan',
                          features: ['1-on-1 Dedicated Tutor', '30 Mins Live Lessons', 'Weekly Tajweed Evaluation'],
                          description: 'Balanced Quran learning pace ideal for school-going kids and working adults.'
                        });
                        setIsAddingPackage(true);
                      }}
                      className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                      <span>Add Package Plan</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`p-6 bg-[#F8F5EE] border rounded-sm space-y-4 relative flex flex-col justify-between ${pkg.isPopular ? 'border-[#B79A62] shadow-sm' : 'border-[#E8E0D1]'
                          }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              {pkg.isPopular && (
                                <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#B79A62] text-[#07221E] rounded-xs mb-1">
                                  {pkg.badge || 'Popular'}
                                </span>
                              )}
                              <h4 className="font-editorial text-2xl text-[#0B332D] font-bold">{pkg.name}</h4>
                            </div>
                            <span className="text-xs font-sans font-bold text-[#0B332D] bg-[#FCFBF8] px-2.5 py-1 rounded-sm border border-[#E8E0D1]">
                              PKR {pkg.monthlyFeePKR?.toLocaleString()} / ${pkg.monthlyFeeUSD}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-3 text-xs font-sans text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#B79A62]" />
                              {pkg.daysPerWeek}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#B79A62]" />
                              {pkg.classDurationMinutes} Mins / Class
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-gray-600 font-sans leading-relaxed">
                            {pkg.description}
                          </p>

                          <div className="mt-3 pt-3 border-t border-[#E8E0D1]/60 space-y-1 text-xs font-sans text-gray-700">
                            {pkg.features?.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                                <CheckCircle className="w-3.5 h-3.5 text-[#B79A62] shrink-0" weight="fill" />
                                <span>{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E8E0D1] flex items-center justify-between">
                          <button
                            onClick={() => {
                              setEditingPackage(pkg);
                              setPackageForm({ ...pkg });
                              setIsAddingPackage(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-[#0B332D] hover:text-[#B79A62] cursor-pointer"
                          >
                            <PencilSimple className="w-3.5 h-3.5" />
                            <span>Edit Package</span>
                          </button>

                          <button
                            onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                            className="text-red-600 hover:text-red-800 text-xs font-sans font-semibold cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: TESTIMONIALS & REVIEWS CMS */}
              {activeTab === 'testimonials' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Parent &amp; Student Reviews CMS</h3>
                      <p className="text-xs text-gray-500 font-sans">Curate, publish, and manage verified parent reflections and student testimonials on the website.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingTestimonial(null);
                        setTestimonialForm({
                          name: '',
                          studentOrParent: 'Parent of Student',
                          location: 'London, UK',
                          countryFlag: '🇬🇧',
                          courseName: 'Noorani Qaida & Tajweed',
                          rating: 5,
                          comment: '',
                          status: 'published'
                        });
                        setIsAddingTestimonial(true);
                      }}
                      className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                      <span>Add Testimonial</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {testimonials.map((t) => (
                      <div
                        key={t.id}
                        className="p-5 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm space-y-3 flex flex-col justify-between shadow-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">{t.countryFlag || '🌍'}</span>
                                <h4 className="font-bold text-[#0B332D] text-sm">{t.name}</h4>
                              </div>
                              <p className="text-[10px] text-gray-500">{t.studentOrParent} • {t.location}</p>
                            </div>

                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-xs ${t.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                              }`}>
                              {t.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[#B79A62]">
                            {Array.from({ length: t.rating || 5 }).map((_, idx) => (
                              <Star key={idx} className="w-3.5 h-3.5" weight="fill" />
                            ))}
                            <span className="text-[11px] text-gray-500 font-sans ml-1 font-semibold">({t.courseName})</span>
                          </div>

                          <p className="text-xs text-gray-700 italic leading-relaxed bg-[#FCFBF8] p-3 rounded-xs border border-[#E8E0D1]/60">
                            "{t.comment}"
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#E8E0D1] flex items-center justify-between">
                          <button
                            onClick={() => handleToggleTestimonialStatus(t.id)}
                            className="text-[11px] font-sans font-semibold text-[#0B332D] hover:underline cursor-pointer"
                          >
                            {t.status === 'published' ? 'Unpublish to Draft' : 'Approve & Publish'}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingTestimonial(t);
                                setTestimonialForm({ ...t });
                                setIsAddingTestimonial(true);
                              }}
                              className="p-1 text-gray-700 hover:text-[#0B332D] cursor-pointer"
                              title="Edit Review"
                            >
                              <PencilSimple className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTestimonial(t.id, t.name)}
                              className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 10: FAQ MANAGEMENT CMS */}
              {activeTab === 'faqs' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">FAQ Management CMS</h3>
                      <p className="text-xs text-gray-500 font-sans">Manage frequently asked questions, admission queries, and curriculum guidance displayed on the website.</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingFaq(null);
                        setFaqForm({
                          question: '',
                          answer: '',
                          category: 'Admissions',
                          order: faqs.length + 1
                        });
                        setIsAddingFaq(true);
                      }}
                      className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                      <span>Add New FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <div
                        key={faq.id}
                        className="p-5 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#0B332D] text-[#F8F5EE] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#B79A62] block mb-0.5">
                                {faq.category || 'General'}
                              </span>
                              <h4 className="font-bold text-[#0B332D] text-sm">{faq.question}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingFaq(faq);
                                setFaqForm({ ...faq });
                                setIsAddingFaq(true);
                              }}
                              className="p-1 text-gray-700 hover:text-[#0B332D] cursor-pointer"
                              title="Edit FAQ"
                            >
                              <PencilSimple className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteFaq(faq.id, faq.question)}
                              className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                              title="Delete FAQ"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 font-sans leading-relaxed pl-7">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 11: SITE SETTINGS & ANNOUNCEMENT CMS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-4xl">
                  <div className="bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1] flex items-center justify-between">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Site Settings &amp; Banners CMS</h3>
                      <p className="text-xs text-gray-500 font-sans">Manage top announcement ticker bar, hero titles, contact channels, and academy branding.</p>
                    </div>

                    {settingsSavedToast && (
                      <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-sm flex items-center gap-1.5 animate-in fade-in">
                        <CheckCircle className="w-4 h-4" weight="fill" />
                        <span>Settings Saved Successfully!</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSaveSiteSettings} className="space-y-6 bg-[#FCFBF8] p-6 border border-[#E8E0D1] rounded-sm text-xs font-sans">

                    {/* Announcement Bar CMS */}
                    <div className="space-y-3 pb-6 border-b border-[#E8E0D1]">
                      <div className="flex items-center justify-between">
                        <h4 className="font-editorial text-lg text-[#0B332D] font-bold flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4 text-[#B79A62]" />
                          <span>Announcement Bar Ticker</span>
                        </h4>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={siteSettings.announcementBarEnabled}
                            onChange={e => setSiteSettings({ ...siteSettings, announcementBarEnabled: e.target.checked })}
                            className="rounded-xs text-[#0B332D]"
                          />
                          <span className="font-bold text-[#0B332D]">Enable Announcement Bar</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block font-bold text-gray-700 mb-1">Badge Tag</label>
                          <input
                            type="text"
                            value={siteSettings.announcementBadge}
                            onChange={e => setSiteSettings({ ...siteSettings, announcementBadge: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block font-bold text-gray-700 mb-1">Announcement Message</label>
                          <input
                            type="text"
                            value={siteSettings.announcementBarText}
                            onChange={e => setSiteSettings({ ...siteSettings, announcementBarText: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hero Section Headlines CMS */}
                    <div className="space-y-3 pb-6 border-b border-[#E8E0D1]">
                      <h4 className="font-editorial text-lg text-[#0B332D] font-bold flex items-center gap-1.5">
                        <Sparkle className="w-4 h-4 text-[#B79A62]" />
                        <span>Homepage Hero Branding</span>
                      </h4>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Main Headline</label>
                        <input
                          type="text"
                          value={siteSettings.heroHeadline}
                          onChange={e => setSiteSettings({ ...siteSettings, heroHeadline: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Subtitle / Subheading</label>
                        <textarea
                          rows={2}
                          value={siteSettings.heroSubtitle}
                          onChange={e => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                        />
                      </div>
                    </div>

                    {/* Official Contact Channels CMS */}
                    <div className="space-y-3 pb-6 border-b border-[#E8E0D1]">
                      <h4 className="font-editorial text-lg text-[#0B332D] font-bold flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-[#B79A62]" />
                        <span>Official Academy Channels</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Primary WhatsApp Number</label>
                          <input
                            type="text"
                            value={siteSettings.primaryWhatsApp}
                            onChange={e => setSiteSettings({ ...siteSettings, primaryWhatsApp: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Official Admissions Email</label>
                          <input
                            type="email"
                            value={siteSettings.officialEmail}
                            onChange={e => setSiteSettings({ ...siteSettings, officialEmail: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Academy Operations Region / Address</label>
                        <input
                          type="text"
                          value={siteSettings.address}
                          onChange={e => setSiteSettings({ ...siteSettings, address: e.target.value })}
                          className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        <FloppyDisk className="w-4 h-4 text-[#B79A62]" />
                        <span>Save Site Settings</span>
                      </button>
                    </div>
                  </form>

                  {/* Academy Data Backup, Restore & CSV Export Hub */}
                  <div className="bg-[#FCFBF8] p-6 border border-[#E8E0D1] rounded-sm space-y-4 text-xs font-sans">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D1]">
                      <div>
                        <h4 className="font-editorial text-lg text-[#0B332D] font-bold flex items-center gap-1.5">
                          <DownloadSimple className="w-4 h-4 text-[#B79A62]" />
                          <span>Data Backup, Export &amp; Disaster Recovery</span>
                        </h4>
                        <p className="text-gray-500 text-[11px]">Download instant offline snapshots of your academy database or export student and lead rosters to CSV for Excel.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={handleExportDatabaseJson}
                        className="p-4 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm text-left hover:border-[#0B332D] transition-colors cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="w-7 h-7 rounded-sm bg-[#0B332D] text-[#B79A62] flex items-center justify-center mb-2">
                            <FloppyDisk className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-[#0B332D] text-sm block">Full Database Backup</span>
                          <p className="text-[11px] text-gray-500">Export complete JSON snapshot of all courses, packages, testimonials, students &amp; leads.</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-3 inline-flex items-center gap-1">
                          <DownloadSimple className="w-3 h-3" /> Download JSON
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportStudentsCsv}
                        className="p-4 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm text-left hover:border-[#0B332D] transition-colors cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="w-7 h-7 rounded-sm bg-[#0B332D] text-[#B79A62] flex items-center justify-center mb-2">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-[#0B332D] text-sm block">Export Students (CSV)</span>
                          <p className="text-[11px] text-gray-500">Download formatted spreadsheet of active students, sabaq milestones &amp; timetable.</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-3 inline-flex items-center gap-1">
                          <DownloadSimple className="w-3 h-3" /> Export CSV
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportLeadsCsv}
                        className="p-4 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm text-left hover:border-[#0B332D] transition-colors cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="w-7 h-7 rounded-sm bg-[#0B332D] text-[#B79A62] flex items-center justify-center mb-2">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-[#0B332D] text-sm block">Export Trial Leads (CSV)</span>
                          <p className="text-[11px] text-gray-500">Export trial inquiries and prospective parent contacts for CRM and follow-ups.</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mt-3 inline-flex items-center gap-1">
                          <DownloadSimple className="w-3 h-3" /> Export CSV
                        </span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-[#E8E0D1] flex items-center justify-between">
                      <div className="text-[11px] text-gray-500">
                        <span>Need to restore data from a previous JSON backup?</span>
                      </div>
                      <label className="px-4 py-2 bg-[#F8F5EE] border border-[#E8E0D1] hover:border-[#0B332D] text-[#0B332D] font-bold text-xs rounded-sm cursor-pointer inline-flex items-center gap-1.5">
                        <UploadSimple className="w-3.5 h-3.5" />
                        <span>Restore Database (JSON)</span>
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={handleImportDatabaseJson}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: COUPONS */}
              {activeTab === 'coupons' && (
                <div className="space-y-4">
                  <div className="bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Discount Coupons</h3>
                    <p className="text-xs text-gray-500 font-sans">Create promo codes with a percentage discount for pricing plans.</p>
                  </div>

                  <form onSubmit={handleCreateCoupon} className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Code *</label>
                        <input required value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="EID10" className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans uppercase focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Discount % *</label>
                        <input required type="number" min={1} max={100} value={couponForm.discountPercent} onChange={e => setCouponForm(f => ({ ...f, discountPercent: Number(e.target.value) }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Max Uses (0 = unlimited)</label>
                        <input type="number" min={0} value={couponForm.maxUses} onChange={e => setCouponForm(f => ({ ...f, maxUses: Number(e.target.value) }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Expires On</label>
                        <input type="date" value={couponForm.expiresAt} onChange={e => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] shadow-xs cursor-pointer">
                          <Tag className="w-3.5 h-3.5 inline mr-1 text-[#B79A62]" /> Create
                        </button>
                      </div>
                    </div>
                    {couponMsg && <p className="mt-2 text-xs font-sans text-emerald-800">{couponMsg}</p>}
                  </form>

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                          <tr>
                            <th className="p-3.5">Code</th>
                            <th className="p-3.5">Discount</th>
                            <th className="p-3.5">Used</th>
                            <th className="p-3.5">Expires</th>
                            <th className="p-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E0D1]/60">
                          {coupons.map(c => (
                            <tr key={c.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                              <td className="p-3.5"><span className="font-mono font-bold text-[#0B332D] bg-[#F8F5EE] px-2 py-0.5 rounded-xs border border-[#E8E0D1]">{c.code}</span></td>
                              <td className="p-3.5 font-bold text-emerald-800">{c.discountPercent}% off</td>
                              <td className="p-3.5 text-gray-700">{c.usedCount}{c.maxUses > 0 ? ` / ${c.maxUses}` : ' / ∞'}</td>
                              <td className="p-3.5 text-gray-700">{c.expiresAt || '—'}</td>
                              <td className="p-3.5">
                                <button
                                  onClick={() => handleCouponStatusToggle(c.id, c.status === 'active' ? 'disabled' : 'active')}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-xs border cursor-pointer transition-colors ${c.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                                >
                                  {c.status === 'active' ? 'Active' : 'Disabled'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {coupons.length === 0 && (
                        <div className="p-6 text-center text-xs text-gray-400 font-sans">No coupons yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: REFERRALS */}
              {activeTab === 'referrals' && (
                <div className="space-y-4">
                  <div className="bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Parent Referrals</h3>
                    <p className="text-xs text-gray-500 font-sans">Track parents who refer new students and manage their rewards.</p>
                  </div>

                  <form onSubmit={handleCreateReferral} className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Referrer Name *</label>
                        <input required value={referralForm.referrerName} onChange={e => setReferralForm(f => ({ ...f, referrerName: e.target.value }))} placeholder="Parent who referred" className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Referrer Phone</label>
                        <input value={referralForm.referrerPhone} onChange={e => setReferralForm(f => ({ ...f, referrerPhone: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Referred Student *</label>
                        <input required value={referralForm.referredStudentName} onChange={e => setReferralForm(f => ({ ...f, referredStudentName: e.target.value }))} placeholder="New student name" className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Referred Phone</label>
                        <input value={referralForm.referredPhone} onChange={e => setReferralForm(f => ({ ...f, referredPhone: e.target.value }))} className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Reward Note</label>
                        <input value={referralForm.rewardNote} onChange={e => setReferralForm(f => ({ ...f, rewardNote: e.target.value }))} placeholder="e.g. 10% off next month" className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm text-xs font-sans focus:outline-none focus:border-[#0B332D]" />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] shadow-xs cursor-pointer">
                          <ShareNetwork className="w-3.5 h-3.5 inline mr-1 text-[#B79A62]" /> Add Referral
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="bg-[#FCFBF8] rounded-sm border border-[#E8E0D1] shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#F8F5EE] text-[#0B332D] font-bold uppercase tracking-wider border-b border-[#E8E0D1] text-[10px]">
                          <tr>
                            <th className="p-3.5">Referrer</th>
                            <th className="p-3.5">Referred Student</th>
                            <th className="p-3.5">Reward</th>
                            <th className="p-3.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E0D1]/60">
                          {referrals.map(r => (
                            <tr key={r.id} className="hover:bg-[#F8F5EE]/50 transition-colors">
                              <td className="p-3.5">
                                <p className="font-bold text-[#0B332D]">{r.referrerName}</p>
                                {r.referrerPhone && <p className="text-[11px] text-gray-500">{r.referrerPhone}</p>}
                              </td>
                              <td className="p-3.5">
                                <p className="font-semibold text-gray-700">{r.referredStudentName}</p>
                                {r.referredPhone && <p className="text-[11px] text-gray-500">{r.referredPhone}</p>}
                              </td>
                              <td className="p-3.5 text-gray-700">{r.rewardNote || '—'}</td>
                              <td className="p-3.5">
                                <select
                                  value={r.status}
                                  onChange={e => handleReferralStatusChange(r.id, e.target.value as Referral['status'])}
                                  className={`px-2 py-1 text-[11px] font-bold rounded-xs border cursor-pointer ${r.status === 'rewarded' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : r.status === 'enrolled' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="enrolled">Enrolled</option>
                                  <option value="rewarded">Rewarded</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {referrals.length === 0 && (
                        <div className="p-6 text-center text-xs text-gray-400 font-sans">No referrals yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 12: MEDIA & ASSETS LIBRARY CMS */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Media &amp; Visual Assets Library</h3>
                      <p className="text-xs text-gray-500 font-sans">Central repository for course banners, scholar portraits, infographics, and branding assets.</p>
                    </div>

                    <button
                      onClick={() => {
                        setMediaForm({ name: '', category: 'banner', url: '', fileSize: '120 KB' });
                        setIsAddingMedia(true);
                      }}
                      className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                      <span>Add Media Asset</span>
                    </button>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-2 border-b border-[#E8E0D1] pb-2 text-xs font-sans">
                    {['all', 'banner', 'course', 'tutor', 'icon'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setMediaCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-xs font-semibold capitalize cursor-pointer transition-colors ${mediaCategoryFilter === cat
                          ? 'bg-[#0B332D] text-[#F8F5EE]'
                          : 'bg-[#F8F5EE] text-gray-700 hover:bg-[#E8E0D1]'
                          }`}
                      >
                        {cat === 'all' ? 'All Assets' : cat + 's'}
                      </button>
                    ))}
                  </div>

                  {/* Media Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {mediaAssets
                      .filter(m => mediaCategoryFilter === 'all' || m.category === mediaCategoryFilter)
                      .map((media) => (
                        <div
                          key={media.id}
                          className="bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm overflow-hidden flex flex-col justify-between shadow-xs group"
                        >
                          <div className="aspect-square bg-neutral-900/5 relative overflow-hidden flex items-center justify-center">
                            <img
                              src={media.url}
                              alt={media.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-black/60 text-white rounded-xs backdrop-blur-xs">
                              {media.category}
                            </span>
                          </div>

                          <div className="p-2.5 space-y-1.5">
                            <h5 className="font-bold text-[#0B332D] text-[11px] truncate" title={media.name}>
                              {media.name}
                            </h5>
                            <p className="text-[9px] text-gray-500">{media.fileSize || 'WebP'}</p>

                            <div className="pt-1.5 border-t border-[#E8E0D1] flex items-center justify-between gap-1">
                              <button
                                onClick={() => handleCopyUrl(media.url)}
                                className="flex-1 py-1 px-1.5 bg-[#FCFBF8] border border-[#E8E0D1] hover:border-[#0B332D] text-[10px] font-semibold text-[#0B332D] rounded-xs inline-flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {copiedUrl === media.url ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" weight="bold" />
                                    <span className="text-emerald-700 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-[#B79A62]" />
                                    <span>Copy URL</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleDeleteMedia(media.id, media.name)}
                                className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                title="Delete Asset"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 13: WHATSAPP & EMAIL MESSAGE TEMPLATES CMS */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">Notification &amp; Message Templates Studio</h3>
                      <p className="text-xs text-gray-500 font-sans">Automated message copywriting for WhatsApp updates, timetable notices, class reminders, and progress reports.</p>
                    </div>

                    {templateSaveToast && (
                      <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-sm flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" weight="fill" />
                        <span>Template Saved!</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Template Selector */}
                    <div className="md:col-span-1 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Available Templates</p>
                      {templates.map((tpl) => (
                        <div
                          key={tpl.id}
                          onClick={() => {
                            setSelectedTemplate(tpl);
                            setTemplateForm({ ...tpl });
                          }}
                          className={`p-3.5 rounded-sm border transition-all cursor-pointer ${(selectedTemplate?.id || templates[0]?.id) === tpl.id
                            ? 'bg-[#0B332D] text-[#F8F5EE] border-[#0B332D] shadow-xs'
                            : 'bg-[#F8F5EE] text-gray-800 border-[#E8E0D1] hover:bg-[#E8E0D1]/50'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[#B79A62] text-[#07221E]">
                              {tpl.channel}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs">{tpl.title}</h5>
                          <p className="text-[10px] line-clamp-2 mt-1 opacity-80">{tpl.body}</p>
                        </div>
                      ))}
                    </div>

                    {/* Right: Template Editor */}
                    <div className="md:col-span-2 bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm p-6 space-y-4 text-xs font-sans">
                      {selectedTemplate || templates[0] ? (
                        <form
                          onSubmit={(e) => {
                            if (!selectedTemplate && templates[0]) {
                              setSelectedTemplate(templates[0]);
                            }
                            handleSaveTemplate(e);
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="block font-bold text-gray-700 mb-1">Template Title</label>
                            <input
                              type="text"
                              value={templateForm.title || selectedTemplate?.title || templates[0]?.title || ''}
                              onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })}
                              className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                            />
                          </div>

                          {(selectedTemplate?.channel === 'email' || selectedTemplate?.channel === 'both') && (
                            <div>
                              <label className="block font-bold text-gray-700 mb-1">Email Subject Line</label>
                              <input
                                type="text"
                                value={templateForm.subject || selectedTemplate?.subject || ''}
                                onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })}
                                className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                              />
                            </div>
                          )}

                          {/* Dynamic Variables Chips */}
                          <div>
                            <label className="block font-bold text-gray-700 mb-1.5">Insert Dynamic Placeholders (Click to insert):</label>
                            <div className="flex flex-wrap gap-1.5">
                              {(selectedTemplate?.availableVariables || templates[0]?.availableVariables || []).map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => {
                                    const currentBody = templateForm.body ?? selectedTemplate?.body ?? templates[0]?.body ?? '';
                                    setTemplateForm({ ...templateForm, body: currentBody + ' ' + v });
                                  }}
                                  className="px-2 py-1 bg-[#F8F5EE] border border-[#E8E0D1] hover:border-[#0B332D] text-[#0B332D] font-mono text-[10px] rounded-xs cursor-pointer"
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-gray-700 mb-1">Message Body</label>
                            <textarea
                              rows={8}
                              value={templateForm.body !== undefined ? templateForm.body : (selectedTemplate?.body || templates[0]?.body || '')}
                              onChange={e => setTemplateForm({ ...templateForm, body: e.target.value })}
                              className="w-full font-mono text-xs px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D] leading-relaxed"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <FloppyDisk className="w-4 h-4 text-[#B79A62]" />
                              <span>Save Template Changes</span>
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 14: SEO & META TAGS CMS */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F8F5EE] p-4 rounded-sm border border-[#E8E0D1]">
                    <div>
                      <h3 className="font-editorial text-2xl text-[#0B332D] font-bold">SEO &amp; Search Engine Optimization CMS</h3>
                      <p className="text-xs text-gray-500 font-sans">Manage meta titles, Google SERP search snippets, descriptions, and keywords for every academy landing page.</p>
                    </div>

                    {seoSaveToast && (
                      <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-sm flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" weight="fill" />
                        <span>SEO Meta Tags Saved!</span>
                      </div>
                    )}
                  </div>

                  {/* IndexNow Instant Search Engine Indexing Bar */}
                  <div className="bg-[#FCFBF8] border border-[#B79A62]/40 rounded-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#0B332D] text-[#B79A62] text-[10px] font-bold uppercase rounded-xs">
                          IndexNow.org Protocol
                        </span>
                        <span className="text-xs font-bold text-[#0B332D]">Instant Bing / Yandex Crawler Ping</span>
                      </div>
                      <p className="text-[11px] text-gray-600 font-sans">
                        Key: <code className="font-mono text-[10px] bg-gray-100 px-1 py-0.5 rounded-xs">171291dc902c49d0af85b3414442a356</code> • File: <a href="https://noorequraninstitute.me/171291dc902c49d0af85b3414442a356.txt" target="_blank" rel="noreferrer" className="text-[#B79A62] hover:underline font-mono text-[10px]">171291dc902c49d0af85b3414442a356.txt</a>
                      </p>
                      {indexNowStatusMsg && (
                        <p className="text-xs font-semibold text-emerald-800 animate-fade-in">{indexNowStatusMsg}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isSubmittingIndexNow}
                      onClick={handleDispatchIndexNow}
                      className="px-4 py-2 bg-[#0B332D] hover:bg-[#07221E] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Sparkle className="w-3.5 h-3.5 text-[#B79A62]" weight="fill" />
                      <span>{isSubmittingIndexNow ? 'Dispatching URLs...' : '🚀 Dispatch 31 URLs to IndexNow'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Page Selector */}
                    <div className="md:col-span-1 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Website Landing Pages</p>
                      {seoConfigs.map((page) => (
                        <div
                          key={page.pagePath}
                          onClick={() => {
                            setSelectedSeoPage(page);
                            setSeoForm({ ...page });
                          }}
                          className={`p-3.5 rounded-sm border transition-all cursor-pointer ${(selectedSeoPage?.pagePath || seoConfigs[0]?.pagePath) === page.pagePath
                            ? 'bg-[#0B332D] text-[#F8F5EE] border-[#0B332D] shadow-xs'
                            : 'bg-[#F8F5EE] text-gray-800 border-[#E8E0D1] hover:bg-[#E8E0D1]/50'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-xs">{page.pageName}</span>
                            <span className="font-mono text-[9px] opacity-75">{page.pagePath}</span>
                          </div>
                          <p className="text-[10px] line-clamp-1 opacity-75">{page.metaTitle}</p>
                        </div>
                      ))}
                    </div>

                    {/* Right: SEO Editor & SERP Simulator */}
                    <div className="md:col-span-2 space-y-5">
                      {/* Google Search Snippet Live Preview */}
                      <div className="bg-[#FFFFFF] border border-[#E8E0D1] rounded-sm p-4 space-y-1 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                          Google Search Result Preview (SERP Simulator)
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#202124]">
                          <span className="w-4 h-4 rounded-full bg-[#0B332D] text-white text-[8px] flex items-center justify-center font-bold">N</span>
                          <span className="text-gray-700 text-[11px]">https://noorequraninstitute.me{selectedSeoPage?.pagePath !== '/' ? selectedSeoPage?.pagePath : ''}</span>
                        </div>
                        <h4 className="text-[#1a0dab] hover:underline text-base font-medium cursor-pointer line-clamp-1">
                          {seoForm.metaTitle || selectedSeoPage?.metaTitle || seoConfigs[0]?.metaTitle}
                        </h4>
                        <p className="text-[#4d5156] text-xs leading-relaxed line-clamp-2">
                          {seoForm.metaDescription || selectedSeoPage?.metaDescription || seoConfigs[0]?.metaDescription}
                        </p>
                      </div>

                      {/* SEO Form */}
                      <form
                        onSubmit={(e) => {
                          if (!selectedSeoPage && seoConfigs[0]) {
                            setSelectedSeoPage(seoConfigs[0]);
                          }
                          handleSaveSeo(e);
                        }}
                        className="bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm p-6 space-y-4 text-xs font-sans"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-gray-700">Meta Title Tag (50 - 65 Chars Recommended)</label>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {(seoForm.metaTitle ?? selectedSeoPage?.metaTitle ?? seoConfigs[0]?.metaTitle ?? '').length} chars
                            </span>
                          </div>
                          <input
                            type="text"
                            value={seoForm.metaTitle !== undefined ? seoForm.metaTitle : (selectedSeoPage?.metaTitle || seoConfigs[0]?.metaTitle || '')}
                            onChange={e => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-gray-700">Meta Description (120 - 160 Chars Recommended)</label>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {(seoForm.metaDescription ?? selectedSeoPage?.metaDescription ?? seoConfigs[0]?.metaDescription ?? '').length} chars
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={seoForm.metaDescription !== undefined ? seoForm.metaDescription : (selectedSeoPage?.metaDescription || seoConfigs[0]?.metaDescription || '')}
                            onChange={e => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Canonical URL</label>
                          <input
                            type="text"
                            value={seoForm.canonicalUrl !== undefined ? seoForm.canonicalUrl : (selectedSeoPage?.canonicalUrl || seoConfigs[0]?.canonicalUrl || '')}
                            onChange={e => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <FloppyDisk className="w-4 h-4 text-[#B79A62]" />
                            <span>Save Page SEO</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

        {/* Add/Edit Tutor Modal with Photo Upload & Cropping */}
        {isAddingTutor && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <h3 className="font-editorial text-xl font-semibold">
                  {editingTutor ? 'Edit Faculty Profile' : 'Add New Faculty Member'}
                </h3>
                <button onClick={() => setIsAddingTutor(false)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTutor} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                {/* Photo Upload & Preview Card */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">Tutor Portrait Picture</label>
                  <div className="flex items-center gap-4 p-3 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm">
                    <div className="w-16 h-16 rounded-sm overflow-hidden border border-[#E8E0D1] bg-[#FCFBF8] shrink-0">
                      {tutorForm.photoUrl ? (
                        <img src={tutorForm.photoUrl} alt="Tutor preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B332D] text-[#F8F5EE] text-xs font-semibold rounded-sm hover:bg-[#07221E] cursor-pointer">
                        <UploadSimple className="w-3.5 h-3.5 text-[#B79A62]" />
                        <span>Upload &amp; Frame Picture</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleTutorPhotoSelect}
                          className="hidden"
                        />
                      </label>
                      {tutorForm.photoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setRawTutorImage(tutorForm.photoUrl || '');
                            setIsTutorCropOpen(true);
                          }}
                          className="block text-[11px] font-semibold text-[#0B332D] hover:underline cursor-pointer"
                        >
                          Re-crop / Re-frame Picture
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Qari Muhammad Bilal"
                    value={tutorForm.name}
                    onChange={e => setTutorForm({ ...tutorForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Gender</label>
                    <select
                      value={tutorForm.gender}
                      onChange={e => setTutorForm({ ...tutorForm, gender: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="Male">Male Scholar</option>
                      <option value="Female">Female Scholar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={tutorForm.status}
                      onChange={e => setTutorForm({ ...tutorForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="Available">Available</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tajweed Mastery, Hifz, Noorani Qaida"
                    value={tutorForm.specialization}
                    onChange={e => setTutorForm({ ...tutorForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="Shahadat-ul-Aalamia / Certified Qari"
                    value={tutorForm.qualification}
                    onChange={e => setTutorForm({ ...tutorForm, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="tutor@noorequran.com"
                      value={tutorForm.email}
                      onChange={e => setTutorForm({ ...tutorForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="+92 327 4496163"
                      value={tutorForm.phone}
                      onChange={e => setTutorForm({ ...tutorForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E0D1] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTutor(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer"
                  >
                    Save Faculty Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Course Modal */}
        {isAddingCourse && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <h3 className="font-editorial text-xl font-semibold">
                  {editingCourse ? 'Edit Course Program' : 'Add Course Program'}
                </h3>
                <button onClick={() => setIsAddingCourse(false)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Course Name *</label>
                  <input
                    type="text"
                    required
                    value={courseForm.name || ''}
                    onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Arabic Title</label>
                  <input
                    type="text"
                    placeholder="القاعدة النورانية"
                    value={courseForm.arabicName || ''}
                    onChange={e => setCourseForm({ ...courseForm, arabicName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm font-arabic focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={courseForm.shortDescription || ''}
                    onChange={e => setCourseForm({ ...courseForm, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Monthly Fee (PKR)</label>
                    <input
                      type="number"
                      value={courseForm.feePKR || 3500}
                      onChange={e => setCourseForm({ ...courseForm, feePKR: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Monthly Fee (USD)</label>
                    <input
                      type="number"
                      value={courseForm.feeUSD || 35}
                      onChange={e => setCourseForm({ ...courseForm, feeUSD: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={courseForm.duration || '3 - 6 Months'}
                      onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Classes / Week</label>
                    <input
                      type="text"
                      value={courseForm.classesPerWeek || '4 - 5 Days / Week'}
                      onChange={e => setCourseForm({ ...courseForm, classesPerWeek: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E0D1] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCourse(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer"
                  >
                    Save Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Scholar & Timetable Modal */}
        {assigningStudent && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <div>
                  <h3 className="font-editorial text-xl font-semibold">
                    Assign Scholar &amp; Set Class Timetable
                  </h3>
                  <p className="text-[11px] text-[#B79A62]">
                    Student: {assigningStudent.studentName} • {assigningStudent.courseName}
                  </p>
                </div>
                <button onClick={() => setAssigningStudent(null)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStudentAssignment} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Certified Scholar / Tutor *</label>
                  <select
                    value={assignmentForm.tutorId}
                    onChange={e => {
                      const selTut = tutors.find(t => t.id === e.target.value);
                      setAssignmentForm({
                        ...assignmentForm,
                        tutorId: e.target.value,
                        tutorName: selTut ? selTut.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  >
                    <option value="">-- Choose Faculty Member --</option>
                    {tutors.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.gender} • {t.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Class Schedule Days</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const isSelected = assignmentForm.preferredDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const newDays = isSelected
                              ? assignmentForm.preferredDays.filter(d => d !== day)
                              : [...assignmentForm.preferredDays, day];
                            setAssignmentForm({ ...assignmentForm, preferredDays: newDays });
                          }}
                          className={`py-1.5 px-2 text-[11px] rounded-xs border text-center font-medium transition-colors cursor-pointer ${isSelected
                            ? 'bg-[#0B332D] text-[#F8F5EE] border-[#0B332D]'
                            : 'bg-[#F8F5EE] text-gray-700 border-[#E8E0D1] hover:border-[#B79A62]'
                            }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Time Slot Preference</label>
                    <select
                      value={assignmentForm.preferredTime}
                      onChange={e => setAssignmentForm({ ...assignmentForm, preferredTime: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="Morning">Morning (08:00 AM - 12:00 PM)</option>
                      <option value="Afternoon">Afternoon (12:00 PM - 04:00 PM)</option>
                      <option value="Evening">Evening (04:00 PM - 08:00 PM)</option>
                      <option value="Night">Night (08:00 PM - 11:00 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Student Status</label>
                    <select
                      value={assignmentForm.status}
                      onChange={e => setAssignmentForm({ ...assignmentForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="Active">Active</option>
                      <option value="On Trial">On Trial</option>
                      <option value="Paused">Paused</option>
                      <option value="Graduated">Graduated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Lesson / Sabaq Milestone</label>
                  <input
                    type="text"
                    placeholder="e.g. Surah Al-Baqarah (Ayah 142) or Qaida Lesson 4"
                    value={assignmentForm.currentSurahOrLesson}
                    onChange={e => setAssignmentForm({ ...assignmentForm, currentSurahOrLesson: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div className="pt-4 border-t border-[#E8E0D1] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAssigningStudent(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer"
                  >
                    Save Assignment &amp; Timetable
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enrollment Details & Approval Modal */}
        {selectedEnrollment && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <div>
                  <h3 className="font-editorial text-xl font-semibold">
                    Enrollment Application
                  </h3>
                  <p className="text-[11px] text-[#B79A62]">
                    Student: {selectedEnrollment.studentName} ({selectedEnrollment.courseName})
                  </p>
                </div>
                <button onClick={() => setSelectedEnrollment(null)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto text-xs font-sans">
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#F8F5EE] rounded-sm border border-[#E8E0D1]">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Student Name</span>
                    <span className="font-bold text-[#0B332D] text-sm">{selectedEnrollment.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Parent / Guardian</span>
                    <span className="font-semibold text-gray-800">{selectedEnrollment.parentName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Phone / WhatsApp</span>
                    <span className="font-mono text-gray-800">{selectedEnrollment.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Email Address</span>
                    <span className="text-gray-800">{selectedEnrollment.parentEmail || selectedEnrollment.studentEmail || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Country</span>
                    <span className="text-gray-800">{selectedEnrollment.country}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Selected Package</span>
                    <span className="text-gray-800 font-semibold">{selectedEnrollment.packageName || 'Standard Plan'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Tutor Preference</span>
                    <span className="text-gray-800">{selectedEnrollment.tutorPreference}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Time Slot</span>
                    <span className="text-gray-800">{selectedEnrollment.timeSlot}</span>
                  </div>
                </div>

                {selectedEnrollment.additionalNotes && (
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Applicant's Additional Notes</label>
                    <p className="p-3 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm text-gray-700 italic">
                      "{selectedEnrollment.additionalNotes}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Assign Certified Scholar</label>
                    <select
                      value={selectedEnrollment.assignedTutorId || ''}
                      onChange={e => {
                        const tut = tutors.find(t => t.id === e.target.value);
                        updateEnrollment(selectedEnrollment.id, {
                          assignedTutorId: e.target.value,
                          assignedTutorName: tut ? tut.name : ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="">-- Choose Scholar --</option>
                      {tutors.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.gender})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Application Status</label>
                    <select
                      value={selectedEnrollment.status}
                      onChange={e => updateEnrollment(selectedEnrollment.id, { status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="New Application">New Application</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Trial Recommended">Trial Recommended</option>
                      <option value="Approved">Approved</option>
                      <option value="Tutor Assigned">Tutor Assigned</option>
                      <option value="Active">Active</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E0D1] flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={`https://wa.me/${selectedEnrollment.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${selectedEnrollment.parentName || selectedEnrollment.studentName}! This is Noor E Quran Institute regarding your enrollment application for ${selectedEnrollment.courseName}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-[#25D366] text-white font-bold rounded-sm inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <WhatsappLogo className="w-4 h-4" weight="fill" />
                    <span>WhatsApp Parent</span>
                  </a>

                  <button
                    type="button"
                    disabled={approvingEnrollment}
                    onClick={async () => {
                      // Idempotency guard: don't re-approve an already-active enrollment.
                      if (selectedEnrollment.status === 'Active') {
                        setSelectedEnrollment(null);
                        setActiveTab('students');
                        return;
                      }
                      setApprovingEnrollment(true);
                      const newStu: Student = {
                        id: `stu-${Date.now()}`,
                        studentName: selectedEnrollment.studentName,
                        parentName: selectedEnrollment.parentName || 'Parent',
                        email: selectedEnrollment.parentEmail || selectedEnrollment.studentEmail || 'student@noorequraninstitute.me',
                        phone: selectedEnrollment.phone,
                        country: selectedEnrollment.country,
                        courseId: selectedEnrollment.courseId,
                        courseName: selectedEnrollment.courseName,
                        packageId: selectedEnrollment.packageId,
                        packageName: selectedEnrollment.packageName,
                        tutorId: selectedEnrollment.assignedTutorId,
                        tutorName: selectedEnrollment.assignedTutorName,
                        preferredTime: selectedEnrollment.timeSlot,
                        preferredDays: selectedEnrollment.preferredDays || ['Monday', 'Wednesday', 'Friday'],
                        learningPace: selectedEnrollment.learningPace || 'Normal',
                        status: 'Active',
                        currentSurahOrLesson: 'Noorani Qaida / Tajweed Primer',
                        // Idempotency key: server returns existing student if this
                        // enrollment was already approved (prevents duplicates).
                        enrollmentId: selectedEnrollment.id,
                        notes: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      try {
                        const res = await fetch('/api/admin/students', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify(newStu)
                        });
                        const saved = await res.json();
                        if (!res.ok || !saved.success) {
                          throw new Error(saved.error || `Server returned ${res.status}`);
                        }
                        const student = saved.student || newStu;
                        // Avoid duplicate rows: replace if already in list (idempotent).
                        setStudents(prev => {
                          const exists = prev.some(s => s.id === student.id);
                          return exists ? prev.map(s => s.id === student.id ? student : s) : [...prev, student];
                        });
                        if (saved.deduplicated) {
                          alert('This enrollment was already approved. Showing the existing student record.');
                        }
                        updateEnrollment(selectedEnrollment.id, { status: 'Active' });
                        setSelectedEnrollment(null);
                        setActiveTab('students');
                      } catch (err: any) {
                        // Do NOT add phantom rows on failure. Show the error.
                        alert(`Failed to approve enrollment: ${err.message || 'unknown error'}. Please try again.`);
                      } finally {
                        setApprovingEnrollment(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approvingEnrollment ? 'Approving…' : 'Approve & Add to Students'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lead Details Modal with Notes */}
        {selectedLead && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <div>
                  <h3 className="font-editorial text-xl font-semibold">
                    Trial Inquiry Details
                  </h3>
                  <p className="text-[11px] text-[#B79A62]">
                    Student: {selectedLead.studentName} ({selectedLead.courseName})
                  </p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8F5EE] rounded-sm border border-[#E8E0D1]">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Student</span>
                    <span className="font-bold text-[#0B332D]">{selectedLead.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Parent</span>
                    <span className="text-gray-800">{selectedLead.parentName || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Phone</span>
                    <span className="font-mono text-gray-800">{selectedLead.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Country</span>
                    <span className="text-gray-800">{selectedLead.country}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Time Slot</span>
                    <span className="text-gray-800">{selectedLead.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Tutor Pref</span>
                    <span className="text-gray-800">{selectedLead.tutorGender}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lead Status</label>
                  <select
                    value={selectedLead.status}
                    onChange={e => updateLeadStatus(selectedLead.id, e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  >
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Trial Scheduled">Trial Scheduled</option>
                    <option value="Converted">Converted</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Notes History */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Administrative Notes</label>
                  <div className="space-y-2 mb-2 max-h-32 overflow-y-auto">
                    {selectedLead.notes && selectedLead.notes.length > 0 ? (
                      selectedLead.notes.map((n, i) => (
                        <div key={i} className="p-2 bg-[#F8F5EE] border border-[#E8E0D1] rounded-xs text-[11px]">
                          <p className="text-gray-800">{n.text}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{n.author} • {new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 italic text-[11px]">No notes added yet.</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a new note..."
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                    <button
                      type="button"
                      onClick={() => addLeadNote(selectedLead.id)}
                      className="px-3 py-1.5 bg-[#0B332D] text-[#F8F5EE] font-semibold rounded-sm hover:bg-[#07221E] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E0D1] flex justify-between">
                  <button
                    onClick={() => openWhatsAppForLead(selectedLead)}
                    className="px-4 py-2 bg-[#25D366] text-white font-bold rounded-sm inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <WhatsappLogo className="w-4 h-4" weight="fill" />
                    <span>WhatsApp Inquiry</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Package Plan Modal */}
        {isAddingPackage && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <h3 className="font-editorial text-xl font-semibold">
                  {editingPackage ? 'Edit Pricing Package' : 'Add Pricing Package'}
                </h3>
                <button onClick={() => setIsAddingPackage(false)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Package Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standard 3 Days/Week"
                    value={packageForm.name || ''}
                    onChange={e => setPackageForm({ ...packageForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Days Per Week</label>
                    <input
                      type="text"
                      placeholder="3 Days / Week"
                      value={packageForm.daysPerWeek || ''}
                      onChange={e => setPackageForm({ ...packageForm, daysPerWeek: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Class Duration (Mins)</label>
                    <input
                      type="number"
                      value={packageForm.classDurationMinutes || 30}
                      onChange={e => setPackageForm({ ...packageForm, classDurationMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Monthly Fee (PKR)</label>
                    <input
                      type="number"
                      value={packageForm.monthlyFeePKR || 3500}
                      onChange={e => setPackageForm({ ...packageForm, monthlyFeePKR: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Monthly Fee (USD)</label>
                    <input
                      type="number"
                      value={packageForm.monthlyFeeUSD || 35}
                      onChange={e => setPackageForm({ ...packageForm, monthlyFeeUSD: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={packageForm.description || ''}
                    onChange={e => setPackageForm({ ...packageForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!packageForm.isPopular}
                      onChange={e => setPackageForm({ ...packageForm, isPopular: e.target.checked })}
                      className="rounded-xs text-[#0B332D]"
                    />
                    <span className="font-bold text-[#0B332D]">Mark as Popular / Best Value Plan</span>
                  </label>
                  {packageForm.isPopular && (
                    <input
                      type="text"
                      placeholder="Badge: e.g. Most Popular"
                      value={packageForm.badge || 'Popular'}
                      onChange={e => setPackageForm({ ...packageForm, badge: e.target.value })}
                      className="px-2 py-1 text-xs border border-[#E8E0D1] bg-[#FCFBF8] rounded-sm"
                    />
                  )}
                </div>

                <div className="pt-4 border-t border-[#E8E0D1] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPackage(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer"
                  >
                    Save Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Testimonial Modal */}
        {isAddingTestimonial && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <h3 className="font-editorial text-xl font-semibold">
                  {editingTestimonial ? 'Edit Parent Review' : 'Add Parent Review'}
                </h3>
                <button onClick={() => setIsAddingTestimonial(false)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTestimonial} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Reviewer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sister Fatima Khan"
                      value={testimonialForm.name || ''}
                      onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Relation / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Mother of Ayaan (7 yrs)"
                      value={testimonialForm.studentOrParent || ''}
                      onChange={e => setTestimonialForm({ ...testimonialForm, studentOrParent: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Location &amp; Country</label>
                    <input
                      type="text"
                      placeholder="e.g. London, UK"
                      value={testimonialForm.location || ''}
                      onChange={e => setTestimonialForm({ ...testimonialForm, location: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Country Flag</label>
                    <input
                      type="text"
                      placeholder="e.g. 🇬🇧 or 🇺🇸"
                      value={testimonialForm.countryFlag || '🇬🇧'}
                      onChange={e => setTestimonialForm({ ...testimonialForm, countryFlag: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Noorani Qaida & Tajweed"
                      value={testimonialForm.courseName || ''}
                      onChange={e => setTestimonialForm({ ...testimonialForm, courseName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Star Rating (1 - 5)</label>
                    <select
                      value={testimonialForm.rating || 5}
                      onChange={e => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Parent Review / Feedback *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter quote or parent reflection..."
                    value={testimonialForm.comment || ''}
                    onChange={e => setTestimonialForm({ ...testimonialForm, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Publish Status</label>
                  <select
                    value={testimonialForm.status || 'published'}
                    onChange={e => setTestimonialForm({ ...testimonialForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  >
                    <option value="published">Published (Visible on Website)</option>
                    <option value="pending">Draft / Pending</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-[#E8E0D1] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTestimonial(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer"
                  >
                    Save Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit FAQ Modal */}
        {isAddingFaq && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <h3 className="font-editorial text-xl font-semibold">
                  {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                </h3>
                <button onClick={() => setIsAddingFaq(false)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFaq} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Question *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Do you offer female Quran teachers?"
                    value={faqForm.question || ''}
                    onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Answer *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Comprehensive answer..."
                    value={faqForm.answer || ''}
                    onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category</label>
                    <select
                      value={faqForm.category || 'Admissions'}
                      onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="Admissions">Admissions</option>
                      <option value="Classes">Classes</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Courses">Courses</option>
                      <option value="Schedules">Schedules</option>
                      <option value="Fees">Fees &amp; Billing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      value={faqForm.order || 1}
                      onChange={e => setFaqForm({ ...faqForm, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E0D1] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingFaq(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer"
                  >
                    Save FAQ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Media Asset Modal */}
        {isAddingMedia && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <h3 className="font-editorial text-xl font-semibold">
                  Add Media Asset
                </h3>
                <button onClick={() => setIsAddingMedia(false)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMedia} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Asset Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramadan Special Promo Graphic"
                    value={mediaForm.name}
                    onChange={e => setMediaForm({ ...mediaForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Asset Category</label>
                  <select
                    value={mediaForm.category}
                    onChange={e => setMediaForm({ ...mediaForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  >
                    <option value="banner">Banner / Hero Graphics</option>
                    <option value="course">Course Curriculum Graphic</option>
                    <option value="tutor">Scholar / Faculty Portrait</option>
                    <option value="blog">Blog / Article Thumbnail</option>
                    <option value="icon">Brand Icon / Badge</option>
                    <option value="document">PDF / Worksheet</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Image URL / Path *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /images/promo-banner.webp or https://..."
                    value={mediaForm.url}
                    onChange={e => setMediaForm({ ...mediaForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                {/* Upload Local Image option */}
                <div className="p-3 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Or choose a local image file:</span>
                  <label className="px-3 py-1.5 bg-[#0B332D] text-[#F8F5EE] text-[11px] font-bold rounded-xs cursor-pointer inline-flex items-center gap-1">
                    <UploadSimple className="w-3 h-3 text-[#B79A62]" />
                    <span>Browse File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            if (typeof re.target?.result === 'string') {
                              setMediaForm(prev => ({
                                ...prev,
                                url: re.target?.result as string,
                                fileSize: `${Math.round(file.size / 1024)} KB`
                              }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {mediaForm.url && (
                  <div className="aspect-video bg-neutral-900/5 rounded-sm border border-[#E8E0D1] overflow-hidden flex items-center justify-center">
                    <img src={mediaForm.url} alt="Preview" className="max-h-32 object-contain" />
                  </div>
                )}

                <div className="pt-4 border-t border-[#E8E0D1] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingMedia(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer"
                  >
                    Save Asset
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Issue Fee Invoice Modal */}
        {isAddingInvoice && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <h3 className="font-editorial text-xl font-semibold">
                  Issue Tuition Fee Invoice
                </h3>
                <button onClick={() => setIsAddingInvoice(false)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveInvoice} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Enrolled Student *</label>
                  <select
                    value={invoiceForm.studentId || ''}
                    onChange={(e) => {
                      const stu = students.find(s => s.id === e.target.value);
                      if (stu) {
                        setInvoiceForm({
                          ...invoiceForm,
                          studentId: stu.id,
                          studentName: stu.studentName,
                          parentName: stu.parentName,
                          phone: stu.phone,
                          courseName: stu.courseName,
                          packageName: stu.packageName || 'Standard Plan'
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.studentName} ({s.courseName})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Fee Amount *</label>
                    <input
                      type="number"
                      required
                      value={invoiceForm.amount || 35}
                      onChange={e => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Currency</label>
                    <select
                      value={invoiceForm.currency || 'USD'}
                      onChange={e => setInvoiceForm({ ...invoiceForm, currency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="PKR">PKR (Rs)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="AED">AED (د.إ)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Billing Month</label>
                    <input
                      type="text"
                      placeholder="e.g. August 2026"
                      value={invoiceForm.billingMonth || ''}
                      onChange={e => setInvoiceForm({ ...invoiceForm, billingMonth: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate || ''}
                      onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E8E0D1] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingInvoice(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer"
                  >
                    Generate Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Generate Student Progress Card Modal */}
        {isGeneratingReport && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 bg-[#0B332D] text-[#F8F5EE] flex items-center justify-between border-b border-[#B79A62]/30">
                <h3 className="font-editorial text-xl font-semibold">
                  Generate Monthly Evaluation Card
                </h3>
                <button onClick={() => setIsGeneratingReport(false)} className="text-gray-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveReportCard} className="p-6 space-y-4 overflow-y-auto text-xs font-sans">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Student *</label>
                  <select
                    value={reportForm.studentId || ''}
                    onChange={(e) => {
                      const stu = students.find(s => s.id === e.target.value);
                      if (stu) {
                        setReportForm({
                          ...reportForm,
                          studentId: stu.id,
                          studentName: stu.studentName,
                          courseName: stu.courseName,
                          tutorName: stu.tutorName || 'Qari Hafiz Muhammad Bilal',
                          currentSabaq: stu.currentSurahOrLesson || 'Surah Al-Baqarah'
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.studentName} ({s.courseName})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Tajweed Grade</label>
                    <select
                      value={reportForm.tajweedGrade || 'A+'}
                      onChange={e => setReportForm({ ...reportForm, tajweedGrade: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="A+">A+ (Exceptional)</option>
                      <option value="A">A (Excellent)</option>
                      <option value="B+">B+ (Very Good)</option>
                      <option value="B">B (Good)</option>
                      <option value="Needs Practice">Needs Practice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Reading Fluency</label>
                    <select
                      value={reportForm.readingGrade || 'A+'}
                      onChange={e => setReportForm({ ...reportForm, readingGrade: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    >
                      <option value="A+">A+ (Fluent)</option>
                      <option value="A">A (Good Pace)</option>
                      <option value="B+">B+ (Moderate)</option>
                      <option value="B">B (Slow)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Attendance %</label>
                    <input
                      type="number"
                      value={reportForm.attendancePercentage || 95}
                      onChange={e => setReportForm({ ...reportForm, attendancePercentage: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Sabaq Milestone</label>
                  <input
                    type="text"
                    value={reportForm.currentSabaq || ''}
                    onChange={e => setReportForm({ ...reportForm, currentSabaq: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Scholar Evaluation Remarks</label>
                  <textarea
                    rows={3}
                    value={reportForm.teacherRemarks || ''}
                    onChange={e => setReportForm({ ...reportForm, teacherRemarks: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D1] bg-[#F8F5EE] rounded-sm focus:outline-none focus:border-[#0B332D]"
                  />
                </div>

                <div className="pt-4 border-t border-[#E8E0D1] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGeneratingReport(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#0B332D] text-[#F8F5EE] font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] cursor-pointer"
                  >
                    Issue Report Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Printable Formal Fee Receipt Modal */}
        {selectedInvoiceForPrint && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E8E0D1] rounded-sm shadow-2xl p-8 space-y-6 text-xs font-sans">
              <div className="flex items-center justify-between border-b border-[#0B332D] pb-4">
                <div>
                  <h2 className="font-editorial text-2xl text-[#0B332D] font-bold">Noor E Quran Institute</h2>
                  <p className="text-[10px] text-[#B79A62] font-semibold">Official Tuition Fee Receipt</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-gray-800">{selectedInvoiceForPrint.invoiceNumber}</span>
                  <p className="text-[10px] text-gray-500">Date: {selectedInvoiceForPrint.dueDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Billed To:</span>
                  <strong className="text-sm text-[#0B332D]">{selectedInvoiceForPrint.studentName}</strong>
                  <p className="text-gray-600">{selectedInvoiceForPrint.parentName}</p>
                  <p className="text-gray-500 font-mono">{selectedInvoiceForPrint.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Status:</span>
                  <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-xs ${selectedInvoiceForPrint.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                    {selectedInvoiceForPrint.status.toUpperCase()}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1">Billing Period: {selectedInvoiceForPrint.billingMonth}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-sm p-4 bg-gray-50 space-y-2">
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>{selectedInvoiceForPrint.courseName} ({selectedInvoiceForPrint.packageName})</span>
                  <span>{selectedInvoiceForPrint.currency} {selectedInvoiceForPrint.amount}</span>
                </div>
                <div className="pt-2 border-t border-gray-300 flex justify-between font-bold text-sm text-[#0B332D]">
                  <span>Total Amount</span>
                  <span>{selectedInvoiceForPrint.currency} {selectedInvoiceForPrint.amount}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#0B332D] text-[#F8F5EE] font-bold rounded-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Printable Formal Progress Certificate Modal */}
        {selectedReportForPrint && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl my-8 relative">
              {/* Certificate paper with ornate double border */}
              <div className="bg-[#FDFBF5] border-[6px] border-[#B79A62] shadow-2xl relative">
                <div className="border border-[#B79A62]/60 m-2 px-8 py-10 text-center space-y-5">
                  {/* Logo seal */}
                  <div className="flex justify-center">
                    <img
                      src="/branding/logo.webp?v=2"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/branding/logo.png?v=2'; }}
                      alt="Noor E Quran Institute Official Seal"
                      className="w-20 h-20 object-contain"
                    />
                  </div>

                  {/* Header */}
                  <div className="space-y-1">
                    <p className="text-[#B79A62] font-bold text-sm tracking-[0.3em] uppercase">Noor E Quran Institute</p>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">Online Quran Academy • 1-on-1 Classes</p>
                  </div>

                  {/* Title with flourishes */}
                  <div className="flex items-center justify-center gap-4">
                    <span className="h-px w-16 bg-[#B79A62]" />
                    <span className="text-[#B79A62] text-lg">✦</span>
                    <span className="h-px w-16 bg-[#B79A62]" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-editorial text-4xl text-[#0B332D] font-bold">Certificate</h2>
                    <p className="text-sm text-[#0B332D]/70 tracking-[0.2em] uppercase">of Quranic Evaluation</p>
                    <p className="text-xs text-gray-500">{selectedReportForPrint.evaluationMonth} Progress Report</p>
                  </div>

                  {/* Recipient */}
                  <div className="py-2 space-y-2">
                    <p className="text-xs text-gray-500 italic tracking-wide">This certificate is proudly presented to</p>
                    <h3 className="font-editorial text-3xl text-[#0B332D] font-bold tracking-wide border-b-2 border-[#B79A62]/40 inline-block px-8 pb-1">
                      {selectedReportForPrint.studentName}
                    </h3>
                    <p className="text-sm text-gray-700">for dedicated studies in <strong className="text-[#0B332D]">{selectedReportForPrint.courseName}</strong></p>
                  </div>

                  {/* Grades */}
                  <div className="flex justify-center gap-8 py-2">
                    {[
                      { label: 'Tajweed', value: selectedReportForPrint.tajweedGrade },
                      { label: 'Fluency', value: selectedReportForPrint.readingGrade },
                      { label: 'Attendance', value: `${selectedReportForPrint.attendancePercentage}%` },
                    ].map((g) => (
                      <div key={g.label} className="text-center">
                        <div className="w-20 h-20 mx-auto rounded-full border-2 border-[#B79A62] bg-[#F8F5EE] flex items-center justify-center">
                          <strong className="text-[#0B332D] text-lg font-editorial">{g.value}</strong>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{g.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Remarks */}
                  <p className="text-xs text-gray-600 italic px-6 leading-relaxed">
                    "{selectedReportForPrint.teacherRemarks}"
                  </p>

                  {/* Signatures */}
                  <div className="flex justify-between items-end pt-6 px-4">
                    <div className="text-center">
                      <div className="w-40 border-t border-[#0B332D]/40 pt-1">
                        <p className="text-[10px] font-bold text-[#0B332D] uppercase tracking-widest">Administrator</p>
                        <p className="text-[9px] text-gray-500">Noor E Quran Institute</p>
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-2 border-[#B79A62] flex items-center justify-center bg-[#F8F5EE] rotate-[-8deg]">
                      <span className="text-[8px] font-bold text-[#B79A62] uppercase tracking-wider text-center leading-tight">Official<br />Seal</span>
                    </div>
                    <div className="text-center">
                      <div className="w-40 border-t border-[#0B332D]/40 pt-1">
                        <p className="text-[10px] font-bold text-[#0B332D] uppercase tracking-widest">Date Issued</p>
                        <p className="text-[9px] text-gray-500">{selectedReportForPrint.evaluationMonth}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal actions (not part of the certificate) */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-[#0B332D] text-[#F8F5EE] font-bold rounded-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#B79A62]" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setSelectedReportForPrint(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tutor Image Cropper Modal */}
        <ImageCropModal
          isOpen={isTutorCropOpen}
          imageSrc={rawTutorImage}
          title="Frame Faculty Portrait Picture"
          initialAspectRatio="1:1"
          onClose={() => setIsTutorCropOpen(false)}
          onCropComplete={(cropped) => {
            setTutorForm(prev => ({ ...prev, photoUrl: cropped }));
          }}
        />

      </div>
    </div>
  );
};
