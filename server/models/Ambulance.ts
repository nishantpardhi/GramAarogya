import mongoose, { Schema, Document } from 'mongoose';

export interface IAmbulance extends Document {
  id?: string;
  ambulanceId: string;
  vehicleNumber: string;
  type: string;
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

const AmbulanceSchema = new Schema<IAmbulance>(
  {
    ambulanceId: { type: String, required: true, unique: true, index: true },
    vehicleNumber: { type: String, required: true, index: true },
    type: { type: String, default: 'Advanced Life Support (ALS)' },
    driverId: { type: String, required: true },
    driverName: { type: String, required: true },
    driverContact: { type: String, required: true },
    facilityId: { type: String, required: true },
    facilityName: { type: String, required: true },
    currentLat: { type: Number, required: true },
    currentLng: { type: Number, required: true },
    availability: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
      index: true,
    },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret.id = String(ret.ambulanceId || ret._id);
        return ret;
      },
    },
  }
);

export const Ambulance = mongoose.model<IAmbulance>('Ambulance', AmbulanceSchema);
