const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  legalName: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Date,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  userOnline: {
    type: Boolean,
    default: false,
  },
  userVerified: {
    type: Boolean,
    default: false,
  },
  activateToken: String,
  passwordResetToken: String,
  passwordResetTokenTimes: {
    type: Number,
    default: 0,
  },
  passwordResetTokenDate: {
    type: Date,
    default: Date.now,
  },
  birthdate: {
    type: Date,
    required: false,
  },
  role: {
    type: String,
    enum: ["user", "admin", "moderator", "writer"],
    default: "user",
  },
  // bio
  bio: {
    type: String,
    default: null,
  },
  contributions: {
    stories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
      },
    ],
    storiesCount: {
      type: Number,
      default: 0,
    },
  },
  deathclock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeathClock",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  badges: [
    {
      badgeName: {
        type: String,
      },
      badgeImage: {
        type: String,
      },
      badgeDescription: {
        type: String,
      },
    },
  ],
  isStoryAllowed: {
    type: Boolean,
    default: true,
  },
  isCommentAllowed: {
    type: Boolean,
    default: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  booksRead: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
      booksReadCount: {
        type: Number,
        default: 0,
      },
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  // following
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  socialLinks: {
    redditUrl: {
      type: String,
      default: '',
    },
    instagramUrl: {
      type: String,
      default: '',
    },
    twitterUrl: {
      type: String,
      default: '',
    },
    tumblrUrl: {
      type: String,
      default: '',
    },
    facebookUrl: {
      type: String,
      default: '',
    },
    tiktokUrl: {
      type: String,
      default: '',
    },
    youtubeUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    websiteUrl: {
      type: String,
      default: '',
    },
  },
});

// Pre-save middleware to update updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
