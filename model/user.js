const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  userOnline: {
    type : Boolean,
    default : false
  },
  userVerified:{
    type: Boolean,
    default: false
  },
  activateToken : String,
  passwordResetToken: String,
  birthdate: {
    type: Date,
    required: false,
  },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin", "moderator", "writter"],
    default: "user",
  },
  contributions: {
     stories:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Story"
        }
     ],
      //number of issues
      storiesCount: {
        type: Number,
        default: 0,
      },
  },
  deathclock: {
    //get deathclock id
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeathClock"
 },
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date/time
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date/time
  }
});

// Create the User model
const User = mongoose.model('user', userSchema);

module.exports = User;
