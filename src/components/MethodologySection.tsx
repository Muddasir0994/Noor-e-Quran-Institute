import React from 'react';
import {
  BookBookmark,
  UserCheck,
  VideoCamera,
  ChartLineUp,
  ArrowRight
} from '@phosphor-icons/react';

interface MethodologySectionProps {
  onOpenTrial?: () => void;
  onOpenEnroll?: () => void;
}

export const MethodologySection: React.FC<MethodologySectionProps> = ({ onOpenTrial }) => {
  const steps = [
    {
      number: '01',
      title: 'Choose Your Course',
      description: 'Select your preferred Quran or Islamic curriculum based on your family\'s current goals.',
      icon: BookBookmark
    },
    {
      number: '02',
      title: 'Meet Your Teacher',
      description: 'Take a personalized 1-on-1 assessment and free trial class with your matched certified scholar.',
      icon: UserCheck
    },
    {
      number: '03',
      title: 'Attend Your Live Classes',
      description: 'Join private video lessons in our interactive classroom studio on days and times that fit your routine.',
      icon: VideoCamera
    },
    {
      number: '04',
      title: 'Track Your Progress',
      description: 'Receive monthly recitation evaluation reports, attendance records, and milestone certificates.',
      icon: ChartLineUp
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#FAF7F0] border-b border-[#E7DBC2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <p className="text-[11px] font-sans font-bold text-[#8C6D37] uppercase tracking-widest mb-3">
            HOW IT WORKS
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#13263D] font-semibold tracking-tight">
            Your Quran journey, made simple.
          </h2>
        </div>

        {/* 4-Step Editorial Process with Thin Connecting Line */}
        <div className="relative">
          
          {/* Subtle Horizontal Connecting Hairline (Desktop) */}
          <div className="hidden lg:block absolute top-6 left-0 right-0 h-[1px] bg-[#E7DBC2] z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 relative z-10">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="space-y-4">
                  
                  {/* Step Number & Minimal Icon */}
                  <div className="flex items-center gap-3">
                    <span className="font-editorial text-2xl sm:text-3xl text-[#A47A46] font-light bg-[#FAF7F0] pr-2">
                      {step.number}
                    </span>
                    <div className="w-8 h-8 rounded-sm bg-[#F5F0E6] border border-[#E7DBC2] flex items-center justify-center text-[#13263D]">
                      <Icon className="w-4 h-4" weight="regular" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-editorial text-xl text-[#13263D] font-semibold">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
                    {step.description}
                  </p>

                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Call to Action Link */}
        {onOpenTrial && (
          <div className="mt-16 text-center">
            <button
              onClick={onOpenTrial}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#13263D] text-[#F5F0E6] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#0C1A2E] transition-all shadow-xs cursor-pointer"
            >
              <span>Get Started with a 3-Day Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
