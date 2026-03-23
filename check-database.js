const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetician';

async function checkDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const paravetsCollection = db.collection('paravets');

    const paravets = await paravetsCollection.find({}).toArray();
    console.log(`📊 Total Paravets: ${paravets.length}\n`);

    paravets.forEach((paravet, index) => {
      console.log(`\n--- Paravet ${index + 1} ---`);
      console.log(`ID: ${paravet._id}`);
      console.log(`User ID: ${paravet.userId}`);
      
      // Check personal info
      console.log('\n📝 Personal Info:');
      console.log(`  Name: ${paravet.personalInfo?.fullName?.value || 'NOT SET'}`);
      console.log(`  Email: ${paravet.personalInfo?.email?.value || 'NOT SET'}`);
      console.log(`  Mobile: ${paravet.personalInfo?.mobileNumber?.value || 'NOT SET'}`);
      
      // Check documents
      console.log('\n📄 Documents:');
      const govId = paravet.documents?.governmentId;
      if (govId) {
        console.log(`  Government ID:`);
        console.log(`    - idType: ${govId.idType || govId.type || 'MISSING'}`);
        console.log(`    - url: ${govId.url ? 'SET' : 'MISSING'}`);
        console.log(`    - verified: ${govId.verified}`);
      } else {
        console.log(`  Government ID: NOT UPLOADED`);
      }
      
      const certProof = paravet.documents?.certificationProof;
      if (certProof) {
        console.log(`  Certification Proof:`);
        console.log(`    - certificationType: ${certProof.certificationType || certProof.type || 'MISSING'}`);
        console.log(`    - url: ${certProof.url ? 'SET' : 'MISSING'}`);
        console.log(`    - verified: ${certProof.verified}`);
      } else {
        console.log(`  Certification Proof: NOT UPLOADED`);
      }
      
      const profilePhoto = paravet.documents?.profilePhoto;
      if (profilePhoto) {
        console.log(`  Profile Photo:`);
        console.log(`    - url: ${profilePhoto.url ? 'SET' : 'MISSING'}`);
        console.log(`    - verified: ${profilePhoto.verified}`);
      } else {
        console.log(`  Profile Photo: NOT UPLOADED`);
      }
      
      // Check payment info
      console.log('\n💳 Payment Info:');
      const payMethod = paravet.paymentInfo?.paymentMethod;
      if (payMethod) {
        console.log(`  Method Type: ${payMethod.methodType || payMethod.type || 'MISSING'}`);
        console.log(`  Value: ${payMethod.value ? 'SET' : 'MISSING'}`);
      } else {
        console.log(`  Payment Method: NOT SET`);
      }
      
      // Check application status
      console.log('\n📋 Application Status:');
      console.log(`  Current Step: ${paravet.applicationStatus?.currentStep || 1}`);
      console.log(`  Submitted: ${paravet.applicationStatus?.submitted || false}`);
      console.log(`  Approval Status: ${paravet.applicationStatus?.approvalStatus || 'pending'}`);
      
      console.log('\n' + '='.repeat(50));
    });

    console.log('\n\n🔍 Schema Issues Check:');
    let hasIssues = false;
    
    paravets.forEach((paravet, index) => {
      const issues = [];
      
      // Check for old 'type' structure
      if (paravet.documents?.governmentId?.type && typeof paravet.documents.governmentId.type === 'object') {
        issues.push('governmentId has nested type object');
      }
      if (paravet.documents?.certificationProof?.type && typeof paravet.documents.certificationProof.type === 'object') {
        issues.push('certificationProof has nested type object');
      }
      if (paravet.paymentInfo?.paymentMethod?.type && typeof paravet.paymentInfo.paymentMethod.type === 'object') {
        issues.push('paymentMethod has nested type object');
      }
      
      if (issues.length > 0) {
        hasIssues = true;
        console.log(`\n⚠️ Paravet ${index + 1} (${paravet._id}) has issues:`);
        issues.forEach(issue => console.log(`   - ${issue}`));
      }
    });
    
    if (!hasIssues) {
      console.log('\n✅ No schema issues found! All documents are using the correct structure.');
    } else {
      console.log('\n\n❌ Schema issues found! Run: node fix-schema-migration.js');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n\n👋 Disconnected from MongoDB');
  }
}

checkDatabase();
