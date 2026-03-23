const Parent = require('../models/Parent');
const { catchAsync } = require('../utils/catchAsync');
// Register new parent
const registerParent = catchAsync(async (req, res, next) => {
  const { name, email, phone, address } = req.body;
  console.log(req.body)

  // Check if parent already exists
  const existingParent = await Parent.findByEmail(email);
  if (existingParent) {
    return next(new AppError('Parent with this email already exists', 400));
  }

  // Create new parent  
  const parent = new Parent({
    name: name,
    email: email,
    phone: phone,
    address: address,
  });

  await parent.save();

  // Generate tokens (same as user registration)
  const { accessToken, refreshToken } = generateTokens(parent._id);

  res.status(201).json({
    success: true,
    message: 'Parent registered successfully',
    parent: parent.getPublicProfile(),
    token: accessToken,
    refreshToken,
  });
});

// Update parent
const updateParent = catchAsync(async (req, res, next) => {
  try {
    const { name, email, phone, address, gender, dateOfBirth, emergencyContact, image } = req.body;
    const userId = req.params.id || req.params.userId;
    
    console.log('Updating parent for userId:', userId);
    console.log('Update data:', { name, email, phone, address, gender, dateOfBirth, emergencyContact });
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const parent = await Parent.findOneAndUpdate(
      { userId: userId },
      { name, email, phone, address, gender, dateOfBirth, emergencyContact, image },
      { new: true, runValidators: false, upsert: false }
    );

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    res.json({
      success: true,
      message: 'Parent updated successfully',
      parent
    });
  } catch (error) {
    console.error('Update parent error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});


module.exports = {
  registerParent,
  updateParent
};