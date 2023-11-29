const express = require('express');
const router = express.Router();

// Controller
const {deathclockQuestions,deathclockResults,graveyard,updateUserClock,graveyardPagination} = require("../controller/deathclock_controller.js");

// DeathclockQuestions
router.get("/questions", deathclockQuestions);

// DeathclockResults
router.get("/results/:id", deathclockResults);

// GraveyardPagination
router.get("/pagination", graveyardPagination);

// Graveyard
router.get("/graveyard", graveyard);

// UpdateUserClock
router.post("/updateUserClock", updateUserClock);


module.exports = router;
