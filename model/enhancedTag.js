// model/enhancedTag.js
const mongoose = require('mongoose');

const enhancedTagSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  language: {
    type: String,
    enum: ['en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'universal'],
    default: 'en'
  },
  usageCount: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Auto-approval rules
  isAutoApproved: { type: Boolean, default: false },
  similarTags: [String], // For fuzzy matching
  
  // Quality metrics
  qualityScore: { type: Number, default: 0 },
  lastUsed: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
enhancedTagSchema.index({ slug: 1 });
enhancedTagSchema.index({ name: 1 });
enhancedTagSchema.index({ language: 1, usageCount: -1 });
enhancedTagSchema.index({ name: 'text' });

// Pre-save middleware to generate slug
enhancedTagSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
  }
  next();
});

const EnhancedTag = mongoose.model('EnhancedTag', enhancedTagSchema);

module.exports = EnhancedTag;