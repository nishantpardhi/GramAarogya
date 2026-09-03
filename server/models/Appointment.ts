import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  id?: string;
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
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'Telemedicine_Suggested' | 'Telemedicine_Accepted';
  doctorNotes?: string;
  telemedicineRoomId?: string;
  telemedicineLink?: string;
  telemedicineNotes?: string;
  telemedicineSuggestedBy?: string;
  priority: 'Regular' | 'High' | 'Emergency';
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    tokenNumber: { type: String, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, required: true },
    patientVillage: { type: String, default: 'Ramtek' },
    patientDistrict: { type: String, default: 'Nagpur' },
    patientMobile: { type: String, required: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    doctorSpecialization: { type: String, required: true },
    facilityId: { type: String, required: true, index: true },
    facilityName: { type: String, required: true },
    facilityNameMr: { type: String },
    department: { type: String, default: 'General OPD' },
    date: { type: String, required: true, index: true },
    timeSlot: { type: String, required: true },
    consultationType: {
      type: String,
      enum: ['In-Person (OPD)', 'Telemedicine (Video)', 'Health Camp'],
      default: 'In-Person (OPD)',
    },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'Telemedicine_Suggested', 'Telemedicine_Accepted'],
      default: 'Confirmed',
      index: true,
    },
    doctorNotes: { type: String },
    telemedicineRoomId: { type: String },
    telemedicineLink: { type: String },
    telemedicineNotes: { type: String },
    telemedicineSuggestedBy: { type: String },
    priority: {
      type: String,
      enum: ['Regular', 'High', 'Emergency'],
      default: 'Regular',
    },
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

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
