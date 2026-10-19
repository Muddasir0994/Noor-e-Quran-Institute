import React from 'react';
import { Course } from '../types';
import { X, CheckCircle, Clock, Calendar, Users, ShieldCheck, BookOpen, Stack, ArrowRight } from '@phosphor-icons/react';

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onOpenTrial: (courseName: string) => void;
  onOpenEnroll: (courseName: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onOpenTrial,
  onOpenEnroll
}) => {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-950/10 overflow-hidden my-6">
        
        {/* Header with Emerald background */}
        <div className="bg-[#13263D] text-white p-6 relative bg-islamic-pattern">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-emerald-950/60 hover:bg-emerald-950 text-emerald-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="font-arabic text-sm text-[#D4A72C] font-semibold bg-[#043629] px-2.5 py-0.5 rounded-full border border-[#D4A72C]/30">
              {course.arabicName}
            </span>
            <span className="text-xs font-medium text-emerald-200">
              1-on-1 Certified Course
            </span>
          </div>

          <h2 className="text-2xl font-heading font-bold text-white">
            {course.name}
          </h2>
          <p className="mt-1 text-sm text-emerald-100/90 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[68vh] overflow-y-auto">
          
          {/* Quick Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Users className="w-3.5 h-3.5 text-[#13263D]" weight="duotone" />
                <span>Audience</span>
              </div>
              <p className="text-xs font-semibold text-gray-900">{course.audience}</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#13263D]" weight="duotone" />
                <span>Estimated Duration</span>
              </div>
              <p className="text-xs font-semibold text-gray-900">{course.duration}</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#13263D]" weight="duotone" />
                <span>Schedule</span>
              </div>
              <p className="text-xs font-semibold text-gray-900">{course.classesPerWeek}</p>
            </div>
          </div>

          {/* Key Course Highlights */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-[#13263D] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
              <span>What You Will Master</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {course.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 p-2 rounded-lg bg-emerald-50/40 border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-[#13263D] shrink-0 mt-0.5" weight="fill" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum / Syllabus Outline */}
          {course.syllabus && course.syllabus.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-sm font-bold text-[#13263D] uppercase tracking-wider flex items-center gap-1.5">
                <Stack className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                <span>Detailed Syllabus Roadmap</span>
              </h4>
              <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50/70 divide-y divide-gray-200/70">
                {course.syllabus.map((lesson, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center gap-3 text-xs sm:text-sm text-gray-800">
                    <span className="w-6 h-6 rounded-md bg-[#13263D] text-[#D4A72C] font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{lesson}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fee Information Box */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-[#D4A72C]/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-900">Standard Monthly Tuition</p>
              <p className="text-base font-bold text-[#13263D]">PKR {course.feePKR.toLocaleString()} / month (${course.feeUSD})</p>
              <p className="text-[11px] text-gray-500">Includes 1-on-1 classes, student tracking & study material.</p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-[#D4A72C]/20 px-2.5 py-1 rounded-full border border-[#D4A72C]/30">
              No Advance Payment
            </span>
          </div>

        </div>

        {/* Modal Footer CTAs */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenTrial(course.name);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold bg-[#D4A72C] text-emerald-950 hover:bg-[#E5B83D] active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 border border-[#D4A72C] cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-emerald-950" weight="bold" />
            <span>Book 3-Day Free Trial</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenEnroll(course.name);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#13263D] text-white hover:bg-[#043629] active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
            <span>Apply for Enrollment</span>
          </button>
        </div>

      </div>
    </div>
  );
};
