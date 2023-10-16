const fs = require('fs').promises;
// Add model
const DeathClockModel = require("../model/deathclock.js");
const User = require("../model/user.js");
// Generate short id for user
const { v4: uuidv4 } = require('uuid');
const { checkCsrf } = require("../utils/csrf.js");


/////////////////////////////////////////
// ADD ERROR HANDLING TO ALL FUNCTIONS //
/////////////////////////////////////////



// API to fetch questions
exports.questionsAPI = async function (req, res, next) {
  // Define the path to your JSON file
  const filePath = './utils/api/questions_api.json'; // Adjust the path as needed

  try {
    // Read the JSON file asynchronously
    const data = await fs.readFile(filePath, 'utf8');

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Send the JSON data as the API response
    return res.json(jsonData);
  } catch (err) {
    // Handle any errors, such as the file not existing or JSON parse error
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Receive JSON data from deathClock_questions.js
exports.getApiJson = async function (req, res, next) {
  try {
    const jsonData = req.body;
    
    const userPermission = jsonData[jsonData.length - 2].userPermision;
    const csrf = jsonData[jsonData.length - 1]._csrf;

    // Check CSRF
    checkCsrf(req, res, next, csrf);

    // Generate a short user ID
    const shortId = uuidv4().slice(0, 8);

    const userDeathClock = {
      shortId: shortId,
      name: jsonData[0].user.userAnswer,
      birthdate: jsonData[1].user.userAnswer,
      jsonFile: JSON.stringify(jsonData),
      allowed: userPermission,
      createdAt: Date.now()
    };

    // Save data to the database
    const newUser = new DeathClockModel(userDeathClock);
    const saved = await newUser.save();

    if (saved) {

      
          //add deathclock id to user deathclock
          const userId = req.session.userId;
          const user = await User.findById(userId);
      
          //IF USER SIGN IN SAVE saved._id TO USER
          if(user){

              //if user.deathclock is not null then replace it with new deathclock id and delete old deathclock
              if(user.deathclock){

                  //delete old deathclock
                  await DeathClockModel.findByIdAndDelete(user.deathclock);

                  //delete old deathclock from user
                  user.deathclock = null;

            }

              user.deathclock = saved._id;
              const user_ = await user.save();

              if(!user_){

                console.log('Error saving user');
                return res.status(500).json({ error: 'Internal Server Error' });

              }else{

                  const userShortId = saved.shortId;
                  console.log('User saved');
                  return res.status(200).json({ userShortId: userShortId });

              }

          }else{

            const userShortId = saved.shortId;
            console.log('User saved');
            return res.status(200).json({ userShortId: userShortId });

          }
      

    } else {

      console.log('Error saving user');
      res.status(500).json({ error: 'Internal Server Error' });

    }
  } catch (error) {
    console.log(error);
  }

};

// Get user data from the database
exports.getUserData = async function (req, res, next) {
  try {
    // Get user ID
    const id = req.params.id;
    const user = await DeathClockModel.findOne({ shortId: id });

    if (user) {
      console.log('User found');
      res.status(200).json({ user: user });
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.log(error);
  }
};

