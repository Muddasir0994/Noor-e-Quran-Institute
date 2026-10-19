import React from 'react';

const STEPS = [
  {
    n: 1,
    title: 'Choose a course',
    desc: 'Find the right course for your goals and level.'
  },
  {
    n: 2,
    title: 'Meet your teacher',
    desc: 'Get matched with a qualified teacher who suits you.'
  },
  {
    n: 3,
    title: 'Begin your lessons',
    desc: 'Start live, one-to-one classes at a time that works for you.'
  },
  {
    n: 4,
    title: 'See your progress',
    desc: 'Build confidence with regular feedback and ongoing support.'
  }
];

export const StepsSection: React.FC = () => {
  return (
    <section className="bg-[#0A1428] py-20 lg:py-24 border-t border-[#1B2A44]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {STEPS.map((step, idx) => (
            <div key={step.n} className="relative flex gap-5">
              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <span className="hidden lg:block absolute top-[22px] left-[60px] right-[-24px] h-px bg-[#1E2D47]" aria-hidden="true" />
              )}
              <span className="relative z-10 shrink-0 w-11 h-11 rounded-full border border-[#D4A437] text-[#D4A437] flex items-center justify-center text-base font-semibold bg-[#0A1428]">
                {step.n}
              </span>
              <div>
                <h3 className="text-white font-bold text-base mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-[#9AA7B8] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
