const { readFileAPI } = require("../utils/readFiles.js");
const Question = require("../model/user.js");

exports.index = async function (req, res, next) {

  //get user info from session
  let user = req.session.user;

  if (user === undefined) {
    user = { username: "guest" };
  }
  

  const file = await readFileAPI("questions_api.json");

  res.status(200).render("index", {
    path: "/",
    title: "home page",
    csrfToken: res.locals.csrfToken,
    userName: user.username,
    userActive:  req.session.user ? true : false,
  });

};
