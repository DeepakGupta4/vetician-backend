const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Replace this with your actual token from AsyncStorage
const TOKEN = 'YOUR_TOKEN_HERE';

async function checkToken() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Decode token
    const decoded = jwt.verify(TOKEN, process.env.JWT_SECRET);
    console.log('\n🔍 Decoded Token:');
    console.log(JSON.stringify(decoded, null, 2));

    // Check if user exists
    const user = await User.findById(decoded.userId);
    
    if (user) {
      console.log('\n✅ User Found:');
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
    } else {
      console.log('\n❌ User NOT Found in database!');
      console.log('The userId in the token does not exist.');
      console.log('\n💡 Solution: Log in again to get a fresh token');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      console.log('💡 The token is invalid or malformed');
    } else if (error.name === 'TokenExpiredError') {
      console.log('💡 The token has expired');
    }
  }
}

checkToken();
