// scripts/linkEnhancedTags.js
const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('../model/submission.js');
const EnhancedTag = require('../model/enhancedTag.js');

async function linkEnhancedTags() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    // Get all stories with custom tags but empty enhanced tags
    const stories = await Story.find({ 
      customTags: { $exists: true, $ne: [] },
      $or: [
        { enhancedTags: { $exists: false } },
        { enhancedTags: { $size: 0 } }
      ]
    });
    
    console.log(`📚 Found ${stories.length} stories needing enhanced tag linking`);
    
    let updatedCount = 0;
    
    for (const story of stories) {
      const enhancedTagIds = [];
      
      console.log(`\n📖 Processing: "${story.storyTitle}"`);
      console.log(`   Custom tags: [${story.customTags.join(', ')}]`);
      
      // For each custom tag, find the corresponding enhanced tag
      for (const customTag of story.customTags) {
        const enhancedTag = await EnhancedTag.findOne({
          name: { $regex: new RegExp(`^${escapeRegex(customTag)}$`, 'i') }
        });
        
        if (enhancedTag) {
          enhancedTagIds.push(enhancedTag._id);
          console.log(`   ✅ Found enhanced tag: "${enhancedTag.name}" → ${enhancedTag._id}`);
        } else {
          console.log(`   ❌ No enhanced tag found for: "${customTag}"`);
        }
      }
      
      if (enhancedTagIds.length > 0) {
        // Update the story with enhanced tag references
        await Story.findByIdAndUpdate(story._id, {
          $set: { enhancedTags: enhancedTagIds }
        });
        
        updatedCount++;
        console.log(`   🔗 Linked ${enhancedTagIds.length} enhanced tags to story`);
      }
    }
    
    console.log(`\n🎉 Successfully linked enhanced tags to ${updatedCount} stories!`);
    
    // Test the fix
    const testStory = await Story.findOne({ 
      enhancedTags: { $ne: [] } 
    }).populate('enhancedTags');
    
    if (testStory) {
      console.log(`\n✅ Test Story: "${testStory.storyTitle}"`);
      console.log(`   Enhanced Tags: ${testStory.enhancedTags.length}`);
      testStory.enhancedTags.forEach(tag => {
        console.log(`   - "${tag.name}" (${tag.language})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

linkEnhancedTags();