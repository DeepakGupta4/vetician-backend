const mongoose = require('mongoose');
require('dotenv').config();

const TrainingService = require('./models/TrainingService');

const trainingServices = [
  {
    name: 'Puppy Training',
    description: 'Foundation training for young puppies',
    icon: 'paw',
    color: '#8BC34A',
    duration: '3 Weeks',
    sessions: 9,
    price: 3499,
    level: 'Beginner',
    category: 'Puppy',
    focus: 'Potty training, bite inhibition, crate training, basic commands and early socialization for puppies.',
    isActive: true
  },
  {
    name: 'Basic / Obedience Training',
    description: 'Sit, stay, come & leash skills',
    icon: 'paw',
    color: '#558B2F',
    duration: '4 Weeks',
    sessions: 12,
    price: 4999,
    level: 'Beginner',
    category: 'Obedience',
    focus: 'Sit, Stay, Come, Leash walking, basic impulse control and fundamental obedience commands.',
    isActive: true
  },
  {
    name: 'Behavior Correction',
    description: 'Fix unwanted behaviors & habits',
    icon: 'alert-circle',
    color: '#7CB342',
    duration: '6 Weeks',
    sessions: 18,
    price: 7999,
    level: 'Advanced',
    category: 'Behavior',
    focus: 'Aggression management, anxiety reduction, destructive behavior correction and advanced behavioral modification.',
    isActive: true
  }
];

async function seedTrainingServices() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing training services (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing training services...');
    await TrainingService.deleteMany({});
    console.log('✅ Existing services cleared');

    // Insert new training services
    console.log('📝 Inserting training services...');
    const result = await TrainingService.insertMany(trainingServices);
    console.log(`✅ Successfully added ${result.length} training services:`);
    
    result.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.name} - ₹${service.price}`);
    });

    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding training services:', error.message);
    process.exit(1);
  }
}

// Run the seed function
seedTrainingServices();
