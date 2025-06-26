// scripts/runAudit.js
const mongoose = require('mongoose');
const StoryDataAuditor = require('../utils/storyDataAudit.js'); // Added .js extension
require('dotenv').config(); // Load environment variables

async function runAudit() {
  try {
    // Connect to database using your existing env variable
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('🔌 Connected to database');
    
    // Run the audit
    const auditor = new StoryDataAuditor();
    const results = await auditor.runFullAudit();
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Audit complete!');
    
  } catch (error) {
    console.error('💥 Audit failed:', error);
    process.exit(1);
  }
}

runAudit();