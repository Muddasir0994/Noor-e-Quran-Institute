import React, { useState, useEffect } from 'react';
import { X, Quotes } from '@phosphor-icons/react';
import { getRandomQuote, type DailyQuote } from '../data/dailyQuotes';

/**
 * DailyQuotePopup — elegant modal shown on every public homepage load.
 * Displays one random quote from today's 10 date-seeded quotes
 * (Arabic + Urdu + reference). A fresh page load picks a new random quote.
 * Pure modal overlay — never a new window/tab or a separate route.
 */
export const DailyQuotePopup: React.FC = () => {
  // Picked once per mount: every page load / refresh shows a (random) quote.
  const [quote] = useState<DailyQuote>(() => getRandomQuote());
  const [isOpen, setIsOpen] = useState(true);

  const onClose = () => setIsOpen(false);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Daily Islamic quote"
    >
      <div
        className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl shadow-2xl border border-[#B79A62]/40 overflow-hidden relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#B79A62] via-[#F3C64D] to-[#B79A62]" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close quote"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#0B332D]/5 hover:bg-[#0B332D]/10 text-[#0B332D] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={18} weight="bold" />
        </button>

        <div className="px-6 sm:px-10 py-8 text-center">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="h-px w-8 bg-[#B79A62]/60" />
            <Quotes size={20} className="text-[#B79A62]" weight="fill" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B79A62]">
              Daily Inspiration
            </span>
            <Quotes size={20} className="text-[#B79A62] rotate-180" weight="fill" />
            <span className="h-px w-8 bg-[#B79A62]/60" />
          </div>

          {/* Arabic quote */}
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-2xl sm:text-[1.7rem] leading-[2.2] text-[#0B332D] mb-5"
          >
            {quote.arabic}
          </p>

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="h-px w-16 bg-[#B79A62]/50" />
            <span className="w-1.5 h-1.5 rotate-45 bg-[#B79A62]" />
            <span className="h-px w-16 bg-[#B79A62]/50" />
          </div>

          {/* Urdu translation */}
          <p dir="rtl" lang="ur" className="font-urdu text-lg leading-[2.1] text-[#3d4a45] mb-4">
            {quote.urdu}
          </p>

          {/* Reference */}
          <p className="text-xs font-semibold tracking-wide text-[#B79A62] uppercase">
            — {quote.reference}
          </p>
        </div>

        {/* Footer strip */}
        <div className="bg-[#064E3B] px-6 py-3 text-center">
          <p className="text-[11px] text-white/80 tracking-wide">
            A new quote every day · Refresh for another
          </p>
        </div>
      </div>
    </div>
  );
};
