import React, { Suspense, lazy } from 'react';
import { Course, PackagePlan } from '../types';

// Lazy-loaded interactive modals
const AuthModal = lazy(() => import('./AuthModal').then(m => ({ default: m.AuthModal })));
const FreeTrialModal = lazy(() => import('./FreeTrialModal').then(m => ({ default: m.FreeTrialModal })));
const EnrollmentModal = lazy(() => import('./EnrollmentModal').then(m => ({ default: m.EnrollmentModal })));
const CourseDetailModal = lazy(() => import('./CourseDetailModal').then(m => ({ default: m.CourseDetailModal })));
const LegalModal = lazy(() => import('./LegalModals').then(m => ({ default: m.LegalModal })));

interface AppModalsProps {
  courses: Course[];
  packages: PackagePlan[];

  showTrialModal: boolean;
  setShowTrialModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCourseForTrial?: string;
  selectedGenderForTrial: 'Male' | 'Female' | 'No Preference';

  showEnrollModal: boolean;
  setShowEnrollModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedPackageForEnroll?: PackagePlan;

  showAuthModal: boolean;
  setShowAuthModal: React.Dispatch<React.SetStateAction<boolean>>;
  authRole: 'student' | 'teacher';
  authMode: 'login' | 'signup';

  inspectCourse: Course | null;
  setInspectCourse: React.Dispatch<React.SetStateAction<Course | null>>;

  showLegalModal: boolean;
  setShowLegalModal: React.Dispatch<React.SetStateAction<boolean>>;
  legalModalType: 'privacy' | 'terms';

  handleOpenTrial: (courseName?: string, genderPref?: 'Male' | 'Female' | 'No Preference') => void;
  handleOpenEnroll: (courseName?: string) => void;
}

export function AppModals({
  courses,
  packages,
  showTrialModal,
  setShowTrialModal,
  selectedCourseForTrial,
  selectedGenderForTrial,
  showEnrollModal,
  setShowEnrollModal,
  selectedPackageForEnroll,
  showAuthModal,
  setShowAuthModal,
  authRole,
  authMode,
  inspectCourse,
  setInspectCourse,
  showLegalModal,
  setShowLegalModal,
  legalModalType,
  handleOpenTrial,
  handleOpenEnroll
}: AppModalsProps) {
  return (
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
  );
}
