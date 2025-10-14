import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Salon } from '../models/Salon';
import { Service } from '../models/Service';
import { Availability } from '../models/Availability';
import { Booking } from '../models/Booking';
import { Transaction } from '../models/Transaction';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hawu-rwanda');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Salon.deleteMany({});
    await Service.deleteMany({});
    await Availability.deleteMany({});
    await Booking.deleteMany({});
    await Transaction.deleteMany({});
    console.log('🗑️  Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const seedUsers = async () => {
  try {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    const users = [
      {
        name: 'Super Admin',
        email: 'admin@hawu.com',
        phone: '+250788000001',
        passwordHash,
        role: 'superadmin',
        isVerified: true,
      },
      {
        name: 'Moderator',
        email: 'moderator@hawu.com',
        phone: '+250788000002',
        passwordHash,
        role: 'admin',
        isVerified: true,
      },
      {
        name: 'Salon Owner',
        email: 'owner@salon.com',
        phone: '+250788000003',
        passwordHash,
        role: 'owner',
        isVerified: true,
      },
      {
        name: 'Barber John',
        email: 'barber@salon.com',
        phone: '+250788000004',
        passwordHash,
        role: 'barber',
        isVerified: true,
      },
      {
        name: 'Barber Jane',
        email: 'barber2@salon.com',
        phone: '+250788000005',
        passwordHash,
        role: 'barber',
        isVerified: true,
      },
      {
        name: 'Test Client',
        email: 'client@test.com',
        phone: '+250788000006',
        passwordHash,
        role: 'client',
        isVerified: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 Users seeded:', createdUsers.length);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedSalons = async (users: any[]) => {
  try {
    const owner = users.find(u => u.role === 'owner');
    const barbers = users.filter(u => u.role === 'barber');

    const salon = new Salon({
      name: 'Elite Hair Studio',
      address: 'KG 123 St, Kacyiru',
      district: 'Kigali',
      latitude: -1.9441,
      longitude: 30.0619,
      ownerId: owner._id,
      verified: true,
      description: 'Premium hair salon offering cutting-edge styles and treatments',
      phone: '+250788123456',
      email: 'info@elitehair.com',
      workingHours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false },
      },
      barbers: barbers.map(b => b._id),
    });

    await salon.save();

    // Update users with salon reference
    await User.updateMany(
      { _id: { $in: [owner._id, ...barbers.map(b => b._id)] } },
      { salonId: salon._id }
    );

    console.log('🏪 Salon seeded:', salon.name);
    return salon;
  } catch (error) {
    console.error('Error seeding salon:', error);
    throw error;
  }
};

const seedServices = async (salon: any) => {
  try {
    const services = [
      {
        salonId: salon._id,
        title: 'Haircut',
        description: 'Professional haircut and styling',
        durationMinutes: 45,
        price: 5000,
        category: 'haircut',
      },
      {
        salonId: salon._id,
        title: 'Hair Wash & Style',
        description: 'Complete hair wash and styling',
        durationMinutes: 60,
        price: 8000,
        category: 'styling',
      },
      {
        salonId: salon._id,
        title: 'Hair Coloring',
        description: 'Professional hair coloring service',
        durationMinutes: 120,
        price: 25000,
        category: 'coloring',
      },
      {
        salonId: salon._id,
        title: 'Beard Trim',
        description: 'Professional beard trimming and shaping',
        durationMinutes: 30,
        price: 3000,
        category: 'beard',
      },
      {
        salonId: salon._id,
        title: 'Hair Treatment',
        description: 'Deep conditioning hair treatment',
        durationMinutes: 90,
        price: 15000,
        category: 'treatment',
      },
    ];

    const createdServices = await Service.insertMany(services);
    
    // Update salon with services
    await Salon.findByIdAndUpdate(salon._id, {
      services: createdServices.map(s => s._id),
    });

    console.log('✂️  Services seeded:', createdServices.length);
    return createdServices;
  } catch (error) {
    console.error('Error seeding services:', error);
    throw error;
  }
};

const seedAvailability = async (salon: any, barbers: any[]) => {
  try {
    const availabilityPromises = barbers.map(barber => {
      const availability = new Availability({
        barberId: barber._id,
        salonId: salon._id,
        weeklyAvailability: {
          monday: [
            { start: '08:00', end: '12:00', available: true },
            { start: '13:00', end: '18:00', available: true },
          ],
          tuesday: [
            { start: '08:00', end: '12:00', available: true },
            { start: '13:00', end: '18:00', available: true },
          ],
          wednesday: [
            { start: '08:00', end: '12:00', available: true },
            { start: '13:00', end: '18:00', available: true },
          ],
          thursday: [
            { start: '08:00', end: '12:00', available: true },
            { start: '13:00', end: '18:00', available: true },
          ],
          friday: [
            { start: '08:00', end: '12:00', available: true },
            { start: '13:00', end: '18:00', available: true },
          ],
          saturday: [
            { start: '09:00', end: '17:00', available: true },
          ],
          sunday: [
            { start: '10:00', end: '16:00', available: true },
          ],
        },
      });
      return availability.save();
    });

    await Promise.all(availabilityPromises);
    console.log('📅 Availability seeded for', barbers.length, 'barbers');
  } catch (error) {
    console.error('Error seeding availability:', error);
    throw error;
  }
};

const seedBookings = async (users: any[], salon: any, services: any[]) => {
  try {
    const client = users.find(u => u.role === 'client');
    const barber = users.find(u => u.role === 'barber');
    const service = services[0]; // Haircut service

    // Create sample bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);

    const bookings = [
      {
        clientId: client._id,
        barberId: barber._id,
        salonId: salon._id,
        serviceId: service._id,
        date: tomorrow,
        timeSlot: tomorrow,
        amountTotal: service.price,
        depositPaid: service.price * 0.5,
        balanceRemaining: service.price * 0.5,
        paymentStatus: 'partial',
        paymentMethod: 'airtel',
        status: 'confirmed',
      },
      {
        clientId: client._id,
        barberId: barber._id,
        salonId: salon._id,
        serviceId: service._id,
        date: dayAfter,
        timeSlot: dayAfter,
        amountTotal: service.price,
        depositPaid: service.price,
        balanceRemaining: 0,
        paymentStatus: 'paid',
        paymentMethod: 'airtel',
        status: 'pending',
      },
    ];

    const createdBookings = await Booking.insertMany(bookings);

    // Create corresponding transactions
    const transactions = [
      {
        bookingId: createdBookings[0]._id,
        barberId: barber._id,
        salonId: salon._id,
        amount: service.price * 0.5,
        method: 'airtel',
        status: 'completed',
        airtelTransactionCode: 'TXN123456789',
      },
      {
        bookingId: createdBookings[1]._id,
        barberId: barber._id,
        salonId: salon._id,
        amount: service.price,
        method: 'airtel',
        status: 'completed',
        airtelTransactionCode: 'TXN987654321',
      },
    ];

    await Transaction.insertMany(transactions);

    console.log('📅 Bookings seeded:', createdBookings.length);
    console.log('💰 Transactions seeded:', transactions.length);
  } catch (error) {
    console.error('Error seeding bookings:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();

    console.log('🌱 Starting database seeding...');

    const users = await seedUsers();
    const salon = await seedSalons(users);
    const services = await seedServices(salon);
    const barbers = users.filter(u => u.role === 'barber');
    await seedAvailability(salon, barbers);
    await seedBookings(users, salon, services);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Seeded Accounts:');
    console.log('Super Admin: admin@hawu.com / password123');
    console.log('Admin: moderator@hawu.com / password123');
    console.log('Salon Owner: owner@salon.com / password123');
    console.log('Barber: barber@salon.com / password123');
    console.log('Client: client@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
