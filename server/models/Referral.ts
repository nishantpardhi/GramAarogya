import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  id?: string;
  patientId: string;
  patientName: string;
  referringDoctorId: string;
  referringDoctorName: string;
  fromFacilityName: string;
  targetFacilityId: string;
  targetFacilityName: string;
  targetSpeciality: string;
  reason: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  date: string;
  status: 'Pending' | 'Accepted' | 'Completed';
  mjpjayEligible: boolean;
}

const ReferralSchema = new Schema<IReferral>(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    referringDoctorId: { type: String, required: true },
    referringDoctorName: { type: String, required: true },
    fromFacilityName: { type: String, required: true },
    targetFacilityId: { type: String, required: true, index: true },
    targetFacilityName: { type: String, required: true },
    targetSpeciality: { type: String, required: true },
    reason: { type: String, required: true },
    urgency: {
      type: String,
      enum: ['Routine', 'Urgent', 'Emergency'],
      default: 'Urgent',
    },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed'],
      default: 'Pending',
      index: true,
    },
    mjpjayEligible: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret.id = String(ret._id);
        return ret;
      },
    },
  }
);

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
