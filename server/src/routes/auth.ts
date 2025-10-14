import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { User } from '../models/User';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { authRateLimit } from '../middlewares/rateLimiter';

// JWT utility function
const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^(\+250|250|0)?[0-9]{9}$/).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('client', 'barber', 'owner').default('client'),
});

const loginSchema = Joi.object({
  phoneOrEmail: Joi.string().required(),
  password: Joi.string().required(),
});

// Register
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.post('/register', authRateLimit, validateRequest(registerSchema), async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

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

    // Create user
    const user = new User({
      name,
      email,
      phone,
      passwordHash,
      role,
    });

    await user.save();

    // Generate JWT
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
    return;
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
});

// Login
router.post('/login', authRateLimit, validateRequest(loginSchema), async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: phoneOrEmail },
        { phone: phoneOrEmail },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user._id.toString());

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        salonId: user.salonId,
        isVerified: user.isVerified,
      },
    });
    return;
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!._id)
      .select('-passwordHash')
      .populate('salonId', 'name address district');

    res.json({
      user: {
        id: user!._id,
        name: user!.name,
        email: user!.email,
        phone: user!.phone,
        role: user!.role,
        salonId: user!.salonId,
        profilePhoto: user!.profilePhoto,
        isVerified: user!.isVerified,
        createdAt: user!.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update profile
router.patch('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, profilePhoto } = req.body;
    const userId = req.user!._id;

    // Check if email or phone is already taken by another user
    if (email || phone) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Email or phone already exists',
        });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user!._id,
        name: user!.name,
        email: user!.email,
        phone: user!.phone,
        role: user!.role,
        salonId: user!.salonId,
        profilePhoto: user!.profilePhoto,
        isVerified: user!.isVerified,
      },
    });
    return;
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
});

export default router;
