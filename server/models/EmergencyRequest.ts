import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyRequest extends Document {
  id?: string;
  patientId: string;
  patientName: string;
  contactNumber: string;
  emergencyType: 'Cardiac' | 'Accident / Trauma' | 'Maternal / Labor' | 'Snake Bite' | 'Respiratory / Stroke' | 'High Fever' | 'Critical SOS';
  locationAddress: string;
  village: string;
  district: string;
  lat: number;
  lng: number;
  status: 'REQUESTED' | 'DISPATCHING' | 'AMBULANCE_ASSIGNED' | 'EN_ROUTE_PATIENT' | 'PATIENT_PICKED_UP' | 'EN_ROUTE_HOSPITAL' | 'ARRIVED_AT_HOSPITAL' | 'RESOLVED' | 'CANCELLED';
  ambulanceId?: string;
  vehicleNumber?: string;
  driverId?: string;
  driverName?: string;
  driverMobile?: string;
  etaMinutes?: number;
  assignedHospitalId?: string;
  assignedHospital?: string;
  assignedHospitalNameMr?: string;
  requiredFacilityCapability?: string;
  dispatchNotes?: string;
  hospitalNotified: boolean;
}

const EmergencyRequestSchema = new Schema<IEmergencyRequest>(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    emergencyType: {
      type: String,
      required: true,
      enum: ['Cardiac', 'Accident / Trauma', 'Maternal / Labor', 'Snake Bite', 'Respiratory / Stroke', 'High Fever', 'Critical SOS'],
      index: true,
    },
    locationAddress: { type: String, required: true },
    village: { type: String, default: 'Ramtek' },
    district: { type: String, default: 'Nagpur' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'DISPATCHING',
        'AMBULANCE_ASSIGNED',
        'EN_ROUTE_PATIENT',
        'PATIENT_PICKED_UP',
        'EN_ROUTE_HOSPITAL',
        'ARRIVED_AT_HOSPITAL',
        'RESOLVED',
        'CANCELLED',
      ],
      default: 'DISPATCHING',
      index: true,
    },
    ambulanceId: { type: String, default: 'amb-108-1' },
    vehicleNumber: { type: String, default: 'MH-40-AZ-1081' },
    driverId: { type: String, default: 'drv-1' },
    driverName: { type: String, default: 'Sanjay Shinde (संजय शिंदे)' },
    driverMobile: { type: String, default: '+91 98221 08108' },
    etaMinutes: { type: Number, default: 11 },
    assignedHospitalId: { type: String },
    assignedHospital: { type: String, default: 'Sub-District Hospital Ramtek' },
    assignedHospitalNameMr: { type: String, default: 'उपजिल्हा रुग्णालय रामटेक' },
    requiredFacilityCapability: { type: String, default: '24x7 Emergency, Anti-Snake Venom & Trauma Care' },
    dispatchNotes: { type: String },
    hospitalNotified: { type: Boolean, default: true },
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

export const EmergencyRequest = mongoose.model<IEmergencyRequest>('EmergencyRequest', EmergencyRequestSchema);
