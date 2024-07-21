const express = require('express');
const router = express.Router();
const apiController = require('../controller/api_controller');

// Route for form submission
router.post('/submitDeathclockForm', apiController.submitDeathclockForm);

module.exports = router;