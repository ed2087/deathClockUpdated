const { readFileAPI } = require("../utils/readFiles.js");
const {someUserInfo} = require("../utils/utils_fun.js");
// Add model
const DeathClockModel = require("../model/deathclock.js");
const e = require("connect-flash");

// deathclockQuestions
exports.deathclockQuestions = async function (req, res, next) {

  //check if user is logged in
  let {userName, userActive} = await someUserInfo(req, res, next);

  res.status(200).render("../views/deathclock/mortality_questions", {
    path: "/deathclockQuestions",
    title: "The Time Ticker: How Long Have You Go",
    headerTitle: "Death Clock",
    csrfToken: res.locals.csrfToken,
    userActive,
    userName,
  });

};

// deathclockResults
exports.deathclockResults = async function (req, res, next) {
  const id = req.params.id;

  try {
    // get user data
    const user = await DeathClockModel.findOne({ shortId: id });
    // get all users' death

    if (user) {

      //check if user is logged in
      let {userName, userActive} = await someUserInfo(req, res, next);

      // render deathclockResults
      res.status(200).render("../views/deathclock/mortality_results", {
        path: "/mortality_results",
        title: "The Time Ticker: How Long Have You Go",
        headerTitle: `${user.name}'s Death Clock Results`,
        csrfToken: res.locals.csrfToken,
        user: user,
        userActive,
        userName,
        shortId: id,
      });
      
    } else {
      console.log("user not found");
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

// graveyard where all users are listed
exports.graveyard = async function (req, res, next) {

  try {

    // Get the latest 10 users that are allowed using aggregation
    const users = await DeathClockModel.find({ allowed: true })
      .sort({ updatedAt: -1 })
      .limit(10)
      .exec();

    // Extract relevant user information
    const package_ = users.map((user) => ({
      userName: user.name,
      userShortId: user.shortId,
      clock: user.clock,
    }));

    //check if user is logged in
    let {userName, userActive} = await someUserInfo(req, res, next);

    // Render deathclockResults
    res.status(200).render("../views/deathclock/graveyard", {
      path: "/graveyard",
      title: "The Time Ticker: How Long Have You Go",
      headerTitle: "Graveyard",
      csrfToken: res.locals.csrfToken,
      users: package_,
      userActive,
      userName,
    });

  } catch (error) {
    console.error(error);
    res.redirect("/");
  }

};


exports.graveyardPagination = async function (req, res, next) {
  try {
    const { page, limit } = req.query;
    const {package_, totalClocks_avalable} = await loadMoreClocks(page, limit, res);

    // Send JSON response
    const response = {
      status: package_.length === 0 ? null : "ok",
      data: package_,
      totalClocks_avalable,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
};

// Load more users' clocks
async function loadMoreClocks(page, limit, res) {

  try {
    // Convert page and limit to numbers with default values
    const page_ = (page * 1) || 1;
    const limit_ = (limit * 1) || 10;

    // Calculate the number of documents to skip for pagination
    const skip = (page_ - 1) * limit_;

    // Get the latest users that are allowed using aggregation
    const users = await DeathClockModel.find({ allowed: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit_)
      .exec();


    // how many clocks are available
    const totalClocks_avalable = await DeathClockModel.find({ allowed: true }).countDocuments();
 
    // Extract relevant user information
    const package_ = users.map((user) => ({
      userName: user.name,
      userShortId: user.shortId,
      clock: user.clock,
    }));

    return {
      package_,
      totalClocks_avalable,
    };
    
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }

};




// update user clock
exports.updateUserClock = async function (req, res, next) {
  const body = req.body;

  let pYear = body.predictedDeathYear;
  let pMonth = body.yearsLeft;
  let pWeek = body.monthsLeft;
  let pDay = body.daysLeft;
  let pHour = body.hoursLeft;
  let pMinute = body.minutesLeft;
  let pSecond = body.secondsLeft;

  try {
    // update and return json with an ok status
    const user = await DeathClockModel.findOne({ shortId: body.shortId });

    // get all users' death clock.predictedDeathYear use aggregate to get averages
    const usersAvg = await DeathClockModel.aggregate([
      { $group: { _id: null, avg: { $avg: "$clock.predictedDeathYear" } } },
    ]);

    // get all users' death clock.predictedDeathYear use aggregate to get averages
    const usersMax = await DeathClockModel.aggregate([
      { $group: { _id: null, max: { $max: "$clock.predictedDeathYear" } } },
    ]);

    // get all users' death clock.predictedDeathYear use aggregate to get averages
    const usersMin = await DeathClockModel.aggregate([
      { $group: { _id: null, min: { $min: "$clock.predictedDeathYear" } } },
    ]);

    // update users clock
    user.clock.predictedDeathYear = pYear;
    user.clock.yearsLeft = pYear;
    user.clock.monthsLeft = pMonth;
    user.clock.weeksLeft = pWeek;
    user.clock.daysLeft = pDay;
    user.clock.hoursLeft = pHour;
    user.clock.minutesLeft = pMinute;
    user.clock.secondsLeft = pSecond;
    user.clock.expectedFutureDate = body.expectedFutureDate;

    // updatedAt
    user.updatedAt = Date.now();

    // save user
    const updated = await user.save();

    // if updated
    if (updated) {
      console.log("user updated");
      res.status(200).json({
        status: "ok",
        data: {
          usersAvg,
          usersMax,
          usersMin,
        },
      });
    } else {
      console.log("user not updated");
      res.status(200).json({
        status: "not ok",
        data: data,
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};
