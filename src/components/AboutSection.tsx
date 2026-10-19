import React from 'react';
import { 
  BookOpen, 
  Target, 
  Compass, 
  Users, 
  Certificate, 
  ShieldCheck, 
  CheckCircle, 
  Heart, 
  GraduationCap, 
  Clock, 
  Quotes, 
  ArrowRight 
} from '@phosphor-icons/react';

interface AboutSectionProps {
  onOpenTrial: () => void;
  onOpenEnroll: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenTrial, onOpenEnroll }) => {
  const teachingSteps = [
    {
      step: '01',
      title: 'Diagnostic Assessment',
      desc: 'During the 3-day trial, the teacher evaluates current reading fluency, phonetic articulation (Makharij), and knowledge level to place the student in the exact right curriculum track.'
    },
    {
      step: '02',
      title: 'Structured 1-on-1 Sessions',
      desc: 'Every class is 100% individual. The instructor guides verse by verse, correcting mouth and tongue positioning with patience and constructive praise.'
    },
    {
      step: '03',
      title: 'Daily Sabaq & Revision',
      desc: 'A proven 3-tier revision system (New Lesson Sabaq, Recent Revision Sabqi, and Old Cumulative Revision Manzil) ensures zero forgetfulness.'
    },
    {
      step: '04',
      title: 'Monthly Progress Reports',
      desc: 'Parents receive regular assessments regarding attendance, Tajweed precision, and memorization milestones with direct access to academic coordinators.'
    }
  ];

  const coreValues = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#13263D]" weight="duotone" />,
      title: 'Authenticity & Tajweed Rigor',
      desc: 'We uphold the exact recitation rules transmitted through unbroken chains of certified reciters (Ijazah).'
    },
    {
      icon: <Heart className="w-6 h-6 text-[#13263D]" weight="duotone" />,
      title: 'Patience & Compassion',
      desc: 'Our teachers create an uplifting, encouraging atmosphere where mistakes are gently corrected without frustration.'
    },
    {
      icon: <Clock className="w-6 h-6 text-[#13263D]" weight="duotone" />,
      title: 'Punctuality & Reliability',
      desc: 'Classes start strictly on time. With flexible rescheduling options and 24/7 coordinator support.'
    },
    {
      icon: <Certificate className="w-6 h-6 text-[#13263D]" weight="duotone" />,
      title: 'Vetted Faculty',
      desc: 'Every tutor undergoes background verification, Tajweed audits, and pedagogical training before teaching.'
    }
  ];

  return (
    <div id="about-section" className="py-16 bg-[#FAF9F5] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/70 text-[#13263D] text-[11px] font-extrabold uppercase tracking-widest mb-2.5 border border-emerald-300">
            <BookOpen className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>About The Academy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#13263D] tracking-tight">
            About Noor E Quran Institute
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            A trusted global sanctuary dedicated to authentic Quran recitation, Tajweed mastery, and Islamic character nurturing from home.
          </p>
        </div>

        {/* 1. Who We Are & Mission Overview */}
        <div className="bg-white rounded-3xl border border-emerald-950/10 p-8 sm:p-10 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#A37B15] block">
                Who We Are
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#13263D]">
                Connecting Families Worldwide With God-Fearing Quran Teachers
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Founded with a sacred vision, <strong>Noor E Quran Institute</strong> bridges the gap for Muslims living in the West and across the globe who seek authentic, high-caliber Islamic education for their children and themselves.
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                We believe that learning the Quran should be an uplifting, spiritually fulfilling experience. By utilizing modern interactive digital classroom tools paired with traditional Ijazah-certified pedagogy, we provide one-on-one personalized guidance at times that fit seamlessly into busy family routines.
              </p>
            </div>

            <div className="lg:col-span-5 relative group rounded-3xl overflow-hidden border-2 border-[#D4A72C]/40 shadow-xl bg-emerald-950 aspect-[4/3] sm:aspect-[3/2] lg:aspect-auto lg:h-72 w-full">
              <img
                src="/images/academy-about-banner.webp"
                alt="Noor E Quran Institute library and scholars in traditional study setting"
                width={1200}
                height={800}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = '/images/academy-about-banner.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent"></div>
              
              <div className="absolute bottom-3 left-3 right-3 p-4 rounded-2xl bg-emerald-950/85 backdrop-blur-md border border-[#D4A72C]/40 text-white space-y-1">
                <h4 className="text-xs font-bold text-[#F3C64D] flex items-center gap-1.5 uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5" />
                  <span>Our Sacred Mission</span>
                </h4>
                <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                  To equip every student with confident, fluent Quran recitation with Tajweed and genuine love for Allah's words.
                </p>
                <div className="pt-2 border-t border-emerald-800/80 text-[10px] text-emerald-300 flex justify-between font-bold">
                  <span>Over 2,400+ Families Served</span>
                  <span className="text-[#F3C64D]">Certified Faculty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Our 4-Step Teaching Methodology */}
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#13263D] bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300">
              Our Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#13263D] mt-2">
              Structured & Proven Teaching Framework
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachingSteps.map((s, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-black text-[#9A690B] mb-2 block">{s.step}</span>
                  <h3 className="text-base font-heading font-bold text-[#13263D] mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-bold text-[#13263D] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-[#9A690B]" weight="fill" />
                  <span>Student Centered</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Core Values */}
        <div className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#13263D] bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300">
              Guiding Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#13263D] mt-2">
              The Values Behind Noor E Quran Institute
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((v, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 border border-emerald-950/10 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#13263D] flex items-center justify-center mb-4 border border-emerald-100">
                  {v.icon}
                </div>
                <h3 className="text-base font-heading font-bold text-[#13263D] mb-1.5">{v.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Bottom CTA Card */}
        <div className="bg-gradient-to-br from-[#13263D] via-[#043327] to-[#022119] rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#D4A72C]/40 shadow-xl bg-islamic-pattern">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              Experience Our Classes With a 3-Day Free Trial
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              No credit card or advance commitment required. Meet your dedicated tutor and begin your child's lessons today.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenTrial}
              className="gold-gradient-btn text-[#032B21] px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold shadow-md cursor-pointer"
            >
              Start 3-Day Free Trial
            </button>
            <button
              onClick={onOpenEnroll}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              Enroll Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
