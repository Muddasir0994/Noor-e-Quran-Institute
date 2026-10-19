import React from 'react';
import { ArrowRight, ShieldCheck, Heart } from '@phosphor-icons/react';

interface StorySectionProps {
  onOpenTrial: () => void;
}

export const StorySection: React.FC<StorySectionProps> = ({ onOpenTrial }) => {
  return (
    <section className="py-20 lg:py-28 bg-[#FAF7F0] border-b border-[#E7DBC2] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Peaceful, Composed Study Atmosphere Photograph */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-sm overflow-hidden border border-[#E7DBC2] bg-[#F5F0E6] shadow-xs">
              <img
                src="/images/unsplash/child-reading-quran.webp"
                alt="Young student reading the Holy Quran"
                className="w-full h-[380px] sm:h-[440px] object-cover filter brightness-[0.98]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13263D]/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Subtle Brass Accent Line */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 border-b-2 border-r-2 border-[#A47A46]/40 pointer-events-none hidden sm:block" />
          </div>

          {/* Right Column: Editorial Typography & Story */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-[11px] font-sans font-bold text-[#8C6D37] uppercase tracking-widest">
              OUR MISSION
            </p>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#13263D] font-semibold leading-[1.12] tracking-tight">
              Trusted by families<br />
              <span className="italic font-normal">around the world.</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-600 font-sans leading-relaxed">
              We bridge traditional classical Quranic pedagogy with contemporary global accessibility. Every student receives the focused dedication of an accredited teacher who instills not just recitation proficiency, but sincere love and understanding of Allah&apos;s Book.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-sans text-gray-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#A47A46]" weight="regular" />
                <span>100% Certified Scholars</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#A47A46]" weight="regular" />
                <span>Gentle, Nurturing Pedagogy</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenTrial}
                className="inline-flex items-center gap-2 text-xs font-sans font-bold text-[#13263D] hover:text-[#A47A46] transition-colors py-2 border-b border-[#13263D]/30 hover:border-[#A47A46] cursor-pointer"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
