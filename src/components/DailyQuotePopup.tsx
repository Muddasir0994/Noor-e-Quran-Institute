import React, { useState, useEffect } from 'react';
import { X, Quotes } from '@phosphor-icons/react';
import { getRandomQuote, type DailyQuote } from '../data/dailyQuotes';

/**
 * DailyQuotePopup — premium modal shown on every public homepage load.
 * Displays one random quote from today's 10 date-seeded quotes
 * (Arabic + Urdu + reference). A fresh page load picks a new random quote.
 * Pure modal overlay — never a new window/tab or a separate route.
 */
export const DailyQuotePopup: React.FC = () => {
  // Picked once per mount: every page load / refresh shows a (random) quote.
  const [quote] = useState<DailyQuote>(() => getRandomQuote());
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  const onClose = () => setIsOpen(false);

  // Gentle entrance animation: fade + scale once mounted.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Escape key closes the modal (accessibility).
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-[2px] overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Daily Islamic quote"
    >
      <div
        className={`relative w-full max-w-lg my-8 transition-all duration-300 ease-out ${
          mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-3'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ornamental gold medallion overlapping the top edge */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <div className="w-10 h-10 rotate-45 bg-gradient-to-br from-[#C9AE7E] via-[#A47A46] to-[#8f7440] shadow-lg flex items-center justify-center">
            <span className="-rotate-45 text-[#13263D] text-lg leading-none select-none">✦</span>
          </div>
        </div>

        {/* Card */}
        <div className="relative bg-[#FDFBF7] rounded-[1.75rem] shadow-[0_30px_80px_-20px_rgba(19,38,61,0.45)] ring-1 ring-[#A47A46]/50 overflow-hidden">
          {/* Inner hairline gold frame (double-frame effect) */}
          <div className="pointer-events-none absolute inset-2.5 rounded-[1.35rem] border border-[#A47A46]/40" />

          {/* Gold top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#8f7440] via-[#F3C64D] to-[#8f7440]" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close quote"
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#13263D]/5 hover:bg-[#13263D]/15 text-[#13263D] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>

          <div className="px-6 sm:px-10 pt-9 pb-8 text-center">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-2.5 mb-6">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#A47A46]/70" />
              <Quotes size={18} className="text-[#A47A46]" weight="fill" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8f7440]">
                Daily Inspiration
              </span>
              <Quotes size={18} className="text-[#A47A46] rotate-180" weight="fill" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#A47A46]/70" />
            </div>

            {/* Arabic quote */}
            <p
              dir="rtl"
              lang="ar"
              className="font-arabic text-3xl sm:text-[2rem] leading-[2.1] text-[#13263D] mb-6"
            >
              {quote.arabic}
            </p>

            {/* Gold diamond divider */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-20 bg-gradient-to-r from-transparent to-[#A47A46]/60" />
              <span className="w-2 h-2 rotate-45 bg-gradient-to-br from-[#C9AE7E] to-[#8f7440] shadow-sm" />
              <span className="h-px w-20 bg-gradient-to-l from-transparent to-[#A47A46]/60" />
            </div>

            {/* Urdu translation — Jameel Noori Nastaleeq (self-hosted) */}
            <p dir="rtl" lang="ur" className="font-urdu text-xl leading-[2.6] text-[#2c3a35] mb-5">
              {quote.urdu}
            </p>

            {/* Reference */}
            <p className="text-xs font-bold tracking-[0.18em] text-[#8f7440] uppercase">
              — {quote.reference}
            </p>
          </div>

          {/* Footer strip */}
          <div className="relative bg-gradient-to-r from-[#0C1A2E] via-[#13263D] to-[#0C1A2E] px-6 py-3.5 text-center">
            <div className="absolute top-0 inset-x-8 h-px bg-[#A47A46]/40" />
            <p className="text-[11px] text-white/85 tracking-[0.14em] uppercase">
              A new quote every day <span className="text-[#A47A46] mx-1">✦</span> Refresh for another
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
