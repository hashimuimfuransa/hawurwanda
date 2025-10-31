import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWalkInCustomer extends Document {
  _id: Types.ObjectId;
  walkInId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  barberId: Types.ObjectId;
  salonId: Types.ObjectId;
  serviceId: Types.ObjectId;
  serviceName: string;
  amount: number;
  paymentMethod: 'cash' | 'airtel';
  paymentStatus: 'pending' | 'paid';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const walkInCustomerSchema = new Schema<IWalkInCustomer>({
  walkInId: {
    type: String,
    required: [true, 'Walk-in ID is required'],
    unique: true,
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    minlength: [2, 'Client name must be at least 2 characters'],
    maxlength: [50, 'Client name cannot exceed 50 characters'],
  },
  clientPhone: {
    type: String,
    required: [true, 'Client phone is required'],
    trim: true,
    match: [/^(\+250|250|0)?[0-9]{9}$/, 'Please enter a valid Rwandan phone number'],
  },
  clientEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
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
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'airtel'],
    required: [true, 'Payment method is required'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot exceed 300 characters'],
    trim: true,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
walkInCustomerSchema.index({ walkInId: 1 });
walkInCustomerSchema.index({ barberId: 1 });
walkInCustomerSchema.index({ salonId: 1 });
walkInCustomerSchema.index({ createdAt: -1 });

// Generate walk-in ID before validation so required rule passes
walkInCustomerSchema.pre('validate', async function(next) {
  if (!this.walkInId) {
    const count = await mongoose.model('WalkInCustomer').countDocuments();
    this.walkInId = `WI${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model<IWalkInCustomer>('WalkInCustomer', walkInCustomerSchema);
