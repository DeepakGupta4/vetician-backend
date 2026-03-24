const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  // Personal Details
  petPhoto: {
    type: String,
    default: null
  },
  name: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true,
    minlength: [2, 'Pet name must be at least 2 characters long'],
    maxlength: [50, 'Pet name cannot exceed 50 characters'],
  },
  species: {
    type: String,
    required: [true, 'Species is required'],
    enum: ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Other'],
    default: 'Dog'
  },
  breed: {
    type: String,
    required: [true, 'Breed is required'],
    trim: true,
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Neutered', 'Spayed', 'Unknown'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    trim: true,
    uppercase: true,
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: [1, 'Height must be at least 1 cm'],
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0.1, 'Weight must be at least 0.1 kg'],
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true,
  },
  distinctiveFeatures: {
    type: String,
    required: [true, 'Distinctive features are required'],
    trim: true,
  },

  // Medical Details
  allergies: {
    type: String,
    required: [true, 'Allergies info is required'],
  },
  currentMedications: {
    type: String,
    required: [true, 'Current medications info is required'],
  },
  pastMedications: {
    type: String,
    default: null,
  },
  chronicDiseases: {
    type: String,
    required: [true, 'Chronic diseases info is required'],
  },
  injuries: {
    type: String,
    required: [true, 'Injuries info is required'],
  },
  surgeries: {
    type: String,
    required: [true, 'Surgeries info is required'],
  },
  vaccinations: {
    type: String,
    required: [true, 'Vaccinations info is required'],
  },
  userId: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastVetVisit: {
    type: Date,
    default: null
  },
  nextVetVisit: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    required: [true, 'Notes are required'],
    trim: true,
  }
}, {
  timestamps: true
});

// Indexes for better query performance
petSchema.index({ name: 1 });
petSchema.index({ species: 1 });
petSchema.index({ userId: 1 });
petSchema.index({ isActive: 1 });

// Virtual for age calculation
petSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to get simplified pet info
petSchema.methods.getBasicInfo = function() {
  const petObject = this.toObject();
  return {
    id: petObject._id,
    name: petObject.name,
    species: petObject.species,
    breed: petObject.breed,
    age: this.age, // Uses the virtual property
    color: petObject.color,
    userId: petObject.userId
  };
};

// Method to update last vet visit
petSchema.methods.updateLastVetVisit = function(date = new Date()) {
  this.lastVetVisit = date;
  return this.save();
};

// Static method to find pets by user
petSchema.statics.findByUser = function(userId) {
  return this.find({ userId: userId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Pet', petSchema);