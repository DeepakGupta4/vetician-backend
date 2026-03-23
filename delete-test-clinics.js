const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');
require('dotenv').config();

const deleteTestClinics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all clinics from Delhi city (or specific test clinics)
    const result = await Clinic.deleteMany({ 
      city: 'Delhi',
      clinicName: { $in: ['Delhi Clinic', 'Delhi clinic', 'D Clinic'] }
    });

    console.log(`🗑️  Deleted ${result.deletedCount} test clinics from Delhi`);

    // Show remaining clinics
    const remaining = await Clinic.find({ city: 'Delhi' });
    console.log(`📋 Remaining clinics in Delhi: ${remaining.length}`);
    remaining.forEach(c => console.log(`   - ${c.clinicName}`));

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

deleteTestClinics();
