import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  toUserId: Types.ObjectId;
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'booking_completed' | 'payment_received' | 'payment_required' | 'salon_verified' | 'salon_rejected' | 'salon_pending';
  payload: {
    bookingId?: Types.ObjectId;
    transactionId?: Types.ObjectId;
    salonId?: Types.ObjectId;
    amount?: number;
    message: string;
    title: string;
  };
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  toUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  type: {
    type: String,
    enum: [
      'booking_created',
      'booking_confirmed',
      'booking_cancelled',
      'booking_completed',
      'payment_received',
      'payment_required',
      'salon_verified',
      'salon_rejected',
      'salon_pending',
    ],
    required: [true, 'Notification type is required'],
  },
  payload: {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    salonId: {
      type: Schema.Types.ObjectId,
      ref: 'Salon',
    },
    amount: {
      type: Number,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ toUserId: 1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ toUserId: 1, read: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
