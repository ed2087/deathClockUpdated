// scripts/directMigration.js
const mongoose = require('mongoose');
require('dotenv').config();

// Fix the model paths
const EnhancedCategory = require('../model/enhancedCategory.js');
const EnhancedTag = require('../model/enhancedTag.js');

async function directMigration() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    // Access the stories collection directly
    const storiesCollection = mongoose.connection.db.collection('stories');
    
    // Change this to migrate ALL stories instead of just 5
    const stories = await storiesCollection.find({}).toArray();
    
    console.log(`📚 Found ${stories.length} stories to migrate`);
    
    if (stories.length === 0) {
      console.log('❌ No stories found');
      return;
    }
    
    // Load category mappings
    const categories = await EnhancedCategory.find({});
    const categoryMappings = new Map();
    
    categories.forEach(cat => {
      cat.legacyNames.forEach(legacyName => {
        categoryMappings.set(legacyName.toLowerCase(), {
          id: cat._id,
          type: cat.type,
          name: cat.name.en
        });
      });
    });
    
    console.log(`📋 Loaded ${categoryMappings.size} category mappings`);
    
    let successCount = 0;
    let failureCount = 0;
    
    // Process each story
    for (let i = 0; i < stories.length; i++) {
      const story = stories[i];
      console.log(`\n🔄 Processing story ${i + 1}/${stories.length}: "${story.storyTitle}"`);
      
      try {
        // Map categories
        const { primaryCategory, secondaryCategories } = await mapStoryCategories(story, categoryMappings);
        
        // Process tags
        const { enhancedTags, customTags } = await processStoryTags(story);
        
        // Normalize language
        const language = normalizeLanguage(story.language);
        
        // Update the story
        const updateData = {
          primaryCategory,
          secondaryCategories,
          enhancedTags,
          customTags,
          language,
          migrationStatus: 'migrated',
          migrationNotes: 'Auto-migrated successfully'
        };
        
        await storiesCollection.updateOne(
          { _id: story._id },
          { $set: updateData }
        );
        
        console.log(`  ✅ Updated: Primary(${primaryCategory ? '✓' : '✗'}) Secondary(${secondaryCategories.length}) Tags(${enhancedTags.length}) Custom(${customTags.length})`);
        successCount++;
        
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
        failureCount++;
      }
    }
    
    console.log('\n🎉 MIGRATION COMPLETED!');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📊 Total: ${stories.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

async function mapStoryCategories(story, categoryMappings) {
  let primaryCategory = null;
  const secondaryCategories = [];
  
  const categories = story.categories || [];
  console.log(`  Categories: [${categories.join(', ')}]`);
  
  // Priority order for genres
  const genrePriority = [
    'psychological horror',
    'madness, paranoia, and mental illness',
    'supernatural horror',
    'body horror',
    'body snatcher horror',
    'folk horror',
    'urban legends',
    'myths and legends',
    'sci-fi horror',
    'slasher'
  ];
  
  // Try to find a genre first
  for (const priority of genrePriority) {
    const found = categories.find(cat => cat.toLowerCase() === priority);
    if (found && categoryMappings.has(found.toLowerCase())) {
      const mapping = categoryMappings.get(found.toLowerCase());
      if (mapping.type === 'genre') {
        primaryCategory = mapping.id;
        console.log(`  ✅ Primary genre: ${mapping.name}`);
        break;
      }
    }
  }
  
  // If no genre found, use any category
  if (!primaryCategory) {
    for (const cat of categories) {
      const mapping = categoryMappings.get(cat.toLowerCase());
      if (mapping) {
        primaryCategory = mapping.id;
        console.log(`  ✅ Primary (non-genre): ${mapping.name} (${mapping.type})`);
        break;
      }
    }
  }
  
  // Map remaining as secondary (max 2)
  for (const cat of categories) {
    const mapping = categoryMappings.get(cat.toLowerCase());
    if (mapping && 
        mapping.id.toString() !== primaryCategory?.toString() && 
        secondaryCategories.length < 2) {
      secondaryCategories.push(mapping.id);
      console.log(`  ✅ Secondary: ${mapping.name} (${mapping.type})`);
    }
  }
  
  if (!primaryCategory) {
    console.log(`  ❌ No category mappings found for: [${categories.join(', ')}]`);
  }
  
  return { primaryCategory, secondaryCategories };
}

async function processStoryTags(story) {
  const allTags = [...(story.tags || []), ...(story.extraTags || [])];
  const enhancedTags = [];
  const customTags = [];
  
  console.log(`  Processing ${allTags.length} tags...`);
  
  for (let tagName of allTags) {
    if (!tagName || tagName.trim().length === 0) continue;
    
    tagName = tagName.trim().toLowerCase();
    
    // Skip very long tags (sentences)
    if (tagName.length > 30) {
      console.log(`    ⚠️ Skipping long tag: "${tagName.substring(0, 20)}..."`);
      continue;
    }
    
    // Handle comma-separated tags
    if (tagName.includes(',')) {
      const splitTags = tagName.split(',').map(t => t.trim()).filter(t => t.length > 0);
      console.log(`    🔧 Splitting: [${splitTags.join(', ')}]`);
      
      for (const splitTag of splitTags) {
        if (splitTag.length >= 3 && splitTag.length <= 20) {
          await processIndividualTag(splitTag, enhancedTags, customTags);
        }
      }
      continue;
    }
    
    if (tagName.length >= 3 && tagName.length <= 20) {
      await processIndividualTag(tagName, enhancedTags, customTags);
    }
  }
  
  return { enhancedTags, customTags };
}

async function processIndividualTag(tagName, enhancedTags, customTags) {
  try {
    // Clean the tag name
    tagName = tagName.trim().toLowerCase();
    
    // Skip if too short or has weird characters
    if (tagName.length < 3 || /[^\w\s-]/.test(tagName)) {
      return;
    }
    
    // Try to find existing tag
    let enhancedTag = await EnhancedTag.findOne({ 
      name: { $regex: new RegExp(`^${escapeRegex(tagName)}$`, 'i') } 
    });
    
    if (!enhancedTag) {
      // Create new tag
      enhancedTag = await EnhancedTag.create({
        name: tagName,
        language: 'universal',
        usageCount: 1,
        isApproved: isCommonTag(tagName),
        qualityScore: calculateTagQuality(tagName)
      });
      console.log(`    ✅ Created: "${tagName}"`);
    } else {
      // Update usage count
      enhancedTag.usageCount++;
      enhancedTag.lastUsed = new Date();
      await enhancedTag.save();
      console.log(`    ♻️  Reused: "${tagName}"`);
    }
    
    if (enhancedTag && !enhancedTags.some(id => id.toString() === enhancedTag._id.toString())) {
      enhancedTags.push(enhancedTag._id);
    }
    
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error, try to find it again
      const enhancedTag = await EnhancedTag.findOne({ 
        name: { $regex: new RegExp(`^${escapeRegex(tagName)}$`, 'i') } 
      });
      if (enhancedTag && !enhancedTags.some(id => id.toString() === enhancedTag._id.toString())) {
        enhancedTags.push(enhancedTag._id);
      }
    } else {
      // If tag creation fails, add as custom tag
      if (customTags.length < 3 && !customTags.includes(tagName)) {
        customTags.push(tagName);
        console.log(`    📝 Custom: "${tagName}"`);
      }
    }
  }
}

function normalizeLanguage(language) {
  if (!language) return 'en';
  
  const langMap = {
    'english': 'en',
    'spanish': 'es',
    'español': 'es',
    'espanol': 'es'
  };
  
  return langMap[language.toLowerCase()] || language.toLowerCase() || 'en';
}

function isCommonTag(tagName) {
  const commonTags = [
    'horror', 'scary', 'creepy', 'supernatural', 'ghost', 'haunted',
    'psychological', 'thriller', 'suspense', 'dark', 'mysterious',
    'terror', 'miedo', 'fantasmas', 'sobrenatural', 'weird horror',
    'madness horror', 'psychological horror', 'short story', 'creepypasta',
    'folklore', 'legends', 'nighttime', 'atmospheric', 'chilling'
  ];
  return commonTags.includes(tagName.toLowerCase());
}

function calculateTagQuality(tagName) {
  let score = 0;
  
  if (tagName.length >= 4 && tagName.length <= 15) score += 2;
  if (!/\d/.test(tagName)) score += 1;
  if (tagName.split(' ').length <= 2) score += 1;
  if (isCommonTag(tagName)) score += 2;
  
  return Math.min(score, 5);
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

directMigration();