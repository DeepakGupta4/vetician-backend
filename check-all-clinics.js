const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');
require('dotenv').config();

const checkClinics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all clinics
    const allClinics = await Clinic.find({});
    console.log(`\n📋 Total clinics in database: ${allClinics.length}\n`);

    if (allClinics.length > 0) {
      console.log('Clinic Details:');
      allClinics.forEach((clinic, index) => {
        console.log(`\n${index + 1}. Clinic Name: "${clinic.clinicName}"`);
        console.log(`   City: "${clinic.city}"`);
        console.log(`   Locality: "${clinic.locality}"`);
        console.log(`   User ID: ${clinic.userId}`);
        console.log(`   Verified: ${clinic.verified}`);
        console.log(`   ID: ${clinic._id}`);
      });
    } else {
      console.log('No clinics found in database.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkClinics();
