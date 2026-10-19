import React from 'react';
import { ArrowRight, BookOpen } from '@phosphor-icons/react';

interface FinalCTASectionProps {
  onOpenTrial: () => void;
  onViewCourses?: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({
  onOpenTrial
}) => {
  return (
    <section className="bg-[#0A1428] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl border border-[#5EEAD4]/40 px-8 py-10 sm:px-12 sm:py-12 flex flex-col lg:flex-row items-center gap-8"
          style={{
            background: 'radial-gradient(ellipse 70% 120% at 20% 50%, rgba(94,234,212,0.08) 0%, transparent 70%)'
          }}
        >
          {/* Icon */}
          <span className="shrink-0 w-16 h-16 rounded-full border border-[#5EEAD4]/40 flex items-center justify-center text-[#D4A437]">
            <BookOpen className="w-8 h-8" weight="regular" />
          </span>

          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl text-white font-bold tracking-tight mb-2">
              Begin with a 3-day free trial.
            </h2>
            <p className="text-sm sm:text-base text-[#9AA7B8] leading-relaxed max-w-xl">
              Experience our one-to-one Quran classes and see the difference
              for yourself, with no commitment.
            </p>
          </div>

          {/* Button */}
          <button
            onClick={() => onOpenTrial()}
            className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-[#5EEAD4] text-[#0A1428] text-sm font-bold rounded-lg hover:bg-[#4FD1C5] transition-all cursor-pointer"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
