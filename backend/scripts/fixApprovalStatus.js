/**
 * fixApprovalStatus.js
 *
 * One-time fix: marks all Student documents where isApproved is NOT strictly
 * true (i.e. false / null / undefined / missing) as approved.
 *
 * Run with:
 *   node scripts/fixApprovalStatus.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env');
  process.exit(1);
}

async function fix() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected');

  // Both models must be required AFTER connect so Mongoose registers their schemas
  require('../models/User');
  const Student = require('../models/Student');


  // 1. Show all students and their current isApproved value
  const all = await Student.find({}).select('firstName lastName rollNo isApproved').populate('user', 'email');
  console.log('\n📋 All students in DB:');
  all.forEach(s => {
    const email = s.user?.email || '(no user record)';
    console.log(`  - ${s.firstName} ${s.lastName} | rollNo: ${s.rollNo} | email: ${email} | isApproved: ${s.isApproved}`);
  });

  // 2. Find stuck students (isApproved is not strictly true)
  const stuck = await Student.find({ isApproved: { $ne: true } });
  console.log(`\n🚨 Found ${stuck.length} stuck student(s) (isApproved is not true)`);

  if (stuck.length === 0) {
    console.log('✅ No students need fixing.');
  } else {
    stuck.forEach(s => {
      const email = s.user?.email || '(no user record)';
      console.log(`  → Will approve: ${s.firstName} ${s.lastName} | ${email} | current isApproved: ${s.isApproved}`);
    });

    // 3. Bulk-approve all stuck students
    const result = await Student.updateMany(
      { isApproved: { $ne: true } },
      { $set: { isApproved: true } },
      { runValidators: false }
    );
    console.log(`\n✅ Done! Updated ${result.modifiedCount} student record(s).`);
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected. Students can now log in.');
  process.exit(0);
}

fix().catch(err => {
  console.error('❌ Script error:', err);
  process.exit(1);
});
