const mongoose = require('mongoose');

const trainingServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Training service name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  icon: {
    type: String,
    default: 'paw'
  },
  color: {
    type: String,
    default: '#7CB342'
  },
  duration: {
    type: String,
    default: '4 Weeks'
  },
  sessions: {
    type: Number,
    default: 12
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels'
  },
  focus: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['Puppy', 'Obedience', 'Behavior', 'Agility', 'Socialising', 'Tricks', 'Other'],
    default: 'Other'
  }
}, {
  timestamps: true
});

// Index for faster queries
trainingServiceSchema.index({ name: 1, isActive: 1 });

module.exports = mongoose.model('TrainingService', trainingServiceSchema);
