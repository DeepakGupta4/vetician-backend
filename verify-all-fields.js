require('dotenv').config();
const mongoose = require('mongoose');
const Veterinarian = require('./models/Veterinarian');

const verifyAllFields = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all unverified veterinarians
    const vets = await Veterinarian.find({ isVerified: false });
    console.log(`\n📋 Found ${vets.length} unverified veterinarians\n`);

    for (const vet of vets) {
      console.log(`\n🔍 Checking: ${vet.name?.value} (${vet._id})`);
      
      // List of fields to verify
      const fieldsToVerify = [
        'name', 'gender', 'city', 'experience',
        'specialization', 'qualification', 'qualificationUrl',
        'registration', 'registrationUrl',
        'identityProofUrl', 'profilePhotoUrl'
      ];

      let allFieldsPresent = true;
      
      // Check and verify each field
      for (const field of fieldsToVerify) {
        if (vet[field] && vet[field].value) {
          vet[field].verified = true;
          console.log(`  ✅ ${field}: ${vet[field].verified ? 'VERIFIED' : 'NOT VERIFIED'}`);
        } else {
          console.log(`  ❌ ${field}: MISSING`);
          allFieldsPresent = false;
        }
      }

      if (allFieldsPresent) {
        await vet.save();
        console.log(`\n  🎉 All fields verified! isVerified: ${vet.isVerified}`);
      } else {
        console.log(`\n  ⚠️  Some fields are missing, cannot fully verify`);
      }
    }

    // Show final counts
    const unverifiedCount = await Veterinarian.countDocuments({ isVerified: false });
    const verifiedCount = await Veterinarian.countDocuments({ isVerified: true });
    
    console.log(`\n📊 Final Status:`);
    console.log(`   Unverified: ${unverifiedCount}`);
    console.log(`   Verified: ${verifiedCount}`);

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyAllFields();
