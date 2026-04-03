const mongoose = require('mongoose');
require('dotenv').config();

async function verifyConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Connected to MongoDB\n');
    console.log('📊 Database Name:', mongoose.connection.name);
    console.log('🔗 Host:', mongoose.connection.host);
    console.log('🌐 Connection String:', process.env.MONGODB_URI.split('@')[1].split('?')[0]);
    
    console.log('\n📂 All Collections:');
    console.log('='.repeat(80));
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('❌ No collections found! Database is empty.');
    } else {
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`${col.name.padEnd(30)} - ${count} documents`);
      }
    }
    
    console.log('='.repeat(80));
    console.log(`\nTotal Collections: ${collections.length}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyConnection();
