import mongoose, { Schema, Document } from 'mongoose';

export interface IFacility extends Document {
  id?: string;
  facilityId: string;
  name: string;
  nameMr: string;
  nameHi?: string;
  type: 'PHC' | 'CHC' | 'Sub-Centre' | 'Sub-District Hospital' | 'District Hospital' | 'Government Hospital' | 'Government Medical College';
  classification: string;
  address: string;
  villageOrCity: string;
  taluka: string;
  district: string;
  state: string;
  pinCode: string;
  lat: number;
  lng: number;
  contactNumber: string;
  emergencyNumber: string;
  openHours: string;
  is24x7Emergency: boolean;
  hasAmbulance: boolean;
  hasFreeMedicines: boolean;
  hasBloodStorage: boolean;
  specialistsAvailable: string[];
  services: string[];
  doctorsCount: number;
  bedsTotal: number;
  bedsAvailable: number;
  source: string;
  sourceUrl?: string;
  verificationStatus: string;
}

const FacilitySchema = new Schema<IFacility>(
  {
    facilityId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    nameMr: { type: String, required: true, trim: true },
    nameHi: { type: String, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['PHC', 'CHC', 'Sub-Centre', 'Sub-District Hospital', 'District Hospital', 'Government Hospital', 'Government Medical College'],
      index: true,
    },
    classification: { type: String, default: 'Public / Government' },
    address: { type: String, required: true },
    villageOrCity: { type: String, required: true, index: true },
    taluka: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    state: { type: String, default: 'Maharashtra' },
    pinCode: { type: String, required: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    emergencyNumber: { type: String, default: '108' },
    openHours: { type: String, default: '24x7' },
    is24x7Emergency: { type: Boolean, default: true },
    hasAmbulance: { type: Boolean, default: true },
    hasFreeMedicines: { type: Boolean, default: true },
    hasBloodStorage: { type: Boolean, default: false },
    specialistsAvailable: { type: [String], default: [] },
    services: { type: [String], default: [] },
    doctorsCount: { type: Number, default: 2 },
    bedsTotal: { type: Number, default: 10 },
    bedsAvailable: { type: Number, default: 4 },
    source: { type: String, default: 'DHS Maharashtra / HFR ABDM' },
    sourceUrl: { type: String },
    verificationStatus: { type: String, default: 'verified_government' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret.id = String(ret.facilityId || ret._id);
        return ret;
      },
    },
  }
);

export const Facility = mongoose.model<IFacility>('Facility', FacilitySchema);
