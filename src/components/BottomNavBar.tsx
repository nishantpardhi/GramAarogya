import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Building2,
  Calendar,
  User,
  LayoutDashboard,
  Stethoscope,
  FileText,
  Truck,
  Activity,
  PhoneCall,
  Pill,
} from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { currentPage, setCurrentPage, t, currentUser, language } = useApp();

  // CRITICAL SECURITY RULE: If not authenticated, do not show any bottom navigation
  if (!currentUser) {
    return null;
  }

  // Patient Nav Items
  if (currentUser.role === 'patient') {
    const patientItems = [
      {
        id: 'patient-dashboard',
        label: t('auto.text_1034'),
        icon: LayoutDashboard,
        page: 'patient-dashboard',
        active: currentPage === 'patient-dashboard',
      },
      {
        id: 'facilities',
        label: t('auto.text_1035'),
        icon: Building2,
        page: 'facilities',
        active: currentPage === 'facilities',
      },
      {
        id: 'notifications',
        label: t('auto.text_1036'),
        icon: Activity,
        page: 'notifications', // Assuming there's a notifications page or we'll route to it
        active: currentPage === 'notifications',
      },
      {
        id: 'patient-profile',
        label: t('auto.text_1037'),
        icon: User,
        page: 'patient-profile',
        active: currentPage === 'patient-profile',
      },
    ];

    return (
      <nav
        id="mobile-bottom-navigation-bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg safe-area-bottom"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {patientItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`btn-bottom-nav-${item.id}`}
                onClick={() => setCurrentPage(item.page)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  item.active
                    ? 'text-[#0F6B4F] dark:text-emerald-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    item.active
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 text-[#0F6B4F] dark:text-emerald-300'
                      : (item as any).highlight
                      ? 'bg-emerald-50/60 dark:bg-slate-800 text-emerald-600'
                      : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight leading-none whitespace-nowrap">
                  {item.label}
                </span>
                {item.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F6B4F] dark:bg-emerald-400 mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Doctor Nav Items
  if (currentUser.role === 'doctor') {
    const doctorItems = [
      {
        id: 'doctor-dashboard',
        label: t('auto.text_1038'),
        icon: LayoutDashboard,
        page: 'doctor-dashboard',
        active: currentPage === 'doctor-dashboard',
      },
      {
        id: 'doctor-profile',
        label: t('auto.text_1039'),
        icon: User,
        page: 'profile', // assuming clicking profile opens modal or a profile page
        active: currentPage === 'profile',
      },
    ];

    return (
      <nav
        id="mobile-bottom-navigation-bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg safe-area-bottom"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {doctorItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`btn-bottom-nav-${item.id}`}
                onClick={() => setCurrentPage(item.page)}
                className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all relative ${
                  item.active
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    item.active ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight leading-none whitespace-nowrap">
                  {item.label}
                </span>
                {item.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return null;
};
