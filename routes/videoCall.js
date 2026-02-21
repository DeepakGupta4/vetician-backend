const express = require('express');
const router = express.Router();
const twilio = require('twilio');

console.log('📹 Video Call Route loaded');

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// Generate Twilio Video Access Token
router.post('/token', async (req, res) => {
  console.log('📹 Token request received:', req.body);
  try {
    const { identity, roomName } = req.body;

    if (!identity || !roomName) {
      console.log('❌ Missing identity or roomName');
      return res.status(400).json({ error: 'Identity and roomName required' });
    }

    console.log('🔑 Generating token for:', { identity, roomName });

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity }
    );

    const videoGrant = new VideoGrant({ room: roomName });
    token.addGrant(videoGrant);

    console.log('✅ Token generated successfully');
    res.json({
      token: token.toJwt(),
      roomName,
      identity
    });
  } catch (error) {
    console.error('❌ Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token', details: error.message });
  }
});

console.log('📹 Video Call Route configured');

module.exports = router;
