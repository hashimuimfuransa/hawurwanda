import express from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middlewares/auth';
import { validateRequest, validateParams } from '../middlewares/validation';
import { User } from '../models/User';
import Joi from 'joi';

const router = express.Router();

// Get current user profile
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

// Update current user profile
router.patch('/me', authenticateToken, async (req: AuthRequest, res): Promise<void> => {
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
        res.status(400).json({
          message: 'Email or phone already exists',
        });
        return;
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
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
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

// Get user by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('salonId', 'name address district');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user (admin only)
router.patch('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { name, email, phone, role, isVerified } = req.body;
    const userId = req.params.id;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
