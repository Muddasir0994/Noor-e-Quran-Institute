import React from 'react';
import {
  BookOpen,
  Certificate,
  GraduationCap,
  BookmarkSimple,
  Church,
  ArrowRight
} from '@phosphor-icons/react';

interface CoursesSectionProps {
  onOpenTrial: (courseName?: string) => void;
  onInspectCourse?: (course: any) => void;
}

// Fixed 5 cards per teal-dark design spec
const CARDS = [
  {
    icon: BookOpen,
    title: 'Noorani Qaida',
    desc: 'Build a strong foundation with correct pronunciation.'
  },
  {
    icon: BookOpen,
    title: 'Quran Reading',
    desc: 'Read the Quran fluently with confidence.'
  },
  {
    icon: Certificate,
    title: 'Tajweed',
    desc: 'Learn the rules and beauty of correct recitation.'
  },
  {
    icon: GraduationCap,
    title: 'Hifz',
    desc: 'Memorize the Quran with expert guidance and support.'
  },
  {
    icon: Church,
    title: 'Islamic Studies',
    desc: 'Explore Islamic knowledge and values for everyday life.'
  }
];

export const CoursesSection: React.FC<CoursesSectionProps> = ({ onOpenTrial }) => {
  return (
    <section id="courses" className="py-20 lg:py-28 bg-[#0A1428]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <p className="text-[11px] font-sans font-semibold text-[#D4A437] uppercase tracking-[0.28em] mb-4">
          Our Courses
        </p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] text-white font-bold leading-[1.15] tracking-tight">
            Your next chapter starts here.
          </h2>
          <p className="text-sm sm:text-base text-[#9AA7B8] max-w-sm leading-relaxed lg:text-right">
            Structured Quran courses for all ages and levels, with expert teachers and a personal approach.
          </p>
        </div>

        {/* 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-[#0F1E35] border border-[#1E2D47] rounded-xl p-7 flex flex-col min-h-[280px] hover:border-[#5EEAD4]/40 transition-colors group"
              >
                <span className="text-[#D4A437] mb-5">
                  <Icon className="w-9 h-9" weight="regular" />
                </span>
                <h3 className="text-lg font-bold text-white mb-2.5">
                  {card.title}
                </h3>
                <p className="text-sm text-[#9AA7B8] leading-relaxed flex-1">
                  {card.desc}
                </p>
                <button
                  onClick={() => onOpenTrial(card.title)}
                  aria-label={`Start free trial for ${card.title}`}
                  className="mt-6 w-10 h-10 rounded-full border border-[#5EEAD4] text-[#5EEAD4] flex items-center justify-center hover:bg-[#5EEAD4] hover:text-[#0A1428] transition-all cursor-pointer self-start"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
