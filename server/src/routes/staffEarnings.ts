import express from 'express';
import { authenticateToken } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import StaffEarnings from '../models/StaffEarnings';
import { Booking } from '../models/Booking';
import WalkInCustomer from '../models/WalkInCustomer';
import { User } from '../models/User';
import Joi from 'joi';
import { AuthRequest } from '../middlewares/auth';

const router = express.Router();

// Validation schemas
const getEarningsSchema = Joi.object({
  startDate: Joi.string().optional(),
  endDate: Joi.string().optional(),
  period: Joi.string().valid('today', 'week', 'month', 'year', 'custom').optional(),
  staffId: Joi.string().optional(),
});

// Calculate and update daily earnings for a staff member
const calculateDailyEarnings = async (staffId: string, date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get staff member
  const staff = await User.findById(staffId);
  if (!staff) throw new Error('Staff member not found');

  // Get completed bookings for the day
  const bookings = await Booking.find({
    barberId: staffId,
    status: 'completed',
    timeSlot: { $gte: startOfDay, $lte: endOfDay },
  }).populate('serviceId', 'title price');

  // Get completed walk-ins for the day
  const walkIns = await WalkInCustomer.find({
    barberId: staffId,
    status: 'completed',
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // Calculate earnings
  const commissionRate = 0.7; // 70% commission
  let totalEarnings = 0;
  let bookingEarnings = 0;
  let walkInEarnings = 0;
  let totalBookings = bookings.length;
  let totalWalkIns = walkIns.length;

  // Calculate booking earnings
  bookings.forEach((booking: any) => {
    const servicePrice = booking.serviceId?.price || 0;
    const earnings = servicePrice * commissionRate;
    bookingEarnings += earnings;
    totalEarnings += earnings;
  });

  // Calculate walk-in earnings
  walkIns.forEach((walkIn: any) => {
    const earnings = walkIn.amount * commissionRate;
    walkInEarnings += earnings;
    totalEarnings += earnings;
  });

  // Calculate payment method breakdown
  const paymentMethodBreakdown = {
    cash: 0,
    airtel: 0,
  };

  bookings.forEach((booking: any) => {
    const servicePrice = booking.serviceId?.price || 0;
    if (booking.paymentMethod === 'cash') {
      paymentMethodBreakdown.cash += servicePrice;
    } else {
      paymentMethodBreakdown.airtel += servicePrice;
    }
  });

  walkIns.forEach((walkIn: any) => {
    if (walkIn.paymentMethod === 'cash') {
      paymentMethodBreakdown.cash += walkIn.amount;
    } else {
      paymentMethodBreakdown.airtel += walkIn.amount;
    }
  });

  // Calculate service breakdown
  const serviceMap = new Map();
  
  bookings.forEach((booking: any) => {
    const serviceId = booking.serviceId?._id.toString();
    const serviceName = booking.serviceId?.title || 'Unknown Service';
    const servicePrice = booking.serviceId?.price || 0;
    const commission = servicePrice * commissionRate;

    if (serviceMap.has(serviceId)) {
      const existing = serviceMap.get(serviceId);
      serviceMap.set(serviceId, {
        ...existing,
        count: existing.count + 1,
        totalAmount: existing.totalAmount + servicePrice,
        commission: existing.commission + commission,
      });
    } else {
      serviceMap.set(serviceId, {
        serviceId: booking.serviceId?._id,
        serviceName,
        count: 1,
        totalAmount: servicePrice,
        commission,
      });
    }
  });

  walkIns.forEach((walkIn: any) => {
    const serviceId = walkIn.serviceId.toString();
    const serviceName = walkIn.serviceName;
    const servicePrice = walkIn.amount;
    const commission = servicePrice * commissionRate;

    if (serviceMap.has(serviceId)) {
      const existing = serviceMap.get(serviceId);
      serviceMap.set(serviceId, {
        ...existing,
        count: existing.count + 1,
        totalAmount: existing.totalAmount + servicePrice,
        commission: existing.commission + commission,
      });
    } else {
      serviceMap.set(serviceId, {
        serviceId: walkIn.serviceId,
        serviceName,
        count: 1,
        totalAmount: servicePrice,
        commission,
      });
    }
  });

  const services = Array.from(serviceMap.values());

  // Create or update daily earnings record
  const dailyEarnings = await StaffEarnings.findOneAndUpdate(
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
      totalBookings,
      totalWalkIns,
      paymentMethodBreakdown,
      services,
    },
    { upsert: true, new: true }
  );

  return dailyEarnings;
};

// Get staff earnings
router.get('/', authenticateToken, validateRequest(getEarningsSchema), async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, period, staffId } = req.query;
    
    // Determine date range
    let dateFilter: any = {};
    const now = new Date();
    
    if (period === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = { $gte: startOfDay, $lte: endOfDay };
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter = { $gte: startOfWeek };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { $gte: startOfMonth };
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { $gte: startOfYear };
    } else if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      dateFilter = { $gte: start, $lte: end };
    }

    // Build filter
    const filter: any = { date: dateFilter };
    
    if (staffId) {
      filter.staffId = staffId;
    } else if (['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager'].includes(req.user!.role)) {
      filter.staffId = req.user!._id;
    } else if (req.user!.role === 'owner') {
      filter.salonId = req.user!.salonId;
    }

    const earnings = await StaffEarnings.find(filter)
      .populate('staffId', 'name email phone staffCategory')
      .populate('salonId', 'name address')
      .sort({ date: -1 });

    // Calculate totals
    const totals = {
      totalEarnings: earnings.reduce((sum, earning) => sum + earning.totalEarnings, 0),
      totalCommission: earnings.reduce((sum, earning) => sum + earning.commissionAmount, 0),
      totalBookings: earnings.reduce((sum, earning) => sum + earning.totalBookings, 0),
      totalWalkIns: earnings.reduce((sum, earning) => sum + earning.totalWalkIns, 0),
      totalCash: earnings.reduce((sum, earning) => sum + earning.paymentMethodBreakdown.cash, 0),
      totalAirtel: earnings.reduce((sum, earning) => sum + earning.paymentMethodBreakdown.airtel, 0),
    };

    res.json({
      earnings,
      totals,
      period: period || 'custom',
    });
  } catch (error) {
    console.error('Get staff earnings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get earnings summary for a specific staff member
router.get('/summary/:staffId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { staffId } = req.params;
    const { period = 'month' } = req.query;

    // Check permissions
    if (['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager'].includes(req.user!.role) && req.user!._id.toString() !== staffId) {
      return res.status(403).json({ message: 'Not authorized to view this staff member\'s earnings' });
    }

    if (req.user!.role === 'owner') {
      const staff = await User.findById(staffId);
      if (!staff || staff.salonId?.toString() !== req.user!.salonId?.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this staff member\'s earnings' });
      }
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    if (period === 'today') {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const earnings = await StaffEarnings.find({
      staffId,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    // Calculate summary
    const summary = {
      totalEarnings: earnings.reduce((sum, earning) => sum + earning.totalEarnings, 0),
      totalCommission: earnings.reduce((sum, earning) => sum + earning.commissionAmount, 0),
      totalBookings: earnings.reduce((sum, earning) => sum + earning.totalBookings, 0),
      totalWalkIns: earnings.reduce((sum, earning) => sum + earning.totalWalkIns, 0),
      averageDailyEarnings: earnings.length > 0 ? earnings.reduce((sum, earning) => sum + earning.totalEarnings, 0) / earnings.length : 0,
      bestDay: earnings.length > 0 ? earnings.reduce((best, earning) => earning.totalEarnings > best.totalEarnings ? earning : best) : null,
      paymentMethodBreakdown: {
        cash: earnings.reduce((sum, earning) => sum + earning.paymentMethodBreakdown.cash, 0),
        airtel: earnings.reduce((sum, earning) => sum + earning.paymentMethodBreakdown.airtel, 0),
      },
      serviceBreakdown: {},
    };

    // Calculate service breakdown
    const serviceMap = new Map();
    earnings.forEach(earning => {
      earning.services.forEach(service => {
        const serviceId = service.serviceId.toString();
        if (serviceMap.has(serviceId)) {
          const existing = serviceMap.get(serviceId);
          serviceMap.set(serviceId, {
            ...existing,
            count: existing.count + service.count,
            totalAmount: existing.totalAmount + service.totalAmount,
            commission: existing.commission + service.commission,
          });
        } else {
          serviceMap.set(serviceId, {
            serviceName: service.serviceName,
            count: service.count,
            totalAmount: service.totalAmount,
            commission: service.commission,
          });
        }
      });
    });

    summary.serviceBreakdown = Object.fromEntries(serviceMap);

    res.json({
      summary,
      earnings,
      period,
    });
  } catch (error) {
    console.error('Get earnings summary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update daily earnings (called by cron job or manually)
router.post('/update/:staffId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { staffId } = req.params;
    const { date } = req.body;

    // Check permissions
    if (['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager'].includes(req.user!.role) && req.user!._id.toString() !== staffId) {
      return res.status(403).json({ message: 'Not authorized to update this staff member\'s earnings' });
    }

    if (req.user!.role === 'owner') {
      const staff = await User.findById(staffId);
      if (!staff || staff.salonId?.toString() !== req.user!.salonId?.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this staff member\'s earnings' });
      }
    }

    const targetDate = date ? new Date(date) : new Date();
    const dailyEarnings = await calculateDailyEarnings(staffId, targetDate);

    res.json({
      message: 'Daily earnings updated successfully',
      dailyEarnings,
    });
  } catch (error) {
    console.error('Update daily earnings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all staff earnings for salon (owner/admin view)
router.get('/salon/all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check permissions
    if (!['owner', 'admin', 'superadmin'].includes(req.user!.role)) {
      return res.status(403).json({ message: 'Not authorized to view all staff earnings' });
    }

    const { startDate, endDate, period } = req.query;
    
    // Determine date range
    let dateFilter: any = {};
    const now = new Date();
    
    if (period === 'today') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = { $gte: startOfDay, $lte: endOfDay };
    } else if (period === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter = { $gte: startOfWeek };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { $gte: startOfMonth };
    } else if (period === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      dateFilter = { $gte: startOfYear };
    } else if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      dateFilter = { $gte: start, $lte: end };
    }

    // Build filter
    const filter: any = { date: dateFilter };
    
    if (req.user!.role === 'owner') {
      filter.salonId = req.user!.salonId;
    }

    const earnings = await StaffEarnings.find(filter)
      .populate('staffId', 'name email phone staffCategory')
      .populate('salonId', 'name address')
      .sort({ date: -1, totalEarnings: -1 });

    // Calculate totals
    const totals = {
      totalEarnings: earnings.reduce((sum, earning) => sum + earning.totalEarnings, 0),
      totalCommission: earnings.reduce((sum, earning) => sum + earning.commissionAmount, 0),
      totalBookings: earnings.reduce((sum, earning) => sum + earning.totalBookings, 0),
      totalWalkIns: earnings.reduce((sum, earning) => sum + earning.totalWalkIns, 0),
      totalCash: earnings.reduce((sum, earning) => sum + earning.paymentMethodBreakdown.cash, 0),
      totalAirtel: earnings.reduce((sum, earning) => sum + earning.paymentMethodBreakdown.airtel, 0),
    };

    res.json({
      earnings,
      totals,
      period: period || 'custom',
    });
  } catch (error) {
    console.error('Get all staff earnings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
