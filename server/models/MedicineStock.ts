import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicineStock extends Document {
  id?: string;
  medicineId: string;
  name: string;
  genericName: string;
  category: 'Antibiotic' | 'Analgesic' | 'Diabetes' | 'Hypertension' | 'Maternal/Child' | 'Emergency' | 'Respiratory';
  facilityId: string;
  facilityName: string;
  facilityNameMr: string;
  district: string;
  availableQuantity: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  price: string;
  requiresPrescription: boolean;
  batchNumber?: string;
  expiryDate?: string;
}

const MedicineStockSchema = new Schema<IMedicineStock>(
  {
    medicineId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    genericName: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Antibiotic', 'Analgesic', 'Diabetes', 'Hypertension', 'Maternal/Child', 'Emergency', 'Respiratory'],
      index: true,
    },
    facilityId: { type: String, required: true, index: true },
    facilityName: { type: String, required: true },
    facilityNameMr: { type: String, required: true },
    district: { type: String, required: true, index: true },
    availableQuantity: { type: Number, required: true },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
      index: true,
    },
    price: { type: String, default: 'Free (Government Scheme)' },
    requiresPrescription: { type: Boolean, default: false },
    batchNumber: { type: String },
    expiryDate: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret.id = String(ret.medicineId || ret._id);
        return ret;
      },
    },
  }
);

export const MedicineStock = mongoose.model<IMedicineStock>('MedicineStock', MedicineStockSchema);
