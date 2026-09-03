import React from 'react';
import { useApp } from '../context/AppContext';
import { Activity, PhoneCall, ShieldAlert, MapPin, Lock, LogIn } from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, t, setCurrentPage, currentUser } = useApp();

  return (
    <footer id="main-application-footer" className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm mt-auto">
      {/* 24x7 Emergency Helpline Bar */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/60 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-xs sm:text-sm">
                {language === 'mr'
                  ? '२४x७ महाराष्ट्र शासकीय आरोग्य आपत्कालीन हेल्पलाइन'
                  : language === 'hi'
                  ? '24x7 महाराष्ट्र सरकारी स्वास्थ्य हेल्पलाइन'
                  : '24x7 Maharashtra Govt. Health Helplines'}
              </div>
              <div className="text-[11px] text-slate-300">
                {language === 'mr'
                  ? 'टोल-फ्री शासकीय क्रमांक'
                  : 'Official Toll-free Emergency Numbers'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold">
            <span className="bg-rose-600 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <PhoneCall className="w-3 h-3" />
              {language === 'mr' ? '१०८ : रुग्णवाहिका' : '108 : Ambulance'}
            </span>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3" />
              {language === 'mr' ? '१०४ : आरोग्य सल्ला' : '104 : Health Advice'}
            </span>
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3" />
              {language === 'mr' ? '१४४१६ : टेली-मानस' : '14416 : Tele-MANAS'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F6B4F] flex items-center justify-center text-white shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-black text-white tracking-tight">GramAarogya Maharashtra</span>
              <p className="text-xs text-slate-400">
                {language === 'mr'
                  ? 'सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन'
                  : 'Public Health Department, Govt of Maharashtra'}
              </p>
            </div>
          </div>

          {/* Center / Portal status */}
          <div className="text-center md:text-right text-xs space-y-1">
            {currentUser ? (
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5 justify-center md:justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>
                  {language === 'mr'
                    ? `सक्रिय सत्र: ${currentUser.name} (${currentUser.role})`
                    : `Active Session: ${currentUser.name} (${currentUser.role})`}
                </span>
              </div>
            ) : (
              <div className="text-amber-400 font-semibold flex items-center gap-1.5 justify-center md:justify-end">
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {language === 'mr'
                    ? 'सुरक्षित आरोग्य पोर्टल • अनधिकृत प्रवेश प्रतिबंधित'
                    : 'Secure Healthcare Network • Authentication Required'}
                </span>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              {language === 'mr'
                ? 'महाराष्ट्र राज्य सार्वजनिक आरोग्य डिजिटल सुरक्षा मानके २०२६'
                : 'Maharashtra State Public Health Digital Security Standards 2026'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
