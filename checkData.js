require('dotenv').config();
const mongoose = require('mongoose');
const Veterinarian = require('./models/Veterinarian');
const User = require('./models/User');
const Clinic = require('./models/Clinic');
const Appointment = require('./models/Appointment');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const vets = await Veterinarian.find();
    const users = await User.find();
    const clinics = await Clinic.find();
    const appointments = await Appointment.find();

    console.log(`Veterinarians: ${vets.length}`);
    if (vets.length > 0) console.log('First Vet:', vets[0]._id, vets[0].name);
    
    console.log(`\nUsers: ${users.length}`);
    if (users.length > 0) console.log('First User:', users[0]._id, users[0].name, users[0].role);
    
    console.log(`\nClinics: ${clinics.length}`);
    if (clinics.length > 0) console.log('First Clinic:', clinics[0]._id, clinics[0].name);
    
    console.log(`\nAppointments: ${appointments.length}`);
    if (appointments.length > 0) {
      console.log('First Appointment:', appointments[0]._id);
      console.log('VetID:', appointments[0].veterinarianId);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
