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
    desc: 'Build a strong foundation with correct pronunciation.',
    image: '/images/unsplash/course-noorani-qaida.webp',
    imageAlt: 'Young student learning Noorani Qaida on a wooden rehal',
    imageWidth: 800,
    imageHeight: 601
  },
  {
    icon: BookOpen,
    title: 'Quran Reading',
    desc: 'Read the Quran fluently with confidence.',
    image: '/images/unsplash/course-quran-reading.webp',
    imageAlt: 'Student reading the Holy Quran with focus',
    imageWidth: 800,
    imageHeight: 601
  },
  {
    icon: Certificate,
    title: 'Tajweed',
    desc: 'Learn the rules and beauty of correct recitation.',
    image: '/images/unsplash/course-tajweed.webp',
    imageAlt: 'Two children in white caps reciting the Quran on rehals',
    imageWidth: 800,
    imageHeight: 450
  },
  {
    icon: GraduationCap,
    title: 'Hifz',
    desc: 'Memorize the Quran with expert guidance and support.',
    image: '/images/unsplash/course-hifz.webp',
    imageAlt: 'Dedicated student memorizing the Holy Quran',
    imageWidth: 800,
    imageHeight: 601
  },
  {
    icon: Church,
    title: 'Islamic Studies',
    desc: 'Explore Islamic knowledge and values for everyday life.',
    image: '/images/unsplash/course-islamic-studies.webp',
    imageAlt: 'Beautiful mosque interior filled with light',
    imageWidth: 800,
    imageHeight: 547
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
                className="bg-[#0F1E35] border border-[#1E2D47] rounded-xl overflow-hidden flex flex-col min-h-[340px] hover:border-[#5EEAD4]/40 transition-colors group"
              >
                <div className="relative h-40 shrink-0 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    width={card.imageWidth}
                    height={card.imageHeight}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1E35] via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-4 w-10 h-10 rounded-full bg-[#0A1428]/85 border border-[#D4A437]/50 text-[#D4A437] flex items-center justify-center">
                    <Icon className="w-5 h-5" weight="regular" />
                  </span>
                </div>
                <div className="p-6 pt-4 flex flex-col flex-1">
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
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
