import { useRef } from 'react';
import { IdentificationBadge, Download, Star, BookOpen, Clock } from '@phosphor-icons/react';

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
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    studentName, studentId, email, courseName, currentLesson,
    tutorName, country, status, attendanceRate = 0,
    completedClasses = 0, memberSince
  } = props;

  const downloadCard = () => {
    // Simple print-to-save: open print dialog focused on the card
    window.print();
  };

  const memberYear = memberSince ? new Date(memberSince).getFullYear() : new Date().getFullYear();

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#064E3B] flex items-center gap-2">
          <IdentificationBadge className="w-5 h-5 text-[#D4A72C]" weight="duotone" />
          My Student ID Badge
        </h3>
        <button
          onClick={downloadCard}
          className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#064E3B] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save / Print</span>
        </button>
      </div>

      {/* ID Card */}
      <div ref={cardRef} className="relative overflow-hidden rounded-2xl max-w-md mx-auto" style={{ aspectRatio: '1.586' }}>
        {/* Card background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B332D] via-[#0d4038] to-[#07211d]" />
        {/* Decorative Islamic pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #B79A62 1px, transparent 1px), radial-gradient(circle at 80% 20%, #B79A62 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        {/* Gold border */}
        <div className="absolute inset-2 rounded-xl border-2 border-[#B79A62]/60 pointer-events-none" />
        <div className="absolute inset-3 rounded-lg border border-[#B79A62]/30 pointer-events-none" />

        {/* Card content */}
        <div className="relative h-full flex flex-col justify-between p-6 text-[#F8F5EE]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#B79A62] uppercase">Noor E Quran Institute</p>
              <p className="text-[9px] text-white/60 tracking-wider">STUDENT IDENTIFICATION CARD</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-white/50">ID</p>
              <p className="text-xs font-mono font-bold text-[#B79A62]">{studentId.slice(0, 12).toUpperCase()}</p>
            </div>
          </div>

          {/* Student info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#B79A62] flex items-center justify-center shrink-0 border-2 border-white/30">
              <span className="text-xl font-bold text-[#0B332D]">{initials(studentName)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold truncate">{studentName}</p>
              <p className="text-[11px] text-[#B79A62] font-semibold truncate">{courseName}</p>
              <p className="text-[10px] text-white/60 truncate">{currentLesson}</p>
            </div>
            <div className="ml-auto text-right shrink-0">
              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-white/10 text-white/70'}`}>
                {status}
              </span>
              <p className="text-[9px] text-white/50 mt-1">Since {memberYear}</p>
            </div>
          </div>

          {/* Footer details */}
          <div className="flex items-end justify-between text-[10px]">
            <div className="space-y-0.5">
              <p className="text-white/50">Teacher</p>
              <p className="font-semibold text-white/90 truncate max-w-[180px]">{tutorName}</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-white/50">Country</p>
              <p className="font-semibold text-white/90">{country}</p>
            </div>
            <div className="text-right">
              <p className="font-arabic text-[#B79A62] text-sm" dir="rtl">نُورِ قُرْآن</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-4 max-w-md mx-auto">
        <div className="bg-[#F8F5EE] rounded-2xl p-3 text-center border border-[#E8E0D1]">
          <Star className="w-4 h-4 text-[#D4A72C] mx-auto mb-1" weight="fill" />
          <p className="text-lg font-bold text-[#064E3B]">{attendanceRate}%</p>
          <p className="text-[10px] text-gray-500 font-semibold">Attendance</p>
        </div>
        <div className="bg-[#F8F5EE] rounded-2xl p-3 text-center border border-[#E8E0D1]">
          <BookOpen className="w-4 h-4 text-[#D4A72C] mx-auto mb-1" weight="duotone" />
          <p className="text-lg font-bold text-[#064E3B]">{completedClasses}</p>
          <p className="text-[10px] text-gray-500 font-semibold">Classes Done</p>
        </div>
        <div className="bg-[#F8F5EE] rounded-2xl p-3 text-center border border-[#E8E0D1]">
          <Clock className="w-4 h-4 text-[#D4A72C] mx-auto mb-1" weight="duotone" />
          <p className="text-lg font-bold text-[#064E3B]">{memberYear}</p>
          <p className="text-[10px] text-gray-500 font-semibold">Member Since</p>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center mt-3">🎓 Show this badge to your teacher at the start of class</p>
    </div>
  );
}
