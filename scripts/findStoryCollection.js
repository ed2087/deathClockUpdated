// scripts/findStoryCollection.js
const mongoose = require('mongoose');
require('dotenv').config();

async function findStoryCollection() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to database');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 All collections in database:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check common story collection names
    const possibleNames = ['stories', 'submissions', 'terrorstories', 'terrorsubmissions'];
    
    for (const name of possibleNames) {
      try {
        const count = await mongoose.connection.db.collection(name).countDocuments();
        console.log(`\n📊 Collection "${name}": ${count} documents`);
        
        if (count > 0) {
          const sample = await mongoose.connection.db.collection(name).findOne();
          console.log(`Sample document from "${name}":`, {
            title: sample.storyTitle,
            categories: sample.categories,
            tags: sample.tags
          });
        }
      } catch (error) {
        // Collection doesn't exist
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

findStoryCollection();