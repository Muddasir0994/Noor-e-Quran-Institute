import React from 'react';
import { Link } from 'react-router-dom';
import {
  YoutubeLogo,
  InstagramLogo,
  FacebookLogo,
  WhatsappLogo,
  Envelope
} from '@phosphor-icons/react';

interface FooterProps {
  onOpenTrial?: (courseName?: string) => void;
  onOpenLegal?: (type: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTrial,
  onOpenLegal
}) => {
  const socialLinks = [
    { name: 'Instagram', url: 'https://www.instagram.com/noore_quraninstitute', icon: InstagramLogo },
    { name: 'Facebook', url: 'https://www.facebook.com/share/14pNXeMTM7o/', icon: FacebookLogo },
    { name: 'YouTube', url: 'https://www.youtube.com/@NooreQuranInstitute', icon: YoutubeLogo },
    { name: 'WhatsApp', url: 'https://wa.me/923274496163', icon: WhatsappLogo }
  ];

  return (
    <footer className="bg-[#0C1A2E] text-[#E7DBC2] pt-16 pb-12 border-t border-[#A47A46]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Minimal Quranic Calligraphy Accent */}
        <div className="pb-10 border-b border-[#A47A46]/15 text-center max-w-xl mx-auto space-y-2">
          <p className="font-arabic text-xl text-[#A47A46] font-normal" dir="rtl">
            وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
          </p>
          <p className="text-xs text-[#E7DBC2]/60 font-sans italic">
            &ldquo;And recite the Quran with measured, rhythmic recitation.&rdquo; — Surah Al-Muzzammil (73:4)
          </p>
        </div>

        {/* 5-Column Grid: Brand + 4 Structured Editorial Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 py-12">
          
          {/* Brand Column (Col 1-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-4">
              <img
                src="/branding/logo.webp?v=2"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/branding/logo.png?v=2'; }}
                alt="Noor E Quran Institute Official Seal"
                className="w-18 h-18 sm:w-22 sm:h-22 object-contain rounded-xl border-2 border-[#A47A46]/70 bg-white p-1.5 shadow-xl shrink-0"
                width="88"
                height="88"
              />
              <div>
                <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#F5F0E6] tracking-tight block">
                  Noor E Quran Institute
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[#A47A46] font-semibold">
                  Global Online Islamic Academy
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#E7DBC2]/70 font-sans leading-relaxed max-w-xs">
              Premier international Islamic academy dedicated to patient, certified 1-on-1 Quran and Tajweed education for families worldwide.
            </p>

            <p className="text-xs text-[#A47A46] font-sans">
              contact.noorequraninstitute@gmail.com
            </p>
          </div>

          {/* Column 1: Courses (Col 5-6) */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-wider">
              Courses
            </p>
            <ul className="space-y-2 text-xs font-sans text-[#E7DBC2]/80">
              <li>
                <Link to="/quran-reading-nazra" className="hover:text-white transition-colors">
                  Quran Reading
                </Link>
              </li>
              <li>
                <Link to="/quran-with-tajweed" className="hover:text-white transition-colors">
                  Tajweed
                </Link>
              </li>
              <li>
                <Link to="/quran-memorization-hifz" className="hover:text-white transition-colors">
                  Hifz-ul-Quran
                </Link>
              </li>
              <li>
                <Link to="/islamic-studies" className="hover:text-white transition-colors">
                  Islamic Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Quick Links (Col 7-8) */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-wider">
              Quick Links
            </p>
            <ul className="space-y-2 text-xs font-sans text-[#E7DBC2]/80">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="hover:text-white transition-colors">
                  Teachers
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-white transition-colors">
                  Fee Packages
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Blog & Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support (Col 9-10) */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-wider">
              Support
            </p>
            <ul className="space-y-2 text-xs font-sans text-[#E7DBC2]/80">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Stay Connected (Col 11-12) */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-[11px] font-sans font-bold text-[#A47A46] uppercase tracking-wider">
              Stay Connected
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="w-8 h-8 rounded-sm bg-[#13263D] border border-[#A47A46]/30 flex items-center justify-center text-[#A47A46] hover:text-white hover:border-[#A47A46] transition-colors"
                  >
                    <Icon className="w-4 h-4" weight="regular" />
                  </a>
                );
              })}
            </div>
            <p className="text-[11px] text-[#E7DBC2]/50 font-sans pt-2">
              WhatsApp Support: <br />
              <span className="text-[#A47A46]">+92 327 4496163</span>
            </p>
          </div>

        </div>

        {/* Bottom Minimal Copyright Bar */}
        <div className="pt-8 border-t border-[#A47A46]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#E7DBC2]/50 font-sans">
          <p>© {new Date().getFullYear()} Noor E Quran Institute. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <span>•</span>
            <span>Worldwide Online Education</span>
            <span>•</span>
            <span className="opacity-75">Photos: <a href="https://unsplash.com/@abdu3h" target="_blank" rel="noopener noreferrer" className="hover:underline">Abdullah Arif</a>, <a href="https://unsplash.com/@alfasy" target="_blank" rel="noopener noreferrer" className="hover:underline">Mishary Alafasy</a>, <a href="https://unsplash.com/@lemonmelon" target="_blank" rel="noopener noreferrer" className="hover:underline">SR</a>, <a href="https://unsplash.com/@masjidmaba" target="_blank" rel="noopener noreferrer" className="hover:underline">Masjid MABA</a>, <a href="https://unsplash.com/@andri_helmansyah" target="_blank" rel="noopener noreferrer" className="hover:underline">Andri Helmansyah</a> / Unsplash</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
