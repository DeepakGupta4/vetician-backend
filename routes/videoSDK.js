const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Generate VideoSDK Token
router.post('/token', async (req, res) => {
  try {
    const { roomId, participantId } = req.body;

    const API_KEY = process.env.VIDEOSDK_API_KEY;
    const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;

    if (!API_KEY || !SECRET_KEY) {
      return res.status(500).json({ error: 'VideoSDK credentials not configured' });
    }

    const options = {
      expiresIn: '24h',
      algorithm: 'HS256'
    };

    const payload = {
      apikey: API_KEY,
      permissions: ['allow_join', 'allow_mod'],
      version: 2,
      roomId: roomId || `room-${Date.now()}`,
      participantId: participantId || `participant-${Date.now()}`,
      roles: ['CRAWLER', 'RTMP']
    };

    const token = jwt.sign(payload, SECRET_KEY, options);

    res.json({
      token,
      roomId: payload.roomId,
      participantId: payload.participantId
    });
  } catch (error) {
    console.error('VideoSDK token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token', details: error.message });
  }
});

module.exports = router;
