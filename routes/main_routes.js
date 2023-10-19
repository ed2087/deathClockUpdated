const express = require('express');
const router = express.Router();

// Controller
const {index} = require("../controller/main_controller.js");

// Landing page
router.get("/", index);

module.exports = router;
