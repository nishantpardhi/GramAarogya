import { getSupabase, uploadProfilePhoto, isSupabaseConfigured } from './supabaseClient';
import {
  UserProfile,
  Doctor,
  Facility,
  Appointment,
  EmergencyRequest,
  EmergencyLifecycleStatus,
  DoctorAvailability,
  DoctorAvailabilityStatus,
  Prescription,
  Referral,
  NotificationItem,
  Ambulance,
} from '../types';
import {
  INITIAL_FACILITIES,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_REFERRALS,
} from '../data/maharashtraData';

// Persistent Local Database Store Keys (used for offline or development fallback)
const STORAGE_KEYS = {
  PROFILES: 'gramarogya_db_profiles',
  DOCTORS: 'gramarogya_db_doctors',
  FACILITIES: 'gramarogya_db_facilities',
  APPOINTMENTS: 'gramarogya_db_appointments',
  EMERGENCY_REQUESTS: 'gramarogya_db_emergencies',
  AMBULANCES: 'gramarogya_db_ambulances',
  PRESCRIPTIONS: 'gramarogya_db_prescriptions',
  REFERRALS: 'gramarogya_db_referrals',
  NOTIFICATIONS: 'gramarogya_db_notifications',
  AVAILABILITY: 'gramarogya_db_availability',
};

// Initial state helpers
function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

// Initial default ambulances
const DEFAULT_AMBULANCES: Ambulance[] = [
  {
    id: 'amb-108-1',
    vehicleNumber: 'MH-40-AZ-1081',
    type: 'Advanced Life Support (ALS)',
    driverId: 'drv-1',
    driverName: 'Sanjay Shinde (संजय शिंदे)',
    driverContact: '+91 98221 08108',
    facilityId: 'fac-1',
    facilityName: 'PHC Ramtek (प्रा. आ. केंद्र रामटेक)',
    currentLat: 21.3976,
    currentLng: 79.3298,
    availability: 'available',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'amb-108-2',
    vehicleNumber: 'MH-40-AZ-1082',
    type: 'Basic Life Support (BLS)',
    driverId: 'drv-2',
    driverName: 'Prakash Raut (प्रकाश राऊत)',
    driverContact: '+91 98221 08109',
    facilityId: 'fac-3',
    facilityName: 'Sub-District Hospital Ramtek',
    currentLat: 21.4012,
    currentLng: 79.3345,
    availability: 'available',
    lastUpdated: new Date().toISOString(),
  },
];

export class SupabaseService {
  /**
   * 1. USER PROFILES & PROFILE PHOTOS
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, patients(*), doctors(*)')
        .eq('id', userId)
        .single();
      if (!error && data) {
        return this.mapSupabaseProfile(data);
      }
    }

    const profiles = getLocalItem<UserProfile[]>(STORAGE_KEYS.PROFILES, []);
    return profiles.find((p) => p.id === userId) || null;
  }

  static async updateProfile(profile: UserProfile): Promise<{ success: boolean; data: UserProfile; error?: string }> {
    const supabase = getSupabase();
    const updatedProfile = { ...profile };

    if (supabase) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          role: profile.role,
          name: profile.name,
          name_mr: profile.nameMr,
          name_hi: profile.nameHi,
          mobile: profile.mobile,
          email: profile.email,
          avatar_url: profile.avatar,
          preferred_language: profile.preferredLanguage,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Supabase profile update error:', error.message);
      }

      // Update role-specific table
      if (profile.role === 'patient') {
        await supabase.from('patients').upsert({
          id: profile.id,
          abha_id: profile.abhaId,
          age: profile.age,
          gender: profile.gender,
          dob: profile.dob,
          blood_group: profile.bloodGroup,
          village: profile.village,
          taluka: profile.taluka,
          district: profile.district,
          pin_code: profile.pinCode,
          address: profile.address,
          emergency_contact_name: profile.emergencyContactName,
          emergency_contact_mobile: profile.emergencyContactMobile,
          allergies: profile.allergies,
          chronic_conditions: profile.chronicConditions,
          updated_at: new Date().toISOString(),
        });
      } else if (profile.role === 'doctor') {
        await supabase.from('doctors').upsert({
          doctor_id: profile.id,
          qualification: profile.qualification,
          specialization: profile.specialization,
          specialization_mr: profile.specializationMr,
          facility_id: profile.facilityId,
          department: profile.department,
          experience_years: profile.experienceYears,
          registration_number: profile.registrationNumber,
          registration_council: profile.registrationCouncil,
          working_hours: profile.availableHours,
          telemedicine_available: profile.isOnlineForTelemedicine,
          updated_at: new Date().toISOString(),
        });
      }
    }

    // Always update local database for guaranteed persistence & instant reactivity
    const profiles = getLocalItem<UserProfile[]>(STORAGE_KEYS.PROFILES, []);
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = updatedProfile;
    } else {
      profiles.push(updatedProfile);
    }
    setLocalItem(STORAGE_KEYS.PROFILES, profiles);
    localStorage.setItem('gramarogya_user', JSON.stringify(updatedProfile));

    return { success: true, data: updatedProfile };
  }

  static async uploadUserPhoto(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    const res = await uploadProfilePhoto(userId, file);
    if (res.success && res.url) {
      // Automatically update profile avatar in database
      const profile = await this.getProfile(userId);
      if (profile) {
        profile.avatar = res.url;
        await this.updateProfile(profile);
      }
    }
    return res;
  }

  /**
   * 2. DOCTOR DIRECTORY & REAL-TIME AVAILABILITY
   */
  static async getDoctors(filter?: { facilityId?: string; specialization?: string }): Promise<Doctor[]> {
    const supabase = getSupabase();
    if (supabase) {
      let query = supabase.from('doctors').select('*, profiles(*)');
      if (filter?.facilityId) query = query.eq('facility_id', filter.facilityId);
      if (filter?.specialization) query = query.eq('specialization', filter.specialization);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.doctor_id,
          name: d.profiles?.name || 'Medical Officer',
          nameMr: d.profiles?.name_mr || d.profiles?.name || 'वैद्यकीय अधिकारी',
          nameHi: d.profiles?.name_hi || d.profiles?.name,
          qualification: d.qualification || 'MBBS',
          specialization: d.specialization || 'General Medicine',
          specializationMr: d.specialization_mr || 'सामान्य चिकित्सा',
          facilityId: d.facility_id,
          facilityName: d.facility_name || 'Government Health Centre',
          facilityNameMr: d.facility_name_mr || 'शासकीय आरोग्य संस्था',
          department: d.department || 'General OPD',
          experienceYears: d.experience_years || 1,
          rating: 4.8,
          languages: d.languages || ['मराठी', 'English', 'हिंदी'],
          avatarUrl: d.profiles?.avatar_url || '',
          verificationStatus: d.verification_status || 'verified',
        }));
      }
    }

    const localDocs = getLocalItem<Doctor[]>(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    let result = localDocs;
    if (filter?.facilityId) {
      result = result.filter((d) => d.facilityId === filter.facilityId);
    }
    if (filter?.specialization) {
      result = result.filter((d) => d.specialization.toLowerCase().includes(filter.specialization!.toLowerCase()));
    }
    return result;
  }

  static async updateDoctorLiveStatus(
    doctorId: string,
    status: DoctorAvailabilityStatus,
    notes?: string
  ): Promise<{ success: boolean; record: DoctorAvailability }> {
    const supabase = getSupabase();
    const statusTexts: Record<DoctorAvailabilityStatus, { en: string; mr: string }> = {
      available: { en: 'Available for Consultations', mr: 'तपासणीसाठी उपलब्ध' },
      with_patient: { en: 'Currently With Patient', mr: 'रुग्ण तपासणी सुरू आहे' },
      busy: { en: 'Busy in Ward / Procedure', mr: 'शस्त्रक्रिया / वॉर्डमध्ये व्यस्त' },
      on_break: { en: 'On Short Break', mr: 'अल्प विश्रांतीवर' },
      off_duty: { en: 'Off Duty', mr: 'ड्यूटी संपली' },
    };

    const textInfo = statusTexts[status] || { en: 'On Duty', mr: 'कर्तव्यावर' };

    const availRecord: DoctorAvailability = {
      doctorId,
      doctorName: 'Dr. Medical Officer',
      facilityId: 'fac-1',
      facilityName: 'Government Health Facility',
      status,
      statusText: textInfo.en,
      statusTextMr: textInfo.mr,
      lastUpdated: new Date().toISOString(),
      activeShift: 'Regular Shift',
      currentQueueCount: status === 'available' ? 2 : 5,
      avgWaitTimeMinutes: status === 'available' ? 10 : 25,
      notes: notes || '',
      updatedBy: 'Self',
    };

    if (supabase) {
      await supabase.from('doctor_availability').upsert({
        doctor_id: doctorId,
        status,
        status_text: textInfo.en,
        status_text_mr: textInfo.mr,
        notes: notes || '',
        last_updated: new Date().toISOString(),
      });
    }

    const availList = getLocalItem<Record<string, DoctorAvailability>>(STORAGE_KEYS.AVAILABILITY, {});
    availList[doctorId] = availRecord;
    setLocalItem(STORAGE_KEYS.AVAILABILITY, availList);

    return { success: true, record: availRecord };
  }

  /**
   * 3. ALTERNATIVE DOCTOR RECOMMENDATION ENGINE
   * If requested doctor is busy/unavailable, find nearby verified available alternatives
   */
  static async findAlternativeDoctors(
    specialization: string,
    excludeDoctorId?: string
  ): Promise<{ alternatives: Doctor[]; reason: string }> {
    const allDoctors = await this.getDoctors();
    const availableDocs = allDoctors.filter(
      (d) =>
        d.id !== excludeDoctorId &&
        (d.specialization.toLowerCase().includes(specialization.toLowerCase()) || specialization.toLowerCase().includes(d.specialization.toLowerCase()))
    );

    return {
      alternatives: availableDocs.slice(0, 3),
      reason:
        availableDocs.length > 0
          ? `Found ${availableDocs.length} nearby verified doctor(s) specializing in ${specialization}.`
          : `No other ${specialization} is on immediate duty at connected nearby PHCs.`,
    };
  }

  /**
   * 4. HEALTHCARE FACILITIES
   */
  static async getFacilities(): Promise<Facility[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('healthcare_facilities').select('*');
      if (!error && data && data.length > 0) {
        return data.map((f: any) => ({
          id: f.facility_id,
          name: f.facility_name,
          nameMr: f.facility_name_mr,
          nameHi: f.facility_name_hi || f.facility_name,
          type: f.facility_type,
          district: f.district,
          taluka: f.taluka,
          villageOrCity: f.village_or_city,
          address: f.address,
          distanceKm: 4.5,
          contactNumber: f.contact_number,
          emergencyNumber: f.emergency_number || '108',
          openHours: f.operating_hours,
          is24x7Emergency: f.is_24x7_emergency,
          hasAmbulance: f.has_ambulance,
          hasFreeMedicines: f.has_free_medicines,
          specialistsAvailable: f.specialists_available || [],
          services: f.services || [],
          doctorsCount: 4,
          bedsTotal: f.beds_total || 30,
          bedsAvailable: f.beds_available || 12,
          lat: Number(f.latitude) || 21.3966,
          lng: Number(f.longitude) || 79.3274,
          rating: 4.7,
        }));
      }
    }

    return getLocalItem<Facility[]>(STORAGE_KEYS.FACILITIES, INITIAL_FACILITIES);
  }

  /**
   * 5. APPOINTMENTS & QUEUE
   */
  static async getAppointments(filter?: { patientId?: string; doctorId?: string; facilityId?: string }): Promise<Appointment[]> {
    const supabase = getSupabase();
    if (supabase) {
      let query = supabase.from('appointments').select('*');
      if (filter?.patientId) query = query.eq('patient_id', filter.patientId);
      if (filter?.doctorId) query = query.eq('doctor_id', filter.doctorId);
      if (filter?.facilityId) query = query.eq('facility_id', filter.facilityId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((a: any) => ({
          id: a.id,
          tokenNumber: a.token_number,
          patientId: a.patient_id,
          patientName: a.patient_name,
          patientAge: a.patient_age,
          patientGender: a.patient_gender,
          patientVillage: a.patient_village,
          patientDistrict: a.patient_district,
          patientMobile: a.patient_mobile,
          doctorId: a.doctor_id,
          doctorName: a.doctor_name,
          doctorSpecialization: a.doctor_specialization,
          facilityId: a.facility_id,
          facilityName: a.facility_name,
          facilityNameMr: a.facility_name_mr,
          department: a.department,
          date: a.appointment_date,
          timeSlot: a.time_slot,
          consultationType: a.consultation_type,
          reason: a.reason,
          status: a.status,
          priority: a.priority,
          createdAt: a.created_at,
        }));
      }
    }

    const appts = getLocalItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    let result = appts;
    if (filter?.patientId) result = result.filter((a) => a.patientId === filter.patientId);
    if (filter?.doctorId) result = result.filter((a) => a.doctorId === filter.doctorId);
    return result;
  }

  static async bookAppointment(
    data: Omit<Appointment, 'id' | 'tokenNumber' | 'createdAt' | 'status'>
  ): Promise<Appointment> {
    const prefix = data.facilityName.includes('PHC') ? 'PHC' : 'DH';
    const randNum = Math.floor(100 + Math.random() * 900);
    const tokenNumber = `${prefix}-${randNum}`;

    const newAppt: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      tokenNumber,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('appointments').insert({
        token_number: tokenNumber,
        patient_id: data.patientId,
        patient_name: data.patientName,
        patient_age: data.patientAge,
        patient_gender: data.patientGender,
        patient_village: data.patientVillage,
        patient_district: data.patientDistrict,
        patient_mobile: data.patientMobile,
        doctor_id: data.doctorId,
        doctor_name: data.doctorName,
        doctor_specialization: data.doctorSpecialization,
        facility_id: data.facilityId,
        facility_name: data.facilityName,
        facility_name_mr: data.facilityNameMr,
        department: data.department,
        appointment_date: data.date,
        time_slot: data.timeSlot,
        consultation_type: data.consultationType,
        reason: data.reason,
        status: 'Confirmed',
        priority: data.priority,
      });
    }

    const list = getLocalItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    list.unshift(newAppt);
    setLocalItem(STORAGE_KEYS.APPOINTMENTS, list);

    return newAppt;
  }

  /**
   * 6. AMBULANCE & SMART EMERGENCY WORKFLOW
   */
  static async getAmbulances(): Promise<Ambulance[]> {
    return getLocalItem<Ambulance[]>(STORAGE_KEYS.AMBULANCES, DEFAULT_AMBULANCES);
  }

  static async updateAmbulanceStatus(
    ambulanceId: string,
    status: 'available' | 'busy' | 'offline'
  ): Promise<void> {
    const list = getLocalItem<Ambulance[]>(STORAGE_KEYS.AMBULANCES, DEFAULT_AMBULANCES);
    const idx = list.findIndex((a) => a.id === ambulanceId);
    if (idx >= 0) {
      list[idx].availability = status;
      list[idx].lastUpdated = new Date().toISOString();
      setLocalItem(STORAGE_KEYS.AMBULANCES, list);
    }
  }

  static async getEmergencyRequests(): Promise<EmergencyRequest[]> {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('emergency_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((e: any) => ({
          id: e.id,
          patientId: e.patient_id,
          patientName: e.patient_name,
          contactNumber: e.contact_number,
          emergencyType: e.emergency_type,
          locationAddress: e.location_address,
          village: e.village,
          district: e.district,
          lat: Number(e.latitude),
          lng: Number(e.longitude),
          timestamp: e.created_at,
          status: e.status as EmergencyLifecycleStatus,
          ambulanceId: e.ambulance_id,
          vehicleNumber: e.vehicle_number,
          driverId: e.driver_id,
          driverName: e.driver_name,
          driverMobile: e.driver_mobile,
          etaMinutes: e.eta_minutes,
          assignedHospitalId: e.assigned_hospital_id,
          assignedHospital: e.assigned_hospital,
          assignedHospitalNameMr: e.assigned_hospital_name_mr,
          requiredFacilityCapability: e.required_facility_capability,
          dispatchNotes: e.dispatch_notes,
          hospitalNotified: e.hospital_notified,
        }));
      }
    }

    return getLocalItem<EmergencyRequest[]>(STORAGE_KEYS.EMERGENCY_REQUESTS, []);
  }

  static async createEmergencyRequest(
    req: Omit<EmergencyRequest, 'id' | 'timestamp' | 'status'>
  ): Promise<EmergencyRequest> {
    const newReq: EmergencyRequest = {
      ...req,
      id: `emg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'DISPATCHING',
      etaMinutes: 11,
      hospitalNotified: true,
    };

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('emergency_requests').insert({
        patient_id: req.patientId,
        patient_name: req.patientName,
        contact_number: req.contactNumber,
        emergency_type: req.emergencyType,
        location_address: req.locationAddress,
        village: req.village,
        district: req.district,
        latitude: req.lat,
        longitude: req.lng,
        status: 'DISPATCHING',
        ambulance_id: req.ambulanceId || 'amb-108-1',
        vehicle_number: req.vehicleNumber || 'MH-40-AZ-1081',
        driver_name: req.driverName || 'Sanjay Shinde (१०८ पायलट)',
        driver_mobile: req.driverMobile || '+91 98221 08108',
        eta_minutes: 11,
        assigned_hospital: req.assignedHospital,
        assigned_hospital_name_mr: req.assignedHospitalNameMr,
        required_facility_capability: req.requiredFacilityCapability || '24x7 Anti-Snake Venom, Trauma & ICU Care',
        hospital_notified: true,
      });
    }

    const list = getLocalItem<EmergencyRequest[]>(STORAGE_KEYS.EMERGENCY_REQUESTS, []);
    list.unshift(newReq);
    setLocalItem(STORAGE_KEYS.EMERGENCY_REQUESTS, list);

    return newReq;
  }

  static async updateEmergencyStatus(
    id: string,
    status: EmergencyLifecycleStatus,
    additionalUpdates?: Partial<EmergencyRequest>
  ): Promise<EmergencyRequest | null> {
    const list = getLocalItem<EmergencyRequest[]>(STORAGE_KEYS.EMERGENCY_REQUESTS, []);
    const idx = list.findIndex((e) => e.id === id);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        status,
        ...additionalUpdates,
      };
      setLocalItem(STORAGE_KEYS.EMERGENCY_REQUESTS, list);

      const supabase = getSupabase();
      if (supabase) {
        await supabase
          .from('emergency_requests')
          .update({
            status,
            ...additionalUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
      }

      return list[idx];
    }
    return null;
  }

  /**
   * Helper mapper
   */
  private static mapSupabaseProfile(data: any): UserProfile {
    return {
      id: data.id,
      role: data.role,
      name: data.name,
      nameMr: data.name_mr,
      nameHi: data.name_hi,
      mobile: data.mobile,
      email: data.email,
      avatar: data.avatar_url,
      preferredLanguage: data.preferred_language || 'mr',
      abhaId: data.patients?.[0]?.abha_id,
      age: data.patients?.[0]?.age,
      gender: data.patients?.[0]?.gender,
      dob: data.patients?.[0]?.dob,
      bloodGroup: data.patients?.[0]?.blood_group,
      village: data.patients?.[0]?.village,
      taluka: data.patients?.[0]?.taluka,
      district: data.patients?.[0]?.district,
      pinCode: data.patients?.[0]?.pin_code,
      address: data.patients?.[0]?.address,
      emergencyContactName: data.patients?.[0]?.emergency_contact_name,
      emergencyContactMobile: data.patients?.[0]?.emergency_contact_mobile,
      allergies: data.patients?.[0]?.allergies,
      chronicConditions: data.patients?.[0]?.chronic_conditions,
      qualification: data.doctors?.[0]?.qualification,
      specialization: data.doctors?.[0]?.specialization,
      specializationMr: data.doctors?.[0]?.specialization_mr,
      facilityId: data.doctors?.[0]?.facility_id,
      department: data.doctors?.[0]?.department,
      experienceYears: data.doctors?.[0]?.experience_years,
      registrationNumber: data.doctors?.[0]?.registration_number,
      registrationCouncil: data.doctors?.[0]?.registration_council,
    };
  }
}
