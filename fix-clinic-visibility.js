const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');
require('dotenv').config();

async function fixClinicVisibility() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all clinics
    const clinics = await Clinic.find({});
    console.log(`📋 Found ${clinics.length} clinic(s) in database\n`);

    if (clinics.length === 0) {
      console.log('⚠️  No clinics found. Please create a clinic first.');
      process.exit(0);
    }

    let fixed = 0;
    let alreadyVerified = 0;
    let missingCoords = 0;

    for (const clinic of clinics) {
      console.log(`\n🏥 Processing: ${clinic.clinicName}`);
      
      if (!clinic.verified) {
        console.log(`   🔧 Verifying clinic...`);
        clinic.verified = true;
        await clinic.save();
        console.log(`   ✅ Clinic verified!`);
        fixed++;
      } else {
        console.log(`   ✅ Already verified`);
        alreadyVerified++;
      }
      
      if (!clinic.latitude || !clinic.longitude) {
        console.log(`   ⚠️  Missing coordinates - clinic may not display properly`);
        missingCoords++;
      } else {
        console.log(`   📍 Has coordinates: ${clinic.latitude}, ${clinic.longitude}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Clinics verified: ${fixed}`);
    console.log(`✓  Already verified: ${alreadyVerified}`);
    console.log(`⚠️  Missing coordinates: ${missingCoords}`);
    
    if (missingCoords > 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('Some clinics are missing coordinates.');
      console.log('Update clinic addresses to include proper location data.');
    }
    
    if (fixed > 0 || alreadyVerified > 0) {
      console.log('\n✅ Clinics should now appear on consumer app!');
      console.log('   Refresh the consumer app to see changes.');
    }

    console.log('\n🎉 Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixClinicVisibility();
