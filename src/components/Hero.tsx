import React from 'react';
import {
  Users,
  CalendarBlank,
  Gift,
  WhatsappLogo,
  ArrowRight,
  Play
} from '@phosphor-icons/react';

interface HeroProps {
  onOpenTrial: (courseName?: string) => void;
  onOpenEnroll?: (courseName?: string) => void;
  onViewCourses?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenTrial, onViewCourses }) => {
  const trustItems = [
    { label: 'Qualified male & female teachers', icon: Users },
    { label: 'Flexible class timings', icon: CalendarBlank },
    { label: '3-day free trial', icon: Gift }
  ];

  return (
    <section className="relative bg-[#13263D] text-[#F5F0E6] overflow-hidden">
      {/* Ambient glow effects — Design 3 midnight atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 40%, rgba(169,196,211,0.14) 0%, transparent 70%), radial-gradient(ellipse 40% 35% at 20% 80%, rgba(164,122,70,0.12) 0%, transparent 70%)'
        }}
      />
      {/* Subtle Islamic geometry linework */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(169,196,211,0.5) 0.75px, transparent 0.75px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-14 pb-10 lg:pt-20 lg:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* Left: headline + CTAs */}
          <div className="lg:col-span-6 space-y-7">
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-[#A9C4D3]">
              Online Quran Classes &nbsp;•&nbsp; One to One
            </p>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.1] tracking-tight font-semibold text-white">
              Let the <span className="text-[#A9C4D3]">light</span> of the
              Quran guide your journey.
            </h1>

            <p className="text-base sm:text-lg text-[#F5F0E6]/75 leading-relaxed max-w-xl font-sans">
              Personal Quran lessons for children and adults. Learn with caring
              teachers, wherever you are.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <button
                onClick={() => onOpenTrial()}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#A9C4D3] text-[#13263D] text-sm font-bold tracking-wide rounded-sm hover:bg-[#C7D6E3] transition-all shadow-[0_0_30px_rgba(169,196,211,0.25)] cursor-pointer"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onViewCourses && onViewCourses()}
                className="inline-flex items-center gap-3 text-sm font-sans font-semibold text-[#F5F0E6] hover:text-[#A9C4D3] transition-colors cursor-pointer"
              >
                <span className="w-10 h-10 rounded-full border border-[#F5F0E6]/40 flex items-center justify-center">
                  <Play className="w-4 h-4" weight="fill" />
                </span>
                <span>Explore Courses</span>
              </button>
            </div>
          </div>

          {/* Right: Quran on rehal with luminous glow */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-sm overflow-hidden border border-[#A9C4D3]/20 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <img
                src="/images/unsplash/hero-quran-dark.webp"
                alt="Open Holy Quran on a carved wooden rehal, illuminated in soft light"
                className="w-full h-[380px] sm:h-[440px] object-cover"
                loading="eager"
                fetchPriority="high"
                width="600"
                height="440"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13263D]/60 via-transparent to-[#13263D]/10 pointer-events-none" />
              {/* Pearl glow ring accent */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse 55% 45% at 50% 45%, rgba(169,196,211,0.22) 0%, transparent 70%)'
                }}
              />
            </div>

            {/* Floating badge */}
            <div className="absolute top-5 right-5 bg-[#13263D]/80 backdrop-blur-sm border border-[#A9C4D3]/30 rounded-sm px-4 py-2.5 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#A9C4D3] animate-pulse" />
              <span className="text-xs font-sans font-semibold text-[#F5F0E6] tracking-wide">
                Live 1-to-1 Classes
              </span>
            </div>

            {/* Floating WhatsApp panel */}
            <div className="absolute -bottom-6 left-4 sm:left-8 bg-[#F5F0E6] border border-[#E7DBC2] rounded-sm p-4 shadow-xl max-w-[240px] z-20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#13263D] text-[#A9C4D3] flex items-center justify-center shrink-0">
                  <WhatsappLogo className="w-4 h-4" weight="fill" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#13263D] leading-tight">
                    Have questions?
                  </p>
                  <p className="text-[11px] text-gray-600 mb-1.5 leading-tight font-medium">
                    We&apos;re here to help.
                  </p>
                  <a
                    href="https://wa.me/923274496163"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#13263D] hover:text-[#A47A46] transition-colors"
                  >
                    <span>Chat on WhatsApp</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-16 pt-8 border-t border-[#F5F0E6]/15">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {trustItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center justify-center gap-3">
                  <span className="text-[#A47A46]">
                    <Icon className="w-6 h-6" weight="regular" />
                  </span>
                  <span className="text-sm font-sans font-medium text-[#F5F0E6]/85">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
