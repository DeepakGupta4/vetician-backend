const mongoose = require('mongoose');
require('dotenv').config();

// Old and new database URIs
const OLD_DB = 'mongodb://viplavnagde04_db_user:saEWpGu4ZNdgdr90@ac-hix4znb-shard-00-00.h661erp.mongodb.net:27017,ac-hix4znb-shard-00-01.h661erp.mongodb.net:27017,ac-hix4znb-shard-00-02.h661erp.mongodb.net:27017/vetecian?ssl=true&retryWrites=true&w=majority&authSource=admin';
const NEW_DB = 'mongodb://care_db_user:6XAHgvZKFhpogfbs@ac-uk50yuf-shard-00-00.vhfjoui.mongodb.net:27017,ac-uk50yuf-shard-00-01.vhfjoui.mongodb.net:27017,ac-uk50yuf-shard-00-02.vhfjoui.mongodb.net:27017/vetecian?ssl=true&replicaSet=atlas-4yn6uk-shard-0&authSource=admin&appName=Cluster0';

// Collections to migrate
const COLLECTIONS = [
  'users',
  'parents',
  'pets',
  'veterinarians',
  'clinics',
  'paravets',
  'appointments',
  'petresorts',
  'surgeries',
  'doorstepservices',
  'hostelbookings',
  'cameras',
  'notifications',
  'medicalrecords'
];

async function migrateDatabase() {
  let oldConn, newConn;
  
  try {
    console.log('🔄 Starting database migration...\n');
    
    // Connect to old database
    console.log('📡 Connecting to OLD database...');
    oldConn = await mongoose.createConnection(OLD_DB).asPromise();
    console.log('✅ Connected to OLD database\n');
    
    // Connect to new database
    console.log('📡 Connecting to NEW database...');
    newConn = await mongoose.createConnection(NEW_DB).asPromise();
    console.log('✅ Connected to NEW database\n');
    
    // Get all collections from old database
    const collections = await oldConn.db.listCollections().toArray();
    console.log(`📂 Found ${collections.length} collections in old database\n`);
    
    let totalDocsMigrated = 0;
    
    // Migrate each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      
      // Skip system collections
      if (collectionName.startsWith('system.')) {
        console.log(`⏭️  Skipping system collection: ${collectionName}`);
        continue;
      }
      
      try {
        console.log(`\n📦 Migrating collection: ${collectionName}`);
        
        // Get all documents from old collection
        const oldCollection = oldConn.db.collection(collectionName);
        const documents = await oldCollection.find({}).toArray();
        
        console.log(`   Found ${documents.length} documents`);
        
        if (documents.length > 0) {
          // Insert into new collection
          const newCollection = newConn.db.collection(collectionName);
          
          // Check if collection already has data
          const existingCount = await newCollection.countDocuments();
          if (existingCount > 0) {
            console.log(`   ⚠️  Collection already has ${existingCount} documents`);
            console.log(`   Clearing existing data...`);
            await newCollection.deleteMany({});
          }
          
          await newCollection.insertMany(documents);
          console.log(`   ✅ Migrated ${documents.length} documents`);
          totalDocsMigrated += documents.length;
        } else {
          console.log(`   ℹ️  Empty collection, skipping`);
        }
      } catch (error) {
        console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Total documents migrated: ${totalDocsMigrated}`);
    console.log(`📂 Total collections migrated: ${collections.length}`);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const newCollections = await newConn.db.listCollections().toArray();
    console.log(`✅ New database has ${newCollections.length} collections`);
    
    for (const col of newCollections) {
      if (!col.name.startsWith('system.')) {
        const count = await newConn.db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} documents`);
      }
    }
    
    console.log('\n✅ Migration successful! You can now use the new database.');
    console.log('💡 Restart your backend server to use the new database.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    // Close connections
    if (oldConn) await oldConn.close();
    if (newConn) await newConn.close();
    console.log('\n🔌 Database connections closed');
  }
}

// Run migration
migrateDatabase();
