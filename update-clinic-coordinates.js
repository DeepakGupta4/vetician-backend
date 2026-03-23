require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');
const axios = require('axios');

// Geocoding function using OpenStreetMap Nominatim (free)
async function getCoordinates(address) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'VeticianApp/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

async function updateClinicCoordinates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const clinics = await Clinic.find({
      $or: [
        { latitude: { $exists: false } },
        { longitude: { $exists: false } },
        { latitude: null },
        { longitude: null }
      ]
    });

    console.log(`📍 Found ${clinics.length} clinics without coordinates`);

    for (const clinic of clinics) {
      const address = `${clinic.streetAddress || ''}, ${clinic.locality}, ${clinic.city}`;
      console.log(`\n🔍 Processing: ${clinic.clinicName}`);
      console.log(`   Address: ${address}`);

      const coords = await getCoordinates(address);
      
      if (coords) {
        clinic.latitude = coords.latitude;
        clinic.longitude = coords.longitude;
        await clinic.save();
        console.log(`   ✅ Updated: ${coords.latitude}, ${coords.longitude}`);
      } else {
        console.log(`   ❌ Could not find coordinates`);
      }

      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Coordinate update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateClinicCoordinates();
