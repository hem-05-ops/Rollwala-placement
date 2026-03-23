require('dotenv').config({ path: 'c:/Users/HEM/Rollwala-placement66/Rollwala-placement44/Rollwala-placement/backend/.env' });
const mongoose = require('mongoose');
const Application = require('c:/Users/HEM/Rollwala-placement66/Rollwala-placement44/Rollwala-placement/backend/models/Application.js');
const Job = require('c:/Users/HEM/Rollwala-placement66/Rollwala-placement44/Rollwala-placement/backend/models/Job.js');

async function checkApps() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const app = await Application.findOne().populate('job');
    console.log(JSON.stringify(app, null, 2));
  } catch(e) { console.error(e); } finally { mongoose.connection.close(); }
}
checkApps();
