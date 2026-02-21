const express = require('express');
const {
  registerParent
} = require('../controllers/parentController');
const {
  createPet,
  getPetsByUserId,
  
}=require("../controllers/petController")

const {
  createAppointment
  
}=require("../controllers/vetController")
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerParent);
router.get('/:userId', auth, async (req, res) => {
  try {
    const Parent = require('../models/Parent');
    const parent = await Parent.find({ userId: req.params.userId });
    res.json({ parent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/pets', auth, createPet);
router.get('/pets/:userId', auth, getPetsByUserId);
router.post('/appointments', auth, createAppointment);

module.exports = router;