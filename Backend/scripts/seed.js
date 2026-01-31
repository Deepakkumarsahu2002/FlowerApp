require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Categories');
const Occasion = require('../models/Occasion');
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');

// Seed data
const categories = [
  { name: 'Bouquets' },
  { name: 'Plants' },
  { name: 'Arrangements' },
  { name: 'Baskets' },
  { name: 'Dried Flowers' },
  { name: 'Jumbo Bouquet' },
  { name: 'Small Bouquet' },
  { name: 'Mini Bouquets' },
  { name: 'Custom Bouquet' },
  { name: 'Flower Pots' },
];

const occasions = [
  { name: 'Birthday' },
  { name: 'Anniversary' },
  { name: "Valentine's Day" },
  { name: 'Get Well' },
  { name: 'Thank You' },
  { name: 'Corporate' },
  { name: 'Housewarming' },
  { name: 'Sympathy' },
  { name: 'Funeral' },
  { name: 'Congratulations' },
  { name: 'Home Decor' },
  { name: 'Sorry' },
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Seed Categories
    console.log('Seeding categories...');
    for (const category of categories) {
      const existing = await Category.findOne({ name: category.name });
      if (!existing) {
        await Category.create(category);
        console.log(`✓ Created category: ${category.name}`);
      } else {
        console.log(`- Category already exists: ${category.name}`);
      }
    }

    // Seed Occasions
    console.log('\nSeeding occasions...');
    for (const occasion of occasions) {
      const existing = await Occasion.findOne({ name: occasion.name });
      if (!existing) {
        await Occasion.create(occasion);
        console.log(`✓ Created occasion: ${occasion.name}`);
      } else {
        console.log(`- Occasion already exists: ${occasion.name}`);
      }
    }

    // Seed Admin User
    console.log('\nSeeding admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@flowersforever.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = await User.create({
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(`✓ Created admin user: ${adminEmail}`);
    } else {
      console.log(`- Admin user already exists: ${adminEmail}`);
    }

    // Create/Update Admin Role
    const adminRole = await UserRole.findOne({ user_id: adminUser._id });
    if (!adminRole) {
      await UserRole.create({
        user_id: adminUser._id,
        role: 'admin',
      });
      console.log(`✓ Created admin role for user`);
    } else if (adminRole.role !== 'admin') {
      adminRole.role = 'admin';
      await adminRole.save();
      console.log(`✓ Updated user role to admin`);
    } else {
      console.log(`- Admin role already exists`);
    }

    // Create/Update Admin Profile
    const adminProfile = await Profile.findOne({ user_id: adminUser._id });
    if (!adminProfile) {
      await Profile.create({
        user_id: adminUser._id,
        name: adminName,
        phone: '9999999999',
      });
      console.log(`✓ Created admin profile`);
    } else {
      console.log(`- Admin profile already exists`);
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nAdmin Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\nYou can now start the server and login with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
