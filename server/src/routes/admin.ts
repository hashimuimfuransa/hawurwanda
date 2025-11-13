import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { authenticateToken, requireAdmin, requireSuperAdmin, AuthRequest } from '../middlewares/auth';
import { validateRequest, validateParams } from '../middlewares/validation';
import { validateObjectIdParam } from '../utils/validation';
import { Salon } from '../models/Salon';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Transaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { Service } from '../models/Service';
import { sendSalonApprovalEmail, sendSalonRejectionEmail } from '../utils/emailService';
import { uploadToCloudinary, uploadMultipleToCloudinary, uploadVideoToCloudinary } from '../utils/cloudinary';
import { isValidUploadcareUrl, uploadToUploadcare } from '../utils/uploadcare';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const verifySalonSchema = Joi.object({
  verified: Joi.boolean().required(),
});

const createAdminSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+250|250|0)?[0-9]{9}$/).required(),
  password: Joi.string().min(6).required(),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+250|250|0)?[0-9]{9}$/).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('client', 'barber', 'owner', 'admin', 'superadmin').required(),
  salonId: Joi.string().optional(), // Optional salon ID for barber/owner roles
  gender: Joi.string().valid('male', 'female', 'other').optional(),
});

const createStaffSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().optional(), // Email is now optional for staff
  phone: Joi.string().pattern(/^(\+250|250|0)?[0-9]{9}$/).required(),
  password: Joi.string().min(6).required(),
  salonId: Joi.string().optional(),
  staffCategory: Joi.string().valid('barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager', 'other').optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  nationalId: Joi.string().optional(),
  specialties: Joi.array().items(Joi.string()).optional(),
  experience: Joi.string().optional(),
  educationLevel: Joi.string().valid('primary', 'secondary', 'certificate', 'diploma', 'degree', 'masters', 'phd').optional(),
  birthYearRange: Joi.string().valid('12-35', '35-60', '60+').optional(),
  bio: Joi.string().max(500).optional(),
  credentials: Joi.array().items(Joi.string()).optional(),
  workSchedule: Joi.object().optional(),
  assignedServices: Joi.array().items(Joi.string()).optional(),
});

const createAdminSalonSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(200).required(),
  province: Joi.string().required(),
  district: Joi.string().required(),
  sector: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  ownerId: Joi.string().required(), // Admin selects the owner
  // Owner Information
  ownerIdNumber: Joi.string().min(10).max(20).required(),
  ownerContactPhone: Joi.string().pattern(/^(\+250|250|0)?[0-9]{9}$/).required(),
  ownerContactEmail: Joi.string().email().optional(),
  // Business Information
  numberOfEmployees: Joi.number().min(1).max(1000).required(),
  serviceCategories: Joi.string().optional(), // Will be parsed from comma-separated string
  customServices: Joi.string().max(500).optional(),
  description: Joi.string().max(500).optional(),
  phone: Joi.string().pattern(/^(\+250|250|0)?[0-9]{9}$/).optional(),
  email: Joi.string().email().optional(),
  verified: Joi.boolean().optional(), // Admin can choose to auto-verify
});

// Configure multer for file uploads (images and videos)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});

// Get pending salon verifications
router.get('/salons/pending', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const salons = await Salon.find({ verified: false })
      .populate('ownerId', 'name email phone')
      .populate('services', 'title price durationMinutes')
      .populate('barbers', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Salon.countDocuments({ verified: false });

    res.json({
      salons,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get pending salons error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get detailed salon information for verification
router.get('/salons/:id/details', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const salonId = req.params.id;

    const salon = await Salon.findById(salonId)
      .populate('ownerId', 'name email phone createdAt')
      .populate('services', 'title price durationMinutes description')
      .populate('barbers', 'name email phone profilePhoto');

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    res.json({ salon });
  } catch (error) {
    console.error('Get salon details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify salon
router.patch('/salons/:id/verify', authenticateToken, requireAdmin, validateRequest(verifySalonSchema), async (req: AuthRequest, res) => {
  try {
    const { verified } = req.body;
    const salonId = req.params.id;

    const salon = await Salon.findByIdAndUpdate(
      salonId,
      { verified },
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email phone');

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    const owner = salon.ownerId as any;

    // Create notification for salon owner
    const notification = new Notification({
      toUserId: owner._id,
      type: verified ? 'salon_verified' : 'salon_rejected',
      payload: {
        salonId: salon._id,
        message: verified ? 'Your salon has been verified' : 'Your salon verification was rejected',
        title: verified ? 'Salon Verified' : 'Salon Rejected',
      },
    });

    await notification.save();

    // Send email notification
    try {
      if (verified) {
        await sendSalonApprovalEmail(
          owner.email,
          owner.name,
          salon.name
        );
        console.log(`Approval email sent to ${owner.email}`);
      } else {
        await sendSalonRejectionEmail(
          owner.email,
          owner.name,
          salon.name,
          'Please review your salon information and ensure all requirements are met.'
        );
        console.log(`Rejection email sent to ${owner.email}`);
      }
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: `Salon ${verified ? 'verified' : 'rejected'} successfully`,
      salon,
    });
  } catch (error) {
    console.error('Verify salon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create salon (admin only) - with file uploads
router.post(
  '/salons',
  authenticateToken,
  requireAdmin,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImages', maxCount: 10 }, // Multiple cover images
    { name: 'promotionalVideo', maxCount: 1 }, // Optional video
    { name: 'gallery', maxCount: 5 },
    { name: 'ownerProfilePicture', maxCount: 1 }, // Owner profile picture
  ]),
  async (req: AuthRequest, res) => {
    try {
      // Validate body data
      const { error } = createAdminSalonSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const {
        name,
        address,
        province,
        district,
        sector,
        latitude,
        longitude,
        ownerId,
        ownerIdNumber,
        ownerContactPhone,
        ownerContactEmail,
        numberOfEmployees,
        serviceCategories,
        customServices,
        description,
        phone,
        email,
        verified = false,
      } = req.body;

      // Check if owner exists and is actually an owner
      const owner = await User.findById(ownerId);
      if (!owner) {
        return res.status(404).json({ message: 'Owner not found' });
      }
      if (owner.role !== 'owner') {
        return res.status(400).json({ message: 'Selected user is not an owner' });
      }

      // Check if owner already has a salon
      const existingSalon = await Salon.findOne({ ownerId });
      if (existingSalon) {
        return res.status(400).json({ message: 'This owner already has a salon' });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let logoUrl: string | undefined;
      let coverImageUrls: string[] = [];
      let promotionalVideoUrl: string | undefined;
      let galleryUrls: string[] = [];
      let ownerProfilePictureUrl: string | undefined;

      // Upload logo if provided
      if (files?.logo && files.logo[0]) {
        const result = await uploadToCloudinary(
          files.logo[0].buffer,
          'salons/logos',
          `logo-${Date.now()}`
        );
        logoUrl = result.secure_url;
      }

      // Upload cover images if provided
      if (files?.coverImages && files.coverImages.length > 0) {
        coverImageUrls = await uploadMultipleToCloudinary(
          files.coverImages,
          'salons/covers'
        );
      }

      // Upload promotional video if provided
      if (files?.promotionalVideo && files.promotionalVideo[0]) {
        const result = await uploadVideoToCloudinary(
          files.promotionalVideo[0].buffer,
          'salons/videos',
          `video-${Date.now()}`
        );
        promotionalVideoUrl = result.secure_url;
      }

      // Upload gallery images if provided
      if (files?.gallery && files.gallery.length > 0) {
        galleryUrls = await uploadMultipleToCloudinary(
          files.gallery,
          'salons/gallery'
        );
      }

      // Upload owner profile picture if provided
      if (files?.ownerProfilePicture && files.ownerProfilePicture[0]) {
        const result = await uploadToCloudinary(
          files.ownerProfilePicture[0].buffer,
          'users/profiles',
          `profile-${ownerId}-${Date.now()}`
        );
        ownerProfilePictureUrl = result.secure_url;

        // Update owner's profile picture
        await User.findByIdAndUpdate(ownerId, { profilePhoto: ownerProfilePictureUrl });
      }

      // Parse service categories
      let parsedServiceCategories: string[] = [];
      if (serviceCategories) {
        parsedServiceCategories = serviceCategories.split(',').map((cat: string) => cat.trim());
      }

      // Create salon
      const salon = new Salon({
        name,
        address,
        province,
        district,
        sector: sector || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        ownerId,
        ownerIdNumber,
        ownerContactPhone,
        ownerContactEmail: ownerContactEmail || undefined,
        numberOfEmployees: Number(numberOfEmployees),
        serviceCategories: parsedServiceCategories,
        customServices: customServices || undefined,
        description: description || undefined,
        phone: phone || undefined,
        email: email || undefined,
        logo: logoUrl,
        coverImages: coverImageUrls,
        promotionalVideo: promotionalVideoUrl,
        gallery: galleryUrls,
        verified: Boolean(verified),
      });

      await salon.save();

      // Update owner's salonId
      await User.findByIdAndUpdate(ownerId, { salonId: salon._id });

      // Create notification for salon owner
      const notification = new Notification({
        toUserId: owner._id,
        type: 'salon_created',
        payload: {
          salonId: salon._id,
          message: verified
            ? `Your salon "${salon.name}" has been created and is now live!`
            : `Your salon "${salon.name}" has been created and is pending verification.`,
          title: verified ? 'Salon Created & Verified' : 'Salon Created',
        },
      });

      await notification.save();

      // Send email notification
      try {
        if (verified) {
          await sendSalonApprovalEmail(
            owner.email,
            owner.name,
            salon.name
          );
        } else {
          // Send a different email for admin-created salons
          // You might want to create a specific email template for this
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        message: `Salon created successfully${verified ? ' and verified' : ' and pending verification'}`,
        salon: await Salon.findById(salon._id).populate('ownerId', 'name email phone'),
      });
    } catch (error) {
      console.error('Create admin salon error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Get platform reports
router.get('/reports', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { from, to, groupBy = 'day' } = req.query;
    
    const dateFilter: any = {};
    if (from) dateFilter.$gte = new Date(from as string);
    if (to) dateFilter.$lte = new Date(to as string);

    const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Get basic statistics
    const totalSalons = await Salon.countDocuments({ verified: true });
    const totalBookings = await Booking.countDocuments(query);
    const totalUsers = await User.countDocuments(query);
    
    // Get revenue statistics
    const revenueStats = await Transaction.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;
    const totalTransactions = revenueStats.length > 0 ? revenueStats[0].count : 0;

    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Get revenue by method
    const revenueByMethod = await Transaction.aggregate([
      { $match: { ...query, status: 'completed' } },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // Get recent activity (bookings and transactions from last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentBookings = await Booking.find({ createdAt: { $gte: yesterday } })
      .populate('clientId', 'name')
      .populate('salonId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentTransactions = await Transaction.find({ createdAt: { $gte: yesterday } })
      .populate('barberId', 'name')
      .populate('salonId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Format recent activity
    const recentActivity = [
      ...recentBookings.map(booking => ({
        description: `${(booking.clientId as any)?.name || 'User'} booked a service at ${(booking.salonId as any)?.name || 'Salon'}`,
        time: booking.createdAt.toLocaleString(),
        type: 'booking'
      })),
      ...recentTransactions.map(transaction => ({
        description: `Payment of ${transaction.amount} RWF by ${(transaction.barberId as any)?.name || 'Barber'} ${transaction.status === 'completed' ? 'completed' : 'pending'}`,
        time: transaction.createdAt.toLocaleString(),
        type: 'payment'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    // Calculate active sessions (users logged in within last hour - mock for now)
    const activeSessions = Math.floor(Math.random() * 50) + 10; // Mock data

    res.json({
      summary: {
        totalSalons,
        totalBookings,
        totalUsers,
        totalRevenue,
        totalTransactions,
        activeSessions,
      },
      bookingsByStatus,
      revenueByMethod,
      recentActivity,
      period: { from, to },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all bookings (admin only)
router.get('/bookings', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { 
      status, 
      salonId, 
      search, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query: any = {};

    // Filter by status
    if (status) query.status = status;

    // Filter by salon
    if (salonId) query.salonId = salonId;

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    // Search by client name or service
    if (search) {
      query.$or = [
        { 'clientId.name': new RegExp(search as string, 'i') },
        { 'serviceId.title': new RegExp(search as string, 'i') },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('clientId', 'name email phone')
      .populate('salonId', 'name address district')
      .populate('barberId', 'name email phone')
      .populate('serviceId', 'title category price durationMinutes')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(query);

    // Calculate booking statistics
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Calculate total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      bookings,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
      statistics: {
        totalBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update booking status (admin only)
router.patch('/bookings/:bookingId/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    )
      .populate('clientId', 'name email phone')
      .populate('salonId', 'name address district')
      .populate('barberId', 'name email phone')
      .populate('serviceId', 'title category price durationMinutes');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get booking details (admin only)
router.get('/bookings/:bookingId', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('clientId', 'name email phone')
      .populate('salonId', 'name address district')
      .populate('barberId', 'name email phone')
      .populate('serviceId', 'title category price durationMinutes');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete booking (admin only)
router.delete('/bookings/:bookingId', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
        { phone: new RegExp(search as string, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .populate('salonId', 'name address')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all staff members (admin only)
router.get('/staff', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { search, role, gender, page = 1, limit = 10 } = req.query;
    const query: any = {
      role: { $in: ['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager', 'owner'] }
    };

    if (role) query.role = role;
    if (gender) query.gender = gender;
      
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
        { phone: new RegExp(search as string, 'i') },
      ];
    }

    const staff = await User.find(query)
      .select('-passwordHash')
      .populate({
        path: 'salonId',
        select: 'name address district',
        options: { strictPopulate: false }
      })
      .populate('assignedServices', 'title category')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    // For staff members without salonId, try to find their salon by searching in salon.barbers
    const staffWithSalons = await Promise.all(
      staff.map(async (staffMember) => {
        if (!staffMember.salonId) {
          // Find salon where this staff member is in the barbers array
          const salon = await Salon.findOne({ barbers: staffMember._id })
            .select('name address district');
            
          if (salon) {
            // Update the staff member's salonId
            staffMember.salonId = salon._id;
            await staffMember.save();
              
            return {
              ...staffMember.toObject(),
              salonId: {
                _id: salon._id,
                name: salon.name,
                address: salon.address,
                district: salon.district
              }
            };
          }
        }
        return staffMember;
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      staff: staffWithSalons,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get staff details (admin only)
router.get('/staff/:staffId', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { staffId } = req.params;

    const staff = await User.findById(staffId)
      .select('-passwordHash')
      .populate('salonId', 'name address district')
      .populate('assignedServices', 'title category durationMinutes price');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ staff });
  } catch (error) {
    console.error('Get staff details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update staff salon (admin only)
router.patch('/staff/:staffId/salon', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { staffId } = req.params;
    const { salonId } = req.body;

    const staff = await User.findByIdAndUpdate(
      staffId,
      { salonId },
      { new: true }
    ).select('-passwordHash').populate('salonId', 'name address district');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ staff });
  } catch (error) {
    console.error('Update staff salon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Deactivate staff (admin only)
router.patch('/staff/:staffId/deactivate', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { staffId } = req.params;

    const staff = await User.findByIdAndUpdate(
      staffId,
      { isActive: false },
      { new: true }
    ).select('-passwordHash').populate('salonId', 'name address district');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ staff });
  } catch (error) {
    console.error('Deactivate staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Activate staff (admin only)
router.patch('/staff/:staffId/activate', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { staffId } = req.params;

    const staff = await User.findByIdAndUpdate(
      staffId,
      { isActive: true },
      { new: true }
    ).select('-passwordHash').populate('salonId', 'name address district');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ staff });
  } catch (error) {
    console.error('Activate staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update staff services (admin only)
router.patch('/staff/:staffId/services', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { staffId } = req.params;
    const { services } = req.body;

    const staff = await User.findByIdAndUpdate(
      staffId,
      { assignedServices: services },
      { new: true }
    ).select('-passwordHash').populate('salonId', 'name address district').populate('assignedServices', 'title category');

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({ staff });
  } catch (error) {
    console.error('Update staff services error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update staff member (admin only)
router.patch('/staff/:staffId', authenticateToken, requireAdmin, upload.single('profilePhoto'), async (req: AuthRequest, res) => {
  try {
    const { staffId } = req.params;
    const updateData: any = { ...req.body };

    // Handle password update separately
    if (updateData.password) {
      const saltRounds = 12;
      updateData.passwordHash = await bcrypt.hash(updateData.password, saltRounds);
      delete updateData.password; // Remove plain text password
    }

    // Parse JSON fields if they're strings
    if (updateData.specialties && typeof updateData.specialties === 'string') {
      try {
        updateData.specialties = JSON.parse(updateData.specialties);
      } catch (e) {
        updateData.specialties = [];
      }
    }

    if (updateData.credentials && typeof updateData.credentials === 'string') {
      try {
        updateData.credentials = JSON.parse(updateData.credentials);
      } catch (e) {
        updateData.credentials = [];
      }
    }

    if (updateData.workSchedule && typeof updateData.workSchedule === 'string') {
      try {
        updateData.workSchedule = JSON.parse(updateData.workSchedule);
      } catch (e) {
        updateData.workSchedule = {};
      }
    }

    // Handle profile photo upload if provided
    if (req.file) {
      try {
        const profilePhotoUrl = await uploadToUploadcare(req.file.buffer, req.file.originalname);
        updateData.profilePhoto = profilePhotoUrl;
      } catch (uploadError) {
        console.error('Profile photo upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile photo' });
      }
    }

    // Update staff member
    const updatedStaff = await User.findByIdAndUpdate(
      staffId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash')
      .populate('salonId', 'name address district')
      .populate('assignedServices', 'title category durationMinutes price');

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({
      message: 'Staff member updated successfully',
      staff: updatedStaff,
    });
  } catch (error: any) {
    console.error('Update staff error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create staff member and assign to salon (admin only)
router.post('/staff/create', authenticateToken, requireAdmin, upload.single('profilePhoto'), validateRequest(createStaffSchema), async (req: AuthRequest, res) => {
  try {
    const {
      name,
      email,
      phone,
      nationalId,
      password,
      salonId,
      staffCategory,
      gender,
      specialties,
      experience,
      educationLevel,
      birthYearRange,
      bio,
      credentials,
      workSchedule,
      assignedServices
    } = req.body;

    // Validate required fields (email is now optional)
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }

    // Check if user already exists
    const existingUserQuery: any = { phone };
    if (email) {
      existingUserQuery.$or = [{ email: email.toLowerCase() }, { phone }];
    } else {
      existingUserQuery.phone = phone;
    }
    
    const existingUser = await User.findOne(existingUserQuery);

    if (existingUser) {
      return res.status(400).json({
        message: email 
          ? 'User with this email or phone already exists' 
          : 'User with this phone already exists',
      });
    }

    // Check if salon exists (only if salonId is provided)
    let salon = null;
    if (salonId) {
      salon = await Salon.findById(salonId);
      if (!salon) {
        return res.status(404).json({ message: 'Salon not found' });
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Parse JSON fields if they're strings
    let parsedSpecialties = specialties || [];
    if (typeof specialties === 'string') {
      try {
        parsedSpecialties = JSON.parse(specialties);
      } catch (e) {
        parsedSpecialties = [];
      }
    }

    let parsedCredentials = credentials || [];
    if (typeof credentials === 'string') {
      try {
        parsedCredentials = JSON.parse(credentials);
      } catch (e) {
        parsedCredentials = [];
      }
    }

    let parsedWorkSchedule = workSchedule || {};
    if (typeof workSchedule === 'string') {
      try {
        parsedWorkSchedule = JSON.parse(workSchedule);
      } catch (e) {
        parsedWorkSchedule = {};
      }
    }

    let parsedAssignedServices = assignedServices || [];
    if (typeof assignedServices === 'string') {
      try {
        parsedAssignedServices = JSON.parse(assignedServices);
      } catch (e) {
        parsedAssignedServices = [];
      }
    }

    // Handle profile photo upload if provided
    let profilePhotoUrl = undefined;
    if (req.file) {
      try {
        profilePhotoUrl = await uploadToUploadcare(req.file.buffer, req.file.originalname);
      } catch (uploadError) {
        console.error('Profile photo upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile photo' });
      }
    }

    // Create staff member
    const staffMember = new User({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : null,
      phone: phone.trim(),
      nationalId: nationalId || null,
      passwordHash,
      role: staffCategory || 'barber',
      salonId,
      isVerified: true,
      gender: gender || null,
      staffCategory,
      specialties: parsedSpecialties,
      experience,
      educationLevel,
      birthYearRange,
      bio,
      credentials: parsedCredentials,
      workSchedule: parsedWorkSchedule,
      assignedServices: parsedAssignedServices.length > 0 ? parsedAssignedServices : (salon ? salon.services : []),
      profilePhoto: profilePhotoUrl,
    });

    await staffMember.save();

    // Add staff member to salon barbers list (only if salon is assigned)
    if (salon && !salon.barbers.includes(staffMember._id as any)) {
      salon.barbers.push(staffMember._id as any);
      await salon.save();
    }

    // Return staff member without password hash
    const staffMemberResponse = await User.findById(staffMember._id)
      .select('-passwordHash')
      .populate('salonId', 'name address district')
      .populate('assignedServices', 'title category price');

    res.status(201).json({
      message: 'Staff member created successfully',
      staff: staffMemberResponse,
    });
  } catch (error: any) {
    console.error('Create staff error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user (admin can create owner, barber, client)
router.post('/users/create', authenticateToken, requireAdmin, validateRequest(createUserSchema), async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, password, role, gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or phone already exists',
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user object with conditional salonId
    const userData: any = {
      name,
      email: email || null,
      phone,
      passwordHash,
      role,
      isVerified: role === 'owner' ? true : false, // Auto-verify owners created by admin

    };

    // Add gender if provided
    if (gender) {
      userData.gender = gender;
    }

    // Only add salonId for barbers if provided
    // Owners will create their salon later and get approved by admin
    // Barbers will be assigned to salons later
    if (req.body.salonId && ['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager', 'owner'].includes(role)) {
      userData.salonId = req.body.salonId;
    }

    const user = new User(userData);

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create admin user (super admin only)
router.post('/users', authenticateToken, requireSuperAdmin, validateRequest(createAdminSchema), async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or phone already exists',
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const user = new User({
      name,
      email: email || null,
      phone,
      passwordHash,
      role: 'admin',
      isVerified: true,
    });

    await user.save();

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user status (admin only)
router.patch('/users/:id', authenticateToken, requireAdmin, upload.single('profilePhoto'), async (req: AuthRequest, res) => {
  try {
    const { isVerified, role, name, phone } = req.body;
    const userId = req.params.id;

    // Prevent super admin from being modified
    const user = await User.findById(userId);
    if (user && user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot modify super admin' });
    }

    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (role && req.user!.role === 'superadmin') updateData.role = role;
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    // Handle profile photo upload or URL
    if (req.file) {
      try {
        const profilePhotoUrl = await uploadToUploadcare(req.file.buffer, req.file.originalname);
        updateData.profilePhoto = profilePhotoUrl;
      } catch (uploadError) {
        console.error('Profile photo upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile photo' });
      }
    } else if (req.body.profilePhoto) {
      // Handle any profile photo URL (Uploadcare, Cloudinary, etc.)
      updateData.profilePhoto = req.body.profilePhoto;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (admin and super admin)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;

    // Prevent super admin from being deleted
    const user = await User.findById(userId);
    if (user && user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete super admin accounts' });
    }

    // Prevent self-deletion for super admins
    if (req.user && userId === req.user._id.toString() && req.user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has active bookings (only for super admins for more robust checking)
    if (req.user && req.user.role === 'superadmin') {
      const activeBookings = await Booking.countDocuments({
        $or: [
          { clientId: userId, status: { $in: ['pending', 'confirmed'] } },
          { barberId: userId, status: { $in: ['pending', 'confirmed'] } }
        ]
      });

      if (activeBookings > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete user with active bookings. Please cancel or complete them first.',
          activeBookings
        });
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get comprehensive stats (admin and super admin)
router.get('/stats/comprehensive', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    // User stats by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Salon stats
    const salonStats = await Salon.aggregate([
      {
        $group: {
          _id: null,
          totalSalons: { $sum: 1 },
          verifiedSalons: { $sum: { $cond: ['$verified', 1, 0] } },
          pendingSalons: { $sum: { $cond: ['$verified', 0, 1] } },
        }
      }
    ]);

    // Booking stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookingStats = await Booking.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenue stats for last 30 days
    const revenueStats = await Transaction.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // Staff gender distribution
    const staffGenderDistribution = await User.aggregate([
      {
        $match: {
          role: { $in: ['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager', 'owner'] }
        }
      },
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Growth metrics (compare last 30 days vs previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [currentUsers, previousUsers] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
    ]);

    const [currentBookings, previousBookings] = await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Booking.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
    ]);

    res.json({
      usersByRole,
      salonStats: salonStats[0] || { totalSalons: 0, verifiedSalons: 0, pendingSalons: 0 },
      bookingStats,
      revenueStats: revenueStats[0] || { totalRevenue: 0, totalTransactions: 0 },
      staffGenderDistribution,
      growth: {
        users: {
          current: currentUsers,
          previous: previousUsers,
          percentage: previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers * 100) : 0
        },
        bookings: {
          current: currentBookings,
          previous: previousBookings,
          percentage: previousBookings > 0 ? ((currentBookings - previousBookings) / previousBookings * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get comprehensive stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Note: Super admin activities endpoint is defined later as '/superadmin/activities'

// Get notifications (admin only)
router.get('/notifications', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find()
      .populate('toUserId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments();

    res.json({
      notifications,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// SUPER ADMIN SPECIFIC ENDPOINTS

// Get super admin stats
router.get('/superadmin/stats', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalSalons = await Salon.countDocuments({ verified: true });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    // Monthly bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyBookings = await Booking.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Active admins (those who logged in this month)
    const activeAdmins = await User.countDocuments({ 
      role: 'admin',
      updatedAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalUsers,
      totalSalons,
      adminCount,
      monthlyBookings,
      roleDistribution,
      activeAdmins,
    });
  } catch (error) {
    console.error('Get super admin stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all bookings (super admin only)
router.get('/superadmin/bookings', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (search) {
      // Add search functionality for bookings
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { 'clientId.name': searchRegex },
        { 'barberId.name': searchRegex },
        { 'salonId.name': searchRegex }
      ];
    }

    const bookings = await Booking.find(query)
      .populate('clientId', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('salonId', 'name address phone')
      .populate('serviceId', 'title price durationMinutes')
      .sort({ createdAt: -1 })
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
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all salons (super admin only)
router.get('/superadmin/salons', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, search, verified } = req.query;
    const query: any = {};

    if (verified !== undefined) query.verified = verified === 'true';
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { address: searchRegex },
        { 'ownerId.name': searchRegex }
      ];
    }

    const salons = await Salon.find(query)
      .populate('ownerId', 'name email phone')
      .populate('barbers', 'name email phone')
      .populate('services', 'title price durationMinutes')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Salon.countDocuments(query);

    res.json({
      salons,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get all salons error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete salon (super admin only)
router.delete('/superadmin/salons/:id', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const salonId = req.params.id;

    // Check if salon exists
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    // Delete all related bookings
    await Booking.deleteMany({ salonId });

    // Update users who were associated with this salon
    await User.updateMany(
      { salonId },
      { $unset: { salonId: 1 }, role: 'client' }
    );

    // Delete the salon
    await Salon.findByIdAndDelete(salonId);

    res.json({
      message: 'Salon deleted successfully',
    });
  } catch (error) {
    console.error('Delete salon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update salon (super admin only)
router.patch('/superadmin/salons/:id', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const salonId = req.params.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const salon = await Salon.findByIdAndUpdate(
      salonId,
      updates,
      { new: true, runValidators: true }
    )
      .populate('ownerId', 'name email phone')
      .populate('barbers', 'name email phone')
      .populate('services', 'title price durationMinutes');

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    res.json({
      message: 'Salon updated successfully',
      salon,
    });
  } catch (error) {
    console.error('Update salon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get system activities (super admin only)
router.get('/superadmin/activities', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get recent user registrations
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('clientId', 'name')
      .populate('salonId', 'name')
      .populate('barberId', 'name')
      .select('clientId salonId barberId status amountTotal createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent salon registrations
    const recentSalons = await Salon.find()
      .populate('ownerId', 'name')
      .select('name ownerId verified createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Format activities
    const activities = [
      ...recentUsers.map(user => ({
        type: 'user_registration',
        message: `New ${user.role} registered: ${user.name}`,
        timestamp: user.createdAt,
        data: user
      })),
      ...recentBookings.map(booking => ({
        type: 'booking_created',
        message: `New booking for ${booking.amountTotal} at ${(booking.salonId as any)?.name || 'Unknown Salon'}`,
        timestamp: booking.createdAt,
        data: booking
      })),
      ...recentSalons.map(salon => ({
        type: 'salon_registration',
        message: `New salon registered: ${salon.name}`,
        timestamp: salon.createdAt,
        data: salon
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, Number(limit));

    res.json(activities);
  } catch (error) {
    console.error('Get system activities error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users for super admin (super admin only)
router.get('/superadmin/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { role, search, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const query: any = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
        { phone: new RegExp(search as string, 'i') },
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .populate('salonId', 'name address')
      .sort({ [sort as string]: order === 'desc' ? -1 : 1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1
      },
    });
  } catch (error) {
    console.error('Get superadmin users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single user details (super admin only)
router.get('/superadmin/users/:id', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId)
      .select('-passwordHash')
      .populate('salonId', 'name address phone email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional user statistics
    const bookingsCount = await Booking.countDocuments({ clientId: userId });
    const lastLogin = user.updatedAt; // Assuming updatedAt tracks last activity

    res.json({
      user: {
        ...user.toObject(),
        statistics: {
          bookingsCount,
          lastLogin,
          accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) // days
        }
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user (super admin only)
router.patch('/superadmin/users/:id', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, role, isVerified, salonId } = req.body;
    const userId = req.params.id;

    // Prevent super admin from being modified by other super admins
    const user = await User.findById(userId);
    if (user && user.role === 'superadmin' && user._id.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ message: 'Cannot modify other super admins' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (role !== undefined) updateData.role = role;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (salonId !== undefined) updateData.salonId = salonId;

    // Validate role-specific requirements
    if (role && ['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager', 'owner'].includes(role) && !salonId && !user?.salonId) {
      return res.status(400).json({ 
        message: 'Barbers and owners must be assigned to a salon' 
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-passwordHash')
      .populate('salonId', 'name address');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Email or phone already exists' 
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (admin and super admin)
router.delete('/superadmin/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;

    // Prevent super admin from being deleted
    const user = await User.findById(userId);
    if (user && user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete super admin accounts' });
    }

    // Prevent self-deletion for super admins
    if (req.user && userId === req.user._id.toString() && req.user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has active bookings (only for super admins for more robust checking)
    if (req.user && req.user.role === 'superadmin') {
      const activeBookings = await Booking.countDocuments({
        $or: [
          { clientId: userId, status: { $in: ['pending', 'confirmed'] } },
          { barberId: userId, status: { $in: ['pending', 'confirmed'] } }
        ]
      });

      if (activeBookings > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete user with active bookings. Please cancel or complete them first.',
          activeBookings
        });
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk update users (super admin only)
router.patch('/superadmin/users/bulk', authenticateToken, requireSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { userIds, updates } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates object is required' });
    }

    // Prevent super admin accounts from being modified
    const superAdmins = await User.find({ 
      _id: { $in: userIds }, 
      role: 'superadmin' 
    }).select('_id name');

    if (superAdmins.length > 0) {
      return res.status(403).json({ 
        message: 'Cannot modify super admin accounts',
        superAdmins: superAdmins.map(sa => ({ id: sa._id, name: sa.name }))
      });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updates,
      { runValidators: true }
    );

    res.json({
      message: 'Users updated successfully',
      matched: result.matchedCount,
      modified: result.modifiedCount
    });
  } catch (error: any) {
    console.error('Bulk update users error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new user (super admin only)
router.post('/superadmin/users', authenticateToken, requireSuperAdmin, validateRequest(createAdminSchema), async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, password, role = 'client', salonId, isVerified = true } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this email or phone already exists',
      });
    }

    // Validate role-specific requirements
    if (['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager', 'owner'].includes(role) && !salonId) {
      return res.status(400).json({
        message: 'Barbers and owners must be assigned to a salon',
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData: any = {
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : null,
      phone: phone.trim(),
      passwordHash,
      role,
      isVerified,
    };

    if (salonId) userData.salonId = salonId;

    const user = new User(userData);
    const savedUser = await user.save();

    // Populate salon info if applicable
    await savedUser.populate('salonId', 'name address');

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
        isVerified: savedUser.isVerified,
        salonId: savedUser.salonId,
        createdAt: savedUser.createdAt
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// Super Admin Create Admin endpoint (legacy - keeping for backward compatibility)
router.post('/superadmin/create-admin', requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }]
    });

    if (existingUser) {
      return res.status(409).json({ 
        message: 'User with this email or phone already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const adminUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: 'admin',
      isVerified: true // Auto-verify admin accounts created by super admin
    });

    const savedAdmin = await adminUser.save();

    // Remove sensitive data from response
    const adminResponse = {
      _id: savedAdmin._id,
      name: savedAdmin.name,
      email: savedAdmin.email,
      phone: savedAdmin.phone,
      role: savedAdmin.role,
      isVerified: savedAdmin.isVerified,
      createdAt: savedAdmin.createdAt
    };

    res.status(201).json({
      message: 'Admin created successfully',
      admin: adminResponse
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all bookings (admin only)
router.get('/bookings', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { 
      search, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query: any = {};
    
    // Filter by status
    if (status) query.status = status;
    
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }
    
    // Search by booking ID, client name, or salon name
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      
      // Find users and salons that match the search term
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const matchingSalons = await Salon.find({
        name: searchRegex
      }).select('_id');
      
      query.$or = [
        { bookingId: searchRegex },
        { clientId: { $in: matchingUsers.map(u => u._id) } },
        { salonId: { $in: matchingSalons.map(s => s._id) } }
      ];
    }
    
    const bookings = await Booking.find(query)
      .populate('clientId', 'name email phone')
      .populate('barberId', 'name email phone')
      .populate('salonId', 'name address')
      .populate('serviceId', 'title price durationMinutes')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
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
    console.error('Get admin bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all notifications (admin only)
router.get('/notifications', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
    
    const query: any = {};
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    const notifications = await Notification.find(query)
      .populate('toUserId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ read: false });
    
    res.json({
      notifications,
      unreadCount,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (error) {
    console.error('Get admin notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get system activities (admin only)
router.get('/activities', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    // Get recent activities from multiple sources
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 7); // Last 7 days
    
    const recentBookings = await Booking.find({ 
      createdAt: { $gte: yesterday } 
    })
      .populate('clientId', 'name')
      .populate('salonId', 'name')
      .populate('barberId', 'name')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 })
      .limit(25);
    
    const recentTransactions = await Transaction.find({ 
      createdAt: { $gte: yesterday } 
    })
      .populate('barberId', 'name')
      .populate('salonId', 'name')
      .sort({ createdAt: -1 })
      .limit(25);
    
    const recentSalons = await Salon.find({ 
      createdAt: { $gte: yesterday } 
    })
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentUsers = await User.find({ 
      createdAt: { $gte: yesterday },
      role: { $ne: 'superadmin' }
    })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Format activities
    const activities = [
      ...recentBookings.map(booking => ({
        id: `booking-${booking._id}`,
        type: 'booking',
        description: `New booking: ${(booking.clientId as any)?.name || 'User'} booked ${(booking.serviceId as any)?.name || 'a service'} at ${(booking.salonId as any)?.name || 'salon'}`,
        details: `Booking ID: ${booking.bookingId}, Status: ${booking.status}, Amount: ${booking.amountTotal} RWF`,
        time: booking.createdAt,
        status: booking.status,
        icon: 'calendar'
      })),
      ...recentTransactions.map(transaction => ({
        id: `transaction-${transaction._id}`,
        type: 'transaction',
        description: `Payment ${transaction.status}: ${transaction.amount} RWF via ${transaction.method}`,
        details: `Transaction by ${(transaction.barberId as any)?.name || 'Unknown'} at ${(transaction.salonId as any)?.name || 'Unknown salon'}`,
        time: transaction.createdAt,
        status: transaction.status,
        icon: 'dollar-sign'
      })),
      ...recentSalons.map(salon => ({
        id: `salon-${salon._id}`,
        type: 'salon',
        description: `New salon registration: ${salon.name}`,
        details: `Owner: ${(salon.ownerId as any)?.name || 'Unknown'}, Status: ${salon.verified ? 'Verified' : 'Pending verification'}`,
        time: salon.createdAt,
        status: salon.verified ? 'verified' : 'pending',
        icon: 'building'
      })),
      ...recentUsers.map(user => ({
        id: `user-${user._id}`,
        type: 'user',
        description: `New user registration: ${user.name}`,
        details: `Role: ${user.role}, Email: ${user.email}, Status: ${user.isVerified ? 'Verified' : 'Unverified'}`,
        time: user.createdAt,
        status: user.isVerified ? 'verified' : 'unverified',
        icon: 'user'
      }))
    ];
    
    // Sort all activities by time
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));
    
    res.json({
      activities: sortedActivities,
      pagination: {
        current: Number(page),
        pages: Math.ceil(activities.length / Number(limit)),
        total: activities.length,
      },
    });
  } catch (error) {
    console.error('Get admin activities error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user roles based on staffCategory (admin only)
router.post('/update-user-roles', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    console.log('Starting user role update...');
    
    // Find all users with staffCategory but role is 'barber'
    const usersToUpdate = await User.find({
      staffCategory: { $exists: true, $ne: null },
      role: 'barber'
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    const updatedUsers = [];

    for (const user of usersToUpdate) {
      if (user.staffCategory && user.staffCategory !== 'barber') {
        console.log(`Updating user ${user.name} (${user.email}) from 'barber' to '${user.staffCategory}'`);
        
        await User.findByIdAndUpdate(user._id, {
          role: user.staffCategory
        });
        
        updatedUsers.push({
          id: user._id,
          name: user.name,
          email: user.email,
          oldRole: 'barber',
          newRole: user.staffCategory
        });
        
        console.log(`✓ Updated ${user.name} to role: ${user.staffCategory}`);
      }
    }

    console.log('User role update completed!');

    res.json({
      message: 'User roles updated successfully',
      updatedCount: updatedUsers.length,
      updatedUsers
    });
  } catch (error) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add service to salon (admin only)
router.post('/salons/:id/services', authenticateToken, requireAdmin, validateObjectIdParam('id'), async (req: AuthRequest, res) => {
  try {
    const salonId = req.params.id;
    const { title, description, durationMinutes, price, category, targetAudience } = req.body;

    // Check if salon exists
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    const service = new Service({
      salonId,
      title,
      description,
      durationMinutes,
      price,
      category,
      targetAudience,
    });

    await service.save();

    // Add service to salon
    salon.services.push(service._id as any);
    await salon.save();

    res.status(201).json({
      message: 'Service added successfully',
      service,
    });
  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update salon service (admin only)
router.patch('/salons/:salonId/services/:serviceId', authenticateToken, requireAdmin, validateObjectIdParam('salonId'), validateObjectIdParam('serviceId'), async (req: AuthRequest, res) => {
  try {
    const { salonId, serviceId } = req.params;
    const { title, description, durationMinutes, price, category, targetAudience, isActive } = req.body;

    // Check if salon exists
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    // Find and update the service
    const service = await Service.findOneAndUpdate(
      { _id: serviceId, salonId },
      { title, description, durationMinutes, price, category, targetAudience, isActive },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      message: 'Service updated successfully',
      service,
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete salon service (admin only)
router.delete('/salons/:salonId/services/:serviceId', authenticateToken, requireAdmin, validateObjectIdParam('salonId'), validateObjectIdParam('serviceId'), async (req: AuthRequest, res) => {
  try {
    const { salonId, serviceId } = req.params;

    // Check if salon exists
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    // Find and delete the service
    const service = await Service.findOneAndDelete({ _id: serviceId, salonId });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Remove service from salon's services array
    salon.services = salon.services.filter(id => id.toString() !== serviceId);
    await salon.save();

    res.json({
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload file to Uploadcare (admin only)
router.post('/upload/uploadcare', authenticateToken, requireAdmin, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = await uploadToUploadcare(req.file.buffer, req.file.originalname);

    res.json({
      message: 'File uploaded successfully',
      url: fileUrl,
    });
  } catch (error: any) {
    console.error('Uploadcare upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload file' });
  }
});

export default router;
