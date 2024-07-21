const { someUserInfo } = require("../utils/utils_fun.js");
const DeathClockModel = require("../model/deathclock.js");
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.deathclockQuestions = async function (req, res, next) {
  let { userName, userActive } = await someUserInfo(req, res, next);

  res.status(200).render("../views/deathclock/mortality_questions", {
    path: "/deathclockQuestions",
    title: "Death Clock - How Long Will You Live - The Time Ticker",
    headerTitle: "How Long Will You Live?",
    description: "The Death Clock is a simple application that estimates your day of death. It is based on your life expectancy and the average life expectancy of your country. The Death Clock is the internet's friendly reminder that life is slipping away...",
    csrfToken: res.locals.csrfToken,
    userActive,
    userName,
  });
};

exports.deathclockResults = async function (req, res, next) {
  const id = req.params.id;

  try {    
    const user = await DeathClockModel.findOne({ shortId: id });

    //get all the user deathcloks
    const userDeathClocks = await DeathClockModel.find();
    let predictedDeathYears = userDeathClocks.map((user) => {
      try {
        const jsonFile = JSON.parse(user.jsonFile);
        if (jsonFile && jsonFile.death_prediction) {
          const predictedDate = jsonFile.death_prediction.predicted_date_of_death;
          return predictedDate.split('-')[0]; // Extract the year part
        }
      } catch (error) {
        console.error(`Error parsing JSON for user ${user.name}:`, error);
      }
    }).filter(Boolean); // Filter out any undefined values   


    if (user) {
      let { userName, userActive } = await someUserInfo(req, res, next);

      res.status(200).render("../views/deathclock/mortality_results", {
        path: `/deathClock/results/${id}`,
        title: `The Time Ticker: ${user.name}'s Death Clock Results`,
        headerTitle: `${user.name}'s Death Clock`,
        description: `See The Time Countdown To ${user.name}'s Death`,
        csrfToken: res.locals.csrfToken,
        user: user,
        userActive,
        userName,
        shortId: id,
        predictedDeathYears,
      });
    } else {
      console.log("User not found");
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

exports.graveyard = async function (req, res, next) {
  try {
    const users = await DeathClockModel.find().sort({ updatedAt: -1 }).limit(10).exec();
    const totalItems = await DeathClockModel.countDocuments();
    

    const package_ = users.map((user) => ({
      userName: user.name,
      userShortId: user.shortId,
      clock: user.predicted_date_of_death,
    }));

    let { userName, userActive } = await someUserInfo(req, res, next);

    res.status(200).render('../views/deathclock/graveyard', {
      path: '/graveyard',
      title: 'Join the Graveyard - On Death Clock',
      headerTitle: 'Join the Graveyard',
      description: 'Add Tombstone To The Graveyard - And Let The Time Ticker Count Down To Your Death',
      csrfToken: res.locals.csrfToken,
      users: package_,
      userActive,
      userName,
      totalItems,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
};

exports.graveyardPagination = async function (req, res, next) {
  try {
    const { page, limit } = req.query;
    const { package_, totalClocks_avalable } = await loadMoreClocks(page, limit, res);    

    res.status(200).json({
      status: package_.length === 0 ? null : 'ok',
      data: package_,
      totalClocks_avalable,
    });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
};

async function loadMoreClocks(page, limit, res) {
  try {
    const page_ = parseInt(page, 10) || 1;
    const limit_ = parseInt(limit, 10) || 10;
    const skip = (page_ - 1) * limit_;

    const users = await DeathClockModel.find().sort({ updatedAt: -1 }).skip(skip).limit(limit_).exec();
    const totalClocks_avalable = await DeathClockModel.countDocuments();

    const package_ = users.map((user) => {
      let yearsLeft = null;
      try {
        const jsonFile = JSON.parse(user.jsonFile);
        
        if (jsonFile.death_prediction.predicted_date_of_death) {

          //find how many years from now the user will die
          const date = new Date(jsonFile.death_prediction.predicted_date_of_death);
          const years = date.getFullYear();
          yearsLeft = years;
        }
      } catch (error) {
        console.error(`Error parsing JSON for user ${user.name}:`, error);
      }
      return {
        userName: user.name,
        userShortId: user.shortId,
        clock: yearsLeft
      };
    });


    return { package_, totalClocks_avalable };
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.redirect('/');
    }
  }
}


exports.updateUserClock = async function (req, res, next) {
  const body = req.body;

  try {
    const user = await DeathClockModel.findOne({ shortId: body.shortId });

    user.clock = {
      predictedDeathYear: body.predictedDeathYear,
      yearsLeft: body.yearsLeft,
      monthsLeft: body.monthsLeft,
      weeksLeft: body.weeksLeft,
      daysLeft: body.daysLeft,
      hoursLeft: body.hoursLeft,
      minutesLeft: body.minutesLeft,
      secondsLeft: body.secondsLeft,
      expectedFutureDate: body.expectedFutureDate,
    };

    user.updatedAt = Date.now();
    const updated = await user.save();

    if (updated) {
      res.status(200).json({ status: "ok", name: updated.name });
    } else {
      res.status(200).json({ status: "not ok" });
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};
