const express = require('express');
const {
  initializeParavetOnboarding,
  getParavetProfile,
  updatePersonalInfo,
  updateExperienceSkills,
  updatePaymentInfo,
  agreeToCodeOfConduct,
  completeTrainingModule,
  submitApplication,
  uploadDocuments,
  getUnverifiedParavets,
  verifyParavet,
  verifyParavetField
} = require('../controllers/paravetController');

const { auth } = require('../middleware/auth');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Paravet routes working!' });
});

// Test dashboard route
router.get('/dashboard/test', (req, res) => {
  res.json({ message: 'Dashboard route is accessible!', timestamp: new Date() });
});

// Test onboarding endpoint
router.get('/onboarding/test', (req, res) => {
  res.json({ message: 'Onboarding endpoint is accessible', timestamp: new Date() });
});

// User routes
router.post('/initialize', auth, initializeParavetOnboarding);
router.get('/profile/:userId', auth, getParavetProfile);

// Get paravet dashboard data - MUST BE BEFORE OTHER GET ROUTES
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const Paravet = require('../models/Paravet');
    const DoorstepService = require('../models/DoorstepService');
    
    console.log('📊 Dashboard request for userId:', userId);
    const paravet = await Paravet.findOne({ userId });
    
    // Calculate stats from confirmed bookings
    let totalEarnings = 0;
    let totalPatients = 0;
    let recentActivities = [];
    try {
      const confirmedBookings = await DoorstepService.find({ 
        servicePartnerId: userId,
        status: 'confirmed'
      })
      .populate('userId', 'name phone')
      .populate('petIds', 'name species')
      .sort('-appointmentDate')
      .limit(10);
      
      // Calculate total earnings
      totalEarnings = confirmedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
      
      // Calculate unique patients (unique userIds)
      const uniqueUserIds = new Set(confirmedBookings.map(b => b.userId._id.toString()));
      totalPatients = uniqueUserIds.size;
      
      // Format recent activities from confirmed bookings
      recentActivities = confirmedBookings.map(booking => ({
        _id: booking._id,
        title: booking.serviceType,
        description: `${booking.userId?.name || 'Patient'} - ${booking.petIds?.map(p => p.name).join(', ') || 'Pet'}`,
        time: new Date(booking.appointmentDate).toLocaleDateString(),
        color: '#5856D6',
        patientName: booking.userId?.name,
        patientPhone: booking.userId?.phone,
        pets: booking.petIds,
        appointmentDate: booking.appointmentDate,
        timeSlot: booking.timeSlot,
        address: booking.address,
        specialInstructions: booking.specialInstructions
      }));
      
      console.log('💰 Total earnings:', totalEarnings, 'from', confirmedBookings.length, 'confirmed bookings');
      console.log('👥 Total patients:', totalPatients, 'unique users');
      console.log('📋 Recent activities:', recentActivities.length);
    } catch (err) {
      console.error('Error calculating stats:', err);
    }
    
    if (!paravet) {
      console.log('⚠️ No paravet found, returning default pending status');
      return res.json({
        success: true,
        totalPatients,
        upcomingAppointments: 0,
        completedVaccinations: 0,
        totalEarnings,
        recentActivities,
        onboardingStatus: 'pending'
      });
    }
    
    console.log('📋 Paravet found:', {
      submitted: paravet.applicationStatus?.submitted,
      approvalStatus: paravet.applicationStatus?.approvalStatus
    });
    
    let onboardingStatus = 'pending';
    if (paravet.applicationStatus?.submitted) {
      if (paravet.applicationStatus?.approvalStatus === 'approved') {
        onboardingStatus = 'approved';
      } else {
        onboardingStatus = 'submitted';
      }
    }
    
    console.log('✅ Returning onboardingStatus:', onboardingStatus);
    
    res.json({
      success: true,
      totalPatients,
      upcomingAppointments: 0,
      completedVaccinations: 0,
      totalEarnings,
      recentActivities,
      onboardingStatus
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/personal-info/:userId', auth, updatePersonalInfo);
router.patch('/experience-skills/:userId', auth, updateExperienceSkills);
router.patch('/payment-info/:userId', auth, updatePaymentInfo);
router.patch('/code-of-conduct/:userId', auth, agreeToCodeOfConduct);
router.patch('/training/:userId', auth, completeTrainingModule);
router.patch(
  '/upload-documents/:userId',
  uploadDocuments
);

// Update documents endpoint
router.patch('/documents/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const Paravet = require('../models/Paravet');
    
    // Transform the incoming data to match the schema
    const updates = {};
    Object.keys(req.body).forEach(key => {
      updates[key] = req.body[key];
    });
    
    const paravet = await Paravet.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, runValidators: false }
    );
    
    if (!paravet) {
      return res.status(404).json({ success: false, message: 'Paravet not found' });
    }
    
    res.json({ success: true, data: paravet });
  } catch (error) {
    console.error('Document update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/submit/:userId', auth, submitApplication);

// Send submission email
router.post('/send-submission-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Email sending logic (using nodemailer or your email service)
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Onboarding Submitted Successfully - Vetician',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5856D6;">Welcome to Vetician!</h2>
          <p>Dear ${name},</p>
          <p>Your onboarding has been <strong>submitted successfully</strong>.</p>
          <p>Our admin team will review your application and you will receive a notification once your profile is verified.</p>
          <p>Thank you for joining Vetician!</p>
          <br>
          <p>Best regards,<br>Vetician Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', email);
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ success: false, message: 'Email failed but submission successful' });
  }
});

// Complete onboarding submission by document ID (MUST BE BEFORE /onboarding/user/:userId)
router.post('/onboarding/:id', async (req, res) => {
  try {
    console.log('📝 Onboarding submission received for ID:', req.params.id);
    console.log('📦 Request body keys:', Object.keys(req.body));
    
    const Paravet = require('../models/Paravet');
    const mongoose = require('mongoose');
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid paravet ID format' });
    }
    
    const paravet = await Paravet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!paravet) {
      console.log('❌ Paravet not found with ID:', req.params.id);
      return res.status(404).json({ success: false, message: 'Paravet not found' });
    }
    
    console.log('✅ Paravet updated successfully');
    res.json({ success: true, data: paravet });
  } catch (error) {
    console.error('❌ Onboarding submission error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete onboarding submission by userId (legacy)
router.post('/onboarding/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;
    const Paravet = require('../models/Paravet');
    
    const updateData = {
      userId,
      personalInfo: data.personalInfo || {},
      documents: data.documents || {},
      experience: data.experience || {},
      paymentInfo: data.paymentInfo || {},
      compliance: data.compliance || {},
      training: data.training || {},
      applicationStatus: {
        ...data.applicationStatus,
        submitted: true,
        submittedAt: new Date(),
        approvalStatus: 'pending'
      },
      lastUpdated: new Date()
    };
    
    const paravet = await Paravet.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, data: paravet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin routes
router.get('/admin/unverified', getUnverifiedParavets);
router.patch('/admin/verify-field/:id/:field', verifyParavetField);

// Admin verify paravet endpoint
router.patch('/admin/verify/:id', async (req, res) => {
  try {
    const Paravet = require('../models/Paravet');
    const { approvalStatus } = req.body;
    
    const paravet = await Paravet.findByIdAndUpdate(
      req.params.id,
      { 
        'applicationStatus.approvalStatus': approvalStatus || 'approved',
        'applicationStatus.approvedAt': new Date()
      },
      { new: true }
    );
    
    if (!paravet) {
      return res.status(404).json({ success: false, message: 'Paravet not found' });
    }
    
    // Send real-time notification via socket
    const io = req.app.get('io');
    if (io && paravet.userId) {
      io.to(`paravet-${paravet.userId}`).emit('verification-approved', {
        message: 'Congratulations, you are registered successfully.',
        status: 'approved',
        timestamp: new Date()
      });
      console.log(`🔔 Sent approval notification to paravet-${paravet.userId}`);
    }
    
    res.json({ success: true, data: paravet });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin delete paravet endpoint
router.delete('/admin/delete/:id', async (req, res) => {
  try {
    const Paravet = require('../models/Paravet');
    
    const paravet = await Paravet.findByIdAndDelete(req.params.id);
    
    if (!paravet) {
      return res.status(404).json({ success: false, message: 'Paravet not found' });
    }
    
    console.log(`🗑️ Deleted paravet: ${paravet.personalInfo?.fullName?.value}`);
    res.json({ success: true, message: 'Paravet deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get verified paravets for doorstep service
router.get('/verified', async (req, res) => {
  try {
    const Paravet = require('../models/Paravet');
    const User = require('../models/User');
    
    const { userLat, userLon } = req.query;
    console.log('🔍 Fetching verified paravets with location:', { userLat, userLon });
    
    // Find all paravets that are approved and active
    const paravets = await Paravet.find({ 
      'applicationStatus.approvalStatus': 'approved',
      isActive: true 
    });
    
    console.log('📊 Found approved paravets:', paravets.length);
    
    // Calculate distance helper
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(1);
    };
    
    const paravetData = await Promise.all(paravets.map(async (paravet) => {
      const user = await User.findById(paravet.userId);
      
      let distance = 'N/A';
      if (userLat && userLon && paravet.personalInfo?.location?.coordinates) {
        const [lon, lat] = paravet.personalInfo.location.coordinates;
        distance = calculateDistance(parseFloat(userLat), parseFloat(userLon), lat, lon);
      }
      
      return {
        _id: paravet._id,
        id: paravet.userId,
        name: paravet.personalInfo?.fullName?.value || user?.name || 'Unknown',
        photo: paravet.documents?.profilePhoto?.url || 'https://ui-avatars.com/api/?name=User&size=150&background=4E8D7C&color=fff',
        experience: `${paravet.experience?.yearsOfExperience?.value || 0} years`,
        rating: 4.5,
        reviews: 0,
        verified: true,
        specialization: paravet.experience?.areasOfExpertise?.value?.[0] || 'Paravet',
        distance,
        city: paravet.personalInfo?.city?.value || 'Unknown',
        availability: paravet.experience?.availability || {},
        location: paravet.personalInfo?.location,
        personalInfo: paravet.personalInfo,
        documents: paravet.documents,
        experience: paravet.experience,
        paymentInfo: paravet.paymentInfo,
        applicationStatus: paravet.applicationStatus
      };
    }));
    
    console.log('✅ Returning', paravetData.length, 'paravets');
    res.json({ success: true, data: paravetData });
  } catch (error) {
    console.error('❌ Error fetching paravets:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
