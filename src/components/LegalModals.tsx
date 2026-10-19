import React from 'react';
import { X, ShieldCheck, FileText } from '@phosphor-icons/react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-950/10 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#13263D] text-white p-5 sm:p-6 relative bg-islamic-pattern">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-950 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1 text-[#D4A72C] text-xs font-bold uppercase tracking-wider">
            {type === 'privacy' ? <ShieldCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span>Noor E Quran Institute Legal</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
            {type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p className="font-semibold text-gray-900">Effective Date: 15 August 2026</p>
              <p>
                At <strong>Noor E Quran Institute</strong> (`noorequraninstitute.me`), we hold our students' and families' privacy with utmost sanctity and trust.
              </p>
              <h4 className="font-bold text-gray-900 text-sm pt-2">1. Information We Collect</h4>
              <p>
                When booking a Free Trial or submitting an Enrollment Application, we collect student name, parent/guardian name, email address, phone/WhatsApp number, country, and course/tutor preferences.
              </p>
              <h4 className="font-bold text-gray-900 text-sm pt-2">2. How We Use Your Information</h4>
              <p>
                Information is strictly used to schedule your 1-on-1 trial classes, assign appropriate male or female instructors, communicate class links via WhatsApp, and manage student learning records. We never sell, rent, or share personal information with any third-party advertisers.
              </p>
              <h4 className="font-bold text-gray-900 text-sm pt-2">3. Child Privacy & Safe Learning</h4>
              <p>
                Our 1-on-1 teaching sessions are strictly monitored for pedagogical excellence and child safety. Parents are always encouraged and welcome to observe their child's online Quran classes at any time.
              </p>
              <h4 className="font-bold text-gray-900 text-sm pt-2">4. Contact Us</h4>
              <p>
                For questions regarding your data privacy, contact our coordinator at <code>contact.noorequraninstitute@gmail.com</code> or on WhatsApp at <code>+92 327 4496163</code>.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-gray-900">Effective Date: 15 August 2026</p>
              <p>
                Welcome to <strong>Noor E Quran Institute</strong>. By using our website, booking trial classes, or enrolling in our academic courses, you agree to the following terms:
              </p>
              <h4 className="font-bold text-gray-900 text-sm pt-2">1. 3-Day Free Trial</h4>
              <p>
                The 3-Day Free Trial is provided without any financial commitment or payment advance. The purpose is strictly to evaluate the student\'s level, match schedule preferences, and assess tutor compatibility.
              </p>
              <h4 className="font-bold text-gray-900 text-sm pt-2">2. Class Attendance & Etiquette</h4>
              <p>
                Students are expected to join their designated live video sessions on time with proper Islamic etiquette and an active Quran or Qaida copy. In case of unexpected absence, please notify your coordinator at least 4 hours in advance on WhatsApp.
              </p>
              <h4 className="font-bold text-gray-900 text-sm pt-2">3. Tutor Assignment</h4>
              <p>
                Tutor preferences (Male or Female) are respected according to student specifications and tutor availability.
              </p>
              <h4 className="font-bold text-gray-900 text-sm pt-2">4. Modifications & Inquiries</h4>
              <p>
                For any course adjustments or rescheduling, please contact our academy helpline at <code>+92 327 4496163</code>.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#13263D] text-white hover:bg-[#043629]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
