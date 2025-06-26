// scripts/seedCategories.js
const mongoose = require('mongoose');
require('dotenv').config();

const EnhancedCategory = require('../model/enhancedCategory.js');
const { genres, formats, themes } = require('../utils/categorySeeds.js');

async function seedCategories() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    // Clear existing enhanced categories (optional - be careful!)
    // await EnhancedCategory.deleteMany({});
    // console.log('🗑️ Cleared existing categories');
    
    // Seed genres
    console.log('🎭 Seeding genres...');
    for (const genre of genres) {
      const existing = await EnhancedCategory.findOne({ slug: genre.slug });
      if (!existing) {
        await EnhancedCategory.create(genre);
        console.log(`  ✅ Created genre: ${genre.name.en}`);
      } else {
        console.log(`  ⚠️ Genre already exists: ${genre.name.en}`);
      }
    }
    
    // Seed formats
    console.log('📄 Seeding formats...');
    for (const format of formats) {
      const existing = await EnhancedCategory.findOne({ slug: format.slug });
      if (!existing) {
        await EnhancedCategory.create(format);
        console.log(`  ✅ Created format: ${format.name.en}`);
      } else {
        console.log(`  ⚠️ Format already exists: ${format.name.en}`);
      }
    }
    
    // Seed themes
    console.log('🎨 Seeding themes...');
    for (const theme of themes) {
      const existing = await EnhancedCategory.findOne({ slug: theme.slug });
      if (!existing) {
        await EnhancedCategory.create(theme);
        console.log(`  ✅ Created theme: ${theme.name.en}`);
      } else {
        console.log(`  ⚠️ Theme already exists: ${theme.name.en}`);
      }
    }
    
    // Display summary
    const totalCategories = await EnhancedCategory.countDocuments();
    console.log(`\n📊 Summary:`);
    console.log(`Total categories: ${totalCategories}`);
    
    const genreCount = await EnhancedCategory.countDocuments({ type: 'genre' });
    const formatCount = await EnhancedCategory.countDocuments({ type: 'format' });
    const themeCount = await EnhancedCategory.countDocuments({ type: 'theme' });
    
    console.log(`Genres: ${genreCount}`);
    console.log(`Formats: ${formatCount}`);
    console.log(`Themes: ${themeCount}`);
    
    console.log('\n🎉 Category seeding completed!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run if called directly
if (require.main === module) {
  seedCategories();
}

module.exports = seedCategories;