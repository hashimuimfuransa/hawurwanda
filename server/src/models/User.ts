import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  nationalId?: string;
  passwordHash: string;
  role: 'client' | 'barber' | 'hairstylist' | 'nail_technician' | 'massage_therapist' | 'esthetician' | 'receptionist' | 'manager' | 'owner' | 'admin' | 'superadmin';
  salonId?: Types.ObjectId;
  profilePhoto?: string;
  isVerified: boolean;
  // Enhanced staff information
  staffCategory?: 'barber' | 'hairstylist' | 'nail_technician' | 'massage_therapist' | 'esthetician' | 'receptionist' | 'manager' | 'other';
  specialties?: string[];
  experience?: string; // Years of experience
  bio?: string;
  credentials?: string[]; // Array of certifications/credentials
  assignedServices?: Types.ObjectId[]; // Array of service IDs assigned to this staff member
  workSchedule?: {
    monday?: { start: string; end: string; available: boolean };
    tuesday?: { start: string; end: string; available: boolean };
    wednesday?: { start: string; end: string; available: boolean };
    thursday?: { start: string; end: string; available: boolean };
    friday?: { start: string; end: string; available: boolean };
    saturday?: { start: string; end: string; available: boolean };
    sunday?: { start: string; end: string; available: boolean };
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^(\+250|250|0)?[0-9]{9}$/, 'Please enter a valid Rwandan phone number'],
  },
  nationalId: {
    type: String,
    required: false,
    trim: true,
    match: [/^[0-9]{16}$/, 'Please enter a valid 16-digit national ID'],
    sparse: true, // Allows multiple null values but enforces uniqueness for non-null values
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  role: {
    type: String,
    enum: ['client', 'barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager', 'owner', 'admin', 'superadmin'],
    default: 'client',
  },
  salonId: {
    type: Schema.Types.ObjectId,
    ref: 'Salon',
    required: false, // Optional - will be assigned later
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  // Enhanced staff information
  staffCategory: {
    type: String,
    enum: ['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager', 'other'],
    required: false,
  },
  specialties: [{
    type: String,
    trim: true,
  }],
  experience: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true,
  },
  credentials: [{
    type: String,
    trim: true,
  }],
  assignedServices: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
  }],
  workSchedule: {
    monday: {
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      available: { type: Boolean, default: false },
    },
    tuesday: {
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      available: { type: Boolean, default: false },
    },
    wednesday: {
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      available: { type: Boolean, default: false },
    },
    thursday: {
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      available: { type: Boolean, default: false },
    },
    friday: {
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      available: { type: Boolean, default: false },
    },
    saturday: {
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      available: { type: Boolean, default: false },
    },
    sunday: {
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      available: { type: Boolean, default: false },
    },
  },
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ salonId: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
