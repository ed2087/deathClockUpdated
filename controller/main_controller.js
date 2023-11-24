const { readFileAPI } = require("../utils/readFiles.js");
const Question = require("../model/user.js");

// utils
const {someUserInfo} = require("../utils/utils_fun.js");



exports.index = async function (req, res, next) {

  
  //check if user is logged in
  let {userName, userActive} = await someUserInfo(req, res, next);
  

  const file = await readFileAPI("questions_api.json");

  res.status(200).render("index", {
    path: "/",
    title: "home page",
    csrfToken: res.locals.csrfToken,
    userActive,
    userName,
  });

};
