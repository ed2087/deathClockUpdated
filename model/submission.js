// model/submission.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const storySchema = new mongoose.Schema({
  // ... ALL your existing fields (keep everything) ...
  legalName: {
    type: String,
    required: true,
  },
  creditingName: {
    type: String,
    required: true,
  },
  socialMedia: Array,
  website: String,
  storyTitle: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  storySummary: {
    type: String,
    required: true,
  },
  tags: [String], // OLD SYSTEM - keep for backward compatibility
  storyText: {
    type: String,
    required: true,
  },
  categories: [String], // OLD SYSTEM - keep for backward compatibility
  extraTags: [String], // OLD SYSTEM - keep for backward compatibility
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  readCount: {
    type: Number,
    default: 0,
  },
  readCountUserData: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  upvoteCount: {
    type: Number,
    default: 0,
  }, 
  readingTime: {
    type: Number,
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
    },
  ],
  commentCount: {
    type: Number,
    default: 0,
  },
  reports: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isApproved: {
    type: Boolean,
    default: true
  },
  rejectionReason: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  youtubeLink: String,
  backgroundUrl: String,
  
  // 🎉 NEW ENHANCED CATEGORIZATION SYSTEM (ADD THESE)
  primaryCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedCategory'
    // Note: Not required for backward compatibility
  },
  secondaryCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedCategory'
  }],
  enhancedTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedTag'
  }],
  customTags: [{ 
    type: String, 
    trim: true, 
    maxlength: 30 
  }],
  
  // Migration tracking
  migrationStatus: {
    type: String,
    enum: ['pending', 'migrated', 'manual_review', 'completed'],
    default: 'pending'
  },
  migrationNotes: String
});

// Keep all your existing middleware and indexes
storySchema.pre('save', function (next) {
  if (!this.isModified('storyTitle')) {
    return next();
  }
  this.slug = slugify(this.storyTitle, { lower: true });
  next();
});

// Keep existing text index but add new fields
storySchema.index({
  legalName: 'text',
  creditingName: 'text',
  storyTitle: 'text',
  storySummary: 'text',
  tags: 'text',
  storyText: 'text',
  categories: 'text',
  extraTags: 'text',
  customTags: 'text', // NEW
  slug: 'text',
});

// Add new indexes for enhanced system
storySchema.index({ primaryCategory: 1, createdAt: -1 });
storySchema.index({ secondaryCategories: 1 });
storySchema.index({ enhancedTags: 1 });
storySchema.index({ migrationStatus: 1 });

const Story = mongoose.model('Story', storySchema);

module.exports = Story;