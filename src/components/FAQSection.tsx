import React, { useState, useEffect } from 'react';
import { Question, CaretDown, CaretUp, WhatsappLogo, ArrowRight } from '@phosphor-icons/react';
import { FAQItem } from '../types';
import { INITIAL_FAQS } from '../data/academyData';

interface FAQSectionProps {
  onOpenTrial: () => void;
}

const sortFaqs = (list: FAQItem[]) =>
  [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenTrial }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Live CMS data: fetch FAQs from the server on mount, sorted by `order`.
  // Bundled INITIAL_FAQS render instantly and stay as the fallback so this
  // section never renders empty or broken.
  const [faqs, setFaqs] = useState<FAQItem[]>(() => sortFaqs(INITIAL_FAQS));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/faqs')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(data => {
        if (!isMounted) return;
        const list = data?.faqs ?? data; // server wraps in {success, faqs}
        if (Array.isArray(list) && list.length > 0) {
          setFaqs(sortFaqs(list as FAQItem[]));
          setOpenIndex(0);
        }
      })
      .catch(() => { /* keep bundled seed data on failure */ })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="py-16 bg-white border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#064E3B]/10 text-[#064E3B] text-[11px] font-bold uppercase tracking-widest mb-2.5 border border-[#064E3B]/20">
            <Question className="w-3.5 h-3.5 text-[#A16207]" weight="duotone" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#064E3B] tracking-tight">
            Frequently Asked Questions (FAQ)
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Everything you need to know about our 1-on-1 classes, tutors, and trial registration.
          </p>
        </div>

        {/* Bento Layout: Left Side Info Card + Right Side Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Bento Info Card (Col 1-4) */}
          <div className="lg:col-span-4 bg-[#FAFAF7] border border-gray-200/90 rounded-3xl p-7 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#064E3B] block mb-1">
                24/7 Coordinator Support
              </span>
              <h3 className="text-xl font-heading font-bold text-gray-900">
                Have questions before starting?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Our admissions advisor is available around the clock to assist you with timetable scheduling, tutor preferences, and course recommendations.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="https://wa.me/923274496163?text=Assalam-o-Alaikum%20Noor%20E%20Quran%20Institute.%20I%20have%20a%20question%20regarding%20the%20classes."
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all shadow-sm"
              >
                <WhatsappLogo className="w-4 h-4" weight="fill" />
                <span>Ask on WhatsApp (0327-4496163)</span>
              </a>

              <button
                onClick={onOpenTrial}
                className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#064E3B] text-white hover:bg-[#043629] transition-all shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#F3C64D]" weight="bold" />
                <span>Book 3-Day Free Trial</span>
              </button>
            </div>

            <div className="pt-3 border-t border-gray-200 text-[11px] text-gray-500 space-y-1">
              <p>✓ Zero advance fees required</p>
              <p>✓ Flexible lesson times for all countries</p>
            </div>
          </div>

          {/* Right Bento Accordion (Col 5-12) */}
          <div className="lg:col-span-8 space-y-3">
            {loading && faqs.length === 0 ? (
              <div className="space-y-3 animate-pulse" aria-hidden>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="border border-gray-200/90 rounded-2xl p-5 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200/80 rounded-xl" />
                    <div className="h-3 w-1/2 bg-gray-200/60 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.id || idx}
                  className="border border-gray-200/90 rounded-2xl overflow-hidden transition-all duration-150 shadow-xs"
                >
                  <button
                    onClick={() => toggle(idx)}
                    className={`w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-heading font-semibold text-sm sm:text-base transition-colors ${
                      isOpen ? 'bg-emerald-50/70 text-[#064E3B]' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isOpen ? 'bg-[#064E3B] text-[#F3C64D]' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {idx + 1}
                      </span>
                      <h3 className="text-gray-900 font-heading font-semibold text-sm sm:text-base inline">
                        {faq.question}
                      </h3>
                    </span>
                    <span className="text-[#064E3B] shrink-0">
                      {isOpen ? <CaretUp className="w-5 h-5" /> : <CaretDown className="w-5 h-5 text-gray-400" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-3 bg-white text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-emerald-100/60">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
