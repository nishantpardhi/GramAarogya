import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  isAvailableAtPHC: boolean;
}

export interface IPrescription extends Document {
  id?: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  facilityName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  medicines: IPrescriptionMedicine[];
  advice: string;
  followUpDate?: string;
  signedDigitally: boolean;
}

const PrescriptionMedicineSchema = new Schema<IPrescriptionMedicine>(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String, default: 'After meals' },
    isAvailableAtPHC: { type: Boolean, default: true },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescription>(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number, required: true },
    patientGender: { type: String, required: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    doctorSpecialization: { type: String, required: true },
    facilityName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    diagnosis: { type: String, required: true },
    symptoms: { type: [String], default: [] },
    medicines: { type: [PrescriptionMedicineSchema], required: true },
    advice: { type: String, default: '' },
    followUpDate: { type: String },
    signedDigitally: { type: Boolean, default: true },
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

export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);
