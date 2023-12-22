const { readFileAPI } = require("../utils/readFiles.js");
const Question = require("../model/user.js");

// utils
const {someUserInfo,calculateReadingTime,GetStories} = require("../utils/utils_fun.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");


exports.index = async function (req, res, next) {

  try {

    //check if user is logged in
  let {userName, userActive} = await someUserInfo(req, res, next);


  //get back top 5 storys from class GetStories
  const topStorys = await new GetStories().getTopStorys(5);
  let topStoryByUpvotes = await new GetStories().getTopStorysByUpvotes(1);

  
  //make sure that topStorysByUpvotes is not empty if it is get getTopStorysByReads
  if (topStoryByUpvotes.length === 0) {
      const topStorysByReads = await new GetStories().getTopStorysByReads(1);
      topStoryByUpvotes.push(topStorysByReads[0]);
  }


  //check if topStorysByUpvotes is not in topStorys if its is remove it
  topStorys.forEach((story, index) => {
      if (story._id.toString() === topStoryByUpvotes[0]._id.toString()) {
          topStorys.splice(index, 1);
      }
  });
  //only allow 3 storys to be displayed from topStorys
  topStorys.splice(3, 2); 

  topStoryByUpvotes = topStoryByUpvotes[0];  

  const file = await readFileAPI("questions_api.json");

  res.status(200).render("index", {
    path: "/",
    title: "home page",
    csrfToken: res.locals.csrfToken,
    userActive,
    userName,
    topStorys,
    topStoryByUpvotes,
  });
    
  } catch (error) {
      console.log(error);
      globalErrorHandler(req, res, 500, "Something went wrong");
  } 
  

};



// FAQ
exports.faq = async function (req, res, next) {

  try {
    //check if user is logged in
    let {userName, userActive} = await someUserInfo(req, res, next);

    res.status(200).render("faq", {
      path: "/faq",
      title: "FAQ",
      headerTitle: "FAQ",
      csrfToken: res.locals.csrfToken,
      userActive,
      userName,
    });

  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Something went wrong");
  }

};

// DISCLAIMER
exports.disclaimer = async function (req, res, next) {

  try {
    //check if user is logged in
    let {userName, userActive} = await someUserInfo(req, res, next);

    res.status(200).render("disclaimer", {
      path: "/disclaimer",
      title: "Disclaimer",
      headerTitle: "Disclaimer",
      csrfToken: res.locals.csrfToken,
      userActive,
      userName,
    });

  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Something went wrong");
  }

};

//termsConditions
exports.termsConditions = async function (req, res, next) {

  try {
    //check if user is logged in
    let {userName, userActive} = await someUserInfo(req, res, next);

    res.status(200).render("termsConditions", {
      path: "/termsConditions",
      title: "Terms & Conditions",
      headerTitle: "Terms & Conditions",
      csrfToken: res.locals.csrfToken,
      userActive,
      userName,
    });

  } catch (error) {
    console.log(error);
    globalErrorHandler(req, res, 500, "Something went wrong");
  }

};