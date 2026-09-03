import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  id?: string;
  doctorId: string;
  userId?: string;
  claimedByUserId?: string;
  isClaimed?: boolean;
  name: string;
  nameMr: string;
  nameHi?: string;
  qualification: string;
  specialization: string;
  specializationMr: string;
  specializationHi?: string;
  facilityId: string;
  facilityName: string;
  facilityNameMr?: string;
  department: string;
  experienceYears: number;
  registrationNumber: string;
  registrationCouncil: string;
  contactNumber?: string;
  rating: number;
  languages: string[];
  avatarUrl: string;
  verificationStatus: 'verified' | 'govt_confirmed' | 'pending_verification' | 'rejected' | 'community_reported' | 'unverified' | 'demo';
  lastVerifiedAt?: string;
  dataSource?: string;
  status: 'available' | 'with_patient' | 'busy' | 'on_break' | 'off_duty';
  statusText?: string;
  statusTextMr?: string;
  consultationType: 'In-Person (OPD)' | 'Telemedicine (Video)' | 'Both In-Person & Telemedicine';
  workingHours: string;
  telemedicineAvailable: boolean;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    doctorId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, sparse: true },
    claimedByUserId: { type: String, sparse: true },
    isClaimed: { type: Boolean, default: false },
    name: { type: String, required: true, trim: true },
    nameMr: { type: String, required: true, trim: true },
    nameHi: { type: String, trim: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true, index: true },
    specializationMr: { type: String, required: true },
    specializationHi: { type: String },
    facilityId: { type: String, required: true, index: true },
    facilityName: { type: String, required: true },
    facilityNameMr: { type: String },
    department: { type: String, default: 'General OPD' },
    experienceYears: { type: Number, default: 5 },
    registrationNumber: { type: String, required: true, index: true },
    registrationCouncil: { type: String, default: 'Maharashtra Medical Council (MMC), Mumbai' },
    contactNumber: { type: String },
    rating: { type: Number, default: 4.8 },
    languages: { type: [String], default: ['मराठी', 'English', 'हिंदी'] },
    avatarUrl: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['verified', 'govt_confirmed', 'pending_verification', 'rejected', 'community_reported', 'unverified', 'demo'],
      default: 'verified',
      index: true,
    },
    lastVerifiedAt: { type: String, default: () => new Date().toISOString() },
    dataSource: { type: String, default: 'Maharashtra Medical Council (MMC) Registry & DHS Maharashtra' },
    status: {
      type: String,
      enum: ['available', 'with_patient', 'busy', 'on_break', 'off_duty'],
      default: 'available',
      index: true,
    },
    statusText: { type: String, default: 'Available for Consultations' },
    statusTextMr: { type: String, default: 'तपासणीसाठी उपलब्ध' },
    consultationType: {
      type: String,
      enum: ['In-Person (OPD)', 'Telemedicine (Video)', 'Both In-Person & Telemedicine'],
      default: 'Both In-Person & Telemedicine',
    },
    workingHours: { type: String, default: '09:00 AM - 04:00 PM' },
    telemedicineAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret.id = String(ret.doctorId || ret._id);
        return ret;
      },
    },
  }
);

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);
