import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  transactionId: string;
  bookingId?: Types.ObjectId;
  barberId?: Types.ObjectId;
  salonId?: Types.ObjectId;
  amount: number;
  method: 'airtel' | 'cash';
  airtelTransactionCode?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
  },
  barberId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  salonId: {
    type: Schema.Types.ObjectId,
    ref: 'Salon',
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  method: {
    type: String,
    enum: ['airtel', 'cash'],
    required: [true, 'Payment method is required'],
  },
  airtelTransactionCode: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot exceed 300 characters'],
  },
}, {
  timestamps: true,
});

// Indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ barberId: 1 });
transactionSchema.index({ salonId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ timestamp: 1 });

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
