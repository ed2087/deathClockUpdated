// models/enhancedCategory.js
const mongoose = require('mongoose');

const enhancedCategorySchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    es: { type: String, required: true }
  },
  slug: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['genre', 'format', 'theme'], 
    required: true
  },
  description: { 
    en: String, 
    es: String 
  },
  icon: String, // For UI
  color: String, // For UI theming  
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  storyCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Legacy mapping for migration
  legacyNames: [String] // Maps old category names to new ones
}, { timestamps: true });

// Indexes
enhancedCategorySchema.index({ slug: 1 });
enhancedCategorySchema.index({ type: 1, displayOrder: 1 });
enhancedCategorySchema.index({ 'name.en': 'text', 'name.es': 'text' });

const EnhancedCategory = mongoose.model('EnhancedCategory', enhancedCategorySchema);

module.exports = EnhancedCategory;