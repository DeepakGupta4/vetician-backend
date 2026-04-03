const express = require('express');
const {
  createMedicalRecord,
  getMedicalRecordsByPet,
  getMedicalRecordsByUser,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord
} = require('../controllers/medicalRecordController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create a new medical record
router.post('/', auth, createMedicalRecord);

// Get all medical records for a specific pet
router.get('/pet/:petId', auth, getMedicalRecordsByPet);

// Get all medical records for a specific user
router.get('/user/:userId', auth, getMedicalRecordsByUser);

// Get a single medical record by ID
router.get('/:recordId', auth, getMedicalRecordById);

// Update a medical record
router.put('/:recordId', auth, updateMedicalRecord);

// Delete a medical record
router.delete('/:recordId', auth, deleteMedicalRecord);

module.exports = router;
