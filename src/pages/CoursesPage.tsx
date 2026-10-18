import React, { useState, useMemo } from 'react';
import { Course } from '../types';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Certificate,
  Sparkle,
  GraduationCap,
  MagnifyingGlass,
  ArrowRight,
  ShieldCheck,
  Star
} from '@phosphor-icons/react';

interface CoursesPageProps {
  courses: Course[];
  onOpenTrial: (courseName?: string, genderPref?: 'Male' | 'Female' | 'No Preference') => void;
  onInspectCourse: (course: Course) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({
  courses,
  onOpenTrial,
  onInspectCourse
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Courses' },
    { id: 'foundation', label: 'Kids & Beginners' },
    { id: 'tajweed', label: 'Tajweed & Nazra' },
    { id: 'hifz', label: 'Hifz Memorization' },
    { id: 'islamic', label: 'Islamic Studies' }
  ];

  const filteredCourses = useMemo(() => courses.filter(course => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.arabicName && course.arabicName.includes(searchQuery));

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'foundation') {
      return course.slug.includes('qaida') || course.audience.toLowerCase().includes('kids') || course.audience.toLowerCase().includes('beginner');
    }
    if (selectedCategory === 'tajweed') {
      return course.slug.includes('tajweed') || course.slug.includes('nazra') || course.name.toLowerCase().includes('tajweed');
    }
    if (selectedCategory === 'hifz') {
      return course.slug.includes('hifz') || course.name.toLowerCase().includes('memorization');
    }
    if (selectedCategory === 'islamic') {
      return course.slug.includes('islamic') || course.slug.includes('arabic') || course.name.toLowerCase().includes('islamic');
    }
    return true;
  }), [courses, searchQuery, selectedCategory]);

  return (
    <div className="bg-[#FCFBF8] min-h-screen">
      {/* 1. Header Banner */}
      <section className="bg-[#0B332D] text-[#F8F5EE] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#B79A62]/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#B79A62_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07221E] border border-[#B79A62]/40 text-[#B79A62] text-[11px] font-sans font-bold uppercase tracking-widest">
            <Sparkle className="w-3.5 h-3.5" />
            <span>Accredited Quranic Syllabi</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl text-[#F8F5EE] font-semibold leading-tight">
            1-on-1 Online Quran &amp; Islamic Curricula
          </h1>

          <p className="text-sm sm:text-base text-[#E8E0D1]/85 max-w-2xl mx-auto font-sans leading-relaxed">
            Personalized, step-by-step Quran learning tracks tailored for children, sisters, and adults. Master Tajweed, recitation fluency, and memorization under verified scholars.
          </p>

          {/* Search & Category Filter Bar */}
          <div className="pt-6 max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <MagnifyingGlass className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses (e.g. Noorani Qaida, Tajweed, Hifz, Duas)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#FCFBF8] text-gray-900 rounded-sm border border-[#E8E0D1] focus:outline-none focus:border-[#B79A62] text-xs sm:text-sm font-sans shadow-sm"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-sans font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#B79A62] text-[#07221E] font-bold shadow-xs'
                      : 'bg-[#07221E]/60 text-[#E8E0D1] border border-[#B79A62]/30 hover:bg-[#07221E]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Comprehensive Course Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D1] pb-4">
            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl text-[#0B332D] font-bold">
                Available Study Programs ({filteredCourses.length})
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-sans mt-0.5">
                Every program includes 1-on-1 private lessons, certified tutors, flexible timings, and progress tracking.
              </p>
            </div>

            <span className="text-xs font-bold text-[#0B332D] bg-[#F8F5EE] px-3 py-1.5 rounded-sm border border-[#E8E0D1] shrink-0">
              3-Day Free Trial Included on All Tracks
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCourses.map((course, idx) => (
              <div
                key={course.id || course.slug}
                className="bg-[#F8F5EE] border border-[#E8E0D1] rounded-sm p-6 sm:p-8 flex flex-col justify-between hover:border-[#B79A62] transition-all shadow-xs hover:shadow-md group"
              >
                <div className="space-y-5">
                  {/* Top Bar: Arabic Name & Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-[#0B332D] text-[#F8F5EE] inline-block mb-1">
                        Track 0{idx + 1} • {course.audience || 'All Ages'}
                      </span>
                      <h3 className="font-editorial text-2xl sm:text-3xl text-[#0B332D] font-bold group-hover:text-[#B79A62] transition-colors">
                        {course.name}
                      </h3>
                    </div>

                    {course.arabicName && (
                      <span className="font-amiri text-2xl text-[#B79A62] dir-rtl text-right shrink-0">
                        {course.arabicName}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-700 font-sans leading-relaxed">
                    {course.description || course.shortDescription}
                  </p>

                  {/* Course Specs Meta Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-[#FCFBF8] border border-[#E8E0D1]/80 rounded-sm text-[11px] font-sans">
                    <div className="space-y-0.5">
                      <span className="text-gray-400 font-bold uppercase text-[9px] block">Duration</span>
                      <span className="font-bold text-[#0B332D] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#B79A62]" />
                        {course.duration || '3 - 6 Months'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-gray-400 font-bold uppercase text-[9px] block">Schedule</span>
                      <span className="font-bold text-[#0B332D] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#B79A62]" />
                        {course.classesPerWeek || '3 - 5 Days/Wk'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-gray-400 font-bold uppercase text-[9px] block">Monthly Fee</span>
                      <span className="font-bold text-[#0B332D]">
                        ${course.feeUSD || 35} / Rs {course.feePKR?.toLocaleString() || '3,500'}
                      </span>
                    </div>
                  </div>

                  {/* Syllabus Milestones Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-[#E8E0D1]/60">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B332D] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#B79A62]" />
                      <span>Key Syllabus Milestones &amp; Outcomes:</span>
                    </h4>

                    <div className="space-y-1.5">
                      {(course.highlights && course.highlights.length > 0
                        ? course.highlights
                        : [
                            '1-on-1 Dedicated Tutor with customized pace',
                            'Correct pronunciation (Makharij) of Arabic letters',
                            'Application of Noon Sakinah & Tanween Tajweed rules',
                            'Daily revision with weekly evaluation tests'
                          ]
                      ).map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-sans text-gray-700">
                          <CheckCircle className="w-3.5 h-3.5 text-[#B79A62] shrink-0 mt-0.5" weight="fill" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 mt-6 border-t border-[#E8E0D1] flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => onInspectCourse(course)}
                    className="text-xs font-sans font-semibold text-[#0B332D] hover:text-[#B79A62] inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View Syllabus Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onOpenTrial(course.name)}
                    className="px-5 py-2.5 bg-[#0B332D] text-[#F8F5EE] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#07221E] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Book 3-Day Free Trial</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B79A62]" weight="bold" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Comprehensive Course Comparison Matrix */}
      <section className="bg-[#F8F5EE] border-y border-[#E8E0D1] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#8C6D37]">
              SIDE-BY-SIDE MATRIX
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#0B332D] font-bold">
              Compare Our Quranic Study Tracks
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-sans">
              Choose the program best suited for your age, experience level, and academic aspirations.
            </p>
          </div>

          <div className="bg-[#FCFBF8] border border-[#E8E0D1] rounded-sm shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#0B332D] text-[#F8F5EE] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Course Program</th>
                    <th className="p-4">Target Audience</th>
                    <th className="p-4">Prerequisites</th>
                    <th className="p-4">Est. Duration</th>
                    <th className="p-4">Teacher Preference</th>
                    <th className="p-4 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D1]/70">
                  <tr className="hover:bg-[#F8F5EE]/60 transition-colors">
                    <td className="p-4 font-bold text-[#0B332D]">Noorani Qaida Foundation</td>
                    <td className="p-4 text-gray-700">Kids (4+) &amp; Absolute Beginners</td>
                    <td className="p-4 text-gray-500">None (Starts from Alif)</td>
                    <td className="p-4 text-gray-700 font-semibold">2 - 4 Months</td>
                    <td className="p-4 text-gray-700">Male or Female Tutor</td>
                    <td className="p-4 text-right text-emerald-800 font-bold">Included ✓</td>
                  </tr>
                  <tr className="hover:bg-[#F8F5EE]/60 transition-colors">
                    <td className="p-4 font-bold text-[#0B332D]">Quran Reading (Nazra with Tajweed)</td>
                    <td className="p-4 text-gray-700">Children &amp; Adults</td>
                    <td className="p-4 text-gray-500">Basic Arabic Letter Recognition</td>
                    <td className="p-4 text-gray-700 font-semibold">6 - 12 Months</td>
                    <td className="p-4 text-gray-700">Male or Female Tutor</td>
                    <td className="p-4 text-right text-emerald-800 font-bold">Included ✓</td>
                  </tr>
                  <tr className="hover:bg-[#F8F5EE]/60 transition-colors">
                    <td className="p-4 font-bold text-[#0B332D]">Advanced Tajweed Rules Mastery</td>
                    <td className="p-4 text-gray-700">Intermediate Readers &amp; Sisters</td>
                    <td className="p-4 text-gray-500">Fluent Nazra Quran Reading</td>
                    <td className="p-4 text-gray-700 font-semibold">3 - 6 Months</td>
                    <td className="p-4 text-gray-700">Certified Qari / Qariah</td>
                    <td className="p-4 text-right text-emerald-800 font-bold">Tajweed Sanad ✓</td>
                  </tr>
                  <tr className="hover:bg-[#F8F5EE]/60 transition-colors">
                    <td className="p-4 font-bold text-[#0B332D]">Hifz-ul-Quran (Memorization)</td>
                    <td className="p-4 text-gray-700">Dedicated Kids &amp; Adults</td>
                    <td className="p-4 text-gray-500">Flawless Nazra Quran Reading</td>
                    <td className="p-4 text-gray-700 font-semibold">2 - 3 Years</td>
                    <td className="p-4 text-gray-700">Certified Hafiz Scholar</td>
                    <td className="p-4 text-right text-emerald-800 font-bold">Hifz Ijazah ✓</td>
                  </tr>
                  <tr className="hover:bg-[#F8F5EE]/60 transition-colors">
                    <td className="p-4 font-bold text-[#0B332D]">Islamic Studies &amp; Daily Duas</td>
                    <td className="p-4 text-gray-700">School-Going Children</td>
                    <td className="p-4 text-gray-500">None</td>
                    <td className="p-4 text-gray-700 font-semibold">Ongoing</td>
                    <td className="p-4 text-gray-700">Male or Female Scholar</td>
                    <td className="p-4 text-right text-emerald-800 font-bold">Included ✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Academy Teaching Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#0B332D] text-[#F8F5EE] rounded-sm p-8 sm:p-12 border border-[#B79A62]/30 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[#B79A62] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Risk-Free Academic Trial</span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-4xl font-semibold text-[#F8F5EE]">
              Start with a 3-Day Free Trial Before Any Payment
            </h3>
            <p className="text-xs sm:text-sm text-[#E8E0D1]/80 font-sans leading-relaxed">
              Experience our live 1-on-1 interactive classroom, evaluate your assigned scholar, and receive a customized curriculum plan with zero upfront credit card or commitment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onOpenTrial()}
              className="px-6 py-3 bg-[#B79A62] text-[#07221E] font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-[#cbb17b] transition-all text-center cursor-pointer shadow-sm"
            >
              Book Free Trial Classes
            </button>
            <a
              href="https://wa.me/923274496163?text=Assalam-o-Alaikum!%20I%20would%20like%20course%20guidance%20for%20my%20family."
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 border border-[#B79A62]/40 text-[#F8F5EE] hover:bg-[#07221E] font-bold text-xs uppercase tracking-wider rounded-sm transition-all text-center cursor-pointer"
            >
              WhatsApp Course Coordinator
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

