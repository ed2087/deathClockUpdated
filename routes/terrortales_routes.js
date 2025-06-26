const express = require('express');
const router = express.Router();
const { csrfCheckRoute } = require("../utils/csrf.js");
const { check, validationResult } = require('express-validator');
const { isAuthenticated } = require("../utils/auth.js");

// Controller
const {
    submission,
    submissionPost,
    terrorTalesPage,
    queryStories,
    readPage,
    upvote,
    report,
    checkBookTitle,
    deleteStory,
    changeStoryPermision,
    updateStoryPage,
    updateStoryPost,
    cuentosDeTerror,
    generateAudio,
    addToReadList,
    ultimateSearch
} = require("../controller/terrorTales_controller.js");

// ==================== ENHANCED VALIDATION MIDDLEWARE ====================

// Updated enhanced sanitization (remove URL validation that conflicts)
const enhancedSanitization = [
    // Basic text fields
    check('legalName').optional().trim().escape().isLength({ min: 2, max: 100 })
        .withMessage('Legal name must be between 2 and 100 characters'),
    
    check('storyTitle').trim().escape().isLength({ min: 5, max: 100 })
        .withMessage('Story title must be between 5 and 100 characters'),
    
    check('storySummary').trim().escape().isLength({ min: 20, max: 800 })
        .withMessage('Story summary must be between 20 and 800 characters'),
    
    check('storyText').trim().isLength({ min: 100, max: 40000 })
        .withMessage('Story text must be between 100 and 40,000 characters'),
    
    // Enhanced category validation
    check('primaryGenre').trim().isIn([
        'psychological-horror', 'supernatural-horror', 'body-horror', 'folk-horror',
        'sci-fi-horror', 'slasher', 'cosmic-horror', 'gothic-horror'
    ]).withMessage('Please select a valid primary genre'),
    
    check('format').optional().trim().isIn([
        'creepypasta', 'short-story', 'flash-fiction', 'two-sentence', 'true-story', 'found-footage'
    ]).withMessage('Please select a valid format'),
    
    check('theme').optional().trim().isIn([
        'urban-legends', 'myths-legends', 'ghosts', 'monsters', 'witchcraft',
        'technology-horror', 'cursed-objects', 'conspiracies'
    ]).withMessage('Please select a valid theme'),
    
    // Language validation
    check('language').optional().trim().isIn([
        'English', 'Spanish', 'Portuguese', 'French', 'German', 'Other'
    ]).withMessage('Please select a valid language'),
    
    // Optional URL fields (no validation here - handled in frontend)
    check('backgroundUrl').optional().trim(),
    check('youtubeVideo').optional().trim(),
    
    // Tags validation
    check('tags').optional().trim().isLength({ max: 200 })
        .withMessage('Tags field is too long'),
    
    // Terms validation
    check('termsAndConditions').equals('true')
        .withMessage('You must accept the terms and conditions')
];

// Add this to your routes file - enhanced validation specifically for editing
const editStoryValidation = [
    // Don't escape HTML - just trim and validate length
    check('legalName').optional().trim().isLength({ min: 2, max: 100 })
        .withMessage('Legal name must be between 2 and 100 characters'),
    
    check('storyTitle').trim().isLength({ min: 5, max: 100 })
        .withMessage('Story title must be between 5 and 100 characters'),
    
    check('storySummary').trim().isLength({ min: 20, max: 800 })
        .withMessage('Story summary must be between 20 and 800 characters'),
    
    check('storyText').trim().isLength({ min: 100, max: 40000 })
        .withMessage('Story text must be between 100 and 40,000 characters'),
    
    // Enhanced category validation
    check('primaryGenre').trim().isIn([
        'psychological-horror', 'supernatural-horror', 'body-horror', 'folk-horror',
        'sci-fi-horror', 'slasher', 'cosmic-horror', 'gothic-horror'
    ]).withMessage('Please select a valid primary genre'),
    
    check('format').optional().trim().isIn([
        '', 'creepypasta', 'short-story', 'flash-fiction', 'two-sentence', 'true-story', 'found-footage'
    ]).withMessage('Please select a valid format'),
    
    check('theme').optional().trim().isIn([
        '', 'urban-legends', 'myths-legends', 'ghosts', 'monsters', 'witchcraft',
        'technology-horror', 'cursed-objects', 'conspiracies'
    ]).withMessage('Please select a valid theme'),
    
    // Language validation
    check('language').optional().trim().isIn([
        'English', 'Spanish', 'Portuguese', 'French', 'German', 'Other'
    ]).withMessage('Please select a valid language'),
    
    // Story ID validation (required for edits)
    check('storyId').notEmpty().isMongoId()
        .withMessage('Valid story ID is required'),
    
    // Optional URL fields - basic format check without strict validation
    check('backgroundUrl').optional().trim().isLength({ max: 500 })
        .withMessage('Background URL is too long'),
    check('youtubeVideo').optional().trim().isLength({ max: 500 })
        .withMessage('YouTube URL is too long'),
    
    // Tags validation
    check('tags').optional().trim().isLength({ max: 200 })
        .withMessage('Tags field is too long'),
    
    // Social media array validation
    check('socialMedia').optional().isArray({ max: 4 })
        .withMessage('Too many social media links')
];

/**
 * Enhanced validation error handler that provides better debugging
 */
const handleEditValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array()); // Debug log
        const errorMessages = errors.array().map(error => 
            `${error.param}: ${error.msg}`
        );
        return res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors: errorMessages,
            details: errors.array() // Include full error details for debugging
        });
    }
    next();
};

/**
 * Enhanced validation error handler
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({
            status: 400,
            message: "Validation failed",
            errors: errorMessages
        });
    }
    next();
};

// ==================== API ROUTES ====================

/**
 * Enhanced Tag Autocomplete API
 */
router.get("/api/tags/search", async (req, res) => {
    try {
        const { q, limit = 8 } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({
                status: 'success',
                data: []
            });
        }

        const Story = require("../model/submission.js");
        
        // Get real tag suggestions from database
        const tagAggregation = await Story.aggregate([
            { $match: { isApproved: true } },
            { $unwind: "$tags" },
            { 
                $match: { 
                    "tags": { 
                        $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
                        $options: "i" 
                    } 
                } 
            },
            { 
                $group: { 
                    _id: "$tags", 
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { count: -1 } },
            { $limit: parseInt(limit) },
            { 
                $project: { 
                    name: "$_id", 
                    usageCount: "$count", 
                    _id: 0 
                } 
            }
        ]);

        // If no database results, provide fallback suggestions
        if (tagAggregation.length === 0) {
            const fallbackTags = [
                'atmospheric', 'suspense', 'psychological', 'supernatural', 'haunted',
                'ghost', 'demon', 'witch', 'forest', 'cemetery', 'abandoned',
                'nightmare', 'curse', 'ritual', 'possession', 'paranormal',
                'creepy', 'eerie', 'disturbing', 'chilling', 'terrifying',
                'dark', 'scary', 'horror', 'spine-chilling', 'bone-chilling',
                'monster', 'creature', 'entity', 'spirit', 'apparition'
            ];

            const suggestions = fallbackTags
                .filter(tag => tag.toLowerCase().includes(q.toLowerCase()))
                .slice(0, parseInt(limit))
                .map(tag => ({
                    name: tag,
                    usageCount: Math.floor(Math.random() * 20) + 1,
                    isPopular: true
                }));

            return res.json({
                status: 'success',
                data: suggestions
            });
        }

        res.json({
            status: 'success',
            data: tagAggregation
        });

    } catch (error) {
        console.error('Tag search error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error searching tags',
            data: []
        });
    }
});

/**
 * Enhanced Categories API
 */
router.get("/api/categories", async (req, res) => {
    try {
        const ENHANCED_CATEGORIES = {
            genres: [
                { value: 'psychological-horror', label: 'Psychological Horror', icon: '🧠' },
                { value: 'supernatural-horror', label: 'Supernatural Horror', icon: '👻' },
                { value: 'body-horror', label: 'Body Horror', icon: '🩸' },
                { value: 'folk-horror', label: 'Folk Horror', icon: '🌲' },
                { value: 'sci-fi-horror', label: 'Sci-Fi Horror', icon: '🚀' },
                { value: 'slasher', label: 'Slasher', icon: '🔪' },
                { value: 'cosmic-horror', label: 'Cosmic Horror', icon: '🌌' },
                { value: 'gothic-horror', label: 'Gothic Horror', icon: '🏰' }
            ],
            formats: [
                { value: 'creepypasta', label: 'Creepypasta', icon: '📜' },
                { value: 'short-story', label: 'Short Story', icon: '📖' },
                { value: 'flash-fiction', label: 'Flash Fiction', icon: '⚡' },
                { value: 'two-sentence', label: '2 Sentence Horror', icon: '✌️' },
                { value: 'true-story', label: 'True Story', icon: '📰' },
                { value: 'found-footage', label: 'Found Footage', icon: '📹' }
            ],
            themes: [
                { value: 'urban-legends', label: 'Urban Legends', icon: '🏙️' },
                { value: 'myths-legends', label: 'Myths and Legends', icon: '📚' },
                { value: 'ghosts', label: 'Ghosts', icon: '👻' },
                { value: 'monsters', label: 'Monsters', icon: '👹' },
                { value: 'witchcraft', label: 'Witchcraft', icon: '🔮' },
                { value: 'technology-horror', label: 'Technology Horror', icon: '💻' },
                { value: 'cursed-objects', label: 'Cursed Objects', icon: '📿' },
                { value: 'conspiracies', label: 'Conspiracies', icon: '🕵️' }
            ]
        };

        res.json({
            status: 'success',
            data: ENHANCED_CATEGORIES
        });

    } catch (error) {
        console.error('Categories API error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching categories'
        });
    }
});

/**
 * Story Statistics API
 */
router.get("/api/stats", async (req, res) => {
    try {
        const Story = require("../model/submission.js");
        
        const stats = await Story.aggregate([
            { $match: { isApproved: true } },
            {
                $group: {
                    _id: null,
                    totalStories: { $sum: 1 },
                    totalViews: { $sum: "$viewCount" },
                    totalUpvotes: { $sum: "$upvoteCount" },
                    avgReadingTime: { $avg: "$readingTime" }
                }
            }
        ]);

        // Get category distribution
        const categoryStats = await Story.aggregate([
            { $match: { isApproved: true } },
            { $unwind: "$categories" },
            { $group: { _id: "$categories", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get language distribution
        const languageStats = await Story.aggregate([
            { $match: { isApproved: true } },
            { $group: { _id: "$language", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            status: 'success',
            data: {
                overview: stats[0] || { totalStories: 0, totalViews: 0, totalUpvotes: 0, avgReadingTime: 0 },
                categories: categoryStats,
                languages: languageStats
            }
        });

    } catch (error) {
        console.error('Stats API error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching statistics'
        });
    }
});

// ==================== MAIN ROUTES ====================

// Submission routes
router.get("/submission", isAuthenticated, submission);
router.post("/submission", [
    isAuthenticated,
    ...enhancedSanitization,
    handleValidationErrors,
    csrfCheckRoute
], submissionPost);

// Story query and display routes
router.get("/query", queryStories);
router.get("/horrorStory/:slug", readPage);

// Story interaction routes
router.get("/upvote", isAuthenticated, upvote);
router.get("/report", isAuthenticated, report);
router.get("/addToReadList/:slug", isAuthenticated, addToReadList);

// Audio generation
router.get('/generate-audio/:id', generateAudio);

// Admin/moderator routes
router.get("/checkBookTitle/:bookTitle", isAuthenticated, checkBookTitle);
router.post("/deleteStory", [isAuthenticated, csrfCheckRoute], deleteStory);
router.post("/changeStoryPermision", [isAuthenticated, csrfCheckRoute], changeStoryPermision);

// Edit routes
router.get("/editStory/:slug", isAuthenticated, updateStoryPage);
router.post("/editStory", [
    isAuthenticated,
    ...editStoryValidation,
    handleEditValidationErrors,
    csrfCheckRoute
], updateStoryPost);

// Language-specific routes
router.get("/cuentosDeTerror", cuentosDeTerror);

router.get("/ultimateSearch", ultimateSearch);

// Catch-all route (must be last)
router.get("*", terrorTalesPage);

module.exports = router;