const mongoose = require('mongoose');
require('dotenv').config();

const TrainingService = require('./models/TrainingService');

async function testTrainingServices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Test 1: Get all services
    console.log('📋 Test 1: Fetching all training services...');
    const allServices = await TrainingService.find();
    console.log(`✅ Found ${allServices.length} services\n`);

    // Test 2: Get active services
    console.log('📋 Test 2: Fetching active services...');
    const activeServices = await TrainingService.find({ isActive: true });
    console.log(`✅ Found ${activeServices.length} active services\n`);

    // Test 3: Get services by category
    console.log('📋 Test 3: Fetching Puppy category services...');
    const puppyServices = await TrainingService.find({ category: 'Puppy' });
    console.log(`✅ Found ${puppyServices.length} puppy training services\n`);

    // Display all services
    console.log('📝 All Training Services:');
    console.log('═'.repeat(80));
    allServices.forEach((service, index) => {
      console.log(`\n${index + 1}. ${service.name}`);
      console.log(`   Description: ${service.description}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Level: ${service.level}`);
      console.log(`   Duration: ${service.duration}`);
      console.log(`   Sessions: ${service.sessions}`);
      console.log(`   Price: ₹${service.price}`);
      console.log(`   Active: ${service.isActive ? '✅' : '❌'}`);
      console.log(`   Focus: ${service.focus}`);
    });
    console.log('\n' + '═'.repeat(80));

    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing training services:', error.message);
    process.exit(1);
  }
}

// Run the test
testTrainingServices();
