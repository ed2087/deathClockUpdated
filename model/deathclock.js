const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  weight: {
    type: String,
    required: true,
  },
  chronic: {
    type: String,
  },
  cancer: {
    type: String,
  },
  bloodPressure: {
    type: String,
    required: true,
  },
  cholesterol: {
    type: String,
    required: true,
  },
  smoke: {
    type: String,
  },
  alcohol: {
    type: String,
  },
  diet: {
    type: String,
  },
  exercise: {
    type: String,
  },
  sleep: {
    type: String,
    required: true,
  },
  stress: {
    type: String,
  },
  risks: {
    type: String,
  },
  stroke: {
    type: String,
  },
  hereditary: {
    type: String,
  },
  checkup: {
    type: String,
  },
  vaccinations: {
    type: String,
  },
  social: {
    type: String,
  },
  occupation: {
    type: String,
  },
  workEnv: {
    type: String,
  },
  scenario1: {
    type: String,
  },
  scenario2: {
    type: String,
  },
  scenario3: {
    type: String,
  },
  jsonFile: {
    type: String, // Assuming the JSON file content will be stored as a string
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastPredictionDate: {
    type: Date,
    default: null, // Track the last time a user made a prediction
  },
  predicted_Year: {
    type: Number,
    default: 0,
  },
  predicted_date_of_death: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date/time
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date/time
  },
});

// Create the User model
const User = mongoose.model('DeathClock', userSchema);

module.exports = User;
