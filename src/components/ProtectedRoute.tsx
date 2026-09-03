import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { ShieldAlert, LogIn, ArrowRight, Lock, Activity, RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  portalName?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  portalName,
}) => {
  const { currentUser, isAuthLoading, setCurrentPage, language } = useApp();

  // Automatic redirect to /login if user is unauthenticated
  React.useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      setCurrentPage('login');
    }
  }, [isAuthLoading, currentUser, setCurrentPage]);

  // 1. Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4 animate-pulse">
          <Activity className="w-7 h-7 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          {language === 'mr' ? 'प्रमाणीकरण तपासत आहे...' : 'Verifying Security Credentials...'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {language === 'mr'
            ? 'Supabase डेटाबेसद्वारे आपली भूमिका आणि सुरक्षा पडताळली जात आहे.'
            : 'Checking active session and database role permissions.'}
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State (No User Logged In)
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-5 shadow-inner">
          <Lock className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {language === 'mr'
            ? 'प्रवेशासाठी लॉगिन आवश्यक आहे'
            : language === 'hi'
            ? 'प्रवेश के लिए लॉगिन आवश्यक है'
            : 'Authentication Required'}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
          {language === 'mr'
            ? `हा विभाग (${portalName || 'सुरक्षित पोर्टल'}) पाहण्यासाठी कृपया आपल्या अधिकृत खात्याद्वारे लॉगिन करा.`
            : `To access the ${portalName || 'requested healthcare portal'}, please sign in with your authorized credentials.`}
        </p>

        <button
          onClick={() => setCurrentPage('login')}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{language === 'mr' ? 'लॉगिन पृष्ठावर जा' : 'Sign In to GramAarogya'}</span>
        </button>
      </div>
    );
  }

  // 3. Unauthorized Role State (User logged in with wrong role)
  if (!allowedRoles.includes(currentUser.role)) {
    const getTargetDashboard = () => {
      if (currentUser.role === 'doctor') return 'doctor-dashboard';
      if (currentUser.role === 'admin') return 'admin-dashboard';
      return 'patient-dashboard';
    };

    const getRoleName = (role: string) => {
      if (role === 'patient') return language === 'mr' ? 'नागरिक / रुग्ण' : 'Patient';
      if (role === 'doctor') return language === 'mr' ? 'डॉक्टर' : 'Doctor';
      if (role === 'admin') return language === 'mr' ? 'प्रशासक' : 'Admin';
      return role;
    };

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-5 shadow-sm border border-amber-200 dark:border-amber-800">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {language === 'mr' ? 'प्रवेश नाकारला (Access Denied)' : 'Access Denied: Role Unauthorized'}
        </h2>
        
        <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 text-left space-y-1.5 w-full">
          <p className="font-semibold">
            {language === 'mr'
              ? `आपले खाते '${getRoleName(currentUser.role)}' म्हणून नोंदणीकृत आहे.`
              : `Your authenticated account is registered as '${getRoleName(currentUser.role)}'.`}
          </p>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            {language === 'mr'
              ? `या पोर्टलवर प्रवेश करण्यासाठी ${allowedRoles.map(getRoleName).join(', ')} ची परवानगी आवश्यक आहे.`
              : `Access to this portal requires authorized role: ${allowedRoles.join(', ')}.`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
          <button
            onClick={() => setCurrentPage(getTargetDashboard())}
            className="flex-1 py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>{language === 'mr' ? 'माझ्या अधिकृत डॅशबोर्डवर जा' : 'Go to My Authorized Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentPage('login')}
            className="py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'दुसऱ्या खात्याने लॉगिन करा' : 'Switch Account'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Authorized -> Render Protected View
  return <>{children}</>;
};
