import React from 'react';
import {
  ShieldCheck,
  UserFocus,
  UsersThree,
  CalendarCheck,
  ArrowRight
} from '@phosphor-icons/react';

interface WhyChooseUsProps {
  onOpenTrial?: () => void;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onOpenTrial }) => {
  const principles = [
    {
      number: '01',
      title: 'Verified Teachers',
      description: 'All teachers are qualified, experienced, and background verified.',
      icon: ShieldCheck
    },
    {
      number: '02',
      title: 'Personalized Learning',
      description: 'Lessons are adapted according to each student\'s level and goals.',
      icon: UserFocus
    },
    {
      number: '03',
      title: 'Parent Involvement',
      description: 'Parents receive regular updates and progress information.',
      icon: UsersThree
    },
    {
      number: '04',
      title: 'Flexible & Convenient',
      description: 'Families can choose suitable class timings and reschedule when needed.',
      icon: CalendarCheck
    }
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-[#13263D] text-[#F5F0E6] overflow-hidden">
      
      {/* Subtle Geometric Accent */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#A47A46 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 2-Column Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Powerful Editorial Statement */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-widest">
              WHY NOOR E QURAN
            </p>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#F5F0E6] leading-[1.12] font-semibold tracking-tight">
              More than classes.<br />
              <span className="italic font-normal text-[#E7DBC2]">A relationship that lasts.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#E7DBC2]/85 font-sans leading-relaxed max-w-md">
              We focus on building a deep, personal connection between teacher and student. Learning the Quran is a sacred journey that requires patience, respect, and sincere care.
            </p>

            {onOpenTrial && (
              <div className="pt-2">
                <button
                  onClick={onOpenTrial}
                  className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-[#A47A46] hover:text-[#C9AE7E] transition-colors py-2 border-b border-[#A47A46]/40 hover:border-[#C9AE7E] cursor-pointer"
                >
                  <span>Experience the Difference</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: 4 Editorial Principles (Ivory + Muted Brass Icons) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
            {principles.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.number} className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-sm border border-[#A47A46]/40 bg-[#0C1A2E] flex items-center justify-center text-[#A47A46]">
                      <Icon className="w-4 h-4" weight="regular" />
                    </div>
                    <span className="font-editorial text-xl text-[#A47A46]/40 font-light select-none">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="font-editorial text-xl text-[#F5F0E6] font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#E7DBC2]/75 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
