import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthRecord extends Document {
  id?: string;
  patientId: string;
  title: string;
  titleMr?: string;
  category: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Vaccination' | 'Doctor Note';
  facilityName: string;
  doctorName?: string;
  date: string;
  summary: string;
  fileType: 'PDF' | 'Image' | 'Digital';
  fileName: string;
  fileUrl?: string;
  tags: string[];
}

const HealthRecordSchema = new Schema<IHealthRecord>(
  {
    patientId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    titleMr: { type: String },
    category: {
      type: String,
      required: true,
      enum: ['Prescription', 'Lab Report', 'Discharge Summary', 'Vaccination', 'Doctor Note'],
      index: true,
    },
    facilityName: { type: String, required: true },
    doctorName: { type: String },
    date: { type: String, required: true },
    summary: { type: String, required: true },
    fileType: { type: String, enum: ['PDF', 'Image', 'Digital'], default: 'Digital' },
    fileName: { type: String, required: true },
    fileUrl: { type: String },
    tags: { type: [String], default: [] },
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

export const HealthRecord = mongoose.model<IHealthRecord>('HealthRecord', HealthRecordSchema);
