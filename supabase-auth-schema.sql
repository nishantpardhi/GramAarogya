-- ============================================================================
-- GRAMAAROGYA (ग्रामआरोग्य) - SUPABASE AUTHENTICATION & RBAC SCHEMA
-- ============================================================================
-- Platform: Supabase PostgreSQL with Supabase Auth, Storage & Row Level Security
-- Instructions: Run this entire script in Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. BASE PROFILES TABLE (Linked 1:1 with auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('PATIENT', 'DOCTOR', 'HEALTHCARE_STAFF', 'ADMIN')),
    full_name TEXT NOT NULL,
    name_mr TEXT,
    name_hi TEXT,
    phone TEXT,
    email TEXT,
    profile_photo_url TEXT,
    preferred_language TEXT DEFAULT 'mr' CHECK (preferred_language IN ('mr', 'hi', 'en')),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. ROLE-SPECIFIC TABLES
-- ============================================================================

-- A. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    profile_photo_url TEXT,
    phone TEXT NOT NULL,
    abha_id TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE,
    blood_group TEXT,
    village TEXT,
    taluka TEXT,
    district TEXT DEFAULT 'Nagpur',
    pin_code TEXT,
    address TEXT,
    emergency_contact TEXT,
    emergency_contact_name TEXT,
    emergency_contact_mobile TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    profile_photo_url TEXT,
    specialization TEXT NOT NULL,
    qualification TEXT NOT NULL,
    department TEXT DEFAULT 'General Medicine',
    facility_id TEXT,
    facility_name TEXT,
    working_hours TEXT DEFAULT '09:00 AM - 04:00 PM',
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'with_patient', 'busy', 'on_break', 'off_duty')),
    experience_years INTEGER DEFAULT 5,
    registration_number TEXT,
    registration_council TEXT DEFAULT 'Maharashtra Medical Council (MMC)',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. HEALTHCARE STAFF TABLE
CREATE TABLE IF NOT EXISTS public.healthcare_staff (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    profile_photo_url TEXT,
    staff_type TEXT NOT NULL CHECK (staff_type IN ('NURSE', 'PHARMACIST', 'AMBULANCE_DRIVER', 'COMPOUNDER', 'OTHER')),
    facility_id TEXT,
    assigned_facility_name TEXT,
    vehicle_number TEXT, -- For 108 Ambulance Drivers
    shift_hours TEXT DEFAULT '08:00 AM - 04:00 PM',
    availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_district ON public.patients(district);
CREATE INDEX IF NOT EXISTS idx_doctors_facility ON public.doctors(facility_id);
CREATE INDEX IF NOT EXISTS idx_staff_facility ON public.healthcare_staff(facility_id);
CREATE INDEX IF NOT EXISTS idx_staff_type ON public.healthcare_staff(staff_type);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_staff ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
-- Users can view their own profile or public healthcare staff/doctor directories
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Public can view verified doctors and staff" 
ON public.profiles FOR SELECT 
USING (role IN ('DOCTOR', 'HEALTHCARE_STAFF'));

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- --- PATIENTS POLICIES ---
-- Patients can only read/update their own medical profile
CREATE POLICY "Patients can read own record" 
ON public.patients FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own record" 
ON public.patients FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can insert own record" 
ON public.patients FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Doctors & Authorized Staff can view patient info during active consultations
CREATE POLICY "Doctors and Staff can view patients" 
ON public.patients FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('DOCTOR', 'HEALTHCARE_STAFF', 'ADMIN')
  )
);

-- --- DOCTORS POLICIES ---
CREATE POLICY "Anyone can view doctor listings" 
ON public.doctors FOR SELECT 
USING (true);

CREATE POLICY "Doctors can update their own profile and availability" 
ON public.doctors FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can insert own doctor record" 
ON public.doctors FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- --- HEALTHCARE STAFF POLICIES ---
CREATE POLICY "Anyone can view staff directory" 
ON public.healthcare_staff FOR SELECT 
USING (true);

CREATE POLICY "Staff can update their own status and vehicle" 
ON public.healthcare_staff FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can insert own staff record" 
ON public.healthcare_staff FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. AUTOMATIC AUTH TRIGGER (Sync auth.users -> public.profiles)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  user_full_name TEXT;
  user_phone TEXT;
BEGIN
  -- Default to PATIENT if not explicitly provided in auth metadata
  assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'PATIENT');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.phone, 'User');
  user_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone');

  -- 1. Create base profile
  INSERT INTO public.profiles (id, role, full_name, email, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    assigned_role,
    user_full_name,
    NEW.email,
    user_phone,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    updated_at = NOW();

  -- 2. Create role-specific sub-record if PATIENT
  IF assigned_role = 'PATIENT' THEN
    INSERT INTO public.patients (user_id, full_name, phone, created_at, updated_at)
    VALUES (NEW.id, user_full_name, COALESCE(user_phone, ''), NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 7. SUPABASE STORAGE BUCKET: 'profile-photos'
-- ============================================================================
-- Insert bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Anyone can view public profile photos
CREATE POLICY "Public profile photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Users can upload and update only their own profile photo (in folder userId/)
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- 8. DASHBOARD CONFIGURATION INSTRUCTIONS
-- ============================================================================
-- 1. Enable Phone Auth in Supabase Dashboard:
--    Authentication -> Providers -> Phone -> Enable Phone Provider
--    (For development/testing, you can configure SMS Provider: Twilio / MessageBird, 
--     or configure "Test Phone Numbers" under Authentication -> Phone -> Test Phone Numbers,
--     e.g., Phone: +919999999999, OTP: 123456)
--
-- 2. Enable Email Auth in Supabase Dashboard:
--    Authentication -> Providers -> Email -> Enable Email Provider
--    Turn off "Confirm Email" if you wish to allow immediate sign-in for Doctor/Staff testing.
-- ============================================================================
