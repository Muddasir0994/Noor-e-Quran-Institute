import React from 'react';

export const PersonalApproach: React.FC = () => {
  return (
    <section className="bg-[#0A1428] border-t border-[#1B2A44]">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* Left: text */}
        <div className="px-4 sm:px-6 lg:px-16 py-20 lg:py-28 flex flex-col justify-center max-w-xl lg:ml-auto">
          <p className="text-[11px] font-sans font-semibold text-[#D4A437] uppercase tracking-[0.28em] mb-4">
            A Personal Approach
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] text-white font-bold leading-[1.15] tracking-tight mb-6">
            A teacher who understands your journey.
          </h2>
          <p className="text-sm sm:text-base text-[#9AA7B8] leading-relaxed">
            Learn one-to-one with qualified, experienced teachers who are patient,
            supportive and dedicated to your progress. Our lessons are tailored to
            your goals, pace and level, whether you are a child, a beginner or
            looking to deepen your understanding.
          </p>
        </div>

        {/* Right: image, edge to edge */}
        <div className="relative min-h-[320px] lg:min-h-[520px]">
          <img
            src="/images/unsplash/teacher-online-class.webp"
            alt="Quran teacher giving a live online class"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1428] via-transparent to-transparent pointer-events-none" />
        </div>

      </div>
    </section>
  );
};
