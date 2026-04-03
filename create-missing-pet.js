const mongoose = require('mongoose');
const Pet = require('./models/Pet');
require('dotenv').config();

const MISSING_PET_ID = '69cb919386baeab8a587a663';
const USER_ID = '69cb8b5686baeab8a587a639';

async function createMissingPet() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if pet already exists
    const existingPet = await Pet.findById(MISSING_PET_ID);
    if (existingPet) {
      console.log('✅ Pet already exists!');
      console.log('Name:', existingPet.name);
      console.log('Species:', existingPet.species);
      await mongoose.disconnect();
      return;
    }

    // Create the pet with the specific ID
    const pet = new Pet({
      _id: MISSING_PET_ID,
      userId: USER_ID,
      name: 'riyo',
      species: 'Cat',
      breed: 'cat',
      gender: 'Female',
      dob: '2025-04-06',
      weight: 44,
      height: 33,
      color: 'black',
      bloodGroup: 'B',
      location: 'bhopal',
      distinctiveFeatures: 'gvvgvgvg',
      allergies: 'vbbbb',
      currentMedications: 'b  nnbh',
      chronicDiseases: 'vgbbhbhbh',
      injuries: 'gbhbhbhj',
      surgeries: 'ggvbhh',
      vaccinations: 'ggg',
      notes: 'ggvhb'
    });

    await pet.save();
    console.log('✅ Pet created successfully!');
    console.log('ID:', pet._id);
    console.log('Name:', pet.name);
    console.log('Species:', pet.species);
    console.log('Owner ID:', pet.userId);

    await mongoose.disconnect();
    console.log('\n🎉 Done! You can now add medical records for this pet.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

createMissingPet();
