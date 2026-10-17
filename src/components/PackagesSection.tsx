import React, { useState } from 'react';
import { PackagePlan } from '../types';
import { 
  Check, 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Globe, 
  Question, 
  Users, 
  Handshake, 
  ArrowRight 
} from '@phosphor-icons/react';

interface PackagesSectionProps {
  packages: PackagePlan[];
  onSelectPackage: (pkg: PackagePlan) => void;
  onOpenTrial: () => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages,
  onSelectPackage,
  onOpenTrial
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'PKR' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'AED'>('USD');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code || couponLoading) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.valid && typeof data.discountPercent === 'number') {
        setAppliedCoupon({ code: code.toUpperCase(), discountPercent: data.discountPercent });
        setCouponCode('');
      } else {
        setAppliedCoupon(null);
        setCouponError(data.reason || 'This coupon code is not valid.');
      }
    } catch {
      setCouponError('Could not validate the coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const getPriceValue = (pkg: PackagePlan): number => {
    switch (selectedCurrency) {
      case 'PKR':
        return pkg.monthlyFeePKR;
      case 'GBP':
        return pkg.monthlyFeeGBP;
      case 'EUR':
        return pkg.monthlyFeeEUR;
      case 'CAD':
        return pkg.monthlyFeeCAD;
      case 'AUD':
        return pkg.monthlyFeeAUD;
      case 'AED':
        return pkg.monthlyFeeAED;
      case 'USD':
      default:
        return pkg.monthlyFeeUSD;
    }
  };

  const formatPrice = (value: number): string => {
    switch (selectedCurrency) {
      case 'PKR':
        return `₨ ${value.toLocaleString()}`;
      case 'GBP':
        return `£${value}`;
      case 'EUR':
        return `€${value}`;
      case 'CAD':
        return `C$${value}`;
      case 'AUD':
        return `A$${value}`;
      case 'AED':
        return `AED ${value}`;
      case 'USD':
      default:
        return `$${value}`;
    }
  };

  const getPrice = (pkg: PackagePlan) => formatPrice(getPriceValue(pkg));

  const getDiscountedPrice = (pkg: PackagePlan): string => {
    if (!appliedCoupon) return getPrice(pkg);
    const discounted = Math.round(getPriceValue(pkg) * (1 - appliedCoupon.discountPercent / 100) * 100) / 100;
    return formatPrice(discounted);
  };

  return (
    <section id="packages" className="py-20 bg-[#FAF9F5] border-y border-[#064E3B]/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-badge text-[#064E3B] text-[11px] font-extrabold uppercase tracking-widest mb-3">
            <CreditCard className="w-3.5 h-3.5 text-[#A16207]" weight="duotone" />
            <span>Affordable & Transparent Tuition</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#064E3B] tracking-tight">
            Flexible 1-on-1 Learning Plans
          </h2>
          <p className="text-gray-600 mt-3 text-sm sm:text-base max-w-2xl mx-auto">
            All plans include 100% individual lessons with certified Male or Female scholars, personalized pacing, monthly progress reports, and our full <strong>3-Day Free Trial</strong> before payment.
          </p>

          {/* Currency Switcher Pill Bar */}
          <div className="mt-8 inline-flex items-center gap-1.5 p-1.5 glass-card-light rounded-2xl flex-wrap justify-center">
            <div className="px-3 py-1 text-xs font-bold text-gray-500 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#064E3B]" weight="duotone" />
              <span>Select Currency:</span>
            </div>
            {(['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'AED', 'PKR'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCurrency === curr
                    ? 'bg-[#064E3B] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#064E3B] hover:bg-emerald-50'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Coupon Code */}
          <div className="mt-5 flex flex-col items-center">
            {appliedCoupon ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className="text-xs font-extrabold text-emerald-800">
                  {appliedCoupon.discountPercent}% off applied — {appliedCoupon.code}
                </span>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-[11px] font-bold text-gray-500 hover:text-red-600 underline underline-offset-2 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 p-1.5 glass-card-light rounded-2xl">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleApplyCoupon(); }}
                    placeholder="Have a coupon code?"
                    disabled={couponLoading}
                    className="px-3 py-1.5 text-xs bg-transparent outline-none text-[#064E3B] font-semibold placeholder:text-gray-400 placeholder:font-medium w-44"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-[#064E3B] text-white hover:bg-[#032B21] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {couponLoading ? 'Checking…' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs font-bold text-red-600">{couponError}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between relative ${
                pkg.isPopular
                  ? 'glass-gold border-2 border-[#D4A72C] shadow-xl scale-[1.03] ring-4 ring-[#D4A72C]/15 z-10'
                  : 'glass-card-light hover:shadow-md hover:-translate-y-1'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gold-gradient-btn text-[#032B21] text-[11px] font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-md">
                  ★ Most Popular for Kids
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-extrabold text-[#064E3B] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    {pkg.daysPerWeek}
                  </span>
                  {pkg.badge && !pkg.isPopular && (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      {pkg.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-heading font-extrabold text-[#064E3B] mt-2">
                  {pkg.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {pkg.description}
                </p>

                <div className="mt-5 mb-5 p-4 bg-[#FAF9F5] rounded-2xl border border-gray-200/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-heading font-extrabold text-[#064E3B]">
                      {appliedCoupon ? getDiscountedPrice(pkg) : getPrice(pkg)}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">/ month</span>
                  </div>
                  {appliedCoupon && (
                    <div className="text-xs text-gray-400 font-medium">
                      <span className="line-through">{getPrice(pkg)} / month</span>
                      <span className="ml-1.5 no-underline text-emerald-700 font-bold">−{appliedCoupon.discountPercent}%</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-600 font-medium border-t border-gray-200/60 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#A16207]" />
                      {pkg.classesPerMonth} Classes/Mo
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#A16207]" />
                      {pkg.classDurationMinutes} Mins/Class
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6">
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all shadow-xs cursor-pointer ${
                    pkg.isPopular
                      ? 'bg-[#064E3B] text-white hover:bg-[#032B21] active:scale-95'
                      : 'gold-gradient-btn text-[#032B21] active:scale-95'
                  }`}
                >
                  ENROLL IN THIS PLAN
                </button>
                <button
                  onClick={onOpenTrial}
                  className="w-full py-2 text-center text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  Or Start 3-Day Free Trial →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sibling & Family Discount Callout */}
        <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-[#D4A72C]/10 to-emerald-900/10 border border-[#D4A72C]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A72C]/20 border border-[#D4A72C]/50 flex items-center justify-center text-[#064E3B] shrink-0 font-extrabold">
              <Handshake className="w-5 h-5 text-[#064E3B]" weight="duotone" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#064E3B]">
                Family & Sibling Discount Available
              </h4>
              <p className="text-xs text-gray-600">
                Enrolling 2 or more children? Receive a <strong>15% automatic discount</strong> on second and third student enrollments.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTrial}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#064E3B] text-white hover:bg-[#032B21] shrink-0 cursor-pointer"
          >
            Claim Family Trial
          </button>
        </div>

        {/* Bottom Assurance Note */}
        <div className="mt-8 bg-white rounded-3xl p-6 sm:p-7 border border-emerald-950/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#064E3B] flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="w-6 h-6 text-[#064E3B]" weight="duotone" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#064E3B]">100% Satisfaction & Zero Advance Commitment</h4>
              <p className="text-xs text-gray-600">
                Take 3 full 1-on-1 trial classes with your assigned tutor. No credit card required. Only pay if you are completely delighted with the teacher.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenTrial}
              className="gold-gradient-btn text-[#064E3B] px-5 py-3 rounded-xl font-extrabold text-xs shadow-xs cursor-pointer"
            >
              BOOK 3-DAY FREE TRIAL
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
