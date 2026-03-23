const Paravet = require('../models/Paravet');
const User = require('../models/User');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

// Initialize paravet onboarding
const initializeParavetOnboarding = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  // Check if paravet already exists
  const existingParavet = await Paravet.findOne({ userId });
  if (existingParavet) {
    return res.status(200).json({
      success: true,
      message: 'Paravet onboarding already started',
      data: existingParavet
    });
  }

  // Create new paravet record
  const newParavet = await Paravet.create({ userId });

  res.status(201).json({
    success: true,
    message: 'Paravet onboarding initialized',
    data: newParavet
  });
});

// Get paravet profile
const getParavetProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const paravet = await Paravet.findOne({ userId });
  if (!paravet) {
    return next(new AppError('Paravet profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: paravet
  });
});

// Update Step 3: Personal & Contact Info
const updatePersonalInfo = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { fullName, mobileNumber, email, city, serviceArea, emergencyContact } = req.body;

  let paravet = await Paravet.findOneAndUpdate(
    { userId },
    {
      $set: {
        'personalInfo.fullName.value': fullName,
        'personalInfo.fullName.verified': false,
        'personalInfo.mobileNumber.value': mobileNumber,
        'personalInfo.mobileNumber.verified': false,
        'personalInfo.mobileNumber.otpVerified': false,
        'personalInfo.email.value': email,
        'personalInfo.email.verified': false,
        'personalInfo.city.value': city,
        'personalInfo.city.verified': false,
        'personalInfo.serviceArea.value': serviceArea,
        'personalInfo.serviceArea.verified': false,
        ...(emergencyContact && {
          'personalInfo.emergencyContact.name': emergencyContact.name,
          'personalInfo.emergencyContact.number': emergencyContact.number,
          'personalInfo.emergencyContact.verified': false
        }),
        'applicationStatus.currentStep': 3
      }
    },
    { new: true, upsert: true }
  );

  if (!paravet) {
    return next(new AppError('Paravet profile not found', 404));
  }

  paravet.calculateCompletion();
  await paravet.save();

  res.status(200).json({
    success: true,
    message: 'Personal info updated',
    data: paravet
  });
});

// Update Step 5: Experience & Skills
const updateExperienceSkills = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { yearsOfExperience, areasOfExpertise, languagesSpoken, availability } = req.body;

  let paravet = await Paravet.findOneAndUpdate(
    { userId },
    {
      $set: {
        'experience.yearsOfExperience.value': yearsOfExperience,
        'experience.yearsOfExperience.verified': false,
        'experience.areasOfExpertise.value': areasOfExpertise,
        'experience.areasOfExpertise.verified': false,
        'experience.languagesSpoken.value': languagesSpoken,
        'experience.languagesSpoken.verified': false,
        ...(availability && {
          'experience.availability.days': availability.days,
          'experience.availability.startTime': availability.startTime,
          'experience.availability.endTime': availability.endTime,
          'experience.availability.verified': false
        }),
        'applicationStatus.currentStep': 5
      }
    },
    { new: true, upsert: true }
  );

  if (!paravet) {
    return next(new AppError('Paravet profile not found', 404));
  }

  paravet.calculateCompletion();
  await paravet.save();

  res.status(200).json({
    success: true,
    message: 'Experience and skills updated',
    data: paravet
  });
});

// Update Step 6: Bank Details
const updatePaymentInfo = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { paymentMethod, accountHolderName, pan } = req.body;

  let paravet = await Paravet.findOneAndUpdate(
    { userId },
    {
      $set: {
        'paymentInfo.paymentMethod.methodType': paymentMethod.type,
        'paymentInfo.paymentMethod.value': paymentMethod.value,
        'paymentInfo.paymentMethod.verified': false,
        'paymentInfo.accountHolderName.value': accountHolderName,
        'paymentInfo.accountHolderName.verified': false,
        'paymentInfo.pan.value': pan,
        'paymentInfo.pan.verified': false,
        'applicationStatus.currentStep': 6
      }
    },
    { new: true, upsert: true }
  );

  if (!paravet) {
    return next(new AppError('Paravet profile not found', 404));
  }

  paravet.calculateCompletion();
  await paravet.save();

  res.status(200).json({
    success: true,
    message: 'Payment info updated',
    data: paravet
  });
});

// Update Step 7: Code of Conduct
const agreeToCodeOfConduct = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { agreed } = req.body;

  if (!agreed) {
    return next(new AppError('Must agree to code of conduct to proceed', 400));
  }

  let paravet = await Paravet.findOneAndUpdate(
    { userId },
    {
      $set: {
        'compliance.agreedToCodeOfConduct.value': true,
        'compliance.agreedToCodeOfConduct.agreedAt': new Date(),
        'compliance.agreedToCodeOfConduct.verified': false,
        'applicationStatus.currentStep': 7
      }
    },
    { new: true, upsert: true }
  );

  if (!paravet) {
    return next(new AppError('Paravet profile not found', 404));
  }

  paravet.calculateCompletion();
  await paravet.save();

  res.status(200).json({
    success: true,
    message: 'Code of conduct accepted',
    data: paravet
  });
});

// Update Step 8: Training Module
const completeTrainingModule = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { quizPassed } = req.body;

  let paravet = await Paravet.findOne({ userId });
  if (!paravet) {
    return next(new AppError('Paravet profile not found', 404));
  }

  paravet.training = {
    moduleCompleted: true,
    quizPassed: quizPassed || false,
    completedAt: new Date(),
    badgeEarned: quizPassed ? 'Vetician Verified Paravet' : null
  };

  paravet.applicationStatus.currentStep = 8;
  paravet.calculateCompletion();
  await paravet.save();

  res.status(200).json({
    success: true,
    message: 'Training module completed',
    data: paravet,
    badgeEarned: quizPassed
  });
});

// Submit application for review
const submitApplication = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  let paravet = await Paravet.findOne({ userId });
  if (!paravet) {
    return next(new AppError('Paravet profile not found', 404));
  }

  // Validate all required fields before submission
  // Note: certificationProof temporarily optional until backend fix is deployed
  if (!paravet.personalInfo.fullName?.value ||
      !paravet.personalInfo.mobileNumber?.value ||
      !paravet.documents.governmentId?.idType ||
      // !paravet.documents.certificationProof?.url || // Temporarily commented
      !paravet.experience.yearsOfExperience?.value ||
      !paravet.paymentInfo.accountHolderName?.value ||
      !paravet.compliance.agreedToCodeOfConduct?.value) {
    return next(new AppError('Please complete all required steps before submitting', 400));
  }

  paravet.applicationStatus.submitted = true;
  paravet.applicationStatus.submittedAt = new Date();
  paravet.applicationStatus.approvalStatus = 'under_review';
  paravet.applicationStatus.currentStep = 9;
  paravet.calculateCompletion();
  await paravet.save();

  res.status(200).json({
    success: true,
    message: 'Application submitted for review. You will receive updates via email and SMS.',
    data: paravet,
    estimatedReviewTime: '24-48 hours'
  });
});

// Upload documents
const uploadDocuments = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { documentType, url } = req.body;

  if (!documentType || !url) {
    return next(new AppError('Document type and URL are required', 400));
  }

  let paravet = await Paravet.findOne({ userId });
  if (!paravet) {
    // Create paravet record if it doesn't exist
    paravet = await Paravet.create({ userId });
  }

  // Initialize documents object if it doesn't exist
  if (!paravet.documents) {
    paravet.documents = {};
  }

  switch (documentType) {
    case 'governmentId':
      paravet.documents.governmentId = { idType: 'uploaded', url, verified: false };
      break;
    case 'certificationProof':
      paravet.documents.certificationProof = { url, certificationType: 'uploaded', verified: false };
      break;
    case 'vetRecommendation':
      paravet.documents.vetRecommendation = { url, verified: false };
      break;
    case 'profilePhoto':
      paravet.documents.profilePhoto = { url, verified: false };
      break;
    default:
      return next(new AppError('Invalid document type', 400));
  }

  // Mark documents as modified to ensure Mongoose saves nested changes
  paravet.markModified('documents');
  await paravet.save();

  res.status(200).json({
    success: true,
    message: `${documentType} uploaded successfully`,
    data: paravet
  });
});

// Get unverified paravets (Admin)
const getUnverifiedParavets = catchAsync(async (req, res, next) => {
  const paravets = await Paravet.find({ 'applicationStatus.approvalStatus': 'under_review' })
    .populate('userId');

  res.status(200).json({
    success: true,
    count: paravets.length,
    data: paravets
  });
});

// Verify paravet (Admin)
const verifyParavet = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { approved, rejectionReason, adminId } = req.body;

  const paravet = await Paravet.findById(id);
  if (!paravet) {
    return next(new AppError('Paravet not found', 404));
  }

  if (approved) {
    paravet.applicationStatus.approvalStatus = 'approved';
    paravet.applicationStatus.approvedAt = new Date();
    paravet.applicationStatus.approvedByAdmin = adminId;
    
    // Update user role to verified
    await User.findByIdAndUpdate(paravet.userId, { role: 'peravet' });
  } else {
    paravet.applicationStatus.approvalStatus = 'rejected';
    paravet.applicationStatus.rejectionReason = rejectionReason;
  }

  await paravet.save();

  res.status(200).json({
    success: true,
    message: approved ? 'Paravet approved' : 'Paravet rejected',
    data: paravet
  });
});

// Verify individual field (Admin)
const verifyParavetField = catchAsync(async (req, res, next) => {
  const { id, field } = req.params;

  const paravet = await Paravet.findById(id);
  if (!paravet) {
    return next(new AppError('Paravet not found', 404));
  }

  // Update nested field verification
  const fieldPath = field.split('.');
  let obj = paravet;
  for (let i = 0; i < fieldPath.length - 1; i++) {
    obj = obj[fieldPath[i]];
  }
  
  if (obj) {
    obj[fieldPath[fieldPath.length - 1]].verified = true;
  }

  await paravet.save();

  res.status(200).json({
    success: true,
    message: `${field} verified`,
    data: paravet
  });
});

module.exports = {
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
};
