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

// User routes
router.post('/initialize', auth, initializeParavetOnboarding);
router.get('/profile/:userId', auth, getParavetProfile);
router.patch('/personal-info/:userId', auth, updatePersonalInfo);
router.patch('/experience-skills/:userId', auth, updateExperienceSkills);
router.patch('/payment-info/:userId', auth, updatePaymentInfo);
router.patch('/code-of-conduct/:userId', auth, agreeToCodeOfConduct);
router.patch('/training/:userId', auth, completeTrainingModule);
router.patch(
  '/upload-documents/:userId',
  uploadDocuments
);
router.post('/submit/:userId', auth, submitApplication);

// Admin routes
router.get('/admin/unverified', getUnverifiedParavets);
router.patch('/admin/verify/:id', verifyParavet);
router.patch('/admin/verify-field/:id/:field', verifyParavetField);

// Get verified paravets for doorstep service
router.get('/verified', async (req, res) => {
  try {
    const Paravet = require('../models/Paravet');
    const User = require('../models/User');
    
    console.log('🔍 Fetching verified paravets...');
    
    // Find all paravets that are approved and active
    const paravets = await Paravet.find({ 
      'applicationStatus.approvalStatus': 'approved',
      isActive: true 
    });
    
    console.log('📊 Found approved paravets:', paravets.length);
    
    // Also find users with paravet role who don't have a Paravet document yet
    const paravetUsers = await User.find({ role: 'paravet', isActive: true });
    console.log('📊 Found paravet users:', paravetUsers.length);
    
    // Create a Set of userIds that already have Paravet documents
    const existingParavetUserIds = new Set(paravets.map(p => p.userId));
    
    // Find users without Paravet documents
    const usersWithoutParavetDoc = paravetUsers.filter(user => 
      !existingParavetUserIds.has(user._id.toString())
    );
    
    console.log('📊 Users without Paravet doc:', usersWithoutParavetDoc.length);
    
    // Create Paravet documents for users who don't have one
    for (const user of usersWithoutParavetDoc) {
      console.log('⚠️ Creating Paravet doc for user:', user._id, user.name);
      const newParavet = new Paravet({
        userId: user._id.toString(),
        personalInfo: {
          fullName: { value: user.name, verified: true },
          email: { value: user.email, verified: true }
        },
        applicationStatus: {
          currentStep: 1,
          completionPercentage: 10,
          submitted: false,
          approvalStatus: 'approved',
          approvedAt: new Date()
        },
        isActive: true
      });
      await newParavet.save();
      paravets.push(newParavet);
    }
    
    const paravetData = await Promise.all(paravets.map(async (paravet) => {
      const user = await User.findById(paravet.userId);
      console.log('👤 Paravet:', {
        userId: paravet.userId,
        name: paravet.personalInfo?.fullName?.value || user?.name,
        status: paravet.applicationStatus?.approvalStatus
      });
      
      return {
        id: paravet.userId,
        name: paravet.personalInfo?.fullName?.value || user?.name || 'Unknown',
        photo: paravet.documents?.profilePhoto?.url || 'https://via.placeholder.com/150',
        experience: `${paravet.experience?.yearsOfExperience?.value || 0} years`,
        rating: 4.5,
        reviews: 0,
        verified: true,
        specialization: paravet.experience?.areasOfExpertise?.value?.[0] || 'Paravet',
        distance: '0 km',
        city: paravet.personalInfo?.city?.value || 'Unknown',
        availability: paravet.experience?.availability || {}
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
