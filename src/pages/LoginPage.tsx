import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { User, ShieldCheck, Phone, Lock, ChevronRight, CheckCircle2, Sparkles, Building2, UserPlus, FileText } from 'lucide-react';
import { Language } from '../types';

type AuthRoleTab = 'patient' | 'doctor';

interface LoginPageProps {
  initialMode?: 'patient' | 'doctor';
}

export const LoginPage: React.FC<LoginPageProps> = ({ initialMode = 'patient' }) => {
  const { loginUser, registerPatient, showToast, t, language, setLanguage } = useApp();
  const [activeTab, setActiveTab] = useState<AuthRoleTab>(initialMode);
  const [isRegistering, setIsRegistering] = useState(false);

  // Patient Login
  const [patientMobile, setPatientMobile] = useState('');
  const [patientPin, setPatientPin] = useState('');
  const [showPatientPin, setShowPatientPin] = useState(false);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [patientSuccess, setPatientSuccess] = useState<string | null>(null);

  // Patient Register
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');
  const [showRegPin, setShowRegPin] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Doctor Login
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [doctorShowPassword, setDoctorShowPassword] = useState(false);
  const [doctorRememberMe, setDoctorRememberMe] = useState(true);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [doctorSuccess, setDoctorSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode === 'doctor') setActiveTab('doctor');
    else if (initialMode === 'patient') setActiveTab('patient');
  }, [initialMode]);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🌐' },
    { code: 'mr', label: 'मराठी', flag: '🚩' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  ];

  const handlePatientLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError(null);
    setPatientSuccess(null);
    const cleanMob = patientMobile.replace(/\D/g, '').slice(-10);
    if (cleanMob.length !== 10) { setPatientError(t('invalidMobile', { default: 'Invalid Mobile' })); return; }
    if (patientPin.length < 4) { setPatientError(t('invalidPin', { default: 'Invalid PIN' })); return; }
    setPatientLoading(true);
    try {
      const response = await authService.loginPatientWithPin(cleanMob, patientPin);
      if (response.success && response.data) {
        showToast(t('loginSuccess', { default: 'Login Successful!' }));
        loginUser('patient', cleanMob, response.data);
      } else {
        setPatientError(response.error || t('invalidCredentials', { default: 'Invalid credentials' }));
      }
    } catch {
      setPatientError(t('loginFailed', { default: 'Login failed.' }));
    } finally {
      setPatientLoading(false);
    }
  };

  const handlePatientRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim()) { setRegError(t('enterName', { default: 'Enter name' })); return; }
    const cleanMob = regMobile.replace(/\D/g, '').slice(-10);
    if (cleanMob.length !== 10) { setRegError(t('invalidMobile', { default: 'Invalid Mobile' })); return; }
    if (regPin.length < 4) { setRegError(t('invalidPin', { default: 'Invalid PIN' })); return; }
    if (regPin !== regConfirmPin) { setRegError(t('pinMismatch', { default: 'PIN mismatch' })); return; }
    setRegLoading(true);
    try {
      const response = await authService.registerPatientWithPin({
        name: regName.trim(), nameMr: regName.trim(), mobile: cleanMob, pin: regPin.trim(),
      });
      if (response.success && response.data) {
        showToast(t('registerSuccess', { default: 'Patient account registered!' }));
        registerPatient({ name: regName.trim(), nameMr: regName.trim(), mobile: `+91 ${cleanMob}` });
      } else {
        setRegError(response.error || t('registrationFailed', { default: 'Registration failed.' }));
      }
    } catch {
      setRegError(t('registrationFailed', { default: 'Registration failed.' }));
    } finally {
      setRegLoading(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorError(null);
    setDoctorSuccess(null);
    const cleanEmail = doctorEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) { setDoctorError(t('invalidEmail', { default: 'Invalid Email' })); return; }
    if (!doctorPassword) { setDoctorError(t('invalidPassword', { default: 'Invalid Password' })); return; }
    setDoctorLoading(true);
    try {
      const response = await authService.loginDoctor(cleanEmail, doctorPassword, doctorRememberMe);
      if (response.success && response.data) {
        showToast(t('doctorLoginSuccess', { default: 'Welcome to Doctor Portal' }));
        loginUser('doctor', cleanEmail, response.data);
      } else {
        setDoctorError(response.error || t('notAuthorized', { default: 'Not authorized.' }));
      }
    } catch {
      setDoctorError(t('doctorAuthError', { default: 'Doctor authentication error.' }));
    } finally {
      setDoctorLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
      
      {/* Compact Language Selector */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block px-3 py-2 shadow-sm cursor-pointer hover:bg-slate-50 outline-none transition-colors"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* Role Tabs */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex">
          <button
            type="button"
            onClick={() => { setActiveTab('patient'); setIsRegistering(false); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'patient' && !isRegistering ? 'bg-[#0F6B4F] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('auth.patientLogin', { default: 'Patient Login' })}</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('patient'); setIsRegistering(true); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'patient' && isRegistering ? 'bg-[#0F6B4F] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('auth.newRegistration', { default: 'New Account' })}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('doctor'); setIsRegistering(false); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'doctor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('auth.doctorTab', { default: 'Doctor' })}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'patient' && !isRegistering && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">{t('auth.patientLoginTitle', { default: 'Patient Login' })}</h2>
            {patientError && <div className="text-red-600 text-sm mb-4">{patientError}</div>}
            <form onSubmit={handlePatientLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">{t('auth.mobileNumber', { default: 'Mobile Number' })}</label>
                <input type="tel" value={patientMobile} onChange={e => setPatientMobile(e.target.value)} className="w-full border rounded-xl p-3" placeholder={t('auth.mobilePlaceholder', { default: '10-digit number' })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">{t('auth.pin', { default: '4-Digit PIN' })}</label>
                <input type="password" value={patientPin} onChange={e => setPatientPin(e.target.value)} className="w-full border rounded-xl p-3" placeholder="****" />
              </div>
              <button type="submit" disabled={patientLoading} className="w-full bg-[#0F6B4F] text-white p-3 rounded-xl font-bold hover:bg-emerald-800 disabled:opacity-50">
                {patientLoading ? t('auth.loggingIn', { default: 'Logging in...' }) : t('auth.loginBtn', { default: 'Login' })}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'patient' && isRegistering && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">{t('auth.createPatientAccount', { default: 'Create Patient Account' })}</h2>
            {regError && <div className="text-red-600 text-sm mb-4">{regError}</div>}
            <form onSubmit={handlePatientRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">{t('auth.fullName', { default: 'Full Name' })}</label>
                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">{t('auth.mobileNumber', { default: 'Mobile Number' })}</label>
                <input type="tel" value={regMobile} onChange={e => setRegMobile(e.target.value)} className="w-full border rounded-xl p-3" placeholder={t('auth.mobilePlaceholder', { default: '10-digit number' })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">{t('auth.setPin', { default: 'Set 4-Digit PIN' })}</label>
                <input type="password" value={regPin} onChange={e => setRegPin(e.target.value)} className="w-full border rounded-xl p-3" placeholder="****" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">{t('auth.confirmPin', { default: 'Confirm PIN' })}</label>
                <input type="password" value={regConfirmPin} onChange={e => setRegConfirmPin(e.target.value)} className="w-full border rounded-xl p-3" placeholder="****" />
              </div>
              <button type="submit" disabled={regLoading} className="w-full bg-[#0F6B4F] text-white p-3 rounded-xl font-bold hover:bg-emerald-800 disabled:opacity-50">
                {regLoading ? t('auth.creatingAccount', { default: 'Creating Account...' }) : t('auth.registerBtn', { default: 'Register' })}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'doctor' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4 text-blue-900">{t('auth.doctorLoginTitle', { default: 'Doctor Portal Login' })}</h2>
            {doctorError && <div className="text-red-600 text-sm mb-4">{doctorError}</div>}
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">{t('auth.officialEmail', { default: 'Official Email' })}</label>
                <input type="email" value={doctorEmail} onChange={e => setDoctorEmail(e.target.value)} className="w-full border rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="doctor@arogya.gov.in" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">{t('auth.password', { default: 'Password' })}</label>
                <input type="password" value={doctorPassword} onChange={e => setDoctorPassword(e.target.value)} className="w-full border rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <button type="submit" disabled={doctorLoading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                {doctorLoading ? t('auth.authenticating', { default: 'Authenticating...' }) : t('auth.secureLogin', { default: 'Secure Login' })}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
