const express = require('express');
const router = express.Router();
const csrfModule = require("../utils/csrf.js");

// Controller
const apiController = require("../controller/api_controller.js");

// Send JSON
router.get("/questionsAPI", apiController.questionsAPI);

// Receive JSON
router.post("/questionsAPI", apiController.getApiJson);

// Get user data from DB
router.get("/getUserData/:id", apiController.getUserData);


module.exports = router;
