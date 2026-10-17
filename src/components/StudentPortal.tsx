import React, { useState, useEffect } from 'react';
import {
  Student,
  ScheduledClass,
  ClassProgressReport,
  StudentAssessment,
  Tutor
} from '../types';
import { useAuth } from '../context/AuthContext';
import { saveProgressReportToFirebase } from '../lib/firestoreService';
import { QuranReader } from './portal/QuranReader';
import { Whiteboard } from './portal/Whiteboard';
import { usePresence, usePresenceList, isOnline, lastSeenText } from './portal/usePresence';
import { getAssignedTutor } from './portal/tutorAssignments';
import { StudentProfileBadge } from './portal/StudentProfileBadge';
import { useLiveClasses } from './portal/useLiveClasses';
import { submitHomework, useMyHomework } from './portal/useHomework';
import { useMessageThread, useUnreadCount, sendPortalMessage, markThreadRead, threadIdFor } from './portal/useMessages';
import { INITIAL_TUTORS } from '../data/academyData';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Certificate,
  DownloadSimple,
  WhatsappLogo,
  Play,
  Microphone,
  VideoCamera,
  FileText,
  TrendUp,
  WarningCircle,
  CaretRight,
  ShieldCheck,
  PhoneCall,
  Envelope,
  ArrowRight,
  GraduationCap,
  ChalkboardTeacher,
  ChatCircleText,
  PaperPlaneTilt,
  ClipboardText,
  Checks
} from '@phosphor-icons/react';

interface StudentPortalProps {
  onOpenClassroom: (surahNumber?: number) => void;
  onBackToLanding: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  onOpenClassroom,
  onBackToLanding
}) => {
  const { currentUser, userProfile, logout } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'sabaq' | 'schedule' | 'homework' | 'invoices' | 'quran' | 'liveclass' | 'whiteboard' | 'messages'>('overview');
  
  // Homework recording state
  const [recordingHomework, setRecordingHomework] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(false);
  const [homeworkNote, setHomeworkNote] = useState('');
  const [homeworkSubmitted, setHomeworkSubmitted] = useState(false);
  const [savingHomework, setSavingHomework] = useState(false);
  const [callLogs, setCallLogs] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('alnoor_call_logs') || '[]');
      setCallLogs(saved);
    } catch (e) {}
  }, []);

  // Dynamically constructed active student from authenticated profile or verified record
  const currentStudent = {
    id: currentUser?.uid || userProfile?.uid || 'stu-live-1',
    studentName: userProfile?.displayName || 'Learner (Noor E Quran Student)',
    parentName: userProfile?.parentName || 'Parent / Guardian',
    email: currentUser?.email || userProfile?.email || 'student@noorequraninstitute.me',
    phone: userProfile?.phone || '+92 327 4496163',
    country: userProfile?.country || 'Worldwide',
    courseId: 'c-2',
    courseName: userProfile?.courseName || 'Quran Reading / Nazra with Tajweed',
    packageId: 'pkg-3days',
    packageName: 'Standard Learning (3 Days/Week)',
    tutorId: 'tut-1',
    tutorName: 'Ustadha Maryam Siddiqa',
    preferredTime: 'Evening',
    preferredDays: ['Monday', 'Wednesday', 'Friday'],
    learningPace: 'Normal' as const,
    status: 'Active' as const,
    currentSurahOrLesson: 'Surah Al-Baqarah (Ayah 142)',
    createdAt: userProfile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: [],
    assignedTutorDetails: {
      name: 'Ustadha Maryam Siddiqa',
      title: 'Ijazah Holder (Al-Azhar University) | Senior Tajweed Faculty',
      phone: '+92 327 4496163',
      whatsapp: `https://wa.me/923274496163?text=Salam%20Ustadha%20Maryam,%20this%20is%20${encodeURIComponent(userProfile?.displayName || 'Student')}.`,
      photoInitials: 'MS'
    },
    nextClassTime: 'Today at 6:00 PM (In 45 mins)',
    attendanceRate: 98,
    completedClasses: 28,
    feeStatus: 'Paid' as const,
    feeAmount: '£55.00 / Month',
    invoiceNumber: 'INV-2026-0801'
  };

  // Online presence: publish student online status + watch teachers & live classes
  usePresence(currentUser?.email || undefined, currentStudent.studentName, 'student');
  const presenceList = usePresenceList();
  const liveClasses = useLiveClasses();

  // Identity for Firestore features
  const studentEmail = (currentUser?.email || currentStudent.email || '').toLowerCase();
  const studentName = currentStudent.studentName;
  const assignedTutor = INITIAL_TUTORS.find(t => t.id === currentStudent.tutorId) || INITIAL_TUTORS[0];
  const teacherEmail = (assignedTutor?.email || '').toLowerCase();
  const teacherName = assignedTutor?.name || currentStudent.tutorName;

  // Written homework submit (Firestore) + my history
  const myHomework = useMyHomework(studentEmail || undefined);
  const [hwTitle, setHwTitle] = useState('');
  const [hwText, setHwText] = useState('');
  const [hwSaving, setHwSaving] = useState(false);
  const [hwDone, setHwDone] = useState(false);

  // Messages with teacher
  const unreadCount = useUnreadCount(studentEmail || undefined);
  const thread = useMessageThread(studentEmail || undefined, teacherEmail || undefined);
  const [msgDraft, setMsgDraft] = useState('');
  const [msgSending, setMsgSending] = useState(false);

  // Mark thread read when viewing messages.
  useEffect(() => {
    if (activeTab === 'messages' && studentEmail && teacherEmail && thread.length > 0) {
      markThreadRead(threadIdFor(studentEmail, teacherEmail), studentEmail).catch(() => {});
    }
  }, [activeTab, thread.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // This student's teacher (for live-class matching)
  const myTutor = INITIAL_TUTORS.find(t => t.id === currentStudent.tutorId) || INITIAL_TUTORS[0];
  const myTutorLiveClass = liveClasses.find(c =>
    c.teacherId === currentStudent.tutorId ||
    (myTutor?.email && c.teacherEmail.toLowerCase() === myTutor.email.toLowerCase())
  ) || null;

  // Daily Sabaq & Progress History
  const sampleProgressList: ClassProgressReport[] = [
    {
      id: 'pr-101',
      studentId: currentStudent.id,
      studentName: currentStudent.studentName,
      tutorId: currentStudent.tutorId,
      tutorName: currentStudent.tutorName,
      date: 'August 14, 2026',
      lessonCovered: currentStudent.currentSurahOrLesson,
      pronunciationScore: 9,
      tajweedScore: 9,
      retentionScore: 8,
      attendance: 'Present',
      mistakesAndDifficulties: 'Slight hesitation on heavy letter Qaf and Taa in Ayah 142; practiced 3 times until clear.',
      homework: 'Recite verses 142 to 150 twice at home before next session.',
      nextLessonGoal: 'Surah Al-Baqarah Verses 151 - 160 with focus on Ikhfa rules.',
      tutorRemarks: 'MashaAllah Ayaan showed remarkable breath control and clarity on throat letters today!',
      createdAt: new Date().toISOString()
    },
    {
      id: 'pr-100',
      studentId: currentStudent.id,
      studentName: currentStudent.studentName,
      tutorId: currentStudent.tutorId,
      tutorName: currentStudent.tutorName,
      date: 'August 12, 2026',
      lessonCovered: 'Surah Al-Baqarah (Verses 135 - 141)',
      pronunciationScore: 9,
      tajweedScore: 8,
      retentionScore: 9,
      attendance: 'Present',
      mistakesAndDifficulties: 'Madd Munfasil stretch count was slightly short; corrected to 4 counts.',
      homework: 'Revise Surah Al-Fatiha and verses 135-141.',
      nextLessonGoal: 'Starting Verse 142.',
      tutorRemarks: 'Excellent focus throughout the 30-minute 1-on-1 session.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkNote.trim() && !recordedAudio) return;

    setSavingHomework(true);
    try {
      await saveProgressReportToFirebase({
        studentId: currentStudent.id,
        studentName: currentStudent.studentName,
        tutorId: currentStudent.tutorId,
        tutorName: currentStudent.tutorName,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        lessonCovered: currentStudent.currentSurahOrLesson,
        pronunciationScore: 9,
        tajweedScore: 9,
        retentionScore: 9,
        attendance: 'Present',
        mistakesAndDifficulties: 'Homework Audio Recording Submitted by Student for Teacher Review.',
        homework: homeworkNote || 'Audio recitation submitted.',
        nextLessonGoal: 'Review submitted homework and continue to next verses.',
        tutorRemarks: 'Submission received and queued for tutor grading.'
      });

      setHomeworkSubmitted(true);
      setTimeout(() => {
        setRecordingHomework(false);
        setRecordedAudio(false);
        setHomeworkNote('');
        setHomeworkSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Homework submission error:', err);
    } finally {
      setSavingHomework(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-[#17201B] flex flex-col font-body">
      
      {/* Student Top Header Bar */}
      <div className="bg-[#064E3B] text-white px-4 sm:px-8 py-4 flex flex-wrap justify-between items-center border-b border-[#D4A72C]/40 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/branding/logo.webp?v=2"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/branding/logo.png?v=2'; }}
            alt="Noor E Quran Official Seal"
            className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-2xl bg-white p-1.5 border-2 border-[#D4A72C]/70 shadow-lg shrink-0"
            width="72"
            height="72"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-heading font-bold text-white tracking-wide">
                NOOR E QURAN STUDENT & PARENT LEARNING PORTAL
              </h1>
              <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-600">
                Live Portal
              </span>
            </div>
            <p className="text-xs text-emerald-200">
              Welcome back, {currentStudent.parentName} & {currentStudent.studentName}
            </p>
          </div>
        </div>

        {/* Top Controls: Authenticated Student Profile Badge & Navigation */}
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <div className="flex items-center gap-2 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-700/60 text-xs">
            <span className="text-[#D4A72C] font-semibold">Student Account:</span>
            <span className="text-white font-bold">{currentStudent.studentName}</span>
          </div>

          <button
            onClick={async () => { await logout(); onBackToLanding(); }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 transition-colors cursor-pointer"
          >
            Log Out
          </button>

          <button
            onClick={onBackToLanding}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-900 text-white border border-emerald-700 transition-colors cursor-pointer"
          >
            ← Home
          </button>
        </div>
      </div>

      {/* Portal Tabs Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-2 sticky top-0 z-30 shadow-xs flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: BookOpen },
            { id: 'sabaq', label: 'Daily Sabaq & Progress Book', icon: Certificate },
            { id: 'quran', label: 'Quran Reader', icon: BookOpen },
            { id: 'whiteboard', label: 'Whiteboard', icon: ChalkboardTeacher },
            { id: 'liveclass', label: 'Live Class', icon: VideoCamera },
            { id: 'homework', label: 'Audio Homework & Recorder', icon: Microphone },
            { id: 'messages', label: 'Messages', icon: ChatCircleText, badge: unreadCount },
            { id: 'schedule', label: 'Weekly Timetable', icon: Calendar },
            { id: 'invoices', label: 'Fee Invoices & Receipts', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
                  activeTab === tab.id
                    ? 'bg-[#064E3B] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                <span>{tab.label}</span>
                {!!(tab as any).badge && (tab as any).badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {(tab as any).badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onOpenClassroom(1)}
          className="px-4 py-1.5 rounded-xl bg-[#D4A72C] text-[#064E3B] text-xs font-bold flex items-center gap-1.5 hover:brightness-110 shadow-xs cursor-pointer"
        >
          <VideoCamera className="w-3.5 h-3.5" weight="duotone" />
          <span>Launch Classroom Studio</span>
        </button>
      </div>

      {/* Main Student Portal Content */}
      <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* ============================================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* My Teacher Online presence (only assigned teacher — privacy) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-[#064E3B] mb-1">My Teacher Online</h3>
              <p className="text-xs text-gray-500 mb-4">See if your teacher is available right now.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(() => {
                  const myTutor = getAssignedTutor(currentUser?.email);
                  const tutorsToShow = myTutor ? [myTutor] : [];
                  if (tutorsToShow.length === 0) {
                    return <p className="text-xs text-gray-500 col-span-full">No teacher assigned yet. Please contact the academy.</p>;
                  }
                  return tutorsToShow.map(t => {
                  const entry = presenceList.find(p => p.email.toLowerCase() === t.email.toLowerCase());
                  const online = isOnline(entry);
                  return (
                    <div key={t.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} title={online ? 'Online' : 'Offline'} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#064E3B] truncate">{t.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{t.specialization}</p>
                      </div>
                      <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${online ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-500'}`} title={online ? 'Online now' : lastSeenText(entry)}>
                        {online ? 'Online' : lastSeenText(entry)}
                      </span>
                    </div>
                  );
                  });
                })()}
              </div>
            </div>

            {/* Student Profile Badge */}
            <StudentProfileBadge
              studentName={currentStudent.studentName}
              studentId={currentStudent.id}
              email={currentStudent.email}
              courseName={currentStudent.courseName}
              currentLesson={currentStudent.currentSurahOrLesson}
              tutorName={getAssignedTutor(currentUser?.email)?.name || assignedTutor.name}
              country={currentStudent.country}
              status={currentStudent.status}
              attendanceRate={currentStudent.attendanceRate}
              completedClasses={currentStudent.completedClasses}
              memberSince={currentStudent.createdAt}
            />

            {/* Live Next Class Banner */}
            <div className="bg-gradient-to-r from-[#064E3B] via-[#085a44] to-[#064E3B] text-white p-6 rounded-3xl border-2 border-[#D4A72C]/40 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className="bg-[#D4A72C] text-[#064E3B] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Upcoming 1-on-1 Lesson
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                  {currentStudent.nextClassTime}
                </h2>
                <p className="text-xs text-emerald-100">
                  Course: <strong>{currentStudent.courseName}</strong> • Teacher: <strong>{currentStudent.tutorName}</strong>
                </p>
                <p className="text-xs text-emerald-200">
                  Current Lesson: <span className="text-[#D4A72C] font-semibold">{currentStudent.currentSurahOrLesson}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => onOpenClassroom(2)}
                  className="px-6 py-3 rounded-2xl bg-[#D4A72C] hover:brightness-110 text-[#064E3B] font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  <VideoCamera className="w-5 h-5" weight="duotone" />
                  <span>Join Live Digital Classroom</span>
                </button>

                <a
                  href={currentStudent.assignedTutorDetails.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-600 transition-colors"
                >
                  <WhatsappLogo className="w-4 h-4 text-[#25D366]" weight="fill" />
                  <span>WhatsApp Teacher</span>
                </a>
              </div>
            </div>

            {/* Quick Metrics Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Attendance Rate</span>
                <div className="text-2xl font-bold text-[#064E3B] mt-1 flex items-baseline gap-2">
                  <span>{currentStudent.attendanceRate}%</span>
                  <span className="text-xs font-semibold text-emerald-600">Excellent</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {currentStudent.completedClasses} classes completed
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Package</span>
                <div className="text-base font-bold text-[#064E3B] mt-1 truncate">
                  {currentStudent.packageName}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {currentStudent.preferredDays.join(', ')}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Tajweed Grade</span>
                <div className="text-2xl font-bold text-[#D4A72C] mt-1 flex items-baseline gap-2">
                  <span>A+ (9.2 / 10)</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Verified by Senior Qari
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Monthly Tuition</span>
                <div className="text-xl font-bold text-[#064E3B] mt-1 flex items-baseline justify-between">
                  <span>{currentStudent.feeAmount}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    {currentStudent.feeStatus}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Invoice #{currentStudent.invoiceNumber}
                </p>
              </div>

            </div>

            {/* Assigned Teacher Card & Latest Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Teacher Profile Card (1 Col) */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Assigned Certified Instructor
                </span>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#064E3B] text-[#D4A72C] font-bold text-xl flex items-center justify-center border-2 border-[#D4A72C]/40">
                    {currentStudent.assignedTutorDetails.photoInitials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#064E3B]">
                      {currentStudent.assignedTutorDetails.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {currentStudent.assignedTutorDetails.title}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Timing:</span>
                    <span className="font-semibold text-gray-800">{currentStudent.preferredTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Days:</span>
                    <span className="font-semibold text-gray-800">{currentStudent.preferredDays.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contact:</span>
                    <span className="font-semibold text-gray-800">{currentStudent.assignedTutorDetails.phone}</span>
                  </div>
                </div>

                <a
                  href={currentStudent.assignedTutorDetails.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:brightness-105 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <WhatsappLogo className="w-4 h-4" weight="fill" />
                  <span>Direct Message on WhatsApp</span>
                </a>
              </div>

              {/* Latest Sabaq & Homework Card (2 Cols) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Last Class Evaluation
                    </span>
                    <h3 className="text-lg font-bold text-[#064E3B]">
                      {sampleProgressList[0].date} — Lesson: {sampleProgressList[0].lessonCovered}
                    </h3>
                  </div>
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
                    Status: {sampleProgressList[0].attendance}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Pronunciation</span>
                    <p className="text-lg font-bold text-[#064E3B]">{sampleProgressList[0].pronunciationScore} / 10</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Tajweed Accuracy</span>
                    <p className="text-lg font-bold text-[#064E3B]">{sampleProgressList[0].tajweedScore} / 10</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Retention / Hifz</span>
                    <p className="text-lg font-bold text-[#064E3B]">{sampleProgressList[0].retentionScore} / 10</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                    <p className="font-bold text-amber-900 mb-0.5">📌 Teacher Remarks & Praise:</p>
                    <p className="text-amber-800">{sampleProgressList[0].tutorRemarks}</p>
                  </div>

                  <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200">
                    <p className="font-bold text-blue-900 mb-0.5">📝 Assigned Homework:</p>
                    <p className="text-blue-800">{sampleProgressList[0].homework}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setActiveTab('sabaq')}
                    className="text-[#064E3B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Complete Sabaq Log History</span>
                    <CaretRight className="w-3.5 h-3.5" weight="bold" />
                  </button>

                  <button
                    onClick={() => onOpenClassroom(2)}
                    className="px-4 py-2 rounded-xl bg-[#064E3B] text-white text-xs font-bold hover:bg-emerald-900 cursor-pointer"
                  >
                    Practice Lesson in Studio →
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: DAILY SABAQ & PROGRESS BOOK */}
        {/* ============================================================== */}
        {activeTab === 'sabaq' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h3 className="text-lg font-bold text-[#064E3B] mb-1">
                Student Sabaq Log & Daily Performance Records
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Transparent daily tracking for parents. Every class is evaluated on Pronunciation, Tajweed rules, and homework retention.
              </p>

              {/* Live Video Class History & Attendance Logs */}
              {callLogs.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#064E3B] flex items-center gap-2">
                    <span>📹 Recent 1-on-1 Live Class Logs & Attendance:</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                      {callLogs.length} Classes Recorded
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {callLogs.map(log => (
                      <div key={log.id} className="bg-emerald-50/70 border border-emerald-300/80 rounded-2xl p-4 space-y-2 shadow-xs">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#064E3B]">📅 {log.date}</span>
                          <span className="bg-[#064E3B] text-[#D4A72C] font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                            ⏱️ {log.duration}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 font-semibold">
                          📖 {log.lessonCovered}
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1 border-t border-emerald-200">
                          <span>👩‍🏫 Teacher: <strong>{log.tutorName}</strong></span>
                          <span className="text-emerald-700 font-bold">🟢 Class Completed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {sampleProgressList.map(report => (
                  <div
                    key={report.id}
                    className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-gray-200">
                      <div>
                        <span className="text-xs text-gray-400 font-semibold">{report.date}</span>
                        <h4 className="text-base font-bold text-[#064E3B]">{report.lessonCovered}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                          {report.attendance}
                        </span>
                        <span className="text-xs font-bold text-[#D4A72C] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                          Teacher: {report.tutorName}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-gray-200">
                        <strong className="text-gray-600 block mb-1">Areas Practiced:</strong>
                        <p className="text-gray-800">{report.mistakesAndDifficulties}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200">
                        <strong className="text-blue-700 block mb-1">Assigned Homework:</strong>
                        <p className="text-gray-800">{report.homework}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200">
                        <strong className="text-emerald-700 block mb-1">Next Class Goal:</strong>
                        <p className="text-gray-800">{report.nextLessonGoal}</p>
                      </div>
                    </div>

                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-950">
                      <strong>Teacher Feedback:</strong> {report.tutorRemarks}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: WEEKLY SCHEDULE & TIMETABLE */}
        {/* ============================================================== */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h3 className="text-lg font-bold text-[#064E3B] mb-1">
                Weekly Class Timetable ({currentStudent.preferredTime})
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                Your 1-on-1 sessions are locked with {currentStudent.tutorName}. You can join with 1-click at the scheduled time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                  const isClassDay = currentStudent.preferredDays.includes(day);
                  return (
                    <div
                      key={day}
                      className={`p-5 rounded-2xl border transition-all ${
                        isClassDay
                          ? 'bg-emerald-50/60 border-[#064E3B] shadow-xs'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-bold text-gray-900">{day}</h4>
                        {isClassDay && (
                          <span className="bg-[#064E3B] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Live Class Day
                          </span>
                        )}
                      </div>

                      {isClassDay ? (
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold text-[#064E3B]">
                            ⏰ {currentStudent.preferredTime}
                          </p>
                          <p className="text-gray-600">
                            Instructor: {currentStudent.tutorName}
                          </p>
                          <button
                            onClick={() => onOpenClassroom(1)}
                            className="mt-3 w-full py-2 bg-[#064E3B] text-white rounded-xl text-xs font-bold hover:bg-emerald-900"
                          >
                            Enter Class Room →
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No scheduled class</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AUDIO HOMEWORK & RECORDER */}
        {/* ============================================================== */}
        {activeTab === 'homework' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#064E3B]">
                  Submit Audio Recitation Homework
                </h3>
                <p className="text-xs text-gray-500">
                  Record your recitation directly here so your teacher can review Tajweed rules before the next class.
                </p>
              </div>

              {homeworkSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl text-center space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" weight="fill" />
                  <h4 className="text-base font-bold text-emerald-900">
                    Homework Submitted Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700">
                    {currentStudent.tutorName} has been notified and will send voice notes with corrections shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitHomework} className="space-y-4">
                  
                  {/* Audio Recorder Module */}
                  <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center mx-auto shadow-xs">
                      <Microphone className={`w-8 h-8 ${recordingHomework ? 'text-rose-600 animate-pulse' : ''}`} weight="duotone" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {recordingHomework ? 'Recording in progress (Speaking into mic)...' : recordedAudio ? 'Audio recorded (0:45 mins)' : 'Click below to record your recitation'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Target Lesson: {currentStudent.currentSurahOrLesson}
                      </p>
                    </div>

                    <div className="flex justify-center gap-3">
                      {!recordingHomework && !recordedAudio && (
                        <button
                          type="button"
                          onClick={() => setRecordingHomework(true)}
                          className="px-5 py-2.5 rounded-xl bg-[#064E3B] text-white text-xs font-bold hover:bg-emerald-900 flex items-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Microphone className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                          <span>Start Voice Recording</span>
                        </button>
                      )}

                      {recordingHomework && (
                        <button
                          type="button"
                          onClick={() => {
                            setRecordingHomework(false);
                            setRecordedAudio(true);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 animate-pulse cursor-pointer"
                        >
                          Stop & Save Recording
                        </button>
                      )}

                      {recordedAudio && (
                        <button
                          type="button"
                          onClick={() => setRecordedAudio(false)}
                          className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 cursor-pointer"
                        >
                          Re-record
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Optional Note for Teacher */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Notes / Questions for Teacher:
                    </label>
                    <textarea
                      value={homeworkNote}
                      onChange={(e) => setHomeworkNote(e.target.value)}
                      placeholder="e.g. Please check my Qalqalah in verse 142..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4A72C] outline-hidden text-gray-800 bg-gray-50"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#D4A72C] hover:brightness-110 text-[#064E3B] font-bold text-sm shadow-sm transition-all cursor-pointer"
                  >
                    Submit Homework to {currentStudent.tutorName}
                  </button>

                </form>
              )}
            </div>

            {/* Written homework → teacher review (Firestore) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#064E3B] flex items-center gap-2">
                  <ClipboardText className="w-5 h-5 text-[#D4A72C]" weight="duotone" />
                  Written Homework
                </h3>
                <p className="text-xs text-gray-500">
                  Write your homework here (e.g. Tajweed rule definitions, memorized verses). Your teacher will review and send feedback.
                </p>
              </div>
              {hwDone ? (
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" weight="fill" />
                  <p className="text-sm font-bold text-emerald-900">Submitted! Your teacher will review it soon.</p>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!hwText.trim() || !studentEmail) return;
                    setHwSaving(true);
                    try {
                      await submitHomework({
                        studentEmail,
                        studentName,
                        teacherEmail: teacherEmail || 'maryam.tutor@alnoor.edu',
                        title: hwTitle.trim() || `Homework — ${currentStudent.currentSurahOrLesson}`,
                        textAnswer: hwText.trim()
                      });
                      setHwDone(true);
                      setHwTitle(''); setHwText('');
                      setTimeout(() => setHwDone(false), 4000);
                    } catch {}
                    setHwSaving(false);
                  }}
                  className="space-y-3"
                >
                  <input
                    value={hwTitle}
                    onChange={e => setHwTitle(e.target.value)}
                    placeholder="Homework title (optional)"
                    className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#064E3B]/30"
                  />
                  <textarea
                    value={hwText}
                    onChange={e => setHwText(e.target.value)}
                    placeholder="Write your homework answer here…"
                    rows={5}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#064E3B]/30"
                  />
                  <button
                    type="submit"
                    disabled={hwSaving || !hwText.trim()}
                    className="w-full py-3 rounded-2xl bg-[#064E3B] hover:bg-emerald-900 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {hwSaving ? 'Submitting…' : `Submit Written Homework to ${teacherName}`}
                  </button>
                </form>
              )}

              {/* My submissions + teacher feedback */}
              {myHomework.length > 0 && (
                <div className="pt-2 space-y-3">
                  <h4 className="text-sm font-bold text-[#064E3B]">My Submissions & Teacher Feedback</h4>
                  {myHomework.map(h => (
                    <div key={h.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#064E3B]">{h.title}</p>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${h.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {h.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3">{h.textAnswer}</p>
                      {h.status === 'reviewed' && h.feedback && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                          <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <Checks className="w-3 h-3" weight="bold" /> Teacher Feedback
                          </p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{h.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: FEE INVOICES & RECEIPTS */}
        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* TAB: QURAN READER */}
        {/* ============================================================== */}
        {activeTab === 'quran' && (
          <QuranReader />
        )}

        {/* ============================================================== */}
        {/* TAB: WHITEBOARD */}
        {/* ============================================================== */}
        {activeTab === 'whiteboard' && (
          <Whiteboard
            title="Practice Whiteboard"
            subtitle="Practice writing Arabic letters and Tajweed markings. Your teacher can see your screen during live class."
          />
        )}

        {/* ============================================================== */}
        {/* TAB: MESSAGES */}
        {/* ============================================================== */}
        {activeTab === 'messages' && (
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs max-w-3xl mx-auto">
            <h3 className="text-base font-bold text-[#064E3B] flex items-center gap-2 mb-1">
              <ChatCircleText className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
              Messages with {teacherName}
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">{unreadCount} new</span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mb-4">Ask your teacher about lessons, homework or schedule.</p>
            <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden" style={{ minHeight: 380 }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#F8F5EE]" style={{ maxHeight: 340 }}>
                {thread.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say Salam to your teacher to start.</p>
                ) : thread.map(m => {
                  const mine = m.fromEmail.toLowerCase() === studentEmail;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${mine ? 'bg-[#064E3B] text-white rounded-br-md' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'}`}>
                        <p className="whitespace-pre-wrap">{m.text}</p>
                        <p className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-gray-400'}`}>
                          {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const text = msgDraft.trim();
                  if (!text || !studentEmail || !teacherEmail) return;
                  setMsgSending(true);
                  try {
                    await sendPortalMessage({ fromEmail: studentEmail, fromName: studentName, fromRole: 'student', toEmail: teacherEmail, text });
                    setMsgDraft('');
                  } catch {}
                  setMsgSending(false);
                }}
                className="flex gap-2 p-3 border-t border-gray-200 bg-white"
              >
                <input
                  value={msgDraft}
                  onChange={e => setMsgDraft(e.target.value)}
                  placeholder={`Message ${teacherName}…`}
                  className="flex-1 text-sm border border-gray-300 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#064E3B]/30"
                />
                <button
                  type="submit"
                  disabled={msgSending || !msgDraft.trim()}
                  className="px-4 py-2 bg-[#064E3B] text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <PaperPlaneTilt className="w-3.5 h-3.5" weight="fill" />
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: LIVE CLASS */}
        {/* ============================================================== */}
        {activeTab === 'liveclass' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs max-w-2xl mx-auto space-y-5 text-center">
              <div className="flex items-center justify-center gap-2">
                <VideoCamera className="w-5 h-5 text-[#D4A72C]" weight="duotone" />
                <h3 className="text-lg font-bold text-[#064E3B]">Live Class</h3>
              </div>

              {myTutorLiveClass ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-3xl">
                    <span className="inline-flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      LIVE NOW
                    </span>
                    <p className="text-base font-bold text-[#064E3B]">
                      {myTutorLiveClass.teacherName} is teaching live
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Your class has started — join now!</p>
                  </div>
                  <a
                    href={/^https:\/\/(meet\.jit\.si|8x8\.vc)\//.test(myTutorLiveClass.meetingLink || '') ? myTutorLiveClass.meetingLink : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { if (!/^https:\/\/(meet\.jit\.si|8x8\.vc)\//.test(myTutorLiveClass.meetingLink || '')) { e.preventDefault(); alert('Invalid class link. Please contact your teacher.'); } }}
                    className="block w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md"
                  >
                    Join Live Class
                  </a>
                  <p className="text-[11px] text-gray-400">Opens the video classroom in a new tab</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl">
                    <p className="text-base font-bold text-gray-700">No live class right now</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Your teacher: <strong className="text-[#064E3B]">{currentStudent.tutorName}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      Usual schedule: <strong>{currentStudent.preferredDays.join(', ')}</strong> • {currentStudent.preferredTime}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Next class: <strong className="text-[#D4A72C]">{currentStudent.nextClassTime}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="w-full py-3 rounded-xl bg-[#064E3B] hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer"
                  >
                    View Weekly Timetable
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: FEE INVOICES */}
        {/* ============================================================== */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs max-w-2xl mx-auto space-y-6">
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-[#064E3B]">
                    Monthly Fee Invoice & Receipt
                  </h3>
                  <p className="text-xs text-gray-500">
                    Official payment record for Noor E Quran Institute
                  </p>
                </div>
                <span className="bg-emerald-100 text-emerald-900 font-bold text-xs px-3 py-1 rounded-full border border-emerald-300">
                  Status: {currentStudent.feeStatus}
                </span>
              </div>

              {/* Invoice Printable View */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice Number:</span>
                  <span className="font-mono font-bold text-gray-900">{currentStudent.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Billing Date:</span>
                  <span className="font-semibold text-gray-800">August 1, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-semibold text-gray-800">{currentStudent.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Enrolled Course:</span>
                  <span className="font-semibold text-gray-800">{currentStudent.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan:</span>
                  <span className="font-semibold text-gray-800">{currentStudent.packageName}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 text-sm font-bold text-[#064E3B]">
                  <span>Total Paid:</span>
                  <span>{currentStudent.feeAmount}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => alert(`Downloading official PDF Invoice ${currentStudent.invoiceNumber}...`)}
                  className="px-5 py-2.5 rounded-xl bg-[#064E3B] text-white text-xs font-bold flex items-center gap-2 hover:bg-emerald-900 cursor-pointer"
                >
                  <DownloadSimple className="w-4 h-4 text-[#D4A72C]" weight="bold" />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
