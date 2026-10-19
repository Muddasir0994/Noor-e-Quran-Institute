import React from 'react';
import { ArrowRight } from '@phosphor-icons/react';

interface FinalCTASectionProps {
  onOpenTrial: () => void;
  onViewCourses?: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({
  onOpenTrial,
  onViewCourses
}) => {
  return (
    <section className="relative py-20 lg:py-28 bg-[#13263D] text-[#F5F0E6] overflow-hidden text-center">
      
      {/* Subtle Geometric Background */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#A47A46 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
        
        {/* Subtle Decorative Arabic Monogram / Bismillah */}
        <p className="font-arabic text-sm text-[#A47A46] font-normal tracking-wide" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        {/* Headline */}
        <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#F5F0E6] font-semibold leading-[1.15] tracking-tight">
          Begin a journey that will<br />
          <span className="italic font-normal text-[#E7DBC2]">stay with you forever.</span>
        </h2>

        {/* Supporting Line */}
        <p className="text-sm sm:text-base text-[#E7DBC2]/85 font-sans leading-relaxed max-w-xl mx-auto">
          Start learning with a qualified teacher and discover a more personal way to learn the Quran.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
          <button
            onClick={onOpenTrial}
            className="px-7 py-3.5 bg-[#A47A46] text-[#0C1A2E] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#C9AE7E] transition-colors shadow-xs cursor-pointer"
          >
            Book Your Free Trial
          </button>

          {onViewCourses && (
            <button
              onClick={onViewCourses}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5F0E6] hover:text-[#A47A46] transition-colors py-3 px-4 border-b border-[#F5F0E6]/40 hover:border-[#A47A46] cursor-pointer"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-[11px] text-[#E7DBC2]/60 font-sans pt-3">
          No payment details required • Cancel anytime • 3-Day risk-free trial
        </p>

      </div>

    </section>
  );
};
