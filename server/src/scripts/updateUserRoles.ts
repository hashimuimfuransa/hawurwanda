import mongoose from 'mongoose';
import { User } from '../models/User';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hawu-rwanda');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update user roles based on staffCategory
const updateUserRoles = async () => {
  try {
    console.log('Starting user role update...');
    
    // Find all users with staffCategory but role is 'barber'
    const usersToUpdate = await User.find({
      staffCategory: { $exists: true, $ne: null },
      role: 'barber'
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    for (const user of usersToUpdate) {
      if (user.staffCategory && user.staffCategory !== 'barber') {
        console.log(`Updating user ${user.name} (${user.email}) from 'barber' to '${user.staffCategory}'`);
        
        await User.findByIdAndUpdate(user._id, {
          role: user.staffCategory
        });
        
        console.log(`✓ Updated ${user.name} to role: ${user.staffCategory}`);
      }
    }

    console.log('User role update completed!');
  } catch (error) {
    console.error('Error updating user roles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the update
connectDB().then(() => {
  updateUserRoles();
});
