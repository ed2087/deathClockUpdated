console.log('deathClock_questions.js loaded');



// get json from /questionsAPI

const getQuestions_json = async () => {
    const data = await fetch_('/questionsAPI', 'GET');  
    return data.questions;
};


//cheak all inputs/select options and radio for value on submit
const checkAll = async () => {

    console.log('checkAll()');

    //get all inputs
    const inputs = queryAll_('input');
    const selects = queryAll_('select');
    const radios = queryAll_('input[type="radio"]');
    const textareas = queryAll_('textarea');

    //get all values
    const values = [...inputs, ...selects, ...radios, ...textareas];

    //check if all values are filled
    const checkValues = values.every((value) => value.value !== "");


    //if all values are filled
    if(!checkValues){
        alert('Please fill out all fields');
        return;
    }

    //get all values in an array
    const valuesArr = values.map((value) => value.value);

    //if all values are filled
    let json = await getQuestions_json();

    console.log(json);

    //add name and birthdate to json.user and add points, userAnswer points will be 0  and answer will be the users answer

        json[0].user = {
            userAnswer: valuesArr[0],
            points: 0
        };

        json[1].user = {
            userAnswer: valuesArr[1],
            points: 0
        };

    //check json answer_options array object for correct answer if valuesArr[i] === answer_options[i].option
    let addPoints = 0;
    for(let i = 0; i < valuesArr.length - 1; i++) {
        
       //loop true json[i].answer_options[i].option and check if valuesArr[i] === json[i].answer_options[i].option
         for(let j = 0; j < json[i].answer_options.length; j++) {
            
            
            if(valuesArr[i] === json[i].answer_options[j].option) {

                //check what the scores is for each answer skip the first 2 questions and add userAnswer and points to json.user
                
                if(i > 1) {
                    json[i].user = {
                        userAnswer: valuesArr[i],
                        points: json[i].answer_options[j].scores[0]
                    };

                    //add points to addPoints
                    addPoints += json[i].answer_options[j].scores[0];
                }

            }

        }

    }

    //create a new object for user permision to be added to graveyard
    const userPermision = {
        userPermision: valuesArr[valuesArr.length - 1]
    };

    //create a new ocject called totalPoints and add it to json
    const totalPoints = {
        totalPoints: addPoints
    };

    json.push(totalPoints, userPermision);


    //send json to /questionsAPI
    const data = await sendJson('/questionsAPI', 'POST', json);

    console.log(data);

};


//check when user clicks submit_btn
id_('submit_btn').addEventListener('click', () => checkAll());

