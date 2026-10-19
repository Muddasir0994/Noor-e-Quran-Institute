import React from 'react';
import { 
  Clock, 
  Lock, 
  CheckCircle, 
  Star, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  WhatsappLogo 
} from '@phosphor-icons/react';

interface AdultsProgramLandingProps {
  onOpenTrial: (courseName?: string) => void;
  onOpenEnroll: (courseName?: string) => void;
  onNavClick: (tab: string) => void;
}

export const AdultsProgramLanding: React.FC<AdultsProgramLandingProps> = ({
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
              <button onClick={() => onNavClick('courses')} className="hover:text-[#13263D] transition cursor-pointer">
                Courses
              </button>
            </li>
            <li>/</li>
            <li className="text-[#13263D] font-extrabold">Adults & Beginners</li>
          </ol>
        </nav>

        {/* Hero Banner for Adults Program */}
        <div className="bg-gradient-to-br from-[#13263D] via-[#043327] to-[#022119] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl border border-[#D4A72C]/30 bg-islamic-pattern mb-12">
          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#032B21]/90 border border-[#F3C64D]/40 text-xs text-[#F3C64D] font-extrabold">
                <Lock className="w-3.5 h-3.5 text-[#F3C64D]" weight="duotone" />
                <span>Private 1-on-1 Sanctuary for Brothers & Sisters</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white leading-tight">
                Online Quran Classes for <span className="gold-gradient-text italic font-bold">Adults & Beginners</span>
              </h1>

              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                It is never too late to learn or polish your Quranic recitation. Whether you are starting from zero Arabic letters, refreshing your childhood Quran reading, or perfecting your Tajweed rules around a busy work schedule, we offer private, non-judgmental 1-on-1 tutoring.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenTrial('Quran Classes for Adults')}
                  className="gold-gradient-btn text-[#032B21] px-6 py-3.5 rounded-xl font-extrabold text-sm shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-[#032B21]" weight="bold" />
                  <span>Start Free Assessment Class</span>
                </button>

                <a
                  href="https://wa.me/923274496163?text=Assalam-o-Alaikum%20Noor%20E%20Quran%20Institute.%20I%20am%20an%20adult%20learner%20interested%20in%20private%20Quran%20classes."
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <WhatsappLogo className="w-4 h-4" weight="fill" />
                  <span>WhatsApp Adult Advisor</span>
                </a>
              </div>
            </div>

            {/* Adults Program Photo Card */}
            <div className="lg:col-span-5 relative group rounded-3xl overflow-hidden border-2 border-[#D4A72C]/40 shadow-2xl bg-emerald-950">
              <img
                src="/images/adults-program-banner.webp"
                alt="Adult Muslims studying Quran with Tajweed online in 1-on-1 private lesson"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = '/images/adults-program-banner.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent"></div>
              
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-emerald-950/85 backdrop-blur-md border border-[#D4A72C]/40 text-white flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Flexible Pacing</p>
                  <p className="font-heading font-extrabold text-xs sm:text-sm">Brothers & Sisters Faculties</p>
                </div>
                <span className="bg-[#F3C64D] text-[#032B21] text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                  100% Private
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Pillars for Adult Learners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#13263D] flex items-center justify-center border border-emerald-100">
              <Lock className="w-6 h-6 text-[#13263D]" weight="duotone" />
            </div>
            <h3 className="font-heading font-bold text-base text-gray-900">
              100% Judgment-Free & Private
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              No pressure and no group embarrassment. Learn at your own pace with a patient, respectful teacher.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <Clock className="w-6 h-6 text-amber-700" weight="duotone" />
            </div>
            <h3 className="font-heading font-bold text-base text-gray-900">
              Late Evening & Weekend Slots
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Designed around full-time careers and family commitments with early morning or late night scheduling.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <BookOpen className="w-6 h-6 text-blue-700" weight="duotone" />
            </div>
            <h3 className="font-heading font-bold text-base text-gray-900">
              Tajweed & Translation Combined
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Master phonetic rules alongside understanding the deep spiritual meanings of what you recite in daily Salah.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
