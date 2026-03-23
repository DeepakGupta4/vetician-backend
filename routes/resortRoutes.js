const express = require('express');
const {
  createPetResort,
  getVerifiedPetResorts,
  getUnverifiedPetResorts,
  verifyPetResort,
  unverifyPetResort,
  getResortProfile
} = require('../controllers/resortController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createPetResort);
router.get('/', getVerifiedPetResorts);
router.get('/profile/:userId', auth, getResortProfile);

// Admin routes
router.get('/admin/unverified', getUnverifiedPetResorts);
router.patch('/admin/verify/:id', verifyPetResort);
router.patch('/admin/unverify/:id', unverifyPetResort);

module.exports = router;