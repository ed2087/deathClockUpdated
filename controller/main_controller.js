const { readFileAPI } = require("../utils/readFiles.js");
const Question = require("../model/user.js");
const Story = require("../model/submission.js");
const xmlbuilder = require('xmlbuilder');
const User = require("../model/user.js");
// utils
const {someUserInfo,calculateReadingTime,GetStories} = require("../utils/utils_fun.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");

// Enhanced index controller with SEO
exports.index = async function (req, res, next) {  
  try {
    let { userName, userActive, userData } = await someUserInfo(req, res, next);
    const userID = await User.findOne({ username: userName }).select("_id");

    let xy_ = await new GetStories().getstoriesBYupvotesBYnumReadsBYcommentsBYlimit(userID, 4);
    
    let topStoryByUpvotes = xy_[0];
    xy_.shift();

    // Clean data helper function (keep your existing one)
    const cleanStoryData = (story) => {
      if (!story) return story;
      
      // Clean categories
      if (story.categories) {
        story.cleanCategories = [...new Set(story.categories)]
          .filter(cat => cat && cat.trim() !== '')
          .slice(0, 4);
      }
      
      // Clean and combine tags
      let allTags = [];
      if (story.tags) {
        story.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.includes(',')) {
            allTags.push(...tag.split(',').map(t => t.trim()));
          } else if (tag && tag.trim() !== '') {
            allTags.push(tag.trim());
          }
        });
      }
      if (story.extraTags) {
        allTags.push(...story.extraTags.filter(tag => tag && tag.trim() !== ''));
      }
      story.cleanTags = [...new Set(allTags)]
        .filter(tag => tag && tag.length > 1)
        .slice(0, 6);
      
      return story;
    };

    // Clean the data
    if (topStoryByUpvotes) {
      topStoryByUpvotes = cleanStoryData(topStoryByUpvotes);
    }
    
    const topStorys = xy_.map(story => cleanStoryData(story));

    res.status(200).render("index", {
      path: "/",
      title: `TerrorHub - Home To Death Clock, Horror Stories Creepy Pasta & More`,
      description: "TerrorHub is a community of horror enthusiasts who share their horror stories, creepy pasta, and other horror-related content. We also have a death clock that estimates your day of death.",
      csrfToken: res.locals.csrfToken,
      userActive,
      userName,
      topStorys,
      topStoryByUpvotes,
      userData,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Section', url: '/section' },
        { name: 'Current Page', url: '/current' }
      ]
    });
    
  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Something went wrong");
  } 
};

// FAQ with enhanced SEO
exports.faq = async function (req, res, next) {
  try {
    let { userName, userActive, userData } = await someUserInfo(req, res, next);

    res.status(200).render("faq", {
      path: "/faq",
      title: "Frequently Asked Questions - TerrorHub Help Center",
      headerTitle: "FAQ",
      description: "Find answers to common questions about TerrorHub, our horror story community, death clock, and how to submit your creepy pasta stories.",
      csrfToken: res.locals.csrfToken,
      userActive,
      userName,
      userData
    });
  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Something went wrong");
  }
};

// DISCLAIMER with enhanced SEO
exports.disclaimer = async function (req, res, next) {
  try {
    let { userName, userActive, userData } = await someUserInfo(req, res, next);

    res.status(200).render("disclaimer", {
      path: "/disclaimer",
      title: "Legal Disclaimer - TerrorHub Terms of Service",
      headerTitle: "Disclaimer",
      description: "TerrorHub legal disclaimer, terms of service, and important information about our horror content and death clock predictions.",
      csrfToken: res.locals.csrfToken,
      userActive,
      userName,
      userData
    });
  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Something went wrong");
  }
};

// Terms & Conditions with enhanced SEO
exports.termsConditions = async function (req, res, next) {
  try {
    let { userName, userActive, userData } = await someUserInfo(req, res, next);

    res.status(200).render("termsConditions", {
      path: "/termsConditions",
      title: "Terms & Conditions - TerrorHub User Agreement",
      headerTitle: "Terms & Conditions",
      description: "Read TerrorHub's terms and conditions, user guidelines for horror story submissions, community rules, and privacy policy.",
      csrfToken: res.locals.csrfToken,
      userActive,
      userName,
      userData
    });
  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Something went wrong");
  }
};

// Enhanced sitemap with SPECIFIC fixes for malformed categories and apostrophes
exports.sitemap = async (req, res, next) => {  
  try {
    // Get stories with comprehensive engagement data
    const stories = await Story.find({ isApproved: true })
      .select("slug createdAt updatedAt language categories backgroundUrl storyTitle upvoteCount viewCount readCount commentCount")
      .lean();

    // BULLETPROOF SLUG SANITIZATION with apostrophe handling
    const sanitizeSlug = (slug) => {
      if (!slug) return '';
      
      return slug
        // FIRST: Handle all apostrophe variants
        .replace(/'/g, '')                // Remove straight apostrophes
        .replace(/'/g, '')                // Remove curly apostrophes  
        .replace(/`/g, '')                // Remove backticks
        .replace(/´/g, '')                // Remove acute accents
        
        // SECOND: Fix HTML entity disasters
        .replace(/andx27/g, '')           // Remove 'andx27' artifacts
        .replace(/&#x27;/g, '')           // Remove HTML entity for apostrophe
        .replace(/&#39;/g, '')            // Remove numeric apostrophe entity
        .replace(/&apos;/g, '')           // Remove XML apostrophe entity
        .replace(/&quot;/g, '')           // Remove quote entities
        .replace(/&amp;/g, 'and')         // Replace & with 'and'
        .replace(/&lt;/g, '')             // Remove < entities
        .replace(/&gt;/g, '')             // Remove > entities
        
        // THIRD: Fix ALL common contractions (comprehensive list)
        .replace(/\bdonandx27t\b/g, 'dont')
        .replace(/\bcanandx27t\b/g, 'cant')
        .replace(/\bwonandx27t\b/g, 'wont')
        .replace(/\biandx27m\b/g, 'im')
        .replace(/\byouandx27re\b/g, 'youre')
        .replace(/\bitandx27s\b/g, 'its')
        .replace(/\bthatandx27s\b/g, 'thats')
        .replace(/\bheandx27s\b/g, 'hes')
        .replace(/\bsheandx27s\b/g, 'shes')
        .replace(/\bweandx27re\b/g, 'were')
        .replace(/\btheyandx27re\b/g, 'theyre')
        .replace(/\biandx27ve\b/g, 'ive')
        .replace(/\byouandx27ve\b/g, 'youve')
        .replace(/\bweandx27ve\b/g, 'weve')
        .replace(/\btheyandx27ve\b/g, 'theyve')
        .replace(/\biandx27ll\b/g, 'ill')
        .replace(/\byouandx27ll\b/g, 'youll')
        .replace(/\bheandx27ll\b/g, 'hell')
        .replace(/\bsheandx27ll\b/g, 'shell')
        .replace(/\bweandx27ll\b/g, 'well')
        .replace(/\btheyandx27ll\b/g, 'theyll')
        .replace(/\biandx27d\b/g, 'id')
        .replace(/\byouandx27d\b/g, 'youd')
        .replace(/\bheandx27d\b/g, 'hed')
        .replace(/\bsheandx27d\b/g, 'shed')
        .replace(/\bweandx27d\b/g, 'wed')
        .replace(/\btheyandx27d\b/g, 'theyd')
        .replace(/\bhasnandx27t\b/g, 'hasnt')
        .replace(/\bhavenandx27t\b/g, 'havent')
        .replace(/\bhadnandx27t\b/g, 'hadnt')
        .replace(/\bwasnandx27t\b/g, 'wasnt')
        .replace(/\bwerenandx27t\b/g, 'werent')
        .replace(/\bisnandx27t\b/g, 'isnt')
        .replace(/\barenandx27t\b/g, 'arent')
        .replace(/\bdoesnandx27t\b/g, 'doesnt')
        
        // FOURTH: Clean up everything else
        .replace(/[^a-z0-9\s-]/gi, '')    // Remove ALL special characters
        .replace(/\s+/g, '-')             // Replace spaces with hyphens
        .replace(/-+/g, '-')              // Replace multiple hyphens with single
        .replace(/^-+|-+$/g, '')          // Remove leading/trailing hyphens
        .toLowerCase();
    };

    // ENHANCED CATEGORY SANITIZATION with specific malformed category fixes
    const sanitizeCategory = (category) => {
      if (!category || typeof category !== 'string') return '';
      
      let cleaned = category.toLowerCase().trim();
      
      // SPECIFIC FIXES for known malformed categories
      const categoryFixes = {
        'and-mental-illness': 'mental-illness',
        'and mental illness': 'mental-illness',
        'psychological-horror-and-mental-illness': 'psychological-horror',
        'horror-and-mental-illness': 'psychological-horror',
        'madness-and-mental-illness': 'madness',
        'paranoia-and-mental-illness': 'paranoia',
        'body-snatcher-horror': 'body-horror',
        'horror-thriller': 'horror-thriller', // Keep this one - it's valid
        'short-horror-stories': 'short-stories',
        'monster-horror': 'monsters',
        'sci-fi-horror': 'sci-fi-horror' // Keep this one - it's valid
      };
      
      // Apply specific fixes first
      if (categoryFixes[cleaned]) {
        cleaned = categoryFixes[cleaned];
      }
      
      // Skip problematic standalone words
      const skipCategories = [
        'and', 'the', 'a', 'an', 'or', 'but', 'if', 'when', 'where', 'with', 'by', 'for', 'of', 'in', 'on', 'at'
      ];
      
      // General sanitization
      cleaned = cleaned
        .replace(/[^a-z0-9\s-]/g, '')     // Remove special characters
        .replace(/\s+/g, '-')             // Replace spaces with hyphens
        .replace(/-+/g, '-')              // Replace multiple hyphens
        .replace(/^-+|-+$/g, '');         // Remove leading/trailing hyphens
      
      // Skip if it's just a common word, too short, or starts with connector words
      if (skipCategories.includes(cleaned) || 
          cleaned.length < 3 || 
          cleaned.startsWith('and-') ||
          cleaned.endsWith('-and')) {
        return '';
      }
      
      return cleaned;
    };

    // Calculate engagement scores with honest timeline assessment
    const processedStories = stories.map(story => {
      const engagementScore = (story.readCount || 0) + 
                             ((story.upvoteCount || 0) * 2) + 
                             ((story.commentCount || 0) * 3) + 
                             ((story.viewCount || 0) * 0.01);
      
      // Conservative priority assignment
      let priority = '0.4';
      if (engagementScore > 300) priority = '0.9';
      else if (engagementScore >= 150) priority = '0.8';
      else if (engagementScore >= 75) priority = '0.7';
      else if (engagementScore >= 30) priority = '0.6';
      else if (engagementScore >= 10) priority = '0.5';
      
      // Honest changefreq based on actual activity timeline
      const storyAge = Date.now() - new Date(story.createdAt).getTime();
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      const fourMonths = 120 * 24 * 60 * 60 * 1000;
      const sixMonths = 180 * 24 * 60 * 60 * 1000;
      const oneYear = 365 * 24 * 60 * 60 * 1000;
      
      let changefreq = 'yearly';
      
      if (storyAge < oneMonth && engagementScore >= 100) {
        changefreq = 'daily';
      } else if (storyAge < oneMonth && engagementScore >= 20) {
        changefreq = 'weekly';
      } else if (storyAge < fourMonths && engagementScore >= 50) {
        changefreq = 'weekly';
      } else if (storyAge < sixMonths && engagementScore >= 20) {
        changefreq = 'monthly';
      } else if (storyAge < oneYear && engagementScore >= 10) {
        changefreq = 'monthly';
      }
      
      const lastmod = story.updatedAt && story.updatedAt > story.createdAt 
        ? story.updatedAt.toISOString().split('T')[0]
        : story.createdAt.toISOString().split('T')[0];
      
      // Apply bulletproof slug cleaning
      const cleanSlug = sanitizeSlug(story.slug);
      
      return {
        ...story,
        engagementScore,
        priority,
        changefreq,
        lastmod,
        cleanSlug
      };
    });

    // Sort by priority then freshness
    processedStories.sort((a, b) => {
      const priorityDiff = parseFloat(b.priority) - parseFloat(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.lastmod) - new Date(a.lastmod);
    });

    // Static URLs with realistic priorities
    const staticUrls = [
      { url: 'https://www.terrorhub.com/', priority: '1.0', changefreq: 'daily' },
      { url: 'https://www.terrorhub.com/terrorTales', priority: '0.9', changefreq: 'daily' },
      { url: 'https://www.terrorhub.com/terrorTales/submission', priority: '0.8', changefreq: 'weekly' },
      { url: 'https://www.terrorhub.com/terrorTales/cuentosDeTerror', priority: '0.7', changefreq: 'weekly' },
      { url: 'https://www.terrorhub.com/search', priority: '0.5', changefreq: 'weekly' },
      { url: 'https://www.terrorhub.com/deathClock/questions', priority: '0.5', changefreq: 'monthly' },
      { url: 'https://www.terrorhub.com/deathClock/graveyard', priority: '0.4', changefreq: 'weekly' },
      { url: 'https://www.terrorhub.com/faq', priority: '0.3', changefreq: 'monthly' },
      { url: 'https://www.terrorhub.com/disclaimer', priority: '0.2', changefreq: 'yearly' },
      { url: 'https://www.terrorhub.com/termsConditions', priority: '0.2', changefreq: 'yearly' }
    ];

    // Create XML sitemap
    var root = xmlbuilder.create({
      urlset: {
        '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        '@xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:schemaLocation': 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.google.com/schemas/sitemap/0.9/sitemap.xsd'
      }
    });

    // Add static URLs
    staticUrls.forEach(item => {
      var u = root.ele('url');
      u.ele('loc', item.url);
      u.ele('changefreq', item.changefreq);
      u.ele('priority', item.priority);
      u.ele('lastmod', new Date().toISOString().split('T')[0]);
    });

    // Add stories with bulletproof slug cleaning
    processedStories.forEach(story => {
      console.log(`[SITEMAP DEBUG] slug: "${story.slug}" → cleanSlug: "${story.cleanSlug}" | priority: ${story.priority} | changefreq: ${story.changefreq}`);

      if (!story.cleanSlug || story.cleanSlug.length < 3) {
        console.warn(`[SITEMAP SKIP] Invalid slug for story: "${story.slug}" → "${story.cleanSlug}"`);
        return;
      }

      
      const storyUrl = `https://www.terrorhub.com/terrorTales/horrorStory/${story.cleanSlug}`;
      var u = root.ele('url');
      u.ele('loc', storyUrl);
      u.ele('lastmod', story.lastmod);
      u.ele('changefreq', story.changefreq);
      u.ele('priority', story.priority);
      
      // Only add images for high priority stories
      if (story.backgroundUrl && parseFloat(story.priority) >= 0.7) {
        try {
          new URL(story.backgroundUrl);
          var image = u.ele('image:image');
          image.ele('image:loc', story.backgroundUrl);
          image.ele('image:title', story.storyTitle || 'Horror Story');
          image.ele('image:caption', `Read "${story.storyTitle}" - A terrifying horror story on TerrorHub`);
        } catch (urlError) {
          // Skip invalid image URLs
        }
      }
    });

    // Enhanced category filtering with malformed category fixes
    const categoryEngagement = await Story.aggregate([
      { $match: { isApproved: true } },
      { $unwind: "$categories" },
      {
        $group: {
          _id: "$categories",
          storyCount: { $sum: 1 },
          totalEngagement: { 
            $sum: { 
              $add: [
                { $ifNull: ["$readCount", 0] },
                { $multiply: [{ $ifNull: ["$upvoteCount", 0] }, 2] },
                { $multiply: [{ $ifNull: ["$commentCount", 0] }, 3] },
                { $multiply: [{ $ifNull: ["$viewCount", 0] }, 0.01] }
              ]
            }
          },
          avgEngagement: { 
            $avg: { 
              $add: [
                { $ifNull: ["$readCount", 0] },
                { $multiply: [{ $ifNull: ["$upvoteCount", 0] }, 2] },
                { $multiply: [{ $ifNull: ["$commentCount", 0] }, 3] },
                { $multiply: [{ $ifNull: ["$viewCount", 0] }, 0.01] }
              ]
            }
          },
          lastUpdated: { $max: "$updatedAt" }
        }
      },
      { $match: { 
        storyCount: { $gte: 5 },
        avgEngagement: { $gte: 15 }
      }},
      { $sort: { totalEngagement: -1 } },
      { $limit: 8 }
    ]);

    // Add cleaned categories only
    categoryEngagement.forEach(category => {
      const cleanedCategory = sanitizeCategory(category._id);
      
      if (cleanedCategory && cleanedCategory.length >= 3) {
        const categoryUrl = `https://www.terrorhub.com/terrorTales/category/${cleanedCategory}`;
        
        var u = root.ele('url');
        u.ele('loc', categoryUrl);
        u.ele('changefreq', category.avgEngagement > 100 ? 'weekly' : 'monthly');
        u.ele('priority', category.avgEngagement > 150 ? '0.6' : '0.5');
        u.ele('lastmod', category.lastUpdated 
          ? category.lastUpdated.toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]
        );
        
        // Debug log for category mapping
        if (category._id !== cleanedCategory) {
          console.log(`Category mapped: "${category._id}" → "${cleanedCategory}"`);
        }
      } else {
        console.warn(`Skipped malformed category: "${category._id}"`);
      }
    });

    // Top-tier active writers only
    const activeWriters = await User.find({ 
      role: { $in: ['writer', 'writter', 'admin', 'moderator'] },
      'contributions.storiesCount': { $gte: 5 },
      updatedAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    }).select("username updatedAt contributions").limit(20).lean();

    activeWriters.forEach(user => {
      const storyCount = user.contributions?.storiesCount || 0;
      const userUrl = `https://www.terrorhub.com/profile/u/${user.username}`;
      
      var u = root.ele('url');
      u.ele('loc', userUrl);
      u.ele('lastmod', user.updatedAt ? user.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      u.ele('changefreq', storyCount >= 15 ? 'weekly' : 'monthly');
      u.ele('priority', storyCount >= 20 ? '0.5' : '0.4');
    });

    // Response headers
    res.set('Content-Type', 'text/xml');
    res.set('Cache-Control', 'public, max-age=21600'); // 6 hours
    res.send(root.end({ pretty: true }));
    
  } catch (err) {
    console.error('Sitemap generation error:', err);
    globalErrorHandler(req, res, 500, "Something went wrong generating sitemap");
  }
};

// NEW: Category page controller for SEO
exports.getCategoryPage = async (req, res, next) => {
  try {
    const { categorySlug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    let { userName, userActive, userData } = await someUserInfo(req, res, next);

    // Find stories by category
    const stories = await Story.find({ 
      categories: { $in: [categorySlug] },
      isApproved: true 
    })
    .populate('owner', 'username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalStories = await Story.countDocuments({ 
      categories: { $in: [categorySlug] },
      isApproved: true 
    });

    // Category metadata
    const categoryMeta = {
      'psychological-horror': {
        name: 'Psychological Horror',
        description: 'Mind-bending terror that plays with perception and sanity'
      },
      'supernatural-horror': {
        name: 'Supernatural Horror', 
        description: 'Ghosts, spirits, and otherworldly entities'
      },
      'creepypasta': {
        name: 'Creepypasta',
        description: 'Internet-born horror stories and urban legends'
      },
      // Add more as needed
    };

    const category = categoryMeta[categorySlug] || {
      name: categorySlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `Horror stories in the ${categorySlug} category`
    };

    res.render('category', {
      category: { ...category, slug: categorySlug },
      stories,
      currentPage: page,
      totalPages: Math.ceil(totalStories / limit),
      title: `${category.name} Horror Stories | TerrorHub`,
      description: `${category.description}. Browse ${totalStories} terrifying tales.`,
      path: `/terrorTales/category/${categorySlug}`,
      totalStories,
      csrfToken: res.locals.csrfToken,
      userActive,
      userName,
      userData
    });

  } catch (error) {
    console.error('Category page error:', error);
    globalErrorHandler(req, res, 500, "Something went wrong");
  }
};

// NEW: Robots.txt controller
exports.robots = async (req, res, next) => {
  try {
    const robotsTxt = `User-agent: *
Allow: /

# High Priority Pages (from main navigation)
Allow: /terrorTales/
Allow: /terrorTales/submission
Allow: /profile/
Allow: /user/register
Allow: /user/login

# Important Static Pages
Allow: /faq
Allow: /disclaimer
Allow: /termsConditions

# Death Clock Features
Disallow: /deathClock/
Disallow: /deathClock/questions
Disallow: /deathClock/graveyard

# Prevent crawling of admin and user areas
Disallow: /user/logout
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/

# Prevent crawling of search and filter URLs to avoid duplicate content
Disallow: /search?*
Disallow: /*?sort=*
Disallow: /*?filter=*
Disallow: /*?page=*

# Allow important assets
Allow: /CSS/
Allow: /JS/
Allow: /IMAGES/

# Sitemap location
Sitemap: https://www.terrorhub.com/sitemap.xml

# Crawl delay for server performance
Crawl-delay: 1`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
    
  } catch (error) {
    console.error('Robots.txt error:', error);
    res.status(500).send('User-agent: *\nDisallow: /');
  }
};

// NEW: SEO-friendly search page
exports.searchPage = async (req, res, next) => {
  try {
    let { userName, userActive, userData } = await someUserInfo(req, res, next);
    const query = req.query.q || '';

    res.render('search', {
      title: query ? `Search Results for "${query}" | TerrorHub` : 'Search Horror Stories | TerrorHub',
      description: query ? `Find horror stories matching "${query}". Search through thousands of creepypasta and supernatural tales.` : 'Search through our collection of horror stories, creepypasta, and supernatural tales.',
      path: '/search',
      query,
      csrfToken: res.locals.csrfToken,
      userActive,
      userName,
      userData
    });

  } catch (error) {
    console.error('Search page error:', error);
    globalErrorHandler(req, res, 500, "Something went wrong");
  }
};

module.exports = {
  index: exports.index,
  faq: exports.faq,
  disclaimer: exports.disclaimer,
  termsConditions: exports.termsConditions,
  sitemap: exports.sitemap,
  getCategoryPage: exports.getCategoryPage,
  robots: exports.robots,
  searchPage: exports.searchPage
};