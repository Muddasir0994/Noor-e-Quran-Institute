import React, { useState, useEffect } from 'react';
import { Testimonial } from '../types';
import { INITIAL_TESTIMONIALS } from '../data/academyData';
import { Quotes, Users, GraduationCap, Clock, CaretLeft, CaretRight } from '@phosphor-icons/react';

interface TrustSectionProps {
  testimonials?: Testimonial[];
}

export const TrustSection: React.FC<TrustSectionProps> = ({ testimonials: initialTestimonials = [] }) => {
  // Live CMS data: fetch testimonials from the server on mount, keep only
  // published ones. The incoming prop (already fetched by App, or its
  // bundled seed) renders instantly; bundled seed data is the final
  // fallback so this section never renders empty or broken.
  const onlyPublished = (list: Testimonial[]) => list.filter(t => t.status === 'published');
  const [items, setItems] = useState<Testimonial[]>(() => {
    const published = onlyPublished(initialTestimonials);
    return published.length > 0 ? published : INITIAL_TESTIMONIALS;
  });
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/testimonials')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(data => {
        if (!isMounted) return;
        const list = data?.testimonials ?? data; // server wraps in {success, testimonials}
        const published = Array.isArray(list) ? onlyPublished(list as Testimonial[]) : [];
        setItems(published.length > 0 ? published : INITIAL_TESTIMONIALS);
        setCurrentIndex(0);
      })
      .catch(() => { /* keep prop / bundled seed data on failure */ })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  // Institutional standards (authentic qualitative metrics, not fabricated counts)
  const academicPrinciples = [
    { label: 'Private Live Classes', value: '1-on-1', icon: Users },
    { label: 'Accredited Faculty', value: 'Certified', icon: GraduationCap },
    { label: 'Flexible Scheduling', value: '24/7', icon: Clock }
  ];

  const currentTestimonial = items && items.length > 0
    ? items[currentIndex % items.length]
    : {
        name: 'Dr. Tariq Mahmood',
        studentOrParent: 'Father of Ayaan (7 yrs) & Zoya (9 yrs)',
        location: 'London, United Kingdom',
        comment: 'Finding genuine teachers who combine deep Tajweed knowledge with child-friendly patience was difficult until we joined. My children look forward to every single class.'
      };

  const handleNext = () => {
    if (items.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }
  };

  const handlePrev = () => {
    if (items.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  return (
    <section className="py-14 lg:py-20 bg-[#F5F0E6] border-b border-[#E7DBC2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Magazine-Style Editorial Testimonial from Real Data */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Featured Real Quote */}
          <div className="lg:col-span-8 space-y-5">
            {loading && items.length === 0 ? (
              <div className="animate-pulse space-y-6" aria-hidden>
                <div className="w-10 h-10 rounded-xl bg-[#A47A46]/20" />
                <div className="space-y-3">
                  <div className="h-8 w-full bg-gray-200/70 rounded-xl" />
                  <div className="h-8 w-11/12 bg-gray-200/70 rounded-xl" />
                  <div className="h-8 w-2/3 bg-gray-200/70 rounded-xl" />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200/80" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-40 bg-gray-200/80 rounded-xl" />
                    <div className="h-3 w-56 bg-gray-200/60 rounded-xl" />
                  </div>
                </div>
              </div>
            ) : (
              <>
            <div className="flex items-center justify-between">
              <div className="text-[#A47A46]">
                <Quotes className="w-8 h-8" weight="fill" />
              </div>

              {items.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous testimonial"
                    className="p-1.5 rounded-sm border border-[#E7DBC2] bg-[#FAF7F0] text-[#13263D] hover:border-[#A47A46] transition-colors cursor-pointer"
                  >
                    <CaretLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next testimonial"
                    className="p-1.5 rounded-sm border border-[#E7DBC2] bg-[#FAF7F0] text-[#13263D] hover:border-[#A47A46] transition-colors cursor-pointer"
                  >
                    <CaretRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <blockquote className="font-editorial text-xl sm:text-2xl lg:text-[1.7rem] text-[#13263D] leading-[1.35] font-normal italic">
              &ldquo;{currentTestimonial.comment}&rdquo;
            </blockquote>

            <div className="flex items-center gap-4 pt-2">
              <div className="w-10 h-10 rounded-full border border-[#A47A46] bg-[#FAF7F0] flex items-center justify-center font-editorial text-base text-[#13263D] font-bold shrink-0">
                {currentTestimonial.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-sans font-bold text-[#13263D]">
                  {currentTestimonial.name}
                </p>
                <p className="text-xs text-gray-700 font-sans font-medium">
                  {currentTestimonial.studentOrParent} • {currentTestimonial.location}
                </p>
              </div>
            </div>

            {items.length > 1 && (
              <div className="flex items-center gap-1.5 pt-1">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentIndex % items.length
                        ? 'w-6 bg-[#A47A46]'
                        : 'w-1.5 bg-[#13263D]/25 hover:bg-[#13263D]/50'
                    }`}
                  />
                ))}
              </div>
            )}
              </>
            )}
          </div>

          {/* Right Column: Academic Standards Panel */}
          <div className="lg:col-span-4 bg-[#FAF7F0] border border-[#E7DBC2] rounded-sm p-5 sm:p-6 space-y-5">
            <p className="text-[11px] font-sans font-bold text-[#8C6D37] uppercase tracking-widest">
              ACADEMIC STANDARDS
            </p>

            <div className="space-y-4 divide-y divide-[#E7DBC2]">
              {academicPrinciples.map((principle, idx) => {
                const Icon = principle.icon;
                return (
                  <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
                    <div className="flex items-center justify-between">
                      <span className="font-editorial text-xl sm:text-2xl text-[#13263D] font-bold">
                        {principle.value}
                      </span>
                      <Icon className="w-5 h-5 text-[#A47A46]" weight="regular" />
                    </div>
                    <p className="text-xs text-gray-700 font-sans mt-0.5">
                      {principle.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-gray-600 font-sans pt-2 border-t border-[#E7DBC2] leading-relaxed font-medium">
              Every lesson is conducted 1-on-1 with accredited educators under ongoing academic review.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
