const mongoose = require('mongoose');
const Veterinarian = require('./models/Veterinarian');
const Clinic = require('./models/Clinic');
const User = require('./models/User');
require('dotenv').config();

async function diagnose() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    console.log('='.repeat(60));
    console.log('VETERINARIAN & CLINIC DIAGNOSTIC REPORT');
    console.log('='.repeat(60));
    
    // Get counts
    const users = await User.find({ role: 'veterinarian' });
    const vets = await Veterinarian.find({});
    const clinics = await Clinic.find({});
    
    console.log('\n📊 OVERVIEW:');
    console.log(`   👥 Veterinarian Users: ${users.length}`);
    console.log(`   🩺 Veterinarian Profiles: ${vets.length}`);
    console.log(`   ✅ Verified Veterinarians: ${vets.filter(v => v.isVerified).length}`);
    console.log(`   🏥 Total Clinics: ${clinics.length}`);
    console.log(`   ✅ Verified Clinics: ${clinics.filter(c => c.verified).length}`);
    console.log(`   📍 Clinics with Coordinates: ${clinics.filter(c => c.latitude && c.longitude).length}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('DETAILED BREAKDOWN:');
    console.log('='.repeat(60));
    
    if (clinics.length === 0) {
      console.log('\n⚠️  No clinics found in database!');
      console.log('   Please create a clinic first.');
    } else {
      for (const clinic of clinics) {
        const vet = await Veterinarian.findOne({ userId: clinic.userId });
        const user = await User.findById(clinic.userId);
        
        console.log(`\n🏥 ${clinic.clinicName}`);
        console.log(`   Clinic ID: ${clinic._id}`);
        console.log(`   User ID: ${clinic.userId}`);
        console.log(`   Verified: ${clinic.verified ? '✅ Yes' : '❌ No'}`);
        console.log(`   Has Coordinates: ${(clinic.latitude && clinic.longitude) ? '✅ Yes' : '❌ No'}`);
        if (clinic.latitude && clinic.longitude) {
          console.log(`   Location: ${clinic.latitude}, ${clinic.longitude}`);
        }
        console.log(`   Address: ${clinic.streetAddress}, ${clinic.locality}, ${clinic.city}`);
        console.log(`   Establishment Type: ${clinic.establishmentType}`);
        
        if (vet) {
          console.log(`   Veterinarian: ${vet.name.value}`);
          console.log(`   Vet Verified: ${vet.isVerified ? '✅ Yes' : '❌ No'}`);
        } else {
          console.log(`   ⚠️  No veterinarian profile found for this clinic`);
        }
        
        // Check if this clinic will appear on consumer app
        const willAppear = clinic.verified && clinic.latitude && clinic.longitude;
        console.log(`   Will Appear on Consumer App: ${willAppear ? '✅ YES' : '❌ NO'}`);
        
        if (!willAppear) {
          console.log(`   ⚠️  ISSUES:`);
          if (!clinic.verified) console.log(`      - Clinic not verified`);
          if (!clinic.latitude || !clinic.longitude) console.log(`      - Missing coordinates`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('RECOMMENDATIONS:');
    console.log('='.repeat(60));
    
    const unverifiedClinics = clinics.filter(c => !c.verified).length;
    const clinicsWithoutCoords = clinics.filter(c => !c.latitude || !c.longitude).length;
    
    if (unverifiedClinics > 0) {
      console.log(`\n⚠️  ${unverifiedClinics} clinic(s) need verification`);
      console.log('   Run: node fix-clinic-visibility.js');
    }
    
    if (clinicsWithoutCoords > 0) {
      console.log(`\n⚠️  ${clinicsWithoutCoords} clinic(s) missing coordinates`);
      console.log('   Update clinic addresses with proper location data');
    }
    
    if (unverifiedClinics === 0 && clinicsWithoutCoords === 0 && clinics.length > 0) {
      console.log('\n✅ Everything looks good!');
      console.log('   All clinics are verified and have coordinates.');
      console.log('   They should appear on the consumer app.');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('END OF REPORT');
    console.log('='.repeat(60) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

diagnose();
