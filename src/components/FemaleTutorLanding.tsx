import React from 'react';
import { 
  ShieldCheck, 
  Heart, 
  Star, 
  BookOpen, 
  Clock, 
  Users, 
  ArrowRight, 
  WhatsappLogo, 
  CheckCircle, 
  Certificate 
} from '@phosphor-icons/react';

interface FemaleTutorLandingProps {
  onOpenTrial: (courseName?: string) => void;
  onOpenEnroll: (courseName?: string) => void;
  onNavClick: (tab: string) => void;
}

export const FemaleTutorLanding: React.FC<FemaleTutorLandingProps> = ({
  onOpenTrial,
  onOpenEnroll,
  onNavClick
}) => {
  return (
    <div className="py-10 bg-[#FAF9F5] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs text-gray-500 font-medium">
            <li>
              <button onClick={() => onNavClick('home')} className="hover:text-[#13263D] transition cursor-pointer">
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => onNavClick('tutors')} className="hover:text-[#13263D] transition cursor-pointer">
                Faculty
              </button>
            </li>
            <li>/</li>
            <li className="text-[#13263D] font-extrabold">Female Quran Teachers</li>
          </ol>
        </nav>

        {/* Hero Banner for Female Quran Teachers */}
        <div className="bg-gradient-to-br from-[#13263D] via-[#043327] to-[#022119] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl border border-[#D4A72C]/30 bg-islamic-pattern mb-12">
          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#032B21]/90 border border-[#F3C64D]/40 text-xs text-[#F3C64D] font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5" weight="duotone" />
                <span>Certified Aalimah & Qaria Faculty for Sisters & Children</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white leading-tight">
                Certified <span className="gold-gradient-text italic font-bold">Female Quran Teachers</span> Online
              </h1>

              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                We provide qualified, compassionate, and vetted female Quran scholars dedicated exclusively to sisters, young daughters, and toddlers. Learn Tajweed, Noorani Qaida, and Islamic morals with complete comfort and privacy.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenTrial('Classes with Female Quran Teacher')}
                  className="gold-gradient-btn text-[#032B21] px-6 py-3.5 rounded-xl font-extrabold text-sm shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-[#032B21]" weight="bold" />
                  <span>Book Free Trial (Female Tutor)</span>
                </button>

                <a
                  href="https://wa.me/923274496163?text=Assalam-o-Alaikum%20Noor%20E%20Quran%20Institute.%20I%20am%20inquiring%20about%20a%20certified%20Female%20Quran%20Teacher."
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <WhatsappLogo className="w-4 h-4" weight="fill" />
                  <span>WhatsApp Coordinator</span>
                </a>
              </div>
            </div>

            {/* Female Program Photo Card */}
            <div className="lg:col-span-5 relative group rounded-3xl overflow-hidden border-2 border-[#D4A72C]/40 shadow-2xl bg-emerald-950">
              <img
                src="/images/female-program-banner.webp"
                alt="Muslim sister learning Quran online in private comfortable environment at Noor E Quran Institute"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = '/images/female-program-banner.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-emerald-950/85 backdrop-blur-md border border-[#D4A72C]/40 text-white flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">100% Modest & Private</p>
                  <p className="text-[10px] text-emerald-200">Female-to-Female 1-on-1 Sanctuary</p>
                </div>
                <span className="bg-[#F3C64D] text-[#032B21] text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                  Ijazah Certified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Highlights of Female Faculty */}
        <div className="mb-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#13263D] bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
              Dedicated Female Department
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#13263D] mt-2">
              Why Sisters & Parents Choose Our Female Faculty
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#13263D] flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-6 h-6 text-[#13263D]" weight="duotone" />
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                Certified Aalimah & Ijazah
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Graduates of recognized Islamic institutions with formal Shahadat-ul-Aalamia and certified Ijazah in Tajweed-ul-Quran.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center border border-pink-100">
                <Heart className="w-6 h-6 text-pink-700" weight="duotone" />
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                100% Privacy & Comfort
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Dedicated sisters-only coordination and strict adherence to Islamic guidelines for complete peace of mind.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <Clock className="w-6 h-6 text-amber-700" weight="duotone" />
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                Flexible Female Schedules
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Morning, afternoon, and evening slots tailored for busy mothers, working professionals, and school-aged daughters.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
