const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');

async function manageClinics() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Database connected\n');

    // Fetch all clinics
    const clinics = await Clinic.find().populate('userId', 'name email phone');
    
    console.log(`📋 Total Clinics: ${clinics.length}\n`);
    
    if (clinics.length === 0) {
      console.log('No clinics found in database');
      process.exit(0);
    }

    // Display all clinics
    clinics.forEach((clinic, index) => {
      console.log(`${index + 1}. Clinic Name: ${clinic.clinicName}`);
      console.log(`   City: ${clinic.city}`);
      console.log(`   Locality: ${clinic.locality}`);
      console.log(`   Owner: ${clinic.userId?.name || 'N/A'} (${clinic.userId?.email || 'N/A'})`);
      console.log(`   Verified: ${clinic.verified}`);
      console.log(`   ID: ${clinic._id}`);
      console.log('---');
    });

    // Find and remove dummy clinics
    const dummyKeywords = ['dummy', 'test', 'sample', 'demo'];
    const dummyClinics = clinics.filter(clinic => 
      dummyKeywords.some(keyword => 
        clinic.clinicName.toLowerCase().includes(keyword)
      )
    );

    if (dummyClinics.length > 0) {
      console.log(`\n🗑️  Found ${dummyClinics.length} dummy clinic(s):`);
      dummyClinics.forEach(clinic => {
        console.log(`   - ${clinic.clinicName} (${clinic._id})`);
      });

      const deletedIds = dummyClinics.map(c => c._id);
      const result = await Clinic.deleteMany({ _id: { $in: deletedIds } });
      console.log(`\n✅ Removed ${result.deletedCount} dummy clinic(s)`);
    } else {
      console.log('\n✅ No dummy clinics found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

manageClinics();
