const express = require('express');
const router = express.Router();
const Veterinarian = require('../models/Veterinarian');

console.log('🩺 Veterinarians Route loaded');

// Get all available veterinarians for video consultation
router.get('/available', async (req, res) => {
  console.log('📋 Fetching available veterinarians...');
  try {
    const veterinarians = await Veterinarian.find({
      isApproved: true,
      isActive: true
    }).select('firstName lastName specialization experience rating totalConsultations specialties consultationFee profileImage clinicName phone isAvailable');

    console.log(`✅ Found ${veterinarians.length} veterinarians`);
    
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