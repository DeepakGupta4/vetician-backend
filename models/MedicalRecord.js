const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  // Link to Pet
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: [true, 'Pet ID is required']
  },
  
  // Link to User (Pet Owner)
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  
  // Record Type
  recordType: {
    type: String,
    enum: ['Prescription', 'Lab Report', 'Vaccination', 'Surgery', 'Consultation', 'Other'],
    default: 'Consultation'
  },
  
  // Clinic/Hospital Information
  clinic: {
    type: String,
    trim: true,
    default: ''
  },
  
  clinicId: {
    type: String,
    default: null
  },
  
  // Doctor/Veterinarian Information
  doctor: {
    type: String,
    trim: true,
    default: ''
  },
  
  doctorId: {
    type: String,
    default: null
  },
  
  // Record Details
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  
  // Prescription/Treatment Details
  prescription: {
    type: String,
    trim: true,
    default: ''
  },
  
  diagnosis: {
    type: String,
    trim: true,
    default: ''
  },
  
  symptoms: {
    type: String,
    trim: true,
    default: ''
  },
  
  treatment: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Medications
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  
  // Follow-up
  followUpDate: {
    type: Date,
    default: null
  },
  
  followUpNotes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Additional Information
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Attachments (images, PDFs, etc.)
  attachments: [{
    url: String,
    type: String, // 'image', 'pdf', 'document'
    name: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Cost
  cost: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  }
  
}, {
  timestamps: true
});

// Indexes for better query performance
medicalRecordSchema.index({ petId: 1, date: -1 });
medicalRecordSchema.index({ userId: 1, date: -1 });
medicalRecordSchema.index({ recordType: 1 });

// Method to get summary
medicalRecordSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    recordType: this.recordType,
    date: this.date,
    clinic: this.clinic,
    doctor: this.doctor
  };
};

// Static method to find records by pet
medicalRecordSchema.statics.findByPet = function(petId) {
  return this.find({ petId: petId }).sort({ date: -1 });
};

// Static method to find records by user
medicalRecordSchema.statics.findByUser = function(userId) {
  return this.find({ userId: userId }).sort({ date: -1 });
};

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
