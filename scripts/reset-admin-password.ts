import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://capl:capl%40123@gateaiprep.iiegdiv.mongodb.net/?retryWrites=true&w=majority&appName=GATEAIPrep';

async function resetAdminPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const hashedPassword = await bcrypt.hash('Admin@LearnAI2024!', 10);
    
    const result = await db.collection('users').updateOne(
      { email: 'admin@adaptivelearn.ai' },
      { 
        $set: { 
          password: hashedPassword,
          isApproved: true
        } 
      }
    );
    
    console.log('✅ Updated admin password');
    console.log(`   Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    // Verify the user
    const admin = await db.collection('users').findOne({ email: 'admin@adaptivelearn.ai' });
    if (admin) {
      console.log('\n📋 Admin user details:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Approved: ${admin.isApproved}`);
    }
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
