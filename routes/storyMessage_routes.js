const express = require('express');
const router = express.Router();

const { check, body } = require("express-validator");
const { isAuthenticated } = require("../utils/auth.js");
//csrf
const { checkCsrf, checkCsrfToken } = require("../utils/csrf.js");
const { addComment, addReply, getComments, deleteMessage} = require('../controller/storyMessageAPI_controller.js');

// Add a comment to a story
router.post(
  "/StoryTopLevelMessage/:storyId",
  isAuthenticated,
  [
    body("commentText").trim().isLength({ min: 1 }).withMessage("Comment text cannot be empty."),
  ], addComment
);

// Add a reply to a comment
router.post(
  "/storyReplyMessage/:storyId",
  isAuthenticated,
  [
    body("replyText").trim().isLength({ min: 1 }).withMessage("Comment text cannot be empty."),
  ],
  addReply
);

// Delete a comment or reply
router.delete(
  "/storyMessage/:messageId",
  isAuthenticated,
  deleteMessage
);

// Get all comments for a story
router.get("/storyComments/:storyId",getComments);

module.exports = router;
