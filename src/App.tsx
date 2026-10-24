import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { IconContext } from '@phosphor-icons/react';
import { Course, PackagePlan, Tutor, Testimonial, Article, PageSeoConfig } from './types';
import { ALL_COURSES, ALL_PACKAGES, INITIAL_TUTORS, INITIAL_TESTIMONIALS, INITIAL_ARTICLES } from './data/academyData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SEOHead } from './components/SEOHead';
import { TilawatPlayer } from './components/TilawatPlayer';
import { SEO_PAGE_MAP } from './lib/seoConfig';
import { getRoleForEmail } from './lib/roleUtils';
import type { CountryKey } from './components/InternationalLanding';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppWidget } from './components/WhatsAppWidget';

// Main Landing Page
import { HomePage } from './pages/HomePage';

// Lazy-loaded secondary pages
const CoursesPage = lazy(() => import('./pages/CoursesPage').then(m => ({ default: m.CoursesPage })));
const TeachersPage = lazy(() => import('./pages/TeachersPage').then(m => ({ default: m.TeachersPage })));
const TuitionPage = lazy(() => import('./pages/TuitionPage').then(m => ({ default: m.TuitionPage })));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const BlogListPage = lazy(() => import('./pages/BlogListPage').then(m => ({ default: m.BlogListPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const AuthorPage = lazy(() => import('./pages/AuthorPage').then(m => ({ default: m.AuthorPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-loaded specialized landings & portals
const InternationalLanding = lazy(() => import('./components/InternationalLanding').then(m => ({ default: m.InternationalLanding })));
const KidsProgramLanding = lazy(() => import('./components/KidsProgramLanding').then(m => ({ default: m.KidsProgramLanding })));
const AdultsProgramLanding = lazy(() => import('./components/AdultsProgramLanding').then(m => ({ default: m.AdultsProgramLanding })));
const FemaleTutorLanding = lazy(() => import('./components/FemaleTutorLanding').then(m => ({ default: m.FemaleTutorLanding })));

const ClassroomStudio = lazy(() => import('./components/ClassroomStudio').then(m => ({ default: m.ClassroomStudio })));
const StudentPortal = lazy(() => import('./components/StudentPortal').then(m => ({ default: m.StudentPortal })));
const TeacherPortal = lazy(() => import('./components/TeacherPortal').then(m => ({ default: m.TeacherPortal })));
const AdminPortal = lazy(() => import('./admin/AdminPortal').then(m => ({ default: m.AdminPortal })));

// Lazy-loaded interactive modals
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const FreeTrialModal = lazy(() => import('./components/FreeTrialModal').then(m => ({ default: m.FreeTrialModal })));
const EnrollmentModal = lazy(() => import('./components/EnrollmentModal').then(m => ({ default: m.EnrollmentModal })));
const CourseDetailModal = lazy(() => import('./components/CourseDetailModal').then(m => ({ default: m.CourseDetailModal })));
const LegalModal = lazy(() => import('./components/LegalModals').then(m => ({ default: m.LegalModal })));

// ---------------------------------------------------------------------------
// Public data browser cache (stale-while-revalidate).
// The database (/api/*) is the source of truth; localStorage gives instant
// first paint, and every visit revalidates in the background.
// ---------------------------------------------------------------------------
const PUBLIC_DATA_CACHE_KEY = 'noor_public_data_v1';
const PUBLIC_DATA_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function readPublicDataCache(): Record<string, unknown[]> {
  try {
    const raw = localStorage.getItem(PUBLIC_DATA_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    // Expire stale cache after TTL
    if (parsed._ts && Date.now() - parsed._ts > PUBLIC_DATA_CACHE_TTL_MS) {
      localStorage.removeItem(PUBLIC_DATA_CACHE_KEY);
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function getCachedPublicData<T>(key: string, fallback: T[]): T[] {
  const cached = readPublicDataCache()[key];
  if (Array.isArray(cached) && cached.length > 0) return cached as T[];
  return fallback;
}

function writePublicDataCache(fresh: Record<string, unknown[]>) {
  try {
    const merged = { ...readPublicDataCache(), ...fresh, _ts: Date.now() };
    localStorage.setItem(PUBLIC_DATA_CACHE_KEY, JSON.stringify(merged));
  } catch {
    // storage full or private mode — non-fatal
  }
}

// ---------------------------------------------------------------------------
// Auth-gated route wrapper for portals (BUG 1 fix).
// - Not logged in → redirect to homepage with login prompt
// - Wrong role (student on /teacher, teacher on /student) → redirect to own portal
// ---------------------------------------------------------------------------
function ProtectedPortalRoute({
  requiredRole,
  children,
}: {
  requiredRole: 'teacher' | 'student';
  children: React.ReactNode;
}) {
  const { currentUser, userProfile } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const email = currentUser?.email || userProfile?.email || '';
  const isLoggedIn = !!(currentUser || userProfile);
  const actualRole = getRoleForEmail(email);
  // Prefer stored profile role, fall back to email-based detection
  const effectiveRole: 'teacher' | 'student' =
    userProfile?.role === 'teacher' || userProfile?.role === 'admin'
      ? 'teacher'
      : userProfile?.role === 'student'
        ? 'student'
        : actualRole;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7DBC2] shadow-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#13263D] text-[#A47A46] flex items-center justify-center text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-bold text-[#13263D] font-editorial">
            {requiredRole === 'teacher' ? 'Teacher Portal' : 'Student Portal'}
          </h2>
          <p className="text-sm text-gray-600">
            Please sign in to access your portal dashboard.
          </p>
          <button
            onClick={() => setShowLoginPrompt(true)}
            className="w-full py-3 bg-[#13263D] text-[#F5F0E6] font-bold rounded-sm hover:bg-[#0C1A2E] transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-2 text-sm text-gray-500 hover:text-[#13263D] cursor-pointer"
          >
            ← Back to Homepage
          </button>
          {showLoginPrompt && (
            <p className="text-xs text-[#A47A46]">
              Use the "Portal Login" button in the site header to sign in.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (effectiveRole !== requiredRole) {
    // Wrong role → redirect to their own portal
    const correctPath = effectiveRole === 'teacher' ? '/teacher' : '/student';
    return <Navigate to={correctPath} replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  // Dynamic Content Data State: database is the source of truth, browser
  // localStorage acts as an instant cache, and fresh data is revalidated
  // in the background on every visit (stale-while-revalidate).
  const [courses, setCourses] = useState<Course[]>(() => getCachedPublicData('courses', ALL_COURSES));
  const [packages, setPackages] = useState<PackagePlan[]>(() => getCachedPublicData('packages', ALL_PACKAGES));
  const [tutors, setTutors] = useState<Tutor[]>(() => getCachedPublicData('tutors', INITIAL_TUTORS));
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getCachedPublicData('testimonials', INITIAL_TESTIMONIALS));

  // Modals & Interactive Overlays
  const [showTrialModal, setShowTrialModal] = useState<boolean>(false);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authRole, setAuthRole] = useState<'student' | 'teacher'>('student');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [selectedCourseForTrial, setSelectedCourseForTrial] = useState<string | undefined>(undefined);
  const [selectedGenderForTrial, setSelectedGenderForTrial] = useState<'Male' | 'Female' | 'No Preference'>('No Preference');
  const [selectedPackageForEnroll, setSelectedPackageForEnroll] = useState<PackagePlan | undefined>(undefined);
  const [inspectCourse, setInspectCourse] = useState<Course | null>(null);

  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms'>('privacy');

  // Enrollment + Free Trial are login-gated (user request 2026-10-20): an
  // anonymous click first opens signup/login; the requested form opens right
  // after successful authentication via this pending action.
  const [pendingAfterAuth, setPendingAfterAuth] = useState<
    | { type: 'trial'; courseName?: string; genderPref?: 'Male' | 'Female' | 'No Preference' }
    | { type: 'enroll'; courseName?: string }
    | { type: 'enroll-pkg'; pkg: PackagePlan }
    | null
  >(null);
  const isLoggedIn = !!(currentUser || userProfile);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Fetch real data on mount (Deferred to prevent render delay)
  // Stale-while-revalidate: instant render from browser cache, then background
  // refresh from the database; cache is updated whenever fresh data arrives.
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [cRes, pRes, tRes, testRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/packages'),
          fetch('/api/tutors'),
          fetch('/api/testimonials')
        ]);
        if (!isMounted) return;
        const fresh: Record<string, unknown[]> = {};
        if (cRes.ok) {
          const data = await cRes.json();
          if (Array.isArray(data) && data.length > 0) { setCourses(data); fresh.courses = data; }
        }
        if (pRes.ok) {
          const data = await pRes.json();
          if (Array.isArray(data) && data.length > 0) { setPackages(data); fresh.packages = data; }
        }
        if (tRes.ok) {
          const data = await tRes.json();
          if (Array.isArray(data) && data.length > 0) { setTutors(data); fresh.tutors = data; }
        }
        if (testRes.ok) {
          const data = await testRes.json();
          if (Array.isArray(data) && data.length > 0) { setTestimonials(data); fresh.testimonials = data; }
        }
        if (Object.keys(fresh).length > 0) writePublicDataCache(fresh);
      } catch (err) {
        console.warn('Using cached academy data:', err);
      }
    };

    const timer = setTimeout(fetchData, 800);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleOpenTrial = (courseName?: string, genderPref?: 'Male' | 'Female' | 'No Preference') => {
    if (!isLoggedIn) {
      setPendingAfterAuth({ type: 'trial', courseName, genderPref });
      handleOpenAuth('student', 'signup');
      return;
    }
    setSelectedCourseForTrial(courseName);
    if (genderPref) setSelectedGenderForTrial(genderPref);
    setShowTrialModal(true);
  };

  const handleOpenEnroll = (courseName?: string) => {
    if (!isLoggedIn) {
      setPendingAfterAuth({ type: 'enroll', courseName });
      handleOpenAuth('student', 'signup');
      return;
    }
    if (courseName) {
      const foundPkg = packages.find(p => p.name.toLowerCase().includes(courseName.toLowerCase()));
      setSelectedPackageForEnroll(foundPkg || packages[0]);
    }
    setShowEnrollModal(true);
  };

  const handleSelectPackage = (pkg: PackagePlan) => {
    if (!isLoggedIn) {
      setPendingAfterAuth({ type: 'enroll-pkg', pkg });
      handleOpenAuth('student', 'signup');
      return;
    }
    setSelectedPackageForEnroll(pkg);
    setShowEnrollModal(true);
  };

  const handleInspectCourse = (course: Course) => {
    setInspectCourse(course);
  };

  const handleOpenAuth = (role: 'student' | 'teacher' = 'student', mode: 'login' | 'signup' = 'login') => {
    setAuthRole(role);
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleOpenLegal = (type: 'privacy' | 'terms') => {
    setLegalModalType(type);
    setShowLegalModal(true);
  };

  // Determine current SEO config
  const currentPath = location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  // Map URL paths to SEO_PAGE_MAP keys (keys are semantic names, not paths)
  const SEO_PATH_KEY_MAP: Record<string, string> = {
    '/': 'home',
    '/online-quran-classes': 'courses',
    '/noorani-qaida': 'noorani-qaida',
    '/quran-reading-nazra': 'quran-reading-nazra',
    '/quran-with-tajweed': 'quran-with-tajweed',
    '/quran-memorization-hifz': 'quran-memorization-hifz',
    '/islamic-studies': 'courses',
    '/kids-program': 'kids-program',
    '/quran-classes-for-kids': 'kids-program',
    '/slow-learners': 'slow-learners',
    '/female-tutor': 'female-tutor',
    '/female-quran-teacher': 'female-tutor',
    '/quran-classes-for-adults': 'courses',
    '/online-quran-classes-uk': 'uk-program',
    '/online-quran-classes-usa': 'usa-program',
    '/online-quran-classes-canada': 'canada-program',
    '/online-quran-classes-australia': 'australia-program',
    '/online-quran-classes-pakistan': 'pakistan-program',
    '/pricing': 'packages',
    '/faculty': 'tutors',
    '/tutors': 'tutors',
    '/teachers': 'tutors',
    '/about': 'about',
    '/about-us': 'about',
    '/faq': 'faq',
    '/blog': 'blogs',
    '/blogs': 'blogs',
    '/articles': 'blogs',
    '/contact': 'contact',
    '/contact-us': 'contact',
    '/how-it-works': 'about',
    '/methodology': 'about',
  };
  const defaultSeo = {
    title: 'Learn Quran Online | 1-on-1 Online Quran Classes for Kids & Adults',
    description: 'Learn Quran online with certified male & female tutors. 1-on-1 Tajweed, Hifz & Qaida classes for kids and adults. Book a free 3-day trial today!',
    canonicalUrl: `https://noorequraninstitute.me${currentPath === '/' ? '' : currentPath}`,
    structuredDataType: 'EducationalOrganization' as const
  };
  const seoData = SEO_PAGE_MAP[SEO_PATH_KEY_MAP[currentPath]] || defaultSeo;

  // Admin "SEO & Meta Tags" overrides from Firestore (`siteSeo` collection).
  // Falls back to the coded values above when unreachable.
  // Dynamically imported so the Firebase chunk doesn't block initial page load.
  const [seoOverrides, setSeoOverrides] = useState<Record<string, PageSeoConfig>>({});
  useEffect(() => {
    import('./lib/firestoreService').then(({ getSiteSeoConfigs }) => {
      getSiteSeoConfigs().then(list => {
        const map: Record<string, PageSeoConfig> = {};
        list.forEach(c => { if (c.pagePath) map[c.pagePath] = c; });
        setSeoOverrides(map);
      }).catch(() => {});
    }).catch(() => {});
  }, []);
  const ADMIN_PATH_ALIASES: Record<string, string> = {
    '/online-quran-classes': '/courses',
    '/pricing': '/packages',
    '/faculty': '/teachers',
    '/tutors': '/teachers',
  };
  const seoOverride = seoOverrides[currentPath] || (ADMIN_PATH_ALIASES[currentPath] ? seoOverrides[ADMIN_PATH_ALIASES[currentPath]] : undefined);
  const liveSeoData = seoOverride ? {
    title: seoOverride.metaTitle || seoData.title,
    description: seoOverride.metaDescription || seoData.description,
    canonicalUrl: seoOverride.canonicalUrl || (seoData as any).canonical || (seoData as any).canonicalUrl || defaultSeo.canonicalUrl,
    structuredDataType: (seoData as any).structuredDataType || 'EducationalOrganization',
  } : seoData;

  // Redirect renamed article slugs to their new URLs
  if (currentPath === '/blog/the6kalimas') {
    return <Navigate to="/blog/6-kalimas" replace />;
  }

  const isPortalView = location.pathname === '/classroom' || location.pathname.startsWith('/classroom/') ||
    location.pathname === '/student' || location.pathname.startsWith('/student/') ||
    location.pathname === '/teacher' || location.pathname.startsWith('/teacher/') ||
    location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F0E6] text-[#152A45] font-sans antialiased selection:bg-[#A47A46]/30 selection:text-[#13263D]">
      <SEOHead
        title={liveSeoData.title}
        description={liveSeoData.description}
        canonicalUrl={(liveSeoData as any).canonical || (liveSeoData as any).canonicalUrl || `https://noorequraninstitute.me${currentPath === '/' ? '' : currentPath}`}
        structuredDataType={((liveSeoData as any).schemaType || (liveSeoData as any).structuredDataType || 'EducationalOrganization') as any}
      />

      {/* Main Navbar */}
      {!isPortalView && (
        <Navbar
          onOpenTrial={handleOpenTrial}
          onOpenEnroll={handleOpenEnroll}
          onOpenAuth={handleOpenAuth}
          onSelectAppView={(v) => navigate(`/${v}`)}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-28 flex items-center justify-center bg-[#F5F0E6]">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-2 border-[#13263D] border-t-[#A47A46] rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-[#13263D] font-sans tracking-wide">Loading Noor E Quran Institute...</p>
              </div>
            </div>
          }
        >
          <Routes>
            {/* 1. Home Page */}
            <Route
              path="/"
              element={
                <HomePage
                  courses={courses}
                  tutors={tutors}
                  testimonials={testimonials}
                  onOpenTrial={handleOpenTrial}
                  onInspectCourse={handleInspectCourse}
                />
              }
            />

            {/* 2. Courses Pages & Course Slugs */}
            <Route
              path="/courses"
              element={
                <CoursesPage
                  courses={courses}
                  onOpenTrial={handleOpenTrial}
                  onInspectCourse={handleInspectCourse}
                />
              }
            />
            <Route path="/online-quran-classes" element={<CoursesPage courses={courses} onOpenTrial={handleOpenTrial} onInspectCourse={handleInspectCourse} />} />
            <Route path="/noorani-qaida" element={<CoursesPage courses={courses} onOpenTrial={handleOpenTrial} onInspectCourse={handleInspectCourse} />} />
            <Route path="/quran-reading-nazra" element={<CoursesPage courses={courses} onOpenTrial={handleOpenTrial} onInspectCourse={handleInspectCourse} />} />
            <Route path="/quran-with-tajweed" element={<CoursesPage courses={courses} onOpenTrial={handleOpenTrial} onInspectCourse={handleInspectCourse} />} />
            <Route path="/quran-memorization-hifz" element={<CoursesPage courses={courses} onOpenTrial={handleOpenTrial} onInspectCourse={handleInspectCourse} />} />
            <Route path="/islamic-studies" element={<CoursesPage courses={courses} onOpenTrial={handleOpenTrial} onInspectCourse={handleInspectCourse} />} />

            {/* 3. Teachers / Faculty Pages */}
            <Route
              path="/teachers"
              element={
                <TeachersPage
                  tutors={tutors}
                  onOpenTrial={handleOpenTrial}
                />
              }
            />
            <Route path="/faculty" element={<TeachersPage tutors={tutors} onOpenTrial={handleOpenTrial} />} />
            <Route path="/tutors" element={<TeachersPage tutors={tutors} onOpenTrial={handleOpenTrial} />} />

            {/* 4. Tuition & Fee Plans */}
            <Route
              path="/packages"
              element={
                <TuitionPage
                  packages={packages}
                  onSelectPackage={handleSelectPackage}
                  onOpenTrial={() => handleOpenTrial()}
                />
              }
            />
            <Route path="/pricing" element={<TuitionPage packages={packages} onSelectPackage={handleSelectPackage} onOpenTrial={() => handleOpenTrial()} />} />

            {/* 5. How It Works / Methodology */}
            <Route
              path="/how-it-works"
              element={<HowItWorksPage onOpenTrial={() => handleOpenTrial()} />}
            />
            <Route
              path="/methodology"
              element={<HowItWorksPage onOpenTrial={() => handleOpenTrial()} />}
            />

            {/* 6. About Us */}
            <Route
              path="/about"
              element={<AboutPage onOpenTrial={() => handleOpenTrial()} onOpenEnroll={() => handleOpenEnroll()} />}
            />
            <Route
              path="/about-us"
              element={<AboutPage onOpenTrial={() => handleOpenTrial()} onOpenEnroll={() => handleOpenEnroll()} />}
            />

            {/* 7. Blog & Articles Dynamic Routes */}
            <Route path="/blog" element={<BlogListPage onOpenTrial={() => handleOpenTrial()} />} />
            <Route path="/blogs" element={<BlogListPage onOpenTrial={() => handleOpenTrial()} />} />
            <Route path="/articles" element={<BlogListPage onOpenTrial={() => handleOpenTrial()} />} />
            <Route path="/author/m-muddasir-hameed" element={<AuthorPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage onOpenTrial={() => handleOpenTrial()} />} />
            <Route path="/articles/:slug" element={<BlogPostPage onOpenTrial={() => handleOpenTrial()} />} />

            {/* 8. Contact Us */}
            <Route path="/contact" element={<ContactPage onOpenTrial={() => handleOpenTrial()} />} />
            <Route path="/contact-us" element={<ContactPage onOpenTrial={() => handleOpenTrial()} />} />

            {/* 9. FAQ */}
            <Route path="/faq" element={<FAQPage onOpenTrial={() => handleOpenTrial()} />} />
            <Route path="/privacy-policy" element={<LegalPage variant="privacy" />} />
            <Route path="/privacy" element={<LegalPage variant="privacy" />} />
            <Route path="/terms" element={<LegalPage variant="terms" />} />
            <Route path="/terms-and-conditions" element={<LegalPage variant="terms" />} />

            {/* 10. Specialized Program Tracks */}
            <Route
              path="/kids-program"
              element={
                <KidsProgramLanding
                  onOpenTrial={handleOpenTrial}
                  onOpenEnroll={handleOpenEnroll}
                  onNavClick={(tab) => navigate(`/${tab}`)}
                />
              }
            />
            <Route
              path="/quran-classes-for-kids"
              element={
                <KidsProgramLanding
                  onOpenTrial={handleOpenTrial}
                  onOpenEnroll={handleOpenEnroll}
                  onNavClick={(tab) => navigate(`/${tab}`)}
                />
              }
            />

            <Route
              path="/female-tutor"
              element={
                <FemaleTutorLanding
                  onOpenTrial={handleOpenTrial}
                  onOpenEnroll={handleOpenEnroll}
                  onNavClick={(tab) => navigate(`/${tab}`)}
                />
              }
            />
            <Route
              path="/female-quran-teacher"
              element={
                <FemaleTutorLanding
                  onOpenTrial={handleOpenTrial}
                  onOpenEnroll={handleOpenEnroll}
                  onNavClick={(tab) => navigate(`/${tab}`)}
                />
              }
            />

            <Route
              path="/slow-learners"
              element={
                <AdultsProgramLanding
                  onOpenTrial={handleOpenTrial}
                  onOpenEnroll={handleOpenEnroll}
                  onNavClick={(tab) => navigate(`/${tab}`)}
                />
              }
            />
            <Route
              path="/quran-classes-for-adults"
              element={
                <AdultsProgramLanding
                  onOpenTrial={handleOpenTrial}
                  onOpenEnroll={handleOpenEnroll}
                  onNavClick={(tab) => navigate(`/${tab}`)}
                />
              }
            />

            {/* 11. International Regional Tracks */}
            <Route path="/online-quran-classes-uk" element={<InternationalLanding countryKey="uk" onOpenTrial={handleOpenTrial} onOpenEnroll={handleOpenEnroll} onSelectCountry={(c) => navigate(`/online-quran-classes-${c}`)} />} />
            <Route path="/online-quran-classes-usa" element={<InternationalLanding countryKey="usa" onOpenTrial={handleOpenTrial} onOpenEnroll={handleOpenEnroll} onSelectCountry={(c) => navigate(`/online-quran-classes-${c}`)} />} />
            <Route path="/online-quran-classes-canada" element={<InternationalLanding countryKey="canada" onOpenTrial={handleOpenTrial} onOpenEnroll={handleOpenEnroll} onSelectCountry={(c) => navigate(`/online-quran-classes-${c}`)} />} />
            <Route path="/online-quran-classes-australia" element={<InternationalLanding countryKey="australia" onOpenTrial={handleOpenTrial} onOpenEnroll={handleOpenEnroll} onSelectCountry={(c) => navigate(`/online-quran-classes-${c}`)} />} />
            <Route path="/online-quran-classes-pakistan" element={<InternationalLanding countryKey="pakistan" onOpenTrial={handleOpenTrial} onOpenEnroll={handleOpenEnroll} onSelectCountry={(c) => navigate(`/online-quran-classes-${c}`)} />} />

            {/* 12. Interactive Classroom Studio */}
            <Route
              path="/classroom"
              element={
                <ClassroomStudio
                  onBackToLanding={() => navigate('/')}
                  onOpenAuth={(role, mode) => handleOpenAuth(role, mode)}
                  onOpenTrial={() => handleOpenTrial()}
                  onOpenEnroll={() => handleOpenEnroll()}
                  initialSurahNumber={1}
                />
              }
            />
            <Route
              path="/classroom/:surah"
              element={
                <ClassroomStudio
                  onBackToLanding={() => navigate('/')}
                  onOpenAuth={(role, mode) => handleOpenAuth(role, mode)}
                  onOpenTrial={() => handleOpenTrial()}
                  onOpenEnroll={() => handleOpenEnroll()}
                  initialSurahNumber={1}
                />
              }
            />

            {/* 13. Student & Teacher & Admin Portals (auth-gated) */}
            <Route
              path="/student"
              element={
                <ProtectedPortalRoute requiredRole="student">
                  <StudentPortal
                    onBackToLanding={() => navigate('/')}
                    onOpenClassroom={(surah) => navigate(`/classroom/${surah || 1}`)}
                  />
                </ProtectedPortalRoute>
              }
            />
            <Route
              path="/student-portal"
              element={
                <ProtectedPortalRoute requiredRole="student">
                  <StudentPortal
                    onBackToLanding={() => navigate('/')}
                    onOpenClassroom={(surah) => navigate(`/classroom/${surah || 1}`)}
                  />
                </ProtectedPortalRoute>
              }
            />

            <Route
              path="/teacher"
              element={
                <ProtectedPortalRoute requiredRole="teacher">
                  <TeacherPortal
                    onBackToLanding={() => navigate('/')}
                    onOpenClassroom={(surah) => navigate(`/classroom/${surah || 1}`)}
                  />
                </ProtectedPortalRoute>
              }
            />
            <Route
              path="/teacher-portal"
              element={
                <ProtectedPortalRoute requiredRole="teacher">
                  <TeacherPortal
                    onBackToLanding={() => navigate('/')}
                    onOpenClassroom={(surah) => navigate(`/classroom/${surah || 1}`)}
                  />
                </ProtectedPortalRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminPortal
                  isOpen={true}
                  onClose={() => navigate('/')}
                  courses={courses}
                  onRefreshCourses={async () => {
                    try {
                      const res = await fetch('/api/courses');
                      if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) setCourses(data);
                      }
                    } catch (e) {}
                  }}
                />
              }
            />
            <Route
              path="/admin-portal"
              element={
                <AdminPortal
                  isOpen={true}
                  onClose={() => navigate('/')}
                  courses={courses}
                  onRefreshCourses={async () => {
                    try {
                      const res = await fetch('/api/courses');
                      if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) setCourses(data);
                      }
                    } catch (e) {}
                  }}
                />
              }
            />

            {/* 14. 404 Fallback Catch-all Route */}
            <Route
              path="*"
              element={<NotFoundPage onOpenTrial={() => handleOpenTrial()} />}
            />
          </Routes>
        </Suspense>
      </main>

      {/* Global Footer */}
      {!isPortalView && (
        <Footer
          onOpenTrial={handleOpenTrial}
          onOpenLegal={handleOpenLegal}
        />
      )}

      {/* WhatsApp Floating Contact Widget */}
      {!isPortalView && <WhatsAppWidget />}

      {/* Global Interactive Modals */}
      <Suspense fallback={null}>
        {showTrialModal && (
          <FreeTrialModal
            isOpen={showTrialModal}
            onClose={() => setShowTrialModal(false)}
            courses={courses}
            preselectedCourse={selectedCourseForTrial}
            preselectedGender={selectedGenderForTrial}
            onSuccess={() => setShowTrialModal(false)}
          />
        )}

        {showEnrollModal && (
          <EnrollmentModal
            isOpen={showEnrollModal}
            onClose={() => setShowEnrollModal(false)}
            packages={packages}
            selectedPackage={selectedPackageForEnroll}
            onSuccess={() => setShowEnrollModal(false)}
          />
        )}

        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => {
              setShowAuthModal(false);
              // Cancelled login (no user): drop any pending enroll/trial intent.
              // After a successful login currentUser is set, so the pending
              // action (already handled in onSuccess) is left untouched.
              if (!currentUser) setPendingAfterAuth(null);
            }}
            initialRole={authRole}
            initialMode={authMode}
            onSuccess={() => {
              // Login-gated flows: if the visitor clicked Enroll / Free Trial
              // while logged out, open that form now instead of the portal.
              if (pendingAfterAuth) {
                const pending = pendingAfterAuth;
                setPendingAfterAuth(null);
                setShowAuthModal(false);
                setTimeout(() => {
                  if (pending.type === 'trial') {
                    setSelectedCourseForTrial(pending.courseName);
                    if (pending.genderPref) setSelectedGenderForTrial(pending.genderPref);
                    setShowTrialModal(true);
                  } else if (pending.type === 'enroll') {
                    if (pending.courseName) {
                      const foundPkg = packages.find(p => p.name.toLowerCase().includes(pending.courseName!.toLowerCase()));
                      setSelectedPackageForEnroll(foundPkg || packages[0]);
                    }
                    setShowEnrollModal(true);
                  } else if (pending.type === 'enroll-pkg') {
                    setSelectedPackageForEnroll(pending.pkg);
                    setShowEnrollModal(true);
                  }
                }, 900);
                return;
              }
              // BUG 2 fix: navigate to the correct portal after login.
              // Read the freshly-saved profile from localStorage (set synchronously
              // by AuthContext on login) to determine role by email.
              try {
                const raw = localStorage.getItem('alnoor_active_user_profile');
                const email = raw ? (JSON.parse(raw).email || '') : '';
                const role = getRoleForEmail(email);
                setShowAuthModal(false);
                // Small delay so the success toast in the modal is visible
                setTimeout(() => navigate(role === 'teacher' ? '/teacher' : '/student'), 900);
              } catch {
                setShowAuthModal(false);
                setTimeout(() => navigate('/student'), 900);
              }
            }}
          />
        )}

        {inspectCourse && (
          <CourseDetailModal
            course={inspectCourse}
            isOpen={!!inspectCourse}
            onClose={() => setInspectCourse(null)}
            onOpenTrial={(courseName) => handleOpenTrial(courseName)}
            onOpenEnroll={(courseName) => handleOpenEnroll(courseName)}
          />
        )}

        {showLegalModal && (
          <LegalModal
            isOpen={showLegalModal}
            onClose={() => setShowLegalModal(false)}
            initialTab={legalModalType}
          />
        )}
      </Suspense>

      {/* TEMP-DISABLED 2026-10-19: Soft background Quran recitation (Tilawat) — uncomment to re-enable */}
      {/* <TilawatPlayer /> */}
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <IconContext.Provider
        value={{
          color: 'currentColor',
          size: 20,
          weight: 'regular',
          mirrored: false
        }}
      >
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </IconContext.Provider>
    </HelmetProvider>
  );
}
