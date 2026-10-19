import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ALL_COURSES } from '../data/academyData';
import {
  X,
  User,
  GraduationCap,
  ShieldCheck,
  Envelope,
  Lock,
  Phone,
  Globe,
  CheckCircle,
  WarningCircle,
  ArrowRight,
  BookOpen,
  Key,
  ArrowsClockwise,
  WhatsappLogo,
  ArrowLeft,
  Eye,
  EyeSlash,
  ShieldWarning
} from '@phosphor-icons/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'student' | 'teacher';
  initialMode?: 'login' | 'signup';
  onSuccess?: (role: 'student' | 'teacher' | 'admin') => void;
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const visibleStart = local.slice(0, 2);
  const visibleEnd = local.slice(-2);
  return `${visibleStart}${'*'.repeat(Math.max(3, local.length - 4))}${visibleEnd}@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone) return phone;
  const cleaned = phone.trim();
  if (cleaned.length < 8) return cleaned;
  const prefix = cleaned.slice(0, 6);
  const suffix = cleaned.slice(-3);
  return `${prefix} ••• •${suffix}`;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'student',
  initialMode = 'login',
  onSuccess
}) => {
  const { signInWithGoogle, loginWithEmail, signUpStudentWithEmail, sendPhoneOtp, verifyPhoneOtp, resetPassword } = useAuth();

  const [activeRole, setActiveRole] = useState<'student' | 'teacher' | 'admin'>(initialRole);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');

  // Form State
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [loginPhone, setLoginPhone] = useState('+92 ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('+92 ');
  const [country, setCountry] = useState('Pakistan');
  const [courseName, setCourseName] = useState(ALL_COURSES[0].name);

  // 6-Digit OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isOtpMasked, setIsOtpMasked] = useState<boolean>(false);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [isResendActive, setIsResendActive] = useState<boolean>(false);

  // Input refs for 6-digit OTP fields
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (signupStep === 'otp' && resendTimer > 0) {
      setIsResendActive(true);
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setIsResendActive(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signupStep, resendTimer]);

  useEffect(() => {
    if (isOpen) {
      setActiveRole(initialRole);
      setAuthMode(initialMode);
      setSignupStep('form');
      setErrorMsg('');
      setSuccessMsg('');
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(60);
      setIsResendActive(false);
    }
  }, [isOpen, initialRole, initialMode]);

  if (!isOpen) return null;

  // Handle Google Login
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const account = await signInWithGoogle();
      // Detect role from email (teachers go to /teacher, students to /student)
      const { getRoleForEmail } = await import('../lib/roleUtils');
      const role = getRoleForEmail(account.email);
      setSuccessMsg('Signed in successfully with Google!');
      if (onSuccess) onSuccess(role);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      // Pasted full OTP code
      const pastedCode = cleanVal.slice(0, 6);
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedCode[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedCode.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP Request
  const handleSendOtpForSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required registration fields.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await sendPhoneOtp(phone, email, studentName);
      if (res.whatsappLink) setWaLink(res.whatsappLink);
      setSignupStep('otp');
      setResendTimer(60);
      setIsResendActive(true);
      setSuccessMsg(`Verification code sent to ${maskPhone(phone)} & ${maskEmail(email)}.`);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch verification OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification & Registration
  const handleVerifyOtpAndCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const verified = await verifyPhoneOtp(phone, enteredOtp);
      if (!verified) {
        setErrorMsg('Invalid or expired verification code. Please check or request a new code.');
        return;
      }

      await signUpStudentWithEmail(email, password, {
        studentName,
        parentName,
        phone,
        country,
        courseName
      });

      setSuccessMsg('Account registered and verified successfully! Welcome to Noor E Quran Institute.');
      if (onSuccess) onSuccess('student');
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Standard Email/Password Login
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await loginWithEmail(email, password);
      setSuccessMsg('Signed in successfully!');
      if (onSuccess) onSuccess(activeRole);
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Reset
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      if (resetPassword) {
        await resetPassword(email);
      }
      setSuccessMsg(`Password reset instructions sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#FAF7F0] border border-[#E7DBC2] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Editorial Modal Header */}
        <div className="px-6 py-5 bg-[#13263D] text-[#F5F0E6] border-b border-[#A47A46]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/branding/logo.webp?v=2"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/branding/logo.png?v=2'; }}
              alt="Noor E Quran Official Seal"
              className="w-16 h-16 sm:w-18 sm:h-18 object-contain rounded-xl bg-white border-2 border-[#A47A46]/60 p-1 shadow-md shrink-0"
              width="72"
              height="72"
            />
            <div className="space-y-0.5">
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#A47A46]">
                NOOR E QURAN INSTITUTE
              </p>
              <h2 className="font-editorial text-2xl text-[#F5F0E6] font-semibold tracking-tight">
                {authMode === 'forgot'
                  ? 'Reset Password'
                  : activeRole === 'admin'
                  ? 'Academy Admin Portal'
                  : activeRole === 'teacher'
                  ? 'Faculty & Teacher Portal'
                  : authMode === 'signup'
                  ? 'Student Enrollment Portal'
                  : 'Student Learning Portal'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#E7DBC2]/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Switcher Tabs */}
        {authMode !== 'forgot' && (
          <div className="bg-[#F5F0E6] px-6 pt-4 pb-0 border-b border-[#E7DBC2] flex gap-2">
            {[
              { id: 'student', label: 'Student', icon: User },
              { id: 'teacher', label: 'Teacher', icon: GraduationCap },
              { id: 'admin', label: 'Admin', icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveRole(tab.id as any);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-sans font-semibold rounded-t-sm transition-all border-t border-x cursor-pointer ${
                    active
                      ? 'bg-[#FAF7F0] text-[#13263D] border-[#E7DBC2] border-b-[#FAF7F0] -mb-[1px] font-bold'
                      : 'bg-transparent text-gray-500 border-transparent hover:text-[#13263D]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#A47A46]' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-sm flex items-start text-xs font-sans text-red-800">
              <WarningCircle className="w-4 h-4 mr-2 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-[#F5F0E6] border border-[#A47A46] rounded-sm flex items-start text-xs font-sans text-[#13263D]">
              <CheckCircle className="w-4 h-4 mr-2 text-[#A47A46] shrink-0 mt-0.5" weight="fill" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: FORGOT PASSWORD */}
          {authMode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-gray-600 font-sans leading-relaxed">
                Enter your registered email address to receive password reset instructions.
              </p>
              <div>
                <label className="block text-xs font-sans font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E7DBC2] rounded-sm text-xs font-sans bg-[#F5F0E6] focus:outline-none focus:border-[#13263D]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-gray-600 hover:text-[#13263D] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#13263D] text-[#F5F0E6] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#0C1A2E] transition-colors cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          ) : authMode === 'signup' && activeRole === 'student' ? (
            /* MODE 2: STUDENT SIGN UP */
            signupStep === 'form' ? (
              <form onSubmit={handleSendOtpForSignup} className="space-y-4">
                
                {/* Google Sign-in */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-2.5 px-4 border border-[#E7DBC2] bg-[#F5F0E6] hover:bg-[#E7DBC2]/50 rounded-sm text-xs font-sans font-semibold text-[#13263D] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Register with Google Account</span>
                </button>

                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-[#E7DBC2]" />
                  <span className="px-3 text-[11px] font-sans text-gray-400 uppercase tracking-wider">or with details</span>
                  <div className="flex-1 border-t border-[#E7DBC2]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daniyal Khan"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7DBC2] rounded-sm text-xs font-sans bg-[#F5F0E6] focus:outline-none focus:border-[#13263D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Parent / Guardian Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rashid Khan"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7DBC2] rounded-sm text-xs font-sans bg-[#F5F0E6] focus:outline-none focus:border-[#13263D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7DBC2] rounded-sm text-xs font-sans bg-[#F5F0E6] focus:outline-none focus:border-[#13263D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 mb-1">WhatsApp / Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+92 300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7DBC2] rounded-sm text-xs font-sans bg-[#F5F0E6] focus:outline-none focus:border-[#13263D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Select Track</label>
                    <select
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7DBC2] rounded-sm text-xs font-sans bg-[#F5F0E6] focus:outline-none focus:border-[#13263D]"
                    >
                      {ALL_COURSES.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-bold text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Create secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-9 border border-[#E7DBC2] rounded-sm text-xs font-sans bg-[#F5F0E6] focus:outline-none focus:border-[#13263D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-[#13263D] text-[#F5F0E6] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#0C1A2E] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{loading ? 'Sending Code...' : 'Proceed to Verification Code'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A47A46]" />
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-gray-500 font-sans">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs font-bold text-[#13263D] hover:text-[#A47A46] transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>

              </form>
            ) : (
              /* OTP VERIFICATION STEP */
              <form onSubmit={handleVerifyOtpAndCreateAccount} className="space-y-5 text-center">
                <div className="w-10 h-10 bg-[#F5F0E6] border border-[#A47A46] rounded-sm mx-auto flex items-center justify-center text-[#A47A46]">
                  <ShieldCheck className="w-5 h-5" weight="regular" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl text-[#13263D] font-semibold">Enter 6-Digit Code</h3>
                  <p className="text-xs text-gray-600 font-sans">
                    Code dispatched to <strong>{phone}</strong> and <strong>{email}</strong>
                  </p>
                </div>

                {/* 6 OTP Boxes */}
                <div className="flex justify-center gap-2 my-4">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center font-editorial text-2xl font-bold bg-[#F5F0E6] border border-[#E7DBC2] rounded-sm focus:border-[#13263D] focus:outline-none"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#13263D] text-[#F5F0E6] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#0C1A2E] transition-all cursor-pointer shadow-xs"
                >
                  {loading ? 'Verifying...' : 'Verify & Activate Student Account'}
                </button>

                <div className="flex items-center justify-between text-xs font-sans text-gray-500 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep('form')}
                    className="text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    ← Edit Details
                  </button>

                  <button
                    type="button"
                    disabled={isResendActive}
                    onClick={() => {
                      setResendTimer(60);
                      setIsResendActive(true);
                      sendPhoneOtp(phone, email, studentName);
                    }}
                    className={`font-semibold cursor-pointer ${
                      isResendActive ? 'text-gray-400' : 'text-[#13263D] hover:text-[#A47A46]'
                    }`}
                  >
                    {isResendActive ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* MODE 3: STANDARD LOGIN (Student / Teacher / Admin) */
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              
              {/* Student Google Option */}
              {activeRole === 'student' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full py-2.5 px-4 border border-[#E7DBC2] bg-[#F5F0E6] hover:bg-[#E7DBC2]/50 rounded-sm text-xs font-sans font-semibold text-[#13263D] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign In with Google</span>
                  </button>

                  <div className="flex items-center my-3">
                    <div className="flex-1 border-t border-[#E7DBC2]" />
                    <span className="px-3 text-[11px] font-sans text-gray-400 uppercase tracking-wider">or sign in with email</span>
                    <div className="flex-1 border-t border-[#E7DBC2]" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-sans font-bold text-gray-700 mb-1">
                  {activeRole === 'admin' ? 'Admin Username / Email' : 'Email Address'}
                </label>
                <div className="relative">
                  <Envelope className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder={activeRole === 'admin' ? 'admin@noorequraninstitute.me' : 'your.email@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-[#E7DBC2] rounded-sm text-xs font-sans bg-[#F5F0E6] focus:outline-none focus:border-[#13263D]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-sans font-bold text-gray-700">Password</label>
                  {activeRole === 'student' && (
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-[11px] font-sans text-[#13263D] hover:text-[#A47A46] cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 border border-[#E7DBC2] rounded-sm text-xs font-sans bg-[#F5F0E6] focus:outline-none focus:border-[#13263D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#13263D] text-[#F5F0E6] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#0C1A2E] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{loading ? 'Authenticating...' : `Sign In to ${activeRole === 'admin' ? 'Admin Portal' : activeRole === 'teacher' ? 'Faculty Portal' : 'Student Portal'}`}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A47A46]" />
              </button>

              {/* Quick Demo Fill Shortcut */}
              <div className="pt-2 border-t border-[#E7DBC2]/60 flex items-center justify-between text-[11px] text-gray-500 font-sans">
                <span>Quick Demo:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (activeRole === 'student') {
                      setEmail('student@noorequraninstitute.me');
                      setPassword('student123');
                    } else if (activeRole === 'teacher') {
                      setEmail('maryam@noorequraninstitute.me');
                      setPassword('teacher123');
                    } else {
                      setEmail('admin@noorequraninstitute.me');
                      setPassword('7860');
                    }
                  }}
                  className="text-[#13263D] font-bold hover:underline cursor-pointer"
                >
                  Fill {activeRole === 'student' ? 'Student' : activeRole === 'teacher' ? 'Faculty' : 'Admin'} Credentials
                </button>
              </div>

              {activeRole === 'student' && (
                <div className="text-center pt-1">
                  <span className="text-xs text-gray-500 font-sans">New student? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setSignupStep('form');
                    }}
                    className="text-xs font-bold text-[#13263D] hover:text-[#A47A46] transition-colors cursor-pointer"
                  >
                    Register Account
                  </button>
                </div>
              )}

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
