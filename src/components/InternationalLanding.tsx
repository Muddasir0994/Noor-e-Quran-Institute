import React from 'react';
import { 
  Globe, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  Star, 
  WhatsappLogo, 
  ArrowRight, 
  BookOpen, 
  Users, 
  Certificate 
} from '@phosphor-icons/react';

export type CountryKey = 'uk' | 'usa' | 'canada' | 'australia' | 'pakistan';

interface CountryDetail {
  code: CountryKey;
  name: string;
  flag: string;
  headline: string;
  description: string;
  timezones: string;
  popularTimes: string[];
  currencySymbol: string;
  monthlyPricing: {
    twoDays: string;
    threeDays: string;
    fourDays: string;
    fiveDays: string;
  };
  features: string[];
  localFaq: { q: string; a: string }[];
}

const COUNTRY_DATA: Record<CountryKey, CountryDetail> = {
  uk: {
    code: 'uk',
    name: 'United Kingdom (UK)',
    flag: '🇬🇧',
    headline: '1-on-1 Online Quran Classes for UK Students (London, Birmingham & Nationwide)',
    description: 'Structured Quran lessons aligned perfectly with UK British Standard Time (GMT / BST). Certified English & Urdu speaking tutors providing dedicated 1-on-1 attention for children after school and on weekends.',
    timezones: 'GMT / BST (London Time)',
    popularTimes: ['4:00 PM – 8:30 PM (After School)', '8:00 AM – 1:00 PM (Saturday & Sunday)', '8:30 PM – 10:00 PM (Adults Evening)'],
    currencySymbol: '£',
    monthlyPricing: {
      twoDays: '£28 / month (8 Classes)',
      threeDays: '£38 / month (12 Classes)',
      fourDays: '£48 / month (16 Classes)',
      fiveDays: '£58 / month (20 Classes)'
    },
    features: [
      'Tailored for British Muslim school schedules',
      'Vetted, gentle male & female tutors',
      'Interactive Noorani Qaida & Tajweed software',
      'Full 3-Day Free Trial with zero advance payment'
    ],
    localFaq: [
      {
        q: 'What time are UK classes scheduled?',
        a: 'We accommodate all UK after-school hours (4:00 PM to 8:30 PM) and flexible weekend morning/afternoon slots according to your family routine.'
      },
      {
        q: 'Are female teachers available for sisters and daughters in the UK?',
        a: 'Yes, we have certified female Alimah and Qaria tutors specifically dedicated to female students and young children across the UK.'
      }
    ]
  },
  usa: {
    code: 'usa',
    name: 'United States (USA)',
    flag: '🇺🇸',
    headline: '1-on-1 Online Quran Classes Across the USA (EST, CST, MST & PST)',
    description: 'Personalized Quran learning for Muslim families across New York, Texas, California, Illinois, and nationwide. Flexible scheduling designed for American school and work hours.',
    timezones: 'EST, CST, MST & PST (All US Timezones)',
    popularTimes: ['4:30 PM – 9:00 PM (Weekdays After-School)', '9:00 AM – 2:00 PM (Weekend Mornings)', '8:00 PM – 11:00 PM (Adults Night Track)'],
    currencySymbol: '$',
    monthlyPricing: {
      twoDays: '$35 / month (8 Classes)',
      threeDays: '$48 / month (12 Classes)',
      fourDays: '$60 / month (16 Classes)',
      fiveDays: '$72 / month (20 Classes)'
    },
    features: [
      '24/7 availability across all 4 US Continental timezones',
      'One-on-one personalized attention with screen sharing',
      'Certified Huffaz & Islamic scholars',
      'Monthly progress reports shared directly with parents'
    ],
    localFaq: [
      {
        q: 'Can we choose our US timezone?',
        a: 'Yes, whether you are on Eastern (EST), Central (CST), Mountain (MST), or Pacific (PST) time, our tutors are active 24/7 to match your preferred hour.'
      },
      {
        q: 'How does the 3-day free trial work in the USA?',
        a: 'Simply select your preferred days and times. You take 3 full live classes with your matched tutor without providing credit card details.'
      }
    ]
  },
  canada: {
    code: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    headline: 'Online Quran Classes for Canadian Students (Toronto, Calgary, Vancouver & Nationwide)',
    description: 'High-quality 1-on-1 Quran recitation and Tajweed lessons for Canadian Muslim children and adults. Patient bilingual tutors with flexible timings.',
    timezones: 'EST / CST / MST / PST (Canada Nationwide)',
    popularTimes: ['4:00 PM – 8:30 PM (After School)', '9:00 AM – 1:00 PM (Weekends)', '8:00 PM – 10:30 PM (Adult Track)'],
    currencySymbol: 'CAD $',
    monthlyPricing: {
      twoDays: 'CAD $45 / month (8 Classes)',
      threeDays: 'CAD $60 / month (12 Classes)',
      fourDays: 'CAD $75 / month (16 Classes)',
      fiveDays: 'CAD $90 / month (20 Classes)'
    },
    features: [
      'Flexible scheduling matching Canadian school calendar',
      'Dedicated female faculty for sisters and daughters',
      'Noorani Qaida, Nazra, Tajweed and Hifz tracks',
      'Interactive digital Quran reader with audio playback'
    ],
    localFaq: [
      {
        q: 'Are classes available in Ontario and British Columbia timezones?',
        a: 'Yes, our academic coordinators match tutors precisely with your local Canadian provincial timezone.'
      }
    ]
  },
  australia: {
    code: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    headline: '1-on-1 Online Quran Lessons for Students in Australia (Sydney, Melbourne, Brisbane & Perth)',
    description: 'Reliable online Quran tutoring tailored for Australian Muslim families. Early morning, after-school, and weekend slots available under certified instructors.',
    timezones: 'AEST / AWST (Sydney, Melbourne & Perth Time)',
    popularTimes: ['4:00 PM – 8:00 PM (After School AEST)', '8:00 AM – 12:00 PM (Saturday & Sunday)', '6:30 AM – 8:00 AM (Pre-School Fajr Track)'],
    currencySymbol: 'AUD $',
    monthlyPricing: {
      twoDays: 'AUD $48 / month (8 Classes)',
      threeDays: 'AUD $65 / month (12 Classes)',
      fourDays: 'AUD $80 / month (16 Classes)',
      fiveDays: 'AUD $95 / month (20 Classes)'
    },
    features: [
      'Early morning and after-school slots in Australian timezones',
      'Gentle child-friendly methodology',
      'Daily revision and Tajweed articulation focus',
      'Zero commitment 3-Day Free Trial'
    ],
    localFaq: [
      {
        q: 'Do you cater to Australian daylight saving times?',
        a: 'Yes, our scheduling system automatically adjusts to Australian Daylight Saving Time changes.'
      }
    ]
  },
  pakistan: {
    code: 'pakistan',
    name: 'Pakistan',
    flag: '🇵🇰',
    headline: 'Online Quran Classes in Pakistan (Karachi, Lahore, Islamabad & Nationwide)',
    description: 'Affordable, premium 1-on-1 Quran education across Pakistan. Certified Qaris, Alim and Alimah faculty providing structured Noorani Qaida, Tajweed, and Hifz.',
    timezones: 'PKT (Pakistan Standard Time)',
    popularTimes: ['3:00 PM – 10:00 PM (Afternoon & Evening)', '7:00 AM – 11:00 AM (Weekend Mornings)', 'Flexible Morning Slots'],
    currencySymbol: 'Rs.',
    monthlyPricing: {
      twoDays: 'Rs. 2,500 / month (8 Classes)',
      threeDays: 'Rs. 3,500 / month (12 Classes)',
      fourDays: 'Rs. 4,000 / month (16 Classes)',
      fiveDays: 'Rs. 4,500 / month (20 Classes)'
    },
    features: [
      'Certified Wafaq-ul-Madaris scholars and Qaris',
      'Urdu and English medium instruction',
      'Specialized slow learner and kids support',
      'Direct WhatsApp helpline and flexible rescheduling'
    ],
    localFaq: [
      {
        q: 'Can students take classes on mobile phone or tablet?',
        a: 'Yes! Our digital classroom and 1-on-1 sessions work seamlessly on Android, iPhone, laptops, and tablets.'
      }
    ]
  }
};

interface InternationalLandingProps {
  countryCode: CountryKey;
  onOpenTrial: (courseName?: string) => void;
  onOpenEnroll: (courseName?: string) => void;
  onSelectCountry: (c: CountryKey) => void;
}

export const InternationalLanding: React.FC<InternationalLandingProps> = ({
  countryCode,
  onOpenTrial,
  onOpenEnroll,
  onSelectCountry
}) => {
  const data = COUNTRY_DATA[countryCode] || COUNTRY_DATA.uk;

  return (
    <div className="py-10 bg-[#FAFAF7] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Country Selector Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">
            Select Country Program:
          </span>
          {(Object.keys(COUNTRY_DATA) as CountryKey[]).map((key) => {
            const c = COUNTRY_DATA[key];
            const active = key === countryCode;
            return (
              <button
                key={key}
                onClick={() => onSelectCountry(key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-[#13263D] text-[#F3C64D] shadow-md border border-[#F3C64D]/40'
                    : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Hero Banner for Country */}
        <div className="bg-[#13263D] text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl border border-[#13263D]/30 bg-islamic-pattern mb-10">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#043629]/90 border border-[#F3C64D]/40 text-xs text-[#F3C64D] font-bold">
              <span>{data.flag}</span>
              <span>{data.name} Regional Curriculum</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-white leading-tight">
              {data.headline}
            </h1>

            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              {data.description}
            </p>

            {/* Quick CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenTrial(`Online Quran Classes (${data.name})`)}
                className="px-6 py-3 rounded-xl gold-gradient-btn text-[#032B21] font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-[#032B21]" weight="bold" />
                <span>Book 3-Day Free Trial ({data.name})</span>
              </button>

              <a
                href={`https://wa.me/923274496163?text=Assalam-o-Alaikum%20Noor%20E%20Quran%20Institute.%20I%20am%20inquiring%20for%20classes%20in%20${encodeURIComponent(data.name)}.`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
              >
                <WhatsappLogo className="w-4 h-4" weight="fill" />
                <span>WhatsApp Admissions</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3-Column Country Grid: Timezones, Fees, Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Timezones & Timetable */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#13263D] flex items-center justify-center border border-emerald-100">
              <Clock className="w-5 h-5" weight="duotone" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#13263D]">
                {data.name} Timetable
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Timezone: {data.timezones}
              </p>
            </div>
            <ul className="space-y-2 text-xs text-gray-700">
              {data.popularTimes.map((time, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#FAFAF7] p-2.5 rounded-xl border border-gray-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" weight="fill" />
                  <span>{time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Local Monthly Tuition Plans */}
          <div className="bg-white rounded-3xl p-6 border border-[#D4A72C]/40 shadow-xs space-y-4 relative">
            <span className="absolute top-4 right-4 text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
              Transparent
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#D4A72C] flex items-center justify-center border border-amber-100">
              <Certificate className="w-5 h-5" weight="duotone" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-gray-900">
                Monthly Fee Rates ({data.currencySymbol})
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                No admission charges • Free 3-Day Trial
              </p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-gray-600 font-medium">2 Days / Week</span>
                <span className="font-bold text-[#13263D]">{data.monthlyPricing.twoDays}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-emerald-950 font-bold">3 Days / Week (Popular)</span>
                <span className="font-bold text-[#13263D]">{data.monthlyPricing.threeDays}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-gray-600 font-medium">4 Days / Week</span>
                <span className="font-bold text-[#13263D]">{data.monthlyPricing.fourDays}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-gray-600 font-medium">5 Days / Week</span>
                <span className="font-bold text-[#13263D]">{data.monthlyPricing.fiveDays}</span>
              </div>
            </div>
          </div>

          {/* Vetted Faculty & Safety */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#13263D] flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-5 h-5" weight="duotone" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#13263D]">
                Faculty & Safeguarding
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Background verified instructors
              </p>
            </div>
            <ul className="space-y-2 text-xs text-gray-700">
              {data.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#D4A72C] shrink-0 mt-0.5" weight="fill" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Country Specific FAQs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xs">
          <h3 className="font-heading font-bold text-xl text-[#13263D] mb-4">
            Frequently Asked Questions for {data.name} Parents & Students
          </h3>
          <div className="space-y-4">
            {data.localFaq.map((faq, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#FAFAF7] border border-gray-100 space-y-1.5">
                <h4 className="font-heading font-bold text-sm text-gray-900">
                  {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
