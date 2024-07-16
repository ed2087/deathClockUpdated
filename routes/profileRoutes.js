const express = require('express');
const router = express.Router();

// utils/auth.js
const { isAuthenticated } = require("../utils/auth.js");
// csrf
const { checkCsrf, checkCsrfToken } = require("../utils/csrf.js");

// Controller
const { 
    profilePage,
     profilePageURLS,
      followUser,
       unfollowUser,
        updateBio,
         updatePassword,
          updateUsername,
          loadMoreStories,
            searchUserStories
         } = require("../controller/profile_controller.js");

// profile page
router.get("/u/:userName", profilePage);

// update profile url
router.post("/u/:userName/url", isAuthenticated, checkCsrfToken, profilePageURLS);

// follow user
router.post("/u/:userName/follow", isAuthenticated, followUser);

// unfollow user
router.post("/u/:userName/unfollow", isAuthenticated, unfollowUser);

// update bio
router.post("/u/:userName/bio", isAuthenticated, checkCsrfToken, updateBio);

// update password
router.post("/u/:userName/password", isAuthenticated, checkCsrfToken, updatePassword);

// update username
router.post("/u/:userName/username", isAuthenticated, checkCsrfToken, updateUsername);

// Load more stories
router.get("/u/:userName/loadMoreStories", loadMoreStories);

// Search stories
router.get("/u/:userName/search", searchUserStories);

module.exports = router;
