// Add this route to your production backend auth routes

// GET /api/auth/veterinarians/all - Get all veterinarians
router.get('/veterinarians/all', async (req, res) => {
  try {
    console.log('📋 Fetching all veterinarians from database...');
    
    // Import Veterinarian model
    const Veterinarian = require('../models/Veterinarian');
    
    // Get all veterinarians from database
    const veterinarians = await Veterinarian.find({});
    
    console.log(`✅ Found ${veterinarians.length} veterinarians in database`);
    
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

// Export this and add to your auth routes file