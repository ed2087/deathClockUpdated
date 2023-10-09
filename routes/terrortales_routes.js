const express = require('express');
const router = express.Router();
const csrfModule = require("../utils/csrf.js");

//utils\auth.js
const { isAuthenticated } = require("../utils/auth.js");

// Controller
const terrorTalesController = require("../controller/terrorTales_controller.js");

// Submission page
router.get("/submission", isAuthenticated, terrorTalesController.submission);

// Submission post
router.post("/submission", isAuthenticated, terrorTalesController.submissionPost);

// Landing page
router.get("*", terrorTalesController.terrorTalesPage);

module.exports = router;
