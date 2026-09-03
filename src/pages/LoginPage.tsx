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
    { code: 'mr', label: 'मराठी', flag: '🚩' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'en', label: 'English', flag: '🌐' },
  ];

  const handlePatientLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError(null);
    setPatientSuccess(null);
    const cleanMob = patientMobile.replace(/\D/g, '').slice(-10);
    if (cleanMob.length !== 10) { setPatientError('Invalid Mobile'); return; }
    if (patientPin.length < 4) { setPatientError('Invalid PIN'); return; }
    setPatientLoading(true);
    try {
      const response = await authService.loginPatientWithPin(cleanMob, patientPin);
      if (response.success && response.data) {
        showToast('Login Successful!');
        loginUser('patient', cleanMob, response.data);
      } else {
        setPatientError(response.error || 'Invalid credentials');
      }
    } catch {
      setPatientError('Login failed.');
    } finally {
      setPatientLoading(false);
    }
  };

  const handlePatientRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim()) { setRegError('Enter name'); return; }
    const cleanMob = regMobile.replace(/\D/g, '').slice(-10);
    if (cleanMob.length !== 10) { setRegError('Invalid Mobile'); return; }
    if (regPin.length < 4) { setRegError('Invalid PIN'); return; }
    if (regPin !== regConfirmPin) { setRegError('PIN mismatch'); return; }
    setRegLoading(true);
    try {
      const response = await authService.registerPatientWithPin({
        name: regName.trim(), nameMr: regName.trim(), mobile: cleanMob, pin: regPin.trim(),
      });
      if (response.success && response.data) {
        showToast('Patient account registered!');
        registerPatient({ name: regName.trim(), nameMr: regName.trim(), mobile: `+91 ${cleanMob}` });
      } else {
        setRegError(response.error || 'Registration failed.');
      }
    } catch {
      setRegError('Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorError(null);
    setDoctorSuccess(null);
    const cleanEmail = doctorEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) { setDoctorError('Invalid Email'); return; }
    if (!doctorPassword) { setDoctorError('Invalid Password'); return; }
    setDoctorLoading(true);
    try {
      const response = await authService.loginDoctor(cleanEmail, doctorPassword, doctorRememberMe);
      if (response.success && response.data) {
        showToast('Welcome to Doctor Portal');
        loginUser('doctor', cleanEmail, response.data);
      } else {
        setDoctorError(response.error || 'Not authorized.');
      }
    } catch {
      setDoctorError('Doctor authentication error.');
    } finally {
      setDoctorLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        {/* Language Selection Header */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">
            भाषा निवडा / Choose Language:
          </span>
          <div className="flex space-x-1.5">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                  language === l.code ? 'bg-emerald-600 text-white font-bold border-emerald-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>
        
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
            <span>{language === 'mr' ? 'रुग्ण लॉगिन' : language === 'hi' ? 'रोगी लॉगिन' : 'Patient Login'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('patient'); setIsRegistering(true); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'patient' && isRegistering ? 'bg-[#0F6B4F] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'mr' ? 'नवीन नोंदणी' : language === 'hi' ? 'नया खाता' : 'New Account'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('doctor'); setIsRegistering(false); }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'doctor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'mr' ? 'डॉक्टर' : 'Doctor'}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'patient' && !isRegistering && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Patient Login</h2>
            {patientError && <div className="text-red-600 text-sm mb-4">{patientError}</div>}
            <form onSubmit={handlePatientLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Mobile Number</label>
                <input type="tel" value={patientMobile} onChange={e => setPatientMobile(e.target.value)} className="w-full border rounded-xl p-3" placeholder="10-digit number" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">4-Digit PIN</label>
                <input type="password" value={patientPin} onChange={e => setPatientPin(e.target.value)} className="w-full border rounded-xl p-3" placeholder="****" />
              </div>
              <button type="submit" disabled={patientLoading} className="w-full bg-[#0F6B4F] text-white p-3 rounded-xl font-bold hover:bg-emerald-800 disabled:opacity-50">
                {patientLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'patient' && isRegistering && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4">Create Patient Account</h2>
            {regError && <div className="text-red-600 text-sm mb-4">{regError}</div>}
            <form onSubmit={handlePatientRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Full Name</label>
                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full border rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Mobile Number</label>
                <input type="tel" value={regMobile} onChange={e => setRegMobile(e.target.value)} className="w-full border rounded-xl p-3" placeholder="10-digit number" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Set 4-Digit PIN</label>
                <input type="password" value={regPin} onChange={e => setRegPin(e.target.value)} className="w-full border rounded-xl p-3" placeholder="****" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Confirm PIN</label>
                <input type="password" value={regConfirmPin} onChange={e => setRegConfirmPin(e.target.value)} className="w-full border rounded-xl p-3" placeholder="****" />
              </div>
              <button type="submit" disabled={regLoading} className="w-full bg-[#0F6B4F] text-white p-3 rounded-xl font-bold hover:bg-emerald-800 disabled:opacity-50">
                {regLoading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'doctor' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Doctor Portal Login</h2>
            {doctorError && <div className="text-red-600 text-sm mb-4">{doctorError}</div>}
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Official Email</label>
                <input type="email" value={doctorEmail} onChange={e => setDoctorEmail(e.target.value)} className="w-full border rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="doctor@arogya.gov.in" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Password</label>
                <input type="password" value={doctorPassword} onChange={e => setDoctorPassword(e.target.value)} className="w-full border rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <button type="submit" disabled={doctorLoading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                {doctorLoading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
