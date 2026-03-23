const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');
require('dotenv').config();

// Replace with your actual userId
const YOUR_USER_ID = process.argv[2];

const checkUserClinics = async () => {
  try {
    if (!YOUR_USER_ID) {
      console.log('❌ Please provide userId as argument');
      console.log('Usage: node check-user-clinics.js <userId>');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const userClinics = await Clinic.find({ userId: YOUR_USER_ID });
    
    console.log(`\n📋 Clinics registered by user ${YOUR_USER_ID}: ${userClinics.length}\n`);

    if (userClinics.length > 0) {
      userClinics.forEach((clinic, index) => {
        console.log(`${index + 1}. ${clinic.clinicName} - ${clinic.city}`);
        console.log(`   Verified: ${clinic.verified}`);
        console.log(`   ID: ${clinic._id}\n`);
      });
    } else {
      console.log('✅ No clinics found for this user. You can register a new clinic!');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkUserClinics();
