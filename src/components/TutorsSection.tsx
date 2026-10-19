import React from 'react';
import { Tutor } from '../types';
import { ArrowRight, User } from '@phosphor-icons/react';

interface TutorsSectionProps {
  tutors?: Tutor[];
  onOpenTrialWithGender?: (gender: 'Male' | 'Female' | 'No Preference') => void;
  onOpenTrial?: (courseName?: string, genderPref?: 'Male' | 'Female' | 'No Preference') => void;
}

export const TutorsSection: React.FC<TutorsSectionProps> = ({
  tutors = [],
  onOpenTrialWithGender,
  onOpenTrial
}) => {
  const displayTutors = tutors.length > 0 ? tutors : [];
  const featuredTutor = displayTutors.length > 0 ? displayTutors[0] : null;
  const secondaryTutors = displayTutors.length > 1 ? displayTutors.slice(1, 3) : [];

  const handleSelectTeacher = (gender: 'Male' | 'Female' | 'No Preference', tutorName?: string) => {
    if (onOpenTrialWithGender) {
      onOpenTrialWithGender(gender);
    } else if (onOpenTrial) {
      onOpenTrial(undefined, gender);
    }
  };

  return (
    <section id="tutors" className="py-24 lg:py-32 bg-[#F5F0E6] border-b border-[#E7DBC2]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Editorial & Restrained */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 lg:mb-24 gap-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-sans font-bold text-[#8C6D37] uppercase tracking-widest mb-3.5">
              OUR TEACHERS
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#13263D] leading-[1.1] font-semibold tracking-tight">
              Qualified.<br />
              Compassionate.<br />
              <span className="italic font-normal">Committed.</span>
            </h2>
          </div>

          <div className="text-right">
            <button
              onClick={() => handleSelectTeacher('No Preference')}
              className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#13263D] hover:text-[#A47A46] transition-colors py-1 border-b border-[#13263D]/20 hover:border-[#A47A46] cursor-pointer"
            >
              <span>Explore All Verified Faculty ({tutors.length || 4})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Editorial Asymmetrical Hierarchy Grid */}
        {displayTutors.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm font-sans">
            Faculty directory is loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            
            {/* 1. Featured Senior Faculty (Large Column - 7 cols) */}
            {featuredTutor && (
              <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#E7DBC2]/80 rounded-sm p-6 sm:p-8 space-y-6">
                <div className="relative aspect-[16/11] rounded-sm overflow-hidden border border-[#E7DBC2]/60 bg-[#F5F0E6]">
                  {featuredTutor.photoUrl ? (
                    <img
                      src={featuredTutor.photoUrl}
                      alt={featuredTutor.name}
                      className="w-full h-full object-cover filter brightness-[0.98]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#13263D]/40">
                      <User className="w-16 h-16 mb-2" weight="thin" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider bg-[#13263D] text-[#A47A46]">
                    Senior Faculty • {featuredTutor.experienceYears}+ Years
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="w-8 h-[1.5px] bg-[#A47A46]" />

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="font-editorial text-3xl text-[#13263D] font-semibold">
                      {featuredTutor.name}
                    </h3>
                    <span className="text-xs font-sans font-semibold text-[#8C6D37] uppercase tracking-wider">
                      {featuredTutor.specialization}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 font-sans font-medium">
                    {Array.isArray(featuredTutor.languages) ? featuredTutor.languages.join(', ') : featuredTutor.languages} • {featuredTutor.qualification}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed pt-1 max-w-xl">
                    {featuredTutor.bio}
                  </p>

                  <div className="pt-3">
                    <button
                      onClick={() => handleSelectTeacher(featuredTutor.gender, featuredTutor.name)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#13263D] text-[#F5F0E6] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#0C1A2E] transition-all cursor-pointer shadow-xs"
                    >
                      <span>Request Trial with {featuredTutor.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A47A46]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Secondary Faculty Stack (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              {secondaryTutors.map((tutor) => {
                const firstName = tutor.name.replace(/^(Ustadha|Ustadh|Qari|Shaykh|Maulana)\s+/i, '');

                return (
                  <div
                    key={tutor.id}
                    className="p-6 bg-[#FAF7F0] border border-[#E7DBC2]/80 rounded-sm space-y-4 group hover:border-[#A47A46] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 rounded-sm overflow-hidden border border-[#E7DBC2]/60 bg-[#F5F0E6] shrink-0">
                        {tutor.photoUrl ? (
                          <img
                            src={tutor.photoUrl}
                            alt={tutor.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#13263D]/40">
                            <User className="w-8 h-8" weight="thin" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-editorial text-2xl text-[#13263D] font-semibold">
                          {tutor.name}
                        </h4>
                        <p className="text-[10px] font-sans font-bold text-[#8C6D37] uppercase tracking-wider">
                          {tutor.specialization}
                        </p>
                        <p className="text-xs text-gray-700 font-sans font-medium">
                          {tutor.experienceYears}+ Years • {Array.isArray(tutor.languages) ? tutor.languages.join(', ') : tutor.languages}
                        </p>
                      </div>
                    </div>

                    {tutor.bio && (
                      <p className="text-xs text-gray-600 font-sans leading-relaxed line-clamp-2">
                        {tutor.bio}
                      </p>
                    )}

                    <div className="pt-1">
                      <button
                        onClick={() => handleSelectTeacher(tutor.gender, tutor.name)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#13263D] hover:text-[#A47A46] transition-colors cursor-pointer border-b border-[#13263D]/20 pb-0.5"
                      >
                        <span>Request Trial with {firstName}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
