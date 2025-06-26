const express = require('express');
const router = express.Router();

// Controller
const {
    index,
    faq,
    disclaimer,
    termsConditions,
    sitemap,
    getCategoryPage,
    robots,
    searchPage
} = require("../controller/main_controller.js");

// Landing page
router.get("/", index);

// FAQ
router.get("/faq", faq);

// DISCLAIMER
router.get("/disclaimer", disclaimer);

// TERMS AND CONDITIONS
router.get("/termsConditions", termsConditions);

// SEO Routes
router.get("/sitemap.xml", sitemap);
router.get("/robots.txt", robots);
router.get("/search", searchPage);

// Category pages for SEO
router.get("/terrorTales/category/:categorySlug", getCategoryPage);

module.exports = router;