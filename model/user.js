import mongoose from 'mongoose';

// Define the User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true, // Ensures that email addresses are unique
    sparse: true, // Allows multiple documents to have a null value for the email field (optional)
  },
  allowed: {
    type: Boolean,
    default: false, // Set the default value to false
  },
  jsonFile: {
    type: String, // Assuming the JSON file content will be stored as a string
  },
});

// Create the User model
const User = mongoose.model('User', userSchema);

export default User;