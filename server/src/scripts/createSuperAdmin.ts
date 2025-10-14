import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hawurwanda';
    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Create super admin
    const saltRounds = 12;
    const password = 'SuperAdmin123!'; // Change this to a secure password
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const superAdmin = new User({
      name: 'Super Administrator',
      email: 'superadmin@hawurwanda.com',
      phone: '+250700000001',
      passwordHash,
      role: 'superadmin',
      isVerified: true,
    });

    await superAdmin.save();

    console.log('Super admin created successfully!');
    console.log('Email: superadmin@hawurwanda.com');
    console.log('Password: SuperAdmin123!');
    console.log('');
    console.log('IMPORTANT: Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createSuperAdmin();