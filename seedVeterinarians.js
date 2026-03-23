const mongoose = require('mongoose');
const Veterinarian = require('./models/Veterinarian');
require('dotenv').config();

// Sample veterinarians data
const sampleVeterinarians = [
  {
    title: { value: 'Dr.', verified: true },
    name: { value: 'Prateeksha B S', verified: true },
    gender: { value: 'Female', verified: true },
    city: { value: 'Bangalore', verified: true },
    experience: { value: 7, verified: true },
    specialization: { value: 'Surgeon', verified: true },
    profilePhotoUrl: { value: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', verified: true },
    qualification: { value: 'BVSc & AH, MVSc Surgery', verified: true },
    qualificationUrl: { value: 'https://example.com/qualification1.pdf', verified: true },
    registration: { value: 'VET001234', verified: true },
    registrationUrl: { value: 'https://example.com/registration1.pdf', verified: true },
    identityProof: { value: 'Aadhaar Card', verified: true },
    identityProofUrl: { value: 'https://example.com/identity1.pdf', verified: true },
    userId: 'user_vet_001',
    isVerified: true,
    isActive: true
  },
  {
    title: { value: 'Dr.', verified: true },
    name: { value: 'Anshuman Gupta', verified: true },
    gender: { value: 'Male', verified: true },
    city: { value: 'Delhi', verified: true },
    experience: { value: 11, verified: true },
    specialization: { value: 'Veterinarian', verified: true },
    profilePhotoUrl: { value: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face', verified: true },
    qualification: { value: 'BVSc & AH, PhD Cardiology', verified: true },
    qualificationUrl: { value: 'https://example.com/qualification2.pdf', verified: true },
    registration: { value: 'VET001235', verified: true },
    registrationUrl: { value: 'https://example.com/registration2.pdf', verified: true },
    identityProof: { value: 'Aadhaar Card', verified: true },
    identityProofUrl: { value: 'https://example.com/identity2.pdf', verified: true },
    userId: 'user_vet_002',
    isVerified: true,
    isActive: true
  },
  {
    title: { value: 'Dr.', verified: true },
    name: { value: 'Sarah Johnson', verified: true },
    gender: { value: 'Female', verified: true },
    city: { value: 'Mumbai', verified: true },
    experience: { value: 5, verified: true },
    specialization: { value: 'Dermatologist', verified: true },
    profilePhotoUrl: { value: 'https://images.unsplash.com/photo-1594824388853-d0d4c0b5b5e7?w=150&h=150&fit=crop&crop=face', verified: true },
    qualification: { value: 'BVSc & AH, MVSc Dermatology', verified: true },
    qualificationUrl: { value: 'https://example.com/qualification3.pdf', verified: true },
    registration: { value: 'VET001236', verified: true },
    registrationUrl: { value: 'https://example.com/registration3.pdf', verified: true },
    identityProof: { value: 'Aadhaar Card', verified: true },
    identityProofUrl: { value: 'https://example.com/identity3.pdf', verified: true },
    userId: 'user_vet_003',
    isVerified: true,
    isActive: true
  },
  {
    title: { value: 'Dr.', verified: true },
    name: { value: 'Rajesh Kumar', verified: true },
    gender: { value: 'Male', verified: true },
    city: { value: 'Chennai', verified: true },
    experience: { value: 9, verified: true },
    specialization: { value: 'Surgeon', verified: true },
    profilePhotoUrl: { value: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face', verified: true },
    qualification: { value: 'BVSc & AH, MVSc Surgery', verified: true },
    qualificationUrl: { value: 'https://example.com/qualification4.pdf', verified: true },
    registration: { value: 'VET001237', verified: true },
    registrationUrl: { value: 'https://example.com/registration4.pdf', verified: true },
    identityProof: { value: 'Aadhaar Card', verified: true },
    identityProofUrl: { value: 'https://example.com/identity4.pdf', verified: true },
    userId: 'user_vet_004',
    isVerified: true,
    isActive: true
  },
  {
    title: { value: 'Dr.', verified: true },
    name: { value: 'Meera Patel', verified: true },
    gender: { value: 'Female', verified: true },
    city: { value: 'Pune', verified: true },
    experience: { value: 6, verified: true },
    specialization: { value: 'Veterinarian', verified: true },
    profilePhotoUrl: { value: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face', verified: true },
    qualification: { value: 'BVSc & AH, MVSc Nutrition', verified: true },
    qualificationUrl: { value: 'https://example.com/qualification5.pdf', verified: true },
    registration: { value: 'VET001238', verified: true },
    registrationUrl: { value: 'https://example.com/registration5.pdf', verified: true },
    identityProof: { value: 'Aadhaar Card', verified: true },
    identityProofUrl: { value: 'https://example.com/identity5.pdf', verified: true },
    userId: 'user_vet_005',
    isVerified: true,
    isActive: true
  }
];

async function seedVeterinarians() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing veterinarians (optional)
    console.log('🗑️ Clearing existing veterinarians...');
    await Veterinarian.deleteMany({});

    // Insert sample veterinarians
    console.log('👨‍⚕️ Adding sample veterinarians...');
    const result = await Veterinarian.insertMany(sampleVeterinarians);
    
    console.log(`✅ Successfully added ${result.length} veterinarians:`);
    result.forEach((vet, index) => {
      console.log(`${index + 1}. Dr. ${vet.name.value} - ${vet.specialization.value} (${vet.city.value})`);
    });

    console.log('🎉 Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedVeterinarians();