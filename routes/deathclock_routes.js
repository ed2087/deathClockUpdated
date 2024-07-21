const express = require('express');
const router = express.Router();
const deathclockController = require('../controller/deathclock_controller');
const { isAuthenticated } = require("../utils/auth.js");

// Routes for rendering pages
router.get('/questions', isAuthenticated, deathclockController.deathclockQuestions);
router.get('/results/:id', deathclockController.deathclockResults);
router.get('/graveyard', deathclockController.graveyard);
router.get('/graveyardPagination', deathclockController.graveyardPagination);

// Route for updating user clock
// router.post('/updateUserClock', deathclockController.updateUserClock);

module.exports = router;
