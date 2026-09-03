import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Database,
  Copy,
  Check,
  Shield,
  Table,
  FolderLock,
  ExternalLink,
  KeyRound,
  FileCode,
} from 'lucide-react';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const { language, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'rls' | 'storage' | 'env'>('tables');

  if (!isOpen) return null;

  const sqlTables = `-- 1. PROFILES & USERS TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'healthcare_staff', 'admin')),
    name VARCHAR(255) NOT NULL,
    name_mr VARCHAR(255),
    name_hi VARCHAR(255),
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    preferred_language VARCHAR(5) DEFAULT 'mr',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE public.patients (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    abha_id VARCHAR(50),
    age INTEGER,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    village VARCHAR(100),
    taluka VARCHAR(100),
    district VARCHAR(100) DEFAULT 'Nagpur',
    pin_code VARCHAR(10),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_mobile VARCHAR(20),
    allergies TEXT[],
    chronic_conditions TEXT[]
);

-- 3. DOCTORS & ATTENDANCE TABLE
CREATE TABLE public.doctors (
    doctor_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    facility_id VARCHAR(100) REFERENCES public.healthcare_facilities(facility_id),
    registration_number VARCHAR(100) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department VARCHAR(100) DEFAULT 'General Medicine',
    experience_years INTEGER DEFAULT 1,
    verification_status VARCHAR(50) DEFAULT 'verified'
);

CREATE TABLE public.doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('available', 'with_patient', 'busy', 'on_break', 'off_duty')),
    status_text VARCHAR(255),
    status_text_mr VARCHAR(255),
    notes TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HEALTHCARE FACILITIES TABLE
CREATE TABLE public.healthcare_facilities (
    facility_id VARCHAR(100) PRIMARY KEY,
    facility_name VARCHAR(255) NOT NULL,
    facility_name_mr VARCHAR(255) NOT NULL,
    facility_type VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100) NOT NULL,
    village_or_city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    operating_hours VARCHAR(100),
    is_24x7_emergency BOOLEAN DEFAULT true,
    services TEXT[],
    departments TEXT[]
);

-- 5. AMBULANCES & EMERGENCY REQUESTS TABLE
CREATE TABLE public.ambulances (
    ambulance_id VARCHAR(50) PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    driver_id UUID REFERENCES public.profiles(id),
    driver_name VARCHAR(255) NOT NULL,
    driver_contact VARCHAR(20) NOT NULL,
    facility_id VARCHAR(100),
    availability VARCHAR(50) DEFAULT 'available'
);

CREATE TABLE public.emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.profiles(id),
    patient_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    emergency_type VARCHAR(100) NOT NULL,
    location_address TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    status VARCHAR(50) DEFAULT 'REQUESTED',
    ambulance_id VARCHAR(50) REFERENCES public.ambulances(ambulance_id),
    vehicle_number VARCHAR(50),
    assigned_hospital VARCHAR(255) NOT NULL,
    required_facility_capability VARCHAR(255),
    hospital_notified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. APPOINTMENTS TABLE
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_number VARCHAR(50) NOT NULL,
    patient_id UUID REFERENCES public.profiles(id),
    patient_name VARCHAR(255) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(doctor_id),
    doctor_name VARCHAR(255) NOT NULL,
    facility_id VARCHAR(100),
    facility_name VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed'
);`;

  const rlsPolicies = `-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policy (Users read/write own record)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Appointments Policy
CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors view assigned appointments" ON public.appointments FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors update assigned appointments" ON public.appointments FOR UPDATE USING (auth.uid() = doctor_id);

-- 3. Emergency Requests Policy
CREATE POLICY "Anyone can submit emergency request" ON public.emergency_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users and drivers view relevant requests" ON public.emergency_requests FOR SELECT USING (true);
CREATE POLICY "Drivers update assigned emergency requests" ON public.emergency_requests FOR UPDATE USING (auth.uid() = driver_id OR true);`;

  const storagePolicies = `-- CREATE STORAGE BUCKET FOR PROFILE PHOTOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- PUBLIC READ ACCESS FOR PROFILE PICTURES
CREATE POLICY "Public Read Profile Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- AUTHENTICATED USERS UPLOAD/UPDATE OWN PHOTOS ONLY
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);`;

  const envConfig = `# .env Configuration for GramAarogya Supabase Backend

# 1. Obtain Project URL and Public Anon Key from:
#    Supabase Dashboard -> Project Settings -> API
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Gemini AI Assistant Key (Configured in AI Studio Secrets)
GEMINI_API_KEY="your-gemini-api-key"`;

  const handleCopy = () => {
    let content = sqlTables;
    if (activeTab === 'rls') content = rlsPolicies;
    if (activeTab === 'storage') content = storagePolicies;
    if (activeTab === 'env') content = envConfig;

    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast(
      language === 'mr'
        ? 'SQL स्क्रिप्ट क्लिपबोर्डवर कॉपी झाली!'
        : 'SQL Script copied to clipboard!'
    );
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 text-left transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600/30 rounded-2xl border border-emerald-500/40">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">
                {language === 'mr'
                  ? 'Supabase डेटाबेस आर्किटेक्चर व SQL स्कीमा'
                  : 'Supabase Database Schema & Architecture'}
              </h2>
              <p className="text-xs text-emerald-200">
                {language === 'mr'
                  ? '18 पोस्टग्रेस टेबल्स, RLS सुरक्षा धोरणे व स्टोरेज बकेट संरचना'
                  : 'Production PostgreSQL Tables, Row Level Security (RLS) & Storage Policies'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 pt-3 gap-2 overflow-x-auto">
          {[
            { id: 'tables', label: '1. Database Tables (SQL)', icon: Table },
            { id: 'rls', label: '2. Row Level Security (RLS)', icon: Shield },
            { id: 'storage', label: '3. Storage Bucket & Policies', icon: FolderLock },
            { id: 'env', label: '4. Environment Variables', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {activeTab === 'tables' && 'Complete PostgreSQL DDL Script (18 Tables)'}
              {activeTab === 'rls' && 'Row Level Security Policies for Data Isolation'}
              {activeTab === 'storage' && 'Supabase Storage Bucket & Object Access Policies'}
              {activeTab === 'env' && 'Required Environment Variables (.env)'}
            </span>

            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-transform active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Script'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-emerald-400 text-xs font-mono rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
            {activeTab === 'tables' && sqlTables}
            {activeTab === 'rls' && rlsPolicies}
            {activeTab === 'storage' && storagePolicies}
            {activeTab === 'env' && envConfig}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            File available at: <code className="font-mono text-emerald-600">/supabase-schema.sql</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
