
const Pet = require('../models/Pet');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Register pet
const createPet = catchAsync(async (req, res, next) => {
  console.log('\n🐾 ===== PET REGISTRATION REQUEST =====');
  console.log('📥 Full Request Body:', JSON.stringify(req.body, null, 2));
  
  const { name, species, gender, userId } = req.body;

  if (!name || !species || !gender) {
    console.log('❌ Validation failed: Missing required fields');
    return next(new AppError('Name, species and gender are required', 400));
  }

  if (!userId) {
    console.log('❌ Validation failed: Missing userId');
    return next(new AppError('User ID is required', 400));
  }

  console.log('✅ Basic validation passed');
  console.log('📝 Creating pet document...');
  
  // Filter out empty strings and only include non-empty values
  const petData = {};
  Object.keys(req.body).forEach(key => {
    const value = req.body[key];
    // Only include if value is not empty string, null, or undefined
    if (value !== '' && value !== null && value !== undefined) {
      petData[key] = value;
    }
  });
  
  console.log('📋 Cleaned pet data (non-empty fields only):', JSON.stringify(petData, null, 2));
  
  const pet = new Pet(petData);

  console.log('💾 Attempting to save to database...');
  try {
    const savedPet = await pet.save();
    console.log('✅ Pet saved successfully!');
    console.log('📋 Saved Pet ID:', savedPet._id);
    console.log('📋 Saved Pet Name:', savedPet.name);
    console.log('📋 Medical Records in saved pet:', {
      allergies: savedPet.allergies || 'Empty',
      currentMedications: savedPet.currentMedications || 'Empty',
      chronicDiseases: savedPet.chronicDiseases || 'Empty',
      injuries: savedPet.injuries || 'Empty',
      surgeries: savedPet.surgeries || 'Empty',
      vaccinations: savedPet.vaccinations || 'Empty',
      notes: savedPet.notes || 'Empty'
    });
    console.log('===== END PET REGISTRATION =====\n');

    res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      pet: savedPet
    });
  } catch (saveError) {
    console.error('❌ Save failed:', saveError.message);
    console.error('❌ Validation errors:', saveError.errors);
    return next(new AppError(saveError.message, 400));
  }
});

// Get pet by ID (includes medical records)
const getPetById = catchAsync(async (req, res, next) => {
  const { petId } = req.params;

  if (!petId) {
    return next(new AppError('Pet ID is required', 400));
  }

  const pet = await Pet.findById(petId);

  if (!pet) {
    return next(new AppError('Pet not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Pet details retrieved successfully',
    pet: pet
  });
});

// Get medical records for a specific pet
const getPetMedicalRecords = catchAsync(async (req, res, next) => {
  const { petId } = req.params;

  if (!petId) {
    return next(new AppError('Pet ID is required', 400));
  }

  const pet = await Pet.findById(petId);

  if (!pet) {
    return next(new AppError('Pet not found', 404));
  }

  // Extract only medical records
  const medicalRecords = {
    petId: pet._id,
    petName: pet.name,
    allergies: pet.allergies,
    currentMedications: pet.currentMedications,
    pastMedications: pet.pastMedications,
    chronicDiseases: pet.chronicDiseases,
    injuries: pet.injuries,
    surgeries: pet.surgeries,
    vaccinations: pet.vaccinations,
    notes: pet.notes,
    lastVetVisit: pet.lastVetVisit,
    nextVetVisit: pet.nextVetVisit
  };

  res.status(200).json({
    success: true,
    message: 'Medical records retrieved successfully',
    medicalRecords: medicalRecords
  });
});

// registered pet info
const getPetsByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  const pets = await Pet.find({ userId });

  if (!pets || pets.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No pets found for this user',
      pets: []
    });
  }

  res.status(200).json({
    success: true,
    message: 'Pets retrieved successfully',
    pets: pets
  });
});

module.exports={
    createPet,
    getPetsByUserId,
    getPetById,
    getPetMedicalRecords
}