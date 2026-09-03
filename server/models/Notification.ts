import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  id?: string;
  userId: string;
  recipientRole?: 'patient' | 'doctor' | 'admin' | 'all';
  title: string;
  titleMr?: string;
  titleHi?: string;
  message: string;
  messageMr?: string;
  messageHi?: string;
  type: 'appointment' | 'telemedicine' | 'system' | 'emergency' | 'prescription' | 'camp';
  appointmentId?: string;
  tokenNumber?: string;
  roomId?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    recipientRole: {
      type: String,
      enum: ['patient', 'doctor', 'admin', 'all'],
      default: 'all',
    },
    title: { type: String, required: true },
    titleMr: { type: String },
    titleHi: { type: String },
    message: { type: String, required: true },
    messageMr: { type: String },
    messageHi: { type: String },
    type: {
      type: String,
      enum: ['appointment', 'telemedicine', 'system', 'emergency', 'prescription', 'camp'],
      default: 'system',
      index: true,
    },
    appointmentId: { type: String },
    tokenNumber: { type: String },
    roomId: { type: String },
    actionUrl: { type: String },
    isRead: { type: Boolean, default: false, index: true },
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

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
