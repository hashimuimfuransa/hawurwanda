import express from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validation';
import { Availability } from '../models/Availability';
import { User } from '../models/User';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const updateAvailabilitySchema = Joi.object({
  weeklyAvailability: Joi.object().required(),
  manuallyBlockedSlots: Joi.array().items(Joi.date()).optional(),
  addedSlots: Joi.array().items(Joi.date()).optional(),
});

// Get barber availability
router.get('/:barberId', async (req, res) => {
  try {
    const { barberId } = req.params;

    const availability = await Availability.findOne({ barberId })
      .populate('barberId', 'name')
      .populate('salonId', 'name');

    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    res.json({ availability });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update barber availability
router.put('/:barberId', authenticateToken, validateRequest(updateAvailabilitySchema), async (req: AuthRequest, res) => {
  try {
    const { barberId } = req.params;
    const { weeklyAvailability, manuallyBlockedSlots, addedSlots } = req.body;

    // Check if user is the barber or salon owner
    const barber = await User.findById(barberId);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    const canUpdate = 
      barberId === req.user!._id.toString() ||
      barber.salonId?.toString() === req.user!.salonId?.toString() ||
      req.user!.role === 'admin' ||
      req.user!.role === 'superadmin';

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this availability' });
    }

    const availability = await Availability.findOneAndUpdate(
      { barberId },
      {
        weeklyAvailability,
        manuallyBlockedSlots: manuallyBlockedSlots || [],
        addedSlots: addedSlots || [],
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('barberId', 'name')
     .populate('salonId', 'name');

    res.json({
      message: 'Availability updated successfully',
      availability,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Block specific time slots
router.post('/:barberId/block', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { barberId } = req.params;
    const { slots } = req.body; // Array of dates to block

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'Slots array is required' });
    }

    // Check if user is the barber or salon owner
    const barber = await User.findById(barberId);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    const canUpdate = 
      barberId === req.user!._id.toString() ||
      barber.salonId?.toString() === req.user!.salonId?.toString() ||
      req.user!.role === 'admin' ||
      req.user!.role === 'superadmin';

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this availability' });
    }

    const availability = await Availability.findOne({ barberId });
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    // Add new blocked slots
    const newBlockedSlots = slots.map((slot: string) => new Date(slot));
    availability.manuallyBlockedSlots.push(...newBlockedSlots);
    await availability.save();

    res.json({
      message: 'Time slots blocked successfully',
      blockedSlots: availability.manuallyBlockedSlots,
    });
  } catch (error) {
    console.error('Block slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unblock specific time slots
router.post('/:barberId/unblock', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { barberId } = req.params;
    const { slots } = req.body; // Array of dates to unblock

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'Slots array is required' });
    }

    // Check if user is the barber or salon owner
    const barber = await User.findById(barberId);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    const canUpdate = 
      barberId === req.user!._id.toString() ||
      barber.salonId?.toString() === req.user!.salonId?.toString() ||
      req.user!.role === 'admin' ||
      req.user!.role === 'superadmin';

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this availability' });
    }

    const availability = await Availability.findOne({ barberId });
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    // Remove blocked slots
    const slotsToRemove = slots.map((slot: string) => new Date(slot));
    availability.manuallyBlockedSlots = availability.manuallyBlockedSlots.filter(
      slot => !slotsToRemove.some(removeSlot => removeSlot.getTime() === slot.getTime())
    );
    await availability.save();

    res.json({
      message: 'Time slots unblocked successfully',
      blockedSlots: availability.manuallyBlockedSlots,
    });
  } catch (error) {
    console.error('Unblock slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
