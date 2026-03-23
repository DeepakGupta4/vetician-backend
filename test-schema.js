const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vetician';

async function testSchema() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Paravet = require('./models/Paravet');

    // Find a test paravet
    const testParavet = await Paravet.findOne({});
    
    if (!testParavet) {
      console.log('⚠️ No paravet found in database');
      return;
    }

    console.log('\n📊 Current Paravet Data:');
    console.log('Documents:', JSON.stringify(testParavet.documents, null, 2));
    console.log('Payment Info:', JSON.stringify(testParavet.paymentInfo, null, 2));

    // Test updating with new schema
    testParavet.documents = testParavet.documents || {};
    testParavet.documents.governmentId = {
      idType: 'Aadhaar',
      url: 'https://example.com/test.jpg',
      verified: false
    };

    await testParavet.save();
    console.log('\n✅ Successfully saved with new schema!');
    console.log('Updated Documents:', JSON.stringify(testParavet.documents, null, 2));

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testSchema();
