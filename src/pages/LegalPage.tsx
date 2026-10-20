import React, { useEffect } from 'react';
import { ShieldCheck, FileText } from '@phosphor-icons/react';

interface LegalPageProps {
  variant: 'privacy' | 'terms';
}

/**
 * Real, URL-addressable legal pages (/privacy-policy and /terms).
 * Content mirrors the LegalModal text so the two never drift in substance.
 * Added 2026-10-20 per user request: footer links must open real pages.
 */
export const LegalPage: React.FC<LegalPageProps> = ({ variant }) => {
  const isPrivacy = variant === 'privacy';

  useEffect(() => {
    document.title = isPrivacy
      ? 'Privacy Policy | Noor E Quran Institute'
      : 'Terms & Conditions | Noor E Quran Institute';
  }, [isPrivacy]);

  return (
    <section className="py-16 lg:py-20 bg-[#FAF7F0] border-b border-[#E7DBC2]/70 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-3 text-[#A47A46] text-[11px] font-sans font-bold uppercase tracking-widest">
          {isPrivacy ? <ShieldCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          <span>Noor E Quran Institute Legal</span>
        </div>

        <h1 className="font-editorial text-3xl sm:text-4xl text-[#13263D] font-semibold tracking-tight mb-8">
          {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
        </h1>

        <div className="space-y-4 text-sm sm:text-[15px] text-gray-700 font-sans leading-relaxed">
          {isPrivacy ? (
            <>
              <p className="font-semibold text-gray-900">Effective Date: 15 August 2026</p>
              <p>
                At <strong>Noor E Quran Institute</strong> (`noorequraninstitute.me`), we hold our students' and families' privacy with utmost sanctity and trust.
              </p>
              <h2 className="font-editorial font-bold text-[#13263D] text-lg pt-3">1. Information We Collect</h2>
              <p>
                When booking a Free Trial or submitting an Enrollment Application, we collect student name, parent/guardian name, email address, phone/WhatsApp number, country, and course/tutor preferences.
              </p>
              <h2 className="font-editorial font-bold text-[#13263D] text-lg pt-3">2. How We Use Your Information</h2>
              <p>
                Information is strictly used to schedule your 1-on-1 trial classes, assign appropriate male or female instructors, communicate class links via WhatsApp, and manage student learning records. We never sell, rent, or share personal information with any third-party advertisers.
              </p>
              <h2 className="font-editorial font-bold text-[#13263D] text-lg pt-3">3. Child Privacy &amp; Safe Learning</h2>
              <p>
                Our 1-on-1 teaching sessions are strictly monitored for pedagogical excellence and child safety. Parents are always encouraged and welcome to observe their child's online Quran classes at any time.
              </p>
              <h2 className="font-editorial font-bold text-[#13263D] text-lg pt-3">4. Contact Us</h2>
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
              <h2 className="font-editorial font-bold text-[#13263D] text-lg pt-3">1. 3-Day Free Trial</h2>
              <p>
                The 3-Day Free Trial is provided without any financial commitment or payment advance. The purpose is strictly to evaluate the student's level, match schedule preferences, and assess tutor compatibility.
              </p>
              <h2 className="font-editorial font-bold text-[#13263D] text-lg pt-3">2. Class Attendance &amp; Etiquette</h2>
              <p>
                Students are expected to join their designated live video sessions on time with proper Islamic etiquette and an active Quran or Qaida copy. In case of unexpected absence, please notify your coordinator at least 4 hours in advance on WhatsApp.
              </p>
              <h2 className="font-editorial font-bold text-[#13263D] text-lg pt-3">3. Tutor Assignment</h2>
              <p>
                Tutor preferences (Male or Female) are respected according to student specifications and tutor availability.
              </p>
              <h2 className="font-editorial font-bold text-[#13263D] text-lg pt-3">4. Modifications &amp; Inquiries</h2>
              <p>
                For any course adjustments or rescheduling, please contact our academy helpline at <code>+92 327 4496163</code>.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
