import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { IconContext } from '@phosphor-icons/react';
import { Course, PackagePlan, Tutor, Testimonial } from './types';
import { ALL_COURSES, ALL_PACKAGES, INITIAL_TUTORS, INITIAL_TESTIMONIALS } from './data/academyData';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SEOHead } from './components/SEOHead';
import { SEO_PAGE_MAP } from './lib/seoConfig';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { AppRoutes } from './components/AppRoutes';
import { AppModals } from './components/AppModals';

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
          <AppRoutes
            courses={courses}
            packages={packages}
            tutors={tutors}
            testimonials={testimonials}
            handleOpenTrial={handleOpenTrial}
            handleOpenEnroll={handleOpenEnroll}
            handleInspectCourse={handleInspectCourse}
            handleSelectPackage={handleSelectPackage}
            handleOpenAuth={handleOpenAuth}
            setCourses={setCourses}
          />
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
      <AppModals
        courses={courses}
        packages={packages}
        showTrialModal={showTrialModal}
        setShowTrialModal={setShowTrialModal}
        selectedCourseForTrial={selectedCourseForTrial}
        selectedGenderForTrial={selectedGenderForTrial}
        showEnrollModal={showEnrollModal}
        setShowEnrollModal={setShowEnrollModal}
        selectedPackageForEnroll={selectedPackageForEnroll}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authRole={authRole}
        authMode={authMode}
        inspectCourse={inspectCourse}
        setInspectCourse={setInspectCourse}
        showLegalModal={showLegalModal}
        setShowLegalModal={setShowLegalModal}
        legalModalType={legalModalType}
        handleOpenTrial={handleOpenTrial}
        handleOpenEnroll={handleOpenEnroll}
      />
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
