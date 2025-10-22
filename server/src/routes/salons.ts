import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import { authenticateToken, requireOwnerOrAdmin, AuthRequest } from '../middlewares/auth';
import { validateRequest, validateParams } from '../middlewares/validation';
import { validateObjectIdParam, validateObjectIdFields, handleInvalidObjectIdError, isValidObjectId } from '../utils/validation';
import { Salon } from '../models/Salon';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { Availability } from '../models/Availability';
import { Notification } from '../models/Notification';
import Joi from 'joi';
import { uploadToCloudinary, uploadMultipleToCloudinary, uploadVideoToCloudinary } from '../utils/cloudinary';
import { sendStaffWelcomeEmail, sendOwnerWelcomeEmail } from '../utils/welcomeEmails';

const router = express.Router();

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

// Validation schemas
const createSalonSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(200).required(),
  province: Joi.string().required(),
  district: Joi.string().required(),
  sector: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
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
});

const updateSalonSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  address: Joi.string().min(5).max(200).optional(),
  province: Joi.string().optional(),
  district: Joi.string().optional(),
  sector: Joi.string().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  numberOfEmployees: Joi.number().min(1).max(1000).optional(),
  serviceCategories: Joi.array().items(Joi.string()).optional(),
  customServices: Joi.string().max(500).optional(),
  description: Joi.string().max(500).optional(),
  phone: Joi.string().pattern(/^(\+250|250|0)?[0-9]{9}$/).optional(),
  email: Joi.string().email().optional(),
  workingHours: Joi.object().optional(),
});

// Get all salons
router.get('/', async (req, res) => {
  try {
    const { district, service, name, verified, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (district) query.district = new RegExp(district as string, 'i');
    if (service) query.services = service;
    if (name) query.name = new RegExp(name as string, 'i');
    
    // Only show verified salons to public (unless explicitly requesting unverified)
    if (verified !== undefined) {
      query.verified = verified === 'true';
    } else {
      // Default: only show verified salons
      query.verified = true;
    }

    const salons = await Salon.find(query)
      .populate('ownerId', 'name email phone')
      .populate('services', 'title price durationMinutes category targetAudience')
      .populate({
        path: 'barbers',
        select: 'name profilePhoto role staffCategory',
        populate: {
          path: 'assignedServices',
          select: 'title _id'
        }
      })
      .sort({ verified: -1, createdAt: -1 })
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
    console.error('Get salons error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get salon by ID
router.get('/:id', validateObjectIdParam('id'), async (req, res): Promise<void> => {
  try {
    const salonId = req.params.id;

    const salon = await Salon.findById(salonId)
      .populate('ownerId', 'name email phone')
      .populate('services', 'title price durationMinutes category description targetAudience')
      .populate({
        path: 'barbers',
        select: 'name profilePhoto role staffCategory',
        populate: {
          path: 'assignedServices',
          select: 'title _id'
        }
      });

    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    res.json({ salon });
  } catch (error) {
    console.error('Get salon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create salon (owner only) - with optional file uploads
router.post(
  '/',
  authenticateToken,
  requireOwnerOrAdmin,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImages', maxCount: 10 }, // Multiple cover images
    { name: 'promotionalVideo', maxCount: 1 }, // Optional video
    { name: 'gallery', maxCount: 5 },
  ]),
  async (req: AuthRequest, res) => {
    try {
      // Validate body data
      const { error } = createSalonSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let logoUrl: string | undefined;
      let coverImageUrls: string[] = [];
      let promotionalVideoUrl: string | undefined;
      let galleryUrls: string[] = [];

      // Upload logo if provided
      if (files?.logo && files.logo[0]) {
        const result = await uploadToCloudinary(
          files.logo[0].buffer,
          'salons/logos',
          `logo-${Date.now()}`
        );
        logoUrl = result.secure_url;
      }

      // Upload multiple cover images if provided
      if (files?.coverImages && files.coverImages.length > 0) {
        coverImageUrls = await uploadMultipleToCloudinary(files.coverImages, 'salons/covers');
      }

      // Upload promotional video if provided (optional)
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
        galleryUrls = await uploadMultipleToCloudinary(files.gallery, 'salons/gallery');
      }

      // Parse service categories from comma-separated string
      let serviceCategories: string[] = [];
      if (req.body.serviceCategories) {
        serviceCategories = req.body.serviceCategories
          .split(',')
          .map((cat: string) => cat.trim())
          .filter((cat: string) => cat.length > 0);
      }

      const salonData = {
        ...req.body,
        ownerId: req.user!._id,
        verified: false, // New salons need admin verification
        logo: logoUrl,
        coverImages: coverImageUrls,
        promotionalVideo: promotionalVideoUrl,
        gallery: galleryUrls,
        serviceCategories,
        numberOfEmployees: Number(req.body.numberOfEmployees),
      };

      const salon = new Salon(salonData);
      await salon.save();

      // Add owner to barbers list
      salon.barbers.push(req.user!._id as any);
      await salon.save();

      // Update user's salonId
      await User.findByIdAndUpdate(req.user!._id, { salonId: salon._id });

      // Create notification for admins
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } });
      const notificationPromises = admins.map(admin =>
        new Notification({
          toUserId: admin._id,
          type: 'salon_pending',
          payload: {
            title: 'New Salon Pending Approval',
            message: `${req.user!.name} has created a new salon "${salon.name}" that requires verification.`,
            salonId: salon._id,
          },
        }).save()
      );
      await Promise.all(notificationPromises);

      const populatedSalon = await Salon.findById(salon._id)
        .populate('ownerId', 'name email phone')
        .populate('services', 'title price durationMinutes targetAudience')
        .populate('barbers', 'name profilePhoto assignedServices');

      res.status(201).json({
        message: 'Salon created successfully and pending admin approval',
        salon: populatedSalon,
      });
    } catch (error) {
      console.error('Create salon error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Update salon (owner or admin)
router.patch('/:id', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('id'), validateRequest(updateSalonSchema), async (req: AuthRequest, res): Promise<void> => {
  try {
    const salonId = req.params.id;
    const userId = req.user!._id;

    // Check if user owns the salon or is admin
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== userId.toString() && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
      res.status(403).json({ message: 'Not authorized to update this salon' });
      return;
    }

    const updatedSalon = await Salon.findByIdAndUpdate(
      salonId,
      req.body,
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email phone')
     .populate('services', 'title price durationMinutes targetAudience')
     .populate('barbers', 'name profilePhoto assignedServices');

    res.json({
      message: 'Salon updated successfully',
      salon: updatedSalon,
    });
  } catch (error) {
    console.error('Update salon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload salon gallery images
router.post('/:id/gallery', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('id'), upload.array('images', 5), async (req: AuthRequest, res): Promise<void> => {
  try {
    const salonId = req.params.id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No images provided' });
      return;
    }

    // Check if user owns the salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== req.user!._id.toString() && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
      res.status(403).json({ message: 'Not authorized to update this salon' });
      return;
    }

    // Upload images to Cloudinary
    const imageUrls = await uploadMultipleToCloudinary(files, `salons/gallery/${salonId}`);

    // Add images to salon gallery
    salon.gallery.push(...imageUrls);
    await salon.save();

    res.json({
      message: 'Images uploaded successfully',
      images: imageUrls,
    });
  } catch (error) {
    console.error('Upload gallery error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add service to salon (owner only)
router.post('/:id/services', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('id'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const salonId = req.params.id;
    const { title, description, durationMinutes, price, category, targetAudience } = req.body;

    // Check if user owns the salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to add services to this salon' });
      return;
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

// Add barber to salon (owner only) - existing endpoint for backward compatibility
router.post('/:id/barbers', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('id'), validateObjectIdFields(['barberId']), async (req: AuthRequest, res): Promise<void> => {
  try {
    const salonId = req.params.id;
    const { barberId } = req.body;

    // Check if user owns the salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to add barbers to this salon' });
      return;
    }

    // Check if barber exists and has barber role
    const barber = await User.findById(barberId);
    if (!barber || !['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager'].includes(barber.role)) {
      res.status(400).json({ message: 'Invalid barber' });
      return;
    }

    // Check if barber is already in this salon
    if (salon.barbers.includes(barberId)) {
      res.status(400).json({ message: 'Barber already in this salon' });
      return;
    }

    // Add barber to salon
    salon.barbers.push(barberId);
    await salon.save();

    // Update barber's salonId
    await User.findByIdAndUpdate(barberId, { salonId });

    // Create availability for barber
    const availability = new Availability({
      barberId,
      salonId,
      weeklyAvailability: {
        monday: [{ start: '08:00', end: '18:00', available: true }],
        tuesday: [{ start: '08:00', end: '18:00', available: true }],
        wednesday: [{ start: '08:00', end: '18:00', available: true }],
        thursday: [{ start: '08:00', end: '18:00', available: true }],
        friday: [{ start: '08:00', end: '18:00', available: true }],
        saturday: [{ start: '09:00', end: '17:00', available: true }],
        sunday: [{ start: '10:00', end: '16:00', available: true }],
      },
    });

    await availability.save();

    res.json({
      message: 'Barber added successfully',
      barber,
    });
  } catch (error) {
    console.error('Add barber error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new staff member with comprehensive info (owner only)
router.post('/:id/staff', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('id'), upload.single('profilePhoto'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const salonId = req.params.id;
    const { 
      name, 
      email, 
      phone, 
      nationalId,
      password, 
      staffCategory, 
      specialties,
      experience,
      bio,
      credentials,
      workSchedule 
    } = req.body;

    // Check if user owns the salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to add staff to this salon' });
      return;
    }

    // Check if email or phone already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email or phone already exists' });
      return;
    }

    let profilePhotoUrl: string | undefined;
    
    // Upload profile photo if provided
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        'staff/profiles',
        `profile-${Date.now()}`
      );
      profilePhotoUrl = result.secure_url;
    }

    // Parse arrays from JSON strings
    let parsedSpecialties: string[] = [];
    let parsedCredentials: string[] = [];
    let parsedWorkSchedule: any = {};

    if (specialties) {
      try {
        parsedSpecialties = JSON.parse(specialties);
      } catch (e) {
        parsedSpecialties = specialties.split(',').map((s: string) => s.trim());
      }
    }

    if (credentials) {
      try {
        parsedCredentials = JSON.parse(credentials);
      } catch (e) {
        parsedCredentials = credentials.split(',').map((c: string) => c.trim());
      }
    }

    if (workSchedule) {
      try {
        parsedWorkSchedule = JSON.parse(workSchedule);
      } catch (e) {
        console.warn('Invalid work schedule format');
      }
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new staff member
    const staffMember = new User({
      name,
      email,
      phone,
      nationalId: nationalId || undefined,
      passwordHash,
      role: staffCategory || 'barber', // Use staffCategory as role, fallback to barber
      salonId,
      profilePhoto: profilePhotoUrl,
      isVerified: true, // Staff members created by owner are pre-verified
      staffCategory,
      specialties: parsedSpecialties,
      experience,
      bio,
      credentials: parsedCredentials,
      workSchedule: parsedWorkSchedule,
    });

    await staffMember.save();

    // Add staff member to salon barbers list
    salon.barbers.push(staffMember._id as any);
    await salon.save();

    // Automatically assign staff to all salon services if no specific assignments
    if (!staffMember.assignedServices || staffMember.assignedServices.length === 0) {
      staffMember.assignedServices = salon.services as any;
      await staffMember.save();
    }

    // Create availability for staff member based on work schedule
    const defaultAvailability = {
      monday: [{ start: '08:00', end: '18:00', available: true }],
      tuesday: [{ start: '08:00', end: '18:00', available: true }],
      wednesday: [{ start: '08:00', end: '18:00', available: true }],
      thursday: [{ start: '08:00', end: '18:00', available: true }],
      friday: [{ start: '08:00', end: '18:00', available: true }],
      saturday: [{ start: '09:00', end: '17:00', available: true }],
      sunday: [{ start: '10:00', end: '16:00', available: true }],
    };

    // Convert work schedule to availability format
    const weeklyAvailability: any = {};
    Object.keys(defaultAvailability).forEach(day => {
      if (parsedWorkSchedule[day] && parsedWorkSchedule[day].available) {
        weeklyAvailability[day] = [{
          start: parsedWorkSchedule[day].start || '08:00',
          end: parsedWorkSchedule[day].end || '18:00',
          available: true
        }];
      } else {
        weeklyAvailability[day] = defaultAvailability[day as keyof typeof defaultAvailability];
      }
    });

    const availability = new Availability({
      barberId: staffMember._id,
      salonId,
      weeklyAvailability,
    });

    await availability.save();

    // Return staff member without password hash
    const staffMemberResponse = await User.findById(staffMember._id).select('-passwordHash');

    // Send welcome email to staff member
    try {
      await sendStaffWelcomeEmail(
        email,
        name,
        salon.name,
        password,
        staffCategory
      );
      console.log(`Welcome email sent to staff member: ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email to staff member:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Staff member created successfully',
      staff: staffMemberResponse,
    });
  } catch (error) {
    console.error('Add staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get salon services
router.get('/:id/services', validateObjectIdParam('id'), async (req, res) => {
  try {
    const salonId = req.params.id;

    const services = await Service.find({ salonId, isActive: true })
      .sort({ category: 1, title: 1 });

    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update service (owner only)
router.patch('/:salonId/services/:serviceId', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('salonId'), validateObjectIdParam('serviceId'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const { salonId, serviceId } = req.params;
    const { title, description, durationMinutes, price, category, targetAudience, isActive } = req.body;

    // Check if user owns the salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update services for this salon' });
      return;
    }

    // Find and update the service
    const service = await Service.findOneAndUpdate(
      { _id: serviceId, salonId },
      { title, description, durationMinutes, price, category, targetAudience, isActive },
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
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

// Delete service (owner only)
router.delete('/:salonId/services/:serviceId', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('salonId'), validateObjectIdParam('serviceId'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const { salonId, serviceId } = req.params;

    // Check if user owns the salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete services for this salon' });
      return;
    }

    // Find and delete the service
    const service = await Service.findOneAndDelete({ _id: serviceId, salonId });

    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
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

// Get salon barbers/staff
router.get('/:id/barbers', validateObjectIdParam('id'), async (req, res) => {
  try {
    const salonId = req.params.id;

    const barbers = await User.find({ 
      salonId, 
      role: 'barber' 
    }).select('-passwordHash');

    res.json({ barbers });
  } catch (error) {
    console.error('Get barbers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all staff members with comprehensive info
router.get('/:id/staff', authenticateToken, validateObjectIdParam('id'), async (req, res) => {
  try {
    const salonId = req.params.id;

    const staff = await User.find({ 
      salonId, 
      role: { $in: ['barber', 'hairstylist', 'nail_technician', 'massage_therapist', 'esthetician', 'receptionist', 'manager'] }
    }).select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({ staff });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update staff member (owner only)
router.patch('/:salonId/staff/:staffId', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('salonId'), validateObjectIdParam('staffId'), upload.single('profilePhoto'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const { salonId, staffId } = req.params;
    const updateData = req.body;

    // Check if user owns the salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update staff in this salon' });
      return;
    }

    // Check if staff member exists and belongs to this salon
    const staffMember = await User.findOne({ _id: staffId, salonId });
    if (!staffMember) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    // Handle profile photo update if provided
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        'staff/profiles',
        `profile-${Date.now()}`
      );
      updateData.profilePhoto = result.secure_url;
    }

    // Parse arrays if they're strings
    if (updateData.specialties && typeof updateData.specialties === 'string') {
      try {
        updateData.specialties = JSON.parse(updateData.specialties);
      } catch (e) {
        updateData.specialties = updateData.specialties.split(',').map((s: string) => s.trim());
      }
    }

    if (updateData.credentials && typeof updateData.credentials === 'string') {
      try {
        updateData.credentials = JSON.parse(updateData.credentials);
      } catch (e) {
        updateData.credentials = updateData.credentials.split(',').map((c: string) => c.trim());
      }
    }

    if (updateData.workSchedule && typeof updateData.workSchedule === 'string') {
      try {
        updateData.workSchedule = JSON.parse(updateData.workSchedule);
      } catch (e) {
        console.warn('Invalid work schedule format in update');
      }
    }

    // Update staff member
    const updatedStaff = await User.findByIdAndUpdate(
      staffId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      message: 'Staff member updated successfully',
      staff: updatedStaff,
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete staff member (owner only)
router.delete('/:salonId/staff/:staffId', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('salonId'), validateObjectIdParam('staffId'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const { salonId, staffId } = req.params;

    // Check if user owns the salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete staff from this salon' });
      return;
    }

    // Check if staff member exists and belongs to this salon
    const staffMember = await User.findOne({ _id: staffId, salonId });
    if (!staffMember) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    // Remove staff member from salon barbers list
    salon.barbers = salon.barbers.filter(barberId => barberId.toString() !== staffId);
    await salon.save();

    // Delete availability records for this staff member
    await Availability.deleteMany({ barberId: staffId });

    // Delete the staff member
    await User.findByIdAndDelete(staffId);

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update staff services (owner only)
router.patch('/:salonId/staff/:staffId/services', authenticateToken, requireOwnerOrAdmin, validateObjectIdParam('salonId'), validateObjectIdParam('staffId'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const { salonId, staffId } = req.params;
    const { services } = req.body;

    // Check if user owns the salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      res.status(404).json({ message: 'Salon not found' });
      return;
    }

    if (salon.ownerId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update staff services for this salon' });
      return;
    }

    // Find and update the staff member's assigned services
    const staff = await User.findOneAndUpdate(
      { _id: staffId, salonId },
      { assignedServices: services },
      { new: true }
    ).select('-passwordHash');

    if (!staff) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    res.json({
      message: 'Staff services updated successfully',
      staff: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        assignedServices: staff.assignedServices
      }
    });
  } catch (error) {
    console.error('Update staff services error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add error handling middleware for ObjectId cast errors
router.use(handleInvalidObjectIdError);

export default router;
