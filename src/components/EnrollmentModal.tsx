import React, { useState } from 'react';
import { ALL_COURSES, ALL_PACKAGES } from '../data/academyData';
import { PackagePlan } from '../types';
import { createEnrollmentInFirebase } from '../lib/firestoreService';
import { X, CheckCircle, Calendar, Clock, ShieldCheck, User, Phone, Envelope, ArrowRight } from '@phosphor-icons/react';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourseName?: string;
  initialPackage?: PackagePlan | null;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  initialCourseName,
  initialPackage
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [courseName, setCourseName] = useState(initialCourseName || 'Noorani Qaida for Beginners');
  const [selectedPackageId, setSelectedPackageId] = useState(initialPackage?.id || 'pkg-3days');
  const [tutorPreference, setTutorPreference] = useState<'Male' | 'Female' | 'No Preference'>('No Preference');
  const [timeSlot, setTimeSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Evening');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [preferredTimeRange, setPreferredTimeRange] = useState('');
  const [learningPace, setLearningPace] = useState<'Slow' | 'Normal' | 'Fast'>('Normal');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successApp, setSuccessApp] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentPkg = ALL_PACKAGES.find(p => p.id === selectedPackageId) || ALL_PACKAGES[1];

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !phone) {
      setErrorMsg('Please provide Student Name and WhatsApp/Phone Number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Create in Firestore
      const courseObj = ALL_COURSES.find(c => c.name === courseName) || ALL_COURSES[0];
      await createEnrollmentInFirebase({
        studentName,
        studentEmail: studentEmail || `${studentName.toLowerCase().replace(/\s+/g, '')}@student.alnoor`,
        phone,
        country,
        parentName: parentName || studentName + ' Guardian',
        parentPhone: parentPhone || phone,
        parentEmail: parentEmail || studentEmail,
        courseId: courseObj.id,
        courseName,
        packageId: currentPkg.id,
        packageName: currentPkg.name,
        monthlyFee: country === 'Pakistan' ? currentPkg.monthlyFeePKR : currentPkg.monthlyFeeUSD,
        tutorPreference,
        timeSlot,
        preferredDays: selectedDays,
        preferredTimeRange,
        learningPace,
        additionalNotes: additionalNotes || '',
        notes: additionalNotes ? [{ id: 'n-' + Date.now(), text: additionalNotes, author: 'Student/Parent', createdAt: new Date().toISOString() }] : [],
        paymentStatus: 'Pending',
        status: 'Active'
      });

      // 2. Also forward to Express backend
      try {
        const res = await fetch('/api/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName,
            studentEmail,
            phone,
            country,
            parentName,
            parentPhone,
            parentEmail,
            courseName,
            packageName: currentPkg.name,
            tutorPreference,
            timeSlot,
            preferredDays: selectedDays,
            preferredTimeRange,
            learningPace,
            additionalNotes
          })
        });
        const data = await res.json();
        setSuccessApp(data);
      } catch {
        const waText = encodeURIComponent(
          `Salam! I submitted an enrollment application at Noor E Quran Institute.\nStudent: ${studentName}\nCourse: ${courseName}\nPackage: ${currentPkg.name}\nPhone: ${phone}`
        );
        setSuccessApp({
          success: true,
          whatsappUrl: `https://wa.me/923274496163?text=${waText}`
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Enrollment failed. Please try again or reach out on WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessApp(null);
    onClose();
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl border border-emerald-950/10 overflow-hidden relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#064E3B] text-white p-6 sm:p-8 relative">
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 text-emerald-200 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/branding/logo.webp?v=2"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/branding/logo.png?v=2'; }}
              alt="Noor E Quran Official Seal"
              className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-2xl bg-white p-1 border-2 border-[#D4A72C]/60 shadow-lg shrink-0"
              width="72"
              height="72"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4A72C]/20 text-[#D4A72C] text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" weight="duotone" />
                Academy Admission Application
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                Enroll in Noor E Quran Institute
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Complete your admission profile. Your designated tutor will be assigned with custom timing and learning pace.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {successApp ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-[#064E3B] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" weight="fill" />
              </div>
              <h3 className="text-xl font-heading font-bold text-[#064E3B]">
                Application Submitted Successfully!
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{studentName}</strong>. Your enrollment for <strong>{courseName}</strong> ({currentPkg.name}) has been received. Our coordinator will send your class portal access and schedule on WhatsApp.
              </p>

              {successApp.whatsappUrl && (
                <div className="pt-2">
                  <a
                    href={successApp.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-[#1EBE5D] transition-all shadow-sm"
                  >
                    <span>💬 Chat on WhatsApp to Confirm Tutor</span>
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Package & Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="enroll-course-select" className="block text-xs font-bold text-gray-700 mb-1">
                    Select Course Program *
                  </label>
                  <select
                    id="enroll-course-select"
                    aria-label="Select Course Program"
                    value={courseName}
                    onChange={e => setCourseName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                  >
                    {ALL_COURSES.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="enroll-package-select" className="block text-xs font-bold text-gray-700 mb-1">
                    Select Tuition Package *
                  </label>
                  <select
                    id="enroll-package-select"
                    aria-label="Select Tuition Package"
                    value={selectedPackageId}
                    onChange={e => setSelectedPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                  >
                    {ALL_PACKAGES.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.daysPerWeek} - ${p.monthlyFeeUSD}/mo)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="enroll-student-name" className="block text-xs font-bold text-gray-700 mb-1">
                    Student Name *
                  </label>
                  <input
                    id="enroll-student-name"
                    type="text"
                    required
                    placeholder="Full Name"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                  />
                </div>
                <div>
                  <label htmlFor="enroll-phone" className="block text-xs font-bold text-gray-700 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    id="enroll-phone"
                    type="tel"
                    required
                    placeholder="+92 327 4496163 / +44..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                  />
                </div>
              </div>

              {/* Parent & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="enroll-parent-name" className="block text-xs font-bold text-gray-700 mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    id="enroll-parent-name"
                    type="text"
                    placeholder="e.g. Dr. Tariq Mahmood"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                  />
                </div>
                <div>
                  <label htmlFor="enroll-country-select" className="block text-xs font-bold text-gray-700 mb-1">
                    Country / Timezone
                  </label>
                  <select
                    id="enroll-country-select"
                    aria-label="Country / Timezone"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                  >
                    <option value="Pakistan">Pakistan (PKT)</option>
                    <option value="United Kingdom">United Kingdom (GMT / BST)</option>
                    <option value="United States">United States (EST / CST / PST)</option>
                    <option value="Canada">Canada (EST / MST)</option>
                    <option value="Australia">Australia (AEST)</option>
                    <option value="UAE / Saudi Arabia">UAE / Saudi Arabia (GST / AST)</option>
                    <option value="Europe">Europe (CET)</option>
                    <option value="Other Country">Other Country</option>
                  </select>
                </div>
              </div>

              {/* Tutor Gender & Learning Pace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tutor Gender Preference
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['No Preference', 'Female', 'Male'] as const).map(g => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setTutorPreference(g)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          tutorPreference === g
                            ? 'bg-[#064E3B] text-white border-[#064E3B]'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {g === 'Female' ? '👩 Female' : g === 'Male' ? '👨 Male' : 'Any'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Student Pace Profile
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Slow', 'Normal', 'Fast'] as const).map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setLearningPace(p)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          learningPace === p
                            ? 'bg-[#F3C64D] text-[#032B21] border-[#F3C64D]'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p === 'Slow' ? '🐢 Slow/Patient' : p === 'Normal' ? 'Normal' : '⚡ Fast'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Days Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Preferred Class Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allDays.map(d => {
                    const isSelected = selectedDays.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleDay(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-800 text-white font-bold'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {d.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label htmlFor="enroll-notes" className="block text-xs font-bold text-gray-700 mb-1">
                  Additional Notes / Goals
                </label>
                <textarea
                  id="enroll-notes"
                  rows={2}
                  placeholder="e.g. Previous Quran learning history, specific goals, preferred class timing..."
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#D4A72C] text-[#064E3B] hover:brightness-110 rounded-2xl font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50"
                >
                  {loading ? 'Submitting Application...' : 'SUBMIT ENROLLMENT APPLICATION'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
