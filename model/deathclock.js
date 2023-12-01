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
  allowed: {
    type: Boolean,
    default: false, // Set the default value to false
  },
  birthdate: {
    type: Date,
    required: true,
  },  
  clock:{
      predictedDeathYear: {
        type: Number,
        default: 0, 
      },
      yearsLeft: {
        type: Number,
        default: 0,
      },
      monthsLeft: {
        type: Number,
        default: 0,
      },
      weeksLeft: {
        type: Number,
        default: 0,
      },
      daysLeft: {
        type: Number,
        default: 0,
      },
      hoursLeft: {
        type: Number,
        default: 0,
      },
      secondsLeft: {
        type: Number,
        default: 0,
      },
      //add object for expectedFutureDate
      expectedFutureDate: {
        type: Object,
        default: 0,
      },
  },
  jsonFile: {
    type: String, // Assuming the JSON file content will be stored as a string
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
