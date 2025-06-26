// scripts/testStoryCount.js
const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('../model/submission.js');

async function testStoryCount() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const count = await Story.countDocuments({});
    console.log(`Total stories found: ${count}`);
    
    if (count > 0) {
      const firstStory = await Story.findOne({});
      console.log(`First story title: "${firstStory.storyTitle}"`);
      console.log(`First story categories:`, firstStory.categories);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testStoryCount();