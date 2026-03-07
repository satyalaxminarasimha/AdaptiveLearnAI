/**
 * Migration Script: Fix batch format in professor classesTeaching and Quiz records
 * 
 * Converts batch from "2022 - 2023" format to "2022" (year-only) format
 * across User.classesTeaching subdocuments and Quiz documents.
 * 
 * Usage: npx ts-node scripts/fix-batch-format.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixBatchFormat() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const db = mongoose.connection.db!;

  // ============================================================
  // 1. Fix User.classesTeaching batch fields
  // ============================================================
  console.log('=== Fixing User.classesTeaching batch format ===');
  
  const usersCollection = db.collection('users');
  
  // Find all users that have classesTeaching with batch containing " - "
  const usersWithOldBatch = await usersCollection.find({
    'classesTeaching.batch': { $regex: ' - ' }
  }).toArray();

  console.log(`Found ${usersWithOldBatch.length} user(s) with old batch format in classesTeaching`);

  let classesFixed = 0;
  for (const user of usersWithOldBatch) {
    const classes = user.classesTeaching || [];
    let modified = false;
    
    for (const cls of classes) {
      if (cls.batch && cls.batch.includes(' - ')) {
        const oldBatch = cls.batch;
        cls.batch = cls.batch.split(' - ')[0].trim();
        console.log(`  User ${user.email || user._id}: "${oldBatch}" → "${cls.batch}" (${cls.subject}, Section ${cls.section})`);
        modified = true;
        classesFixed++;
      }
    }
    
    if (modified) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { classesTeaching: classes } }
      );
    }
  }
  console.log(`Fixed ${classesFixed} class entries across ${usersWithOldBatch.length} user(s)\n`);

  // ============================================================
  // 2. Fix Quiz batch fields
  // ============================================================
  console.log('=== Fixing Quiz batch format ===');
  
  const quizzesCollection = db.collection('quizzes');
  
  const quizzesWithOldBatch = await quizzesCollection.find({
    batch: { $regex: ' - ' }
  }).toArray();

  console.log(`Found ${quizzesWithOldBatch.length} quiz(zes) with old batch format`);

  for (const quiz of quizzesWithOldBatch) {
    const oldBatch = quiz.batch;
    const newBatch = oldBatch.split(' - ')[0].trim();
    console.log(`  Quiz "${quiz.title || quiz._id}": "${oldBatch}" → "${newBatch}"`);
    
    await quizzesCollection.updateOne(
      { _id: quiz._id },
      { $set: { batch: newBatch } }
    );
  }
  console.log(`Fixed ${quizzesWithOldBatch.length} quiz(zes)\n`);

  // ============================================================
  // 3. Fix QuizAttempt batch fields (if any)
  // ============================================================
  console.log('=== Fixing QuizAttempt batch format ===');
  
  const attemptsCollection = db.collection('quizattempts');
  
  const attemptsWithOldBatch = await attemptsCollection.find({
    batch: { $regex: ' - ' }
  }).toArray();

  console.log(`Found ${attemptsWithOldBatch.length} quiz attempt(s) with old batch format`);

  for (const attempt of attemptsWithOldBatch) {
    const oldBatch = attempt.batch;
    const newBatch = oldBatch.split(' - ')[0].trim();
    
    await attemptsCollection.updateOne(
      { _id: attempt._id },
      { $set: { batch: newBatch } }
    );
  }
  console.log(`Fixed ${attemptsWithOldBatch.length} quiz attempt(s)\n`);

  // ============================================================
  // 4. Fix StudentRanking batch fields (if any)
  // ============================================================
  console.log('=== Fixing StudentRanking batch format ===');
  
  const rankingsCollection = db.collection('studentrankings');
  
  try {
    const rankingsWithOldBatch = await rankingsCollection.find({
      batch: { $regex: ' - ' }
    }).toArray();

    console.log(`Found ${rankingsWithOldBatch.length} ranking(s) with old batch format`);

    for (const ranking of rankingsWithOldBatch) {
      const oldBatch = ranking.batch;
      const newBatch = oldBatch.split(' - ')[0].trim();
      
      await rankingsCollection.updateOne(
        { _id: ranking._id },
        { $set: { batch: newBatch } }
      );
    }
    console.log(`Fixed ${rankingsWithOldBatch.length} ranking(s)\n`);
  } catch {
    console.log('StudentRankings collection not found or empty, skipping\n');
  }

  // ============================================================
  // Summary
  // ============================================================
  console.log('=== Migration Complete ===');
  console.log(`Total classes fixed: ${classesFixed}`);
  console.log(`Total quizzes fixed: ${quizzesWithOldBatch.length}`);
  console.log(`Total attempts fixed: ${attemptsWithOldBatch.length}`);

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
}

fixBatchFormat().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
