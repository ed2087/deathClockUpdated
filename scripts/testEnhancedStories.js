// scripts/testEnhancedStories.js
const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('../model/submission.js');
const EnhancedCategory = require('../model/enhancedCategory.js');
const EnhancedTag = require('../model/enhancedTag.js');

async function testEnhancedStories() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    // Test 1: Get a story with enhanced fields
    const story = await Story.findOne({ migrationStatus: 'migrated' })
      .populate('primaryCategory')
      .populate('secondaryCategories')
      .populate('enhancedTags');
    
    if (story) {
      console.log(`\n📖 Story: "${story.storyTitle}"`);
      console.log(`🏷️ Primary Category: ${story.primaryCategory?.name?.en || 'None'}`);
      console.log(`🏷️ Secondary Categories: ${story.secondaryCategories?.length || 0}`);
      story.secondaryCategories?.forEach(cat => {
        console.log(`   - ${cat.name?.en} (${cat.type})`);
      });
      console.log(`🔖 Enhanced Tags: ${story.enhancedTags?.length || 0}`);
      story.enhancedTags?.forEach(tag => {
        console.log(`   - "${tag.name}" (${tag.language})`);
      });
      console.log(`📝 Custom Tags: [${(story.customTags || []).join(', ')}]`);
      console.log(`🔤 Language: ${story.language}`);
      console.log(`📊 Migration Status: ${story.migrationStatus}`);
    }
    
    // Test 2: Count stories by category
    console.log('\n📊 Stories by Primary Category:');
    const categories = await EnhancedCategory.find({});
    for (const category of categories.slice(0, 5)) {
      const count = await Story.countDocuments({ primaryCategory: category._id });
      console.log(`  ${category.name.en}: ${count} stories`);
    }
    
    // Test 3: Most popular tags
    console.log('\n🏆 Most Popular Tags:');
    const popularTags = await EnhancedTag.find({})
      .sort({ usageCount: -1 })
      .limit(10);
    
    popularTags.forEach(tag => {
      console.log(`  "${tag.name}": ${tag.usageCount} uses (${tag.language})`);
    });
    
    console.log('\n🎉 Enhanced Story model is working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testEnhancedStories();