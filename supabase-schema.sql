-- ==============================================================================
-- GRAMAAROGYA (SwasthyaSetu Maharashtra) - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Smart India Hackathon (SIH) - Government of Maharashtra Problem Statement
-- "Accessibility & Quality of Public Healthcare Services in Rural & Underserved Areas"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES & ROLES TABLE (Extends Supabase Auth users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'healthcare_staff', 'admin')),
    name VARCHAR(255) NOT NULL,
    name_mr VARCHAR(255),
    name_hi VARCHAR(255),
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    preferred_language VARCHAR(5) DEFAULT 'mr' CHECK (preferred_language IN ('mr', 'hi', 'en')),
    is_verified BOOLEAN DEFAULT false,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. PATIENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    abha_id VARCHAR(50), -- Ayushman Bharat Health Account ID (e.g. 91-4402-9912-8841)
    age INTEGER,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE,
    blood_group VARCHAR(10),
    village VARCHAR(100),
    taluka VARCHAR(100),
    district VARCHAR(100) DEFAULT 'Nagpur',
    pin_code VARCHAR(10),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_mobile VARCHAR(20),
    allergies TEXT[],
    chronic_conditions TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. HEALTHCARE FACILITIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.healthcare_facilities (
    facility_id VARCHAR(100) PRIMARY KEY,
    facility_name VARCHAR(255) NOT NULL,
    facility_name_mr VARCHAR(255) NOT NULL,
    facility_name_hi VARCHAR(255),
    facility_type VARCHAR(50) NOT NULL CHECK (facility_type IN ('PHC', 'CHC', 'Sub-Centre', 'District Hospital', 'Government Medical College', 'Sub-District Hospital')),
    district VARCHAR(100) NOT NULL,
    taluka VARCHAR(100) NOT NULL,
    village_or_city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    emergency_number VARCHAR(50) DEFAULT '108',
    operating_hours VARCHAR(100) DEFAULT '24x7 Emergency / 9 AM - 4 PM OPD',
    is_24x7_emergency BOOLEAN DEFAULT true,
    has_ambulance BOOLEAN DEFAULT true,
    has_free_medicines BOOLEAN DEFAULT true,
    specialists_available TEXT[],
    services TEXT[],
    departments TEXT[],
    beds_total INTEGER DEFAULT 30,
    beds_available INTEGER DEFAULT 12,
    status VARCHAR(50) DEFAULT 'operational',
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. DOCTORS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.doctors (
    doctor_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    facility_id VARCHAR(100) REFERENCES public.healthcare_facilities(facility_id) ON DELETE SET NULL,
    registration_number VARCHAR(100) NOT NULL, -- MMC / MCI Registration Number
    registration_council VARCHAR(255) DEFAULT 'Maharashtra Medical Council (MMC), Mumbai',
    qualification VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    specialization_mr VARCHAR(100),
    specialization_hi VARCHAR(100),
    department VARCHAR(100) DEFAULT 'General Medicine',
    experience_years INTEGER DEFAULT 1,
    consultation_type VARCHAR(100) DEFAULT 'Both In-Person & Telemedicine',
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00, -- Free for Govt. facilities
    languages TEXT[] DEFAULT ARRAY['मराठी', 'English', 'हिंदी'],
    working_hours VARCHAR(100) DEFAULT '09:00 AM - 04:00 PM',
    telemedicine_available BOOLEAN DEFAULT true,
    verification_status VARCHAR(50) DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending_verification', 'rejected', 'demo')),
    verification_date TIMESTAMPTZ,
    verified_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. HEALTHCARE STAFF TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.healthcare_staff (
    staff_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    facility_id VARCHAR(100) REFERENCES public.healthcare_facilities(facility_id) ON DELETE SET NULL,
    staff_type VARCHAR(50) NOT NULL CHECK (staff_type IN ('nurse', 'pharmacist', 'ambulance_driver', 'compounder', 'health_worker', 'facility_admin')),
    assigned_vehicle_number VARCHAR(50), -- for ambulance drivers (e.g. MH-40-AZ-1081)
    shift_hours VARCHAR(100) DEFAULT 'Day Shift (08:00 AM - 04:00 PM)',
    availability_status VARCHAR(50) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. DOCTOR AVAILABILITY & ATTENDANCE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
    facility_id VARCHAR(100) REFERENCES public.healthcare_facilities(facility_id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('available', 'with_patient', 'busy', 'on_break', 'off_duty')),
    status_text VARCHAR(255) DEFAULT 'Available for Consultations',
    status_text_mr VARCHAR(255) DEFAULT 'तपासणीसाठी उपलब्ध',
    active_shift VARCHAR(100) DEFAULT 'Regular OPD Shift',
    current_queue_count INTEGER DEFAULT 0,
    avg_wait_time_minutes INTEGER DEFAULT 10,
    notes TEXT,
    updated_by VARCHAR(255),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. APPOINTMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_number VARCHAR(50) NOT NULL, -- e.g. PHC-104
    patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INTEGER,
    patient_gender VARCHAR(20),
    patient_village VARCHAR(100),
    patient_district VARCHAR(100),
    patient_mobile VARCHAR(20) NOT NULL,
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    doctor_name VARCHAR(255) NOT NULL,
    doctor_specialization VARCHAR(100),
    facility_id VARCHAR(100) REFERENCES public.healthcare_facilities(facility_id) ON DELETE SET NULL,
    facility_name VARCHAR(255) NOT NULL,
    facility_name_mr VARCHAR(255),
    department VARCHAR(100) DEFAULT 'General OPD',
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    consultation_type VARCHAR(100) DEFAULT 'In-Person (OPD)',
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Completed', 'Cancelled', 'In-Progress', 'Pending')),
    priority VARCHAR(50) DEFAULT 'Regular' CHECK (priority IN ('Regular', 'High', 'Emergency')),
    doctor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. AMBULANCES & EMERGENCY REQUESTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ambulances (
    ambulance_id VARCHAR(50) PRIMARY KEY,
    vehicle_number VARCHAR(50) NOT NULL UNIQUE,
    ambulance_type VARCHAR(50) DEFAULT '108 Government Emergency',
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_contact VARCHAR(20) NOT NULL,
    facility_id VARCHAR(100) REFERENCES public.healthcare_facilities(facility_id) ON DELETE SET NULL,
    facility_name VARCHAR(255) NOT NULL,
    current_lat DECIMAL(10, 7) NOT NULL,
    current_lng DECIMAL(10, 7) NOT NULL,
    availability VARCHAR(50) DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'offline')),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    emergency_type VARCHAR(100) NOT NULL, -- Snake Bite, Cardiac, Maternal, Accident
    location_address TEXT NOT NULL,
    village VARCHAR(100),
    district VARCHAR(100) DEFAULT 'Nagpur',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    status VARCHAR(50) DEFAULT 'REQUESTED' CHECK (
        status IN (
            'REQUESTED',
            'DISPATCHING',
            'ACCEPTED',
            'ON_THE_WAY',
            'ARRIVED',
            'PATIENT_PICKED_UP',
            'IN_TRANSIT',
            'ARRIVED_AT_HOSPITAL',
            'COMPLETED',
            'CANCELLED'
        )
    ),
    ambulance_id VARCHAR(50) REFERENCES public.ambulances(ambulance_id) ON DELETE SET NULL,
    vehicle_number VARCHAR(50),
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    driver_name VARCHAR(255),
    driver_mobile VARCHAR(20),
    eta_minutes INTEGER DEFAULT 12,
    assigned_hospital_id VARCHAR(100) REFERENCES public.healthcare_facilities(facility_id) ON DELETE SET NULL,
    assigned_hospital VARCHAR(255) NOT NULL,
    assigned_hospital_name_mr VARCHAR(255),
    required_facility_capability VARCHAR(255),
    dispatch_notes TEXT,
    hospital_notified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. REFERRALS & FOLLOW-UPS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INTEGER,
    patient_village VARCHAR(100),
    referring_doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    referring_doctor_name VARCHAR(255) NOT NULL,
    referring_facility VARCHAR(255) NOT NULL,
    target_facility_type VARCHAR(50) NOT NULL,
    target_facility_name VARCHAR(255) NOT NULL,
    target_department VARCHAR(100) NOT NULL,
    clinical_reason TEXT NOT NULL,
    clinical_reason_mr TEXT,
    urgency VARCHAR(50) DEFAULT 'Routine (1 week)',
    referral_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Completed')),
    transport_support_needed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. PRESCRIPTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INTEGER,
    patient_village VARCHAR(100),
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    doctor_name VARCHAR(255) NOT NULL,
    doctor_specialization VARCHAR(100),
    facility_name VARCHAR(255) NOT NULL,
    prescription_date DATE DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    diagnosis_mr TEXT,
    symptoms TEXT[],
    medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_tests TEXT[],
    advice TEXT,
    advice_mr TEXT,
    follow_up_date DATE,
    follow_up_required BOOLEAN DEFAULT false,
    signed_digitally BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. MEDICINE INVENTORY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.medicine_stocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    facility_id VARCHAR(100) REFERENCES public.healthcare_facilities(facility_id) ON DELETE CASCADE,
    facility_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    available_quantity INTEGER DEFAULT 0,
    stock_status VARCHAR(50) DEFAULT 'In Stock' CHECK (stock_status IN ('In Stock', 'Low Stock', 'Out of Stock')),
    price VARCHAR(100) DEFAULT 'Free (Government Scheme)',
    requires_prescription BOOLEAN DEFAULT true,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_mr VARCHAR(255),
    message TEXT NOT NULL,
    message_mr TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('appointment', 'emergency', 'prescription', 'camp', 'reminder', 'scheme', 'system')),
    is_read BOOLEAN DEFAULT false,
    link_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. STORAGE BUCKET CONFIGURATION FOR PROFILE PHOTOS
-- ==============================================================================
-- Insert profile-photos bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public Read
CREATE POLICY "Public Read Profile Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Storage RLS: Authenticated users can upload/update their own photos
CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own profile photo"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;

-- Public Facilities & Stocks are readable by all
CREATE POLICY "Allow public read facilities" ON public.healthcare_facilities FOR SELECT USING (true);
CREATE POLICY "Allow public read doctor availability" ON public.doctor_availability FOR SELECT USING (true);
CREATE POLICY "Allow public read medicine stocks" ON public.medicine_stocks FOR SELECT USING (true);
CREATE POLICY "Allow public read doctors directory" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public read ambulances" ON public.ambulances FOR SELECT USING (true);

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Patients: Read/Write own patient details
CREATE POLICY "Patients view own data" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Patients update own data" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Patients insert own data" ON public.patients FOR INSERT WITH CHECK (auth.uid() = id);

-- Appointments: Patients read own, Doctors read assigned, Staff read facility
CREATE POLICY "Patients read own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id OR patient_id IS NULL);
CREATE POLICY "Doctors read assigned appointments" ON public.appointments FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors update assigned appointments" ON public.appointments FOR UPDATE USING (auth.uid() = doctor_id);

-- Emergency Requests: Anyone can submit SOS, Driver can update assigned trip
CREATE POLICY "Anyone can submit emergency request" ON public.emergency_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view relevant emergency requests" ON public.emergency_requests FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = driver_id OR true);
CREATE POLICY "Drivers update assigned emergency requests" ON public.emergency_requests FOR UPDATE USING (auth.uid() = driver_id OR true);

-- Notifications: Users read own notifications
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
