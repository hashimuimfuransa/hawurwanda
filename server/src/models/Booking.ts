import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  _id: Types.ObjectId;
  bookingId: string;
  clientId: Types.ObjectId;
  barberId: Types.ObjectId;
  salonId: Types.ObjectId;
  serviceId: Types.ObjectId;
  date: Date;
  timeSlot: Date;
  amountTotal: number;
  depositPaid: number;
  balanceRemaining: number;
  paymentStatus: 'none' | 'partial' | 'paid';
  paymentMethod: 'airtel' | 'cash';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  bookingId: {
    type: String,
    required: [true, 'Booking ID is required'],
    unique: true,
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client ID is required'],
  },
  barberId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Barber ID is required'],
  },
  salonId: {
    type: Schema.Types.ObjectId,
    ref: 'Salon',
    required: [true, 'Salon ID is required'],
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required'],
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
  },
  timeSlot: {
    type: Date,
    required: [true, 'Time slot is required'],
  },
  amountTotal: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  depositPaid: {
    type: Number,
    default: 0,
    min: [0, 'Deposit cannot be negative'],
  },
  balanceRemaining: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative'],
  },
  paymentStatus: {
    type: String,
    enum: ['none', 'partial', 'paid'],
    default: 'none',
  },
  paymentMethod: {
    type: String,
    enum: ['airtel', 'cash'],
    required: [true, 'Payment method is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot exceed 300 characters'],
  },
}, {
  timestamps: true,
});

// Indexes
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ clientId: 1 });
bookingSchema.index({ barberId: 1 });
bookingSchema.index({ salonId: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ timeSlot: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ barberId: 1, timeSlot: 1 }, { unique: true });

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
