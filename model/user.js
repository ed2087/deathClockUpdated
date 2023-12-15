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
  // get users age by date of birth
  age: {
    type: Date,
    required: true,
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
  //we need to tract times password reset and date
  passwordResetTokenTimes: {
    type: Number,
    default: 0
  },
  passwordResetTokenDate: {
    type: Date,
    default: Date.now
  },
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
  },
  // user gets achivement in form of badges images the images are stored in the public folder
  badges: [
    {
      // we will need image path + badge name
      badgeName: {
        type: String
      },
      badgeImage: {
        type: String
      },
      badgeDescription: {
        type: String
      },
      
    }
  ],
  // is user allow to post stories by default yes
  isStoryAllowed: {
    type: Boolean,
    default: true
  },
  // is user allow to post comments by default yes
  isCommentAllowed: {
    type: Boolean,
    default: true
  },
  // is uder banned by default no
  isBanned: {
    type: Boolean,
    default: false
  },
  // books user has read
  booksRead: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
      },
      booksReadCount: {
        type: Number,
        default: 0
      }
    }
  ],

});

// Create the User model
const User = mongoose.model('user', userSchema);

module.exports = User;
