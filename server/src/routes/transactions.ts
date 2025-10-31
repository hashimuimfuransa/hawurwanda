import express from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { Transaction } from '../models/Transaction';
import { Booking } from '../models/Booking';
import { Notification } from '../models/Notification';
import StaffEarnings from '../models/StaffEarnings';
import { User } from '../models/User';
import WalkInCustomer from '../models/WalkInCustomer';
import Joi from 'joi';

const router = express.Router();

// Helper function to update staff earnings after payment
const updateStaffEarningsAfterPayment = async (bookingId: string, transactionDate: Date) => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.barberId || booking.status !== 'completed') {
      return;
    }

    const startOfDay = new Date(transactionDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(transactionDate);
    endOfDay.setHours(23, 59, 59, 999);

    const staff = await User.findById(booking.barberId);
    if (!staff) return;

    const completedBookings = await Booking.find({
      barberId: booking.barberId,
      status: 'completed',
      timeSlot: { $gte: startOfDay, $lte: endOfDay },
    }).populate('serviceId', 'title price');

    const completedWalkIns = await WalkInCustomer.find({
      barberId: booking.barberId,
      status: 'completed',
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const commissionRate = 0.7;
    let totalEarnings = 0;
    let bookingEarnings = 0;
    let walkInEarnings = 0;
    const paymentMethodBreakdown = { cash: 0, airtel: 0 };
    const serviceMap = new Map();

    completedBookings.forEach((book: any) => {
      const servicePrice = book.serviceId?.price || 0;
      const earnings = servicePrice * commissionRate;
      bookingEarnings += earnings;
      totalEarnings += earnings;

      if (book.paymentMethod === 'cash') {
        paymentMethodBreakdown.cash += servicePrice;
      } else {
        paymentMethodBreakdown.airtel += servicePrice;
      }

      const serviceId = book.serviceId?._id.toString();
      const serviceName = book.serviceId?.title || 'Unknown Service';
      if (serviceMap.has(serviceId)) {
        const existing = serviceMap.get(serviceId);
        serviceMap.set(serviceId, {
          ...existing,
          count: existing.count + 1,
          totalAmount: existing.totalAmount + servicePrice,
          commission: existing.commission + earnings,
        });
      } else {
        serviceMap.set(serviceId, {
          serviceId: book.serviceId?._id,
          serviceName,
          count: 1,
          totalAmount: servicePrice,
          commission: earnings,
        });
      }
    });

    completedWalkIns.forEach((walkIn: any) => {
      const servicePrice = walkIn.amount || 0;
      const earnings = servicePrice * commissionRate;
      walkInEarnings += earnings;
      totalEarnings += earnings;

      if (walkIn.paymentMethod === 'cash') {
        paymentMethodBreakdown.cash += servicePrice;
      } else {
        paymentMethodBreakdown.airtel += servicePrice;
      }

      const serviceId = walkIn.serviceId?.toString();
      const serviceName = walkIn.serviceName || 'Walk-in Service';
      if (serviceMap.has(serviceId)) {
        const existing = serviceMap.get(serviceId);
        serviceMap.set(serviceId, {
          ...existing,
          count: existing.count + 1,
          totalAmount: existing.totalAmount + servicePrice,
          commission: existing.commission + earnings,
        });
      } else {
        serviceMap.set(serviceId, {
          serviceId: walkIn.serviceId,
          serviceName,
          count: 1,
          totalAmount: servicePrice,
          commission: earnings,
        });
      }
    });

    const services = Array.from(serviceMap.values());

    await StaffEarnings.findOneAndUpdate(
      { staffId: booking.barberId, date: startOfDay },
      {
        staffId: booking.barberId,
        salonId: booking.salonId,
        date: startOfDay,
        totalEarnings,
        commissionRate,
        commissionAmount: totalEarnings,
        bookingEarnings,
        walkInEarnings,
        totalBookings: completedBookings.length,
        totalWalkIns: completedWalkIns.length,
        paymentMethodBreakdown,
        services,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Update staff earnings error:', error);
  }
};

// Validation schemas
const confirmAirtelSchema = Joi.object({
  transactionId: Joi.string().required(),
  status: Joi.string().valid('pending', 'completed', 'failed', 'cancelled').required(),
  airtelTransactionCode: Joi.string().optional(),
});

const manualPaymentSchema = Joi.object({
  bookingId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  method: Joi.string().valid('airtel', 'cash').required(),
  note: Joi.string().max(300).optional(),
});

// Confirm Airtel payment (webhook)
router.post('/airtel/confirm', validateRequest(confirmAirtelSchema), async (req, res) => {
  try {
    const { transactionId, status, airtelTransactionCode } = req.body;

    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction status
    transaction.status = status;
    if (airtelTransactionCode) {
      transaction.airtelTransactionCode = airtelTransactionCode;
    }
    await transaction.save();

    // Update booking payment status
    if (status === 'completed' && transaction.bookingId) {
      const booking = await Booking.findById(transaction.bookingId);
      if (booking) {
        booking.depositPaid = transaction.amount;
        booking.paymentStatus = booking.balanceRemaining > 0 ? 'partial' : 'paid';
        await booking.save();

        // Create notification
        const notification = new Notification({
          toUserId: booking.clientId,
          type: 'payment_received',
          payload: {
            bookingId: booking._id,
            transactionId: transaction._id,
            amount: transaction.amount,
            message: `Payment of ${transaction.amount} RWF received`,
            title: 'Payment Confirmed',
          },
        });

        await notification.save();

        // Update staff earnings if booking is completed
        if (booking.status === 'completed') {
          try {
            await updateStaffEarningsAfterPayment(booking._id.toString(), new Date());
          } catch (earningError) {
            console.error('Failed to update staff earnings:', earningError);
          }
        }
      }
    }

    res.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Manual payment confirmation
router.post('/manual', authenticateToken, validateRequest(manualPaymentSchema), async (req: AuthRequest, res) => {
  try {
    const { bookingId, amount, method, note } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has permission to record payment
    const canRecordPayment = 
      (booking.barberId && booking.barberId.toString() === req.user!._id.toString()) ||
      (booking.salonId && booking.salonId.toString() === req.user!.salonId?.toString()) ||
      req.user!.role === 'admin' ||
      req.user!.role === 'superadmin';

    if (!canRecordPayment) {
      return res.status(403).json({ message: 'Not authorized to record payment for this booking' });
    }

    // Create transaction
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const transaction = new Transaction({
      transactionId,
      bookingId,
      barberId: booking.barberId,
      salonId: booking.salonId,
      amount,
      method,
      status: 'completed',
      notes: note,
    });

    await transaction.save();

    // Update booking
    booking.depositPaid += amount;
    booking.balanceRemaining = booking.amountTotal - booking.depositPaid;
    booking.paymentStatus = booking.balanceRemaining > 0 ? 'partial' : 'paid';
    await booking.save();

    // Create notification
    const notification = new Notification({
      toUserId: booking.clientId,
      type: 'payment_received',
      payload: {
        bookingId: booking._id,
        transactionId: transaction._id,
        amount: transaction.amount,
        message: `Payment of ${transaction.amount} RWF received via ${method}`,
        title: 'Payment Recorded',
      },
    });

    await notification.save();

    // Update staff earnings if booking is completed
    if (booking.status === 'completed') {
      try {
        await updateStaffEarningsAfterPayment(bookingId, new Date());
      } catch (earningError) {
        console.error('Failed to update staff earnings:', earningError);
      }
    }

    res.json({
      message: 'Payment recorded successfully',
      transaction,
    });
  } catch (error) {
    console.error('Manual payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get transactions
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { bookingId, barberId, salonId, status, page = 1, limit = 10 } = req.query;
    const query: any = {};

    // Role-based filtering
    if (['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager'].includes(req.user!.role)) {
      query.barberId = req.user!._id;
    } else if (req.user!.role === 'owner') {
      query.salonId = req.user!.salonId;
    }

    // Additional filters
    if (bookingId) query.bookingId = bookingId;
    if (barberId) query.barberId = barberId;
    if (salonId) query.salonId = salonId;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('bookingId', 'bookingId clientId serviceId')
      .populate('barberId', 'name')
      .populate('salonId', 'name')
      .sort({ timestamp: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('bookingId', 'bookingId clientId serviceId')
      .populate('barberId', 'name')
      .populate('salonId', 'name');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user has access to this transaction
    const hasAccess = 
      transaction.barberId?._id.toString() === req.user!._id.toString() ||
      transaction.salonId?._id.toString() === req.user!.salonId?.toString() ||
      req.user!.role === 'admin' ||
      req.user!.role === 'superadmin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get payment summary for a booking
router.get('/booking/:bookingId/summary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    const hasAccess = 
      booking.clientId.toString() === req.user!._id.toString() ||
      (booking.barberId && booking.barberId.toString() === req.user!._id.toString()) ||
      booking.salonId.toString() === req.user!.salonId?.toString() ||
      req.user!.role === 'admin' ||
      req.user!.role === 'superadmin';

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    const transactions = await Transaction.find({ bookingId })
      .sort({ timestamp: -1 });

    const totalPaid = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      booking: {
        amountTotal: booking.amountTotal,
        depositPaid: booking.depositPaid,
        balanceRemaining: booking.balanceRemaining,
        paymentStatus: booking.paymentStatus,
      },
      transactions,
      totalPaid,
    });
  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
