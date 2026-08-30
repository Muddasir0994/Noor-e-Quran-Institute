import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  QURAN_SURAHS,
  QAIDA_ALPHABET,
  QAIDA_LESSONS,
  MASNOON_DUAS,
  SALAH_STEPS,
  SurahData,
  AyahData,
  QaidaLetterItem
} from '../data/quranAndQaidaData';
import { saveProgressReportToFirebase } from '../lib/firestoreService';
import {
  BookOpen,
  SpeakerHigh,
  SpeakerSlash,
  Play,
  Pause,
  ArrowCounterClockwise,
  Pencil,
  Eraser,
  Trash,
  VideoCamera,
  VideoCameraSlash,
  Microphone,
  MicrophoneSlash,
  CheckCircle,
  Certificate,
  CaretRight,
  CaretLeft,
  MagnifyingGlass,
  Gear,
  Stack,
  Heart,
  Question,
  Clock,
  Compass,
  ArrowRight,
  ArrowsOut,
  PhoneDisconnect,
  ShieldCheck,
  Lock,
  User,
  GraduationCap,
  CalendarCheck
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';

interface ClassroomStudioProps {
  onBackToLanding?: () => void;
  onOpenEnroll?: () => void;
  onOpenTrial?: () => void;
  onOpenAuth?: (role?: 'student' | 'teacher', mode?: 'login' | 'signup') => void;
  initialSurahNumber?: number;
  initialMode?: 'quran' | 'qaida' | 'whiteboard' | 'duas' | 'salah';
  portalOrigin?: 'student' | 'teacher' | null;
  onReturnToPortal?: () => void;
}

export const ClassroomStudio: React.FC<ClassroomStudioProps> = ({
  onBackToLanding,
  onOpenEnroll,
  onOpenTrial,
  onOpenAuth,
  initialSurahNumber = 1,
  initialMode = 'whiteboard',
  portalOrigin,
  onReturnToPortal
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [guestPreviewMode, setGuestPreviewMode] = useState<boolean>(false);
  const [classSessionSeconds, setClassSessionSeconds] = useState<number>(0);
  const [isSessionTimerActive, setIsSessionTimerActive] = useState<boolean>(true);

  // Timer counter
  useEffect(() => {
    let timer: any;
    if (isSessionTimerActive) {
      timer = setInterval(() => {
        setClassSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionTimerActive]);

  const formatSessionTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Assigned student & teacher details
  const studentDisplayName = userProfile?.displayName || currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Enrolled Student');
  const assignedTutorName = userProfile?.tutorName || userProfile?.assignedTutorName || 'Ustadha Maryam Siddiqa';
  const assignedCourseName = userProfile?.courseName || 'Quran Recitation with Tajweed';
  const assignedScheduleDays = userProfile?.preferredDays && userProfile.preferredDays.length > 0 ? userProfile.preferredDays.join(', ') : 'Mon, Wed, Fri';
  const assignedScheduleTime = userProfile?.preferredTime || '06:00 PM UK GMT';
  const currentSabaq = userProfile?.currentSurahOrLesson || 'Surah Al-Baqarah (Ayah 142)';

  const { surah } = useParams<{ surah?: string }>();
  const targetSurahNum = surah ? parseInt(surah, 10) : initialSurahNumber;

  // Main Studio Mode: 'quran' | 'qaida' | 'whiteboard' | 'duas' | 'salah'
  const [studioMode, setStudioMode] = useState<'quran' | 'qaida' | 'whiteboard' | 'duas' | 'salah'>(
    surah ? 'quran' : initialMode
  );

  // ------------------------------------------
  // 1. QURAN MUSHAF READER STATE
  // ------------------------------------------
  const [selectedSurahIndex, setSelectedSurahIndex] = useState<number>(() => {
    const idx = QURAN_SURAHS.findIndex(s => s.number === targetSurahNum);
    return idx !== -1 ? idx : 0;
  });

  useEffect(() => {
    if (surah) {
      const idx = QURAN_SURAHS.findIndex(s => s.number === parseInt(surah, 10));
      if (idx !== -1) {
        setSelectedSurahIndex(idx);
        setStudioMode('quran');
      }
    }
  }, [surah]);
  const currentSurah = QURAN_SURAHS[selectedSurahIndex];

  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTajweedColors, setShowTajweedColors] = useState(true);
  const [fontSizeArabic, setFontSizeArabic] = useState<number>(32);
  const [translationLang, setTranslationLang] = useState<'english' | 'urdu' | 'both'>('both');
  const [repeatMode, setRepeatMode] = useState<boolean>(false);
  const [reciter, setReciter] = useState<'alafasy' | 'abdulbasit' | 'husary'>('alafasy');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play specific ayah
  const playAyahAudio = (ayah: AyahData) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    // Determine audio url based on reciter
    let url = ayah.audioUrl;
    if (reciter === 'abdulbasit') {
      const paddedSurah = String(currentSurah.number).padStart(3, '0');
      const paddedAyah = String(ayah.numberInSurah).padStart(3, '0');
      url = `https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/${paddedSurah}${paddedAyah}.mp3`;
    } else if (reciter === 'husary') {
      const paddedSurah = String(currentSurah.number).padStart(3, '0');
      const paddedAyah = String(ayah.numberInSurah).padStart(3, '0');
      url = `https://everyayah.com/data/Husary_128kbps/${paddedSurah}${paddedAyah}.mp3`;
    }

    audioRef.current.src = url;
    audioRef.current.play().then(() => {
      setIsPlayingAudio(true);
      setActiveAyahNumber(ayah.numberInSurah);
    }).catch(err => {
      console.warn('Audio play notice (synthetic preview):', err);
      // Fallback speech synthesis if online streaming is restricted
      playSpeechPhonetic(ayah.arabic);
      setIsPlayingAudio(true);
      setActiveAyahNumber(ayah.numberInSurah);
    });

    audioRef.current.onended = () => {
      if (repeatMode) {
        audioRef.current?.play();
      } else {
        // Auto play next verse
        const nextAyah = currentSurah.ayahs.find(a => a.numberInSurah === ayah.numberInSurah + 1);
        if (nextAyah) {
          playAyahAudio(nextAyah);
        } else {
          setIsPlayingAudio(false);
          setActiveAyahNumber(null);
        }
      }
    };
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setActiveAyahNumber(null);
  };

  // ------------------------------------------
  // 2. NOORANI QAIDA STATE
  // ------------------------------------------
  const [selectedQaidaLessonId, setSelectedQaidaLessonId] = useState<number>(1);
  const [selectedLetterModal, setSelectedLetterModal] = useState<QaidaLetterItem | null>(null);
  const activeQaidaLesson = QAIDA_LESSONS.find(l => l.id === selectedQaidaLessonId) || QAIDA_LESSONS[0];

  // Phonetic Sound Generator for Qaida letters using Web Audio API / Speech
  const playSpeechPhonetic = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ------------------------------------------
  // 3. VIRTUAL CLASSROOM & WHITEBOARD STATE
  // ------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState<string>('#DC2626'); // Red for Tajweed marking
  const [brushSize, setBrushSize] = useState<number>(3);
  const [toolMode, setToolMode] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenShared, setScreenShared] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [classTimer, setClassTimer] = useState<number>(0);
  const [callEnded, setCallEnded] = useState(false);
  const [classNotes, setClassNotes] = useState<string>('Today\'s focus: Practice Qalqalah echo letters in Surah Al-Ikhlas and Al-Falaq. Ensure tongue tip rests firmly.');

  // Live session timer
  useEffect(() => {
    if (callEnded) return;
    const timer = setInterval(() => setClassTimer(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [callEnded]);

  // End Call / Cut Call function & History Logger
  const handleEndCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraOn(false);
    setMicOn(false);
    setScreenShared(false);
    setCallEnded(true);

    // Record Call Duration & Timestamp into History
    const durationMins = Math.floor(classTimer / 60);
    const durationSecs = classTimer % 60;
    const durationText = `${durationMins}m ${durationSecs}s`;
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const callRecord = {
      id: 'call-' + Date.now(),
      date: dateStr,
      time: timeStr,
      duration: durationText,
      durationSeconds: classTimer,
      lessonCovered: currentSurah ? `${currentSurah.name} (Surah ${currentSurah.number})` : 'Quran Recitation & Tajweed Drill',
      tutorName: 'Ustadha Maryam Siddiqa',
      studentName: 'Ayaan Mahmood',
      status: 'Completed',
      notes: classNotes,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('alnoor_call_logs') || '[]');
      localStorage.setItem('alnoor_call_logs', JSON.stringify([callRecord, ...existing]));
    } catch (e) {}

    // Save to Firestore Progress collection
    saveProgressReportToFirebase({
      studentId: 'stu-live',
      studentName: 'Ayaan Mahmood',
      tutorId: 'tut-1',
      tutorName: 'Ustadha Maryam Siddiqa',
      date: `${dateStr} at ${timeStr}`,
      lessonCovered: callRecord.lessonCovered,
      pronunciationScore: 9,
      tajweedScore: 9,
      retentionScore: 9,
      attendance: 'Present',
      mistakesAndDifficulties: `Live 1-on-1 Video Session: ${durationText} on ${dateStr} at ${timeStr}.`,
      homework: classNotes || 'Review lesson verses before next class.',
      nextLessonGoal: 'Continue to subsequent lesson verses.',
      tutorRemarks: `Live class completed. Session duration: ${durationText}.`
    }).catch(err => console.warn('Call history log note:', err));
  };

  const handleRestartCall = () => {
    setCallEnded(false);
    setClassTimer(0);
    setCameraOn(true);
    setMicOn(true);
  };

  // WebRTC Camera & Mic stream initializer
  useEffect(() => {
    let active = true;

    async function initMedia() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError('Webcam not supported on this browser.');
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true
        });

        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (err: any) {
        console.warn('Camera/Mic permission note:', err?.message);
        setCameraError(err?.name === 'NotAllowedError' ? 'Camera/Mic permission needed' : 'Camera device not accessible');
      }
    }

    if (studioMode === 'whiteboard' || studioMode === 'quran') {
      initMedia();
    }

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [studioMode]);

  // Ensure local video element gets stream attached when rendered
  useEffect(() => {
    if (localVideoRef.current && mediaStreamRef.current) {
      localVideoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [studioMode, cameraOn]);

  // Toggle Camera
  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    } else {
      setCameraOn(!cameraOn);
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    } else {
      setMicOn(!micOn);
    }
  };

  // Screen share handler
  const toggleScreenShare = async () => {
    if (!screenShared) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = screenStream;
          }
          setScreenShared(true);
          screenStream.getVideoTracks()[0].onended = () => {
            setScreenShared(false);
          };
        }
      } catch (e) {
        console.warn('Screen share canceled or not permitted');
      }
    } else {
      setScreenShared(false);
    }
  };

  useEffect(() => {
    if (studioMode === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [studioMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (toolMode === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize * 4;
    } else if (toolMode === 'highlighter') {
      ctx.strokeStyle = brushColor === '#DC2626' ? 'rgba(234, 179, 8, 0.4)' : `${brushColor}66`;
      ctx.lineWidth = brushSize * 3;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // ------------------------------------------
  // 4. MASNOON DUAS STATE
  // ------------------------------------------
  const [duaCategory, setDuaCategory] = useState<string>('All');

  // ⚡ Bolt Performance Optimization
  // Memoize filtered duas to prevent recalculating on every render of this large component
  const filteredDuas = useMemo(() => {
    return duaCategory === 'All'
      ? MASNOON_DUAS
      : MASNOON_DUAS.filter(d => d.category === duaCategory);
  }, [duaCategory]);

  // ------------------------------------------
  // 5. SALAH GUIDE STATE
  // ------------------------------------------
  // 5. SALAH GUIDE STATE
  // ------------------------------------------
  const [activeSalahStep, setActiveSalahStep] = useState<number>(1);
  const currentSalahStep = SALAH_STEPS.find(s => s.stepNumber === activeSalahStep) || SALAH_STEPS[0];

  // If user is not authenticated and hasn't selected guest demo mode, show Gateway
  if (!currentUser && !guestPreviewMode) {
    return (
      <div className="min-h-screen bg-[#07221E] text-[#F8F5EE] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-2xl bg-[#FCFBF8] text-[#0B332D] border border-[#B79A62]/30 rounded-sm shadow-2xl overflow-hidden flex flex-col">
          
          {/* Gateway Header */}
          <div className="px-6 py-6 bg-[#0B332D] text-[#F8F5EE] border-b border-[#B79A62]/30 text-center space-y-2">
            <div className="w-12 h-12 rounded-sm border border-[#B79A62]/40 bg-[#07221E] flex items-center justify-center text-[#B79A62] mx-auto shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#B79A62]">
              NOOR E QURAN INSTITUTE • PRIVATE DIGITAL CLASSROOM
            </p>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#F8F5EE] font-bold">
              Authenticated Classroom Access
            </h2>
            <p className="text-xs text-[#E8E0D1]/80 max-w-md mx-auto leading-relaxed">
              Live 1-on-1 private lessons are strictly conducted in private rooms between verified students and their assigned scholars.
            </p>
          </div>

          {/* Auth Cards */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Student Login */}
              <div className="p-5 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm flex flex-col justify-between space-y-4 hover:border-[#B79A62] transition-colors">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-sm bg-[#0B332D] text-[#B79A62] flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-[#0B332D]">Student & Parent Portal</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Join your assigned teacher's live room, access your active Sabaq, and open the interactive Mushaf.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('student', 'login') : window.location.href = '/login'}
                  className="w-full py-2.5 bg-[#0B332D] text-[#F8F5EE] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] transition-colors cursor-pointer"
                >
                  Sign In as Student
                </button>
              </div>

              {/* Card 2: Teacher Login */}
              <div className="p-5 bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm flex flex-col justify-between space-y-4 hover:border-[#B79A62] transition-colors">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-sm bg-[#0B332D] text-[#B79A62] flex items-center justify-center">
                    <Certificate className="w-4 h-4" />
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-[#0B332D]">Faculty & Tutor Portal</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Open your active timetable roster, start student sessions, mark attendance, and evaluate recitation.
                  </p>
                </div>
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('teacher', 'login') : window.location.href = '/login'}
                  className="w-full py-2.5 bg-[#B79A62] text-[#07221E] text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-[#C5AA73] transition-colors cursor-pointer"
                >
                  Sign In as Teacher
                </button>
              </div>

            </div>

            {/* Bottom Actions: Demo Mode & Home */}
            <div className="pt-4 border-t border-[#E8E0D1] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                onClick={() => setGuestPreviewMode(true)}
                className="text-[#0B332D] font-semibold hover:text-[#B79A62] flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Interactive Studio Tools (Guest Preview)</span>
              </button>

              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className="text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  ← Return to Homepage
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-[#17201B] flex flex-col font-body">
      
      {/* Studio Header Bar */}
      <div className="bg-[#0B332D] text-white px-4 sm:px-8 py-3.5 flex flex-wrap justify-between items-center border-b border-[#B79A62]/40 shadow-sm">
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
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-editorial font-bold text-[#F8F5EE] tracking-wide">
                NOOR E QURAN DIGITAL QURAN STUDIO &amp; CLASSROOM
              </h1>
              <span className="bg-[#B79A62] text-[#07221E] text-[10px] font-extrabold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                {currentUser ? 'Live Active Session' : 'Demo Lab Mode'}
              </span>
            </div>
            <p className="text-xs text-emerald-200 font-arabic">
              مكتبة التلاوة والتجويد والدروس المباشرة التفاعلية
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {onReturnToPortal && (
            <button
              onClick={onReturnToPortal}
              className="px-4 py-2 rounded-xs text-xs font-bold bg-[#B79A62] hover:brightness-110 text-[#07221E] shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>←</span>
              <span>Return to {portalOrigin === 'teacher' ? 'Teacher Portal' : 'Student Portal'}</span>
            </button>
          )}

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-3.5 py-2 rounded-xs text-xs font-semibold bg-[#07221E] hover:bg-black/50 text-[#F8F5EE] border border-[#B79A62]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>←</span>
              <span>Home</span>
            </button>
          )}

          {onOpenTrial && !currentUser && (
            <button
              onClick={onOpenTrial}
              className="px-3.5 py-2 rounded-xs text-xs font-bold bg-[#B79A62] hover:brightness-110 text-[#07221E] shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              Book 1-on-1 Trial
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Class Session Ribbon (Showing Assigned Student, Teacher, Timetable & Sabaq) */}
      <div className="bg-[#07221E] text-[#E8E0D1] px-4 sm:px-8 py-2.5 border-b border-[#B79A62]/20 font-sans text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[#F8F5EE] font-bold">Room: CLS-{(currentUser?.uid || 'DEMO').slice(0, 6).toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#B79A62] font-semibold">Student:</span>
            <span className="text-white font-bold">{studentDisplayName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#B79A62] font-semibold">Assigned Scholar:</span>
            <span className="text-white font-bold">{assignedTutorName}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-[#B79A62] font-semibold">Timetable:</span>
            <span className="text-emerald-200">{assignedScheduleDays} @ {assignedScheduleTime}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-[#B79A62] font-semibold">Course &amp; Sabaq:</span>
            <span className="text-[#F8F5EE]">{assignedCourseName} ({currentSabaq})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0B332D] border border-[#B79A62]/30 px-2.5 py-1 rounded-xs">
            <Clock className="w-3.5 h-3.5 text-[#B79A62]" />
            <span className="text-[#F8F5EE] font-bold font-mono">{formatSessionTime(classSessionSeconds)} / 30:00</span>
          </div>

          <button
            onClick={() => setIsSessionTimerActive(!isSessionTimerActive)}
            className="text-[11px] text-[#B79A62] hover:underline cursor-pointer"
          >
            {isSessionTimerActive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Studio Sub-Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-2 sticky top-0 z-30 shadow-xs flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => { stopAudio(); setStudioMode('quran'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              studioMode === 'quran'
                ? 'bg-[#064E3B] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
            <span>Holy Quran Mushaf & Reciter</span>
          </button>

          <button
            onClick={() => { stopAudio(); setStudioMode('qaida'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              studioMode === 'qaida'
                ? 'bg-[#064E3B] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Certificate className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
            <span>Interactive Noorani Qaida & Makharij</span>
          </button>

          <button
            onClick={() => { stopAudio(); setStudioMode('whiteboard'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              studioMode === 'whiteboard'
                ? 'bg-[#064E3B] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Pencil className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
            <span>1-on-1 Live Class & Whiteboard</span>
          </button>

          <button
            onClick={() => { stopAudio(); setStudioMode('duas'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              studioMode === 'duas'
                ? 'bg-[#064E3B] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
            <span>40 Masnoon Duas</span>
          </button>

          <button
            onClick={() => { stopAudio(); setStudioMode('salah'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              studioMode === 'salah'
                ? 'bg-[#064E3B] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Compass className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
            <span>Step-by-Step Salah (Namaz)</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Server Audio CDN: Active
          </span>
        </div>
      </div>

      {/* Main Studio Working Canvas Area */}
      <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        
        {/* ============================================================== */}
        {/* VIEW 1: HOLY QURAN MUSHAF READER & AUDIO RECITER */}
        {/* ============================================================== */}
        {studioMode === 'quran' && (
          <div className="space-y-6">
            
            {/* Control & Surah Selection Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
              
              {/* Surah Picker */}
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Select Surah:
                </label>
                <select
                  value={selectedSurahIndex}
                  onChange={(e) => {
                    stopAudio();
                    setSelectedSurahIndex(Number(e.target.value));
                  }}
                  className="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold text-[#064E3B] focus:ring-2 focus:ring-[#D4A72C] outline-hidden cursor-pointer"
                >
                  {QURAN_SURAHS.map((s, idx) => (
                    <option key={s.number} value={idx}>
                      {s.number}. {s.name} ({s.arabicName}) - {s.numberOfAyahs} Ayahs
                    </option>
                  ))}
                </select>

                {/* Reciter Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Reciter:</span>
                  <select
                    value={reciter}
                    onChange={(e) => setReciter(e.target.value as any)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-hidden cursor-pointer"
                  >
                    <option value="alafasy">Mishary Rashid Alafasy</option>
                    <option value="abdulbasit">Abdul Basit (Mujawwad)</option>
                    <option value="husary">Mahmoud Khalil Al-Husary</option>
                  </select>
                </div>
              </div>

              {/* Display & Playback Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                
                {/* Font Size Selector */}
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setFontSizeArabic(Math.max(22, fontSizeArabic - 4))}
                    className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-white rounded-lg cursor-pointer"
                    title="Smaller Arabic font"
                  >
                    A-
                  </button>
                  <span className="text-xs px-2 font-mono text-gray-700">{fontSizeArabic}px</span>
                  <button
                    onClick={() => setFontSizeArabic(Math.min(48, fontSizeArabic + 4))}
                    className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-white rounded-lg cursor-pointer"
                    title="Larger Arabic font"
                  >
                    A+
                  </button>
                </div>

                {/* Tajweed Highlights Toggle */}
                <button
                  onClick={() => setShowTajweedColors(!showTajweedColors)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showTajweedColors
                      ? 'bg-emerald-100 text-[#064E3B] border border-emerald-300'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4A72C]" weight="duotone" />
                  <span>Tajweed Colors</span>
                </button>

                {/* Translation Language */}
                <select
                  value={translationLang}
                  onChange={(e) => setTranslationLang(e.target.value as any)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-hidden cursor-pointer"
                >
                  <option value="both">English + Urdu</option>
                  <option value="english">English Only</option>
                  <option value="urdu">Urdu Only</option>
                </select>

                {/* Repeat Loop Toggle */}
                <button
                  onClick={() => setRepeatMode(!repeatMode)}
                  className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    repeatMode ? 'bg-[#D4A72C] text-[#064E3B]' : 'bg-gray-100 text-gray-600'
                  }`}
                  title="Repeat single ayah indefinitely for Hifz memorization"
                >
                  <ArrowCounterClockwise className="w-4 h-4" weight="bold" />
                </button>

                {/* Stop audio button */}
                {isPlayingAudio && (
                  <button
                    onClick={stopAudio}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white flex items-center gap-1 animate-pulse cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" weight="fill" />
                    <span>Stop</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tajweed Color Legend (Interactive) */}
            {showTajweedColors && (
              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl flex flex-wrap items-center justify-between text-xs gap-3">
                <span className="font-bold text-[#064E3B] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4A72C]"></span>
                  Tajweed Color Code:
                </span>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                    <strong className="text-emerald-900">Ghunnah (غنة)</strong>: 2 counts nasal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"></span>
                    <strong className="text-teal-900">Ikhfa (إخفاء)</strong>: Light concealment
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
                    <strong className="text-rose-900">Qalqalah (قلقلة)</strong>: Echo bounce (ق ط ب ج د)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
                    <strong className="text-purple-900">Madd (مد)</strong>: Stretch 4-6 counts
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-amber-600 inline-block"></span>
                    <strong className="text-amber-900">Heavy Letter (تفخيم)</strong>: Full mouth
                  </span>
                </div>
              </div>
            )}

            {/* Surah Header Ornament */}
            <div className="bg-gradient-to-r from-[#064E3B] via-[#043d2e] to-[#064E3B] text-white p-6 rounded-3xl text-center border-2 border-[#D4A72C]/50 shadow-md relative overflow-hidden">
              <div className="absolute top-2 left-4 text-emerald-200/20 text-5xl font-arabic pointer-events-none">
                ﷽
              </div>
              <div className="absolute bottom-2 right-4 text-emerald-200/20 text-5xl font-arabic pointer-events-none">
                ۞
              </div>

              <span className="text-[#D4A72C] text-xs font-extrabold uppercase tracking-widest bg-emerald-950/60 px-3 py-1 rounded-full inline-block border border-[#D4A72C]/30 mb-2">
                Surah #{currentSurah.number} • {currentSurah.revelationType} Revelation • {currentSurah.numberOfAyahs} Verses
              </span>
              <h2 className="text-3xl sm:text-4xl font-arabic font-bold text-white mb-1">
                {currentSurah.arabicName}
              </h2>
              <p className="text-sm font-semibold text-emerald-100">
                {currentSurah.name} ({currentSurah.englishNameTranslation})
              </p>

              {currentSurah.number !== 9 && (
                <div className="mt-4 pt-4 border-t border-emerald-700/50">
                  <p className="font-arabic text-2xl sm:text-3xl text-[#D4A72C] tracking-wide">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              )}
            </div>

            {/* Ayah List Grid */}
            <div className="space-y-4">
              {currentSurah.ayahs.map((ayah) => {
                const isActive = activeAyahNumber === ayah.numberInSurah;
                return (
                  <div
                    key={ayah.numberInSurah}
                    id={`ayah-card-${ayah.numberInSurah}`}
                    className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                      isActive
                        ? 'border-[#D4A72C] shadow-lg ring-2 ring-[#D4A72C]/30 bg-amber-50/20'
                        : 'border-gray-200 hover:border-emerald-300 shadow-xs'
                    }`}
                  >
                    {/* Ayah Action Row */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-emerald-100 text-[#064E3B] font-bold text-xs flex items-center justify-center border border-emerald-300">
                          {currentSurah.number}:{ayah.numberInSurah}
                        </span>

                        <button
                          onClick={() => {
                            if (isActive && isPlayingAudio) {
                              stopAudio();
                            } else {
                              playAyahAudio(ayah);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            isActive && isPlayingAudio
                              ? 'bg-rose-600 text-white'
                              : 'bg-[#064E3B] text-white hover:bg-emerald-900'
                          }`}
                        >
                          {isActive && isPlayingAudio ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>Playing...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-[#D4A72C]" />
                              <span>Recite Ayah</span>
                            </>
                          )}
                        </button>
                      </div>

                      {ayah.tajweedNotes && (
                        <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium hidden sm:inline-block">
                          📖 Tajweed Note: {ayah.tajweedNotes}
                        </span>
                      )}
                    </div>

                    {/* Arabic Text Display */}
                    <div className="text-right my-4" dir="rtl">
                      <p
                        style={{ fontSize: `${fontSizeArabic}px`, lineHeight: 1.9 }}
                        className="font-arabic font-medium text-gray-900 selection:bg-[#D4A72C]/40"
                      >
                        {ayah.arabic}
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#D4A72C] text-[#064E3B] text-xs font-bold mr-2 text-center align-middle font-sans bg-amber-50">
                          {ayah.numberInSurah}
                        </span>
                      </p>
                    </div>

                    {/* Transliteration */}
                    <div className="mb-3 pt-2 text-xs font-medium text-gray-500 italic">
                      Transliteration: {ayah.transliteration}
                    </div>

                    {/* Translations */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      {(translationLang === 'both' || translationLang === 'english') && (
                        <p className="text-sm text-gray-800 leading-relaxed font-normal">
                          <strong className="text-gray-500 text-xs mr-2 font-semibold">EN:</strong>
                          {ayah.english}
                        </p>
                      )}

                      {(translationLang === 'both' || translationLang === 'urdu') && (
                        <p className="text-base sm:text-lg font-urdu text-emerald-950 text-right leading-loose font-normal mt-1" dir="rtl">
                          <strong className="text-gray-400 text-xs ml-2 font-sans">اردو:</strong>
                          {ayah.urdu}
                        </p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: INTERACTIVE NOORANI QAIDA & MAKHARIJ LAB */}
        {/* ============================================================== */}
        {studioMode === 'qaida' && (
          <div className="space-y-6">
            
            {/* Lesson Navigation Selector */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#064E3B]">
                  Noorani Qaida Soundboard & Makharij Lab
                </h3>
                <p className="text-xs text-gray-500">
                  Click any letter, joint shape, or vowel to hear crystal-clear pronunciation with anatomical articulation points.
                </p>
              </div>

              {/* Lesson Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {QAIDA_LESSONS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedQaidaLessonId(l.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedQaidaLessonId === l.id
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Lesson {l.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Lesson Header */}
            <div className="bg-emerald-900 text-white p-5 rounded-3xl border border-[#D4A72C]/40 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-[#D4A72C] text-xs font-bold uppercase tracking-wider">
                  {activeQaidaLesson.category} Drill
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-white mt-0.5">
                  {activeQaidaLesson.title}
                </h2>
                <p className="text-xs text-emerald-200 mt-1 max-w-2xl">
                  {activeQaidaLesson.description}
                </p>
              </div>
              <div className="font-arabic text-3xl sm:text-4xl text-[#D4A72C] font-bold text-right" dir="rtl">
                {activeQaidaLesson.arabicTitle}
              </div>
            </div>

            {/* Interactive Qaida Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {activeQaidaLesson.items.map((item) => {
                const isAlphabet = activeQaidaLesson.id === 1;
                const letterMeta = isAlphabet ? QAIDA_ALPHABET.find(a => a.id === item.id) : null;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playSpeechPhonetic(item.arabic);
                      if (letterMeta) setSelectedLetterModal(letterMeta);
                    }}
                    className="group bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border-2 border-gray-200 hover:border-[#D4A72C] transition-all cursor-pointer shadow-xs hover:shadow-md text-center flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>{item.rule || 'Letter'}</span>
                      <SpeakerHigh className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#D4A72C] transition-colors" weight="duotone" />
                    </div>

                    {/* Big Arabic Letter display */}
                    <div className="my-3 py-2">
                      <span className="font-arabic text-4xl sm:text-5xl font-bold text-gray-900 group-hover:text-[#064E3B] transition-colors">
                        {item.arabic}
                      </span>
                    </div>

                    {/* Subtitle & phonetic guide */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-bold text-[#064E3B]">
                        {item.text || item.id}
                      </p>
                      {item.subText && (
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {item.subText}
                        </p>
                      )}
                    </div>

                    {letterMeta && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLetterModal(letterMeta);
                        }}
                        className="mt-2 text-[10px] font-semibold text-[#D4A72C] hover:underline cursor-pointer"
                      >
                        View Makhraj Details →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Letter Makhraj Modal Breakdown */}
            {selectedLetterModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#D4A72C]/40 animate-scaleIn">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="w-12 h-12 rounded-2xl bg-[#064E3B] text-[#D4A72C] text-3xl font-arabic font-bold flex items-center justify-center">
                        {selectedLetterModal.arabic}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-[#064E3B]">
                          Letter {selectedLetterModal.name} ({selectedLetterModal.transliteration})
                        </h3>
                        <span className="text-xs font-semibold text-[#D4A72C] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {selectedLetterModal.soundType}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedLetterModal(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 my-5">
                    <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#064E3B] mb-1">
                        Makhraj Origin Area:
                      </h4>
                      <p className="text-sm font-bold text-emerald-950">
                        {selectedLetterModal.makhraj}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                        Exact Articulation Rule:
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                        {selectedLetterModal.makhrajDetail}
                      </p>
                    </div>

                    <div className="flex items-center justify-between bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
                      <div>
                        <p className="text-xs font-bold text-amber-900">Audio Pronunciation Check</p>
                        <p className="text-[11px] text-amber-700">Listen to the correct Arabic pitch</p>
                      </div>
                      <button
                        onClick={() => playSpeechPhonetic(selectedLetterModal.arabic)}
                        className="px-4 py-2 bg-[#064E3B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-emerald-900 cursor-pointer"
                      >
                        <SpeakerHigh className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                        <span>Play Sound</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={() => setSelectedLetterModal(null)}
                      className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold cursor-pointer"
                    >
                      Close Makhraj Guide
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: 1-ON-1 LIVE CLASSROOM & WHITEBOARD SIMULATOR */}
        {/* ============================================================== */}
        {studioMode === 'whiteboard' && (
          <div className="space-y-6">
            
            {/* Top Class Session Status */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <div>
                  <h3 className="text-sm font-bold text-[#064E3B] flex items-center gap-2">
                    Live 1-on-1 Quran Lesson Room
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Connected (Audio/Video HD)
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tutor: <strong className="text-gray-700">Ustadha Maryam Siddiqa</strong> | Student: <strong className="text-gray-700">Ayaan Mahmood</strong> | Course: <strong className="text-gray-700">Nazra with Tajweed</strong>
                  </p>
                </div>
              </div>

              {/* Video Call Controls */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#064E3B] border border-emerald-200 text-xs font-bold font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#D4A72C]" weight="duotone" />
                  <span>{Math.floor(classTimer / 60).toString().padStart(2, '0')}:{(classTimer % 60).toString().padStart(2, '0')}</span>
                </div>

                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    micOn ? 'bg-emerald-100 text-[#064E3B]' : 'bg-rose-100 text-rose-700'
                  }`}
                  title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {micOn ? <Microphone className="w-4 h-4" weight="duotone" /> : <MicrophoneSlash className="w-4 h-4" weight="duotone" />}
                </button>

                <button
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    cameraOn ? 'bg-emerald-100 text-[#064E3B]' : 'bg-rose-100 text-rose-700'
                  }`}
                  title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                  {cameraOn ? <VideoCamera className="w-4 h-4" weight="duotone" /> : <VideoCameraSlash className="w-4 h-4" weight="duotone" />}
                </button>

                <button
                  onClick={toggleScreenShare}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    screenShared ? 'bg-[#D4A72C] text-[#064E3B]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ArrowsOut className="w-3.5 h-3.5" weight="bold" />
                  <span>{screenShared ? 'Stop Sharing' : 'Share Screen'}</span>
                </button>

                {/* End Class Button */}
                <button
                  onClick={handleEndCall}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ml-1"
                  title="End Live Class & Save Record"
                >
                  <PhoneDisconnect className="w-4 h-4" weight="duotone" />
                  <span>End Class</span>
                </button>
              </div>
            </div>

            {/* Video + Whiteboard Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              {/* Left Column: Live Feeds & Notes */}
              <div className="space-y-4 lg:col-span-1">
                
                {/* Live Student / Teacher Local Video Box */}
                <div className="bg-gray-900 rounded-2xl overflow-hidden relative aspect-video border border-gray-800 shadow-md flex flex-col justify-between p-3">
                  {cameraOn && !cameraError ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : null}

                  <div className="relative z-10 flex justify-between items-center text-[10px] text-white/90">
                    <span className="bg-black/70 px-2 py-0.5 rounded-full font-bold">Your Live Cam</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${cameraOn && !cameraError ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {cameraOn && !cameraError ? '● Active HD' : '● Cam Off'}
                    </span>
                  </div>

                  {(!cameraOn || cameraError) && (
                    <div className="relative z-10 text-center py-4">
                      <div className="w-12 h-12 bg-emerald-800 text-[#D4A72C] rounded-full mx-auto flex items-center justify-center font-bold text-lg border-2 border-emerald-600">
                        HD
                      </div>
                      <p className="text-xs font-semibold text-white mt-1">Camera Standby</p>
                      {cameraError && <p className="text-[10px] text-amber-300 max-w-[160px] mx-auto">{cameraError}</p>}
                    </div>
                  )}

                  <div className="relative z-10 flex justify-between text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-md">
                    <span>Mic: {micOn ? '● Unmuted' : '● Muted'}</span>
                    <span>1-on-1 Secure Room</span>
                  </div>
                </div>

                {/* Remote Participant Feeds Box */}
                <div className="bg-gray-900 rounded-2xl overflow-hidden relative aspect-video border border-gray-800 shadow-md flex flex-col justify-between p-3">
                  <div className="flex justify-between items-center text-[10px] text-white/90">
                    <span className="bg-black/70 px-2 py-0.5 rounded-full font-bold">Remote Classroom Feed</span>
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">● Connected</span>
                  </div>
                  <div className="text-center py-2">
                    <div className="w-12 h-12 bg-amber-800 text-white rounded-full mx-auto flex items-center justify-center font-bold text-lg border-2 border-amber-500">
                      📖
                    </div>
                    <p className="text-xs font-bold text-white mt-1">Live Quran Studio</p>
                    <p className="text-[10px] text-emerald-300">Synchronized Tajweed Board</p>
                  </div>
                  <div className="flex justify-between text-[10px] text-white/80 bg-black/60 px-2 py-0.5 rounded-md">
                    <span>100% Private</span>
                    <span>HD 60FPS</span>
                  </div>
                </div>

                {/* In-Class Notes Box */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#064E3B] mb-2 flex items-center gap-1.5">
                    <span>Teacher Sabaq Notes:</span>
                  </h4>
                  <textarea
                    value={classNotes}
                    onChange={(e) => setClassNotes(e.target.value)}
                    rows={4}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D4A72C] outline-hidden text-gray-700 bg-gray-50 resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Auto-synced to Student & Parent Portal after class.
                  </p>
                </div>

              </div>

              {/* Right Column: Interactive Quran Whiteboard Canvas (3 Cols) */}
              <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-200 p-4 shadow-sm flex flex-col space-y-3">
                
                {/* Whiteboard Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setToolMode('pen')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        toolMode === 'pen' ? 'bg-[#064E3B] text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" weight="duotone" />
                      <span>Pen</span>
                    </button>

                    <button
                      onClick={() => setToolMode('highlighter')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        toolMode === 'highlighter' ? 'bg-[#D4A72C] text-[#064E3B]' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" weight="duotone" />
                      <span>Tajweed Highlighter</span>
                    </button>

                    <button
                      onClick={() => setToolMode('eraser')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        toolMode === 'eraser' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Eraser className="w-3.5 h-3.5" weight="duotone" />
                      <span>Eraser</span>
                    </button>
                  </div>

                  {/* Color Palette */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium">Color:</span>
                    {[
                      { hex: '#DC2626', label: 'Qalqalah / Error Red' },
                      { hex: '#059669', label: 'Ghunnah Green' },
                      { hex: '#0284C7', label: 'Idgham Azure' },
                      { hex: '#9333EA', label: 'Madd Purple' },
                      { hex: '#D4A72C', label: 'Noor-e-Quran Gold' }
                    ].map(c => (
                      <button
                        key={c.hex}
                        onClick={() => { setBrushColor(c.hex); setToolMode('pen'); }}
                        style={{ backgroundColor: c.hex }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          brushColor === c.hex ? 'scale-125 border-gray-900 ring-2 ring-gray-300' : 'border-white'
                        }`}
                        title={c.label}
                      />
                    ))}

                    <div className="h-5 w-px bg-gray-200 mx-1"></div>

                    <button
                      onClick={clearCanvas}
                      className="p-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                      title="Clear Whiteboard"
                    >
                      <Trash className="w-3.5 h-3.5" weight="duotone" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Quran Text Background with Overlay Canvas */}
                <div className="relative rounded-2xl border-2 border-dashed border-gray-300 bg-amber-50/20 overflow-hidden min-h-[380px] flex items-center justify-center p-6 select-none">
                  
                  {/* Underlay: Active Quran Lesson being corrected */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-center text-center pointer-events-none opacity-85" dir="rtl">
                    <p className="text-xs font-bold text-gray-400 mb-2 font-sans">
                      [Surah Al-Fatiha • Interactive Correction Canvas]
                    </p>
                    <p className="font-arabic text-3xl sm:text-4xl text-gray-900 leading-loose">
                      صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ
                    </p>
                    <p className="text-xs text-gray-500 font-sans mt-3" dir="ltr">
                      Tip for teacher: Draw circles on Makharij mistakes or highlight heavy letters in real-time.
                    </p>
                  </div>

                  {/* HTML5 Canvas overlay for live drawing */}
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="relative z-10 cursor-crosshair w-full h-[380px]"
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                  <span>✨ Teacher & student can annotate directly over Arabic verses.</span>
                  <span className="text-emerald-700 font-semibold">Latency: ~24ms (Ultra-HD Sync)</span>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: 40 MASNOON DUAS */}
        {/* ============================================================== */}
        {studioMode === 'duas' && (
          <div className="space-y-6">
            
            {/* Category Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[#064E3B]">
                  Daily Masnoon Duas & Prophetic Supplications
                </h3>
                <p className="text-xs text-gray-500">
                  Authentic prayers from Sahih Hadith & Quran for daily Islamic life.
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {['All', 'Knowledge & Salah', 'Daily Routine', 'Morning & Evening', 'Protection & Forgiveness'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setDuaCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      duaCategory === cat
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Duas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDuas.map((dua) => (
                <div
                  key={dua.id}
                  className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs hover:border-[#D4A72C] transition-all space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#064E3B] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      {dua.category}
                    </span>
                    <button
                      onClick={() => playSpeechPhonetic(dua.arabic)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#064E3B] text-white hover:bg-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <SpeakerHigh className="w-3.5 h-3.5 text-[#D4A72C]" weight="duotone" />
                      <span>Listen</span>
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900">
                    {dua.title}
                  </h4>

                  {/* Arabic Text */}
                  <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100 text-right" dir="rtl">
                    <p className="font-arabic text-xl sm:text-2xl text-emerald-950 leading-relaxed font-semibold">
                      {dua.arabic}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 italic">
                    Transliteration: {dua.transliteration}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                    <p className="text-gray-800">
                      <strong className="text-[#064E3B]">English:</strong> {dua.english}
                    </p>
                    <p className="font-urdu text-base sm:text-lg text-gray-800 text-right leading-loose pt-1" dir="rtl">
                      <strong className="font-sans text-xs text-gray-400 ml-1">اردو ترجمہ:</strong> {dua.urdu}
                    </p>
                  </div>

                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex justify-between items-center">
                    <span>💡 <strong>Virtue:</strong> {dua.benefit}</span>
                    <span className="text-gray-500 font-medium shrink-0 ml-2">Ref: {dua.reference}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: STEP-BY-STEP SALAH (NAMAZ) GUIDE */}
        {/* ============================================================== */}
        {studioMode === 'salah' && (
          <div className="space-y-6">
            
            {/* Salah Stepper Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#064E3B]">
                  Step-by-Step Salah (Prayer / Namaz) Guide
                </h3>
                <p className="text-xs text-gray-500">
                  Visual postures, exact Arabic Azkar, Tajweed pronunciation, and rules.
                </p>
              </div>

              {/* Step Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {SALAH_STEPS.map(s => (
                  <button
                    key={s.stepNumber}
                    onClick={() => setActiveSalahStep(s.stepNumber)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSalahStep === s.stepNumber
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Step {s.stepNumber}: {s.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Salah Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-xs font-bold text-[#D4A72C] uppercase tracking-wider">
                    Step {currentSalahStep.stepNumber} of {SALAH_STEPS.length}
                  </span>
                  <h2 className="text-2xl font-bold text-[#064E3B]">
                    {currentSalahStep.title}
                  </h2>
                </div>
                <div className="font-arabic text-3xl font-bold text-emerald-800" dir="rtl">
                  {currentSalahStep.arabicTitle}
                </div>
              </div>

              {/* Posture Description */}
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#064E3B] mb-1">
                  Physical Posture (Sunnah Manner):
                </h4>
                <p className="text-sm font-semibold text-emerald-950">
                  {currentSalahStep.posture}
                </p>
              </div>

              {/* Arabic Recitation */}
              <div className="bg-amber-50/60 p-6 rounded-3xl border border-amber-200 text-right space-y-3" dir="rtl">
                <div className="flex justify-between items-center" dir="ltr">
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                    Recited in this position:
                  </span>
                  <button
                    onClick={() => playSpeechPhonetic(currentSalahStep.arabicRecitation)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#064E3B] text-white hover:bg-emerald-900 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <SpeakerHigh className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                    <span>Recite Audio</span>
                  </button>
                </div>

                <p className="font-arabic text-2xl sm:text-3xl text-gray-900 leading-relaxed font-bold">
                  {currentSalahStep.arabicRecitation}
                </p>
              </div>

              {/* Transliteration & Translations */}
              <div className="space-y-3 pt-2">
                <p className="text-xs text-gray-500 italic">
                  Transliteration: {currentSalahStep.transliteration}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <h5 className="text-xs font-bold text-gray-600 mb-1">English Meaning:</h5>
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                      {currentSalahStep.englishTranslation}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-right" dir="rtl">
                    <h5 className="text-xs font-bold text-gray-600 mb-1 font-sans">اردو ترجمہ:</h5>
                    <p className="text-base sm:text-lg font-urdu text-gray-800 leading-loose">
                      {currentSalahStep.urduTranslation}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-xs text-blue-950">
                  📌 <strong>Important Rule & Note:</strong> {currentSalahStep.importantNotes}
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  disabled={activeSalahStep === 1}
                  onClick={() => setActiveSalahStep(activeSalahStep - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <CaretLeft className="w-4 h-4" weight="bold" />
                  <span>Previous Step</span>
                </button>

                <button
                  disabled={activeSalahStep === SALAH_STEPS.length}
                  onClick={() => setActiveSalahStep(activeSalahStep + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#064E3B] hover:bg-emerald-900 text-white disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <span>Next Step</span>
                  <CaretRight className="w-4 h-4" weight="bold" />
                </button>
              </div>

            </div>

          </div>
        )}

      {/* Call Completed / Disconnect Confirmation Modal */}
      {callEnded && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-emerald-950/10 text-center space-y-5 animate-scaleIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#064E3B] shadow-xs">
              <CheckCircle className="w-8 h-8 text-[#064E3B]" weight="fill" />
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#064E3B] bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
                Lesson Completed
              </span>
              <h2 className="text-2xl font-heading font-extrabold text-[#064E3B] mt-3">
                Live Video Class Ended
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Your live 1-on-1 session has concluded. Duration: <strong>{Math.floor(classTimer / 60)} mins {classTimer % 60} secs</strong>.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              {onReturnToPortal && (
                <button
                  onClick={onReturnToPortal}
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm gold-gradient-btn text-[#064E3B] shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Return to {portalOrigin === 'teacher' ? 'Teacher Portal' : 'Student Portal'}</span>
                </button>
              )}

              <button
                onClick={handleRestartCall}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Re-Enter Live Classroom</span>
              </button>

              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Return to Homepage
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      </div>

    </div>
  );
};
