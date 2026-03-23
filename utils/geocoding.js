const axios = require('axios');

const getCoordinatesFromAddress = async (address) => {
  try {
    // Using Nominatim (OpenStreetMap) - Completely FREE, no API key needed
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'VeticianApp/1.0' // Required by Nominatim
      }
    });
    
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      console.log('✅ Geocoding successful:', location.display_name);
      return {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon)
      };
    } else {
      console.log('⚠️ Address not found, using default coordinates');
      return { latitude: 12.9716, longitude: 77.5946 }; // Bangalore default
    }
  } catch (error) {
    console.error('❌ Geocoding error:', error.message);
    return { latitude: 12.9716, longitude: 77.5946 };
  }
};

module.exports = { getCoordinatesFromAddress };
