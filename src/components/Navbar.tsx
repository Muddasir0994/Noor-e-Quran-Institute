import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleForEmail } from '../lib/roleUtils';
import {
  List,
  X,
  User,
  SignIn,
  SignOut,
  CaretDown,
  Globe,
  ArrowRight
} from '@phosphor-icons/react';

interface NavbarProps {
  onOpenTrial: (courseName?: string) => void;
  onOpenEnroll?: (courseName?: string) => void;
  onOpenAuth?: (role?: 'student' | 'teacher', mode?: 'login' | 'signup') => void;
  onSelectAppView?: (view: 'landing' | 'classroom' | 'student' | 'teacher' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTrial,
  onOpenEnroll,
  onOpenAuth,
  onSelectAppView
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/courses', label: 'Courses' },
    { path: '/teachers', label: 'Teachers' },
    { path: '/packages', label: 'Pricing' },
    { path: '/blog', label: 'Blog' },
    { path: '/about', label: 'About' }
  ];

  const mobileNavLinks = [
    { path: '/', label: 'Home' },
    { path: '/courses', label: 'Courses' },
    { path: '/teachers', label: 'Teachers' },
    { path: '/packages', label: 'Pricing & Tuition Plans' },
    { path: '/how-it-works', label: 'How It Works' },
    { path: '/blog', label: 'Blog & Articles' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/faq', label: 'FAQ' }
  ];

  const isLinkActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/blog') return location.pathname.startsWith('/blog');
    if (path === '/courses') return location.pathname.startsWith('/courses') || location.pathname.startsWith('/online-quran-classes');
    if (path === '/teachers') return location.pathname.startsWith('/teachers') || location.pathname.startsWith('/faculty');
    if (path === '/packages') return location.pathname.startsWith('/packages') || location.pathname.startsWith('/pricing');
    return location.pathname.startsWith(path);
  };

  const handlePortalNavigation = (view: 'student' | 'teacher' | 'classroom' | 'admin') => {
    if (onSelectAppView) {
      onSelectAppView(view);
    } else {
      navigate(`/${view}`);
    }
  };

  // BUG 4 fix: determine portal by email (teacher list) with profile role as fallback
  const getPortalView = (): 'student' | 'teacher' | 'admin' => {
    if (userProfile?.role === 'admin') return 'admin';
    if (userProfile?.role === 'teacher') return 'teacher';
    const email = currentUser?.email || userProfile?.email || '';
    return getRoleForEmail(email) === 'teacher' ? 'teacher' : 'student';
  };

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full transition-all duration-200">
      
      {/* 1. Top Utility Ribbon: portal links only (announcement text removed 2026-10-20 per user — it crowded the bar on mobile) */}
      <div className="bg-[#13263D] text-[#F5F0E6] py-1.5 px-4 sm:px-8 flex justify-end items-center text-xs border-b border-[#A47A46]/20 font-sans">

        {/* Right Utility: Portals & Contact */}
        <div className="flex items-center gap-4 text-[11px] text-[#E7DBC2]">
          <a
            href="https://wa.me/923274496163"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#A47A46] transition-colors hidden sm:inline-flex items-center gap-1.5"
          >
            <span>WhatsApp: +92 327 4496163</span>
          </a>
          <span className="text-[#A47A46]/40 hidden sm:inline">|</span>
          {currentUser ? (
            <button
              onClick={() => handlePortalNavigation(getPortalView())}
              className="text-[#A47A46] font-medium hover:underline cursor-pointer"
            >
              My Portal
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth && onOpenAuth('student', 'login')}
              className="text-[#E7DBC2] hover:text-white font-medium cursor-pointer"
            >
              Portal Login
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Editorial Navbar */}
      <div className={`w-full bg-[#FAF7F0] border-b border-[#E7DBC2] transition-all duration-300 ${isScrolled ? 'shadow-xs py-2' : 'py-2.5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo: Official Academy Seal + Typography */}
          <Link
            to="/"
            className="flex items-center gap-3.5 text-left group cursor-pointer py-1"
          >
            <img
              src="/branding/logo.webp?v=2"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/branding/logo.png?v=2'; }}
              alt="Noor E Quran Institute"
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 object-contain rounded-xl border-2 border-[#A47A46]/60 bg-white p-1.5 shadow-lg group-hover:border-[#A47A46] group-hover:shadow-xl transition-all group-hover:scale-105 shrink-0"
              width="64"
              height="64"
            />

            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#13263D]">
                  Noor E Quran
                </span>
                <span className="text-[11px] sm:text-xs tracking-widest uppercase text-[#A47A46] font-bold">
                  Institute
                </span>
              </div>
              <span className="block font-arabic text-xs sm:text-sm text-gray-500 font-medium leading-tight mt-0.5" dir="rtl">
                معهد نور القرآن الكريم
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links: Editorial, Spacious */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-sans font-medium transition-colors relative py-1 cursor-pointer ${
                    active
                      ? 'text-[#13263D] font-semibold'
                      : 'text-gray-600 hover:text-[#13263D]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#A47A46] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Language Switcher & Book Free Trial CTA */}
          <div className="hidden lg:flex items-center gap-5">
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#13263D] py-1 px-2 rounded-sm border border-transparent hover:border-[#E7DBC2] transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#A47A46]" />
                <span>{selectedLang}</span>
                <CaretDown className="w-3 h-3 text-gray-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-[#FAF7F0] border border-[#E7DBC2] rounded-sm shadow-md py-1 z-50 text-xs font-sans">
                  {['English', 'العربية (Arabic)', 'اردو (Urdu)'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang.split(' ')[0]);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#F5F0E6] text-gray-700 hover:text-[#13263D]"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Action Button: Midnight + Bronze (matches Design 3 palette) */}
            <button
              onClick={() => onOpenTrial()}
              className="group px-5 py-2.5 bg-[#13263D] text-[#F5F0E6] text-xs font-sans font-bold uppercase tracking-wider rounded-md hover:bg-[#A47A46] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>Book Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A47A46] group-hover:text-[#F5F0E6] group-hover:translate-x-0.5 transition-all duration-300" />
            </button>

          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-sm text-[#13263D] hover:bg-[#F5F0E6] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F0] border-b border-[#E7DBC2] px-4 py-6 shadow-lg space-y-4">
          <div className="space-y-1">
            {mobileNavLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-sm font-sans rounded-sm transition-colors ${
                    active
                      ? 'bg-[#F5F0E6] text-[#13263D] font-bold border-l-2 border-[#A47A46]'
                      : 'text-gray-700 hover:bg-[#F5F0E6]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E7DBC2] space-y-3">
            <button
              onClick={() => {
                onOpenTrial();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#13263D] text-[#F5F0E6] text-xs font-semibold uppercase tracking-wider rounded-sm text-center flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Book Your Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A47A46]" />
            </button>

            <div className="text-center text-xs pt-1">
              {currentUser ? (
                <button
                  onClick={() => {
                    handlePortalNavigation(getPortalView());
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 bg-[#A47A46] text-[#0C1A2E] font-bold rounded-sm"
                >
                  My Portal
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth && onOpenAuth('student', 'login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 border border-[#13263D] text-[#13263D] font-medium rounded-sm"
                >
                  Portal Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
