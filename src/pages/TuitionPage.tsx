import React from 'react';
import { PackagePlan } from '../types';
import { PackagesSection } from '../components/PackagesSection';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { FAQSection } from '../components/FAQSection';
import { FinalCTASection } from '../components/FinalCTASection';

interface TuitionPageProps {
  packages: PackagePlan[];
  onSelectPackage: (pkg: PackagePlan) => void;
  onOpenTrial: () => void;
}

export const TuitionPage: React.FC<TuitionPageProps> = ({
  packages,
  onSelectPackage,
  onOpenTrial
}) => {
  return (
    <div className="bg-[#FAF7F0] min-h-screen">
      {/* Page Header */}
      <div className="bg-[#13263D] text-[#F5F0E6] py-14 px-4 sm:px-6 lg:px-8 border-b border-[#A47A46]/20">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-widest">
            TUITION &amp; PLANS
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#F5F0E6] font-semibold">
            Affordable 1-on-1 Quran Tuition Plans
          </h1>
          <p className="text-sm sm:text-base text-[#E7DBC2]/80 max-w-2xl mx-auto font-sans">
            Transparent monthly plans with family discounts and a 3-day free trial. Choose classes 2 to 5 days per week.
          </p>
        </div>
      </div>

      <PackagesSection
        packages={packages}
        onSelectPackage={onSelectPackage}
        onOpenTrial={onOpenTrial}
      />

      <WhyChooseUs onOpenTrial={onOpenTrial} />
      <FAQSection onOpenTrial={onOpenTrial} />
      <FinalCTASection onOpenTrial={onOpenTrial} />
    </div>
  );
};
