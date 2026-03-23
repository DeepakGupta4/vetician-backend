require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');

async function checkClinics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const clinics = await Clinic.find({ verified: true });
    console.log(`\n📊 Total verified clinics: ${clinics.length}\n`);

    clinics.forEach((clinic, index) => {
      console.log(`${index + 1}. ${clinic.clinicName}`);
      console.log(`   City: ${clinic.city}, ${clinic.locality}`);
      console.log(`   Latitude: ${clinic.latitude}`);
      console.log(`   Longitude: ${clinic.longitude}`);
      console.log(`   Address: ${clinic.streetAddress}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkClinics();
