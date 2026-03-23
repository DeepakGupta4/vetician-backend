// Test VideoSDK Token Generation
// Run: node test-videosdk-token.js

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002/api/videosdk/token';
// Or use production URL: 'https://vetician-backend-kovk.onrender.com/api/videosdk/token'

async function testVideoSDKToken() {
  console.log('🧪 Testing VideoSDK Token Generation...\n');
  
  try {
    const testData = {
      roomId: 'test-room-' + Date.now(),
      participantId: 'test-user-123'
    };
    
    console.log('📤 Request:', testData);
    console.log('🌐 URL:', API_URL);
    console.log('');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.token) {
      console.log('\n✅ SUCCESS: Token generated successfully!');
      console.log('🔑 Token length:', data.token.length);
      console.log('🏠 Room ID:', data.roomId);
      console.log('👤 Participant ID:', data.participantId);
    } else {
      console.log('\n❌ FAILED: Token generation failed');
      console.log('Error:', data.error || 'Unknown error');
      if (data.details) {
        console.log('Details:', data.details);
      }
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run test
testVideoSDKToken();
