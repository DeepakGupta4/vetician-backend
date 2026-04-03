const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/', trainingController.getAllTrainingServices);
router.get('/category/:category', trainingController.getServicesByCategory);
router.get('/:id', trainingController.getTrainingService);

// Protected routes (require authentication)
router.post('/', auth, trainingController.createTrainingService);
router.put('/:id', auth, trainingController.updateTrainingService);
router.delete('/:id', auth, trainingController.deleteTrainingService);

module.exports = router;
