const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');
require('dotenv').config();

// Replace with your actual userId
const YOUR_USER_ID = process.argv[2];

const verifyUserClinic = async () => {
  try {
    if (!YOUR_USER_ID) {
      console.log('❌ Please provide userId as argument');
      console.log('Usage: node verify-user-clinic.js <userId>');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find and verify user's clinic
    const clinic = await Clinic.findOneAndUpdate(
      { userId: YOUR_USER_ID },
      { verified: true },
      { new: true }
    );

    if (clinic) {
      console.log(`\n✅ Clinic verified successfully!`);
      console.log(`   Clinic Name: ${clinic.clinicName}`);
      console.log(`   City: ${clinic.city}`);
      console.log(`   Verified: ${clinic.verified}\n`);
    } else {
      console.log('\n❌ No clinic found for this user\n');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyUserClinic();
