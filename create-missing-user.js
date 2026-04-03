const mongoose = require('mongoose');
const User = require('./models/User');
const Parent = require('./models/Parent');
require('dotenv').config();

const MISSING_USER_ID = '69cb8b5686baeab8a587a639';

async function createMissingUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findById(MISSING_USER_ID);
    if (existingUser) {
      console.log('✅ User already exists!');
      console.log('Name:', existingUser.name);
      console.log('Email:', existingUser.email);
      await mongoose.disconnect();
      return;
    }

    // Create the user with the specific ID
    const user = new User({
      _id: MISSING_USER_ID,
      name: 'Pet Parent',
      email: 'petparent@vetician.app',
      phone: '+1234567890',
      password: 'password123',
      role: 'vetician',
      isActive: true
    });

    await user.save();
    console.log('✅ User created successfully!');
    console.log('ID:', user._id);
    console.log('Email:', user.email);

    // Create parent record
    const parent = new Parent({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: 'Not provided',
      user: user._id,
      gender: 'other'
    });

    await parent.save();
    console.log('✅ Parent record created!');

    await mongoose.disconnect();
    console.log('\n🎉 Done! You can now use the app without logging in again.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

createMissingUser();
