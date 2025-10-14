import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISalon extends Document {
  _id: Types.ObjectId;
  name: string;
  address: string;
  province: string;
  district: string;
  sector?: string;
  latitude: number;
  longitude: number;
  ownerId: Types.ObjectId;
  // Owner Information
  ownerIdNumber: string; // National ID or business registration number
  ownerContactPhone: string; // Owner's primary contact
  ownerContactEmail?: string; // Owner's email
  // Business Information
  numberOfEmployees: number; // Total staff count
  serviceCategories: string[]; // Categories of services offered
  customServices?: string; // Custom services description when "other" is selected
  logo?: string;
  coverImages: string[]; // Multiple cover images for showcase
  promotionalVideo?: string; // Optional video URL
  gallery: string[];
  services: Types.ObjectId[];
  barbers: Types.ObjectId[];
  verified: boolean;
  description?: string;
  phone?: string;
  email?: string;
  workingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  createdAt: Date;
  updatedAt: Date;
}

const salonSchema = new Schema<ISalon>({
  name: {
    type: String,
    required: [true, 'Salon name is required'],
    trim: true,
    minlength: [2, 'Salon name must be at least 2 characters'],
    maxlength: [100, 'Salon name cannot exceed 100 characters'],
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters'],
  },
  province: {
    type: String,
    required: [true, 'Province is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  sector: {
    type: String,
    trim: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Invalid latitude'],
    max: [90, 'Invalid latitude'],
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Invalid longitude'],
    max: [180, 'Invalid longitude'],
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
  },
  ownerIdNumber: {
    type: String,
    required: [true, 'Owner ID number is required'],
    trim: true,
    minlength: [10, 'ID number must be at least 10 characters'],
    maxlength: [20, 'ID number cannot exceed 20 characters'],
  },
  ownerContactPhone: {
    type: String,
    required: [true, 'Owner contact phone is required'],
    match: [/^(\+250|250|0)?[0-9]{9}$/, 'Please enter a valid Rwandan phone number'],
  },
  ownerContactEmail: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  numberOfEmployees: {
    type: Number,
    required: [true, 'Number of employees is required'],
    min: [1, 'Must have at least 1 employee'],
    max: [1000, 'Number of employees cannot exceed 1000'],
  },
  serviceCategories: [{
    type: String,
    enum: ['haircut', 'styling', 'coloring', 'treatment', 'beard', 'massage', 'other'],
  }],
  customServices: {
    type: String,
    maxlength: [500, 'Custom services description cannot exceed 500 characters'],
  },
  logo: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid logo URL format',
    },
  },
  coverImages: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid cover image URL format',
    },
  }],
  promotionalVideo: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(mp4|webm|mov)$/i.test(v);
      },
      message: 'Invalid video URL format (must be mp4, webm, or mov)',
    },
  },
  gallery: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL format',
    },
  }],
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
  }],
  barbers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  verified: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  phone: {
    type: String,
    match: [/^(\+250|250|0)?[0-9]{9}$/, 'Please enter a valid Rwandan phone number'],
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  workingHours: {
    monday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false },
    },
    tuesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false },
    },
    wednesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false },
    },
    thursday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false },
    },
    friday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false },
    },
    saturday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false },
    },
    sunday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false },
    },
  },
}, {
  timestamps: true,
});

// Indexes
salonSchema.index({ name: 'text', address: 'text', district: 'text' });
salonSchema.index({ district: 1 });
salonSchema.index({ verified: 1 });
salonSchema.index({ ownerId: 1 });
salonSchema.index({ latitude: 1, longitude: 1 });

export const Salon = mongoose.model<ISalon>('Salon', salonSchema);
