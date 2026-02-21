const mongoose = require('mongoose');
require('dotenv').config();

async function fixParavet() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Paravet = require('./models/Paravet');
    const User = require('./models/User');
    
    // Find by userId
    let paravet = await Paravet.findOne({ userId: '698b1d9387a629d8de919684' });
    
    if (!paravet) {
      console.log('❌ Paravet not found, creating new one...');
      
      paravet = new Paravet({
        userId: '698b1d9387a629d8de919684',
        personalInfo: {
          fullName: { value: 'Aman', verified: true },
          email: { value: 'm@gmail.com', verified: true },
          city: { value: 'Mumbai', verified: true }
        },
        experience: {
          yearsOfExperience: { value: 2, verified: true },
          areasOfExpertise: { value: ['Vaccinations', 'Pet Care'], verified: true }
        },
        documents: {
          profilePhoto: { url: 'https://randomuser.me/api/portraits/men/32.jpg', verified: true }
        },
        applicationStatus: {
          approvalStatus: 'approved',
          approvedAt: new Date(),
          submitted: true
        },
        isActive: true
      });
      
      await paravet.save();
      console.log('✅ New paravet created');
    } else {
      console.log('📋 Found existing paravet');
      console.log('Current status:', paravet.applicationStatus);
      
      // Force update
      paravet.applicationStatus = {
        currentStep: 9,
        completionPercentage: 100,
        submitted: true,
        submittedAt: new Date(),
        approvalStatus: 'approved',
        approvedAt: new Date()
      };
      
      paravet.isActive = true;
      
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
      console.log('✅ Paravet updated');
    }
    
    // Verify
    const verified = await Paravet.findOne({ 
      userId: '698b1d9387a629d8de919684',
      'applicationStatus.approvalStatus': 'approved',
      isActive: true 
    });
    
    console.log('\n📊 Verification:');
    console.log('Found in approved query:', verified ? 'YES ✅' : 'NO ❌');
    if (verified) {
      console.log('Name:', verified.personalInfo?.fullName?.value);
      console.log('Status:', verified.applicationStatus?.approvalStatus);
      console.log('Active:', verified.isActive);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixParavet();
