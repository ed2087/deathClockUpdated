// scripts/migrateStories.js
const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('../model/submission.js'); // Your current model
const EnhancedCategory = require('../model/enhancedCategory.js');
const EnhancedTag = require('../model/enhancedTag.js');

class StoryMigrator {
  constructor() {
    this.categoryMappings = new Map();
    this.migrationStats = {
      total: 0,
      success: 0,
      needsReview: 0,
      failed: 0,
      details: []
    };
  }

  async initialize() {
    // Load category mappings
    const categories = await EnhancedCategory.find({});
    categories.forEach(cat => {
      cat.legacyNames.forEach(legacyName => {
        this.categoryMappings.set(legacyName.toLowerCase(), {
          id: cat._id,
          type: cat.type,
          name: cat.name.en,
          slug: cat.slug
        });
      });
    });
    
    console.log(`📋 Loaded ${this.categoryMappings.size} category mappings`);
    
    // Show some mappings for verification
    console.log('\n🔗 Sample category mappings:');
    Array.from(this.categoryMappings.entries()).slice(0, 10).forEach(([old, newCat]) => {
      console.log(`  "${old}" → ${newCat.name} (${newCat.type})`);
    });
  }

  async migrateStory(story) {
    try {
      const migration = {
        storyId: story._id,
        title: story.storyTitle,
        oldCategories: story.categories || [],
        oldTags: story.tags || [],
        oldExtraTags: story.extraTags || [],
        issues: [],
        changes: []
      };

      // 1. Map categories to new system
      const { primaryCategory, secondaryCategories } = this.mapCategories(story.categories || [], migration);
      
      // 2. Process tags
      const { enhancedTags, customTags } = await this.processTags(story.tags || [], story.extraTags || [], migration);
      
      // 3. Normalize language
      const language = this.normalizeLanguage(story.language);
      
      // 4. Determine migration status
      const migrationStatus = migration.issues.length > 0 ? 'manual_review' : 'migrated';
      const migrationNotes = migration.issues.length > 0 ? 
        migration.issues.join('; ') : 
        'Auto-migrated successfully';

      // 5. Update story with new fields (but keep old ones for backup)
      const updateData = {
        primaryCategory,
        secondaryCategories,
        enhancedTags,
        customTags,
        language,
        migrationStatus,
        migrationNotes
      };

      // Update the story
      await Story.findByIdAndUpdate(story._id, updateData);
      
      // Track changes
      migration.changes = [
        `Primary: ${primaryCategory ? '✅' : '❌'}`,
        `Secondary: ${secondaryCategories.length}`,
        `Enhanced tags: ${enhancedTags.length}`,
        `Custom tags: ${customTags.length}`,
        `Language: ${language}`
      ];

      this.migrationStats.details.push(migration);
      
      if (migration.issues.length > 0) {
        this.migrationStats.needsReview++;
        console.log(`⚠️  "${story.storyTitle}"`);
        console.log(`    Issues: ${migration.issues.join(', ')}`);
        console.log(`    Changes: ${migration.changes.join(', ')}`);
      } else {
        this.migrationStats.success++;
        console.log(`✅ "${story.storyTitle}" - ${migration.changes.join(', ')}`);
      }

    } catch (error) {
      this.migrationStats.failed++;
      console.error(`❌ Failed to migrate "${story.storyTitle}":`, error.message);
    }
  }

  mapCategories(oldCategories, migration) {
    let primaryCategory = null;
    const secondaryCategories = [];

    console.log(`\n📝 Mapping categories for: "${migration.title}"`);
    console.log(`   Old categories: [${oldCategories.join(', ')}]`);

    // Priority order for primary category selection (prefer genres)
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

    // First, try to find a genre as primary
    for (const priority of genrePriority) {
      const found = oldCategories.find(cat => cat.toLowerCase() === priority);
      if (found && this.categoryMappings.has(found.toLowerCase())) {
        const mapping = this.categoryMappings.get(found.toLowerCase());
        if (mapping.type === 'genre') {
          primaryCategory = mapping.id;
          console.log(`   Primary genre found: ${mapping.name}`);
          break;
        }
      }
    }

    // If no genre found, try any category as primary
    if (!primaryCategory) {
      for (const cat of oldCategories) {
        const mapping = this.categoryMappings.get(cat.toLowerCase());
        if (mapping) {
          primaryCategory = mapping.id;
          console.log(`   Primary (non-genre) found: ${mapping.name} (${mapping.type})`);
          break;
        }
      }
    }

    // Map remaining categories as secondary (max 2)
    for (const cat of oldCategories) {
      const mapping = this.categoryMappings.get(cat.toLowerCase());
      if (mapping && 
          mapping.id.toString() !== primaryCategory?.toString() && 
          secondaryCategories.length < 2) {
        secondaryCategories.push(mapping.id);
        console.log(`   Secondary added: ${mapping.name} (${mapping.type})`);
      }
    }

    // Check for issues
    if (!primaryCategory) {
      migration.issues.push('No primary category mapped');
      console.log(`   ❌ No mappings found for: [${oldCategories.join(', ')}]`);
    }
    
    if (oldCategories.length > 3) {
      migration.issues.push(`Had ${oldCategories.length} categories (reduced to ${1 + secondaryCategories.length})`);
    }

    return { primaryCategory, secondaryCategories };
  }

  async processTags(tags, extraTags, migration) {
    const allTags = [...(tags || []), ...(extraTags || [])];
    const enhancedTags = [];
    const customTags = [];

    console.log(`   Processing ${allTags.length} tags...`);

    for (let tagName of allTags) {
      if (!tagName) continue;
      
      tagName = tagName.trim().toLowerCase();
      
      if (tagName.length === 0) continue;
      
      // Skip very long tags (probably sentences)
      if (tagName.length > 30) {
        migration.issues.push(`Skipped long tag: "${tagName.substring(0, 20)}..."`);
        continue;
      }

      // Try to find existing enhanced tag
      let enhancedTag = await EnhancedTag.findOne({ 
        name: { $regex: new RegExp(`^${this.escapeRegex(tagName)}$`, 'i') } 
      });

      if (!enhancedTag && tagName.length >= 3 && tagName.length <= 20) {
        // Create new tag
        try {
          enhancedTag = await EnhancedTag.create({
            name: tagName,
            language: 'universal',
            usageCount: 1,
            isApproved: this.isCommonTag(tagName),
            qualityScore: this.calculateTagQuality(tagName)
          });
          console.log(`   Created new tag: "${tagName}"`);
        } catch (error) {
          if (error.code === 11000) {
            // Duplicate key error, tag already exists
            enhancedTag = await EnhancedTag.findOne({ 
              name: { $regex: new RegExp(`^${this.escapeRegex(tagName)}$`, 'i') } 
            });
          }
        }
      }

      if (enhancedTag) {
        if (!enhancedTags.some(id => id.toString() === enhancedTag._id.toString())) {
          enhancedTags.push(enhancedTag._id);
          // Increment usage count
          enhancedTag.usageCount++;
          enhancedTag.lastUsed = new Date();
          await enhancedTag.save();
        }
      } else if (customTags.length < 3 && tagName.length <= 20) {
        customTags.push(tagName);
        console.log(`   Added custom tag: "${tagName}"`);
      }
    }

    return { enhancedTags, customTags };
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  isCommonTag(tagName) {
    const commonTags = [
      'horror', 'scary', 'creepy', 'supernatural', 'ghost', 'haunted',
      'psychological', 'thriller', 'suspense', 'dark', 'mysterious',
      'terror', 'miedo', 'fantasmas', 'sobrenatural', 'weird horror',
      'madness horror', 'psychological horror', 'short story', 'creepypasta'
    ];
    return commonTags.includes(tagName.toLowerCase());
  }

  calculateTagQuality(tagName) {
    let score = 0;
    
    // Length bonus
    if (tagName.length >= 4 && tagName.length <= 15) score += 2;
    
    // No numbers bonus
    if (!/\d/.test(tagName)) score += 1;
    
    // Single word bonus (but allow 2-word combinations)
    const wordCount = tagName.split(' ').length;
    if (wordCount <= 2) score += 1;
    
    // Horror-related bonus
    if (this.isCommonTag(tagName)) score += 2;
    
    return Math.min(score, 5);
  }

  normalizeLanguage(language) {
    if (!language) return 'en';
    
    const langMap = {
      'english': 'en',
      'spanish': 'es',
      'español': 'es',
      'espanol': 'es',
      'portuguese': 'pt',
      'french': 'fr',
      'german': 'de',
      'italian': 'it',
      'russian': 'ru',
      'japanese': 'ja',
      'korean': 'ko',
      'chinese': 'zh',
      'arabic': 'ar',
      'hindi': 'hi'
    };

    return langMap[language.toLowerCase()] || language.toLowerCase() || 'en';
  }

// Replace the runMigration method in scripts/migrateStories.js

async runMigration(limit = null) {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    await this.initialize();
    
    // Get stories to migrate - NO FILTER, get all stories
    const stories = limit ? 
      await Story.find({}).limit(limit) : 
      await Story.find({});
    
    this.migrationStats.total = stories.length;
    console.log(`\n📚 Found ${stories.length} stories to migrate`);
    
    if (stories.length === 0) {
      console.log('❌ No stories found! Check your Story model path.');
      console.log('Current model path: ../model/submission.js');
      
      // Test if we can find ANY stories
      const testCount = await Story.countDocuments({});
      console.log(`Total stories in database: ${testCount}`);
      return;
    }
    
    // Show first story info for debugging
    if (stories.length > 0) {
      const firstStory = stories[0];
      console.log(`\n🔍 First story example:`);
      console.log(`  Title: "${firstStory.storyTitle}"`);
      console.log(`  Categories: [${(firstStory.categories || []).join(', ')}]`);
      console.log(`  Tags: [${(firstStory.tags || []).join(', ')}]`);
      console.log(`  Extra Tags: [${(firstStory.extraTags || []).join(', ')}]`);
      console.log(`  Language: ${firstStory.language}`);
    }
    
    // Migrate each story
    for (let i = 0; i < stories.length; i++) {
      console.log(`\n🔄 Migrating story ${i + 1}/${stories.length}`);
      await this.migrateStory(stories[i]);
    }
    
    this.printSummary();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

  printSummary() {
    console.log('\n📊 MIGRATION SUMMARY');
    console.log('====================');
    console.log(`Total stories: ${this.migrationStats.total}`);
    console.log(`✅ Successfully migrated: ${this.migrationStats.success}`);
    console.log(`⚠️ Need manual review: ${this.migrationStats.needsReview}`);
    console.log(`❌ Failed: ${this.migrationStats.failed}`);
    
    if (this.migrationStats.needsReview > 0) {
      console.log('\n⚠️ Stories needing manual review:');
      this.migrationStats.details
        .filter(d => d.issues.length > 0)
        .slice(0, 10)
        .forEach(detail => {
          console.log(`  "${detail.title}": ${detail.issues.join(', ')}`);
        });
    }
    
    console.log('\n🎉 Migration completed!');
  }
}

// Run migration
async function runMigration() {
  const migrator = new StoryMigrator();
  
  // Start with first 5 stories for testing
  await migrator.runMigration(5);
}

if (require.main === module) {
  runMigration();
}

module.exports = StoryMigrator;