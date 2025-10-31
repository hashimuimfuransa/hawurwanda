import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import WalkInCustomer from '../models/WalkInCustomer';
import { Service } from '../models/Service';
import { User } from '../models/User';
import StaffEarnings from '../models/StaffEarnings';
import { Booking } from '../models/Booking';
import Joi from 'joi';
import { AuthRequest } from '../middlewares/auth';

const router = express.Router();

const updateStaffEarningsForWalkIn = async (staffId: string, referenceDate: Date) => {
  const startOfDay = new Date(referenceDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(referenceDate);
  endOfDay.setHours(23, 59, 59, 999);

  const staff = await User.findById(staffId);
  if (!staff) return;

  const completedBookings = await Booking.find({
    barberId: staffId,
    status: 'completed',
    timeSlot: { $gte: startOfDay, $lte: endOfDay },
  }).populate('serviceId', 'title price');

  const completedWalkIns = await WalkInCustomer.find({
    barberId: staffId,
    status: 'completed',
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const commissionRate = 0.7;
  let totalEarnings = 0;
  let bookingEarnings = 0;
  let walkInEarnings = 0;
  const paymentMethodBreakdown = { cash: 0, airtel: 0 };
  const serviceMap = new Map();

  completedBookings.forEach((booking: any) => {
    const servicePrice = booking.serviceId?.price || 0;
    const earnings = servicePrice * commissionRate;
    bookingEarnings += earnings;
    totalEarnings += earnings;

    if (booking.paymentMethod === 'cash') {
      paymentMethodBreakdown.cash += servicePrice;
    } else {
      paymentMethodBreakdown.airtel += servicePrice;
    }

    const serviceId = booking.serviceId?._id.toString();
    const serviceName = booking.serviceId?.title || 'Unknown Service';
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
        serviceId: booking.serviceId?._id,
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
    { staffId, date: startOfDay },
    {
      staffId,
      salonId: staff.salonId,
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
    { upsert: true, new: true },
  );
};

// Validation schemas
const createWalkInSchema = Joi.object({
  clientName: Joi.string().min(2).max(50).required(),
  clientPhone: Joi.string().pattern(/^(\+250|250|0)?[0-9]{9}$/).required(),
  clientEmail: Joi.string().email().optional(),
  serviceId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('cash', 'airtel').required(),
  notes: Joi.string().max(300).optional(),
});

const updateWalkInSchema = Joi.object({
  status: Joi.string().valid('pending', 'completed', 'cancelled').optional(),
  paymentStatus: Joi.string().valid('pending', 'paid').optional(),
  notes: Joi.string().max(300).optional(),
});

// Create walk-in customer
router.post('/', authenticateToken, validateRequest(createWalkInSchema), async (req: AuthRequest, res) => {
  try {
    const { clientName, clientPhone, clientEmail, serviceId, amount, paymentMethod, notes } = req.body;

    // Verify user is staff
    if (!['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager', 'owner', 'admin', 'superadmin'].includes(req.user!.role)) {
      return res.status(403).json({ message: 'Only staff members can create walk-in customers' });
    }

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Create walk-in customer
    const walkInCustomer = new WalkInCustomer({
      clientName,
      clientPhone,
      clientEmail,
      barberId: req.user!._id,
      salonId: req.user!.salonId,
      serviceId,
      serviceName: service.title,
      amount,
      paymentMethod,
      notes,
      paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending',
    });

    await walkInCustomer.save();

    // Populate the created walk-in customer
    await walkInCustomer.populate([
      { path: 'barberId', select: 'name email phone' },
      { path: 'salonId', select: 'name address' },
      { path: 'serviceId', select: 'name price duration' },
    ]);

    res.status(201).json({
      message: 'Walk-in customer created successfully',
      walkInCustomer,
    });
  } catch (error) {
    console.error('Create walk-in customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get walk-in customers for staff
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, date } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter: any = { barberId: req.user!._id };
    
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const walkInCustomers = await WalkInCustomer.find(filter)
      .populate('barberId', 'name email phone')
      .populate('salonId', 'name address')
      .populate('serviceId', 'title price durationMinutes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await WalkInCustomer.countDocuments(filter);

    res.json({
      walkInCustomers,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get walk-in customers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get walk-in customer by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const walkInCustomer = await WalkInCustomer.findById(req.params.id)
      .populate('barberId', 'name email phone')
      .populate('salonId', 'name address')
      .populate('serviceId', 'title price durationMinutes');

    if (!walkInCustomer) {
      return res.status(404).json({ message: 'Walk-in customer not found' });
    }

    // Check if user has permission to view this walk-in customer
    if (walkInCustomer.barberId._id.toString() !== req.user!._id.toString() && 
        req.user!.role !== 'admin' && 
        req.user!.role !== 'superadmin' &&
        walkInCustomer.salonId._id.toString() !== req.user!.salonId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this walk-in customer' });
    }

    res.json({ walkInCustomer });
  } catch (error) {
    console.error('Get walk-in customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update walk-in customer
router.patch('/:id', authenticateToken, validateRequest(updateWalkInSchema), async (req: AuthRequest, res) => {
  try {
    const { status, paymentStatus, notes } = req.body;

    const walkInCustomer = await WalkInCustomer.findById(req.params.id);
    if (!walkInCustomer) {
      return res.status(404).json({ message: 'Walk-in customer not found' });
    }

    // Check if user has permission to update this walk-in customer
    if (walkInCustomer.barberId.toString() !== req.user!._id.toString() && 
        req.user!.role !== 'admin' && 
        req.user!.role !== 'superadmin' &&
        walkInCustomer.salonId.toString() !== req.user!.salonId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this walk-in customer' });
    }

    // Update fields
    if (status) walkInCustomer.status = status;
    if (paymentStatus) walkInCustomer.paymentStatus = paymentStatus;
    if (notes !== undefined) walkInCustomer.notes = notes;

    // Set completedAt if status is being changed to completed
    if (status === 'completed' && walkInCustomer.status !== 'completed') {
      walkInCustomer.completedAt = new Date();
    }

    await walkInCustomer.save();

    // Populate the updated walk-in customer
    await walkInCustomer.populate([
      { path: 'barberId', select: 'name email phone' },
      { path: 'salonId', select: 'name address' },
      { path: 'serviceId', select: 'name price duration' },
    ]);

    res.json({
      message: 'Walk-in customer updated successfully',
      walkInCustomer,
    });
  } catch (error) {
    console.error('Update walk-in customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete walk-in customer
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const walkInCustomer = await WalkInCustomer.findById(req.params.id);
    if (!walkInCustomer) {
      return res.status(404).json({ message: 'Walk-in customer not found' });
    }

    // Check if user has permission to delete this walk-in customer
    if (walkInCustomer.barberId.toString() !== req.user!._id.toString() && 
        req.user!.role !== 'admin' && 
        req.user!.role !== 'superadmin' &&
        walkInCustomer.salonId.toString() !== req.user!.salonId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this walk-in customer' });
    }

    await WalkInCustomer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Walk-in customer deleted successfully' });
  } catch (error) {
    console.error('Delete walk-in customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get walk-in customers for salon (owner/admin view)
router.get('/salon/all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if user has permission to view all walk-in customers
    if (!['owner', 'admin', 'superadmin'].includes(req.user!.role)) {
      return res.status(403).json({ message: 'Not authorized to view all walk-in customers' });
    }

    const { page = 1, limit = 10, status, paymentStatus, date, barberId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    const filter: any = {};
    
    if (req.user!.role === 'owner') {
      filter.salonId = req.user!.salonId;
    }
    if (barberId) filter.barberId = barberId;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const walkInCustomers = await WalkInCustomer.find(filter)
      .populate('barberId', 'name email phone')
      .populate('salonId', 'name address')
      .populate('serviceId', 'title price durationMinutes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await WalkInCustomer.countDocuments(filter);

    res.json({
      walkInCustomers,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get salon walk-in customers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
