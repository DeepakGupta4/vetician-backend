const mongoose = require('mongoose');
require('dotenv').config();

async function showCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Host:', mongoose.connection.host);
    
    console.log('\n📂 ALL COLLECTIONS IN DATABASE:');
    console.log('='.repeat(80));
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Total collections: ${collections.length}\n`);
    
    collections.forEach((col, index) => {
      console.log(`${index + 1}. ${col.name}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Check specifically for medical records
    const medicalCol = collections.find(c => 
      c.name.toLowerCase().includes('medical')
    );
    
    if (medicalCol) {
      console.log('\n✅ MEDICAL RECORDS COLLECTION FOUND!');
      console.log(`   Exact name: "${medicalCol.name}"`);
      
      const count = await mongoose.connection.db
        .collection(medicalCol.name)
        .countDocuments();
      console.log(`   Documents: ${count}`);
      
      // Show sample document
      const sample = await mongoose.connection.db
        .collection(medicalCol.name)
        .findOne({});
      
      if (sample) {
        console.log('\n📄 Sample Medical Record:');
        console.log('   _id:', sample._id);
        console.log('   petId:', sample.petId);
        console.log('   userId:', sample.userId);
        console.log('   title:', sample.title);
        console.log('   clinic:', sample.clinic);
        console.log('   doctor:', sample.doctor);
        console.log('   date:', sample.date);
      }
    } else {
      console.log('\n❌ No medical records collection found');
    }
    
    console.log('\n💡 INSTRUCTIONS FOR MONGODB ATLAS:');
    console.log('1. Go to: https://cloud.mongodb.com');
    console.log('2. Click: Database → Browse Collections');
    console.log('3. Select database: vetecian');
    console.log('4. Press: Ctrl + F (or Cmd + F on Mac)');
    console.log('5. Search for: medical');
    console.log('6. If not found, click the REFRESH button (↻) in Atlas');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

showCollections();
