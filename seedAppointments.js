require('dotenv').config();
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Veterinarian = require('./models/Veterinarian');
const User = require('./models/User');
const Clinic = require('./models/Clinic');

async function seedAppointments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const vet = await Veterinarian.findOne();
    const user = await User.findOne({ role: 'pet_parent' });
    const clinic = await Clinic.findOne();

    if (!vet || !user || !clinic) {
      console.log('Missing required data. Need at least 1 vet, 1 user, and 1 clinic');
      console.log('Vet:', vet ? 'Found' : 'Not found');
      console.log('User:', user ? 'Found' : 'Not found');
      console.log('Clinic:', clinic ? 'Found' : 'Not found');
      process.exit(1);
    }

    await Appointment.deleteMany({});

    const appointments = [
      {
        clinicId: clinic._id,
        veterinarianId: vet._id,
        userId: user._id,
        petName: 'Bruno',
        petType: 'Dog',
        breed: 'Labrador',
        illness: 'Regular Checkup',
        date: new Date(),
        bookingType: 'in-clinic',
        contactInfo: '9876543210',
        petPic: 'https://place-puppy.com/200x200',
        status: 'confirmed'
      },
      {
        clinicId: clinic._id,
        veterinarianId: vet._id,
        userId: user._id,
        petName: 'Kitty',
        petType: 'Cat',
        breed: 'Persian',
        illness: 'Vaccination',
        date: new Date(Date.now() + 86400000),
        bookingType: 'in-clinic',
        contactInfo: '9876543210',
        petPic: 'https://placekitten.com/200/200',
        status: 'pending'
      },
      {
        clinicId: clinic._id,
        veterinarianId: vet._id,
        userId: user._id,
        petName: 'Max',
        petType: 'Dog',
        breed: 'German Shepherd',
        illness: 'Surgery - Hip Replacement',
        date: new Date(Date.now() - 86400000),
        bookingType: 'in-clinic',
        contactInfo: '9876543210',
        petPic: 'https://place-puppy.com/200x200',
        status: 'completed'
      }
    ];

    await Appointment.insertMany(appointments);
    console.log('✅ Seeded appointments successfully');
    console.log(`Vet ID: ${vet._id}`);
    console.log(`User ID: ${user._id}`);
    console.log(`Clinic ID: ${clinic._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedAppointments();
