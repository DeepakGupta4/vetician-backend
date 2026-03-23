const mongoose = require('mongoose');
const Clinic = require('../models/Clinic');
require('dotenv').config();

// Sample coordinates for different cities in India
const cityCoordinates = {
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'delhi': { lat: 28.7041, lon: 77.1025 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'hyderabad': { lat: 17.3850, lon: 78.4867 },
  'pune': { lat: 18.5204, lon: 73.8567 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'jaipur': { lat: 26.9124, lon: 75.7873 },
  'surat': { lat: 21.1702, lon: 72.8311 },
  'lucknow': { lat: 26.8467, lon: 80.9462 },
  'kanpur': { lat: 26.4499, lon: 80.3319 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'indore': { lat: 22.7196, lon: 75.8577 },
  'thane': { lat: 19.2183, lon: 72.9781 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185 },
  'pimpri': { lat: 18.6298, lon: 73.7997 },
  'patna': { lat: 25.5941, lon: 85.1376 },
  'vadodara': { lat: 22.3072, lon: 73.1812 }
};

// Function to get random coordinates near a city
const getRandomCoordinatesNearCity = (cityName) => {
  const city = cityCoordinates[cityName.toLowerCase()];
  if (!city) {
    // Default to Bangalore if city not found
    return {
      latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
      longitude: 77.5946 + (Math.random() - 0.5) * 0.1
    };
  }
  
  // Add random offset within ~5km radius
  return {
    latitude: city.lat + (Math.random() - 0.5) * 0.05,
    longitude: city.lon + (Math.random() - 0.5) * 0.05
  };
};

const addCoordinatesToClinics = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all clinics without coordinates
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
      const coordinates = getRandomCoordinatesNearCity(clinic.city);
      
      await Clinic.findByIdAndUpdate(clinic._id, {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      });

      console.log(`✅ Updated ${clinic.clinicName} in ${clinic.city}: ${coordinates.latitude}, ${coordinates.longitude}`);
    }

    console.log('🎉 All clinics updated with coordinates!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addCoordinatesToClinics();