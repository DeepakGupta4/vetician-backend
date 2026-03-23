// Test Upload Endpoint
// Run: node test-upload.js

const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testUpload() {
  try {
    console.log('🧪 Testing upload endpoint...');
    
    // Create a test file (you can replace with actual file path)
    const testFilePath = './test-image.jpg'; // Replace with actual file
    
    if (!fs.existsSync(testFilePath)) {
      console.log('⚠️  No test file found. Create a test-image.jpg file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('documentType', 'certificationProof');

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer YOUR_TEST_TOKEN', // Replace with actual token
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('📎 File URL:', data.url);
      console.log('🆔 Public ID:', data.public_id);
    } else {
      console.log('❌ Upload failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUpload();
