const mongoose = require('mongoose');
const MedicalRecord = require('./models/MedicalRecord');
const Pet = require('./models/Pet');
require('dotenv').config();

async function checkMedicalRecords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all medical records
    const records = await MedicalRecord.find({}).lean();
    console.log(`📋 Total Medical Records: ${records.length}\n`);

    if (records.length > 0) {
      console.log('Medical Records:');
      console.log('='.repeat(80));
      for (const record of records) {
        console.log(`\nRecord ID: ${record._id}`);
        console.log(`Pet ID: ${record.petId}`);
        console.log(`User ID: ${record.userId}`);
        console.log(`Title: ${record.title}`);
        console.log(`Clinic: ${record.clinic}`);
        console.log(`Doctor: ${record.doctor}`);
        console.log(`Date: ${record.date}`);
        console.log(`Diagnosis: ${record.diagnosis}`);
        console.log(`Prescription: ${record.prescription}`);
        console.log(`Created: ${record.createdAt}`);
        console.log('-'.repeat(80));
      }
    } else {
      console.log('❌ No medical records found in database');
    }

    // Get all pets
    console.log('\n\n🐾 Pets in Database:');
    console.log('='.repeat(80));
    const pets = await Pet.find({}).lean();
    console.log(`Total Pets: ${pets.length}\n`);
    
    for (const pet of pets) {
      console.log(`Pet ID: ${pet._id}`);
      console.log(`Name: ${pet.name}`);
      console.log(`Species: ${pet.species}`);
      console.log(`Owner ID: ${pet.userId}`);
      
      // Count medical records for this pet
      const petRecords = await MedicalRecord.countDocuments({ petId: pet._id });
      console.log(`Medical Records: ${petRecords}`);
      console.log('-'.repeat(80));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

checkMedicalRecords();
