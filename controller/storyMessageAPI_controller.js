//schemas
const Message = require('../model/storyComments.js');
const Story = require("../model/submission.js");
const User = require("../model/user.js");

const {someUserInfo, calculateReadingTime,GetStories} = require("../utils/utils_fun.js");
const {sendEmail,htmlTemplate} = require("../utils/sendEmail.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");
//later on stoies model and users model to add comment count and reply count
const _nodemailer = require("nodemailer");
const _sendgridtransport = require("nodemailer-sendgrid-transport");


//alert user when a new comment is added to their story
const alertUser = async (req,res,next, storyId, commentText) => {
   try {

    const { userName, userActive, userData } = await someUserInfo(req, res, next);


    //get story owner email
      const storyData = await Story.findById(storyId);
      const storyOwner = storyData.owner;

      //if user is the story owner, do not send email
      if (storyOwner.equals(userData.id)) {
        console.log("user is the story owner");
        return;
      }

      const userEmail = await User.findById(storyOwner).select("email");
      const story = await Story.findById(storyId);
      const websiteUrl = `${req.protocol}://${req.get("host")}`;

      let subject = `New comment on : ${story.storyTitle}`;

      const html = htmlTemplate(
        `
            <h2>New comment on your story</h2>
            <p>${commentText}</p>
            <a href="${websiteUrl}/terrorTales/horrorStory/${story.slug}">${story.storyTitle}</a>

        `
    );

    const emailSent = await sendEmail(userEmail, subject, html);

    } catch (error) {
      console.log(error);
      globalErrorHandler(req, res, 500, "Internal server error", error);
    }

};

//update story comment count on comments
const updateCommentCount = async (storyId, userId, commentID) => {
   //update story comment count on comments
   const story = await Story.findById(storyId);

   //add user id to the story comment array
   story.comments.push(commentID);

   //update story comment count
   story.commentCount = story.comments.length + 1;

   await story.save();
   

  return story;

};


exports.addComment =  async (req, res, next) => {

  try {
    
    const { userId, commentText, csrf } = req.body;
    const storyId = req.params.storyId;


    //check csrf token fix the token is incorrect

    //get user username
    const userName = await User.findById(userId).select("username");     
    
    //add new comment to the story
    const newComment = new Message({
        userId,
        userName: userName.username,
        commentText,
        storyId,
    });

    const data = await newComment.save();  

    //update story comment count on comments add comment id
    await updateCommentCount(storyId, userId, data._id);

    //alert user when a new comment is added to their story
    alertUser(req, res,next, storyId, commentText);

    res.status(201).json(data);

  } catch (error) {

   console.log(error);
   globalErrorHandler(req, res, 500, "Internal server error", error);

  }

};



exports.addReply = async (req, res, next) => {
  try {
    const { userId, replyText, parentCommentId} = req.body;
    const storyId = req.params.storyId;

    //get user username
    const userName = await User.findById(userId).select("username");

    const newComment = new Message({
        userId,
        userName: userName.username,
        commentText : replyText,
        storyId,
        parentCommentId,
    });

    const updatedStory = await newComment.save();

    //update story comment count on comments
    await updateCommentCount(storyId, userId, updatedStory._id);

    //alert user when a new comment is added to their story
    alertUser(req, res, next, storyId, replyText);
      

    res.status(201).json(updatedStory);

  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Internal server error", error);
  }

};




exports.getComments = async (req, res, next) => {
  try {
    const storyId = req.params.storyId;
    const comments = await Message.find({ storyId });
    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Internal server error", error);
  }
};






// ...



//updat Story comment count
const removeCommentFromStory = async (storyId, commentId) => {
  try {


    const story = await Story.findById(storyId);
    const commentIndex = story.comments.indexOf(commentId);
    story.comments.splice(commentIndex, 1);
    story.commentCount = story.comments.length;
    await story.save();


    
  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Internal server error", error);
    
  }

};


// Delete a comment or reply
exports.deleteMessage = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const messageId = req.params.messageId;

    // Check if the message is a top-level comment or a reply
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.parentCommentId) {
      // Top-level comment, delete the comment and its replies
      await Message.deleteMany({ $or: [{ _id: messageId }, { parentCommentId: messageId }] });
      //remove comment from story
      await removeCommentFromStory(message.storyId, messageId);
      return res.status(204).json({ message: "Comment and its replies deleted successfully" });
    } else {
      // Reply, delete the reply
      await Message.findByIdAndDelete(messageId);
      //remove comment from story
      await removeCommentFromStory(message.storyId, messageId);
      return res.status(204).json({ message: "Reply deleted successfully" });
    }
  } catch (error) {
    console.error('Error deleting comment or reply:', error.message);
    globalErrorHandler(req, res, 500, "Internal server error", error);
  }
};

// ...
