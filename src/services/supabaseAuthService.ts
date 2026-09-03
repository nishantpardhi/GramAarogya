import { getSupabase } from './supabaseClient';
import { UserProfile, UserRole } from '../types';

export interface AuthResult {
  success: boolean;
  message?: string;
  error?: string;
  user?: any;
  profile?: UserProfile | null;
}

export type PrimaryRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export class SupabaseAuthService {
  /**
   * 1. PATIENT AUTH: Send Phone OTP
   * Uses Supabase Phone Authentication
   */
  static async sendPatientPhoneOtp(phone: string): Promise<{ success: boolean; message: string; error?: string }> {
    const supabase = getSupabase();
    
    // Normalize phone number to E.164 format (+91 for India if not provided)
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = `+91${formattedPhone}`;
      } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = `+${formattedPhone}`;
      }
    }

    if (!supabase) {
      // In offline/unconfigured environment, explain clearly
      return {
        success: false,
        error: 'Supabase client is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
        message: 'Supabase configuration missing',
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms',
        },
      });

      if (error) {
        console.error('Supabase Phone OTP Error:', error);
        return {
          success: false,
          error: error.message,
          message: error.message || 'Failed to send OTP to mobile number.',
        };
      }

      return {
        success: true,
        message: `OTP sent successfully to ${formattedPhone}. Please check your SMS.`,
      };
    } catch (err: any) {
      console.error('Phone OTP exception:', err);
      return {
        success: false,
        error: err.message,
        message: 'Could not send SMS OTP. Please try again.',
      };
    }
  }

  /**
   * 2. PATIENT AUTH: Verify Phone OTP
   */
  static async verifyPatientPhoneOtp(
    phone: string,
    token: string,
    fullName?: string
  ): Promise<AuthResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client is not configured.',
      };
    }

    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = `+91${formattedPhone}`;
      } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
        formattedPhone = `+${formattedPhone}`;
      }
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token.trim(),
        type: 'sms',
      });

      if (error || !data.user) {
        return {
          success: false,
          error: error?.message || 'OTP verification failed. Please check the code and try again.',
        };
      }

      // Ensure profile and patient record exist in database
      const profile = await this.syncOrCreatePatientProfile(data.user.id, formattedPhone, fullName);

      return {
        success: true,
        user: data.user,
        profile,
        message: 'Phone verified successfully.',
      };
    } catch (err: any) {
      console.error('Verify OTP exception:', err);
      return {
        success: false,
        error: err.message || 'OTP verification failed.',
      };
    }
  }

  /**
   * 3. DOCTOR & STAFF AUTH: Email + Password Sign In
   */
  static async signInWithEmailPassword(
    email: string,
    password: string,
    expectedRole?: PrimaryRole
  ): Promise<AuthResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        success: false,
        error: 'Supabase client is not configured.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        return {
          success: false,
          error: 'Invalid email or password.',
        };
      }

      // Fetch user profile and verify authorized role from database
      const profile = await this.getUserProfileFromDatabase(data.user.id);

      if (!profile) {
        // Sign out immediately if no profile exists
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Your account has not been assigned a healthcare profile in the database.',
        };
      }

      // Enforce Primary Role Verification
      if (expectedRole) {
        const userDbRole = (profile.role || '').toUpperCase();
        if (userDbRole !== expectedRole.toUpperCase()) {
          // If the authenticated user is not authorized for this specific portal, deny access
          await supabase.auth.signOut();
          return {
            success: false,
            error: `Access denied. Your account is registered as ${userDbRole}, not ${expectedRole}.`,
          };
        }
      }

      return {
        success: true,
        user: data.user,
        profile,
        message: 'Signed in successfully.',
      };
    } catch (err: any) {
      console.error('Sign in exception:', err);
      return {
        success: false,
        error: 'An unexpected error occurred during login. Please try again.',
      };
    }
  }

  /**
   * 4. DOCTOR REGISTRATION (With pending approval / verification in Supabase)
   */
  static async registerDoctorAccount(params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    specialization: string;
    qualification: string;
    facilityId: string;
    department?: string;
  }): Promise<AuthResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      // 1. Create Supabase Auth User
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim().toLowerCase(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            role: 'DOCTOR',
            phone: params.phone,
          },
        },
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Failed to create doctor account.' };
      }

      const userId = data.user.id;

      // 2. Insert into public.profiles
      await supabase.from('profiles').upsert({
        id: userId,
        role: 'DOCTOR',
        full_name: params.fullName,
        email: params.email.toLowerCase(),
        phone: params.phone,
        updated_at: new Date().toISOString(),
      });

      // 3. Insert into public.doctors
      await supabase.from('doctors').upsert({
        user_id: userId,
        full_name: params.fullName,
        specialization: params.specialization,
        qualification: params.qualification,
        facility_id: params.facilityId,
        department: params.department || 'General Medicine',
        availability_status: 'available',
        updated_at: new Date().toISOString(),
      });

      const profile = await this.getUserProfileFromDatabase(userId);

      return {
        success: true,
        user: data.user,
        profile,
        message: 'Doctor account created successfully.',
      };
    } catch (err: any) {
      console.error('Doctor signup exception:', err);
      return { success: false, error: err.message || 'Registration failed.' };
    }
  }

  /**
   * 5. HEALTHCARE STAFF REGISTRATION (With authorized sub-role)
   */
  static async registerStaffAccount(params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    staffType: 'NURSE' | 'PHARMACIST' | 'AMBULANCE_DRIVER' | 'COMPOUNDER' | 'OTHER';
    facilityId: string;
    vehicleNumber?: string;
  }): Promise<AuthResult> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim().toLowerCase(),
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            role: 'HEALTHCARE_STAFF',
            staff_type: params.staffType,
            phone: params.phone,
          },
        },
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Failed to create staff account.' };
      }

      const userId = data.user.id;

      // 1. Insert into public.profiles
      await supabase.from('profiles').upsert({
        id: userId,
        role: 'HEALTHCARE_STAFF',
        full_name: params.fullName,
        email: params.email.toLowerCase(),
        phone: params.phone,
        updated_at: new Date().toISOString(),
      });

      // 2. Insert into public.healthcare_staff
      await supabase.from('healthcare_staff').upsert({
        user_id: userId,
        full_name: params.fullName,
        staff_type: params.staffType,
        facility_id: params.facilityId,
        vehicle_number: params.vehicleNumber,
        availability_status: 'available',
        updated_at: new Date().toISOString(),
      });

      const profile = await this.getUserProfileFromDatabase(userId);

      return {
        success: true,
        user: data.user,
        profile,
        message: 'Staff account created successfully.',
      };
    } catch (err: any) {
      console.error('Staff signup exception:', err);
      return { success: false, error: err.message || 'Staff registration failed.' };
    }
  }

  /**
   * 6. Forgot Password / Password Reset
   */
  static async sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabase();
    if (!supabase) {
      return { success: false, message: 'Supabase is not configured.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      if (error) {
        return { success: false, message: error.message };
      }
      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.',
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send password reset.' };
    }
  }

  /**
   * 7. Sign Out
   */
  static async signOut(): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error during Supabase sign out:', err);
      }
    }
  }

  /**
   * 8. Fetch User Profile from Database Source of Truth
   * Joins profiles + role specific tables
   */
  static async getUserProfileFromDatabase(userId: string): Promise<UserProfile | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      // 1. Query base profiles table
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr || !profileRow) {
        console.warn('No profile found in public.profiles for user ID:', userId);
        return null;
      }

      const roleStr = (profileRow.role || 'PATIENT').toUpperCase();
      let normalizedRole: UserRole = 'patient';
      if (roleStr === 'DOCTOR') normalizedRole = 'doctor';
      else if (roleStr === 'ADMIN') normalizedRole = 'admin';

      const baseProfile: UserProfile = {
        id: profileRow.id,
        role: normalizedRole,
        name: profileRow.full_name || profileRow.name || 'User',
        nameMr: profileRow.name_mr,
        nameHi: profileRow.name_hi,
        mobile: profileRow.phone || profileRow.mobile || '',
        email: profileRow.email,
        preferredLanguage: (profileRow.preferred_language as any) || 'mr',
        avatar: profileRow.profile_photo_url || profileRow.avatar_url,
      };

      // 2. Role-specific query
      if (roleStr === 'PATIENT') {
        const { data: patientRow } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (patientRow) {
          baseProfile.abhaId = patientRow.abha_id;
          baseProfile.age = patientRow.age;
          baseProfile.gender = patientRow.gender;
          baseProfile.dob = patientRow.dob;
          baseProfile.bloodGroup = patientRow.blood_group;
          baseProfile.village = patientRow.village;
          baseProfile.taluka = patientRow.taluka;
          baseProfile.district = patientRow.district;
          baseProfile.pinCode = patientRow.pin_code;
          baseProfile.address = patientRow.address;
          baseProfile.emergencyContactName = patientRow.emergency_contact_name;
          baseProfile.emergencyContactMobile = patientRow.emergency_contact_mobile || patientRow.emergency_contact;
          baseProfile.allergies = patientRow.allergies;
          baseProfile.chronicConditions = patientRow.chronic_conditions;
          if (patientRow.profile_photo_url) {
            baseProfile.avatar = patientRow.profile_photo_url;
          }
        }
      } else if (roleStr === 'DOCTOR') {
        const { data: docRow } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (docRow) {
          baseProfile.qualification = docRow.qualification;
          baseProfile.specialization = docRow.specialization;
          baseProfile.facilityId = docRow.facility_id;
          baseProfile.facilityName = docRow.facility_name;
          baseProfile.department = docRow.department;
          baseProfile.availableHours = docRow.working_hours;
          baseProfile.experienceYears = docRow.experience_years;
          baseProfile.registrationNumber = docRow.registration_number;
          if (docRow.profile_photo_url) {
            baseProfile.avatar = docRow.profile_photo_url;
          }
        }
      }

      return baseProfile;
    } catch (err) {
      console.error('Error fetching user profile from database:', err);
      return null;
    }
  }

  /**
   * 9. Sync or Create Patient Profile after Phone OTP
   */
  private static async syncOrCreatePatientProfile(
    userId: string,
    phone: string,
    fullName?: string
  ): Promise<UserProfile> {
    const supabase = getSupabase();
    const defaultName = fullName || 'Citizen Patient';

    if (supabase) {
      try {
        // Ensure profile exists
        await supabase.from('profiles').upsert({
          id: userId,
          role: 'PATIENT',
          full_name: defaultName,
          phone: phone,
          updated_at: new Date().toISOString(),
        });

        // Ensure patient entry exists
        await supabase.from('patients').upsert({
          user_id: userId,
          full_name: defaultName,
          phone: phone,
          district: 'Nagpur',
          updated_at: new Date().toISOString(),
        });

        const fetched = await this.getUserProfileFromDatabase(userId);
        if (fetched) return fetched;
      } catch (err) {
        console.warn('Error synchronizing patient profile to Supabase tables:', err);
      }
    }

    return {
      id: userId,
      role: 'patient',
      name: defaultName,
      mobile: phone,
      preferredLanguage: 'mr',
      district: 'Nagpur',
    };
  }

  /**
   * 10. Update Profile Photo & Save URL to Database
   */
  static async updateProfilePhoto(
    userId: string,
    role: UserRole,
    photoUrl: string
  ): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      // 1. Update profiles table
      await supabase
        .from('profiles')
        .update({
          profile_photo_url: photoUrl,
          avatar_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // 2. Update role-specific table
      if (role === 'patient') {
        await supabase
          .from('patients')
          .update({ profile_photo_url: photoUrl, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      } else if (role === 'doctor') {
        await supabase
          .from('doctors')
          .update({ profile_photo_url: photoUrl, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      }

      return true;
    } catch (err) {
      console.error('Failed to update profile photo in database:', err);
      return false;
    }
  }
}
