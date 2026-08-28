import React, { useState } from 'react';
import { WhatsappLogo, X, PaperPlaneTilt } from '@phosphor-icons/react';

interface WhatsAppWidgetProps {
  onOpenTrial: () => void;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ onOpenTrial }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const quickPrompts = [
    'Assalam-o-Alaikum, I want to book a 3-Day Free Trial class.',
    'Assalam-o-Alaikum, what are the class timings and fee details?',
    'Assalam-o-Alaikum, do you have female tutors available for daughters?'
  ];

  const handleSend = (text: string) => {
    const message = encodeURIComponent(text.trim() || 'Assalam-o-Alaikum Noor E Quran Institute');
    window.open(`https://wa.me/923274496163?text=${message}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* WhatsApp Chat Popup Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 glass-floating rounded-3xl shadow-2xl border border-[#D4A72C]/30 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#064E3B] text-white p-4 flex items-center justify-between bg-islamic-pattern">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-inner">
                <WhatsappLogo className="w-6 h-6" weight="fill" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white">Noor E Quran Support</h4>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                  Online • WhatsApp Coordinator
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-emerald-50/40 space-y-3 text-xs">
            <div className="bg-white p-3 rounded-xl rounded-tl-none border border-gray-200/80 shadow-xs text-gray-800 space-y-1">
              <p className="font-semibold text-[#064E3B]">Assalam-o-Alaikum!</p>
              <p>Welcome to Noor E Quran Institute. How can we help you today with your Quran learning goals?</p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Quick Inquiries:</span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-2 rounded-lg bg-white hover:bg-emerald-100/60 border border-gray-200 hover:border-emerald-300 text-gray-700 text-xs transition-colors cursor-pointer"
                >
                  💬 {prompt}
                </button>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-200/60">
              <span>Hotline: 0327-4496163</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenTrial();
                }}
                className="text-[#064E3B] font-bold underline cursor-pointer"
              >
                Free Trial Form →
              </button>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={customMsg}
              onChange={e => setCustomMsg(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customMsg.trim()) {
                  handleSend(customMsg);
                }
              }}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#064E3B]"
            />
            <button
              onClick={() => handleSend(customMsg || 'Assalam-o-Alaikum')}
              className="p-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors cursor-pointer"
              title="Open WhatsApp"
            >
              <PaperPlaneTilt className="w-4 h-4" weight="bold" />
            </button>
          </div>

        </div>
      )}

      {/* Floating Action Launcher Button */}
      <button
        id="floating-whatsapp-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white focus:outline-none relative group cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <WhatsappLogo className="w-8 h-8" weight="fill" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
        
        {/* Tooltip on hover */}
        <span className="absolute right-16 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md hidden sm:block">
          Chat on WhatsApp (0327-4496163)
        </span>
      </button>
    </div>
  );
};
