import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, Tutor, Testimonial } from '../types';
import { Hero } from '../components/Hero';
import { CoursesSection } from '../components/CoursesSection';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { TutorsSection } from '../components/TutorsSection';
import { MethodologySection } from '../components/MethodologySection';
import { TrustSection } from '../components/TrustSection';
import { StorySection } from '../components/StorySection';
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
    <div className="space-y-0 bg-[#F5F0E6]">
      {/* TEMP-DISABLED 2026-10-19: Daily Islamic quote popup — uncomment to re-enable */}
      {/* <DailyQuotePopup /> */}
      {/* 1. Hero Section */}
      <Hero
        onOpenTrial={() => onOpenTrial()}
        onViewCourses={() => navigate('/courses')}
      />

      {/* 2. Numbered Courses Curriculum Preview */}
      <CoursesSection
        courses={courses}
        onOpenTrial={onOpenTrial}
        onInspectCourse={onInspectCourse}
      />

      {/* 3. Why Choose Us: Full-Width Deep Emerald Section */}
      <WhyChooseUs onOpenTrial={() => onOpenTrial()} />

      {/* 4. Certified Faculty Showcase */}
      <TutorsSection
        tutors={tutors}
        onOpenTrialWithGender={(g) => onOpenTrial(undefined, g)}
        onOpenTrial={onOpenTrial}
      />

      {/* 5. How It Works 4-Step Timeline */}
      <MethodologySection onOpenTrial={() => onOpenTrial()} />

      {/* 6. Authentic Testimonials */}
      <TrustSection testimonials={testimonials} />

      {/* 7. Image & Story Section */}
      <StorySection onOpenTrial={() => onOpenTrial()} />

      {/* 8. Final Call to Action */}
      <FinalCTASection
        onOpenTrial={() => onOpenTrial()}
        onViewCourses={() => navigate('/courses')}
      />
    </div>
  );
};
