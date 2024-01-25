const { readFileAPI } = require("../utils/readFiles.js");
const Question = require("../model/user.js");
const Story = require("../model/submission.js");
const xmlbuilder = require('xmlbuilder');
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
    title: `TerrorHub - Home`,
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


///sitemap.xml
exports.sitemap = async (req, res, next) => {
  try {

      //get all storys for sitemap
      const stories = await Story.find({}).select("slug");     
      // Static URLs with 'www'
      const staticUrls = [
          'https://www.terrorhub.com/',
          'https://www.terrorhub.com/deathClock',
          'https://www.terrorhub.com/deathClock/graveyard',
          'https://www.terrorhub.com/terrorTales',
          'https://www.terrorhub.com/disclaimer',
          'https://www.terrorhub.com/faq',
          'https://www.terrorhub.com/termsConditions'
      ];
    

      var root = xmlbuilder.create({
          urlset: {
              '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
              '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
              '@xsi:schemaLocation': 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd'
          }
      });

      // Add static URLs
      staticUrls.forEach(url => {
          var u = root.ele('url');
          u.ele('loc', url);
          u.ele('changefreq', 'daily');
          u.ele('priority', '1');
      });

      // Add URLs for each post by /terrorTales/horrorStory/slug
      stories.forEach(story => {
        const storyUrl = `https://www.terrorhub.com/terrorTales/horrorStory/${story.slug}`;
        var u = root.ele('url');
        u.ele('loc', storyUrl);
        u.ele('changefreq', 'daily');
        u.ele('priority', '0.8');
    });

      res.set('Content-Type', 'text/xml');
      res.send(root.end({ pretty: true }));
  } catch (err) {
      console.log(err);
      globalErrorHandler(req, res, 500, "Something went wrong");
  }

};