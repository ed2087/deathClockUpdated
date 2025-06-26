// scripts/fixTagMigration.js
const mongoose = require('mongoose');
require('dotenv').config();

const EnhancedTag = require('../model/enhancedTag.js');

async function fixTagMigration() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    // Get all stories with custom tags
    const storiesCollection = mongoose.connection.db.collection('stories');
    const stories = await storiesCollection.find({ 
      customTags: { $exists: true, $ne: [] } 
    }).toArray();
    
    console.log(`📚 Found ${stories.length} stories with custom tags`);
    
    // Collect all unique custom tags
    const allCustomTags = new Set();
    stories.forEach(story => {
      (story.customTags || []).forEach(tag => {
        if (tag && tag.trim().length >= 3 && tag.trim().length <= 30) {
          allCustomTags.add(tag.trim().toLowerCase());
        }
      });
    });
    
    console.log(`🏷️ Found ${allCustomTags.size} unique custom tags`);
    
    // Create Enhanced Tags from custom tags
    const createdTags = [];
    for (const tagName of allCustomTags) {
      try {
        // Generate slug manually
        const slug = generateSlug(tagName);
        
        // Detect language
        const language = detectLanguage(tagName);
        
        // Check if tag already exists by name or slug
        let enhancedTag = await EnhancedTag.findOne({ 
          $or: [
            { name: { $regex: new RegExp(`^${escapeRegex(tagName)}$`, 'i') } },
            { slug: slug }
          ]
        });
        
        if (!enhancedTag) {
          enhancedTag = await EnhancedTag.create({
            name: tagName,
            slug: slug,
            language: language,
            usageCount: 1,
            isApproved: isCommonTag(tagName),
            qualityScore: calculateTagQuality(tagName)
          });
          createdTags.push(enhancedTag);
          console.log(`✅ Created tag: "${tagName}" → slug: "${slug}" (${language})`);
        } else {
          console.log(`♻️ Tag exists: "${tagName}"`);
        }
      } catch (error) {
        if (error.code === 11000) {
          // Handle duplicate slug by adding number
          const newSlug = `${generateSlug(tagName)}-${Date.now()}`;
          try {
            const enhancedTag = await EnhancedTag.create({
              name: tagName,
              slug: newSlug,
              language: detectLanguage(tagName),
              usageCount: 1,
              isApproved: isCommonTag(tagName),
              qualityScore: calculateTagQuality(tagName)
            });
            createdTags.push(enhancedTag);
            console.log(`✅ Created tag with unique slug: "${tagName}" → "${newSlug}"`);
          } catch (retryError) {
            console.log(`❌ Failed to create tag "${tagName}": ${retryError.message}`);
          }
        } else {
          console.log(`❌ Failed to create tag "${tagName}": ${error.message}`);
        }
      }
    }
    
    console.log(`\n🎉 Created ${createdTags.length} new enhanced tags`);
    
    // Now update stories to use enhanced tags
    let updatedCount = 0;
    for (const story of stories) {
      const enhancedTags = [];
      
      for (const customTag of (story.customTags || [])) {
        if (customTag && customTag.trim().length >= 3) {
          const tagName = customTag.trim().toLowerCase();
          const enhancedTag = await EnhancedTag.findOne({ 
            name: { $regex: new RegExp(`^${escapeRegex(tagName)}$`, 'i') } 
          });
          
          if (enhancedTag && !enhancedTags.some(id => id.toString() === enhancedTag._id.toString())) {
            enhancedTags.push(enhancedTag._id);
            
            // Update usage count
            enhancedTag.usageCount++;
            enhancedTag.lastUsed = new Date();
            await enhancedTag.save();
          }
        }
      }
      
      if (enhancedTags.length > 0) {
        await storiesCollection.updateOne(
          { _id: story._id },
          { $set: { enhancedTags: enhancedTags } }
        );
        updatedCount++;
        console.log(`📖 Updated "${story.storyTitle}" with ${enhancedTags.length} enhanced tags`);
      }
    }
    
    console.log(`\n✅ Updated ${updatedCount} stories with enhanced tags`);
    
    // Final summary
    const finalTagCount = await EnhancedTag.countDocuments();
    console.log(`\n📊 Final Enhanced Tag count: ${finalTagCount}`);
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

function generateSlug(tagName) {
  return tagName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
}

function detectLanguage(tagName) {
  const spanishWords = [
    'terror', 'miedo', 'fantasmas', 'sobrenatural', 'misterio', 'leyendas',
    'relatos', 'historia', 'espejo', 'casa', 'embrujada', 'mitos',
    'narrativa', 'personal', 'viaje', 'astral', 'alma', 'sed'
  ];
  
  const lowerTag = tagName.toLowerCase();
  for (const word of spanishWords) {
    if (lowerTag.includes(word)) {
      return 'es';
    }
  }
  
  return 'en'; // Default to English
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

fixTagMigration();