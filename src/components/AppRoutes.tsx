import React, { lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Course, PackagePlan, Tutor, Testimonial } from '../types';

import { HomePage } from '../pages/HomePage';

// Lazy-loaded secondary pages
const CoursesPage = lazy(() => import('../pages/CoursesPage').then(m => ({ default: m.CoursesPage })));
const TeachersPage = lazy(() => import('../pages/TeachersPage').then(m => ({ default: m.TeachersPage })));
const TuitionPage = lazy(() => import('../pages/TuitionPage').then(m => ({ default: m.TuitionPage })));
const HowItWorksPage = lazy(() => import('../pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const AboutPage = lazy(() => import('../pages/AboutPage').then(m => ({ default: m.AboutPage })));
const BlogListPage = lazy(() => import('../pages/BlogListPage').then(m => ({ default: m.BlogListPage })));
const BlogPostPage = lazy(() => import('../pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('../pages/FAQPage').then(m => ({ default: m.FAQPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Lazy-loaded specialized landings & portals
const InternationalLanding = lazy(() => import('./InternationalLanding').then(m => ({ default: m.InternationalLanding })));
const KidsProgramLanding = lazy(() => import('./KidsProgramLanding').then(m => ({ default: m.KidsProgramLanding })));
const AdultsProgramLanding = lazy(() => import('./AdultsProgramLanding').then(m => ({ default: m.AdultsProgramLanding })));
const FemaleTutorLanding = lazy(() => import('./FemaleTutorLanding').then(m => ({ default: m.FemaleTutorLanding })));

const ClassroomStudio = lazy(() => import('./ClassroomStudio').then(m => ({ default: m.ClassroomStudio })));
const StudentPortal = lazy(() => import('./StudentPortal').then(m => ({ default: m.StudentPortal })));
const TeacherPortal = lazy(() => import('./TeacherPortal').then(m => ({ default: m.TeacherPortal })));
const AdminPortal = lazy(() => import('../admin/AdminPortal').then(m => ({ default: m.AdminPortal })));

interface AppRoutesProps {
  courses: Course[];
  packages: PackagePlan[];
  tutors: Tutor[];
  testimonials: Testimonial[];
  handleOpenTrial: (courseName?: string, genderPref?: 'Male' | 'Female' | 'No Preference') => void;
  handleOpenEnroll: (courseName?: string) => void;
  handleInspectCourse: (course: Course) => void;
  handleSelectPackage: (pkg: PackagePlan) => void;
  handleOpenAuth: (role?: 'student' | 'teacher', mode?: 'login' | 'signup') => void;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

export function AppRoutes({
  courses,
  packages,
  tutors,
  testimonials,
  handleOpenTrial,
  handleOpenEnroll,
  handleInspectCourse,
  handleSelectPackage,
  handleOpenAuth,
  setCourses
}: AppRoutesProps) {
  const navigate = useNavigate();

  return (
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
  );
}
