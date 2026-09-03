export type Language = 'mr' | 'hi' | 'en';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'guest';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  nameMr?: string;
  nameHi?: string;
  mobile: string;
  email?: string;
  avatar?: string;
  preferredLanguage: Language;
  
  // Account Status & Verification
  isVerified?: boolean;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;

  // Patient specific
  abhaId?: string; // Ayushman Bharat Health Account ID
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  dateOfBirth?: string;
  mobileNumber?: string;
  bloodGroup?: string;
  village?: string;
  taluka?: string;
  district?: string;
  pinCode?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  profilePhoto?: string;
  allergies?: string[];
  chronicConditions?: string[];

  // Doctor Account Linking to Directory
  linkedDoctorId?: string; // Points to verified Doctor record in Public Directory
  providerId?: string;
  qualification?: string;
  specialization?: string;
  specializationMr?: string;
  facilityId?: string;
  facilityName?: string;
  facilityNameMr?: string;
  department?: string;
  experienceYears?: number;
  availableHours?: string;
  isOnlineForTelemedicine?: boolean;
  registrationNumber?: string;
  registrationCouncil?: string;

  // Admin specific
  adminId?: string;
  jurisdictionDistrict?: string;
  departmentName?: string;
}

export type FacilityType = 'PHC' | 'CHC' | 'Sub-Centre' | 'District Hospital' | 'Government Medical College' | 'Sub-District Hospital';

export interface Facility {
  id: string;
  name: string;
  nameMr: string;
  nameHi: string;
  type: FacilityType;
  district: string;
  taluka: string;
  villageOrCity: string;
  address: string;
  distanceKm: number;
  contactNumber: string;
  emergencyNumber: string;
  openHours: string;
  is24x7Emergency: boolean;
  hasAmbulance: boolean;
  hasFreeMedicines: boolean;
  specialistsAvailable: string[];
  services: string[];
  doctorsCount: number;
  bedsTotal: number;
  bedsAvailable: number;
  lat: number;
  lng: number;
  rating: number;
  verificationStatus?: 'verified' | 'govt_confirmed' | 'unverified' | 'demo';
  lastVerifiedAt?: string;
  dataSource?: string;
}

export type DoctorVerificationStatus =
  | 'verified'
  | 'govt_confirmed'
  | 'pending_verification'
  | 'rejected'
  | 'community_reported'
  | 'unverified'
  | 'demo';
export type DoctorAvailabilityStatus = 'available' | 'with_patient' | 'busy' | 'on_break' | 'off_duty';

export interface DoctorAvailability {
  doctorId: string;
  doctorName: string;
  facilityId: string;
  facilityName: string;
  status: DoctorAvailabilityStatus;
  statusText: string;
  statusTextMr: string;
  lastUpdated: string;
  activeShift: string;
  currentQueueCount: number;
  avgWaitTimeMinutes: number;
  notes?: string;
  updatedBy: string;
}

export interface Doctor {
  id: string;
  name: string;
  nameMr: string;
  nameHi?: string;
  providerId?: string;
  qualification: string;
  specialization: string;
  specializationMr: string;
  specializationHi?: string;
  facilityId: string;
  facilityName: string;
  facilityNameMr: string;
  department?: string;
  consultationType?: 'In-Person (OPD)' | 'Telemedicine (Video)' | 'Both In-Person & Telemedicine';
  experienceYears: number;
  rating: number;
  languages: string[];
  consultationFee?: number; // 0 for government
  availableDays?: string[];
  telemedicineAvailable?: boolean;
  avatarUrl: string;
  currentQueueCount?: number;
  registrationNumber?: string;
  registrationCouncil?: string;
  isAvailableToday?: boolean;
  avgConsultationTimeMins?: number;
  verificationStatus?: DoctorVerificationStatus;
  verificationDate?: string;
  verifiedBy?: string;
  contactNumber?: string;
  source?: string;
  dataSource?: string;
  lastVerifiedAt?: string;
  lastUpdated?: string;
  isClaimed?: boolean;
  claimedByUserId?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  source: string;
  endpoint: string;
  status: 'SUCCESS' | 'UNAVAILABLE' | 'UNAUTHORIZED' | 'FAILED';
  details: string;
  actor: string;
}

export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled'
  | 'In-Progress'
  | 'Telemedicine_Suggested'
  | 'Telemedicine_Accepted';
export type ConsultationType = 'In-Person (OPD)' | 'Telemedicine (Video)' | 'Health Camp' | 'In-Person OPD';

export interface Appointment {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientVillage: string;
  patientDistrict?: string;
  patientMobile: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  facilityId: string;
  facilityName: string;
  facilityNameMr?: string;
  department?: string;
  date: string;
  timeSlot: string;
  consultationType: ConsultationType;
  reason?: string;
  symptomsDescription?: string;
  status: AppointmentStatus;
  doctorNotes?: string;
  telemedicineRoomId?: string;
  telemedicineLink?: string;
  telemedicineNotes?: string;
  telemedicineSuggestedBy?: string;
  priority?: 'Regular' | 'High' | 'Emergency';
  createdAt?: string;
}

export interface MedicineItem {
  name: string;
  genericName: string;
  dosage: string;
  frequency: 'Once daily' | 'Twice daily (सकाळ-संध्याकाळ)' | 'Thrice daily' | 'As needed (आवश्यकतेनुसार)';
  durationDays: number;
  instructions: string;
  instructionsMr: string;
  instructionsHi: string;
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientVillage: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  facilityName: string;
  date: string;
  diagnosis: string;
  diagnosisMr?: string;
  symptoms: string[];
  medicines: MedicineItem[];
  recommendedTests: string[];
  advice: string;
  adviceMr?: string;
  followUpDate?: string;
  followUpRequired: boolean;
  signedDigitally: boolean;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientVillage: string;
  referringDoctorId: string;
  referringDoctorName: string;
  referringFacility: string;
  targetFacilityType: FacilityType;
  targetFacilityName: string;
  targetDepartment: string;
  clinicalReason: string;
  clinicalReasonMr?: string;
  urgency: 'Immediate (24 hrs)' | 'High (3 days)' | 'Routine (1 week)';
  date: string;
  status: 'Pending' | 'Accepted' | 'Completed';
  transportSupportNeeded: boolean;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  title: string;
  titleMr: string;
  category: 'Prescription' | 'Lab Report' | 'Vaccination' | 'Discharge Summary' | 'Doctor Note';
  facilityName: string;
  doctorName?: string;
  date: string;
  summary: string;
  fileType: 'PDF' | 'Image' | 'Digital';
  fileName: string;
  fileUrl?: string;
  tags: string[];
}

export interface MedicineStock {
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
  alternativeFacility?: string;
  alternativeDistanceKm?: number;
}

export type EmergencyLifecycleStatus =
  | 'REQUESTED'
  | 'DISPATCHING'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'PATIENT_PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_HOSPITAL'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  type: 'Basic Life Support (BLS)' | 'Advanced Life Support (ALS)' | '108 Government Emergency';
  driverId: string;
  driverName: string;
  driverContact: string;
  facilityId: string;
  facilityName: string;
  currentLat: number;
  currentLng: number;
  availability: 'available' | 'busy' | 'offline';
  lastUpdated: string;
}

export interface EmergencyRequest {
  id: string;
  patientId?: string;
  patientName: string;
  contactNumber: string;
  emergencyType: 'Accident' | 'Cardiac/Chest Pain' | 'Maternal/Labour' | 'Snake Bite' | 'Respiratory/Asthma' | 'Other Acute Condition' | string;
  locationAddress: string;
  village: string;
  district: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: EmergencyLifecycleStatus;
  ambulanceStatus?: string; // backwards compatibility
  ambulanceId?: string;
  vehicleNumber?: string;
  driverId?: string;
  driverName?: string;
  driverMobile?: string;
  etaMinutes?: number;
  assignedHospitalId?: string;
  assignedHospital: string;
  assignedHospitalNameMr?: string;
  requiredFacilityCapability?: string;
  dispatchNotes?: string;
  hospitalNotified?: boolean;
}

export interface HealthCamp {
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
}

export interface GovernmentScheme {
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
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  titleMr: string;
  message: string;
  messageMr: string;
  type: 'appointment' | 'telemedicine' | 'emergency' | 'prescription' | 'camp' | 'reminder' | 'scheme' | 'system';
  timestamp: string;
  isRead: boolean;
  linkUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor' | 'system' | 'ai';
  recipientId?: string;
  message: string;
  timestamp: string;
  attachmentName?: string;
}
