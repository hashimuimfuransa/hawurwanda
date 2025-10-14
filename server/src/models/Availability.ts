import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAvailability extends Document {
  _id: Types.ObjectId;
  barberId: Types.ObjectId;
  salonId: Types.ObjectId;
  weeklyAvailability: {
    monday: { start: string; end: string; available: boolean }[];
    tuesday: { start: string; end: string; available: boolean }[];
    wednesday: { start: string; end: string; available: boolean }[];
    thursday: { start: string; end: string; available: boolean }[];
    friday: { start: string; end: string; available: boolean }[];
    saturday: { start: string; end: string; available: boolean }[];
    sunday: { start: string; end: string; available: boolean }[];
  };
  manuallyBlockedSlots: Date[];
  addedSlots: Date[];
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<IAvailability>({
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
  weeklyAvailability: {
    monday: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      available: { type: Boolean, default: true },
    }],
    tuesday: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      available: { type: Boolean, default: true },
    }],
    wednesday: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      available: { type: Boolean, default: true },
    }],
    thursday: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      available: { type: Boolean, default: true },
    }],
    friday: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      available: { type: Boolean, default: true },
    }],
    saturday: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      available: { type: Boolean, default: true },
    }],
    sunday: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      available: { type: Boolean, default: true },
    }],
  },
  manuallyBlockedSlots: [{
    type: Date,
  }],
  addedSlots: [{
    type: Date,
  }],
}, {
  timestamps: true,
});

// Indexes
availabilitySchema.index({ barberId: 1 });
availabilitySchema.index({ salonId: 1 });
availabilitySchema.index({ barberId: 1, salonId: 1 }, { unique: true });

export const Availability = mongoose.model<IAvailability>('Availability', availabilitySchema);
