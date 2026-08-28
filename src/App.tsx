import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { IconContext } from '@phosphor-icons/react';
import { Course, PackagePlan, Tutor, Testimonial } from './types';
import { ALL_COURSES, ALL_PACKAGES, INITIAL_TUTORS, INITIAL_TESTIMONIALS } from './data/academyData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SEOHead } from './components/SEOHead';
import { SEO_PAGE_MAP } from './lib/seoConfig';
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
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
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

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  // Dynamic Content Data State (fetched from backend/database with fallbacks)
  const [courses, setCourses] = useState<Course[]>(ALL_COURSES);
  const [packages, setPackages] = useState<PackagePlan[]>(ALL_PACKAGES);
  const [tutors, setTutors] = useState<Tutor[]>(INITIAL_TUTORS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);

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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Fetch real data on mount (Deferred to prevent render delay)
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
        if (cRes.ok) {
          const data = await cRes.json();
          if (Array.isArray(data) && data.length > 0) setCourses(data);
        }
        if (pRes.ok) {
          const data = await pRes.json();
          if (Array.isArray(data) && data.length > 0) setPackages(data);
        }
        if (tRes.ok) {
          const data = await tRes.json();
          if (Array.isArray(data) && data.length > 0) setTutors(data);
        }
        if (testRes.ok) {
          const data = await testRes.json();
          if (Array.isArray(data) && data.length > 0) setTestimonials(data);
        }
      } catch (err) {
        console.warn('Using baseline academy data:', err);
      }
    };

    const timer = setTimeout(fetchData, 800);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleOpenTrial = (courseName?: string, genderPref?: 'Male' | 'Female' | 'No Preference') => {
    setSelectedCourseForTrial(courseName);
    if (genderPref) setSelectedGenderForTrial(genderPref);
    setShowTrialModal(true);
  };

  const handleOpenEnroll = (courseName?: string) => {
    if (courseName) {
      const foundPkg = packages.find(p => p.name.toLowerCase().includes(courseName.toLowerCase()));
      setSelectedPackageForEnroll(foundPkg || packages[0]);
    }
    setShowEnrollModal(true);
  };

  const handleSelectPackage = (pkg: PackagePlan) => {
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
  const defaultSeo = {
    title: 'Noor E Quran Institute | Certified Online Quran & Tajweed Academy',
    description: 'Learn Quran online with certified male and female tutors. 1-on-1 classes with flexible timings.',
    canonicalUrl: `https://noorequraninstitute.me${currentPath === '/' ? '' : currentPath}`,
    structuredDataType: 'EducationalOrganization' as const
  };
  const seoData = SEO_PAGE_MAP[currentPath] || defaultSeo;

  const isPortalView = location.pathname === '/classroom' || location.pathname.startsWith('/classroom/') ||
    location.pathname === '/student' || location.pathname.startsWith('/student/') ||
    location.pathname === '/teacher' || location.pathname.startsWith('/teacher/') ||
    location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EE] text-[#12201D] font-sans antialiased selection:bg-[#B79A62]/30 selection:text-[#0B332D]">
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        canonicalUrl={(seoData as any).canonical || (seoData as any).canonicalUrl || `https://noorequraninstitute.me${currentPath === '/' ? '' : currentPath}`}
        structuredDataType={((seoData as any).schemaType || (seoData as any).structuredDataType || 'EducationalOrganization') as any}
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
            <div className="py-28 flex items-center justify-center bg-[#F8F5EE]">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-2 border-[#0B332D] border-t-[#B79A62] rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-[#0B332D] font-sans tracking-wide">Loading Noor E Quran Institute...</p>
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
            <Route path="/blog/:slug" element={<BlogPostPage onOpenTrial={() => handleOpenTrial()} />} />
            <Route path="/articles/:slug" element={<BlogPostPage onOpenTrial={() => handleOpenTrial()} />} />

            {/* 8. Contact Us */}
            <Route path="/contact" element={<ContactPage onOpenTrial={() => handleOpenTrial()} />} />
            <Route path="/contact-us" element={<ContactPage onOpenTrial={() => handleOpenTrial()} />} />

            {/* 9. FAQ */}
            <Route path="/faq" element={<FAQPage onOpenTrial={() => handleOpenTrial()} />} />

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

            {/* 13. Student & Teacher & Admin Portals */}
            <Route
              path="/student"
              element={
                <StudentPortal
                  onBackToLanding={() => navigate('/')}
                  onOpenClassroom={(surah) => navigate(`/classroom/${surah || 1}`)}
                />
              }
            />
            <Route
              path="/student-portal"
              element={
                <StudentPortal
                  onBackToLanding={() => navigate('/')}
                  onOpenClassroom={(surah) => navigate(`/classroom/${surah || 1}`)}
                />
              }
            />

            <Route
              path="/teacher"
              element={
                <TeacherPortal
                  onBackToLanding={() => navigate('/')}
                  onOpenClassroom={(surah) => navigate(`/classroom/${surah || 1}`)}
                />
              }
            />
            <Route
              path="/teacher-portal"
              element={
                <TeacherPortal
                  onBackToLanding={() => navigate('/')}
                  onOpenClassroom={(surah) => navigate(`/classroom/${surah || 1}`)}
                />
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
            onClose={() => setShowAuthModal(false)}
            initialRole={authRole}
            initialMode={authMode}
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
