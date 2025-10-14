import express from 'express';
import multer from 'multer';
import { authenticateToken, requireOwnerOrAdmin, AuthRequest } from '../middlewares/auth';
import { validateRequest, validateParams } from '../middlewares/validation';
import { Salon } from '../models/Salon';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { Availability } from '../models/Availability';
import { Notification } from '../models/Notification';
import Joi from 'joi';
import { uploadToCloudinary, uploadMultipleToCloudinary, uploadVideoToCloudinary } from '../utils/cloudinary';

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
      .populate('services', 'title price durationMinutes category')
      .populate('barbers', 'name profilePhoto')
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
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const salon = await Salon.findById(req.params.id)
      .populate('ownerId', 'name email phone')
      .populate('services', 'title price durationMinutes category description')
      .populate('barbers', 'name profilePhoto');

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
        .populate('services', 'title price durationMinutes')
        .populate('barbers', 'name profilePhoto');

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
router.patch('/:id', authenticateToken, requireOwnerOrAdmin, validateRequest(updateSalonSchema), async (req: AuthRequest, res): Promise<void> => {
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
     .populate('services', 'title price durationMinutes')
     .populate('barbers', 'name profilePhoto');

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
router.post('/:id/gallery', authenticateToken, requireOwnerOrAdmin, upload.array('images', 5), async (req: AuthRequest, res): Promise<void> => {
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
router.post('/:id/services', authenticateToken, requireOwnerOrAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const salonId = req.params.id;
    const { title, description, durationMinutes, price, category } = req.body;

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

// Add barber to salon (owner only)
router.post('/:id/barbers', authenticateToken, requireOwnerOrAdmin, async (req: AuthRequest, res): Promise<void> => {
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
    if (!barber || barber.role !== 'barber') {
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

// Get salon services
router.get('/:id/services', async (req, res) => {
  try {
    const services = await Service.find({ salonId: req.params.id, isActive: true })
      .sort({ category: 1, title: 1 });

    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get salon barbers
router.get('/:id/barbers', async (req, res) => {
  try {
    const barbers = await User.find({ 
      salonId: req.params.id, 
      role: 'barber' 
    }).select('-passwordHash');

    res.json({ barbers });
  } catch (error) {
    console.error('Get barbers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
