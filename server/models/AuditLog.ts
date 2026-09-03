import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  id?: string;
  timestamp: string;
  action: string;
  source: string;
  endpoint: string;
  status: 'SUCCESS' | 'UNAVAILABLE' | 'UNAUTHORIZED' | 'FAILED';
  details: string;
  actor: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: { type: String, default: () => new Date().toISOString() },
    action: { type: String, required: true, index: true },
    source: { type: String, default: 'GramAarogya Node/Express Core' },
    endpoint: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUCCESS', 'UNAVAILABLE', 'UNAUTHORIZED', 'FAILED'],
      default: 'SUCCESS',
      index: true,
    },
    details: { type: String, required: true },
    actor: { type: String, default: 'System' },
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

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
