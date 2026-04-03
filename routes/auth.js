const express = require('express');
const { body } = require('express-validator');

const {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  registerParent,
  getParentById,
  deleteParent,
  updateParent,
  createPet,
  updateUserPet,
  deleteUserPet,
  registerVeterinarian,
  updateVeterinarian,
  getUnverifiedVeterinarians,
  getVerifiedVeterinarians,
  verifyVeterinarianField,
  checkVeterinarianVerification,
  registerClinic,
  getUnverifiedClinics,
  getVerifiedClinics,
  verifyClinic,
  getProfileDetails,
  createPetResort,
  getUnverifiedPetResorts,
  getVerifiedPetResorts,
  verifyPetResort,
  unverifyPetResort,
  getAllClinicsWithVets,
  createAppointment,
  getPetsByUserId,
  deleteAccount,
  sendOTP,
  verifyOTP,
  unverifyVeterinarian,
  deleteVeterinarian,
  unverifyClinic,
  deleteClinic,
  getVeterinarianById,
  updateVeterinarianById,
  getVeterinarianAppointments,
  updateAppointmentStatus,
  getPetParentAppointments,
  getNotifications,
  markNotificationRead,
  changePassword
} = require('../controllers/authController');

const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

/* =========================
   VALIDATIONS
========================= */

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('loginType')
    .optional()
    .isIn(['veterinarian', 'vetician', 'paravet', 'pet_resort'])
    .withMessage('Invalid login type')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body('loginType')
    .optional()
    .isIn(['veterinarian', 'vetician', 'paravet', 'pet_resort', 'admin'])
    .withMessage('Invalid login type')
];

/* =========================
   AUTH ROUTES
========================= */

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

/* =========================
   ADMIN ROUTES
========================= */

const User = require('../models/User');

// Admin Registration
router.post('/admin/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  console.log('🔵 Admin registration attempt:', { username, email });
  
  try {
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }
    
    // Check if admin already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      role: 'admin' 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin with this email already exists' 
      });
    }
    
    // Create new admin user
    const user = new User({
      name: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      phone: null // Admin doesn't need phone
    });
    
    await user.save();
    console.log('✅ Admin created successfully:', user._id);
    
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: { 
        user: user.getPublicProfile() 
      }
    });
  } catch (error) {
    console.error('❌ Admin registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Registration failed' 
    });
  }
});

// Admin Login
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔵 Admin login attempt:', { email });
  
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Find admin user
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      role: 'admin' 
    }).select('+password');
    
    if (!user) {
      console.log('❌ Admin not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials. Please check your email and password.' 
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials. Please check your email and password.' 
      });
    }
    
    // Generate tokens
    const jwt = require('jsonwebtoken');
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
    
    // Save refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save();
    await user.updateLastLogin();
    
    console.log('✅ Admin login successful');
    
    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token: accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

router.post('/refresh-token', refreshToken);
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);

router.post('/delete-account', auth, deleteAccount);
router.post('/change-password', auth, changePassword);

/* =========================
   PARENT ROUTES
========================= */

const parentUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Valid phone number is required'),
  body('address')
    .optional()
    .trim()
];

router.post('/parent-register', registerParent);
router.get('/parents/:userId', getParentById);
router.put('/parent/:userId', auth, updateParent);
router.patch('/parents/:id', updateParent);
router.delete('/parents/:id', deleteParent);

/* =========================
   PET ROUTES
========================= */

router.post('/pet-register', createPet);
router.get('/pets/user/:userId', getPetsByUserId);
router.patch('/users/:userId/pets/:petId', updateUserPet);
router.delete('/users/:userId/pets/:petId', deleteUserPet);

/* =========================
   APPOINTMENT
========================= */

router.post('/petparent/appointments/book', auth, createAppointment);
router.get('/petparent/appointments', auth, getPetParentAppointments);
router.get('/veterinarian/appointments', auth, getVeterinarianAppointments);
router.patch('/appointment/:appointmentId/status', auth, updateAppointmentStatus);

/* =========================
   NOTIFICATIONS
========================= */

router.get('/notifications', auth, getNotifications);
router.patch('/notifications/:notificationId/read', auth, markNotificationRead);

/* =========================
   VETERINARIAN
========================= */

router.post('/veterinarian-register', registerVeterinarian);
router.put('/veterinarian-update', updateVeterinarian);
router.post('/check-veterinarian-verification', checkVeterinarianVerification);

// Get all veterinarians for video consultation
router.get('/veterinarians/all', async (req, res) => {
  try {
    console.log('📋 Fetching all veterinarians from User collection...');
    
    const User = require('../models/User');
    
    // Get all users with veterinarian role
    const veterinarians = await User.find({
      $or: [
        { role: 'veterinarian' },
        { userType: 'veterinarian' },
        { loginType: 'veterinarian' }
      ]
    });
    
    console.log(`✅ Found ${veterinarians.length} veterinarians in User collection`);
    
    res.json({
      success: true,
      veterinarians: veterinarians,
      count: veterinarians.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching veterinarians:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch veterinarians',
      error: error.message
    });
  }
});

router.post('/admin/verified', getVerifiedVeterinarians);
router.post('/admin/unverified', getUnverifiedVeterinarians);
router.patch('/verify/:veterinarianId/:fieldName', verifyVeterinarianField);
router.patch('/unverify/:veterinarianId', unverifyVeterinarian);
router.delete('/veterinarian/:veterinarianId', deleteVeterinarian);
router.get('/veterinarian/details/:veterinarianId', getVeterinarianById);
router.put('/veterinarian/:veterinarianId', updateVeterinarianById);

/* =========================
   CLINIC
========================= */

router.post('/register-clinic', registerClinic);
router.post('/admin/unverified/clinic', getUnverifiedClinics);
router.post('/admin/verified/clinic', getVerifiedClinics);
router.post('/admin/clinic/verify/:clinicId', verifyClinic);
router.post('/admin/clinic/unverify/:clinicId', unverifyClinic);
router.delete('/clinic/:clinicId', deleteClinic);
router.get('/veterinarian/:userId', getProfileDetails);

/* =========================
   PET RESORT
========================= */

router.post('/petresort/register', createPetResort);
router.post('/admin/verified/petresort', getVerifiedPetResorts);
router.post('/admin/unverified/petresort', getUnverifiedPetResorts);
router.post('/admin/petresort/verify/:resortId', verifyPetResort);
router.post('/admin/petresort/unverify/:resortId', unverifyPetResort);

/* =========================
   PUBLIC
========================= */

router.post('/petparent/verified/all-clinic', getAllClinicsWithVets);

/* =========================
   OTP ROUTES
========================= */

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;
