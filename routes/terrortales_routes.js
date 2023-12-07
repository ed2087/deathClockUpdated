const express = require('express');
const router = express.Router();
const csrfModule = require("../utils/csrf.js");
const { check, validationResult } = require('express-validator');
//utils\auth.js
const { isAuthenticated } = require("../utils/auth.js");

// Controller
const {submission,submissionPost,terrorTalesPage,queryStories,readPage,upvote, report} = require("../controller/terrorTales_controller.js");

// Submission page
router.get("/submission", isAuthenticated, submission);

// Submission post
router.post("/submission", [
    isAuthenticated,
    check('legalName').escape(),
    check('creditingName').escape(),
    check('socialMedia').escape(),
    check('website').escape(),
    check('storyTitle').escape(),
    check('storySummary').escape(),
    check('tags').escape(),
    check('storyText').escape(),
    check('categories').escape(),
    check('extraTags').escape()
], submissionPost);


// Query stories
router.get("/query", queryStories);

// Read page
router.get("/horrorStory/:id", readPage);


// Upvote
router.get("/upvote", upvote);

// Report
router.get("/report", report);

// Landing page
router.get("*", terrorTalesPage);

module.exports = router;
