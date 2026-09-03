import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import {
  Phone,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Info,
} from 'lucide-react';

interface PatientLoginViewProps {
  onBackToRoleSelection: () => void;
  onLoginSuccess?: (profile: any) => void;
}

export const PatientLoginView: React.FC<PatientLoginViewProps> = ({
  onBackToRoleSelection,
  onLoginSuccess,
}) => {
  const { t, language, showToast, setCurrentPage, loginUser } = useApp();

  // Form States
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);

  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle Mobile Number Input
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(rawVal);
    if (errorMessage) setErrorMessage(null);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanMobile = mobileNumber.trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMessage(t('auth.enterValidMobile'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.loginPatient(cleanMobile, countryCode);
      if (response.success) {
        setOtpSent(true);
        setCountdown(60);
        setSuccessMessage(response.message || t('auth.otpSub', { phone: `${countryCode} ${cleanMobile}` }));
        showToast(language === 'mr' ? 'ओटीपी पाठवला आहे' : language === 'hi' ? 'ओटीपी भेजा गया है' : 'OTP dispatched');
      } else {
        setErrorMessage(response.error || t('auth.enterValidMobile'));
      }
    } catch {
      setErrorMessage(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP Digits change
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    if (errorMessage) setErrorMessage(null);

    // Auto-advance to next box
    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setErrorMessage(t('auth.enterValidOtp'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyPatientOTP(mobileNumber, otpCode);
      if (response.success) {
        setSuccessMessage(t('common.success'));
        showToast(language === 'mr' ? 'प्रवेश यशस्वी!' : language === 'hi' ? 'प्रवेश सफल!' : 'Login successful!');
        if (onLoginSuccess) {
          onLoginSuccess(response.data);
        } else {
          loginUser('patient', mobileNumber, response.data);
        }
      } else {
        setErrorMessage(response.error || t('auth.enterValidOtp'));
      }
    } catch {
      setErrorMessage(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await authService.resendOTP(mobileNumber, countryCode);
      if (res.success) {
        setCountdown(60);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMessage(t('auth.otpSub', { phone: `${countryCode} ${mobileNumber}` }));
        showToast(language === 'mr' ? 'ओटीपी पुन्हा पाठवला' : language === 'hi' ? 'ओटीपी पुनः भेजा गया' : 'OTP resent successfully');
        otpInputsRef.current[0]?.focus();
      } else {
        setErrorMessage(res.error || t('common.error'));
      }
    } catch {
      setErrorMessage(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="patient-login-container" className="max-w-lg mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Top Back Nav Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          id="btn-patient-back-to-roles"
          onClick={onBackToRoleSelection}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth.backToRole')}</span>
        </button>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          {t('auth.patientTitle')}
        </span>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-6 sm:p-8 text-left">
        {/* Card Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('auth.patientLoginHeader')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {otpSent
                ? t('auth.otpSub', { phone: `${countryCode} ${mobileNumber}` })
                : t('auth.patientLoginSub')}
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            id="patient-login-error-alert"
            className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div
            id="patient-login-success-alert"
            className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {!otpSent ? (
          /* STEP 1: MOBILE NUMBER ENTRY */
          <form id="form-patient-send-otp" onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label
                htmlFor="patient-mobile-input"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t('auth.mobileNumber')} <span className="text-rose-500">*</span>
              </label>

              <div className="flex gap-2">
                {/* Country Code Prefix */}
                <div className="w-20 px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center select-none shrink-0">
                  <span>🇮🇳 {countryCode}</span>
                </div>

                {/* Mobile Input Field */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="patient-mobile-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={mobileNumber}
                    onChange={handleMobileChange}
                    placeholder={t('auth.mobilePlaceholder')}
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Information Callout */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t('auth.noPasswordNeeded')}</span>
              </div>
              
            </div>

            {/* Large Send OTP Button */}
            <button
              id="btn-patient-send-otp"
              type="submit"
              disabled={isLoading || mobileNumber.length < 10}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F6B4F] hover:bg-[#0B4D38] text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('auth.sendingOtp')}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{t('auth.sendOtp')}</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: 6-DIGIT OTP VERIFICATION */
          <form id="form-patient-verify-otp" onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('auth.otpHeader')} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpDigits(['', '', '', '', '', '']);
                    setErrorMessage(null);
                  }}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {t('auth.changePhone')}
                </button>
              </div>

              {/* 6 OTP Input Boxes */}
              <div className="grid grid-cols-6 gap-2 sm:gap-3 my-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-full h-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Resend OTP & Countdown */}
            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <span className="text-slate-500 dark:text-slate-400">
                {countdown > 0 ? (
                  t('auth.resendIn', { seconds: countdown })
                ) : (
                  <span>{language === 'mr' ? 'ओटीपी आला नाही?' : language === 'hi' ? 'ओटीपी नहीं मिला?' : 'Didn\'t receive OTP?'}</span>
                )}
              </span>

              <button
                id="btn-patient-resend-otp"
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isLoading}
                className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('auth.resendOtp')}</span>
              </button>
            </div>

            {/* Verify OTP Button */}
            <button
              id="btn-patient-verify-otp"
              type="submit"
              disabled={isLoading || otpDigits.join('').length < 6}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0F6B4F] hover:bg-[#0B4D38] text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('auth.verifyingOtp')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('auth.verifyOtp')}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
