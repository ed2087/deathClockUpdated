import mongoose from 'mongoose';

// Define the User Schema
const userSchema = new mongoose.Schema({
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
      secondsLeft: {
        type: Number,
        default: 0,
      },
  },
  jsonFile: {
    type: String, // Assuming the JSON file content will be stored as a string
  },
  
});

// Create the User model
const User = mongoose.model('User', userSchema);

export default User;