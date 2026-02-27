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
    
    // Check if receiver is in the room
    const sockets = await io.in(receiverId).fetchSockets();
    console.log(`🔍 [CALL] Sockets in room ${receiverId}:`, sockets.length);
    sockets.forEach(s => console.log(`   - Socket ID: ${s.id}, Rooms:`, Array.from(s.rooms)));
    
    // Emit to receiver's room (without prefix)
    io.to(receiverId).emit('incoming-call', {
      callId,
      roomName,
      token: 'mock-token',
      callerData
    });
    
    console.log(`✅ [CALL] Event 'incoming-call' emitted to room: ${receiverId}`);
    
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
