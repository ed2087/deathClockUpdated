const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  originalCretor: {
    type: Schema.Types.ObjectId
  },
  updatedAt: Date,
});

categorySchema.index({ name: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
