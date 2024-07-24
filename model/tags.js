const mongoose = require('mongoose');

const { Schema } = mongoose;

const tagSchema = new Schema({
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
  originalCretor: {
    type: Schema.Types.ObjectId,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

tagSchema.index({ name: 1 });

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
