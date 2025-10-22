import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStaffEarnings extends Document {
  _id: Types.ObjectId;
  staffId: Types.ObjectId;
  salonId: Types.ObjectId;
  date: Date;
  totalEarnings: number;
  commissionRate: number;
  commissionAmount: number;
  bookingEarnings: number;
  walkInEarnings: number;
  totalBookings: number;
  totalWalkIns: number;
  paymentMethodBreakdown: {
    cash: number;
    airtel: number;
  };
  services: Array<{
    serviceId: Types.ObjectId;
    serviceName: string;
    count: number;
    totalAmount: number;
    commission: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const staffEarningsSchema = new Schema<IStaffEarnings>({
  staffId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Staff ID is required'],
  },
  salonId: {
    type: Schema.Types.ObjectId,
    ref: 'Salon',
    required: [true, 'Salon ID is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  totalEarnings: {
    type: Number,
    required: [true, 'Total earnings is required'],
    min: [0, 'Total earnings cannot be negative'],
  },
  commissionRate: {
    type: Number,
    required: [true, 'Commission rate is required'],
    min: [0, 'Commission rate cannot be negative'],
    max: [1, 'Commission rate cannot exceed 100%'],
  },
  commissionAmount: {
    type: Number,
    required: [true, 'Commission amount is required'],
    min: [0, 'Commission amount cannot be negative'],
  },
  bookingEarnings: {
    type: Number,
    default: 0,
    min: [0, 'Booking earnings cannot be negative'],
  },
  walkInEarnings: {
    type: Number,
    default: 0,
    min: [0, 'Walk-in earnings cannot be negative'],
  },
  totalBookings: {
    type: Number,
    default: 0,
    min: [0, 'Total bookings cannot be negative'],
  },
  totalWalkIns: {
    type: Number,
    default: 0,
    min: [0, 'Total walk-ins cannot be negative'],
  },
  paymentMethodBreakdown: {
    cash: {
      type: Number,
      default: 0,
      min: [0, 'Cash amount cannot be negative'],
    },
    airtel: {
      type: Number,
      default: 0,
      min: [0, 'Airtel amount cannot be negative'],
    },
  },
  services: [{
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      required: true,
      min: [0, 'Service count cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Service total amount cannot be negative'],
    },
    commission: {
      type: Number,
      required: true,
      min: [0, 'Service commission cannot be negative'],
    },
  }],
}, {
  timestamps: true,
});

// Indexes
staffEarningsSchema.index({ staffId: 1, date: -1 });
staffEarningsSchema.index({ salonId: 1, date: -1 });
staffEarningsSchema.index({ date: -1 });

// Compound index for unique daily earnings per staff
staffEarningsSchema.index({ staffId: 1, date: 1 }, { unique: true });

export default mongoose.model<IStaffEarnings>('StaffEarnings', staffEarningsSchema);
