const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  legalName: {
    type: String,
    required: true,
  },
  creditingName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  socialMedia: [String],
  website: String, // Optional, can be an array of links
  storyTitle: {
    type: String,
    required: true,
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
  // Rating system
  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // You can create a User model for tracking who rated the story
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },
  ],
  // Reporting system
  reports: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // You can create a User model for tracking who reported the story
        required: true,
      },
      reason: String, // Optional: You can specify a reason for the report
    },
  ],
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
