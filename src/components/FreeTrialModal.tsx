import React, { useState } from 'react';
import { ALL_COURSES } from '../data/academyData';
import { createLeadInFirebase } from '../lib/firestoreService';
import {
  X,
  CheckCircle,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Phone,
  Envelope,
  Globe,
  ArrowRight,
  GraduationCap
} from '@phosphor-icons/react';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourseName?: string;
  defaultGender?: 'Male' | 'Female' | 'No Preference';
}

export const FreeTrialModal: React.FC<FreeTrialModalProps> = ({
  isOpen,
  onClose,
  initialCourseName,
  defaultGender = 'No Preference'
}) => {
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [courseName, setCourseName] = useState(initialCourseName || 'Noorani Qaida for Beginners');
  const [tutorGender, setTutorGender] = useState<'Male' | 'Female' | 'No Preference'>(defaultGender);
  const [timeSlot, setTimeSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Evening');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [preferredTimeRange, setPreferredTimeRange] = useState('');
  const [learningPace, setLearningPace] = useState<'Slow' | 'Normal' | 'Fast'>('Normal');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [successLead, setSuccessLead] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

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
      setErrorMsg('Please provide Student Name and WhatsApp/Phone number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. First save to Firestore Database
      const courseObj = ALL_COURSES.find(c => c.name === courseName) || ALL_COURSES[0];
      await createLeadInFirebase({
        studentName,
        parentName: parentName || studentName + ' Parent',
        email: email || `${studentName.toLowerCase().replace(/\s+/g, '')}@student.trial`,
        phone,
        country,
        courseId: courseObj.id,
        courseName,
        tutorGender,
        timeSlot,
        preferredDays: selectedDays,
        preferredTimeRange,
        learningPace,
        notes: notes ? [{ id: 'n-' + Date.now(), text: notes, author: 'Student/Parent', createdAt: new Date().toISOString() }] : [],
        status: 'New Lead'
      });

      // 2. Also send to Express backend / WhatsApp trigger
      try {
        const res = await fetch('/api/book-trial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName,
            parentName,
            email,
            phone,
            country,
            courseName,
            tutorGender,
            timeSlot,
            preferredDays: selectedDays,
            preferredTimeRange,
            learningPace,
            notes
          })
        });
        const data = await res.json();
        setSuccessLead(data);
      } catch {
        const waText = encodeURIComponent(
          `Salam! I just booked a 3-Day Free Trial at Noor E Quran Institute for ${studentName}.\nCourse: ${courseName}\nCountry: ${country}\nPhone: ${phone}`
        );
        setSuccessLead({
          success: true,
          whatsappUrl: `https://wa.me/923274496163?text=${waText}`
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again or contact via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessLead(null);
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
                100% Unconditional 3-Day Free Trial
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                Book Your 3-Day Free Trial
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Experience 1-on-1 private classes with our certified Male or Female teachers. No credit card or advance fee required.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {successLead ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-[#064E3B] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" weight="fill" />
              </div>
              <h3 className="text-xl font-heading font-bold text-[#064E3B]">
                JazakAllah Khair, {studentName}!
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Your 3-day free trial request for <strong>{courseName}</strong> has been registered. Our academic coordinator will contact you shortly to confirm your preferred session time.
              </p>

              {successLead.whatsappUrl && (
                <div className="pt-2">
                  <a
                    href={successLead.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-[#1EBE5D] transition-all shadow-sm"
                  >
                    <span>💬 Chat on WhatsApp to Confirm Schedule</span>
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

              {/* Student & Parent Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="trial-student-name" className="block text-xs font-bold text-gray-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    id="trial-student-name"
                    type="text"
                    required
                    placeholder="e.g. Ayaan / Fatima"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-hidden bg-[#FAFAF7]"
                  />
                </div>
                <div>
                  <label htmlFor="trial-parent-name" className="block text-xs font-bold text-gray-700 mb-1">
                    Parent / Guardian Name (Optional)
                  </label>
                  <input
                    id="trial-parent-name"
                    type="text"
                    placeholder="e.g. Imran Ali"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-hidden bg-[#FAFAF7]"
                  />
                </div>
              </div>

              {/* Phone & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="trial-phone" className="block text-xs font-bold text-gray-700 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    id="trial-phone"
                    type="tel"
                    required
                    placeholder="e.g. +92 327 4496163 / +44..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-hidden bg-[#FAFAF7]"
                  />
                </div>
                <div>
                  <label htmlFor="trial-country-select" className="block text-xs font-bold text-gray-700 mb-1">
                    Country / Timezone *
                  </label>
                  <select
                    id="trial-country-select"
                    aria-label="Country / Timezone"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-hidden bg-[#FAFAF7]"
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

              {/* Course Selection */}
              <div>
                <label htmlFor="trial-course-select" className="block text-xs font-bold text-gray-700 mb-1">
                  Select Desired Course *
                </label>
                <select
                  id="trial-course-select"
                  aria-label="Select Desired Course"
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] focus:border-transparent outline-hidden bg-[#FAFAF7]"
                >
                  {ALL_COURSES.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.audience})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tutor Gender & Learning Pace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tutor Preference
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['No Preference', 'Female', 'Male'] as const).map(g => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setTutorGender(g)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          tutorGender === g
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
                    Learning Pace / Speed
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

              {/* Preferred Days */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Preferred Days for Classes
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

              {/* Time Slot & Specific Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="trial-time-slot-select" className="block text-xs font-bold text-gray-700 mb-1">
                    General Time Slot
                  </label>
                  <select
                    id="trial-time-slot-select"
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                  >
                    <option value="Morning">Morning (8:00 AM - 12:00 PM)</option>
                    <option value="Afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                    <option value="Evening">Evening (5:00 PM - 9:00 PM)</option>
                    <option value="Night">Night (9:00 PM - 12:00 AM)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="trial-specific-time" className="block text-xs font-bold text-gray-700 mb-1">
                    Specific Preferred Time (e.g. 6:30 PM UK)
                  </label>
                  <input
                    id="trial-specific-time"
                    type="text"
                    placeholder="e.g. 7:00 PM EST / 5:30 PM PKT"
                    value={preferredTimeRange}
                    onChange={e => setPreferredTimeRange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                  />
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label htmlFor="trial-notes" className="block text-xs font-bold text-gray-700 mb-1">
                  Special Instructions / Student Level (Optional)
                </label>
                <textarea
                  id="trial-notes"
                  rows={2}
                  placeholder="e.g. 6-year-old child starting Qaida; requires gentle female teacher."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#064E3B] outline-hidden bg-[#FAFAF7]"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 gold-gradient-btn text-[#064E3B] rounded-2xl font-heading font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Registering Trial...' : 'CONFIRM 3-DAY FREE TRIAL BOOKING →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
