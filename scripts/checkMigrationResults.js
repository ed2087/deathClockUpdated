// scripts/checkMigrationResults.js
const mongoose = require('mongoose');
require('dotenv').config();

const EnhancedTag = require('../model/enhancedTag.js');
const EnhancedCategory = require('../model/enhancedCategory.js');

async function checkResults() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    // Check Enhanced Tags
    const tagCount = await EnhancedTag.countDocuments();
    console.log(`📊 Enhanced Tags created: ${tagCount}`);
    
    if (tagCount > 0) {
      const sampleTags = await EnhancedTag.find({}).limit(10);
      console.log('\n🏷️ Sample Enhanced Tags:');
      sampleTags.forEach(tag => {
        console.log(`  "${tag.name}" - Uses: ${tag.usageCount}, Approved: ${tag.isApproved}`);
      });
    }
    
    // Check Enhanced Categories
    const catCount = await EnhancedCategory.countDocuments();
    console.log(`\n📊 Enhanced Categories: ${catCount}`);
    
    // Check Stories with new fields
    const storiesCollection = mongoose.connection.db.collection('stories');
    const migratedStories = await storiesCollection.find({ 
      migrationStatus: 'migrated' 
    }).limit(5).toArray();
    
    console.log(`\n📚 Migrated Stories: ${migratedStories.length}`);
    
    if (migratedStories.length > 0) {
      console.log('\n📝 Sample migrated story:');
      const story = migratedStories[0];
      console.log(`  Title: "${story.storyTitle}"`);
      console.log(`  Primary Category: ${story.primaryCategory}`);
      console.log(`  Secondary Categories: ${story.secondaryCategories?.length || 0}`);
      console.log(`  Enhanced Tags: ${story.enhancedTags?.length || 0}`);
      console.log(`  Custom Tags: ${story.customTags?.length || 0} - [${(story.customTags || []).join(', ')}]`);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkResults();