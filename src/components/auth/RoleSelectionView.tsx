import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Shield,
  Activity,
  Lock,
  Globe,
} from 'lucide-react';
import { Language } from '../../types';

interface RoleSelectionViewProps {
  onSelectRole: (role: 'patient' | 'doctor') => void;
  onBackToHome?: () => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({
  onSelectRole,
}) => {
  const { t, language, setLanguage } = useApp();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
    { code: 'en', label: 'English', flag: '🌐' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  ];

  const roleCards = [
    {
      id: 'patient' as const,
      title: t('auth.patientTitle'),
      desc: t('auth.patientDesc'),
      buttonText: t('auth.patientLoginBtn'),
      icon: User,
      badge: language === 'mr' ? 'मोबाईल OTP' : language === 'hi' ? 'मोबाइल OTP' : 'Mobile OTP',
      colorScheme: {
        border: 'border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500',
        bg: 'bg-white dark:bg-slate-850',
        accentBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
        btnBg: 'bg-[#0F6B4F] hover:bg-[#0B4D38] text-white',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
      },
    },
    {
      id: 'doctor' as const,
      title: t('auth.doctorTitle'),
      desc: t('auth.doctorDesc'),
      buttonText: t('auth.doctorLoginBtn'),
      icon: Stethoscope,
      badge: language === 'mr' ? 'शासकीय वैद्यकीय' : language === 'hi' ? 'सरकारी चिकित्सा' : 'Clinical Portal',
      colorScheme: {
        border: 'border-blue-200 dark:border-blue-800/80 hover:border-blue-500',
        bg: 'bg-white dark:bg-slate-850',
        accentBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
        btnBg: 'bg-blue-700 hover:bg-blue-800 text-white',
        badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
      },
    },
  ];

  return (
    <div id="role-selection-container" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-in fade-in duration-200 text-left">
      {/* Top Bar: Govt emblem badge and Language selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('auth.officialGovtBadge')}</span>
        </div>

        {/* Quick Language Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <Globe className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === l.code
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Branding, Title & Subtitle */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0F6B4F] text-white shadow-lg mb-1 ring-4 ring-emerald-500/20">
          <Activity className="w-9 h-9 text-emerald-200" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('auth.welcomeTitle')}
        </h1>
        <p className="text-sm sm:text-base text-emerald-800 dark:text-emerald-300 font-semibold">
          {t('auth.welcomeSubtitle')}
        </p>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {t('auth.roleSelectionSubtitle')}
        </p>
      </div>

      {/* Exactly 2 Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
        {roleCards.map((role) => {
          const Icon = role.icon;
          return (
            <div
              key={role.id}
              id={`role-card-${role.id}`}
              className={`rounded-3xl border-2 transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 ${role.colorScheme.bg} ${role.colorScheme.border}`}
            >
              <div>
                {/* Header Icon + Role Badge */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${role.colorScheme.accentBg} shadow-inner`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${role.colorScheme.badgeBg}`}>
                    {role.badge}
                  </span>
                </div>

                {/* Role Title & Description */}
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  {role.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium min-h-[50px]">
                  {role.desc}
                </p>
              </div>

              {/* Action Button */}
              <button
                id={`btn-select-role-${role.id}`}
                onClick={() => onSelectRole(role.id)}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${role.colorScheme.btnBg}`}
              >
                <span>{role.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Security & Access Assurance Footer */}
      <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
        <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{t('auth.secureSsl')}</span>
      </div>
    </div>
  );
};
