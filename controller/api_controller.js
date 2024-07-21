const fs = require('fs').promises;
const DeathClockModel = require("../model/deathclock.js");
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require("openai");
const User = require("../model/user.js");
const {someUserInfo, calculateReadingTime , GetStories} = require("../utils/utils_fun.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gptInstruction = {
  schema: {
    name: "User's name",
    dob: "User's date of birth",
    gender: "User's gender",
    country: "User's country",
    height: "User's height",
    weight: "User's weight",
    chronic: "Chronic conditions, if any",
    cancer: "Cancer history",
    bloodPressure: "Blood pressure status",
    cholesterol: "Cholesterol levels",
    smoke: "Smoking habits",
    alcohol: "Alcohol consumption habits",
    diet: "Diet description",
    exercise: "Exercise routine",
    sleep: "Sleep duration per night",
    stress: "Stress management techniques",
    risks: "Unnecessary risks taken",
    stroke: "Family history of stroke/heart attack before age 60",
    hereditary: "Family history of hereditary conditions",
    checkup: "Last medical checkup",
    vaccinations: "Vaccination status",
    social: "Social activity frequency",
    occupation: "Occupation and stress level",
    workEnv: "Work environment",
    scenario1: "Response to being lost in a forest",
    scenario2: "Response to being in a burning building",
    scenario3: "Response to encountering a wild animal",    
    predicted_Year: "Predicted date of death",
    predicted_date_of_death: "Predicted date of death",
  },
  instructions: `
    Based on the provided user data schema, calculate the user's estimated lifespan and cause of death. Generate a detailed JSON response containing the following:
    - name
    - death_prediction:
      - years_left
      - months_left
      - weeks_left
      - days_left
      - hours_left
      - minutes_left
      - seconds_left
      - milliseconds_left
      - predicted_date_of_death
      - cause_of_death
    - in_loving_memory_text
    - you_have_lived:
      - years_lived
      - months_lived
      - weeks_lived
      - days_lived
      - hours_lived
      - minutes_lived
      - seconds_lived
      - milliseconds_lived
     - detailed_explanation{
        Lifespan_Calculation:{
          title: some title,
          message: some message, 
        },
        Improve_Lifespan:{
          title: some title,
          message: some message, 
        },
        BMI_Explanation:{
          title: some title,
          message: some message, 
        },
        Cause_of_Death_Explanation:{
          title: some title,
          message: some message, 
        },
        Creepy_Omen:{
          title: some title,
          message: some message, 
        },
        Supernatural_Encounter:{
          title: some title,
          message: some message, 
        }          
      }
      1.Lifespan_Calculation:
        note: give how many years the user lost and how we got the calculation. like x amount of years they lost due to smoking, etc.  
      2.Improve_Lifespan:
        note: give advice on how to improve the lifespan be it diet, exercise, etc.
      3.BMI_Explanation:
        note: give the user's detaled BMI and explain what it means and why and how to fix it. give bmi calculation. and a diet plan.
      4.Cause_of_Death_Explanation:
        note: predict how the user will die and where and why. give a detailed story.
      5.Creepy_Omen:
        note: give a creepy omen that will happen before the user dies. give date and time and location - current world conflict, natural disaster, etc.
      6.Supernatural_Encounter:
        note: give a supernatural encounter that the user will have before they die. give date and time and location - ghost, demon, etc.
    -- if user asks to be brutally honest, respond with a brutally honest response
    -- GPT you are the grim reaper so behave like it - dont be nice be brutaly honest. make them shit there pants      
  `
};


async function getGptResponse(userData) {


  //mod gptInstruction with userData.establishGPTHonestyLevel
  const tempmod = `GPT, I want you to respond in a manner that is ${userData.establishGPTHonestyLevel} in all your responses. you are the gream reaper so behave like it.`;


  // add to gptInstruction
  gptInstruction.gptTemperment = tempmod;

  try {
    //gpt-3.5-turbo-0125
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        { role: "system", content: JSON.stringify(gptInstruction) },
        { role: "user", content: JSON.stringify(userData) }
      ],
      max_tokens: 2000,
    });

    if (response.choices && response.choices.length > 0) {
      return JSON.parse(response.choices[0].message.content);
    } else {
      globalErrorHandler(req,res, 500, "Oops! Something went wrong. Please try again later.", error);
    }
  } catch (error) {
    console.error('Error in getGptResponse:', error);
    globalErrorHandler(req,res, 500, "Oops! Something went wrong. Please try again later.", error);
  }
};

// Function to handle the form submission
exports.submitDeathclockForm = async function (req, res, next) {
  const { jsonData } = req.body;

  try {

    const { userName, userActive, userData } = await someUserInfo(req, res, next);
    const userID  = await User.findById(userData.id);    

    // Fetch the last deathclock created by the user
    const lastDeathClock = await DeathClockModel.findOne({ userId: userID._id }).sort({ lastPredictionDate: -1 });

    if (lastDeathClock) {
      const lastPredictionDate = new Date(lastDeathClock.lastPredictionDate);
      const currentDate = new Date();

      // Calculate the difference in milliseconds
      const timeDifference = currentDate - lastPredictionDate;

      // Convert the difference to a human-readable format
      const seconds = Math.floor((timeDifference / 1000) % 60);
      const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
      const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
      const totalHours = Math.floor(timeDifference / (1000 * 60 * 60));

      // Check if 24 hours have passed
      if (timeDifference < 24 * 60 * 60 * 1000) {
        const remainingHours = 23 - hours;
        const remainingMinutes = 59 - minutes;
        const remainingSeconds = 59 - seconds;
        return res.status(400).json({
          status: "other",
          userShortId: null,
          message: `You can only make a prediction once every 24 hours. Please try again after ${remainingHours} hours, ${remainingMinutes} minutes, and ${remainingSeconds} seconds.`
        });
      }
    }

    // get gtp
    const gptResponse = await getGptResponse(jsonData); 

    const userFields = {
      shortId: uuidv4(),
      name: userID.username,
      birthdate: jsonData.dob,
      clock: gptResponse.death_prediction,
      jsonFile: JSON.stringify(gptResponse),
      lastPredictionDate: new Date(),
      userId: userID._id,
    };

    for (const key in gptInstruction.schema) {
      if (jsonData.hasOwnProperty(key)) {
        userFields[key] = jsonData[key];
      }
    }

    const newDeathclock = new DeathClockModel(userFields);

    await newDeathclock.save();    

    //save to user deathclock not array
    userID.deathclock = newDeathclock._id;

    await userID.save();

    //delete last deathclock
    if (lastDeathClock) {
      await DeathClockModel.findByIdAndDelete(lastDeathClock._id);
    }

    res.status(200).json({ 
        status: "success",
        userShortId: newDeathclock.shortId,
        message: "Prediction submitted successfully.",
     });
  } catch (error) {
    console.error('Error:', error);
    globalErrorHandler(req,res, 500, "Oops! Something went wrong. Please try again later.", error);
  }
};
