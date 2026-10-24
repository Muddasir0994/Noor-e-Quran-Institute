import React from 'react';
import { Link } from 'react-router-dom';
import { AboutSection } from '../components/AboutSection';
import { TrustSection } from '../components/TrustSection';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { StorySection } from '../components/StorySection';
import { FinalCTASection } from '../components/FinalCTASection';

interface AboutPageProps {
  onOpenTrial: () => void;
  onOpenEnroll: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenTrial, onOpenEnroll }) => {
  return (
    <div className="bg-[#FAF7F0] min-h-screen">
      {/* Page Header */}
      <div className="bg-[#13263D] text-[#F5F0E6] py-14 px-4 sm:px-6 lg:px-8 border-b border-[#A47A46]/20">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-widest">
            OUR HERITAGE &amp; MISSION
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#F5F0E6] font-semibold">
            About Noor E Quran Institute
          </h1>
          <p className="text-sm sm:text-base text-[#E7DBC2]/80 max-w-2xl mx-auto font-sans">
            Dedicated to providing authentic, certified, and deeply respectful Quranic education to families across the globe.
          </p>
        </div>
      </div>

      <AboutSection onOpenTrial={onOpenTrial} onOpenEnroll={onOpenEnroll} />
      <StorySection onOpenTrial={onOpenTrial} />
      <WhyChooseUs onOpenTrial={onOpenTrial} />
      <TrustSection />

      {/* Founder */}
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-[#13263D] text-[#F5F0E6] rounded-2xl border border-[#A47A46]/30 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8">
          <img
            src="/images/author/m-muddasir-hameed.jpg"
            alt="M Muddasir Hameed, founder of Noor E Quran Institute"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-2 border-[#A47A46]"
            loading="lazy"
          />
          <div className="text-center sm:text-left space-y-3">
            <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-widest">
              Meet the Founder
            </p>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold">
              Founded &amp; Managed by M Muddasir Hameed
            </h2>
            <p className="text-sm sm:text-base text-[#E7DBC2]/90 leading-relaxed">
              M Muddasir Hameed is an Islamic scholar, researcher, and founder of Noor E Quran
              Institute. He holds a Bachelor of Islamic Studies, an M.A.-equivalent (Aalmia) in
              Islamic &amp; Arabic Studies, and a post-graduate specialization in Islamic
              Jurisprudence (Takhassus fil Fiqh).
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-1">
              <Link
                to="/author/m-muddasir-hameed"
                className="text-sm font-semibold text-[#A47A46] underline underline-offset-4 hover:text-[#F5F0E6]"
              >
                Visit his author profile
              </Link>
              <a
                href="https://noorequraninstitute.blogspot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[#A47A46] underline underline-offset-4 hover:text-[#F5F0E6]"
              >
                Read his blog
              </a>
            </div>
          </div>
        </div>
      </section>

      <FinalCTASection onOpenTrial={onOpenTrial} />
    </div>
  );
};
