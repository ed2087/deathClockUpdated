import fs from 'fs/promises';
//add model
import Question from "../model/user.js";
//generate short id for user
import { v4 as uuidv4 } from 'uuid';




export const questionsAPI = async (req, res, next) => {

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



//resive json from deathClock_questions.js
export const getApiJson = async (req, res, next) => {

      try {

            const jsonData = req.body;        

            //add user id make it short
            const shortId = uuidv4().slice(0, 8);

            const user = {

                  shortId: shortId,
                  name: jsonData[0].user.userAnswer,
                  birthdate: jsonData[1].user.userAnswer,
                  jsonFile: JSON.stringify(jsonData),
                  email: jsonData[jsonData.length - 1].userEmail,
                  allowed : jsonData[jsonData.length - 2].userPermision

            };            

            //save data db
            const newUser = new Question(user);
            const saved = await newUser.save();

            //check if saved is defined
            if (saved) {

                  const userShortId = saved.shortId;

                  //send json to client
                  console.log('user saved');
                  res.status(200).json({userShortId: userShortId});

            } else {

                  //send error message
                  console.log('error saving user');

            }
            
            
      } catch (error) {            
            console.log(error);
      }      

};



//get user data from db
export const getUserData = async (req, res, next) => {

      try {

            //get user id
            const id = req.params.id;

            console.log(id, "id");
            return
            //find user
            const user = await Question.findOne({shortId: id});

            //check if user is defined
            if (user) {

                  //send json to client
                  console.log('user found');
                  res.status(200).json({user: user});

            } else {

                  //send error message
                  console.log('user not found');

            }
            
            
      } catch (error) {            
            console.log(error);
      }      

};




//openai
export const openai = async (req, res, next) => {

      const { name, timeData } = req.query;
      const timeData_ = JSON.parse(timeData);
      const timeLived = timeData_.timeLived;
      const remainingTime = timeData_.remainingTime;


      // Create a story that tells the user how they will pass away using the provided time data
      const prompt = `
            Create a story that tells ${name} how they will pass away in ${remainingTime.years} years, ${remainingTime.months} months, ${remainingTime.days} days, ${remainingTime.hours} hours, ${remainingTime.minutes} minutes, ${remainingTime.seconds} seconds. ${name} will meet their end through:
      `;
  
      try {

              // Generate the story
              const story = await storyGenerator(prompt);
        
              // Send the story as the API response
              res.status(200).json({ story });

          
      } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'An error occurred while generating the story.' });
      }
  };
