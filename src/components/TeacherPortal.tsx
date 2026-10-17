import React, { useState, useEffect } from 'react';
import {
  Tutor,
  Student,
  ScheduledClass,
  ClassProgressReport
} from '../types';
import { saveProgressReportToFirebase } from '../lib/firestoreService';
import { useAuth } from '../context/AuthContext';
import { QuranReader } from './portal/QuranReader';
import { Whiteboard } from './portal/Whiteboard';
import { usePresence, usePresenceList, isOnline, KNOWN_STUDENTS } from './portal/usePresence';
import { useLiveClasses, startLiveClass, endLiveClass, LiveClass } from './portal/useLiveClasses';
import { useHomeworkSubmissions, reviewHomework, HomeworkSubmission } from './portal/useHomework';
import { markAttendance, useTodayAttendance, AttendanceStatus } from './portal/useAttendance';
import { useMessageThread, useUnreadCount, sendPortalMessage, markThreadRead, threadIdFor } from './portal/useMessages';
import {
  Users,
  Calendar,
  Certificate,
  VideoCamera,
  CheckCircle,
  Clock,
  BookOpen,
  WhatsappLogo,
  FileText,
  FloppyDisk,
  Plus,
  ArrowRight,
  TrendUp,
  ShieldCheck,
  Star,
  GraduationCap,
  Copy,
  PhoneDisconnect,
  Circle,
  ChalkboardTeacher,
  ClipboardText,
  ChatCircleText,
  PaperPlaneTilt,
  Checks
} from '@phosphor-icons/react';

interface TeacherPortalProps {
  onOpenClassroom: (surahNumber?: number) => void;
  onBackToLanding: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  onOpenClassroom,
  onBackToLanding
}) => {
  const { currentUser, userProfile, logout } = useAuth();

  // Tutor switcher
  const [selectedTutorId, setSelectedTutorId] = useState<string>('tut-1');
  const [activeTab, setActiveTab] = useState<'schedule' | 'students' | 'evaluator' | 'profile' | 'quran' | 'liveclass' | 'whiteboard' | 'homework' | 'messages'>('schedule');

  // Evaluation form state
  const [evalStudent, setEvalStudent] = useState<{ id: string; name: string; course: string; currentLesson: string } | null>(null);
  const [evalLesson, setEvalLesson] = useState('Surah Al-Baqarah Verses 142 - 150');
  const [evalPronunciation, setEvalPronunciation] = useState(9);
  const [evalTajweed, setEvalTajweed] = useState(9);
  const [evalRetention, setEvalRetention] = useState(8);
  const [evalAttendance, setEvalAttendance] = useState<'Present' | 'Absent' | 'Late'>('Present');
  const [evalMistakes, setEvalMistakes] = useState('Practiced heavy letter Qaf and Taa with 3 repetitions.');
  const [evalHomework, setEvalHomework] = useState('Recite verses 142 to 150 twice at home before next session.');
  const [evalNextGoal, setEvalNextGoal] = useState('Surah Al-Baqarah Verses 151 - 160 with focus on Ikhfa rules.');
  const [evalRemarks, setEvalRemarks] = useState('MashaAllah showed great improvement in breath control today!');
  const [evalSavedSuccess, setEvalSavedSuccess] = useState(false);

  const sampleTutors = [
    {
      id: 'tut-1',
      name: 'Ustadha Maryam Siddiqa',
      gender: 'Female',
      qualification: 'Ijazah Holder (Al-Azhar University)',
      specialization: 'Tajweed Rules & Noorani Qaida for Kids & Sisters',
      rating: 4.9,
      experienceYears: 7,
      phone: '+92 327 4496163',
      email: 'maryam.s@alnoorquranacademy.com',
      studentsCount: 22,
      todayClasses: [
        { id: 'c-101', time: '5:00 PM', studentName: 'Ayaan Mahmood (Age 8)', studentId: 'stu-301', course: 'Nazra with Tajweed', country: 'United Kingdom', currentLesson: 'Surah Al-Baqarah 142', surahNum: 2 },
        { id: 'c-102', time: '5:45 PM', studentName: 'Hamza Farhan (Age 12)', studentId: 'stu-302', course: 'Quran Memorization / Hifz', country: 'Canada', currentLesson: 'Juz 6 Revision', surahNum: 4 },
        { id: 'c-103', time: '6:30 PM', studentName: 'Fatima Zahra (Age 6)', studentId: 'stu-303', course: 'Noorani Qaida', country: 'USA', currentLesson: 'Lesson 4: Tanween', surahNum: 1 },
        { id: 'c-104', time: '7:15 PM', studentName: 'Dr. Bilal Siddiqui', studentId: 'stu-304', course: 'Adult Tajweed Improvement', country: 'UAE', currentLesson: 'Makharij & Waqf Rules', surahNum: 2 }
      ]
    },
    {
      id: 'tut-2',
      name: 'Qari Tariq Mahmood',
      gender: 'Male',
      qualification: 'Hafiz & Qari (Wifaq-ul-Madaris Certified)',
      specialization: 'Hifz Memorization & Advanced Tajweed',
      rating: 5.0,
      experienceYears: 10,
      phone: '+92 327 4496163',
      email: 'tariq.m@alnoorquranacademy.com',
      studentsCount: 28,
      todayClasses: [
        { id: 'c-201', time: '4:30 PM', studentName: 'Zayd Ali (Age 10)', studentId: 'stu-401', course: 'Hifz Track', country: 'UK', currentLesson: 'Juz 3 Revision', surahNum: 3 },
        { id: 'c-202', time: '5:15 PM', studentName: 'Ibrahim Malik (Age 14)', studentId: 'stu-402', course: 'Tajweed Rules', country: 'Australia', currentLesson: 'Surah Yaseen', surahNum: 36 }
      ]
    }
  ];

  const currentTutor = sampleTutors.find(t => t.id === selectedTutorId) || sampleTutors[0];

  // Online presence: publish teacher online status + watch who is online
  usePresence(currentUser?.email || undefined, currentTutor.name, 'teacher');
  const presenceList = usePresenceList();
  const liveClasses = useLiveClasses();

  // Teacher identity for Firestore features (homework/attendance/messages)
  const teacherEmail = (currentUser?.email || '').toLowerCase();
  const teacherName = currentTutor.name;

  // Homework review (realtime submissions from my students)
  const homeworkSubs = useHomeworkSubmissions(teacherEmail || undefined);
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Attendance (today)
  const todayAttendance = useTodayAttendance();
  const [attSaving, setAttSaving] = useState<string | null>(null);

  // Messages
  const unreadCount = useUnreadCount(teacherEmail || undefined);
  const [msgStudentEmail, setMsgStudentEmail] = useState<string>(KNOWN_STUDENTS[0]?.email || '');
  const msgStudent = KNOWN_STUDENTS.find(s => s.email === msgStudentEmail) || KNOWN_STUDENTS[0];
  const thread = useMessageThread(teacherEmail || undefined, msgStudentEmail || undefined);
  const [msgDraft, setMsgDraft] = useState('');
  const [msgSending, setMsgSending] = useState(false);

  // Mark thread read when viewing messages.
  useEffect(() => {
    if (activeTab === 'messages' && teacherEmail && msgStudentEmail && thread.length > 0) {
      markThreadRead(threadIdFor(teacherEmail, msgStudentEmail), teacherEmail).catch(() => {});
    }
  }, [activeTab, msgStudentEmail, thread.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live class state (this teacher's active session)
  const [myLiveClass, setMyLiveClass] = useState<LiveClass | null>(null);
  const [startingClass, setStartingClass] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // If this teacher already has a live class (e.g. after refresh), pick it up
  React.useEffect(() => {
    const mine = liveClasses.find(c => c.teacherId === currentTutor.id || (currentUser?.email && c.teacherEmail === currentUser.email));
    if (mine && !myLiveClass) setMyLiveClass(mine);
    if (!mine && myLiveClass) setMyLiveClass(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveClasses]);

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentToSave = evalStudent || {
      id: 'stu-301',
      name: 'Ayaan Mahmood',
      course: 'Nazra with Tajweed',
      currentLesson: 'Surah Al-Baqarah 142'
    };

    try {
      await saveProgressReportToFirebase({
        studentId: studentToSave.id,
        studentName: studentToSave.name,
        tutorId: currentTutor.id,
        tutorName: currentTutor.name,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        lessonCovered: evalLesson,
        pronunciationScore: evalPronunciation,
        tajweedScore: evalTajweed,
        retentionScore: evalRetention,
        attendance: evalAttendance,
        mistakesAndDifficulties: evalMistakes,
        homework: evalHomework,
        nextLessonGoal: evalNextGoal,
        tutorRemarks: evalRemarks
      });
    } catch (err) {
      console.error('Error logging report:', err);
    }

    setEvalSavedSuccess(true);
    setTimeout(() => {
      setEvalSavedSuccess(false);
      setEvalStudent(null);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-[#17201B] flex flex-col font-body">
      
      {/* Top Header Bar */}
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
                NOOR E QURAN FACULTY & TUTOR PORTAL
              </h1>
              <span className="bg-emerald-800 text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-600">
                Teacher Dashboard
              </span>
            </div>
            <p className="text-xs text-emerald-200">
              Logged in as: <strong className="text-white">{currentTutor.name}</strong> ({currentTutor.qualification})
            </p>
          </div>
        </div>

        {/* Tutor Switcher & Return */}
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <div className="flex items-center gap-2 bg-emerald-950/70 px-3 py-1.5 rounded-xl border border-emerald-700/60">
            <span className="text-xs text-[#D4A72C] font-semibold">Teacher:</span>
            <select
              value={selectedTutorId}
              onChange={(e) => setSelectedTutorId(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-hidden cursor-pointer"
            >
              {sampleTutors.map(t => (
                <option key={t.id} value={t.id} className="bg-emerald-950 text-white">
                  {t.name} ({t.gender})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => logout()}
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

      {/* Teacher Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-2 sticky top-0 z-30 shadow-xs flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {[
            { id: 'schedule', label: "Today's Live Classes", icon: Calendar },
            { id: 'students', label: 'My Assigned Students', icon: Users },
            { id: 'quran', label: 'Quran Reader', icon: BookOpen },
            { id: 'whiteboard', label: 'Whiteboard', icon: ChalkboardTeacher },
            { id: 'liveclass', label: 'Start Live Class', icon: VideoCamera },
            { id: 'homework', label: 'Homework Review', icon: ClipboardText },
            { id: 'messages', label: 'Messages', icon: ChatCircleText, badge: unreadCount },
            { id: 'evaluator', label: 'Log Sabaq & Daily Evaluation', icon: Certificate },
            { id: 'profile', label: 'Faculty Profile & Timetable', icon: ShieldCheck }
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

      {/* Main Teacher Content Area */}
      <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* ============================================================== */}
        {/* TAB 1: TODAY'S LIVE CLASSES */}
        {/* ============================================================== */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Today's Sessions</span>
                <p className="text-2xl font-bold text-[#064E3B] mt-1">{currentTutor.todayClasses.length} Classes</p>
                <p className="text-[11px] text-emerald-600 mt-1">1-on-1 Individual Sessions</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Students</span>
                <p className="text-2xl font-bold text-[#064E3B] mt-1">{currentTutor.studentsCount} Students</p>
                <p className="text-[11px] text-gray-400 mt-1">UK, USA, Canada, UAE</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Parent Satisfaction</span>
                <p className="text-2xl font-bold text-[#D4A72C] mt-1 flex items-center gap-1">
                  <span>★ {currentTutor.rating}</span>
                  <span className="text-xs text-gray-500 font-normal">/ 5.0</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-1">100% On-Time Start</p>
              </div>
            </div>

            {/* Today's Schedule Cards */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#064E3B]">
                Today's 1-on-1 Teaching Schedule
              </h3>

              <div className="space-y-4">
                {currentTutor.todayClasses.map(cls => (
                  <div
                    key={cls.id}
                    className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#D4A72C] transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-md">
                          ⏰ {cls.time}
                        </span>
                        <span className="text-xs text-gray-500 font-semibold">Country: {cls.country}</span>
                      </div>
                      <h4 className="text-lg font-bold text-[#064E3B]">
                        {cls.studentName} — <span className="text-gray-600 text-sm font-semibold">{cls.course}</span>
                      </h4>
                      <p className="text-xs text-gray-600">
                        Current Lesson: <strong className="text-emerald-900">{cls.currentLesson}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => onOpenClassroom(cls.surahNum)}
                        className="px-5 py-2.5 rounded-xl bg-[#064E3B] text-white text-xs font-bold flex items-center gap-2 hover:bg-emerald-900 shadow-xs cursor-pointer"
                      >
                        <VideoCamera className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                        <span>Start Digital Classroom</span>
                      </button>

                      <button
                        onClick={() => {
                          setEvalStudent({
                            id: cls.studentId,
                            name: cls.studentName,
                            course: cls.course,
                            currentLesson: cls.currentLesson
                          });
                          setActiveTab('evaluator');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#D4A72C] text-[#064E3B] text-xs font-bold hover:brightness-110 shadow-xs cursor-pointer"
                      >
                        Log Sabaq Evaluation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MY ASSIGNED STUDENTS */}
        {/* ============================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Students Online presence */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-[#064E3B] mb-1 flex items-center gap-2">
                <Circle className="w-3 h-3 text-emerald-500" weight="fill" />
                Students Online Now
              </h3>
              <p className="text-xs text-gray-500 mb-4">Live presence — green means the student is online right now.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {KNOWN_STUDENTS.map(s => {
                  const entry = presenceList.find(p => p.email.toLowerCase() === s.email.toLowerCase());
                  const online = isOnline(entry);
                  const att = todayAttendance[s.email.toLowerCase()];
                  const saving = attSaving === s.email;
                  const mark = async (status: AttendanceStatus) => {
                    if (!teacherEmail) return;
                    setAttSaving(s.email);
                    try {
                      await markAttendance({ studentEmail: s.email, studentName: s.name, status, markedBy: teacherEmail });
                    } catch {}
                    setAttSaving(null);
                  };
                  const attBtn = (status: AttendanceStatus, label: string) => (
                    <button
                      key={status}
                      onClick={() => mark(status)}
                      disabled={saving}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                        att === status
                          ? status === 'present' ? 'bg-emerald-600 text-white'
                          : status === 'absent' ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                  return (
                    <div key={s.id} className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} title={online ? 'Online' : 'Offline'} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#064E3B] truncate">{s.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{s.course}</p>
                        </div>
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${online ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-500'}`}>
                          {online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                          Today's Attendance {att ? <span className="text-[#064E3B]">• {att === 'present' ? 'Present' : att === 'absent' ? 'Absent' : 'Leave'}</span> : <span className="text-gray-400">• Not marked</span>}
                        </p>
                        <div className="flex gap-1.5">
                          {attBtn('present', saving ? '…' : 'Present')}
                          {attBtn('absent', saving ? '…' : 'Absent')}
                          {attBtn('leave', saving ? '…' : 'Leave')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-[#064E3B] mb-4">
                Active Student Roster ({currentTutor.studentsCount} Students)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Ayaan Mahmood', age: 8, country: 'United Kingdom', course: 'Nazra with Tajweed', pace: 'Normal', progress: 'Surah Al-Baqarah (Ayah 142)', attendance: '98%' },
                  { name: 'Hamza Farhan', age: 12, country: 'Canada', course: 'Hifz Memorization', pace: 'Fast', progress: 'Juz 6 (Surah An-Nisa)', attendance: '100%' },
                  { name: 'Fatima Zahra', age: 6, country: 'USA', course: 'Noorani Qaida for Kids', pace: 'Slow Learner (Gentle)', progress: 'Lesson 4: Tanween', attendance: '95%' },
                  { name: 'Dr. Bilal Siddiqui (Adult)', age: 34, country: 'UAE', course: 'Adult Tajweed Polish', pace: 'Normal', progress: 'Makharij & Waqf Rules', attendance: '100%' }
                ].map((s, idx) => (
                  <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-[#064E3B]">{s.name}</h4>
                        <p className="text-xs text-gray-500">{s.country} • Age: {s.age}</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-md">
                        {s.pace}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-gray-700 bg-white p-3 rounded-xl border border-gray-200">
                      <p><strong>Course:</strong> {s.course}</p>
                      <p><strong>Current Lesson:</strong> {s.progress}</p>
                      <p><strong>Attendance:</strong> {s.attendance}</p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onOpenClassroom(1)}
                        className="flex-1 py-2 bg-[#064E3B] text-white text-xs font-bold rounded-xl hover:bg-emerald-900 cursor-pointer"
                      >
                        Open Classroom
                      </button>
                      <a
                        href="https://wa.me/923274496163"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-[#25D366] text-white rounded-xl flex items-center justify-center"
                        title="WhatsApp Parent"
                      >
                        <WhatsappLogo className="w-4 h-4" weight="fill" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
            title="Teaching Whiteboard"
            subtitle="Write Arabic letters, circle Makharij mistakes, highlight Tajweed rules during your 1-on-1 class."
          />
        )}

        {/* ============================================================== */}
        {/* TAB: HOMEWORK REVIEW */}
        {/* ============================================================== */}
        {activeTab === 'homework' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <h3 className="text-base font-bold text-[#064E3B] flex items-center gap-2 mb-1">
                <ClipboardText className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                Homework Submissions ({homeworkSubs.length})
              </h3>
              <p className="text-xs text-gray-500 mb-4">Review written homework submitted by your students. Add feedback and mark as reviewed.</p>
              {homeworkSubs.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <ClipboardText className="w-10 h-10 mx-auto mb-2 text-gray-300" weight="duotone" />
                  No homework submissions yet. They will appear here when students submit.
                </div>
              ) : (
                <div className="space-y-4">
                  {homeworkSubs.map(h => (
                    <div key={h.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[#064E3B]">{h.title}</p>
                          <p className="text-[11px] text-gray-500">
                            {h.studentName} ({h.studentEmail}) •
                            {' '}{h.submittedAt?.toDate ? h.submittedAt.toDate().toLocaleString() : 'recently'}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${h.status === 'reviewed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {h.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
                        </span>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {h.textAnswer}
                      </div>
                      {h.status === 'reviewed' && h.feedback ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
                          <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide mb-1">Your Feedback</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{h.feedback}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <textarea
                            value={feedbackDraft[h.id] || ''}
                            onChange={e => setFeedbackDraft(prev => ({ ...prev, [h.id]: e.target.value }))}
                            placeholder="Write feedback for the student… (e.g. MashaAllah, work on the Qalqalah letters)"
                            rows={2}
                            className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#064E3B]/30"
                          />
                          <button
                            onClick={async () => {
                              const fb = (feedbackDraft[h.id] || '').trim();
                              if (!fb) return;
                              setReviewingId(h.id);
                              try { await reviewHomework(h.id, fb); } catch {}
                              setReviewingId(null);
                            }}
                            disabled={reviewingId === h.id}
                            className="px-4 py-2 bg-[#064E3B] text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <Checks className="w-3.5 h-3.5" weight="bold" />
                            {reviewingId === h.id ? 'Saving…' : 'Mark Reviewed with Feedback'}
                          </button>
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
        {/* TAB: MESSAGES */}
        {/* ============================================================== */}
        {activeTab === 'messages' && (
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-[#064E3B] flex items-center gap-2 mb-1">
              <ChatCircleText className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
              Messages with Students
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">{unreadCount} new</span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mb-4">Chat directly with your students about lessons, homework and schedules.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                {KNOWN_STUDENTS.map(s => (
                  <button
                    key={s.email}
                    onClick={() => { setMsgStudentEmail(s.email); setMsgDraft(''); }}
                    className={`w-full text-left p-3 rounded-2xl border transition-colors cursor-pointer ${
                      msgStudentEmail === s.email ? 'bg-[#064E3B] text-white border-[#064E3B]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <p className={`text-sm font-bold ${msgStudentEmail === s.email ? 'text-white' : 'text-[#064E3B]'}`}>{s.name}</p>
                    <p className={`text-[11px] ${msgStudentEmail === s.email ? 'text-white/70' : 'text-gray-500'}`}>{s.course}</p>
                  </button>
                ))}
              </div>
              <div className="md:col-span-2 flex flex-col border border-gray-200 rounded-2xl overflow-hidden" style={{ minHeight: 380 }}>
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5">
                  <p className="text-sm font-bold text-[#064E3B]">{msgStudent?.name}</p>
                  <p className="text-[11px] text-gray-500">{msgStudent?.email}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#F8F5EE]" style={{ maxHeight: 320 }}>
                  {thread.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say Salam to start the conversation.</p>
                  ) : thread.map(m => {
                    const mine = m.fromEmail.toLowerCase() === teacherEmail;
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
                    if (!text || !teacherEmail || !msgStudentEmail) return;
                    setMsgSending(true);
                    try {
                      await sendPortalMessage({ fromEmail: teacherEmail, fromName: teacherName, fromRole: 'teacher', toEmail: msgStudentEmail, text });
                      setMsgDraft('');
                    } catch {}
                    setMsgSending(false);
                  }}
                  className="flex gap-2 p-3 border-t border-gray-200 bg-white"
                >
                  <input
                    value={msgDraft}
                    onChange={e => setMsgDraft(e.target.value)}
                    placeholder={`Message ${msgStudent?.name || 'student'}…`}
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
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: START LIVE CLASS */}
        {/* ============================================================== */}
        {activeTab === 'liveclass' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs max-w-2xl mx-auto space-y-5">
              <div className="flex items-center gap-2">
                <VideoCamera className="w-5 h-5 text-[#D4A72C]" weight="duotone" />
                <h3 className="text-lg font-bold text-[#064E3B]">Live Class Room</h3>
              </div>
              <p className="text-xs text-gray-500">
                Start an instant video class. Students see a <strong>Join Live Class</strong> button in their portal the moment you go live.
              </p>

              {liveError && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-xs font-bold text-red-800">
                  {liveError}
                </div>
              )}

              {!myLiveClass ? (
                <button
                  onClick={async () => {
                    setStartingClass(true);
                    setLiveError(null);
                    try {
                      const created = await startLiveClass(
                        currentTutor.id,
                        currentUser?.email || `${currentTutor.id}@noorequraninstitute.me`,
                        currentTutor.name
                      );
                      setMyLiveClass({
                        id: created.id,
                        teacherId: currentTutor.id,
                        teacherEmail: currentUser?.email || '',
                        teacherName: currentTutor.name,
                        meetingLink: created.meetingLink,
                        startedAt: null,
                        status: 'live'
                      });
                    } catch {
                      setLiveError('Could not start the live class. Please try again.');
                    } finally {
                      setStartingClass(false);
                    }
                  }}
                  disabled={startingClass}
                  className="w-full py-4 rounded-2xl bg-[#064E3B] hover:bg-emerald-900 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <VideoCamera className="w-5 h-5 text-[#D4A72C]" weight="duotone" />
                  <span>{startingClass ? 'Starting...' : 'Start Live Class Now'}</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900">You are LIVE</p>
                      <p className="text-[11px] text-emerald-700 break-all">{myLiveClass.meetingLink}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(myLiveClass.meetingLink);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch {}
                      }}
                      className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#064E3B] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" weight="bold" />
                      <span>{copied ? 'Copied!' : 'Copy Class Link'}</span>
                    </button>
                    <a
                      href={myLiveClass.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 rounded-xl bg-[#D4A72C] text-[#064E3B] text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110"
                    >
                      <VideoCamera className="w-4 h-4" weight="duotone" />
                      <span>Open Classroom</span>
                    </a>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await endLiveClass(myLiveClass.id);
                      } catch {}
                      setMyLiveClass(null);
                    }}
                    className="w-full py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneDisconnect className="w-4 h-4" weight="bold" />
                    <span>End Live Class</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: LOG SABAQ & DAILY EVALUATION */}
        {/* ============================================================== */}
        {activeTab === 'evaluator' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#064E3B]">
                  Daily Sabaq Logger & Student Evaluation
                </h3>
                <p className="text-xs text-gray-500">
                  Directly saved to the academy database and displayed in the Student/Parent portal.
                </p>
              </div>

              {evalSavedSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center text-xs font-bold text-emerald-900 animate-fadeIn">
                  ✓ Evaluation saved successfully! Parents and academy administration have been notified.
                </div>
              )}

              <form onSubmit={handleSaveEvaluation} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Student:</label>
                    <select
                      value={evalStudent?.id || 'stu-301'}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setEvalStudent(sId === 'stu-301' ? { id: 'stu-301', name: 'Ayaan Mahmood', course: 'Nazra with Tajweed', currentLesson: 'Surah Al-Baqarah 142' } : { id: 'stu-302', name: 'Hamza Farhan', course: 'Hifz', currentLesson: 'Juz 6' });
                      }}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
                    >
                      <option value="stu-301">Ayaan Mahmood (Nazra with Tajweed)</option>
                      <option value="stu-302">Hamza Farhan (Hifz Track)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Attendance:</label>
                    <select
                      value={evalAttendance}
                      onChange={(e) => setEvalAttendance(e.target.value as any)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
                    >
                      <option value="Present">Present (On Time)</option>
                      <option value="Late">Late (5-10 mins)</option>
                      <option value="Absent">Absent (Excused)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Today's Lesson Covered (Sabaq):</label>
                  <input
                    type="text"
                    value={evalLesson}
                    onChange={(e) => setEvalLesson(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
                  />
                </div>

                {/* Score Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                  <div>
                    <label className="text-xs font-bold text-[#064E3B] block mb-1">Pronunciation (1-10): {evalPronunciation}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={evalPronunciation}
                      onChange={(e) => setEvalPronunciation(Number(e.target.value))}
                      className="w-full accent-[#064E3B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#064E3B] block mb-1">Tajweed Accuracy (1-10): {evalTajweed}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={evalTajweed}
                      onChange={(e) => setEvalTajweed(Number(e.target.value))}
                      className="w-full accent-[#064E3B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#064E3B] block mb-1">Retention/Hifz (1-10): {evalRetention}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={evalRetention}
                      onChange={(e) => setEvalRetention(Number(e.target.value))}
                      className="w-full accent-[#064E3B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Difficulties & Areas Practiced:</label>
                  <input
                    type="text"
                    value={evalMistakes}
                    onChange={(e) => setEvalMistakes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Assigned Homework for Student:</label>
                  <input
                    type="text"
                    value={evalHomework}
                    onChange={(e) => setEvalHomework(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Next Session Goal:</label>
                  <input
                    type="text"
                    value={evalNextGoal}
                    onChange={(e) => setEvalNextGoal(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Teacher's Note / Feedback to Parents:</label>
                  <textarea
                    value={evalRemarks}
                    onChange={(e) => setEvalRemarks(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#064E3B] hover:bg-emerald-900 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FloppyDisk className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                  <span>Save & Sync to Student / Parent Portal</span>
                </button>

              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: FACULTY PROFILE */}
        {/* ============================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs max-w-2xl mx-auto space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-[#064E3B] text-[#D4A72C] font-bold text-2xl flex items-center justify-center">
                  {currentTutor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#064E3B]">{currentTutor.name}</h3>
                  <p className="text-xs text-gray-500">{currentTutor.qualification}</p>
                  <p className="text-xs text-[#D4A72C] font-semibold mt-0.5">★ {currentTutor.rating} Rating • {currentTutor.experienceYears} Years Experience</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-700">
                <p><strong>Specialization:</strong> {currentTutor.specialization}</p>
                <p><strong>Email:</strong> {currentTutor.email}</p>
                <p><strong>Direct Phone / WhatsApp:</strong> {currentTutor.phone}</p>
                <p><strong>Students Allocated:</strong> {currentTutor.studentsCount} Active Students</p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
