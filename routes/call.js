const express = require('express');
const router = express.Router();

// POST /api/call/initiate - Initiate video call
router.post('/initiate', async (req, res) => {
  try {
    const { callerId, receiverId, callerData } = req.body;
    const io = req.app.get('io');
    
    console.log(`📞 [CALL] Initiating call from ${callerId} to ${receiverId}`);
    
    // Check if receiverId is a veterinarianId (Veterinarian collection _id)
    // If so, get the userId
    const Veterinarian = require('../models/Veterinarian');
    let actualReceiverId = receiverId;
    
    try {
      const vet = await Veterinarian.findById(receiverId);
      if (vet && vet.userId) {
        console.log(`🔄 [CALL] Converting veterinarianId ${receiverId} to userId ${vet.userId}`);
        actualReceiverId = vet.userId;
      }
    } catch (err) {
      // If not found, assume receiverId is already userId
      console.log(`ℹ️ [CALL] Using receiverId as-is: ${receiverId}`);
    }
    
    const callId = `call-${Date.now()}`;
    const roomName = `room-${callerId}-${actualReceiverId}-${Date.now()}`;
    
    // Check if receiver is in the room
    const sockets = await io.in(actualReceiverId).fetchSockets();
    console.log(`🔍 [CALL] Sockets in room ${actualReceiverId}:`, sockets.length);
    sockets.forEach(s => console.log(`   - Socket ID: ${s.id}, Rooms:`, Array.from(s.rooms)));
    
    // Emit to receiver's room (without prefix)
    io.to(actualReceiverId).emit('incoming-call', {
      callId,
      roomName,
      token: 'mock-token',
      callerId,
      callerData
    });
    
    console.log(`✅ [CALL] Event 'incoming-call' emitted to room: ${actualReceiverId}`);
    
    res.json({ 
      success: true, 
      callId, 
      roomName,
      message: 'Call initiated successfully'
    });
  } catch (error) {
    console.error('❌ [CALL] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
