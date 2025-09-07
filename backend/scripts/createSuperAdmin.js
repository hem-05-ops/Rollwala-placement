const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hemjshah052:hem0502@cluster0.vd6tt.mongodb.net/placement?retryWrites=true&w=majority';

async function createSuperAdmin() {
  try {
    // Check for required environment variables
    const adminEmail = 'superadmin@gmail.com';
    const adminPassword = 'Super@123';
    const adminName = 'Super Admin';


    // Connect to MongoDB
  await mongoose.connect('mongodb+srv://hemjshah052:hem0502@cluster0.vd6tt.mongodb.net/placement?retryWrites=true&w=majority');
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.name}`);
      process.exit(0);
    }

    // Check if admin with this email exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log(`⚠️  User with email ${adminEmail} already exists`);
      console.log(`   Current role: ${existingUser.role}`);
      
      // Update to super admin if not already
      if (existingUser.role !== 'super_admin') {
        existingUser.role = 'super_admin';
        existingUser.isSuperAdmin = true;
        await existingUser.save();
        console.log('✅ Updated user to super admin');
      }
      process.exit(0);
    }

    // Create super admin user
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    const superAdmin = new User({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'super_admin',
      isSuperAdmin: true,
      isActive: true
    });

    await superAdmin.save();
    console.log('✅ Super admin created successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: super_admin`);
    console.log('🔐 Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createSuperAdmin();

