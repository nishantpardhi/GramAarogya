import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  id?: string;
  name: string;
  nameMr?: string;
  nameHi?: string;
  email?: string;
  mobile: string;
  password?: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
  preferredLanguage?: 'mr' | 'hi' | 'en';
  
  // Verification flags
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  isProfileClaimed?: boolean;

  // OTP Fields for phone auth
  phoneOtp?: string;
  otpExpiresAt?: Date;

  // Patient Fields
  abhaId?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  place?: string;
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

  // Doctor Fields (Linked to Doctor public directory record)
  linkedDoctorId?: string;
  qualification?: string;
  specialization?: string;
  specializationMr?: string;
  department?: string;
  experienceYears?: number;
  registrationNumber?: string;
  registrationCouncil?: string;
  availableHours?: string;
  isOnlineForTelemedicine?: boolean;
  facilityId?: string;
  facilityName?: string;
  verificationStatus?: 'verified' | 'pending_verification' | 'rejected' | 'demo';

  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    nameMr: { type: String, trim: true },
    nameHi: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, sparse: true },
    mobile: { type: String, required: true, trim: true, index: true },
    password: { type: String },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
      required: true,
      index: true,
    },
    avatar: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    preferredLanguage: { type: String, enum: ['mr', 'hi', 'en'], default: 'mr' },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isProfileClaimed: { type: Boolean, default: false },

    // OTP verification
    phoneOtp: { type: String },
    otpExpiresAt: { type: Date },

    // Patient profile
    abhaId: { type: String, trim: true },
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dob: { type: String },
    dateOfBirth: { type: String },
    bloodGroup: { type: String },
    place: { type: String, default: 'Ramtek' },
    village: { type: String, default: 'Ramtek' },
    taluka: { type: String, default: 'Ramtek' },
    district: { type: String, default: 'Nagpur' },
    pinCode: { type: String, default: '441106' },
    address: { type: String },
    emergencyContact: { type: String },
    emergencyContactName: { type: String },
    emergencyContactMobile: { type: String },
    allergies: { type: [String], default: [] },
    chronicConditions: { type: [String], default: [] },

    // Doctor profile & linking to public directory
    linkedDoctorId: { type: String, index: true },
    qualification: { type: String },
    specialization: { type: String },
    specializationMr: { type: String },
    department: { type: String },
    experienceYears: { type: Number, default: 1 },
    registrationNumber: { type: String },
    registrationCouncil: { type: String, default: 'Maharashtra Medical Council (MMC), Mumbai' },
    availableHours: { type: String, default: '09:00 AM - 04:00 PM' },
    isOnlineForTelemedicine: { type: Boolean, default: true },
    facilityId: { type: String },
    facilityName: { type: String },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending_verification', 'rejected', 'demo'],
      default: 'verified',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        delete ret.password;
        delete ret.phoneOtp;
        delete ret.otpExpiresAt;
        ret.id = String(ret._id);
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
UserSchema.pre('save', async function (next: any) {
  const doc = this as any;
  if (!doc.isModified('password') || !doc.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    doc.password = await bcrypt.hash(doc.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const doc = this as any;
  if (!doc.password) return false;
  return bcrypt.compare(candidatePassword, doc.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
