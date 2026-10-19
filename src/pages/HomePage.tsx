import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, Tutor, Testimonial } from '../types';
import { Hero } from '../components/Hero';
import { CoursesSection } from '../components/CoursesSection';
import { PersonalApproach } from '../components/PersonalApproach';
import { StepsSection } from '../components/StepsSection';
import { FinalCTASection } from '../components/FinalCTASection';
import { DailyQuotePopup } from '../components/DailyQuotePopup';

interface HomePageProps {
  courses: Course[];
  tutors: Tutor[];
  testimonials: Testimonial[];
  onOpenTrial: (courseName?: string, genderPref?: 'Male' | 'Female' | 'No Preference') => void;
  onInspectCourse: (course: Course) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  courses,
  tutors,
  testimonials,
  onOpenTrial,
  onInspectCourse
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-0 bg-[#0A1428]">
      {/* TEMP-DISABLED 2026-10-19: Daily Islamic quote popup — uncomment to re-enable */}
      {/* <DailyQuotePopup /> */}
      {/* 1. Hero Section */}
      <Hero
        onOpenTrial={() => onOpenTrial()}
        onViewCourses={() => navigate('/courses')}
      />

      {/* 2. Courses — 5 dark cards (teal design) */}
      <CoursesSection
        onOpenTrial={onOpenTrial}
      />

      {/* 3. Personal Approach */}
      <PersonalApproach />

      {/* 4. Steps */}
      <StepsSection />

      {/* 5. Trial CTA */}
      <FinalCTASection
        onOpenTrial={() => onOpenTrial()}
        onViewCourses={() => navigate('/courses')}
      />
    </div>
  );
};
