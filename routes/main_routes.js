const express = require('express');
const router = express.Router();

// Controller
const {index,faq,disclaimer,termsConditions} = require("../controller/main_controller.js");

// Landing page


// FAQ
router.get("/faq", faq);

// DISCLAIMER
router.get("/disclaimer", disclaimer);

// TERMS AND CONDITIONS
router.get("/termsConditions", termsConditions);

// Landing page
router.get("/", index);

module.exports = router;
