const TrainingService = require('../models/TrainingService');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

// Get all training services
exports.getAllTrainingServices = catchAsync(async (req, res, next) => {
  const { isActive } = req.query;
  
  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const services = await TrainingService.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// Get single training service
exports.getTrainingService = catchAsync(async (req, res, next) => {
  const service = await TrainingService.findById(req.params.id);

  if (!service) {
    return next(new AppError('Training service not found', 404));
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

// Create training service
exports.createTrainingService = catchAsync(async (req, res, next) => {
  const service = await TrainingService.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Training service created successfully',
    data: service
  });
});

// Update training service
exports.updateTrainingService = catchAsync(async (req, res, next) => {
  const service = await TrainingService.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!service) {
    return next(new AppError('Training service not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Training service updated successfully',
    data: service
  });
});

// Delete training service
exports.deleteTrainingService = catchAsync(async (req, res, next) => {
  const service = await TrainingService.findByIdAndDelete(req.params.id);

  if (!service) {
    return next(new AppError('Training service not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Training service deleted successfully',
    data: null
  });
});

// Get services by category
exports.getServicesByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  
  const services = await TrainingService.find({ 
    category: category,
    isActive: true 
  }).sort({ price: 1 });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});
