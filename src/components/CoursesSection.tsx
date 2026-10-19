import React from 'react';
import { Course } from '../types';
import {
  BookOpen,
  Certificate,
  GraduationCap,
  BookmarkSimple,
  ArrowRight
} from '@phosphor-icons/react';

interface CoursesSectionProps {
  courses: Course[];
  onOpenTrial: (courseName?: string) => void;
  onOpenEnroll?: (courseName?: string) => void;
  onInspectCourse: (course: Course) => void;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  courses,
  onOpenTrial,
  onInspectCourse
}) => {
  const displayCourses = courses && courses.length > 0 ? courses.slice(0, 5) : [];

  const getCourseIcon = (slug: string, category: string) => {
    if (slug.includes('tajweed') || category === 'tajweed') return Certificate;
    if (slug.includes('hifz') || category === 'hifz') return GraduationCap;
    if (slug.includes('islamic') || category === 'islamic_studies') return BookmarkSimple;
    return BookOpen;
  };

  return (
    <section id="courses" className="py-24 lg:py-32 bg-[#FAF7F0] border-b border-[#E7DBC2]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="max-w-2xl mb-16 lg:mb-24">
          <p className="text-[11px] font-sans font-bold text-[#8C6D37] uppercase tracking-widest mb-3.5">
            OUR COURSES
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#13263D] leading-[1.15] font-semibold tracking-tight">
            Learn at your pace.<br />
            <span className="italic font-normal">Grow for a lifetime.</span>
          </h2>
        </div>

        {/* Numbered Curriculum System (Faint Architectural Numbers + Thin Hairline Dividers) */}
        <div className="divide-y divide-[#E7DBC2]/60 border-t border-b border-[#E7DBC2]/60">
          {displayCourses.map((course, idx) => {
            const Icon = getCourseIcon(course.slug, course.category);
            const numStr = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={course.id || idx}
                className="py-10 lg:py-12 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start lg:items-center group hover:bg-[#F5F0E6]/40 transition-colors px-2 sm:px-4"
              >
                
                {/* 1. Subtle, Faint Background-Style Editorial Number (Shifted slightly top) */}
                <div className="md:col-span-2 flex items-center gap-3">
                  <span className="font-editorial text-2xl sm:text-3xl text-[#A47A46]/35 font-light tracking-wider select-none -translate-y-0.5">
                    {numStr}
                  </span>
                  <div className="w-7 h-7 rounded-sm bg-[#F5F0E6] border border-[#E7DBC2]/80 flex items-center justify-center text-[#13263D] group-hover:border-[#A47A46] transition-colors">
                    <Icon className="w-3.5 h-3.5" weight="regular" />
                  </div>
                </div>

                {/* 2. Course Title & Arabic Subheading */}
                <div className="md:col-span-4 space-y-1">
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#13263D] font-semibold group-hover:text-[#0C1A2E] transition-colors">
                    {course.name}
                  </h3>
                  {course.arabicName && (
                    <p className="font-arabic text-xs text-[#13263D]/70" dir="rtl">
                      {course.arabicName}
                    </p>
                  )}
                </div>

                {/* 3. Description (Narrow max-width for comfortable editorial readability) */}
                <div className="md:col-span-4 max-w-lg">
                  <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
                    {course.shortDescription || course.description}
                  </p>
                </div>

                {/* 4. Action Text Link */}
                <div className="md:col-span-2 flex md:justify-end items-center gap-4 pt-2 md:pt-0">
                  <button
                    onClick={() => onInspectCourse(course)}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[#13263D] hover:text-[#A47A46] transition-colors py-1 border-b border-[#13263D]/20 hover:border-[#A47A46] cursor-pointer"
                  >
                    <span>Explore Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Editorial Note & Trial Link */}
        <div className="mt-14 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-600 font-sans">
          <p className="max-w-xl leading-relaxed">
            All courses include 1-on-1 personalized attention, verified male and female scholars, and custom schedules.
          </p>
          <button
            onClick={() => onOpenTrial()}
            className="inline-flex items-center gap-1.5 font-bold text-[#13263D] hover:text-[#A47A46] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>Need advice selecting a track? Book a Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
