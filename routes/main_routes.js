const express = require('express');
const router = express.Router();

// Controller
const mainController = require("../controller/main_controller.js");

// Landing page
router.get("/", mainController.index);

module.exports = router;
