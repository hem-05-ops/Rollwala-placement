require('dotenv').config({ path: 'c:/Users/HEM/Rollwala-placement66/Rollwala-placement44/Rollwala-placement/backend/.env' });
const mongoose = require('mongoose');

async function checkPendingStudents() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    const Student = db.collection('students');
    // Using the same logic: isApproved: { $ne: true }
    const pendingStudents = await Student.find({ isApproved: { $ne: true } }).toArray();

    console.log(`Pending students count: ${pendingStudents.length}`);
    pendingStudents.forEach(st => console.log(`- ${st.firstName} ${st.lastName} (isApproved: ${st.isApproved})`));

    const Application = db.collection('applications');
    const pendingApps = await Application.find({ status: 'pending' }).toArray();
    console.log(`Pending applications count: ${pendingApps.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkPendingStudents();
