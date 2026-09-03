export type FacilityType =
  | 'PHC'
  | 'CHC'
  | 'Sub-Centre'
  | 'Sub-District Hospital'
  | 'District Hospital'
  | 'Government Hospital'
  | 'Government Medical College';

export type VerificationStatus = 'verified_government' | 'verified_facility' | 'pending_verification' | 'unverified' | 'demo';

export interface FacilityRecord {
  id: string;
  officialName: string;
  officialNameMr: string;
  officialNameHi: string;
  type: FacilityType;
  classification: 'Public / Government' | 'Autonomous Government' | 'NHM Facility';
  address: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pinCode: string;
  lat: number;
  lng: number;
  contactNumber: string;
  emergencyNumber: string;
  openHours: string;
  is24x7Emergency: boolean;
  hasAmbulance: boolean;
  hasFreeMedicines: boolean;
  hasBloodStorage: boolean;
  specialistsAvailable: string[];
  services: string[];
  doctorsCount: number;
  bedsTotal: number;
  bedsAvailable: number;
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  verificationStatus: VerificationStatus;
  distanceKm?: number;
}

export type DoctorVerificationStatus = 'verified' | 'pending_verification' | 'rejected' | 'demo';
export type DoctorAvailabilityStatus = 'available' | 'with_patient' | 'busy' | 'on_break' | 'off_duty';

export interface DoctorRecord {
  id: string;
  name: string;
  nameMr: string;
  nameHi: string;
  registrationNumber: string;
  registrationCouncil: string;
  qualification: string;
  specialization: string;
  specializationMr: string;
  specializationHi: string;
  facilityId: string;
  facilityName: string;
  facilityNameMr: string;
  department: string;
  consultationType: 'In-Person (OPD)' | 'Telemedicine (Video)' | 'Both In-Person & Telemedicine';
  experienceYears: number;
  contactNumber?: string;
  rating: number;
  languages: string[];
  avatarUrl: string;
  verificationStatus: DoctorVerificationStatus;
  verificationDate?: string;
  verifiedBy?: string;
  source: string;
  lastUpdated: string;
  isAvailableToday?: boolean;
  telemedicineAvailable?: boolean;
  opdTimings?: string;
}

export interface DoctorAvailabilityRecord {
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName: string;
  status: DoctorAvailabilityStatus;
  statusText: string;
  statusTextMr: string;
  lastUpdated: string; // ISO String
  activeShift: string;
  currentQueueCount: number;
  avgWaitTimeMinutes: number;
  notes?: string;
  updatedBy: string;
  consultationType?: 'In-Person (OPD)' | 'Telemedicine (Video)' | 'Both In-Person & Telemedicine';
  opdTimings?: string;
}

export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled'
  | 'Telemedicine_Suggested'
  | 'Telemedicine_Accepted';

export interface AppointmentRecord {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientVillage: string;
  patientDistrict: string;
  patientMobile: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  facilityId: string;
  facilityName: string;
  facilityNameMr?: string;
  department: string;
  date: string;
  timeSlot: string;
  consultationType: 'In-Person (OPD)' | 'Telemedicine (Video)' | 'Health Camp';
  reason: string;
  status: AppointmentStatus;
  doctorNotes?: string;
  diagnosis?: string;
  prescription?: any;
  telemedicineRoomId?: string;
  telemedicineLink?: string;
  telemedicineNotes?: string;
  telemedicineSuggestedBy?: string;
  priority: 'Regular' | 'High' | 'Emergency';
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  role: 'patient' | 'doctor' | 'admin' | 'guest';
  name: string;
  nameMr?: string;
  nameHi?: string;
  mobile: string;
  email?: string;
  avatar?: string;
  profilePhoto?: string;
  abhaId?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  dateOfBirth?: string;
  place?: string;
  village?: string;
  taluka?: string;
  district?: string;
  pinCode?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  bloodGroup?: string;
  isPhoneVerified?: boolean;
  preferredLanguage?: 'mr' | 'hi' | 'en';
  createdAt: string;
  updatedAt?: string;
}

export interface HealthSchemeRecord {
  id: string;
  name: string;
  nameMr: string;
  nameHi: string;
  shortName: string;
  coverageAmount: string;
  targetBeneficiaries: string;
  targetBeneficiariesMr: string;
  overview: string;
  overviewMr: string;
  benefits: string[];
  benefitsMr: string[];
  eligibilityCriteria: string[];
  eligibilityCriteriaMr: string[];
  requiredDocuments: string[];
  howToApply: string;
  howToApplyMr: string;
  category: 'Health Insurance' | 'Maternal & Child' | 'Tribal Health' | 'Elderly Care' | 'Cashless Hospitalization';
  officialPortalUrl: string;
  officialNotificationNo?: string;
  verificationStatus: VerificationStatus;
  lastUpdated: string;
  source: string;
}

export interface MedicineStockRecord {
  id: string;
  name: string;
  genericName: string;
  category: 'Antibiotic' | 'Analgesic' | 'Diabetes' | 'Hypertension' | 'Maternal/Child' | 'Emergency' | 'Respiratory';
  facilityId: string;
  facilityName: string;
  facilityNameMr: string;
  district: string;
  availableQuantity: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  price: 'Free (Government Scheme)' | 'Nominal (Jan Aushadhi)';
  requiresPrescription: boolean;
  batchNumber?: string;
  expiryDate?: string;
  source: string;
  lastUpdated: string;
}

export interface HealthCampRecord {
  id: string;
  title: string;
  titleMr: string;
  titleHi: string;
  organizingFacility: string;
  taluka: string;
  village: string;
  district: string;
  venueAddress: string;
  date: string;
  time: string;
  servicesProvided: string[];
  specialistDoctors: string[];
  totalSlots: number;
  registeredCount: number;
  isFreeCamp: boolean;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  contactPerson: string;
  contactNumber: string;
  source: string;
  lastUpdated: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  action: string;
  source: string;
  endpoint: string;
  status: 'SUCCESS' | 'UNAVAILABLE' | 'UNAUTHORIZED' | 'FAILED';
  details: string;
  actor: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  recipientRole?: string;
  title: string;
  titleMr?: string;
  titleHi?: string;
  message: string;
  messageMr?: string;
  messageHi?: string;
  type: string;
  appointmentId?: string;
  tokenNumber?: string;
  roomId?: string;
  actionUrl?: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
  timestamp?: string;
}
