import { Download, Star, BookOpen, Clock, CheckCircle } from '@phosphor-icons/react';

interface StudentBadgeProps {
  studentName: string;
  studentId: string;
  email: string;
  courseName: string;
  currentLesson: string;
  tutorName: string;
  country: string;
  status: string;
  attendanceRate?: number;
  completedClasses?: number;
  memberSince?: string;
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export function StudentProfileBadge(props: StudentBadgeProps) {
  const {
    studentName, studentId, courseName, currentLesson,
    tutorName, country, status, attendanceRate = 0,
    completedClasses = 0, memberSince
  } = props;

  const memberYear = memberSince ? new Date(memberSince).getFullYear() : new Date().getFullYear();

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-[#064E3B]">My Profile</h3>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#064E3B] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save / Print</span>
        </button>
      </div>

      {/* Profile card with circular avatar */}
      <div className="relative overflow-hidden rounded-3xl max-w-md mx-auto">
        {/* Banner background */}
        <div className="h-28 bg-gradient-to-r from-[#0B332D] via-[#0d4038] to-[#07211d] relative">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #B79A62 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px'
          }} />
          <p className="absolute top-3 left-4 text-[10px] font-bold tracking-[0.2em] text-[#B79A62] uppercase">
            Noor E Quran Institute
          </p>
          <p className="absolute top-3 right-4 font-arabic text-[#B79A62]/80 text-sm" dir="rtl">نُورِ قُرْآن</p>
        </div>

        {/* Circular profile */}
        <div className="bg-[#F8F5EE] px-6 pb-6 border border-t-0 border-[#E8E0D1] rounded-b-3xl">
          <div className="flex flex-col items-center -mt-12 mb-3">
            <div className="relative">
              {/* Outer gold ring */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#B79A62] to-[#8a6d3b] p-1.5 shadow-lg">
                {/* Inner dark ring */}
                <div className="w-full h-full rounded-full bg-[#0B332D] p-1">
                  {/* Avatar circle */}
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#B79A62]/30 to-[#B79A62]/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-[#B79A62]">{initials(studentName)}</span>
                  </div>
                </div>
              </div>
              {/* Online/status dot */}
              <span className={`absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full border-4 border-[#F8F5EE] ${status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`} title={status} />
            </div>

            <h4 className="text-xl font-bold text-[#0B332D] mt-2 text-center">{studentName}</h4>
            <p className="text-xs text-[#B79A62] font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" weight="fill" />
              {status} Student
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">ID: {studentId.slice(0, 12).toUpperCase()}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-white rounded-2xl p-3 border border-[#E8E0D1]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Course</p>
              <p className="font-bold text-[#0B332D] mt-0.5 leading-snug">{courseName}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[#E8E0D1]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Current Lesson</p>
              <p className="font-bold text-[#0B332D] mt-0.5 leading-snug">{currentLesson}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[#E8E0D1]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Teacher</p>
              <p className="font-bold text-[#0B332D] mt-0.5 leading-snug">{tutorName}</p>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[#E8E0D1]">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Country</p>
              <p className="font-bold text-[#0B332D] mt-0.5 leading-snug">{country}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 mt-2.5">
            <div className="bg-[#0B332D] rounded-2xl p-3 text-center">
              <Star className="w-4 h-4 text-[#B79A62] mx-auto mb-1" weight="fill" />
              <p className="text-base font-bold text-white">{attendanceRate}%</p>
              <p className="text-[9px] text-white/60 font-semibold">Attendance</p>
            </div>
            <div className="bg-[#0B332D] rounded-2xl p-3 text-center">
              <BookOpen className="w-4 h-4 text-[#B79A62] mx-auto mb-1" weight="duotone" />
              <p className="text-base font-bold text-white">{completedClasses}</p>
              <p className="text-[9px] text-white/60 font-semibold">Classes Done</p>
            </div>
            <div className="bg-[#0B332D] rounded-2xl p-3 text-center">
              <Clock className="w-4 h-4 text-[#B79A62] mx-auto mb-1" weight="duotone" />
              <p className="text-base font-bold text-white">{memberYear}</p>
              <p className="text-[9px] text-white/60 font-semibold">Member Since</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center mt-3">🎓 Show this badge to your teacher at the start of class</p>
    </div>
  );
}
