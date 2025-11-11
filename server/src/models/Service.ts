import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IService extends Document {
  _id: Types.ObjectId;
  salonId: Types.ObjectId;
  title: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category: string;
  targetAudience: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>({
  salonId: {
    type: Schema.Types.ObjectId,
    ref: 'Salon',
    required: [true, 'Salon ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    minlength: [2, 'Service title must be at least 2 characters'],
    maxlength: [100, 'Service title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    maxlength: [300, 'Description cannot exceed 300 characters'],
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [5, 'Duration must be at least 5 minutes'],
    max: [480, 'Duration cannot exceed 8 hours'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['haircut', 'styling', 'coloring', 'treatment', 'beard', 'nails', 'skincare', 'massage', 'makeup', 'other'],
    default: 'other',
  },
  targetAudience: {
    type: [String],
    required: [true, 'Target audience is required'],
    enum: ['children', 'teens', 'adults', 'men', 'women'],
    validate: {
      validator: function(v: string[]) {
        return v && v.length > 0;
      },
      message: 'At least one target audience must be selected'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
serviceSchema.index({ salonId: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });

export const Service = mongoose.model<IService>('Service', serviceSchema);
