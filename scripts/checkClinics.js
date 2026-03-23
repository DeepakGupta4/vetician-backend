const mongoose = require('mongoose');
const Clinic = require('../models/Clinic');
require('dotenv').config();

const checkClinics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const clinics = await Clinic.find({}).limit(5);
    
    console.log('📊 Clinic Data:');
    clinics.forEach(clinic => {
      console.log(`🏥 ${clinic.clinicName}:`);
      console.log(`   City: ${clinic.city}`);
      console.log(`   Lat: ${clinic.latitude}`);
      console.log(`   Lon: ${clinic.longitude}`);
      console.log(`   Verified: ${clinic.verified}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkClinics();