import express from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { validateRequest, validateParams } from '../middlewares/validation';
import { Booking } from '../models/Booking';
import { Service } from '../models/Service';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { Availability } from '../models/Availability';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createBookingSchema = Joi.object({
  salonId: Joi.string().required(),
  barberId: Joi.string().required(),
  serviceId: Joi.string().required(),
  timeSlot: Joi.date().required(),
  paymentOption: Joi.string().valid('full', 'deposit', 'cash').required(),
  depositAmount: Joi.number().min(0).optional(),
  notes: Joi.string().max(300).optional(),
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled').required(),
  notes: Joi.string().max(300).optional(),
});

// Create booking
router.post('/', authenticateToken, validateRequest(createBookingSchema), async (req: AuthRequest, res) => {
  try {
    const { salonId, barberId, serviceId, timeSlot, paymentOption, depositAmount, notes } = req.body;
    const clientId = req.user!._id;

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if time slot is available
    const existingBooking = await Booking.findOne({
      barberId,
      timeSlot: new Date(timeSlot),
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    // Calculate amounts
    const amountTotal = service.price;
    const depositPaid = paymentOption === 'deposit' ? (depositAmount || amountTotal * 0.5) : 0;
    const balanceRemaining = amountTotal - depositPaid;

    // Create booking
    const booking = new Booking({
      clientId,
      barberId,
      salonId,
      serviceId,
      date: new Date(timeSlot),
      timeSlot: new Date(timeSlot),
      amountTotal,
      depositPaid,
      balanceRemaining,
      paymentStatus: paymentOption === 'deposit' ? 'partial' : (paymentOption === 'full' ? 'paid' : 'none'),
      paymentMethod: paymentOption === 'cash' ? 'cash' : 'airtel',
      notes,
    });

    await booking.save();

    // Create transaction if deposit is paid
    if (depositPaid > 0) {
      const transaction = new Transaction({
        bookingId: booking._id,
        barberId,
        salonId,
        amount: depositPaid,
        method: paymentOption === 'cash' ? 'cash' : 'airtel',
        status: paymentOption === 'cash' ? 'completed' : 'pending',
      });

      await transaction.save();
    }

    // Create notifications
    const notifications = [
      {
        toUserId: barberId,
        type: 'booking_created',
        payload: {
          bookingId: booking._id,
          message: `New booking from ${req.user!.name}`,
          title: 'New Booking',
        },
      },
      {
        toUserId: clientId,
        type: 'booking_created',
        payload: {
          bookingId: booking._id,
          message: 'Your booking has been created successfully',
          title: 'Booking Confirmed',
        },
      },
    ];

    await Notification.insertMany(notifications);

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('clientId', 'name email phone')
      .populate('barberId', 'name profilePhoto')
      .populate('salonId', 'name address')
      .populate('serviceId', 'title price durationMinutes');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get bookings
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { salonId, barberId, date, status, page = 1, limit = 10 } = req.query;
    const query: any = {};

    // Role-based filtering
    if (req.user!.role === 'client') {
      query.clientId = req.user!._id;
    } else if (req.user!.role === 'barber') {
      query.barberId = req.user!._id;
    } else if (req.user!.role === 'owner') {
      query.salonId = req.user!.salonId;
    }

    // Additional filters
    if (salonId) query.salonId = salonId;
    if (barberId) query.barberId = barberId;
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('clientId', 'name email phone')
      .populate('barberId', 'name profilePhoto')
      .populate('salonId', 'name address')
      .populate('serviceId', 'title price durationMinutes')
      .sort({ timeSlot: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .populate('barberId', 'name profilePhoto')
      .populate('salonId', 'name address')
      .populate('serviceId', 'title price durationMinutes');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    const hasAccess = 
      booking.clientId._id.toString() === req.user!._id.toString() ||
      booking.barberId._id.toString() === req.user!._id.toString() ||
      booking.salonId._id.toString() === req.user!.salonId?.toString() ||
      req.user!.role === 'admin' ||
      req.user!.role === 'superadmin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update booking status
router.patch('/:id/status', authenticateToken, validateRequest(updateBookingStatusSchema), async (req: AuthRequest, res) => {
  try {
    const bookingId = req.params.id;
    const { status, notes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has permission to update this booking
    const canUpdate = 
      booking.barberId.toString() === req.user!._id.toString() ||
      booking.salonId.toString() === req.user!.salonId?.toString() ||
      req.user!.role === 'admin' ||
      req.user!.role === 'superadmin';

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update booking
    const updateData: any = { status };
    if (notes) updateData.notes = notes;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'name email phone')
     .populate('barberId', 'name profilePhoto')
     .populate('salonId', 'name address')
     .populate('serviceId', 'title price durationMinutes');

    // Create notification for status change
    const notification = new Notification({
      toUserId: booking.clientId,
      type: `booking_${status}`,
      payload: {
        bookingId: booking._id,
        message: `Your booking has been ${status}`,
        title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      },
    });

    await notification.save();

    res.json({
      message: `Booking ${status} successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user can cancel this booking
    const canCancel = 
      booking.clientId.toString() === req.user!._id.toString() ||
      booking.barberId.toString() === req.user!._id.toString() ||
      booking.salonId.toString() === req.user!.salonId?.toString() ||
      req.user!.role === 'admin' ||
      req.user!.role === 'superadmin';

    if (!canCancel) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    ).populate('clientId', 'name email phone')
     .populate('barberId', 'name profilePhoto')
     .populate('salonId', 'name address')
     .populate('serviceId', 'title price durationMinutes');

    // Create notification
    const notification = new Notification({
      toUserId: booking.clientId,
      type: 'booking_cancelled',
      payload: {
        bookingId: booking._id,
        message: 'Your booking has been cancelled',
        title: 'Booking Cancelled',
      },
    });

    await notification.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get available time slots for a barber
router.get('/availability/:barberId', async (req, res) => {
  try {
    const { barberId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const selectedDate = new Date(date as string);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Get barber's availability
    const availability = await Availability.findOne({ barberId });
    if (!availability) {
      return res.status(404).json({ message: 'Barber availability not found' });
    }

    // Get existing bookings for the date
    const existingBookings = await Booking.find({
      barberId,
      date: {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ['pending', 'confirmed'] },
    });

    // Get available slots
    const dayAvailability = availability.weeklyAvailability[dayOfWeek as keyof typeof availability.weeklyAvailability];
    const availableSlots: string[] = [];

    dayAvailability.forEach(slot => {
      if (slot.available) {
        const startTime = new Date(selectedDate);
        const [hours, minutes] = slot.start.split(':');
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const endTime = new Date(selectedDate);
        const [endHours, endMinutes] = slot.end.split(':');
        endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

        // Generate 30-minute slots
        const currentTime = new Date(startTime);
        while (currentTime < endTime) {
          const slotTime = new Date(currentTime);
          const isBooked = existingBookings.some(booking => 
            new Date(booking.timeSlot).getTime() === slotTime.getTime()
          );

          if (!isBooked) {
            availableSlots.push(slotTime.toISOString());
          }

          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
      }
    });

    res.json({ availableSlots });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
