// Quick script to approve paravet for testing
const mongoose = require('mongoose');
require('dotenv').config();

async function approveParavet() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Paravet = require('./models/Paravet');
    
    // Find paravet by userId
    const paravet = await Paravet.findOne({ userId: '698b1d9387a629d8de919684' });
    
    if (!paravet) {
      console.log('❌ Paravet not found');
      process.exit(1);
    }

    console.log('📋 Current status:', paravet.applicationStatus?.approvalStatus);

    // Update to approved
    paravet.applicationStatus = {
      ...paravet.applicationStatus,
      approvalStatus: 'approved',
      approvedAt: new Date()
    };
    
    // Add basic info if missing
    if (!paravet.personalInfo?.fullName?.value) {
      paravet.personalInfo = {
        fullName: { value: 'Aman', verified: true },
        email: { value: 'm@gmail.com', verified: true },
        city: { value: 'Mumbai', verified: true }
      };
    }

    if (!paravet.experience?.yearsOfExperience?.value) {
      paravet.experience = {
        yearsOfExperience: { value: 2, verified: true },
        areasOfExpertise: { value: ['Vaccinations', 'Pet Care'], verified: true }
      };
    }

    if (!paravet.documents?.profilePhoto?.url) {
      paravet.documents = {
        profilePhoto: { url: 'https://randomuser.me/api/portraits/men/32.jpg', verified: true }
      };
    }

    await paravet.save();
    
    console.log('✅ Paravet approved successfully!');
    console.log('📊 Updated data:', {
      name: paravet.personalInfo?.fullName?.value,
      status: paravet.applicationStatus?.approvalStatus,
      experience: paravet.experience?.yearsOfExperience?.value
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

approveParavet();
