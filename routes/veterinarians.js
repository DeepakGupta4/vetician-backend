const express = require('express');
const router = express.Router();
const Veterinarian = require('../models/Veterinarian');

console.log('🩺 Veterinarians Route loaded');

// Get all available veterinarians for video consultation
router.get('/available', async (req, res) => {
  console.log('📋 Fetching available veterinarians...');
  try {
    // First, let's see all veterinarians in database
    const allVets = await Veterinarian.find({});
    console.log(`🔍 Total veterinarians in database: ${allVets.length}`);
    
    if (allVets.length > 0) {
      console.log('📊 Sample vet data:', JSON.stringify(allVets[0], null, 2));
    }
    
    // Try to get verified and active veterinarians
    const veterinarians = await Veterinarian.find({
      $or: [
        { isVerified: true },
        { 'name.verified': true }
      ],
      isActive: { $ne: false }
    });

    console.log(`✅ Found ${veterinarians.length} available veterinarians`);
    
    // Transform the data to match frontend expectations
    const transformedVets = veterinarians.map(vet => {
      console.log(`🩺 Processing vet: ${vet.name?.value || vet.name}`);
      return {
        _id: vet._id,
        firstName: vet.name?.value || vet.name || 'Doctor',
        lastName: '', // No separate last name in this schema
        specialization: vet.specialization?.value || vet.specialization || 'Veterinarian',
        experience: vet.experience?.value || vet.experience || 5,
        rating: 4.5, // Default rating
        totalConsultations: Math.floor(Math.random() * 1000) + 100,
        specialties: [vet.specialization?.value || vet.specialization || 'General Medicine'],
        consultationFee: Math.floor(Math.random() * 300) + 299, // Random fee between 299-599
        profileImage: vet.profilePhotoUrl?.value || vet.profilePhotoUrl || null,
        clinicName: `${vet.city?.value || vet.city || 'City'} Veterinary Clinic`,
        phone: '+91 98765 43210', // Mock phone
        isAvailable: true, // Default to available
        city: vet.city?.value || vet.city,
        qualification: vet.qualification?.value || vet.qualification,
        title: vet.title?.value || vet.title || 'Dr.'
      };
    });
    
    console.log(`🎯 Transformed ${transformedVets.length} veterinarians for frontend`);
    
    res.json({
      success: true,
      veterinarians: transformedVets,
      count: transformedVets.length,
      debug: {
        totalInDB: allVets.length,
        foundWithQuery: veterinarians.length
      }
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

// Get veterinarian by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const veterinarian = await Veterinarian.findById(id).select('-password');
    
    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    res.json({
      success: true,
      veterinarian: veterinarian
    });
  } catch (error) {
    console.error('❌ Error fetching veterinarian:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch veterinarian',
      error: error.message
    });
  }
});

// Update veterinarian availability status
router.patch('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    
    const veterinarian = await Veterinarian.findByIdAndUpdate(
      id,
      { isAvailable: isAvailable },
      { new: true }
    );
    
    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: 'Veterinarian not found'
      });
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      veterinarian: veterinarian
    });
  } catch (error) {
    console.error('❌ Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message
    });
  }
});

console.log('🩺 Veterinarians Route configured');

module.exports = router;