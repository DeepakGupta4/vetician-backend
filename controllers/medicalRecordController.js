const MedicalRecord = require('../models/MedicalRecord');
const Pet = require('../models/Pet');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

// Create a new medical record
const createMedicalRecord = catchAsync(async (req, res, next) => {
  console.log('\n🏥 ===== CREATE MEDICAL RECORD =====');
  console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
  
  const { petId, userId, title, date } = req.body;

  // Validate required fields
  if (!petId) {
    return next(new AppError('Pet ID is required', 400));
  }

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  if (!title) {
    return next(new AppError('Title is required', 400));
  }

  // Verify pet exists
  console.log('🔍 Looking for pet with ID:', petId);
  const pet = await Pet.findById(petId);
  console.log('🐾 Pet found:', pet ? `Yes - ${pet.name}` : 'No');
  
  if (!pet) {
    console.log('❌ Pet not found in database!');
    console.log('💡 Checking if pet exists with different query...');
    const allPets = await Pet.find({ userId: userId });
    console.log('📋 All pets for this user:', allPets.map(p => ({ id: p._id.toString(), name: p.name })));
    return next(new AppError('Pet not found', 404));
  }

  console.log('✅ Validation passed');
  console.log('📝 Creating medical record...');

  // Create medical record
  const medicalRecord = new MedicalRecord({
    ...req.body,
    petId,
    userId
  });

  await medicalRecord.save();

  console.log('✅ Medical record saved successfully!');
  console.log('📋 Record ID:', medicalRecord._id);
  console.log('===== END CREATE MEDICAL RECORD =====\n');

  res.status(201).json({
    success: true,
    message: 'Medical record created successfully',
    medicalRecord: medicalRecord
  });
});

// Get all medical records for a pet
const getMedicalRecordsByPet = catchAsync(async (req, res, next) => {
  const { petId } = req.params;

  if (!petId) {
    return next(new AppError('Pet ID is required', 400));
  }

  const records = await MedicalRecord.find({ petId: petId })
    .sort({ date: -1 })
    .populate('petId', 'name species breed');

  res.status(200).json({
    success: true,
    message: 'Medical records retrieved successfully',
    count: records.length,
    medicalRecords: records
  });
});

// Get all medical records for a user
const getMedicalRecordsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  const records = await MedicalRecord.find({ userId: userId })
    .sort({ date: -1 })
    .populate('petId', 'name species breed');

  res.status(200).json({
    success: true,
    message: 'Medical records retrieved successfully',
    count: records.length,
    medicalRecords: records
  });
});

// Get a single medical record by ID
const getMedicalRecordById = catchAsync(async (req, res, next) => {
  const { recordId } = req.params;

  if (!recordId) {
    return next(new AppError('Record ID is required', 400));
  }

  const record = await MedicalRecord.findById(recordId)
    .populate('petId', 'name species breed');

  if (!record) {
    return next(new AppError('Medical record not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Medical record retrieved successfully',
    medicalRecord: record
  });
});

// Update a medical record
const updateMedicalRecord = catchAsync(async (req, res, next) => {
  const { recordId } = req.params;

  if (!recordId) {
    return next(new AppError('Record ID is required', 400));
  }

  const record = await MedicalRecord.findByIdAndUpdate(
    recordId,
    req.body,
    { new: true, runValidators: true }
  );

  if (!record) {
    return next(new AppError('Medical record not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Medical record updated successfully',
    medicalRecord: record
  });
});

// Delete a medical record
const deleteMedicalRecord = catchAsync(async (req, res, next) => {
  const { recordId } = req.params;

  if (!recordId) {
    return next(new AppError('Record ID is required', 400));
  }

  const record = await MedicalRecord.findByIdAndDelete(recordId);

  if (!record) {
    return next(new AppError('Medical record not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Medical record deleted successfully'
  });
});

module.exports = {
  createMedicalRecord,
  getMedicalRecordsByPet,
  getMedicalRecordsByUser,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord
};
