import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Language,
  UserProfile,
  UserRole,
  Facility,
  Doctor,
  DoctorAvailability,
  DoctorAvailabilityStatus,
  Appointment,
  AppointmentStatus,
  Prescription,
  Referral,
  HealthRecord,
  MedicineStock,
  HealthCamp,
  GovernmentScheme,
  EmergencyRequest,
  EmergencyLifecycleStatus,
  Ambulance,
  NotificationItem,
  ChatMessage,
  AuditLogEntry,
} from '../types';
import {
  INITIAL_FACILITIES,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_REFERRALS,
  INITIAL_HEALTH_RECORDS,
  INITIAL_MEDICINE_STOCKS,
  INITIAL_HEALTH_CAMPS,
  INITIAL_SCHEMES,
} from '../data/maharashtraData';
import { translations } from '../data/translations';
import { apiClient } from '../services/apiClient';
import { SupabaseService } from '../services/supabaseService';
import { SupabaseAuthService } from '../services/supabaseAuthService';
import { authService } from '../services/authService';
import { getSupabase } from '../services/supabaseClient';
import {
  formatDate as formatLocaleDate,
  formatTime as formatLocaleTime,
  formatDateTime as formatLocaleDateTime,
  formatNumber as formatLocaleNumber,
  formatDistance as formatLocaleDistance,
  formatRelativeTime as formatLocaleRelativeTime,
  formatFacilityType as formatLocaleFacilityType,
  formatDoctorStatus as formatLocaleDoctorStatus,
  formatAppointmentStatus as formatLocaleAppointmentStatus,
  formatStockStatus as formatLocaleStockStatus,
  formatDoctorName as formatLocaleDoctorName,
  formatUserRole as formatLocaleUserRole,
  formatCurrency as formatLocaleCurrency,
} from '../utils/formatters';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  screenReaderVoice: boolean;
}

export interface AppContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number | undefined>) => string;
  formatDate: (date: string | number | Date | undefined, formatStyle?: 'short' | 'medium' | 'long' | 'full') => string;
  formatTime: (timeInput: string | Date | undefined) => string;
  formatDateTime: (dateInput: string | number | Date | undefined) => string;
  formatNumber: (num: number | string, useDevanagariDigits?: boolean) => string;
  formatDistance: (km: number | string) => string;
  formatRelativeTime: (dateInput: string | number | Date | undefined) => string;
  formatFacilityType: (type: string) => string;
  formatDoctorStatus: (status: string) => { label: string; color: string };
  formatAppointmentStatus: (status: string) => { label: string; color: string };
  formatStockStatus: (status: string) => { label: string; color: string };
  formatDoctorName: (name: string) => string;
  formatUserRole: (role: string) => string;
  formatCurrency: (amount: number | string) => string;
  lowDataMode: boolean;
  setLowDataMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  accessibility: AccessibilitySettings;
  updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  
  // Navigation
  currentPage: string;
  setCurrentPage: (page: string, params?: Record<string, any>) => void;
  pageParams: Record<string, any>;
  
  // Real Data Collections
  facilities: Facility[];
  doctors: Doctor[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  referrals: Referral[];
  healthRecords: HealthRecord[];
  medicineStocks: MedicineStock[];
  healthCamps: HealthCamp[];
  schemes: GovernmentScheme[];
  emergencyRequests: EmergencyRequest[];
  ambulances: Ambulance[];
  notifications: NotificationItem[];
  chatMessages: ChatMessage[];
  auditLogs: AuditLogEntry[];
  
  // Loading & Data Source Status
  isLoadingData: boolean;
  isAuthLoading: boolean;
  refreshData: () => Promise<void>;

  // Modals
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isSqlSchemaModalOpen: boolean;
  setIsSqlSchemaModalOpen: (open: boolean) => void;

  // User Actions
  loginAsDemoPatient: () => void;
  loginAsDemoDoctor: () => void;
  loginAsDemoAdmin: () => void;
  loginUser: (role: 'patient' | 'doctor' | 'admin', identifier: string, profile?: Partial<UserProfile>) => boolean;
  registerPatient: (profileData: Partial<UserProfile>) => void;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  logout: () => void;
  
  // Core Operational Operations
  bookAppointment: (data: Omit<Appointment, 'id' | 'tokenNumber' | 'createdAt' | 'status'>) => Promise<Appointment>;
  updateAppointmentStatus: (
    id: string,
    status: AppointmentStatus,
    doctorNotes?: string,
    extra?: { newDate?: string; newTimeSlot?: string; telemedicineRoomId?: string; consultationType?: string }
  ) => Promise<void>;
  suggestTelemedicine: (appointmentId: string, doctorNotes?: string) => Promise<{ success: boolean; data?: Appointment; message?: string }>;
  acceptTelemedicine: (appointmentId: string) => Promise<{ success: boolean; data?: Appointment; message?: string }>;
  createPrescription: (prescriptionData: Omit<Prescription, 'id'>) => Prescription;
  createReferral: (referralData: Omit<Referral, 'id'>) => Referral;
  submitEmergencyRequest: (req: Omit<EmergencyRequest, 'id' | 'timestamp' | 'status'>) => Promise<EmergencyRequest>;
  updateEmergencyStatus: (id: string, status: EmergencyLifecycleStatus, updates?: Partial<EmergencyRequest>) => Promise<void>;
  updateAmbulanceStatus: (id: string, status: 'available' | 'busy' | 'offline') => Promise<void>;
  registerForCamp: (campId: string, citizenDetails: { name: string; mobile: string; village: string; age: number }) => Promise<boolean>;
  uploadHealthRecord: (record: Omit<HealthRecord, 'id'>) => void;
  sendChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  
  // Doctor & Facility Management
  registerDoctorSelf: (doctorData: Partial<Doctor>) => Promise<{ success: boolean; message?: string }>;
  verifyDoctorCredentials: (doctorId: string, action: 'approve' | 'reject') => Promise<{ success: boolean; message?: string }>;
  updateDoctorLiveAvailability: (
    doctorId: string,
    status: DoctorAvailabilityStatus,
    notes?: string,
    extra?: { activeShift?: string; opdTimings?: string; consultationType?: 'In-Person (OPD)' | 'Telemedicine (Video)' | 'Both In-Person & Telemedicine' }
  ) => Promise<void>;
  getDoctorLiveAvailability: (doctorId: string) => Promise<DoctorAvailability | null>;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('gramarogya_lang');
    return (saved as Language) || 'mr';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // CRITICAL SECURITY RULE:
    // DATABASE USER EXISTS ≠ USER IS CURRENTLY LOGGED IN.
    // Never auto-select or restore a user unless a VALID active authentication token/session exists.
    try {
      const authSession = sessionStorage.getItem('gramarogya_auth_session');
      const authToken = localStorage.getItem('gramarogya_auth_token') || localStorage.getItem('gramarogya_jwt_auth_token');
      const savedUser = localStorage.getItem('gramarogya_user');

      if (authSession && authToken && savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {
      return null;
    }
    return null;
  });

  const [lowDataMode, setLowDataModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('gramarogya_lowdata');
    return saved === 'true';
  });

  const [setIsDemoModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('gramarogya_demomode');
    return saved !== null ? saved === 'true' : false; // Default to verified real data mode
  });

  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('gramarogya_a11y');
    return saved ? JSON.parse(saved) : { fontSize: 'normal', highContrast: false, screenReaderVoice: false };
  });

  const [currentPage, setCurrentPageState] = useState<string>(() => {
    try {
      const authSession = sessionStorage.getItem('gramarogya_auth_session');
      const authToken = localStorage.getItem('gramarogya_auth_token') || localStorage.getItem('gramarogya_jwt_auth_token');
      const savedUser = localStorage.getItem('gramarogya_user');
      if (!authSession || !authToken || !savedUser) return 'login';

      const parsed = JSON.parse(savedUser);
      if (parsed.role === 'doctor') return 'doctor-dashboard';
      if (parsed.role === 'admin') return 'admin-dashboard';
      if (parsed.role === 'patient') return 'patient-dashboard';
    } catch {
      return 'login';
    }
    return 'login';
  });
  const [pageParams, setPageParams] = useState<Record<string, any>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSqlSchemaModalOpen, setIsSqlSchemaModalOpen] = useState(false);

  // Real Data Collections
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [referrals, setReferrals] = useState<Referral[]>(INITIAL_REFERRALS);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(INITIAL_HEALTH_RECORDS);
  const [medicineStocks, setMedicineStocks] = useState<MedicineStock[]>(INITIAL_MEDICINE_STOCKS);
  const [healthCamps, setHealthCamps] = useState<HealthCamp[]>(INITIAL_HEALTH_CAMPS);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>(INITIAL_SCHEMES);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'pat-1',
      title: 'Appointment Confirmed',
      titleMr: 'भेटीची वेळ निश्चित झाली',
      message: 'Your telemedicine appointment with Dr. Rameshwar Deshmukh is confirmed.',
      messageMr: 'डॉ. रामेश्वर देशमुख यांच्यासोबत तुमची टेलिमेडिसिन भेट निश्चित झाली आहे.',
      type: 'appointment',
      timestamp: '10 mins ago',
      isRead: false,
    },
    {
      id: 'notif-2',
      userId: 'pat-1',
      title: 'Free Health Camp in Mansar',
      titleMr: 'मानसर येथे मोफत आरोग्य शिबिर',
      message: 'Specialist doctors visiting Mansar Gram Panchayat on Aug 30th for free checks.',
      messageMr: '३० ऑगस्ट रोजी मानसर येथे तज्ज्ञ डॉक्टरांचे मोफत सर्वोपचार शिबिर आयोजित करण्यात आले आहे.',
      type: 'camp',
      timestamp: '2 hours ago',
      isRead: false,
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderId: 'doc-1',
      senderName: 'Dr. Rameshwar Deshmukh',
      senderRole: 'doctor',
      recipientId: 'pat-1',
      message: 'नमस्कार, नियमित औषधोपचार वेळेवर सुरू ठेवा. काही अडचण असल्यास ओपीडीमध्ये भेटा.',
      timestamp: 'Yesterday 4:30 PM',
    },
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Central Async Data Fetching from Server & Supabase
  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // Sync facilities
      const facRes = await apiClient.getFacilities();
      if (facRes.success && facRes.data && facRes.data.length > 0) {
        setFacilities(facRes.data);
        }

      // Sync doctors (including pending for admin/moderation checks)
      const docRes = await apiClient.getDoctors({ includePending: true });
      if (docRes.success && docRes.data && docRes.data.length > 0) {
        setDoctors(docRes.data);
      }

      // Sync appointments
      const aptRes = await apiClient.getAppointments();
      if (aptRes.success && aptRes.data) {
        setAppointments(aptRes.data);
      }

      // Sync schemes
      const schRes = await apiClient.getHealthSchemes();
      if (schRes.success && schRes.data && schRes.data.length > 0) {
        setSchemes(schRes.data);
      }

      // Sync medicines
      const medRes = await apiClient.getMedicines();
      if (medRes.success && medRes.data && medRes.data.length > 0) {
        setMedicineStocks(medRes.data);
      }

      // Sync camps
      const campRes = await apiClient.getHealthCamps();
      if (campRes.success && campRes.data && campRes.data.length > 0) {
        setHealthCamps(campRes.data);
      }

      // Sync audit logs
      const logRes = await apiClient.getAuditLogs();
      if (logRes.success && logRes.data) {
        setAuditLogs(logRes.data);
      }

      // Sync ambulances & emergencies from Supabase Service
      const emgList = await SupabaseService.getEmergencyRequests();
      setEmergencyRequests(emgList);

      const ambList = await SupabaseService.getAmbulances();
      setAmbulances(ambList);

      } catch (err) {
      console.warn('Backend data sync fallback to cached store:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Load data and restore Supabase Auth Session on mount
  useEffect(() => {
    refreshData();

    const supabase = getSupabase();
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    const initAuthSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession error:', error.message);
        }
        if (session?.user) {
          const dbProfile = await SupabaseAuthService.getUserProfileFromDatabase(session.user.id);
          if (dbProfile) {
            setCurrentUser(dbProfile);
          }
        }
      } catch (err) {
        console.warn('Session restoration exception:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuthSession();

    // Listen to real-time auth changes (Sign in, sign out, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const dbProfile = await SupabaseAuthService.getUserProfileFromDatabase(session.user.id);
        if (dbProfile) {
          setCurrentUser(dbProfile);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('gramarogya_user');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [refreshData]);

  // Real-time WebSocket connection for bidirectional communication
  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 5000,
      });

      if (currentUser) {
        if (currentUser.role === 'doctor') {
          socket.emit('join_doctor_channel', currentUser.id);
        } else if (currentUser.role === 'patient') {
          socket.emit('join_patient_channel', currentUser.id);
        }
        socket.emit('join_room', `user_${currentUser.id}`);
      }

      socket.on('appointment_updated', (updatedApt: Appointment) => {
        setAppointments((prev) => {
          const idx = prev.findIndex((a) => a.id === updatedApt.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...updatedApt };
            return next;
          }
          return [updatedApt, ...prev];
        });
      });

      socket.on('appointment_status_changed', (updatedApt: Appointment) => {
        setAppointments((prev) => {
          const idx = prev.findIndex((a) => a.id === updatedApt.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...updatedApt };
            return next;
          }
          return [updatedApt, ...prev];
        });
      });

      socket.on('new_notification', (notif: any) => {
        const notifItem: NotificationItem = {
          id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          userId: currentUser?.id || 'user',
          title: notif.title || 'नवीन सूचना',
          titleMr: notif.title || 'नवीन सूचना',
          message: notif.message || '',
          messageMr: notif.message || '',
          type: notif.type === 'APPOINTMENT_BOOKED' ? 'appointment' : notif.type === 'TELEMEDICINE_SUGGESTED' ? 'telemedicine' : 'system',
          timestamp: 'Just now',
          isRead: false,
        };
        setNotifications((prev) => [notifItem, ...prev]);
        if (notif.message) {
          showToast(notif.message);
        }
      });

      socket.on('doctor_availability_changed', (data: { doctorId: string; status: any; notes?: string }) => {
        setDoctors((prev) =>
          prev.map((doc) =>
            doc.id === data.doctorId
              ? {
                  ...doc,
                  isAvailableToday: data.status === 'available' || data.status === 'with_patient',
                  telemedicineAvailable: data.status === 'available',
                }
              : doc
          )
        );
      });
    } catch (err) {
      console.warn('Socket connection error (using REST polling fallback):', err);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUser, showToast]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('gramarogya_lang', language);
  }, [language]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gramarogya_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gramarogya_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gramarogya_lowdata', String(lowDataMode));
  }, [lowDataMode]);

  useEffect(() => {
    localStorage.setItem('gramarogya_a11y', JSON.stringify(accessibility));
  }, [accessibility]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gramarogya_lang', lang);
    if (currentUser) {
      setCurrentUser({ ...currentUser, preferredLanguage: lang });
    }
  };

  const setLowDataMode = (val: boolean | ((prev: boolean) => boolean)) => {
    setLowDataModeState(val);
  };

  const updateAccessibility = (settings: Partial<AccessibilitySettings>) => {
    setAccessibility((prev) => ({ ...prev, ...settings }));
  };

  const t = (key: string, params?: Record<string, string | number | undefined>): string => {
    const dict = translations[language] || translations.mr || {};
    let text = dict[key] || translations.mr?.[key] || translations.en?.[key] || (params && params.default ? String(params.default) : key);
    if (params && typeof text === 'string') {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        if (paramVal !== undefined) {
          text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramVal));
        }
      });
    }
    return text;
  };

  // Localized Formatting functions
  const formatDate = (date: string | number | Date | undefined, formatStyle: 'short' | 'medium' | 'long' | 'full' = 'medium') =>
    formatLocaleDate(date, language, formatStyle);

  const formatTime = (timeInput: string | Date | undefined) =>
    formatLocaleTime(timeInput, language);

  const formatDateTime = (dateInput: string | number | Date | undefined) =>
    formatLocaleDateTime(dateInput, language);

  const formatNumber = (num: number | string, useDevanagariDigits = true) =>
    formatLocaleNumber(num, language, useDevanagariDigits);

  const formatDistance = (km: number | string) =>
    formatLocaleDistance(km, language);

  const formatRelativeTime = (dateInput: string | number | Date | undefined) =>
    formatLocaleRelativeTime(dateInput, language);

  const formatFacilityType = (type: string) =>
    formatLocaleFacilityType(type, language);

  const formatDoctorStatus = (status: string) =>
    formatLocaleDoctorStatus(status, language);

  const formatAppointmentStatus = (status: string) =>
    formatLocaleAppointmentStatus(status, language);

  const formatStockStatus = (status: string) =>
    formatLocaleStockStatus(status, language);

  const formatDoctorName = (name: string) =>
    formatLocaleDoctorName(name, language);

  const formatUserRole = (role: string) =>
    formatLocaleUserRole(role, language);

  const formatCurrency = (amount: number | string) =>
    formatLocaleCurrency(amount, language);

  const setCurrentPage = (page: string, params: Record<string, any> = {}) => {
    // If not authenticated, lock all application features and force login view only
    if (!currentUser) {
      if (['login', 'patient-login', 'doctor-login', 'staff-login', 'admin-login'].includes(page)) {
        setCurrentPageState(page);
      } else {
        setCurrentPageState('login');
      }
      setPageParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Role-based protection: only allow authorized role pages
    if (currentUser.role === 'patient') {
      const forbiddenForPatient = ['doctor-dashboard', 'admin-dashboard'];
      if (forbiddenForPatient.includes(page)) {
        showToast(t('auto.text_1177'));
        setCurrentPageState('patient-dashboard');
        return;
      }
    } else if (currentUser.role === 'doctor') {
      const forbiddenForDoctor = ['patient-dashboard', 'admin-dashboard'];
      if (forbiddenForDoctor.includes(page)) {
        showToast(t('auto.text_1178'));
        setCurrentPageState('doctor-dashboard');
        return;
      }
    }

    setCurrentPageState(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Helpers
  const DEMO_PATIENT: any = { id: 'patient', role: 'patient', name: 'Patient' };
  const DEMO_DOCTOR: any = { id: 'doctor', role: 'doctor', name: 'Doctor' };
  const DEMO_ADMIN: any = { id: 'admin', role: 'admin', name: 'Admin' };
  const loginAsDemoPatient = () => {
    const token = `auth_token_patient_${Date.now()}`;
    localStorage.setItem('gramarogya_auth_token', token);
    sessionStorage.setItem('gramarogya_auth_session', JSON.stringify({ token, role: 'patient', user: DEMO_PATIENT }));
    localStorage.setItem('gramarogya_user', JSON.stringify(DEMO_PATIENT));
    setCurrentUser(DEMO_PATIENT);
    showToast('रुग्ण / नागरिक म्हणून लॉगिन झाले (Patient Portal)');
    setCurrentPage('patient-dashboard');
  };

  const loginAsDemoDoctor = () => {
    const token = `auth_token_doctor_${Date.now()}`;
    localStorage.setItem('gramarogya_auth_token', token);
    sessionStorage.setItem('gramarogya_auth_session', JSON.stringify({ token, role: 'doctor', user: DEMO_DOCTOR }));
    localStorage.setItem('gramarogya_user', JSON.stringify(DEMO_DOCTOR));
    setCurrentUser(DEMO_DOCTOR);
    showToast('वैद्यकीय अधिकारी म्हणून लॉगिन झाले (Doctor Portal)');
    setCurrentPage('doctor-dashboard');
  };

  const loginAsDemoAdmin = () => {
    const token = `auth_token_admin_${Date.now()}`;
    localStorage.setItem('gramarogya_auth_token', token);
    showToast('सार्वजनिक आरोग्य प्रशासक लॉगिन (Admin Portal)');
    setCurrentPage('admin-dashboard');
  };

  const loginUser = (
    role: 'patient' | 'doctor' | 'admin',
    identifier: string,
    profile?: Partial<UserProfile>
  ): boolean => {
    const authToken = `jwt_auth_${Date.now()}`;

    if (role === 'patient') {
      const cleanIdentifier = identifier ? identifier.replace(/\D/g, '') : '';
      const patientUser: UserProfile = {
        id: profile?.id || `pat-${Date.now()}`,
        role: 'patient',
        name: profile?.name || `Patient`,
        nameMr: profile?.nameMr || profile?.name || `रुग्ण`,
        mobile: profile?.mobile || identifier,
        preferredLanguage: profile?.preferredLanguage || language || 'mr',
        abhaId: profile?.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        age: profile?.age,
        gender: profile?.gender,
        village: profile?.village,
        district: profile?.district,
        address: profile?.address,
        emergencyContactName: profile?.emergencyContactName,
        emergencyContactMobile: profile?.emergencyContactMobile,
        profilePhoto: profile?.profilePhoto,
        ...profile,
      };

      localStorage.setItem('gramarogya_auth_token', authToken);
      sessionStorage.setItem('gramarogya_auth_session', JSON.stringify({ token: authToken, role: 'patient', user: patientUser }));
      localStorage.setItem('gramarogya_user', JSON.stringify(patientUser));
      setCurrentUser(patientUser);
      setCurrentPage('patient-dashboard');
      showToast(t('auto.text_1179'));
      return true;
    } else if (role === 'doctor') {
      const matchedDoctor = doctors.find((d) => d.id === identifier || d.registrationNumber === identifier || (profile && profile.providerId === d.registrationNumber));
      const doctorUser: UserProfile = {
        ...(matchedDoctor ? {
          id: matchedDoctor.id,
          role: 'doctor',
          name: matchedDoctor.name,
          nameMr: matchedDoctor.nameMr,
          mobile: matchedDoctor.contactNumber || '9822011223',
          preferredLanguage: 'mr',
          providerId: matchedDoctor.providerId || matchedDoctor.registrationNumber,
          qualification: matchedDoctor.qualification,
          specialization: matchedDoctor.specialization,
          specializationMr: matchedDoctor.specializationMr,
          facilityId: matchedDoctor.facilityId,
          facilityName: matchedDoctor.facilityName,
          facilityNameMr: matchedDoctor.facilityNameMr,
          department: matchedDoctor.department || 'General OPD',
          experienceYears: matchedDoctor.experienceYears,
          availableHours: '9:00 AM - 4:00 PM',
          isOnlineForTelemedicine: true,
        } : DEMO_DOCTOR),
        ...profile,
        role: 'doctor',
      };
      localStorage.setItem('gramarogya_auth_token', authToken);
      sessionStorage.setItem('gramarogya_auth_session', JSON.stringify({ token: authToken, role: 'doctor', user: doctorUser }));
      localStorage.setItem('gramarogya_user', JSON.stringify(doctorUser));
      setCurrentUser(doctorUser);
      setCurrentPage('doctor-dashboard');
      showToast(t('auto.text_1180'));
      return true;
    } else if (role === 'admin') {
      const adminUser: UserProfile = {
        id: 'admin-1',
        role: 'admin',
        name: 'District Health Officer (DHO)',
        nameMr: 'जिल्हा आरोग्य अधिकारी',
        mobile: identifier || '9822099999',
        preferredLanguage: 'mr',
        department: 'District Health Administration',
        ...profile,
      };
      localStorage.setItem('gramarogya_auth_token', authToken);
      sessionStorage.setItem('gramarogya_auth_session', JSON.stringify({ token: authToken, role: 'admin', user: adminUser }));
      localStorage.setItem('gramarogya_user', JSON.stringify(adminUser));
      setCurrentUser(adminUser);
      setCurrentPage('admin-dashboard');
      showToast(t('auto.text_1181'));
      return true;
    }
    return false;
  };

  const registerPatient = (profileData: Partial<UserProfile>) => {
    const newPatient: UserProfile = {
      id: profileData.id || `pat-${Date.now()}`,
      role: 'patient',
      name: profileData.name || 'Citizen Patient',
      nameMr: profileData.nameMr || profileData.name,
      mobile: profileData.mobile || '',
      preferredLanguage: profileData.preferredLanguage || language || 'mr',
      village: profileData.village || '',
      district: profileData.district || '',
      age: profileData.age,
      gender: profileData.gender || 'Other',
      bloodGroup: profileData.bloodGroup,
      address: profileData.address || '',
      emergencyContactName: profileData.emergencyContactName || '',
      emergencyContactMobile: profileData.emergencyContactMobile || '',
      profilePhoto: profileData.profilePhoto,
      ...profileData,
    };
    const token = `jwt_auth_${Date.now()}`;
    localStorage.setItem('gramarogya_auth_token', token);
    sessionStorage.setItem('gramarogya_auth_session', JSON.stringify({ token, role: 'patient', user: newPatient }));
    localStorage.setItem('gramarogya_user', JSON.stringify(newPatient));
    setCurrentUser(newPatient);
    SupabaseService.updateProfile(newPatient);
    showToast('नवीन खाते यशस्वीरित्या तयार झाले! (Saved to Supabase)');
    setCurrentPage('patient-profile', { isFirstTimeSetup: true });
  };

  const updateUserProfile = async (profile: UserProfile): Promise<void> => {
    try {
      await apiClient.updateProfile(profile);
    } catch (e) {
      console.warn('apiClient.updateProfile notice:', e);
    }
    const res = await SupabaseService.updateProfile(profile);
    const updated = res.success && res.data ? res.data : profile;
    setCurrentUser(updated);
    localStorage.setItem('gramarogya_user', JSON.stringify(updated));
  };

  const logout = async () => {
    try {
      await SupabaseAuthService.signOut();
    } catch {
      // ignore
    }
    authService.logout();
    setCurrentUser(null);
    localStorage.removeItem('gramarogya_user');
    localStorage.removeItem('gramarogya_auth_token');
    localStorage.removeItem('gramarogya_jwt_auth_token');
    localStorage.removeItem('gramarogya_user_profile');
    sessionStorage.removeItem('gramarogya_auth_session');
    showToast(t('auto.text_1182'));
    setCurrentPageState('login');
  };

  // Real Appointment Booking via REST API / Supabase
  const bookAppointment = async (data: Omit<Appointment, 'id' | 'tokenNumber' | 'createdAt' | 'status'>): Promise<Appointment> => {
    try {
      const response = await apiClient.createAppointment(data);
      if (response.success && response.data) {
        setAppointments((prev) => [response.data!, ...prev]);

        // Add confirmation notification
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          userId: data.patientId,
          title: 'Appointment Confirmed',
          titleMr: 'भेटीची वेळ निश्चित झाली',
          message: `Your appointment with ${data.doctorName} at ${data.facilityName} is confirmed for ${data.date} (${data.timeSlot}). Token: ${response.data.tokenNumber}`,
          messageMr: `${data.facilityName} येथे ${data.doctorName} यांच्यासोबत तुमची भेट ${data.date} (${data.timeSlot}) निश्चित झाली आहे. टोकन: ${response.data.tokenNumber}`,
          type: 'appointment',
          timestamp: 'Just now',
          isRead: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);
        showToast(`अपॉइंटमेंट निश्चित झाली! टोकन क्रमांक: ${response.data.tokenNumber}`);
        return response.data;
      }
    } catch (e) {
      console.error('Server booking failed, falling back to database creation:', e);
    }

    // Local Supabase fallback
    const newApt = await SupabaseService.bookAppointment(data);
    setAppointments((prev) => [newApt, ...prev]);
    showToast(`अपॉइंटमेंट निश्चित झाली! टोकन क्रमांक: ${newApt.tokenNumber}`);
    return newApt;
  };

  const updateAppointmentStatus = async (
    id: string,
    status: AppointmentStatus,
    doctorNotes?: string,
    extra?: { newDate?: string; newTimeSlot?: string; telemedicineRoomId?: string; consultationType?: string }
  ) => {
    try {
      await apiClient.updateAppointmentStatus(id, {
        status,
        doctorNotes,
        newDate: extra?.newDate,
        newTimeSlot: extra?.newTimeSlot,
        telemedicineRoomId: extra?.telemedicineRoomId,
        consultationType: extra?.consultationType,
      });
    } catch (err) {
      console.warn('Status update API sync note:', err);
    }

    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              status,
              doctorNotes: doctorNotes !== undefined ? doctorNotes : apt.doctorNotes,
              date: extra?.newDate || apt.date,
              timeSlot: extra?.newTimeSlot || apt.timeSlot,
              telemedicineRoomId: extra?.telemedicineRoomId || apt.telemedicineRoomId,
              consultationType: (extra?.consultationType as any) || apt.consultationType,
            }
          : apt
      )
    );
    showToast(`रुग्ण भेट स्थिती अद्ययावत: ${status}`);
  };

  const suggestTelemedicine = async (
    appointmentId: string,
    doctorNotes?: string
  ): Promise<{ success: boolean; data?: Appointment; message?: string }> => {
    try {
      const response = await apiClient.suggestTelemedicine(appointmentId, { doctorNotes });
      if (response.success && response.data) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === appointmentId ? { ...apt, ...response.data! } : apt))
        );
        showToast(
          t('auto.text_1183')
        );
        return { success: true, data: response.data };
      }
      return { success: false, message: response.error };
    } catch {
      // Fallback
      const roomId = `room-${appointmentId}`;
      const updatedStatus: AppointmentStatus = 'Telemedicine_Suggested';
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? {
                ...apt,
                status: updatedStatus,
                doctorNotes: doctorNotes || apt.doctorNotes,
                telemedicineRoomId: roomId,
                telemedicineLink: `/telemedicine?room=${roomId}`,
                telemedicineNotes: doctorNotes,
              }
            : apt
        )
      );
      showToast('व्हिडिओ टेलिमेडिसिन सल्ला पाठवला आहे.');
      return { success: true };
    }
  };

  const acceptTelemedicine = async (
    appointmentId: string
  ): Promise<{ success: boolean; data?: Appointment; message?: string }> => {
    try {
      const response = await apiClient.acceptTelemedicine(appointmentId);
      if (response.success && response.data) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === appointmentId ? { ...apt, ...response.data! } : apt))
        );
        showToast(
          t('auto.text_1184')
        );
        return { success: true, data: response.data };
      }
      return { success: false, message: response.error };
    } catch {
      const updatedStatus: AppointmentStatus = 'Telemedicine_Accepted';
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId
            ? {
                ...apt,
                status: updatedStatus,
              }
            : apt
        )
      );
      showToast('व्हिडिओ सल्लामसलत स्वीकारली आहे.');
      return { success: true };
    }
  };

  // Doctor self registration
  const registerDoctorSelf = async (doctorData: Partial<Doctor>) => {
    try {
      const response = await apiClient.registerDoctor(doctorData);
      if (response.success && response.data) {
        setDoctors((prev) => [...prev, response.data!]);
        showToast(response.message || 'डॉक्टर नोंदणी प्रशासकीय मंजुरीसाठी पाठवली आहे.');
        return { success: true, message: response.message };
      }
      return { success: false, message: response.error || 'नोंदणी अयशस्वी.' };
    } catch {
      return { success: false, message: 'सर्व्हरशी संपर्क होऊ शकला नाही.' };
    }
  };

  // Admin verifies doctor
  const verifyDoctorCredentials = async (doctorId: string, action: 'approve' | 'reject') => {
    try {
      const response = await apiClient.verifyDoctor(doctorId, action, currentUser?.name || 'District Medical Authority');
      if (response.success && response.data) {
        setDoctors((prev) =>
          prev.map((d) => (d.id === doctorId ? { ...d, ...response.data! } : d))
        );
        showToast(response.message || `डॉक्टर नोंदणी ${action === 'approve' ? 'मंजूर' : 'नामंजूर'} केली.`);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.error };
    } catch {
      return { success: false, message: 'प्रमाणीकरण अयशस्वी.' };
    }
  };

  // Doctor updates live availability
  const updateDoctorLiveAvailability = async (
    doctorId: string,
    status: DoctorAvailabilityStatus,
    notes?: string,
    extra?: { activeShift?: string; opdTimings?: string; consultationType?: 'In-Person (OPD)' | 'Telemedicine (Video)' | 'Both In-Person & Telemedicine' }
  ) => {
    try {
      await SupabaseService.updateDoctorLiveStatus(doctorId, status, notes);
      await apiClient.updateDoctorAvailability(doctorId, {
        status,
        notes,
        activeShift: extra?.opdTimings || extra?.activeShift,
        opdTimings: extra?.opdTimings,
        consultationType: extra?.consultationType,
        updatedBy: currentUser?.name || 'Doctor',
      });

      // Synchronize in local doctors state immediately
      setDoctors((prev) =>
        prev.map((d) => {
          if (d.id === doctorId) {
            return {
              ...d,
              isAvailableToday: status === 'available' || status === 'with_patient',
              telemedicineAvailable: status === 'available' && extra?.consultationType !== 'In-Person (OPD)',
              ...(extra?.opdTimings && { opdTimings: extra.opdTimings }),
              ...(extra?.consultationType && { consultationType: extra.consultationType }),
            };
          }
          return d;
        })
      );

      showToast(language === 'mr' ? `उपलब्धता स्थिती '${status}' अद्ययावत केली.` : `Live status updated to '${status}'.`);
    } catch {
      showToast('स्थिती अद्ययावत झाली.');
    }
  };

  const getDoctorLiveAvailability = async (doctorId: string): Promise<DoctorAvailability | null> => {
    try {
      const res = await apiClient.getDoctorAvailability(doctorId);
      return res.data;
    } catch {
      return null;
    }
  };

  // Doctor creates Prescription
  const createPrescription = (prescriptionData: Omit<Prescription, 'id'>): Prescription => {
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: `rx-${Date.now()}`,
      signedDigitally: true,
    };

    setPrescriptions((prev) => [newPrescription, ...prev]);

    const newRecord: HealthRecord = {
      id: `rec-rx-${Date.now()}`,
      patientId: prescriptionData.patientId,
      title: `Digital Prescription - ${prescriptionData.facilityName}`,
      titleMr: `डिजिटल औषधोपचार - ${prescriptionData.facilityName}`,
      category: 'Prescription',
      facilityName: prescriptionData.facilityName,
      doctorName: prescriptionData.doctorName,
      date: prescriptionData.date,
      summary: `Diagnosis: ${prescriptionData.diagnosis}. ${prescriptionData.medicines.length} medicines prescribed.`,
      fileType: 'Digital',
      fileName: `Prescription_${prescriptionData.patientName.replace(/\s+/g, '_')}.pdf`,
      tags: ['Prescription', 'Doctor Visit', prescriptionData.diagnosis],
    };
    setHealthRecords((prev) => [newRecord, ...prev]);

    const notif: NotificationItem = {
      id: `notif-rx-${Date.now()}`,
      userId: prescriptionData.patientId,
      title: 'New Prescription Issued',
      titleMr: 'नवीन औषधोपचार पत्रिका तयार झाली',
      message: `${prescriptionData.doctorName} has issued a digital prescription for ${prescriptionData.diagnosis}.`,
      messageMr: `${prescriptionData.doctorName} यांनी औषधोपचार पत्रिका दिली आहे.`,
      type: 'prescription',
      timestamp: 'Just now',
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast('डिजिटल औषधोपचार पत्रिका यशस्वीरित्या तयार झाली!');
    return newPrescription;
  };

  // Referral System
  const createReferral = (referralData: Omit<Referral, 'id'>): Referral => {
    const newRef: Referral = {
      ...referralData,
      id: `ref-${Date.now()}`,
    };
    setReferrals((prev) => [newRef, ...prev]);
    showToast(`रुग्ण यशस्वीरित्या संदर्भित (Referred) केला: ${referralData.targetFacilityName}`);
    return newRef;
  };

  // Emergency SOS Request
  const submitEmergencyRequest = async (
    req: Omit<EmergencyRequest, 'id' | 'timestamp' | 'status'>
  ): Promise<EmergencyRequest> => {
    const newEmergency = await SupabaseService.createEmergencyRequest(req);
    setEmergencyRequests((prev) => [newEmergency, ...prev]);
    showToast(
      language === 'mr'
        ? `⚠️ आपत्कालीन १०८ रुग्णवाहिका रवाना झाली आहे! चालक: ${newEmergency.driverName || 'संजय शिंदे'}`
        : `⚠️ 108 Emergency Ambulance Dispatched! Driver: ${newEmergency.driverName || 'Sanjay Shinde'}`
    );
    return newEmergency;
  };

  const updateEmergencyStatus = async (
    id: string,
    status: EmergencyLifecycleStatus,
    updates?: Partial<EmergencyRequest>
  ): Promise<void> => {
    const updated = await SupabaseService.updateEmergencyStatus(id, status, updates);
    if (updated) {
      setEmergencyRequests((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status, ...updates } : e))
      );
    }
  };

  const updateAmbulanceStatus = async (
    id: string,
    status: 'available' | 'busy' | 'offline'
  ): Promise<void> => {
    await SupabaseService.updateAmbulanceStatus(id, status);
    setAmbulances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, availability: status } : a))
    );
  };

  // Health Camp Registration
  const registerForCamp = async (campId: string, citizenDetails: { name: string; mobile: string; village: string; age: number }): Promise<boolean> => {
    try {
      await apiClient.registerForCamp(campId);
    } catch {
      // Local increment
    }
    setHealthCamps((prev) =>
      prev.map((c) =>
        c.id === campId ? { ...c, registeredCount: c.registeredCount + 1 } : c
      )
    );
    showToast(`आरोग्य शिबिरासाठी नोंदणी यशस्वी झाली! टोकन SMS ${citizenDetails.mobile} वर पाठवण्यात आला आहे.`);
    return true;
  };

  // Health Record Upload
  const uploadHealthRecord = (record: Omit<HealthRecord, 'id'>) => {
    const newRec: HealthRecord = {
      ...record,
      id: `rec-${Date.now()}`,
    };
    setHealthRecords((prev) => [newRec, ...prev]);
    showToast('वैद्यकीय दस्तऐवज यशस्वीरित्या डिजिटल लॉकरमध्ये अपलोड झाला!');
  };

  // Chat message
  const sendChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: 'Just now',
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        userRole: currentUser?.role || null,
        language,
        setLanguage,
        t,
        formatDate,
        formatTime,
        formatDateTime,
        formatNumber,
        formatDistance,
        formatRelativeTime,
        formatFacilityType,
        formatDoctorStatus,
        formatAppointmentStatus,
        formatStockStatus,
        formatDoctorName,
        formatUserRole,
        formatCurrency,
        lowDataMode,
        setLowDataMode,
        accessibility,
        updateAccessibility,
        currentPage,
        setCurrentPage,
        pageParams,
        facilities,
        doctors,
        appointments,
        prescriptions,
        referrals,
        healthRecords,
        medicineStocks,
        healthCamps,
        schemes,
        emergencyRequests,
        ambulances,
        notifications,
        chatMessages,
        auditLogs,
        isLoadingData,
        isAuthLoading,
        refreshData,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isSqlSchemaModalOpen,
        setIsSqlSchemaModalOpen,
        loginAsDemoPatient,
        loginAsDemoDoctor,
        loginAsDemoAdmin,
        loginUser,
        registerPatient,
        updateUserProfile,
        logout,
        bookAppointment,
        updateAppointmentStatus,
        suggestTelemedicine,
        acceptTelemedicine,
        createPrescription,
        createReferral,
        submitEmergencyRequest,
        updateEmergencyStatus,
        updateAmbulanceStatus,
        registerForCamp,
        uploadHealthRecord,
        sendChatMessage,
        markNotificationAsRead,
        registerDoctorSelf,
        verifyDoctorCredentials,
        updateDoctorLiveAvailability,
        getDoctorLiveAvailability,
        toastMessage,
        showToast,
      }}
    >
      <div
        className={`min-h-screen flex flex-col ${
          accessibility.highContrast
            ? 'bg-black text-white selection:bg-yellow-400 selection:text-black'
            : 'bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white'
        } ${
          accessibility.fontSize === 'large'
            ? 'text-lg'
            : accessibility.fontSize === 'xlarge'
            ? 'text-xl'
            : 'text-base'
        }`}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
