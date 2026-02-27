const express = require('express');
const router = express.Router();

// POST /api/call/initiate - Initiate video call
router.post('/initiate', async (req, res) => {
  try {
    const { callerId, receiverId, callerData } = req.body;
    const io = req.app.get('io');
    
    console.log(`📞 [CALL] Initiating call from ${callerId} to ${receiverId}`);
    
    const callId = `call-${Date.now()}`;
    const roomName = `room-${callerId}-${receiverId}-${Date.now()}`;
    
    // Emit to receiver's room (without prefix)
    io.to(receiverId).emit('incoming-call', {
      callId,
      roomName,
      token: 'mock-token',
      callerData
    });
    
    console.log(`✅ [CALL] Event emitted to room: ${receiverId}`);
    
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
