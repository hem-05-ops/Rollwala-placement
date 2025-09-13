const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

const createDefaultAccounts = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://hemjshah052:hem0502@cluster0.vd6tt.mongodb.net/placement?retryWrites=true&w=majority';
    await mongoose.connect(mongoURI, {
      retryWrites: true,
      w: "majority",
    });
    console.log('✅ Connected to MongoDB');

    const saltRounds = 10;

    // 1. Create Super Admin
    const superAdminExists = await User.findOne({ email: 'admin@example.com' });
    if (!superAdminExists) {
      const superAdminPassword = await bcrypt.hash('admin123', saltRounds);
      const superAdmin = new User({
        name: 'Super Admin',
        email: 'admin@example.com',
        passwordHash: superAdminPassword,
        role: 'super_admin',
        isSuperAdmin: true
      });
      await superAdmin.save();
      console.log('✅ Super Admin created: admin@example.com / admin123');
    } else {
      console.log('ℹ️ Super Admin already exists');
    }

    // 2. Create Regular Admin
    const adminExists = await User.findOne({ email: 'faculty@example.com' });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('faculty123', saltRounds);
      const admin = new User({
        name: 'Faculty Admin',
        email: 'faculty@example.com',
        passwordHash: adminPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Faculty Admin created: faculty@example.com / faculty123');
    } else {
      console.log('ℹ️ Faculty Admin already exists');
    }

    // 3. Create Student User and Profile
    const studentUserExists = await User.findOne({ email: 'student@example.com' });
    if (!studentUserExists) {
      const studentPassword = await bcrypt.hash('student123', saltRounds);
      const studentUser = new User({
        name: 'Demo Student',
        email: 'student@example.com',
        passwordHash: studentPassword,
        role: 'student'
      });
      await studentUser.save();

      // Create student profile
      const studentProfile = new Student({
        user: studentUser._id,
        rollNo: 'CS2024001',
        course: 'MSc.CS',
        branch: 'WD',
        year: '2nd',
        cgpa: 8.5,
        contact: '+91-9876543210',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
        projects: [
          {
            name: 'E-commerce Platform',
            description: 'Full-stack e-commerce application',
            technology: 'React, Node.js, MongoDB',
            status: 'Completed'
          },
          {
            name: 'Task Management App',
            description: 'Task tracking application with real-time updates',
            technology: 'React, Socket.io, Express',
            status: 'In Progress'
          }
        ],
        certifications: ['AWS Certified Cloud Practitioner', 'React Developer Certification'],
        achievements: ['Dean\'s List 2023', 'Best Project Award - Web Development'],
        linkedin: 'https://linkedin.com/in/demo-student',
        github: 'https://github.com/demo-student'
      });
      await studentProfile.save();
      console.log('✅ Demo Student created: student@example.com / student123');
    } else {
      console.log('ℹ️ Demo Student already exists');
    }

    // 4. Create additional test students
    const testStudents = [
      {
        name: 'Alice Johnson',
        email: 'alice@student.example.com',
        rollNo: 'CS2024002',
        course: 'BSc.CS',
        branch: 'AIML',
        year: '3rd',
        cgpa: 9.2
      },
      {
        name: 'Bob Smith',
        email: 'bob@student.example.com',
        rollNo: 'CS2024003',
        course: 'MCA',
        branch: 'WD',
        year: '1st',
        cgpa: 7.8
      }
    ];

    for (const testStudent of testStudents) {
      const exists = await User.findOne({ email: testStudent.email });
      if (!exists) {
        const password = await bcrypt.hash('student123', saltRounds);
        const user = new User({
          name: testStudent.name,
          email: testStudent.email,
          passwordHash: password,
          role: 'student'
        });
        await user.save();

        const profile = new Student({
          user: user._id,
          rollNo: testStudent.rollNo,
          course: testStudent.course,
          branch: testStudent.branch,
          year: testStudent.year,
          cgpa: testStudent.cgpa,
          contact: '+91-9876543210',
          skills: ['Programming', 'Web Development']
        });
        await profile.save();
        console.log(`✅ Test Student created: ${testStudent.email} / student123`);
      }
    }

    console.log('\n🎉 Default accounts setup completed!');
    console.log('\n📝 Default Credentials:');
    console.log('Super Admin: admin@example.com / admin123');
    console.log('Faculty Admin: faculty@example.com / faculty123');
    console.log('Demo Student: student@example.com / student123');
    console.log('\nYou can now test all features with these accounts.');

  } catch (error) {
    console.error('❌ Error creating default accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
};

// Run the script
createDefaultAccounts();