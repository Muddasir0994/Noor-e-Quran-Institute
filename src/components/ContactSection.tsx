import React, { useState } from 'react';
import { Phone, Envelope, Globe, WhatsappLogo, PaperPlaneTilt, CheckCircle, Clock, YoutubeLogo, InstagramLogo, FacebookLogo, LinkedinLogo } from '@phosphor-icons/react';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !message.trim()) {
      setError('Please fill in your name and message.');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError('Please provide either an email or WhatsApp phone number so we can respond.');
      return;
    }

    setLoading(true);

    try {
      // 1. Dynamic import & save to Firestore on submit only
      try {
        const { createContactMessageInFirebase } = await import('../lib/firestoreService');
        await createContactMessageInFirebase({
          name,
          email,
          phone,
          subject: subject || 'General Inbound Inquiry',
          message
        });
      } catch (fErr) {
        console.warn('Firestore message save note:', fErr);
      }

      // 2. Also forward to API endpoint
      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, subject, message })
        });
      } catch (err) {
        console.warn('API forward error:', err);
      }

      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setError(err?.message || 'Failed to send message. Please message us directly on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-section" className="py-16 bg-[#FAF9F5] border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#064E3B]/10 text-[#064E3B] text-[11px] font-bold uppercase tracking-widest mb-2.5 border border-[#064E3B]/20">
            <Envelope className="w-3.5 h-3.5 text-[#A16207]" weight="duotone" />
            <span>24/7 Admissions & Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold text-[#064E3B] tracking-tight">
            Contact Academic Support
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            We are here to answer your questions, help you choose courses, and schedule your free trial.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Direct Contact Info (Col 1-5) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#064E3B] via-[#043327] to-[#022119] text-white rounded-3xl p-7 sm:p-9 shadow-lg flex flex-col justify-between space-y-6 relative overflow-hidden bg-islamic-pattern">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F3C64D] block mb-1">
                Official Channels
              </span>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                Noor E Quran Institute
              </h3>
              <p className="text-xs text-emerald-200 mt-1">
                Global Online Quran Learning System
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              
              {/* Primary WhatsApp */}
              <a
                href="https://wa.me/923274496163?text=Assalam-o-Alaikum%20Noor%20E%20Quran%20Institute"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3.5 p-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <WhatsappLogo className="w-5 h-5" weight="fill" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Primary WhatsApp (24/7)</span>
                  <span className="font-bold text-white group-hover:text-[#F3C64D] transition-colors">+92 327 4496163</span>
                </div>
              </a>

              {/* Secondary Phone */}
              <a
                href="tel:03360796786"
                className="flex items-start gap-3.5 p-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#064E3B] text-[#F3C64D] border border-[#F3C64D]/40 flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-5 h-5" weight="duotone" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Secondary Helpline</span>
                  <span className="font-bold text-white group-hover:text-[#F3C64D] transition-colors">+92 336 0796786</span>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:contact.noorequraninstitute@gmail.com"
                className="flex items-start gap-3.5 p-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#064E3B] text-[#F3C64D] border border-[#F3C64D]/40 flex items-center justify-center shrink-0 shadow-xs">
                  <Envelope className="w-5 h-5" weight="duotone" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Official Email</span>
                  <span className="font-medium text-white group-hover:text-[#F3C64D] transition-colors break-all">
                    contact.noorequraninstitute@gmail.com
                  </span>
                </div>
              </a>

              {/* Website */}
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-emerald-950/70 border border-emerald-700/60">
                <div className="w-9 h-9 rounded-xl bg-[#064E3B] text-[#F3C64D] border border-[#F3C64D]/40 flex items-center justify-center shrink-0 shadow-xs">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Classes Available</span>
                  <span className="font-medium text-white">Worldwide across all timezones</span>
                </div>
              </div>

              {/* Official Social Media Channels */}
              <div className="pt-2">
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block mb-2">Connect On Social Media</span>
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://www.youtube.com/@NooreQuranInstitute"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube Channel"
                    className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-emerald-800 border border-emerald-700/60 flex items-center justify-center text-emerald-200 hover:text-[#F3C64D] transition-all"
                  >
                    <YoutubeLogo className="w-4 h-4" weight="duotone" />
                  </a>
                  <a
                    href="https://www.instagram.com/noore_quraninstitute"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Profile"
                    className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-emerald-800 border border-emerald-700/60 flex items-center justify-center text-emerald-200 hover:text-[#F3C64D] transition-all"
                  >
                    <InstagramLogo className="w-4 h-4" weight="duotone" />
                  </a>
                  <a
                    href="https://www.facebook.com/share/14pNXeMTM7o/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook Page"
                    className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-emerald-800 border border-emerald-700/60 flex items-center justify-center text-emerald-200 hover:text-[#F3C64D] transition-all"
                  >
                    <FacebookLogo className="w-4 h-4" weight="duotone" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/muddasir-hameed"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    className="w-8 h-8 rounded-lg bg-emerald-950/90 hover:bg-emerald-800 border border-emerald-700/60 flex items-center justify-center text-emerald-200 hover:text-[#F3C64D] transition-all"
                  >
                    <LinkedinLogo className="w-4 h-4" weight="duotone" />
                  </a>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-emerald-800 flex items-center gap-2 text-xs text-emerald-200">
              <Clock className="w-4 h-4 text-[#F3C64D]" />
              <span>Response Time: Typically within 15–30 minutes</span>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form Bento (Col 6-12) */}
          <div className="lg:col-span-7 bg-white p-7 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm space-y-6">
            
            <div>
              <h3 className="text-xl font-heading font-bold text-[#064E3B]">
                Send an Inquiry Note
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Have a specific question regarding class timings, fee structure, or tutor preferences? Send a note below.
              </p>
            </div>

            {success ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#064E3B] text-[#D4A72C] flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" weight="fill" />
                </div>
                <h4 className="font-heading font-bold text-lg text-[#064E3B]">
                  JazakAllah Khair! Message Received.
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 max-w-md mx-auto">
                  Our academy administration has received your message and will reply back to your email or WhatsApp number shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-xs font-bold text-[#064E3B] underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E3B] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">
                      WhatsApp / Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+92 327 4496163"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E3B] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E3B] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Question about Hifz course"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E3B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">
                    Message / Question <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please enter your inquiry or any requirements regarding classes..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAFAF7] border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#064E3B] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#064E3B] text-white hover:bg-[#043629] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 hover:translate-y-[-1px]"
                >
                  <PaperPlaneTilt className="w-4 h-4 text-[#D4A72C]" weight="duotone" />
                  <span>{loading ? 'Sending Message...' : 'Send Inquiry Message'}</span>
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
