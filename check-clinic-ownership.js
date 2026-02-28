const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');
const User = require('./models/User');
const Veterinarian = require('./models/Veterinarian');
require('dotenv').config();

const checkClinicOwnership = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all clinics
    const clinics = await Clinic.find({});
    console.log(`📋 Total Clinics: ${clinics.length}\n`);

    for (const clinic of clinics) {
      console.log(`\n🏥 Clinic: ${clinic.clinicName}`);
      console.log(`   City: ${clinic.city}`);
      console.log(`   Verified: ${clinic.verified}`);
      console.log(`   User ID: ${clinic.userId}`);

      // Find the user
      const user = await User.findById(clinic.userId);
      if (user) {
        console.log(`   👤 User: ${user.name} (${user.email})`);
        console.log(`   📞 Phone: ${user.phone}`);
        console.log(`   🎭 Role: ${user.role}`);
      } else {
        console.log(`   ❌ User not found!`);
      }

      // Find veterinarian profile
      const vet = await Veterinarian.findOne({ userId: clinic.userId });
      if (vet) {
        console.log(`   🩺 Veterinarian: ${vet.name?.value || 'N/A'}`);
        console.log(`   ✅ Vet Verified: ${vet.isVerified}`);
      } else {
        console.log(`   ❌ No veterinarian profile found`);
      }
    }

    await mongoose.connection.close();
    console.log('\n\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkClinicOwnership();
