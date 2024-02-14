//schemas
const Message = require('../model/storyComments.js');
const Story = require("../model/submission.js");
const User = require("../model/user.js");


const {sendEmail,htmlTemplate} = require("../utils/sendEmail.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");
//later on stoies model and users model to add comment count and reply count
const _nodemailer = require("nodemailer");
const _sendgridtransport = require("nodemailer-sendgrid-transport");

//csrf token from session


const transporter = _nodemailer.createTransport(_sendgridtransport({

   auth : {
      api_key : `${process.env.SENDGRID_KEY}`
   }

}));



//alert user when a new comment is added to their story
const alertUser = async (req,res,userId, storyId, commentText) => {
   try {
      const userEmail = await User.findById(userId).select("email");
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
const updateCommentCount = async (storyId, userId) => {
   //update story comment count on comments
   const story = await Story.findById(storyId);

   //add user id to the story comment array
   story.comments.push(userId);

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

    //update story comment count on comments
    await updateCommentCount(storyId, userId);

    //alert user when a new comment is added to their story
    alertUser(req, res, userId, storyId, commentText);

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
    await updateCommentCount(storyId, userId);

    //alert user when a new comment is added to their story
    alertUser(req, res, userId, storyId, replyText);
      

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

