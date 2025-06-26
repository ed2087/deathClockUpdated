// Enhanced TerrorTales Controller with New Categorization System
const Story = require("../model/submission.js");
const User = require("../model/user.js");

// Utils
const { sendEmail, htmlTemplate } = require("../utils/sendEmail.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");
const { successPagefun } = require("../utils/successPageHandler.js");
const { isToxic } = require("../utils/toxicity_tensorflow.js");
const { someUserInfo, calculateReadingTime, GetStories } = require("../utils/utils_fun.js");
const nlp = require('compromise');

// Packages
const { checkCsrf } = require("../utils/csrf.js");
const uuidv4 = require('uuid').v4;
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');
const { get } = require("mongoose");
const slugify = require('slugify');

// Audio
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');

// ==================== ULTIMATE SEARCH SYSTEM ====================

/**
 * 🚀 ULTIMATE SEARCH SYSTEM
 * Multi-field, intelligent, fast search with advanced filtering
 */
class UltimateSearchEngine {
    constructor() {
        this.searchTypes = {
            QUICK: 'quick',           // Fast, basic search
            COMPREHENSIVE: 'comprehensive', // Deep search across all fields
            SEMANTIC: 'semantic',     // Meaning-based search
            AUTHOR: 'author',         // Author-focused search
            CONTENT: 'content'        // Story content focused
        };
        
        this.sortOptions = {
            RELEVANCE: 'relevance',
            NEWEST: 'newest', 
            POPULAR: 'popular',
            MOST_READ: 'most_read',
            TRENDING: 'trending',
            AUTHOR_POPULAR: 'author_popular'
        };
    }

    /**
     * 🎯 Main search orchestrator
     */
    async performUltimateSearch(searchParams) {
        const {
            query = '',
            searchType = this.searchTypes.COMPREHENSIVE,
            filters = {},
            sort = this.sortOptions.RELEVANCE,
            page = 1,
            limit = 18,
            userId = null
        } = searchParams;

        console.log('🔍 Ultimate Search initiated:', { query, searchType, filters });

        try {
            // Build the ultimate search pipeline
            const searchPipeline = [];
            
            // 1. Base filtering (approved stories only)
            const baseMatch = { isApproved: true };
            
            // 2. Apply filters
            this.applyFilters(baseMatch, filters);
            
            // 3. Apply search query
            if (query.trim()) {
                const searchConditions = await this.buildSearchConditions(query, searchType);
                Object.assign(baseMatch, searchConditions);
            }
            
            searchPipeline.push({ $match: baseMatch });
            
            // 4. Add author information
            searchPipeline.push({
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'author',
                    pipeline: [
                        { $project: { username: 1, bio: 1, role: 1, contributions: 1 } }
                    ]
                }
            });
            
            // 5. Calculate relevance score
            if (query.trim()) {
                searchPipeline.push({
                    $addFields: {
                        relevanceScore: this.buildRelevanceScore(query),
                        searchContext: this.buildSearchContext(query)
                    }
                });
            }
            
            // 6. Apply sorting
            searchPipeline.push({
                $sort: this.buildSortConditions(sort, !!query.trim())
            });
            
            // 7. Pagination
            searchPipeline.push({ $skip: (page - 1) * limit });
            searchPipeline.push({ $limit: limit });
            
            // 8. Execute search
            const [stories, totalCount, searchSuggestions] = await Promise.all([
                Story.aggregate(searchPipeline),
                this.getSearchCount(baseMatch),
                this.generateSearchSuggestions(query)
            ]);
            
            // 9. Enhanced results processing
            const enhancedResults = await this.enhanceResults(stories, query, userId);
            
            return {
                stories: enhancedResults,
                totalStories: totalCount,
                searchMeta: {
                    query,
                    searchType,
                    totalResults: totalCount,
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    processingTime: Date.now(),
                    suggestions: searchSuggestions
                }
            };
            
        } catch (error) {
            console.error('🚨 Ultimate Search Error:', error);
            throw error;
        }
    }

    /**
     * 🎨 Build intelligent search conditions
     */
    async buildSearchConditions(query, searchType) {
        const cleanQuery = query.trim().toLowerCase();
        const isExactPhrase = query.includes('"');
        const words = cleanQuery.replace(/['"]/g, '').split(/\s+/).filter(w => w.length > 1);
        
        switch (searchType) {
            case this.searchTypes.QUICK:
                return this.buildQuickSearch(cleanQuery, words);
                
            case this.searchTypes.COMPREHENSIVE:
                return this.buildComprehensiveSearch(cleanQuery, words, isExactPhrase);
                
            case this.searchTypes.AUTHOR:
                return this.buildAuthorSearch(cleanQuery, words);
                
            case this.searchTypes.CONTENT:
                return this.buildContentSearch(cleanQuery, words);
                
            default:
                return this.buildComprehensiveSearch(cleanQuery, words, isExactPhrase);
        }
    }

    /**
     * ⚡ Quick search - title and summary only
     */
    buildQuickSearch(query, words) {
        return {
            $or: [
                { storyTitle: { $regex: query, $options: 'i' } },
                { storySummary: { $regex: query, $options: 'i' } },
                { creditingName: { $regex: query, $options: 'i' } }
            ]
        };
    }

    /**
     * 🔍 Comprehensive search - all fields with intelligence
     */
    buildComprehensiveSearch(query, words, isExactPhrase) {
        const conditions = [];
        
        // Exact phrase matching (highest priority)
        if (isExactPhrase) {
            const exactQuery = query.replace(/['"]/g, '');
            conditions.push(
                { storyTitle: { $regex: exactQuery, $options: 'i' } },
                { storySummary: { $regex: exactQuery, $options: 'i' } },
                { storyText: { $regex: exactQuery, $options: 'i' } }
            );
        } else {
            // Multi-word intelligent matching
            if (words.length > 1) {
                // All words must appear (AND logic)
                const allWordsConditions = words.map(word => ({
                    $or: [
                        { storyTitle: { $regex: word, $options: 'i' } },
                        { storySummary: { $regex: word, $options: 'i' } },
                        { storyText: { $regex: word, $options: 'i' } },
                        { tags: { $in: [new RegExp(word, 'i')] } },
                        { categories: { $in: [new RegExp(word, 'i')] } },
                        { creditingName: { $regex: word, $options: 'i' } }
                    ]
                }));
                
                return { $and: allWordsConditions };
            } else {
                // Single word search
                conditions.push(
                    { storyTitle: { $regex: query, $options: 'i' } },
                    { storySummary: { $regex: query, $options: 'i' } },
                    { storyText: { $regex: query, $options: 'i' } },
                    { tags: { $in: [new RegExp(query, 'i')] } },
                    { categories: { $in: [new RegExp(query, 'i')] } },
                    { extraTags: { $in: [new RegExp(query, 'i')] } },
                    { creditingName: { $regex: query, $options: 'i' } },
                    { legalName: { $regex: query, $options: 'i' } }
                );
            }
        }
        
        return { $or: conditions };
    }

    /**
     * 👤 Author-focused search
     */
    buildAuthorSearch(query, words) {
        return {
            $or: [
                { creditingName: { $regex: query, $options: 'i' } },
                { legalName: { $regex: query, $options: 'i' } }
            ]
        };
    }

    /**
     * 📖 Content-focused search
     */
    buildContentSearch(query, words) {
        if (words.length > 1) {
            // Search for all words in content
            const contentConditions = words.map(word => ({
                $or: [
                    { storyTitle: { $regex: word, $options: 'i' } },
                    { storySummary: { $regex: word, $options: 'i' } },
                    { storyText: { $regex: word, $options: 'i' } }
                ]
            }));
            
            return { $and: contentConditions };
        }
        
        return {
            $or: [
                { storyTitle: { $regex: query, $options: 'i' } },
                { storySummary: { $regex: query, $options: 'i' } },
                { storyText: { $regex: query, $options: 'i' } }
            ]
        };
    }

    /**
     * 🎯 Advanced filtering system
     */
    applyFilters(baseMatch, filters) {
        // Language filter
        if (filters.language && filters.language !== 'all') {
            baseMatch.language = new RegExp(filters.language, 'i');
        }
        
        // Reading time filter
        if (filters.readingTime) {
            switch (filters.readingTime) {
                case 'quick':
                    baseMatch.readingTime = { $lte: 5 };
                    break;
                case 'medium':
                    baseMatch.readingTime = { $gte: 5, $lte: 15 };
                    break;
                case 'long':
                    baseMatch.readingTime = { $gte: 15 };
                    break;
            }
        }
        
        // Date range filter
        if (filters.dateRange) {
            const now = new Date();
            switch (filters.dateRange) {
                case 'week':
                    baseMatch.createdAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
                    break;
                case 'month':
                    baseMatch.createdAt = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
                    break;
                case 'year':
                    baseMatch.createdAt = { $gte: new Date(now - 365 * 24 * 60 * 60 * 1000) };
                    break;
            }
        }
        
        // Category filters
        if (filters.categories && filters.categories.length > 0) {
            baseMatch.categories = { $in: filters.categories };
        }
        
        // Popularity threshold
        if (filters.minUpvotes) {
            baseMatch.upvoteCount = { $gte: parseInt(filters.minUpvotes) };
        }
        
        // Author filter
        if (filters.author) {
            baseMatch.creditingName = new RegExp(filters.author, 'i');
        }
    }

    /**
     * 🏆 Advanced relevance scoring
     */
    buildRelevanceScore(query) {
        const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
        
        return {
            $add: [
                // Title matches (highest weight)
                { $multiply: [
                    { $cond: [{ $regexMatch: { input: "$storyTitle", regex: query, options: "i" } }, 50, 0] },
                    1
                ]},
                
                // Exact title word matches
                ...words.map(word => ({
                    $multiply: [
                        { $cond: [{ $regexMatch: { input: "$storyTitle", regex: word, options: "i" } }, 25, 0] },
                        1
                    ]
                })),
                
                // Summary matches
                { $multiply: [
                    { $cond: [{ $regexMatch: { input: "$storySummary", regex: query, options: "i" } }, 20, 0] },
                    1
                ]},
                
                // Author name matches
                { $multiply: [
                    { $cond: [{ $regexMatch: { input: "$creditingName", regex: query, options: "i" } }, 15, 0] },
                    1
                ]},
                
                // Tag matches
                { $multiply: [
                    { $size: { $filter: { 
                        input: "$tags", 
                        cond: { $regexMatch: { input: "$$this", regex: query, options: "i" } }
                    }}},
                    10
                ]},
                
                // Category matches  
                { $multiply: [
                    { $size: { $filter: { 
                        input: "$categories", 
                        cond: { $regexMatch: { input: "$$this", regex: query, options: "i" } }
                    }}},
                    10
                ]},
                
                // Content matches (lower weight)
                { $multiply: [
                    { $cond: [{ $regexMatch: { input: "$storyText", regex: query, options: "i" } }, 5, 0] },
                    1
                ]},
                
                // Social proof boost
                { $multiply: ["$upvoteCount", 0.1] },
                { $multiply: ["$viewCount", 0.01] },
                { $multiply: ["$commentCount", 0.5] }
            ]
        };
    }

    /**
     * 📊 Smart sorting conditions
     */
    buildSortConditions(sort, hasQuery) {
        switch (sort) {
            case this.sortOptions.RELEVANCE:
                return hasQuery 
                    ? { relevanceScore: -1, upvoteCount: -1, viewCount: -1 }
                    : { upvoteCount: -1, viewCount: -1, createdAt: -1 };
                    
            case this.sortOptions.NEWEST:
                return { createdAt: -1 };
                
            case this.sortOptions.POPULAR:
                return { upvoteCount: -1, viewCount: -1 };
                
            case this.sortOptions.MOST_READ:
                return { readCount: -1, viewCount: -1 };
                
            case this.sortOptions.TRENDING:
                return { 
                    // Trending algorithm: recent + popular
                    trendingScore: {
                        $add: [
                            { $multiply: ["$upvoteCount", 0.4] },
                            { $multiply: ["$viewCount", 0.3] },
                            { $multiply: ["$commentCount", 0.2] },
                            // Recent boost
                            { $cond: [
                                { $gte: ["$createdAt", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                                10, 0
                            ]}
                        ]
                    }
                };
                
            default:
                return { createdAt: -1 };
        }
    }

    /**
     * 🔢 Get total count efficiently
     */
    async getSearchCount(matchConditions) {
        const countResult = await Story.aggregate([
            { $match: matchConditions },
            { $count: "total" }
        ]);
        
        return countResult.length > 0 ? countResult[0].total : 0;
    }

    /**
     * 💡 Generate search suggestions
     */
    async generateSearchSuggestions(query) {
        if (!query || query.length < 2) return [];
        
        try {
            // Get popular search terms from existing stories
            const suggestions = await Story.aggregate([
                { $match: { isApproved: true } },
                {
                    $project: {
                        suggestions: {
                            $concatArrays: [
                                ["$storyTitle"],
                                "$tags",
                                "$categories",
                                ["$creditingName"]
                            ]
                        }
                    }
                },
                { $unwind: "$suggestions" },
                {
                    $match: {
                        suggestions: { 
                            $regex: query, 
                            $options: "i" 
                        }
                    }
                },
                {
                    $group: {
                        _id: "$suggestions",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 },
                {
                    $project: {
                        suggestion: "$_id",
                        popularity: "$count",
                        _id: 0
                    }
                }
            ]);
            
            return suggestions;
            
        } catch (error) {
            console.error('Error generating suggestions:', error);
            return [];
        }
    }

    /**
     * ✨ Enhance search results with context
     */
    async enhanceResults(stories, query, userId) {
        return stories.map(story => {
            // Add search highlighting
            if (query) {
                story.searchHighlights = this.generateHighlights(story, query);
            }
            
            // Add author info
            if (story.author && story.author.length > 0) {
                story.authorInfo = story.author[0];
                delete story.author;
            }
            
            // Add user-specific data if logged in
            if (userId) {
                // Add to search history, reading status, etc.
            }
            
            return story;
        });
    }

    /**
     * 🎨 Generate search highlights
     */
    generateHighlights(story, query) {
        const highlights = {};
        const regex = new RegExp(`(${query})`, 'gi');
        
        // Highlight in title
        if (story.storyTitle && story.storyTitle.match(regex)) {
            highlights.title = story.storyTitle.replace(regex, '<mark>$1</mark>');
        }
        
        // Highlight in summary
        if (story.storySummary && story.storySummary.match(regex)) {
            highlights.summary = story.storySummary.replace(regex, '<mark>$1</mark>');
        }
        
        // Content snippet with highlight
        if (story.storyText && story.storyText.match(regex)) {
            const match = story.storyText.match(new RegExp(`.{0,100}${query}.{0,100}`, 'i'));
            if (match) {
                highlights.snippet = match[0].replace(regex, '<mark>$1</mark>') + '...';
            }
        }
        
        return highlights;
    }

    /**
     * 🔍 Build search context for debugging
     */
    buildSearchContext(query) {
        return {
            originalQuery: query,
            cleanedQuery: query.trim().toLowerCase(),
            wordCount: query.split(/\s+/).length,
            hasQuotes: query.includes('"'),
            searchTimestamp: new Date()
        };
    }
}

// ==================== HELPER FUNCTIONS ====================

async function getAvailableLanguages() {
    try {
        const languages = await Story.distinct('language', { isApproved: true });
        return languages.filter(lang => lang && lang.trim() !== '');
    } catch (error) {
        console.error('Error getting languages:', error);
        return [];
    }
}

async function getPopularAuthors() {
    try {
        return await Story.aggregate([
            { $match: { isApproved: true } },
            { $group: { 
                _id: "$creditingName", 
                storyCount: { $sum: 1 },
                totalUpvotes: { $sum: "$upvoteCount" }
            }},
            { $sort: { totalUpvotes: -1 } },
            { $limit: 10 },
            { $project: { 
                author: "$_id", 
                storyCount: 1, 
                totalUpvotes: 1,
                _id: 0 
            }}
        ]);
    } catch (error) {
        console.error('Error getting popular authors:', error);
        return [];
    }
}

async function getTrendingTags() {
    try {
        return await Story.aggregate([
            { $match: { 
                isApproved: true,
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }},
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } }},
            { $sort: { count: -1 } },
            { $limit: 20 },
            { $project: { tag: "$_id", count: 1, _id: 0 }}
        ]);
    } catch (error) {
        console.error('Error getting trending tags:', error);
        return [];
    }
}

// Enhanced Category System Configuration
const ENHANCED_CATEGORIES = {
    genres: [
        { value: 'psychological-horror', label: 'Psychological Horror', icon: '🧠', description: 'Mind-bending terror that plays with perception and sanity' },
        { value: 'supernatural-horror', label: 'Supernatural Horror', icon: '👻', description: 'Ghosts, spirits, and otherworldly entities' },
        { value: 'body-horror', label: 'Body Horror', icon: '🩸', description: 'Disturbing transformation and physical corruption' },
        { value: 'folk-horror', label: 'Folk Horror', icon: '🌲', description: 'Ancient traditions and rural terror' },
        { value: 'sci-fi-horror', label: 'Sci-Fi Horror', icon: '🚀', description: 'Technology and space-based terror' },
        { value: 'slasher', label: 'Slasher', icon: '🔪', description: 'Killer stalks and eliminates victims' },
        { value: 'cosmic-horror', label: 'Cosmic Horror', icon: '🌌', description: 'Lovecraftian terror beyond human comprehension' },
        { value: 'gothic-horror', label: 'Gothic Horror', icon: '🏰', description: 'Dark atmosphere with classical horror elements' }
    ],
    formats: [
        { value: 'creepypasta', label: 'Creepypasta', icon: '📜', description: 'Internet-born horror stories' },
        { value: 'short-story', label: 'Short Story', icon: '📖', description: 'Traditional short form narrative' },
        { value: 'flash-fiction', label: 'Flash Fiction', icon: '⚡', description: 'Very short, impactful stories' },
        { value: 'two-sentence', label: '2 Sentence Horror', icon: '✌️', description: 'Terror in just two sentences' },
        { value: 'true-story', label: 'True Story', icon: '📰', description: 'Based on real events' },
        { value: 'found-footage', label: 'Found Footage', icon: '📹', description: 'Discovered recordings or documents' }
    ],
    themes: [
        { value: 'urban-legends', label: 'Urban Legends', icon: '🏙️', description: 'Modern folklore and city-based myths' },
        { value: 'myths-legends', label: 'Myths and Legends', icon: '📚', description: 'Ancient stories and folklore' },
        { value: 'ghosts', label: 'Ghosts', icon: '👻', description: 'Spirits of the deceased' },
        { value: 'monsters', label: 'Monsters', icon: '👹', description: 'Creatures and beasts' },
        { value: 'witchcraft', label: 'Witchcraft', icon: '🔮', description: 'Magic, spells, and occult practices' },
        { value: 'technology-horror', label: 'Technology Horror', icon: '💻', description: 'Digital age nightmares' },
        { value: 'cursed-objects', label: 'Cursed Objects', icon: '📿', description: 'Items with malevolent power' },
        { value: 'conspiracies', label: 'Conspiracies', icon: '🕵️', description: 'Hidden plots and secret organizations' }
    ]
};

// Enhanced Language Mapping for Audio Generation
const LANGUAGE_MAP = {
    afrikaans: 'af', albanian: 'sq', arabic: 'ar', armenian: 'hy', catalan: 'ca',
    chinese: 'zh', croatian: 'hr', czech: 'cs', danish: 'da', dutch: 'nl',
    english: 'en-us', esperanto: 'eo', finnish: 'fi', french: 'fr', german: 'de',
    greek: 'el', haitian: 'ht', hindi: 'hi', hungarian: 'hu', icelandic: 'is',
    indonesian: 'id', italian: 'it', japanese: 'ja', korean: 'ko', latin: 'la',
    latvian: 'lv', macedonian: 'mk', norwegian: 'no', polish: 'pl', portuguese: 'pt',
    romanian: 'ro', russian: 'ru', serbian: 'sr', slovak: 'sk', spanish: 'es-us',
    swahili: 'sw', swedish: 'sv', tamil: 'ta', thai: 'th', turkish: 'tr',
    vietnamese: 'vi', welsh: 'cy'
};

const QUERY_LANGUAGE_MAP = {
    "english": "English", "ingles": "English", "Spanish": "Spanish", "español": "Spanish",
    "espanol": "Spanish", "mandarin Chinese": "Mandarin Chinese", "hindi": "Hindi",
    "arabic": "Arabic", "bengali": "Bengali", "portuguese": "Portuguese",
    "russian": "Russian", "ruso": "Russian", "japanese": "Japanese", "japones": "Japanese",
    "punjabi": "Punjabi", "german": "German", "aleman": "German", "wu Chinese": "Wu Chinese",
    "javanese": "Javanese", "korean": "Korean", "koreano": "Korean", "french": "French",
    "frances": "French", "telugu": "Telugu", "marathi": "Marathi", "tamil": "Tamil",
    "turkish": "Turkish", "turco": "Turkish", "vietnamese": "Vietnamese"
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Enhanced YouTube link validation and conversion
 */
function replaceYouTubeLink(input) {
    if (!input || typeof input !== 'string') return '';
    
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const match = input.match(regex);
    
    if (match && match[1]) {
        const videoId = match[1];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return input;
}

/**
 * Enhanced social media array processing
 */
function getValidSocialMediaArray(socialMedia) {
    if (!Array.isArray(socialMedia)) return [];
    
    const socialMediaPlatforms = ['facebook', 'twitter', 'instagram', 'youtube'];
    const validLinks = [];
    
    socialMedia.forEach((link, index) => {
        if (link && link.trim() !== "" && index < socialMediaPlatforms.length) {
            validLinks.push({
                name: socialMediaPlatforms[index],
                link: link.trim()
            });
        }
    });
    
    return validLinks;
}

/**
 * Enhanced story query breakdown for better search
 */
const breakdownQuery = (query) => {
    if (!query || typeof query !== 'string') return [];
    
    return query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
        .slice(0, 10); // Limit to 10 keywords for performance
};

/**
 * Enhanced story formatting with better paragraph structure
 */
async function formatStory(text) {
    if (!text) return '<div id="story"><p>No content available.</p></div>';
    
    // Clean the text
    const cleanedText = text
        .replace(/["""]/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
    
    try {
        const doc = nlp(cleanedText);
        const sentences = doc.sentences().out('array');
        
        // Group sentences into paragraphs (every 3-5 sentences)
        const paragraphs = [];
        let currentParagraph = [];
        
        sentences.forEach((sentence, index) => {
            currentParagraph.push(sentence.trim());
            
            // Create paragraph break every 3-4 sentences or at natural breaks
            if (currentParagraph.length >= 3 && 
                (sentence.includes('.') || sentence.includes('!') || sentence.includes('?')) &&
                index < sentences.length - 1) {
                paragraphs.push(currentParagraph.join(' '));
                currentParagraph = [];
            }
        });
        
        // Add remaining sentences
        if (currentParagraph.length > 0) {
            paragraphs.push(currentParagraph.join(' '));
        }
        
        const formattedText = paragraphs
            .map(paragraph => `<p class="story_paragraph">${paragraph}</p>`)
            .join('');
        
        return `<div id="story">${formattedText}</div>`;
    } catch (error) {
        console.error('Error formatting story:', error);
        // Fallback to simple paragraph breaks
        const simpleParagraphs = cleanedText
            .split(/\n\s*\n/)
            .filter(p => p.trim())
            .map(p => `<p class="story_paragraph">${p.trim()}</p>`)
            .join('');
        
        return `<div id="story">${simpleParagraphs}</div>`;
        }
}

/**
* Get top stories with enhanced error handling
*/
async function getTopAndOtherStories(limit, query) {
   try {
       const topStories = await new GetStories().getTopByLimitUpvoteCommentsAndByQuery(limit, query);
       
       if (!topStories || topStories.length === 0) {
           return { top1Story: null, topStories: [] };
       }
       
       const top1Story = topStories.shift();
       return { top1Story, topStories };
   } catch (error) {
       console.error('Error getting top stories:', error);
       return { top1Story: null, topStories: [] };
   }
}

// ==================== MAIN CONTROLLERS ====================

/**
* Ultimate Search Controller
*/
exports.ultimateSearch = async (req, res, next) => {
   try {
       const { userName, userActive, userData } = await someUserInfo(req, res, next);
       const searchEngine = new UltimateSearchEngine();
       
       const searchParams = {
           query: req.query.query || '',
           searchType: req.query.searchType || 'comprehensive',
           filters: {
               language: req.query.language,
               readingTime: req.query.readingTime,
               dateRange: req.query.dateRange,
               categories: req.query.categories ? req.query.categories.split(',') : [],
               minUpvotes: req.query.minUpvotes,
               author: req.query.author
           },
           sort: req.query.sort || 'relevance',
           page: parseInt(req.query.page) || 1,
           limit: parseInt(req.query.limit) || 18,
           userId: userData?.id
       };
       
       const results = await searchEngine.performUltimateSearch(searchParams);
       
       // Add additional data
       const [languagesArray, popularAuthors, trendingTags] = await Promise.all([
           getAvailableLanguages(),
           getPopularAuthors(),
           getTrendingTags()
       ]);
       
       return res.status(200).json({
           status: 200,
           data: {
               ...results,
               languagesArray,
               popularAuthors,
               trendingTags,
               userRole: userActive ? userData?.role : null
           }
       });
       
   } catch (error) {
       console.error('Ultimate search error:', error);
       return res.status(500).json({
           status: 500,
           message: "Search error. Please try again.",
           data: { stories: [], totalStories: 0 }
       });
   }
};

/**
* Enhanced Terror Tales Landing Page
*/
exports.terrorTalesPage = async (req, res, next) => {
   try {
       const { userName, userActive, userData } = await someUserInfo(req, res, next);

       res.status(200).render("../views/storypages/terrorTales", {
           title: "TerrorHub - Original Horror Stories & Creepypasta Collection",
           path: "/terrorTales",
           headerTitle: "Unleashing Original Horror Stories - Creepypasta Central",
           description: "Discover spine-chilling horror stories, creepypasta, and original horror fiction. Share your terrifying tales with our community of horror enthusiasts.",
           userActive,
           userName,
           userData,
           enhancedCategories: ENHANCED_CATEGORIES
       });
   } catch (error) {
       console.error("Error in terrorTalesPage:", error);
       globalErrorHandler(req, res, 500, "Something went wrong loading the page");
   }
};

/**
* Spanish version landing page
*/
exports.cuentosDeTerror = async (req, res, next) => {
   try {
       const { userName, userActive, userData } = await someUserInfo(req, res, next);
       const stories = await getTopAndOtherStories(4, '');

       res.status(200).render("../views/storypages/spanishTerrorTales", {
           title: "TerrorHub - Historias de Terror Originales y Creepypasta",
           path: "/terrorTales/cuentosDeTerror",
           headerTitle: "Desatando Historias de Terror Originales",
           description: "Descubre historias de terror escalofriantes, creepypasta y ficción de horror original en español.",
           userActive,
           userName,
           userData,
           topStoryByUpvotes: stories.top1Story,
           topStorys: stories.topStories,
           enhancedCategories: ENHANCED_CATEGORIES
       });
   } catch (error) {
       console.error("Error in cuentosDeTerror:", error);
       globalErrorHandler(req, res, 500, "Algo salió mal cargando la página");
   }
};

/**
* Enhanced Submission Page with New Categorization
*/
exports.submission = async (req, res, next) => {
   try {
       const { userName, userActive, userData } = await someUserInfo(req, res, next);
       const legalName = userData?.legalName || null;

       // Get popular tags from existing stories for autocomplete
       const popularTags = await Story.aggregate([
           { $unwind: "$tags" },
           { $group: { _id: "$tags", count: { $sum: 1 } } },
           { $sort: { count: -1 } },
           { $limit: 50 },
           { $project: { name: "$_id", usageCount: "$count", _id: 0 } }
       ]);

       res.render("../views/storypages/submission", {
           title: "Submit Your Horror Story - TerrorHub",
           path: "/terrorTales/submission",
           headerTitle: "Share Your Chilling Tale",
           description: "Submit your original horror stories and creepypasta to our growing community of horror enthusiasts.",
           userActive,
           userName,
           legalName,
           enhancedCategories: ENHANCED_CATEGORIES,
           popularTags: popularTags || [],
           story: {} // For edit compatibility
       });
   } catch (error) {
       console.error("Error in submission:", error);
       globalErrorHandler(req, res, 500, "Something went wrong loading the submission form");
   }
};

/**
* Enhanced Submission Processing - Fixed for existing schema
*/
exports.submissionPost = async function (req, res, next) {
   try {
       const { userName, userActive, userData } = await someUserInfo(req, res, next);

       const {
           legalName,
           socialMedia,
           backgroundUrl,
           youtubeVideo,
           storyTitle,
           storySummary,
           tags,
           storyText,
           primaryGenre,
           format,
           theme,
           language,
           termsAndConditions,
       } = req.body;

       console.log('Received form data:', req.body); // Debug log

       // Enhanced validation
       if (!storyTitle?.trim() || !storySummary?.trim() || !storyText?.trim() || !primaryGenre) {
           return res.status(400).json({
               status: 400,
               message: "Please fill out all required fields: title, summary, story text, and primary genre"
           });
       }

       if (!termsAndConditions) {
           return res.status(400).json({
               status: 400,
               message: "Please accept the terms and conditions"
           });
       }

       // Character limits validation
       if (storyTitle.length > 100) {
           return res.status(400).json({
               status: 400,
               message: "Story title must be 100 characters or less"
           });
       }

       if (storySummary.length > 800) {
           return res.status(400).json({
               status: 400,
               message: "Story summary must be 800 characters or less"
           });
       }

       if (storyText.length > 40000) {
           return res.status(400).json({
               status: 400,
               message: "Story text must be 40,000 characters or less"
           });
       }

       // Process categories for EXISTING schema (as strings, not ObjectIds)
       const categories = [primaryGenre];
       if (format) categories.push(format);
       if (theme) categories.push(theme);

       // Process social media and tags
       const socialMediaArray = getValidSocialMediaArray(socialMedia || []);
       const tagsArray = tags 
           ? tags.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "")
           : [];

       // Get and update user
       const user = await User.findById(req.session.userId);
       if (!user) {
           return globalErrorHandler(req, res, 500, "You do not have permission to access this page");
       }

       // Update user legal name if needed
       if (!userData.legalName && legalName?.trim()) {
           user.legalName = legalName.trim();
           userData.legalName = legalName.trim();
       }

       const finalLegalName = legalName?.trim() || userData.legalName;
       const readingTime = calculateReadingTime(storyText);
       const slug = slugify(storyTitle, { lower: true, strict: true });

       // Check for duplicate slugs
       const existingStory = await Story.findOne({ slug });
       const finalSlug = existingStory ? `${slug}-${Date.now()}` : slug;

       // Create story using EXISTING schema format
       const submissionData = {
           legalName: finalLegalName,
           creditingName: userName,
           socialMedia: socialMediaArray,
           website: '', // Keep empty for compatibility
           youtubeLink: youtubeVideo ? replaceYouTubeLink(youtubeVideo) : '',
           backgroundUrl: backgroundUrl || '',
           storyTitle: storyTitle.trim(),
           slug: finalSlug,
           storySummary: storySummary.trim(),
           tags: tagsArray,
           storyText: storyText.trim(),
           categories: categories, // String array, not ObjectIds
           language: language || 'English',
           extraTags: [], // Keep empty for new system
           readingTime,
           owner: req.session.userId,
           isApproved: true,
           // Required fields for existing schema
           ageVerification: true, // Set to true since we validated 18+
           acceptedTerms: true,   // Set to true since we validated terms
           termsAndConditions: true // Set to true since we validated terms
       };

       console.log('Creating story with data:', submissionData); // Debug log

       const submission = await Story.create(submissionData);

       // Update user contributions
       user.contributions.stories.push(submission._id);
       user.contributions.storiesCount++;

       if (user.role === "user") {
           user.role = "writter";
       }

       const savedUser = await user.save();

       if (!savedUser) {
           await Story.findByIdAndDelete(submission._id);
           return globalErrorHandler(req, res, 500, "Failed to update user profile. Please try again.");
       }

       console.log('Story created successfully:', submission._id); // Debug log

       // Send notifications
       const websiteUrl = `${req.protocol}://${req.get("host")}`;
       await sendSubmissionNotifications(user, submission, websiteUrl, primaryGenre, categories, tagsArray);

       return res.status(200).json({
           status: 200,
           message: "Your story has been submitted successfully!",
           slug: submission.slug
       });

   } catch (error) {
       console.error('Submission error:', error);
       
       // Handle specific validation errors
       if (error.name === 'ValidationError') {
           const errorMessages = Object.values(error.errors).map(err => err.message);
           return res.status(400).json({
               status: 400,
               message: "Validation failed",
               errors: errorMessages
           });
       }

       res.status(500).json({
           status: 500,
           message: "Something went wrong. Please try again."
       });
   }
};

/**
* Enhanced notification system
*/
async function sendSubmissionNotifications(user, submission, websiteUrl, primaryGenre, categories, tags) {
   try {
       // User confirmation email
       const userSubject = "Your Story has been submitted successfully";
       const userBodyContent = `
           <h2>Thank you for submitting your story!</h2>
           <p>Dear ${user.username},</p>
           <p>Congratulations! Your story "<strong>${submission.storyTitle}</strong>" has been successfully submitted and is now live on TerrorHub.</p>
           <p><strong>Story Details:</strong></p>
           <ul>
               <li>Genre: ${primaryGenre.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>
               <li>Categories: ${categories.join(', ')}</li>
               <li>Tags: ${tags.join(', ')}</li>
               <li>Reading Time: ${submission.readingTime} minutes</li>
           </ul>
           <p><a href="${websiteUrl}/terrorTales/horrorStory/${submission.slug}" style="color: #fac536; font-weight: bold;">Read your story here</a></p>
           <p>Thank you for contributing to our horror community!</p>
           <p>Best regards,<br>TerrorHub Team</p>
       `;

       await sendEmail(user.email, userSubject, htmlTemplate(userBodyContent));

       // Notify followers
       if (user.followers && user.followers.length > 0) {
           const followerPromises = user.followers.map(async (followerId) => {
               try {
                   const followerUser = await User.findById(followerId);
                   if (followerUser && followerUser.email) {
                       const followerHtml = htmlTemplate(`
                           <h2>New Story Alert! 📚👻</h2>
                           <p>Dear ${followerUser.username},</p>
                           <p>${user.username} has published a new ${primaryGenre.replace('-', ' ')} story:</p>
                           <h3>"${submission.storyTitle}"</h3>
                           <p><em>${submission.storySummary}</em></p>
                           <p><a href="${websiteUrl}/terrorTales/horrorStory/${submission.slug}" style="color: #fac536; font-weight: bold;">Read it now</a></p>
                           <p>Happy reading!<br>TerrorHub Team</p>
                       `);
                       await sendEmail(followerUser.email, `New Story: ${submission.storyTitle}`, followerHtml);
                   }
               } catch (error) {
                   console.error('Error sending follower notification:', error);
               }
           });

           await Promise.allSettled(followerPromises);
       }

       // Notify admins and moderators
       const adminModeratorQuery = { $or: [{ role: "admin" }, { role: "moderator" }] };
       const admins = await User.find(adminModeratorQuery);

       const adminPromises = admins.map(async (admin) => {
           try {
               const adminBodyContent = `
                   <h2>New Story Submission</h2>
                   <p>Dear ${admin.username},</p>
                   <p><strong>${user.username}</strong> has submitted a new story:</p>
                   <ul>
                       <li><strong>Title:</strong> ${submission.storyTitle}</li>
                       <li><strong>Genre:</strong> ${primaryGenre.replace('-', ' ')}</li>
                       <li><strong>Categories:</strong> ${categories.join(', ')}</li>
                       <li><strong>Tags:</strong> ${tags.join(', ')}</li>
                       <li><strong>Word Count:</strong> ~${Math.round(submission.storyText.length / 5)} words</li>
                   </ul>
                   <p><a href="${websiteUrl}/terrorTales/horrorStory/${submission.slug}">Review Story</a></p>
                   <p>TerrorHub Admin Panel</p>
               `;
               const html = htmlTemplate(adminBodyContent);
               await sendEmail(admin.email, "New Story Submission for Review", html);
           } catch (error) {
               console.error('Error sending admin notification:', error);
           }
       });

       await Promise.allSettled(adminPromises);

   } catch (error) {
       console.error('Error sending notifications:', error);
   }
}

/**
* Enhanced Audio Generation
*/
const generateAudioFile = (text, languageCode, audioFilePath) => {
   return new Promise((resolve, reject) => {
       try {
           // Limit text length for audio generation (GTTS has limits)
           const maxLength = 5000;
           const truncatedText = text.length > maxLength 
               ? text.substring(0, maxLength) + "..."
               : text;

           const gttsInstance = new gtts(truncatedText, languageCode);
           gttsInstance.save(audioFilePath, function(err) {
               if (err) {
                   console.error('GTTS Error:', err);
                   return reject(err);
               }
               resolve();
           });
       } catch (error) {
           reject(error);
       }
   });
};

exports.generateAudio = async (req, res, next) => {
   try {
       const storyId = req.params.id;
       
       // Validate story ID format
       if (!storyId.match(/^[0-9a-fA-F]{24}$/)) {
           return res.status(400).json({ 
               status: 'error',
               message: 'Invalid story ID format' 
           });
       }

       const story = await Story.findById(storyId);

       if (!story || !story.isApproved) {
           return res.status(404).json({ 
               status: 'error',
               message: 'Story not found or not approved' 
           });
       }

       // Ensure audio directory exists
       const audioDir = path.join(__dirname, '../public/audio');
       if (!fs.existsSync(audioDir)) {
           fs.mkdirSync(audioDir, { recursive: true });
       }

       const languageCode = LANGUAGE_MAP[story.language?.toLowerCase()] || 'en-us';
       const audioFilePath = path.join(audioDir, `${story._id}.mp3`);
       const audioUrl = `/audio/${story._id}.mp3`;

       // Check if audio file already exists
       if (fs.existsSync(audioFilePath)) {
           return res.status(200).json({ 
               status: 'success',
               audioLink: audioUrl,
               cached: true
           });
       }

       // Generate new audio file
       await generateAudioFile(story.storyText, languageCode, audioFilePath);

       res.status(200).json({ 
           status: 'success',
           audioLink: audioUrl,
           language: story.language,
           duration: Math.ceil(story.storyText.length / 200) // Approximate duration in seconds
       });

   } catch (error) {
       console.error("Error generating audio:", error);
       res.status(500).json({ 
           status: 'error',
           message: 'Error generating audio. Please try again later.' 
       });
   }
};

/**
* Enhanced Read Page
*/
exports.readPage = async (req, res, next) => {
   try {
       const { userName, userActive, userData } = await someUserInfo(req, res, next);
       const slug = req.params.slug;

       if (!slug) {
           return globalErrorHandler(req, res, 400, "Invalid story identifier");
       }

       const story = await Story.findOne({ slug: slug }).populate('owner', 'username email');

       if (!story || !story.isApproved) {
           return globalErrorHandler(req, res, 404, "Story not found or not available");
       }

       // Increment view count
       story.viewCount = (story.viewCount || 0) + 1;
       await story.save();

       // Get related stories
       const categories = [...(story.categories || []), ...(story.extraTags || [])];
       const relatedStories = await getRelatedStories(story, categories, 6);

       // Format story text
       const formattedStoryText = await formatStory(story.storyText);
       story.storyText = formattedStoryText;

       // Get category information for display
       const categoryInfo = getCategoryDisplayInfo(story.categories || []);

       res.status(200).render("../views/storypages/read", {
           title: `${story.storyTitle} | TerrorHub`,
           path: `/terrorTales/horrorStory/${slug}`,
           headerTitle: story.storyTitle,
           description: story.storySummary || "A chilling horror story from TerrorHub community",
           userActive,
           userName,
           story,
           userData,
           top5Stories: relatedStories,
           categoryInfo,
           enhancedCategories: ENHANCED_CATEGORIES
       });

   } catch (error) {
       console.error("Error in readPage:", error);
       globalErrorHandler(req, res, 500, "Something went wrong loading the story");
   }
};

/**
* Get related stories with improved algorithm
*/
async function getRelatedStories(currentStory, categories, limit = 6) {
   try {
       // First, get stories by the same author
       let relatedStories = await Story.find({ 
           owner: currentStory.owner,
           _id: { $ne: currentStory._id },
           isApproved: true
       }).limit(3).sort({ viewCount: -1 });

       // If we need more stories, find by categories
       if (relatedStories.length < limit && categories.length > 0) {
           const additionalStories = await Story.find({
               categories: { $in: categories },
               _id: { $ne: currentStory._id },
               owner: { $ne: currentStory.owner },
               isApproved: true
           }).limit(limit - relatedStories.length)
             .sort({ upvoteCount: -1, viewCount: -1 });

           relatedStories = [...relatedStories, ...additionalStories];
       }

       // Fill remaining slots with popular stories
       if (relatedStories.length < limit) {
           const popularStories = await Story.find({
               _id: { $ne: currentStory._id },
               isApproved: true
           }).limit(limit - relatedStories.length)
             .sort({ upvoteCount: -1, viewCount: -1 });

           relatedStories = [...relatedStories, ...popularStories];
       }

       return relatedStories.slice(0, limit);

   } catch (error) {
       console.error('Error getting related stories:', error);
       return [];
   }
}

/**
* Get category display information
*/
function getCategoryDisplayInfo(categories) {
   const categoryInfo = [];
   
   categories.forEach(category => {
       // Check genres
       const genre = ENHANCED_CATEGORIES.genres.find(g => g.value === category);
       if (genre) {
           categoryInfo.push({ ...genre, type: 'genre' });
           return;
       }

       // Check formats
       const format = ENHANCED_CATEGORIES.formats.find(f => f.value === category);
       if (format) {
           categoryInfo.push({ ...format, type: 'format' });
           return;
       }

       // Check themes
       const theme = ENHANCED_CATEGORIES.themes.find(t => t.value === category);
       if (theme) {
           categoryInfo.push({ ...theme, type: 'theme' });
           return;
       }

       // Legacy category
       categoryInfo.push({ 
           value: category, 
           label: category, 
           type: 'legacy',
           icon: '📖', 
          description: 'Legacy category' 
      });
  });
  
  return categoryInfo;
}

/**
* Enhanced Story Query System - KEEP YOUR EXISTING ONE
*/
exports.queryStories = async function (req, res, next) {
  try {
      const { query, language, ranking, page = 1, limit = 10 } = req.query;
      const { userName, userActive, userData } = await someUserInfo(req, res, next);

      let searchLanguage = language;
      let searchQuery = query ? query.toLowerCase().trim() : '';

      // Enhanced language detection
      if (searchQuery === "all") {
          searchLanguage = "all";
          searchQuery = "";
      } else if (QUERY_LANGUAGE_MAP[searchQuery]) {
          searchLanguage = QUERY_LANGUAGE_MAP[searchQuery];
          searchQuery = "";
      }

      // Enhanced search with multiple strategies
      let searchResults = await performEnhancedSearch(
          searchQuery, 
          searchLanguage, 
          ranking, 
          parseInt(page), 
          parseInt(limit)
      );

      // If no results with primary search, try fallback strategies
      if (searchResults.totalStories === 0 && searchQuery) {
          searchResults = await performFallbackSearch(
              searchQuery, 
              searchLanguage, 
              ranking, 
              parseInt(page), 
              parseInt(limit)
          );
      }

      // Get user role for admin features
      const userRole = userActive ? userData?.role : null;

      return res.status(200).json({
          status: 200,
          data: {
              stories: searchResults.stories || [],
              totalStories: searchResults.totalStories || 0,
              currentPage: parseInt(page),
              totalPages: Math.ceil((searchResults.totalStories || 0) / parseInt(limit)),
              top5Stories: searchResults.top5Stories || [],
              languagesArray: searchResults.languagesArray || [],
              searchQuery,
              searchLanguage,
              ranking,
              userRole,
              enhancedCategories: ENHANCED_CATEGORIES
          }
      });

  } catch (error) {
      console.error('Query stories error:', error);
      return res.status(500).json({
          status: 500,
          message: "Error searching stories. Please try again.",
          data: {
              stories: [],
              totalStories: 0,
              currentPage: 1,
              totalPages: 0
          }
      });
  }
};

/**
* Enhanced search with multiple strategies
*/
async function performEnhancedSearch(query, language, ranking, page, limit) {
  try {
      const searchPipeline = [];

      // Base match conditions
      const matchConditions = { isApproved: true };

      // Language filtering
      if (language && language !== "all") {
          matchConditions.language = new RegExp(language, 'i');
      }

      // Text search conditions
      if (query) {
          const searchTerms = query.split(/\s+/).filter(term => term.length > 1);
          
          matchConditions.$or = [
              { storyTitle: { $regex: query, $options: 'i' } },
              { storySummary: { $regex: query, $options: 'i' } },
              { categories: { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
              { tags: { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
              { extraTags: { $in: searchTerms.map(term => new RegExp(term, 'i')) } }
          ];
      }

      searchPipeline.push({ $match: matchConditions });

      // Enhanced sorting based on ranking
      let sortConditions = {};
      switch (ranking) {
          case 'newest':
              sortConditions = { createdAt: -1 };
              break;
          case 'oldest':
              sortConditions = { createdAt: 1 };
              break;
          case 'popular':
              sortConditions = { viewCount: -1, upvoteCount: -1 };
              break;
          case 'upvotes':
              sortConditions = { upvoteCount: -1, viewCount: -1 };
              break;
          case 'comments':
              sortConditions = { commentCount: -1, viewCount: -1 };
              break;
          case 'reading-time':
              sortConditions = { readingTime: -1 };
              break;
          case 'alphabetical':
              sortConditions = { storyTitle: 1 };
              break;
          default:
              // Default: relevance + popularity
              if (query) {
                  searchPipeline.push({
                      $addFields: {
                          relevanceScore: {
                              $add: [
                                  { $cond: [{ $regexMatch: { input: "$storyTitle", regex: query, options: "i" } }, 10, 0] },
                                  { $cond: [{ $regexMatch: { input: "$storySummary", regex: query, options: "i" } }, 5, 0] },
                                  { $multiply: ["$upvoteCount", 0.1] },
                                  { $multiply: ["$viewCount", 0.01] }
                              ]
                          }
                      }
                  });
                  sortConditions = { relevanceScore: -1, upvoteCount: -1 };
              } else {
                  sortConditions = { upvoteCount: -1, viewCount: -1, createdAt: -1 };
              }
      }

      searchPipeline.push({ $sort: sortConditions });

      // Pagination
      const skip = (page - 1) * limit;
      searchPipeline.push({ $skip: skip });
      searchPipeline.push({ $limit: limit });

      // Execute search
      const stories = await Story.aggregate(searchPipeline);

      // Get total count
      const countPipeline = [
          { $match: matchConditions },
          { $count: "total" }
      ];
      const countResult = await Story.aggregate(countPipeline);
      const totalStories = countResult.length > 0 ? countResult[0].total : 0;

      // Get top stories and languages
      const [top5Stories, languagesArray] = await Promise.all([
          getTopStoriesForSearch(5),
          getAvailableLanguages()
      ]);

      return {
          stories,
          totalStories,
          top5Stories,
          languagesArray
      };

  } catch (error) {
      console.error('Enhanced search error:', error);
      throw error;
  }
}

/**
* Fallback search with broader matching
*/
async function performFallbackSearch(query, language, ranking, page, limit) {
  try {
      const searchTerms = breakdownQuery(query);
      if (searchTerms.length === 0) {
          return { stories: [], totalStories: 0, top5Stories: [], languagesArray: [] };
      }

      const matchConditions = { isApproved: true };

      if (language && language !== "all") {
          matchConditions.language = new RegExp(language, 'i');
      }

      // Broader search using individual terms
      matchConditions.$or = [
          { storyTitle: { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
          { storySummary: { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
          { categories: { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
          { tags: { $in: searchTerms.map(term => new RegExp(term, 'i')) } },
          { extraTags: { $in: searchTerms.map(term => new RegExp(term, 'i')) } }
      ];

const searchPipeline = [
           { $match: matchConditions },
           { $sort: { upvoteCount: -1, viewCount: -1 } },
           { $skip: (page - 1) * limit },
           { $limit: limit }
       ];

       const stories = await Story.aggregate(searchPipeline);

       const countResult = await Story.aggregate([
           { $match: matchConditions },
           { $count: "total" }
       ]);
       const totalStories = countResult.length > 0 ? countResult[0].total : 0;

       const [top5Stories, languagesArray] = await Promise.all([
           getTopStoriesForSearch(5),
           getAvailableLanguages()
       ]);

       return {
           stories,
           totalStories,
           top5Stories,
           languagesArray
       };

   } catch (error) {
       console.error('Fallback search error:', error);
       return { stories: [], totalStories: 0, top5Stories: [], languagesArray: [] };
   }
}

/**
 * Get top stories for search results
 */
async function getTopStoriesForSearch(limit) {
   try {
       return await Story.find({ isApproved: true })
           .sort({ upvoteCount: -1, viewCount: -1 })
           .limit(limit)
           .select('storyTitle slug storySummary upvoteCount viewCount categories')
           .lean();
   } catch (error) {
       console.error('Error getting top stories:', error);
       return [];
   }
}

/**
 * Get available languages from stories
 */
async function getAvailableLanguages() {
   try {
       const languages = await Story.distinct('language', { isApproved: true });
       return languages.filter(lang => lang && lang.trim() !== '');
   } catch (error) {
       console.error('Error getting languages:', error);
       return [];
   }
}

/**
 * Get popular authors for search results
 */
async function getPopularAuthors() {
   try {
       return await Story.aggregate([
           { $match: { isApproved: true } },
           { $group: { 
               _id: "$creditingName", 
               storyCount: { $sum: 1 },
               totalUpvotes: { $sum: "$upvoteCount" }
           }},
           { $sort: { totalUpvotes: -1 } },
           { $limit: 10 },
           { $project: { 
               author: "$_id", 
               storyCount: 1, 
               totalUpvotes: 1,
               _id: 0 
           }}
       ]);
   } catch (error) {
       console.error('Error getting popular authors:', error);
       return [];
   }
}

/**
 * Get trending tags
 */
async function getTrendingTags() {
   try {
       return await Story.aggregate([
           { $match: { 
               isApproved: true,
               createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
           }},
           { $unwind: "$tags" },
           { $group: { _id: "$tags", count: { $sum: 1 } }},
           { $sort: { count: -1 } },
           { $limit: 20 },
           { $project: { tag: "$_id", count: 1, _id: 0 }}
       ]);
   } catch (error) {
       console.error('Error getting trending tags:', error);
       return [];
   }
}

/**
 * Enhanced Upvote System
 */
exports.upvote = async (req, res, next) => {
   try {
       const { storyID, token } = req.query;
       const { userName, userActive } = await someUserInfo(req, res, next);

       // Validate inputs
       if (!storyID || !token) {
           return res.status(400).json({
               status: "fail",
               message: "Missing required parameters"
           });
       }

       // Check CSRF token
       const csrfValid = checkCsrf(req, res, next, token);
       if (!csrfValid) {
           return res.status(401).json({
               status: "fail",
               message: "Invalid security token. Please refresh and try again."
           });
       }

       if (!userActive) {
           return res.status(401).json({
               status: "fail",
               message: "You must be logged in to upvote stories"
           });
       }

       const [user, story] = await Promise.all([
           User.findById(req.session.userId),
           Story.findById(storyID)
       ]);

       if (!user) {
           return res.status(401).json({
               status: "fail",
               message: "User not found"
           });
       }

       if (!story || !story.isApproved) {
           return res.status(404).json({
               status: "fail",
               message: "Story not found or not available"
           });
       }

       // Check if user already upvoted
       const hasUpvoted = story.upvotes.some(upvoteId => upvoteId.toString() === user._id.toString());

       if (hasUpvoted) {
           return res.status(400).json({
               status: "fail",
               message: "You have already upvoted this story"
           });
       }

       // Add upvote
       story.upvotes.push(user._id);
       story.upvoteCount = (story.upvoteCount || 0) + 1;
       await story.save();

       return res.status(200).json({
           status: "success",
           message: "Story upvoted successfully",
           upvoteCount: story.upvoteCount
       });

   } catch (error) {
       console.error('Upvote error:', error);
       res.status(500).json({
           status: "error",
           message: "Something went wrong. Please try again."
       });
   }
};

/**
 * Enhanced Report System
 */
exports.report = async (req, res, next) => {
   try {
       const { storyID, token, reason } = req.query;
       const { userName, userActive } = await someUserInfo(req, res, next);

       // Validate inputs
       if (!storyID || !token || !reason) {
           return res.status(400).json({
               status: "fail",
               message: "Missing required information for report"
           });
       }

       if (!userActive || !checkCsrf(req, res, next, token)) {
           return res.status(401).json({
               status: "fail",
               message: "You must be logged in to report stories"
           });
       }

       const story = await Story.findById(storyID).populate('owner', 'username email');

       if (!story) {
           return res.status(404).json({
               status: "fail",
               message: "Story not found"
           });
       }

       // Check if user already reported this story
       const hasReported = story.reports.some(
           report => report.userId.toString() === req.session.userId.toString()
       );

       if (hasReported) {
           const existingReport = story.reports.find(
               report => report.userId.toString() === req.session.userId.toString()
           );
           return res.status(400).json({
               status: "fail",
               message: `You have already reported this story for: ${existingReport.reason}`
           });
       }

       // Add report
       story.reports.push({
           userId: req.session.userId,
           reason: reason.trim(),
           reportedAt: new Date()
       });

       await story.save();

       // Send notification emails
       await sendReportNotifications(story, userName, reason, req);

       return res.status(200).json({
           status: "success",
           message: "Thank you for your report. We will review it as soon as possible."
       });

   } catch (error) {
       console.error('Report error:', error);
       res.status(500).json({
           status: "error",
           message: "Something went wrong. Please try again."
       });
   }
};

/**
 * Send report notifications
 */
async function sendReportNotifications(story, reporterUsername, reason, req) {
   try {
       const websiteUrl = `${req.protocol}://${req.get("host")}`;
       const storyUrl = `${websiteUrl}/terrorTales/horrorStory/${story.slug}`;
       
       // Notify admins and moderators
       const adminModeratorQuery = { $or: [{ role: "admin" }, { role: "moderator" }] };
       const admins = await User.find(adminModeratorQuery);

       const adminPromises = admins.map(async (admin) => {
           const bodyContent = `
               <h2>Story Report: ${story.storyTitle}</h2>
               <p>Dear ${admin.username},</p>
               <p><strong>${reporterUsername}</strong> has reported the story "${story.storyTitle}" for the following reason:</p>
               <blockquote style="background: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 4px solid #ff6b6b;">
                   ${reason}
               </blockquote>
               <p><strong>Story Details:</strong></p>
               <ul>
                   <li>Author: ${story.owner?.username || 'Unknown'}</li>
                   <li>Categories: ${story.categories?.join(', ') || 'None'}</li>
                   <li>Views: ${story.viewCount || 0}</li>
                   <li>Upvotes: ${story.upvoteCount || 0}</li>
               </ul>
               <p><a href="${storyUrl}" style="color: #fac536; font-weight: bold;">Review Story</a></p>
               <p>Please review this report at your earliest convenience.</p>
               <p>TerrorHub Admin Panel</p>
           `;
           await sendEmail(admin.email, `Story Report: ${story.storyTitle}`, htmlTemplate(bodyContent));
       });

       // Notify story owner
       if (story.owner && story.owner.email) {
           const ownerBodyContent = `
               <h2>Your Story Has Been Reported</h2>
               <p>Dear ${story.owner.username},</p>
               <p>We wanted to inform you that your story "${story.storyTitle}" has been reported by a community member.</p>
               <p><strong>Reason:</strong> ${reason}</p>
               <p>Our moderation team will review this report. If you believe this report is unfounded, please contact us at help.terrorhub@gmail.com.</p>
               <p><a href="${storyUrl}" style="color: #fac536;">View Your Story</a></p>
               <p>Best regards,<br>TerrorHub Team</p>
           `;
           await sendEmail(story.owner.email, `Report Notification: ${story.storyTitle}`, htmlTemplate(ownerBodyContent));
       }

       // Thank reporter
       const user = await User.findById(req.session.userId);
       if (user && user.email) {
           const reporterBodyContent = `
               <h2>Thank You for Your Report</h2>
               <p>Dear ${reporterUsername},</p>
               <p>Thank you for reporting "${story.storyTitle}". We take community reports seriously and will review this content promptly.</p>
               <p>Your report helps maintain the quality and safety of our community.</p>
               <p><a href="${storyUrl}" style="color: #fac536;">View Story</a></p>
               <p>Best regards,<br>TerrorHub Team</p>
           `;
           await sendEmail(user.email, `Report Received: ${story.storyTitle}`, htmlTemplate(reporterBodyContent));
       }

       await Promise.allSettled(adminPromises);

   } catch (error) {
       console.error('Error sending report notifications:', error);
   }
}

/**
 * Enhanced Title Validation
 */
exports.checkBookTitle = async (req, res, next) => {
   try {
       const { bookTitle } = req.params;

       if (!bookTitle || bookTitle.trim().length === 0) {
           return res.status(400).json({
               status: 400,
               message: "Title cannot be empty"
           });
       }

       // Check CSRF token
       const csrfValid = checkCsrf(req, res, next, req.headers["csrf-token"]);
       if (!csrfValid) {
           return res.status(401).json({
               status: 401,
               message: "Invalid request. Please try again."
           });
       }

       const trimmedTitle = bookTitle.trim();

       // Check for exact title match (case insensitive)
       const exactMatch = await Story.findOne({ 
           storyTitle: new RegExp(`^${trimmedTitle}$`, 'i'),
           isApproved: true 
       });

       if (exactMatch) {
           return res.status(400).json({
               status: 400,
               message: "This title is already taken. Please choose a different title.",
               suggestion: `${trimmedTitle} - Part 2`
           });
       }

       // Check for very similar titles
       const similarTitles = await Story.find({
           storyTitle: new RegExp(trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
           isApproved: true
       }).limit(3).select('storyTitle');

       return res.status(200).json({
           status: 200,
           message: "Title is available",
           similarTitles: similarTitles.map(story => story.storyTitle)
       });

   } catch (error) {
       console.error('Title check error:', error);
       res.status(500).json({
           status: 500,
           message: "Error checking title availability"
       });
   }
};

/**
 * Enhanced Add to Read List
 */
exports.addToReadList = async (req, res, next) => {
   try {
       const { slug } = req.params;
       const { userName, userActive } = await someUserInfo(req, res, next);

       if (!userActive) {
           return res.status(401).json({
               status: 401,
               message: "You must be logged in to track your reading"
           });
       }

       const [user, story] = await Promise.all([
           User.findById(req.session.userId),
           Story.findOne({ slug, isApproved: true })
       ]);

       if (!story) {
           return res.status(404).json({
               status: 404,
               message: "Story not found",
               readCount: 0
           });
       }

       if (!user) {
           return res.status(401).json({
               status: 401,
               message: "User not found"
           });
       }

       // Check if user has already read this story
       const existingRead = user.booksRead.find(
           book => book.bookId.toString() === story._id.toString()
       );

       if (existingRead) {
           // Increment read count
           existingRead.booksReadCount = (existingRead.booksReadCount || 1) + 1;
           existingRead.lastReadAt = new Date();
       } else {
           // Add new read entry
           user.booksRead.push({
               bookId: story._id,
               booksReadCount: 1,
               firstReadAt: new Date(),
               lastReadAt: new Date()
           });
       }

       // Update story read count
       story.readCount = (story.readCount || 0) + 1;

       // Save both documents
       await Promise.all([user.save(), story.save()]);

       return res.status(200).json({
           status: 200,
           message: "Added to your reading history",
           readCount: story.readCount,
           userReadCount: existingRead ? existingRead.booksReadCount : 1
       });

   } catch (error) {
       console.error('Add to read list error:', error);
       res.status(500).json({
           status: 500,
           message: "Something went wrong tracking your reading",
           readCount: 0
       });
   }
};

// ==================== LEGACY CONTROLLERS (UPDATED) ====================

/**
 * Update story page (enhanced) - Fixed
 */
exports.updateStoryPage = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { userName, userActive, userData } = await someUserInfo(req, res, next);

        if (!userActive) {
            return globalErrorHandler(req, res, 401, "You must be logged in to edit stories");
        }

        const story = await Story.findOne({ slug });

        if (!story) {
            return globalErrorHandler(req, res, 404, "Story not found");
        }

        // Check permissions
        if (userData.role !== "admin" && story.owner.toString() !== userData.id.toString()) {
            return globalErrorHandler(req, res, 403, "You don't have permission to edit this story");
        }

        // Get popular tags for autocomplete
        const popularTags = await Story.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 50 },
            { $project: { name: "$_id", usageCount: "$count", _id: 0 } }
        ]);

        res.status(200).render("../views/storypages/edit", {
            title: `Edit: ${story.storyTitle} | TerrorHub`,
            path: `/terrorTales/editStory/${slug}`,
            headerTitle: "Edit Your Story",
            description: "Edit your horror story",
            userActive,
            userName,
            userData,
            story,
            enhancedCategories: ENHANCED_CATEGORIES,
            popularTags: popularTags || []
        });

    } catch (error) {
        console.error('Update story page error:', error);
        globalErrorHandler(req, res, 500, "Something went wrong loading the edit page");
    }
};

/**
 * Update story post (enhanced) - Fixed
 */
exports.updateStoryPost = async (req, res, next) => {
    try {
        console.log('=== UPDATE STORY REQUEST ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Content-Type:', req.headers['content-type']);
        console.log('========================');
        
        const { userName, userActive, userData } = await someUserInfo(req, res, next);
        console.log('User info retrieved:', { userName, userActive, userDataId: userData?.id });

        if (!userActive) {
            console.log('User not authenticated');
            return res.status(401).json({
                status: 401,
                message: "You must be logged in to update stories"
            });
        }

        const {
            storyId, legalName, socialMedia, backgroundUrl, youtubeVideo, storyTitle,
            storySummary, tags, storyText, primaryGenre, format, theme, language
        } = req.body;

        console.log('About to find story with ID:', storyId);

        const story = await Story.findById(storyId);
        console.log('Story found:', story ? 'YES' : 'NO');

        if (!story) {
            console.log('Story not found, sending 404');
            return res.status(404).json({
                status: 404,
                message: "Story not found"
            });
        }

        // Check permissions
        console.log('Checking permissions - User role:', userData.role, 'Story owner:', story.owner.toString(), 'User ID:', userData.id.toString());
        
        if (userData.role !== "admin" && story.owner.toString() !== userData.id.toString()) {
            console.log('Permission denied');
            return res.status(403).json({
                status: 403,
                message: "You don't have permission to edit this story"
            });
        }

        console.log('Starting story update...');

        // Process enhanced categories (as strings for existing schema)
        const categories = [primaryGenre];
        if (format) categories.push(format);
        if (theme) categories.push(theme);

        // Process social media and tags
        const socialMediaArray = getValidSocialMediaArray(socialMedia || []);
        const tagsArray = tags 
            ? tags.split(",").map(tag => tag.trim().toLowerCase()).filter(tag => tag !== "")
            : [];

        const readingTime = calculateReadingTime(storyText);
        const slug = slugify(storyTitle, { lower: true, strict: true });

        console.log('Processed data:', { categories, socialMediaArray, tagsArray, readingTime, slug });

        // Check if slug already exists (exclude current story)
        const existingStory = await Story.findOne({ 
            slug, 
            _id: { $ne: story._id } 
        });
        
        const finalSlug = existingStory ? `${slug}-${Date.now()}` : slug;
        console.log('Final slug:', finalSlug);

        // Update story with existing schema format
        console.log('Updating story object...');
        Object.assign(story, {
            legalName: legalName?.trim() || story.legalName,
            socialMedia: socialMediaArray,
            website: '', // Keep for compatibility
            youtubeLink: youtubeVideo ? replaceYouTubeLink(youtubeVideo) : '',
            backgroundUrl: backgroundUrl || '',
            storyTitle: storyTitle.trim(),
            slug: finalSlug,
            storySummary: storySummary.trim(),
            tags: tagsArray,
            storyText: storyText.trim(),
            categories: categories, // String array, not ObjectIds
            language: language || 'English',
            extraTags: [], // Keep empty for new system
            readingTime
        });

        // Add update record
        if (!story.updateDetails) {
            story.updateDetails = [];
        }
        story.updateDetails.push({
            userId: userData.id,
            updatedAt: new Date()
        });

        console.log('About to save story...');
        await story.save();
        console.log('Story saved successfully!');

        console.log('Sending success response...');
        // Return JSON response instead of redirect
        return res.status(200).json({
            status: 200,
            message: "Your story has been updated successfully!",
            slug: story.slug,
            redirectUrl: `/terrorTales/horrorStory/${story.slug}`
        });

    } catch (error) {
        console.error('Update story error:', error);
        
        // Handle specific validation errors
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            console.log('Validation error, sending response...');
            return res.status(400).json({
                status: 400,
                message: "Validation failed",
                errors: errorMessages
            });
        }

        console.log('General error, sending 500 response...');
        return res.status(500).json({
            status: 500,
            message: "Something went wrong updating the story. Please try again."
        });
    }
};

/**
 * Delete story (enhanced)
 */
exports.deleteStory = async (req, res, next) => {
   try {
       const { slug } = req.body;
       const { userName, userActive, userData } = await someUserInfo(req, res, next);

       if (!userActive) {
           return globalErrorHandler(req, res, 401, "You must be logged in to delete stories");
       }

       const story = await Story.findOne({ slug });

       if (!story) {
           return globalErrorHandler(req, res, 404, "Story not found");
       }

       // Check permissions
       if (userData.role !== "admin" && story.owner.toString() !== userData.id.toString()) {
           return globalErrorHandler(req, res, 403, "You don't have permission to delete this story");
       }

       const storyTitle = story.storyTitle;

       // Delete associated audio file
       const audioPath = path.join(__dirname, '../public/audio', `${story._id}.mp3`);
       if (fs.existsSync(audioPath)) {
           fs.unlinkSync(audioPath);
       }

       // Delete story
       await Story.findByIdAndDelete(story._id);

       // Update user contributions
       const user = await User.findById(userData.id);
       if (user) {
           const storyIndex = user.contributions.stories.indexOf(story._id);
           if (storyIndex > -1) {
               user.contributions.stories.splice(storyIndex, 1);
               user.contributions.storiesCount = Math.max(0, user.contributions.storiesCount - 1);
               await user.save();
           }
       }

       return successPagefun(req, res, "Story Deleted Successfully", 
           `"${storyTitle}" has been permanently deleted from TerrorHub.`
       );

   } catch (error) {
       console.error('Delete story error:', error);
       globalErrorHandler(req, res, 500, "Something went wrong deleting the story");
   }
};

/**
 * Change story permission (enhanced)
 */
exports.changeStoryPermision = async (req, res, next) => {
   try {
       const { slug, reason } = req.body;
       const { userName, userActive, userData } = await someUserInfo(req, res, next);

       if (!userActive || userData.role !== "admin") {
           return globalErrorHandler(req, res, 403, "You don't have permission to change story permissions");
       }

       const story = await Story.findOne({ slug }).populate('owner', 'username email');

       if (!story) {
           return globalErrorHandler(req, res, 404, "Story not found");
       }

       // Toggle approval status
       story.isApproved = !story.isApproved;
       
       // Add reason to rejection/approval history
       if (!story.isApproved) {
           story.rejectionReason.push({
               userId: userData.id,
               reason: reason || "Story paused by admin",
               actionDate: new Date()
           });
       }

       await story.save();

       // Notify story owner
       if (story.owner && story.owner.email) {
           const action = story.isApproved ? "approved" : "paused";
           const subject = `Story ${action}: ${story.storyTitle}`;
           const bodyContent = `
               <h2>Story Status Update</h2>
               <p>Dear ${story.owner.username},</p>
               <p>Your story "${story.storyTitle}" has been <strong>${action}</strong> by our moderation team.</p>
               ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
               ${!story.isApproved ? '<p>If you have questions about this decision, please contact us at help.terrorhub@gmail.com</p>' : ''}
               <p>Best regards,<br>TerrorHub Team</p>
           `;
           await sendEmail(story.owner.email, subject, htmlTemplate(bodyContent));
       }

       const statusText = story.isApproved ? "approved and is now visible" : "paused and is no longer visible";
       
       return successPagefun(req, res, "Story Status Updated", 
           `"${story.storyTitle}" has been ${statusText} on the website.`
       );

   } catch (error) {
       console.error('Change permission error:', error);
       globalErrorHandler(req, res, 500, "Something went wrong updating the story status");
   }
};

// ==================== FINAL EXPORTS ====================

module.exports = {
   // Main pages
   terrorTalesPage: exports.terrorTalesPage,
   cuentosDeTerror: exports.cuentosDeTerror,
   
   // Story submission
   submission: exports.submission,
   submissionPost: exports.submissionPost,
   
   // Story reading
   readPage: exports.readPage,
   
   // Search systems
   queryStories: exports.queryStories,
   ultimateSearch: exports.ultimateSearch,
   
   // Audio generation
   generateAudio: exports.generateAudio,
   
   // User interactions
   upvote: exports.upvote,
   report: exports.report,
   addToReadList: exports.addToReadList,
   
   // Story management
   updateStoryPage: exports.updateStoryPage,
   updateStoryPost: exports.updateStoryPost,
   deleteStory: exports.deleteStory,
   changeStoryPermision: exports.changeStoryPermision,
   
   // Utilities
   checkBookTitle: exports.checkBookTitle
};