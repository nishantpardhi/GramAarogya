import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import {
  Activity,
  Home,
  Building2,
  Sparkles,
  Stethoscope,
  Calendar,
  PhoneCall,
  Pill,
  ShieldCheck,
  Megaphone,
  FileText,
  Globe,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Shield,
  HeartPulse,
  Layers,
  ArrowRight,
  Database,
  Truck,
  Edit3,
  LogIn,
  Lock,
  LayoutDashboard,
} from 'lucide-react';

export const TopNavBar: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    language,
    setLanguage,
    t,
    currentPage,
    setCurrentPage,
    notifications,
    setIsProfileModalOpen,
    setIsSqlSchemaModalOpen,
    logout,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
    { code: 'en', label: 'English', flag: '🌐' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
    setProfileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!currentUser) return 'GU';
    const parts = currentUser.name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return currentUser.name.substring(0, 2).toUpperCase();
  };

  const getRoleBadge = () => {
    if (!currentUser) return { label: t('auto.text_1142'), color: 'bg-slate-100 text-slate-800' };
    if (currentUser.role === 'doctor') return { label: t('auto.text_1125'), color: 'bg-blue-100 text-blue-800' };
    if (currentUser.role === 'admin') return { label: t('auto.text_1126'), color: 'bg-purple-100 text-purple-800' };
    return { label: t('auto.text_1127'), color: 'bg-emerald-100 text-emerald-800' };
  };

  const roleInfo = getRoleBadge();

  // Secondary health services items for patient dropdown
  const healthServicesItems = [
    {
      id: 'schemes',
      label: t('auto.text_1128'),
      desc: t('auto.text_1129'),
      icon: ShieldCheck,
      page: 'schemes',
    },
    {
      id: 'medicines',
      label: t('auto.text_1130'),
      desc: t('auto.text_1131'),
      icon: Pill,
      page: 'medicines',
    },
    {
      id: 'health-camps',
      label: t('auto.text_1132'),
      desc: t('auto.text_1133'),
      icon: Megaphone,
      page: 'health-camps',
    },
    {
      id: 'records',
      label: t('auto.text_1134'),
      desc: t('auto.text_1135'),
      icon: FileText,
      page: 'records',
    },
    {
      id: 'access-score',
      label: t('auto.text_1136'),
      desc: t('auto.text_1137'),
      icon: HeartPulse,
      page: 'access-score',
    },
  ];

  const isServicesActive = ['schemes', 'medicines', 'health-camps', 'records', 'access-score'].includes(currentPage);

  return (
    <header id="main-site-header" className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      {/* 1. TOP UTILITY STRIP (Gov of Maharashtra Official Portal) */}
      <div className="bg-[#0b4d38] text-emerald-100 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: State Branding */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 font-bold text-white shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              {t('auto.text_1138')}
            </span>
            <span className="text-emerald-400/60 hidden sm:inline">•</span>
            <span className="text-emerald-200 font-medium hidden md:inline shrink-0">
              {t('auto.text_1139')}
            </span>
            <span className="text-emerald-400/60 hidden sm:inline">•</span>
            <span className="text-emerald-300 font-semibold hidden sm:inline shrink-0">
              {t('auto.text_1143')}
            </span>
          </div>

          {/* Right: Security & Authentication Status */}
          <div className="flex items-center gap-3 text-[11px] shrink-0 font-bold">
            {currentUser ? (
              <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{t('auto.text_1144')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/50">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>{t('auto.text_1145')}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. PRIMARY MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Brand Identity / Logo */}
          <div
            onClick={() => {
              if (currentUser) {
                if (currentUser.role === 'doctor') handleNav('doctor-dashboard');
                else if (currentUser.role === 'admin') handleNav('admin-dashboard');
                else handleNav('patient-dashboard');
              } else {
                handleNav('login');
              }
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0 select-none"
            id="brand-logo-container"
          >
            {/* Custom Emblem */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0F6B4F] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform relative shrink-0">
              <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-200" />
              <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-amber-400 text-slate-950 px-1 rounded-sm shadow-xs leading-tight">
                MH
              </span>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  GramAarogya
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {t('auto.text_1140')}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 leading-tight">
                {t('brandSubtitle')}
              </p>
            </div>
          </div>

          {/* DESKTOP NAVIGATION (Rendered ONLY when Authenticated) */}
          {currentUser ? (
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs font-bold" id="desktop-main-navigation">
              {/* PATIENT ROLE NAVIGATION */}
              {currentUser.role === 'patient' && (
                <>
                  <button
                    id="nav-link-patient-dashboard"
                    onClick={() => handleNav('patient-dashboard')}
                    className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'patient-dashboard'
                        ? 'bg-[#0F6B4F] text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:text-[#0F6B4F] hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t('auto.text_1146')}</span>
                  </button>

                  <button
                    id="nav-link-ask-gramaarogya"
                    onClick={() => handleNav('ai-assistant')}
                    className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'ai-assistant'
                        ? 'bg-[#0F6B4F] text-white shadow-xs'
                        : 'text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('auto.text_1147')}</span>
                  </button>

                  <button
                    id="nav-link-consult-doctor"
                    onClick={() => handleNav('appointments')}
                    className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'telemedicine'
                        ? 'bg-[#0F6B4F] text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:text-[#0F6B4F] hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>{t('auto.text_1148')}</span>
                  </button>

                  <button
                    id="nav-link-find-healthcare"
                    onClick={() => handleNav('facilities')}
                    className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'facilities'
                        ? 'bg-[#0F6B4F] text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:text-[#0F6B4F] hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{t('auto.text_1149')}</span>
                  </button>

                  <button
                    id="nav-link-appointments"
                    onClick={() => handleNav('appointments')}
                    className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'appointments'
                        ? 'bg-[#0F6B4F] text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:text-[#0F6B4F] hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{t('auto.text_1150')}</span>
                  </button>

                  {/* 108 Emergency SOS */}
                  <button
                    id="nav-link-emergency-help"
                    onClick={() => handleNav('emergency')}
                    className="ml-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer animate-pulse hover:animate-none"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t('auto.text_1151')}</span>
                  </button>
                </>
              )}

              {/* DOCTOR ROLE NAVIGATION */}
              {currentUser.role === 'doctor' && (
                <>
                  <button
                    id="nav-link-doctor-dashboard"
                    onClick={() => handleNav('doctor-dashboard')}
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'doctor-dashboard'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t('auto.text_1152')}</span>
                  </button>
                </>
              )}

              {/* ADMIN ROLE NAVIGATION */}
              {currentUser.role === 'admin' && (
                <>
                  <button
                    id="nav-link-admin-dashboard"
                    onClick={() => handleNav('admin-dashboard')}
                    className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'admin-dashboard'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t('auto.text_1153')}</span>
                  </button>

                  <button
                    id="nav-link-api-diag"
                    onClick={() => handleNav('api-diagnostics')}
                    className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'api-diagnostics'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    <span>{t('auto.text_1154')}</span>
                  </button>
                </>
              )}
            </nav>
          ) : (
            /* UNAUTHENTICATED STATE: SECURITY BANNER */
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 font-semibold">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {t('auto.text_1155')}
              </span>
            </div>
          )}

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                id="top-language-selector-button"
                onClick={() => setLangMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
                title="Change Language (भाषा बदला)"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">
                  {t('auto.text_1141')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div
                  id="top-language-dropdown"
                  className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        language === l.code
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {language === l.code && <span className="text-emerald-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Bell (Only when logged in) */}
            {currentUser && (
              <div className="relative" ref={notifRef}>
                <button
                  id="top-notifications-button"
                  onClick={() => setNotifOpen((prev) => !prev)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div
                    id="top-notifications-dropdown"
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-700">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                        {t('auto.text_1156')}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        {unreadCount} {t('auto.text_1157')}
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto mt-2 space-y-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="py-2.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {language === 'mr' ? n.titleMr : n.title}
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {language === 'mr' ? n.messageMr : n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Patient Portal Top-Right: Direct Patient Profile Button */}
            {currentUser && currentUser.role === 'patient' ? (
              <button
                id="patient-top-profile-button"
                onClick={() => handleNav('patient-profile')}
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-800 hover:bg-emerald-50/50 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-2xs group"
                title={t('auto.text_1158')}
                aria-label="Patient Profile"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shrink-0">
                  {currentUser.profilePhoto || currentUser.avatar ? (
                    <img
                      src={currentUser.profilePhoto || currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Default Neutral Avatar (No hardcoded demo avatar) */
                    <User className="w-4 h-4 text-[#0F6B4F] dark:text-emerald-400" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left min-w-0 pr-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[#0F6B4F] dark:text-emerald-400 font-semibold leading-tight">
                    {t('auto.text_1159')}
                  </span>
                </div>
              </button>
            ) : currentUser ? (
              /* Doctor / Admin User Dropdown */
              <div className="relative" ref={profileRef}>
                <button
                  id="top-profile-button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-800 transition-colors cursor-pointer shadow-2xs group"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0F6B4F] text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {getUserInitials()}
                  </div>
                  <div className="hidden xl:block text-left min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold truncate capitalize">
                      {roleInfo.label}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                </button>

                {profileMenuOpen && (
                  <div
                    id="top-profile-dropdown"
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                  >
                    <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-xl mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-[#0F6B4F] text-white font-bold flex items-center justify-center text-sm shrink-0">
                          {getUserInitials()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {currentUser.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {currentUser.mobile || currentUser.email || 'Verified Account'}
                          </div>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-emerald-50 text-slate-700 dark:text-slate-200 hover:text-emerald-700 transition-colors shrink-0 shadow-2xs"
                        title="Edit Profile"
                      >
                        <Edit3 className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between px-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="text-slate-600 dark:text-slate-300 hover:text-emerald-700 font-semibold text-[11px] flex items-center gap-1 py-1 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{t('auto.text_1160')}</span>
                      </button>

                      <button
                        id="btn-top-logout"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                        className="text-rose-600 hover:text-rose-700 font-bold text-[11px] flex items-center gap-1.5 py-1 px-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('auto.text_1161')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* When NOT Logged In: Only Direct Login Button */
              <button
                id="top-navbar-login-button"
                onClick={() => handleNav('login')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#0F6B4F] text-white hover:bg-emerald-800 transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>{t('auth.loginBtn')}</span>
              </button>
            )}

            {/* Mobile Hamburger Button (ONLY for Doctor & Staff, NEVER for Patient Portal) */}
            {currentUser && currentUser.role !== 'patient' && (
              <button
                id="mobile-hamburger-button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                aria-label="Toggle Mobile Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. MOBILE SLIDEOUT MENU (Rendered ONLY when Authenticated as Doctor/Staff, NEVER for Patient) */}
      {currentUser && currentUser.role !== 'patient' && mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150 text-left"
        >
          {/* User Status in Drawer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0F6B4F] text-white font-bold flex items-center justify-center text-xs shrink-0">
                {getUserInitials()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">{roleInfo.label}</div>
              </div>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>{t('auto.text_1162')}</span>
            </button>
          </div>

          {/* Role Based Links in Mobile Drawer */}
          {currentUser.role === 'patient' && (
            <div className="space-y-1">
              <button
                onClick={() => handleNav('patient-dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>{t('auto.text_1163')}</span>
              </button>
              <button
                onClick={() => handleNav('ai-assistant')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t('auto.text_1164')}</span>
              </button>
              <button
                onClick={() => handleNav('facilities')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>{t('auto.text_1165')}</span>
              </button>
              <button
                onClick={() => handleNav('appointments')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{t('auto.text_1166')}</span>
              </button>
              <button
                onClick={() => handleNav('appointments')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Stethoscope className="w-4 h-4 text-blue-500" />
                <span>{t('auto.text_1167')}</span>
              </button>
              <button
                onClick={() => handleNav('emergency')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
              >
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  <span>{t('auto.text_1168')}</span>
                </div>
              </button>
            </div>
          )}

          {currentUser.role === 'doctor' && (
            <div className="space-y-1">
              <button
                onClick={() => handleNav('doctor-dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/40"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>{t('auto.text_1169')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
