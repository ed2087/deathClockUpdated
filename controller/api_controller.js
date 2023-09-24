import fs from 'fs/promises';
//add model
import Question from "../model/user.js";




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

            const user = {

                  name: jsonData[0].user.userAnswer,
                  birthdate: jsonData[1].user.userAnswer,
                  jsonFile: JSON.stringify(jsonData),
                  allowed : jsonData[jsonData.length - 1].userPermision

            };

            //save data db

            const newUser = new Question(user);
            const saved = await newUser.save();

            console.log(saved);
            //we will be directed to the results page
            //temporary redirect to /
            res.redirect('/');
            
      } catch (error) {            
            console.log(error);
      }      

};
