/**
 * Script to create admin user
 * 
 * Usage: npx tsx scripts/create-admin.ts
 * 
 * Make sure to set environment variables in .env.local:
 * - MONGODB_URI
 * - ADMIN_EMAIL (optional, defaults to admin@adaptivelearn.ai)
 * - ADMIN_PASSWORD (optional, defaults to Admin@LearnAI2024!)
 * - ADMIN_NAME (optional, defaults to System Administrator)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';

// Load from environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@adaptivelearn.ai';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@LearnAI2024!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is not set.');
  console.error('Please create a .env.local file with your MongoDB connection string.');
  process.exit(1);
}

async function createAdmin() {
  console.log('🔗 Connecting to MongoDB...');
  const mongoUri = MONGODB_URI as string; // safe because we exit if undefined above
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  // Check for existing admin
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    console.log(`⚠️  Admin with email "${ADMIN_EMAIL}" already exists.`);
    console.log('If you want to reset the password, delete the existing admin first.');
    await mongoose.disconnect();
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Create admin user
  const admin = new User({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
    isApproved: true,
  });

  await admin.save();
  
  console.log('\n✅ Admin user created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Email:    ${ADMIN_EMAIL}`);
  console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
  console.log(`👤 Name:     ${ADMIN_NAME}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB');
}

createAdmin().catch((error) => {
  console.error('❌ Error creating admin:', error);
  process.exit(1);
});