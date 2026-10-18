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
      
      {/* 1. Top Utility Ribbon: Clean & Restrained */}
      <div className="bg-[#0B332D] text-[#F8F5EE] py-1.5 px-4 sm:px-8 flex justify-between items-center text-xs border-b border-[#B79A62]/20 font-sans">
        <div className="flex items-center gap-3">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B79A62]"></span>
          <span className="text-[#E8E0D1] text-[11px] sm:text-xs font-normal tracking-wide">
            1-on-1 Certified Online Quran Academy • <span className="text-[#B79A62] font-semibold">3-Day Free Trial</span>
          </span>
        </div>

        {/* Right Utility: Portals & Contact */}
        <div className="flex items-center gap-4 text-[11px] text-[#E8E0D1]">
          <a
            href="https://wa.me/923274496163"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#B79A62] transition-colors hidden sm:inline-flex items-center gap-1.5"
          >
            <span>WhatsApp: +92 327 4496163</span>
          </a>
          <span className="text-[#B79A62]/40 hidden sm:inline">|</span>
          <button
            onClick={() => handlePortalNavigation('classroom')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Classroom Studio
          </button>
          <span className="text-[#B79A62]/40">|</span>
          {currentUser ? (
            <button
              onClick={() => handlePortalNavigation(getPortalView())}
              className="text-[#B79A62] font-medium hover:underline cursor-pointer"
            >
              My Portal
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth && onOpenAuth('student', 'login')}
              className="text-[#E8E0D1] hover:text-white font-medium cursor-pointer"
            >
              Portal Login
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Editorial Navbar */}
      <div className={`w-full bg-[#FCFBF8] border-b border-[#E8E0D1] transition-all duration-300 ${isScrolled ? 'shadow-xs py-3' : 'py-4'}`}>
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
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 object-contain rounded-xl border-2 border-[#B79A62]/60 bg-white p-1.5 shadow-lg group-hover:border-[#B79A62] group-hover:shadow-xl transition-all group-hover:scale-105 shrink-0"
              width="88"
              height="88"
            />

            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#0B332D]">
                  Noor E Quran
                </span>
                <span className="text-[11px] sm:text-xs tracking-widest uppercase text-[#B79A62] font-bold">
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
                      ? 'text-[#0B332D] font-semibold'
                      : 'text-gray-600 hover:text-[#0B332D]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#B79A62] rounded-full" />
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
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#0B332D] py-1 px-2 rounded-sm border border-transparent hover:border-[#E8E0D1] transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#B79A62]" />
                <span>{selectedLang}</span>
                <CaretDown className="w-3 h-3 text-gray-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-md py-1 z-50 text-xs font-sans">
                  {['English', 'العربية (Arabic)', 'اردو (Urdu)'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang.split(' ')[0]);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#F8F5EE] text-gray-700 hover:text-[#0B332D]"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Action Button: Squared, Editorial, Deep Emerald */}
            <button
              onClick={() => onOpenTrial()}
              className="px-5 py-2.5 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Book Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B79A62]" />
            </button>

          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-sm text-[#0B332D] hover:bg-[#F8F5EE] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FCFBF8] border-b border-[#E8E0D1] px-4 py-6 shadow-lg space-y-4">
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
                      ? 'bg-[#F8F5EE] text-[#0B332D] font-bold border-l-2 border-[#B79A62]'
                      : 'text-gray-700 hover:bg-[#F8F5EE]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E8E0D1] space-y-3">
            <button
              onClick={() => {
                onOpenTrial();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#0B332D] text-[#F8F5EE] text-xs font-semibold uppercase tracking-wider rounded-sm text-center flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Book Your Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#B79A62]" />
            </button>

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
              <button
                onClick={() => {
                  handlePortalNavigation('classroom');
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 border border-[#E8E0D1] rounded-sm text-[#0B332D] hover:bg-[#F8F5EE]"
              >
                Classroom Studio
              </button>

              {currentUser ? (
                <button
                  onClick={() => {
                    handlePortalNavigation(getPortalView());
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 bg-[#B79A62] text-[#07221E] font-bold rounded-sm"
                >
                  My Portal
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth && onOpenAuth('student', 'login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-3 border border-[#0B332D] text-[#0B332D] font-medium rounded-sm"
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
