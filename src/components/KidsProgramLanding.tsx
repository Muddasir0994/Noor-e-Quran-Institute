import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  CheckCircle, 
  Star, 
  BookOpen, 
  Clock, 
  Users, 
  ArrowRight, 
  WhatsappLogo, 
  Certificate, 
  GraduationCap 
} from '@phosphor-icons/react';

interface KidsProgramLandingProps {
  onOpenTrial: (courseName?: string) => void;
  onOpenEnroll: (courseName?: string) => void;
  onNavClick: (tab: string) => void;
}

export const KidsProgramLanding: React.FC<KidsProgramLandingProps> = ({
  onOpenTrial,
  onOpenEnroll,
  onNavClick
}) => {
  const milestones = [
    { level: 'Stage 1', title: 'Noorani Qaida & Makharij', age: 'Ages 4-7', desc: 'Arabic alphabet recognition, phonetic articulation points, and vowel sounds (Fatha, Kasra, Damma) through engaging interactive visuals.' },
    { level: 'Stage 2', title: 'Fluent Nazra with Tajweed', age: 'Ages 6-10', desc: 'Smooth word joining, continuous verse recitation, Noon Sakinah, Meem Sakinah, and Madd elongation rules.' },
    { level: 'Stage 3', title: 'Juz Amma Memorization', age: 'Ages 8-12', desc: 'Memorizing Surah An-Nas through Surah An-Naba with pristine pronunciation and correct stops (Waqf).' },
    { level: 'Stage 4', title: 'Daily Duas & Islamic Character', age: 'All Ages', desc: 'Step-by-step Salah (Namaz) practice, 40 Masnoon Duas, and Islamic morals (Akhlaq & Respect for Parents).' }
  ];

  return (
    <div className="py-10 bg-[#FAF9F5] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
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
            <li className="text-[#13263D] font-extrabold">Kids Program</li>
          </ol>
        </nav>

        {/* Hero Banner for Kids Program */}
        <div className="bg-gradient-to-br from-[#13263D] via-[#043327] to-[#022119] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl border border-[#D4A72C]/30 bg-islamic-pattern mb-12">
          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#032B21]/90 border border-[#F3C64D]/40 text-xs text-[#F3C64D] font-extrabold">
                <GraduationCap className="w-3.5 h-3.5" weight="duotone" />
                <span>Ages 4 to 15 Specialized Child Track</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white leading-tight">
                Online Quran Classes for Kids with <span className="gold-gradient-text italic font-bold">Gentle & Patient</span> Tutors
              </h1>

              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
                We understand that young children need enthusiasm, encouragement, and positive reinforcement. Our 1-on-1 kids classes make learning Arabic letters, Makharij phonetics, and short Surahs an uplifting, joyful journey.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onOpenTrial('Quran Classes for Kids')}
                  className="gold-gradient-btn text-[#032B21] px-6 py-3.5 rounded-xl font-extrabold text-sm shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-[#032B21]" weight="bold" />
                  <span>Book 3-Day Free Trial</span>
                </button>

                <a
                  href="https://wa.me/923274496163?text=Assalam-o-Alaikum%20Noor%20E%20Quran%20Institute.%20I%20want%20to%20inquire%20about%20Quran%20classes%20for%20my%20child."
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <WhatsappLogo className="w-4 h-4" weight="fill" />
                  <span>WhatsApp Advisor</span>
                </a>
              </div>
            </div>

            {/* Kids Program Photo Card */}
            <div className="lg:col-span-5 relative group rounded-3xl overflow-hidden border-2 border-[#D4A72C]/40 shadow-2xl bg-emerald-950">
              <img
                src="/images/kids-program-banner.webp"
                alt="Muslim children learning Quran online happily at Noor E Quran Institute"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = '/images/kids-program-banner.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-emerald-950/85 backdrop-blur-md border border-[#D4A72C]/40 text-white flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">Engaging & Joyful</p>
                  <p className="text-[10px] text-emerald-200">Animated Whiteboards & Rewards</p>
                </div>
                <span className="bg-[#D4A72C] text-[#13263D] text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                  100% Patient
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Kids Program */}
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#13263D] bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300">
              Child-Centered Pedagogy
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#13263D] mt-2">
              Why Parents Choose Noor E Quran for Their Children
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100">
                <Heart className="w-6 h-6 text-pink-600" weight="duotone" />
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                Gentle & Child-Friendly
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                No harsh corrections. Teachers use gentle repetition, digital stars, and smile-filled positive encouragement.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#13263D] flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-6 h-6 text-[#13263D]" weight="duotone" />
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                Female Teachers for Kids
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Certified, compassionate female teachers specialized in teaching toddlers and young girls with utmost warmth.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <Star className="w-6 h-6 text-amber-700" weight="fill" />
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                Gamified Rewards & Badges
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Children earn achievement badges, completion certificates, and digital stickers to stay motivated every week.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <Clock className="w-6 h-6 text-blue-700" weight="duotone" />
              </div>
              <h3 className="font-heading font-bold text-base text-gray-900">
                After-School Flexibility
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Classes easily scheduled around school, dinner, and extracurriculars with free makeup class support.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Stage Kids Learning Roadmap */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-950/10 shadow-sm mb-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-heading font-extrabold text-[#13263D]">
              4-Stage Learning Roadmap for Children
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              From absolute beginner alphabet mastery to confident Quran recitation with Tajweed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#FAF9F5] border border-gray-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#13263D] bg-emerald-100 px-2 py-0.5 rounded-md">
                      {m.level}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">{m.age}</span>
                  </div>
                  <h4 className="font-heading font-bold text-base text-gray-900 mb-2">{m.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{m.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center text-[11px] font-bold text-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5 text-[#D4A72C] mr-1.5" weight="fill" />
                  Milestone Certified
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
