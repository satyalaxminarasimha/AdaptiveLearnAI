import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://capl:capl%40123@gateaiprep.iiegdiv.mongodb.net/?retryWrites=true&w=majority&appName=GATEAIPrep';

async function clearTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Delete all professors and students (keep only admin)
    const userResult = await db.collection('users').deleteMany({
      role: { $in: ['professor', 'student'] }
    });
    console.log(`🗑️  Deleted ${userResult.deletedCount} test users (professors & students)`);

    // Delete all syllabus data
    const syllabusResult = await db.collection('syllabi').deleteMany({});
    console.log(`🗑️  Deleted ${syllabusResult.deletedCount} syllabus records`);

    // Delete quiz attempts
    const quizAttemptResult = await db.collection('quizattempts').deleteMany({});
    console.log(`🗑️  Deleted ${quizAttemptResult.deletedCount} quiz attempts`);

    // Delete chat sessions
    const chatResult = await db.collection('chatsessions').deleteMany({});
    console.log(`🗑️  Deleted ${chatResult.deletedCount} chat sessions`);

    // Delete weak areas
    const weakAreaResult = await db.collection('weakareas').deleteMany({});
    console.log(`🗑️  Deleted ${weakAreaResult.deletedCount} weak areas`);

    // Delete student rankings
    const rankingResult = await db.collection('studentrankings').deleteMany({});
    console.log(`🗑️  Deleted ${rankingResult.deletedCount} student rankings`);

    console.log('\n════════════════════════════════════════════');
    console.log('     ✅ TEST DATA CLEARED SUCCESSFULLY');
    console.log('════════════════════════════════════════════');
    console.log('\nOnly the admin user remains in the database.');
    console.log('Admin: admin@adaptivelearn.ai / Admin@LearnAI2024!');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('Error clearing test data:', error);
    process.exit(1);
  }
}

clearTestData();
