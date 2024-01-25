const mongoose = require('mongoose');
const slugify = require('slugify'); // Make sure to install this package using `npm install slugify`

const storySchema = new mongoose.Schema({
  legalName: {
    type: String,
    required: true,
  },
  creditingName: {
    type: String,
    required: true,
  },
  socialMedia: Array,
  website: String, // Optional, can be an array of links
  storyTitle: {
    type: String,
    required: true,
  },
  // create a slug for the story title
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  storySummary: {
    type: String,
    required: true,
  },
  tags: [String], // You can choose from the provided genres/tags
  storyText: {
    type: String,
    required: true,
  },
  categories: [String], // You can choose from the provided categories
  extraTags: [String], // Optional, can be an array of tags
  ageVerification: {
    type: Boolean,
    required: true,
  },
  acceptedTerms: {
    type: Boolean,
    required: true,
  },
  termsAndConditions: {
    type: Boolean,
    required: true,
  },
  //submission owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // language
  language: {
    type: String,
    required: true,
  },
  // how many times the story has been read
  readCount: {
    type: Number,
    default: 0,
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the user who upvoted
      required: true,
      
    },
  ],
  upvoteCount: {
    type: Number,
    default: 0,
  },  
  //add comments from users
  comments : [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the user who commented
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },      
    },
  ],
  readingTime: {
    type: Number,
    required: true,
  },
  // Reporting system
  reports: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // You can create a User model for tracking who reported the story
        required: true,
      },
      reason: String, // Optional: You can specify a reason for the report
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Moderation system
  isApproved: {
    type: Boolean,
    default: true
  },
  //reason for rejection and user who rejected
  rejectionReason: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // You can create a User model for tracking who rejected the story
        required: true,
      },
      reason: String, // Optional: You can specify a reason for the rejection
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // update get time and user who updated
  updateDetails: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ], 
  // date of creation
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // youtube video link
  youtubeLink: String,

  
});

// Middleware to create a slug before saving the story
storySchema.pre('save', function (next) {
  if (!this.isModified('storyTitle')) {
    return next();
  }

  this.slug = slugify(this.storyTitle, { lower: true });
  next();
});

// ... (your existing code)

const Story = mongoose.model('Story', storySchema);

module.exports = Story;

// create a text index
storySchema.index({
  legalName: 'text',
  creditingName: 'text',
  storyTitle: 'text',
  storySummary: 'text',
  tags: 'text',
  storyText: 'text',
  categories: 'text',
  extraTags: 'text',
  slug: 'text', // Include slug in text index
});




