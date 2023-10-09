const express = require('express');
const router = express.Router();

// Controller
const deathclockController = require("../controller/deathclock_controller.js");

// DeathclockQuestions
router.get("/questions", deathclockController.deathclockQuestions);

// DeathclockResults
router.get("/results/:id", deathclockController.deathclockResults);

// Graveyard
router.get("/graveyard", deathclockController.graveyard);

// UpdateUserClock
router.post("/updateUserClock", deathclockController.updateUserClock);

module.exports = router;
