const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetician';

async function migrateData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const paravetsCollection = db.collection('paravets');

    // Find all paravets
    const paravets = await paravetsCollection.find({}).toArray();
    console.log(`📊 Found ${paravets.length} paravet documents`);

    let updatedCount = 0;

    for (const paravet of paravets) {
      const updates = {};
      let needsUpdate = false;

      // Fix documents.governmentId structure
      if (paravet.documents?.governmentId) {
        const govId = paravet.documents.governmentId;
        // Check if it has the old 'type' structure
        if (govId.type && typeof govId.type === 'object') {
          updates['documents.governmentId'] = {
            idType: govId.type.type || govId.type || 'uploaded',
            url: govId.type.url || govId.url || '',
            verified: govId.type.verified || govId.verified || false
          };
          needsUpdate = true;
        } else if (govId.type && typeof govId.type === 'string') {
          // Already has idType or needs conversion
          updates['documents.governmentId'] = {
            idType: govId.type,
            url: govId.url || '',
            verified: govId.verified || false
          };
          needsUpdate = true;
        }
      }

      // Fix documents.certificationProof structure
      if (paravet.documents?.certificationProof) {
        const certProof = paravet.documents.certificationProof;
        if (certProof.type && typeof certProof.type === 'object') {
          updates['documents.certificationProof'] = {
            url: certProof.type.url || certProof.url || '',
            certificationType: certProof.type.certificationType || 'uploaded',
            verified: certProof.type.verified || certProof.verified || false
          };
          needsUpdate = true;
        } else if (certProof.type && typeof certProof.type === 'string') {
          updates['documents.certificationProof'] = {
            url: certProof.url || '',
            certificationType: certProof.type || 'uploaded',
            verified: certProof.verified || false
          };
          needsUpdate = true;
        }
      }

      // Fix paymentInfo.paymentMethod structure
      if (paravet.paymentInfo?.paymentMethod) {
        const payMethod = paravet.paymentInfo.paymentMethod;
        if (payMethod.type && typeof payMethod.type === 'object') {
          updates['paymentInfo.paymentMethod'] = {
            methodType: payMethod.type.type || payMethod.type || 'upi',
            value: payMethod.type.value || payMethod.value || '',
            verified: payMethod.type.verified || payMethod.verified || false
          };
          needsUpdate = true;
        } else if (payMethod.type && typeof payMethod.type === 'string') {
          updates['paymentInfo.paymentMethod'] = {
            methodType: payMethod.type,
            value: payMethod.value || '',
            verified: payMethod.verified || false
          };
          needsUpdate = true;
        }
      }

      // Apply updates if any
      if (needsUpdate && Object.keys(updates).length > 0) {
        await paravetsCollection.updateOne(
          { _id: paravet._id },
          { $set: updates }
        );
        updatedCount++;
        console.log(`✅ Updated paravet ${paravet._id}`);
        console.log('   Updates:', JSON.stringify(updates, null, 2));
      }
    }

    console.log(`\n🎉 Migration complete! Updated ${updatedCount} documents`);
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

migrateData();
