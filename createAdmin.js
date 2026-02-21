const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI);

async function createAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@vetician.com', role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'Admin',
      email: 'admin@vetician.com',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    
    await admin.save();
    console.log('✅ Admin created successfully');
    console.log('📧 Email: admin@vetician.com');
    console.log('🔑 Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
