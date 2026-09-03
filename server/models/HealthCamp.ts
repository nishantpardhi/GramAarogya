import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthCamp extends Document {
  id?: string;
  campId: string;
  title: string;
  titleMr: string;
  titleHi?: string;
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

const HealthCampSchema = new Schema<IHealthCamp>(
  {
    campId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    titleMr: { type: String, required: true },
    titleHi: { type: String },
    organizingFacility: { type: String, required: true },
    taluka: { type: String, required: true, index: true },
    village: { type: String, required: true },
    district: { type: String, required: true, index: true },
    venueAddress: { type: String, required: true },
    date: { type: String, required: true, index: true },
    time: { type: String, required: true },
    servicesProvided: { type: [String], default: [] },
    specialistDoctors: { type: [String], default: [] },
    totalSlots: { type: Number, default: 100 },
    registeredCount: { type: Number, default: 0 },
    isFreeCamp: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
      index: true,
    },
    contactPerson: { type: String, required: true },
    contactNumber: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret.id = String(ret.campId || ret._id);
        return ret;
      },
    },
  }
);

export const HealthCamp = mongoose.model<IHealthCamp>('HealthCamp', HealthCampSchema);
