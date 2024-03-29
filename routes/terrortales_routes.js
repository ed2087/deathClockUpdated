const express = require('express');
const router = express.Router();
const {csrfCheckRoute} = require("../utils/csrf.js");
const { check, validationResult } = require('express-validator');
//utils\auth.js
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
    updateStoryPost
} = require("../controller/terrorTales_controller.js");

// Submission page
router.get("/submission", isAuthenticated, submission);

// Submission post
const sanitizeInput = input => check(input).escape().toLowerCase().trim();

router.post("/submission", [
    isAuthenticated,
    sanitizeInput('legalName'),
    sanitizeInput('storyTitle'),
    check('storySummary').escape().trim(),
    sanitizeInput('tags'),
    check('storyText').escape().trim(),
    sanitizeInput('categories'),
    sanitizeInput('extraTags')
],csrfCheckRoute, submissionPost);


// Query stories
router.get("/query", queryStories);

// Read page
router.get("/horrorStory/:slug", readPage);


// Upvote
router.get("/upvote", upvote);

// Report
router.get("/report", report);

// Check book title
router.get("/checkBookTitle/:bookTitle", checkBookTitle);

// Delete story
router.post("/deleteStory",csrfCheckRoute, deleteStory);

// Change story permision
router.post("/changeStoryPermision",  changeStoryPermision);

// Update story page
router.get("/editStory/:slug", updateStoryPage);

// Update story post
router.post("/editStory",csrfCheckRoute, updateStoryPost);

// Landing page
router.get("*", terrorTalesPage);

module.exports = router;
