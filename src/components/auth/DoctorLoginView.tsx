import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
  HelpCircle,
  X,
  Send,
} from 'lucide-react';

interface DoctorLoginViewProps {
  onBackToRoleSelection: () => void;
  onLoginSuccess?: (profile: any) => void;
}

export const DoctorLoginView: React.FC<DoctorLoginViewProps> = ({
  onBackToRoleSelection,
  onLoginSuccess,
}) => {
  const { t, language, showToast, setCurrentPage, loginUser } = useApp();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage(t('auth.enterValidEmail'));
      return;
    }

    if (!password) {
      setErrorMessage(t('auth.enterValidPassword'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.loginDoctor(cleanEmail, password, rememberMe);
      if (response.success) {
        setSuccessMessage(t('common.success'));
        showToast(t('auto.text_1170'));
        if (onLoginSuccess) {
          onLoginSuccess(response.data);
        } else {
          loginUser('doctor', cleanEmail, response.data);
        }
      } else {
        setErrorMessage(response.error || t('common.error'));
      }
    } catch {
      setErrorMessage(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) return;

    setForgotLoading(true);
    try {
      await authService.requestPasswordReset(forgotEmail, 'doctor');
      setForgotSuccess(true);
      showToast(t('auth.resetLinkSent'));
    } catch {
      // Fallback
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div id="doctor-login-container" className="max-w-lg mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-200">
      {/* Top Back Nav */}
      <div className="mb-6 flex items-center justify-between">
        <button
          id="btn-doctor-back-to-roles"
          onClick={onBackToRoleSelection}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('auth.backToRole')}</span>
        </button>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
          {t('auth.doctorTitle')}
        </span>
      </div>

      {/* Main Login Card */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-6 sm:p-8 text-left">
        {/* Card Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('auth.doctorLoginHeader')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {t('auth.doctorLoginSub')}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="doctor-login-error-alert"
            className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            id="doctor-login-success-alert"
            className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form id="form-doctor-login" onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <label
              htmlFor="doctor-email-input"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              {t('auth.email')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="doctor-email-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Password with Show/Hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="doctor-password-input"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t('auth.password')} <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                id="btn-doctor-forgot-password"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSuccess(false);
                  setIsForgotModalOpen(true);
                }}
                className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="doctor-password-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                id="btn-toggle-doctor-password"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="doctor-remember-me-checkbox"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
            />
            <label
              htmlFor="doctor-remember-me-checkbox"
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none"
            >
              {t('auth.rememberMe')}
            </label>
          </div>

          {/* Large Login Button */}
          <button
            id="btn-doctor-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t('auth.loginDoctorBtn')}</span>
              </>
            )}
          </button>
        </form>

        {/* Administrator Contact Link / Access Notice */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200/70 dark:border-blue-900/60 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-blue-900 dark:text-blue-200">
                {t('auth.doctorNotice')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {t('auth.restrictedDoctorNotice')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div
          id="doctor-forgot-password-modal"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-750">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>{t('auth.resetPasswordModalTitle')}</span>
              </h3>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('auth.resetLinkSent')}
                </p>
                <button
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  {t('common.close')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="py-4 space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t('auth.resetPasswordDesc')}
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="doctor@maharashtra.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-900"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-750 cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{t('auth.sendResetLink')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
