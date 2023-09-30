console.log('deathClock_questions.js loaded');



// get json from /questionsAPI

const getQuestions_json = async () => {
    const data = await fetch_('/questionsAPI', 'GET');  
    return data.questions;
};


//cheak all inputs/select options and radio for value on submit
const checkAll = async (e) => {   
    

    //prevent default
    //e.preventDefault();

    console.log('checkAll()');

    //get all inputs
    const inputs = queryAll_('input');
    const selects = queryAll_('select');
    const radios = queryAll_('input[type="radio"]');
    const textareas = queryAll_('textarea');    

    const inputs_ = [...inputs];

    const selects_ = [...selects];



    //check if all values are filled
    const checkValues = inputs_.every((input) => input.value !== '') && selects_.every((select) => select.value !== '');


    //if all values are filled
    if(!checkValues){
        alert('Please fill out all fields');
        return;
    }
    

    //get all inputs_,selects_ in an array
    const selectValuesArr = selects_.map((value) => value.value);
    const inputValuesArr = inputs_.map((value) => value.value);

    // console.log({
    //     selectValuesArr,
    //     inputValuesArr
    // });
    
   
    //if all values are filled
    let json = await getQuestions_json();

    //add name and birthdate to json.user and add points, userAnswer points will be 0  and answer will be the users answer

        json[0].user = {
            userAnswer: inputValuesArr[0],
            points: 0
        };

        json[1].user = {
            userAnswer: inputValuesArr[1],
            points: 0
        };

    //check json answer_options array object for correct answer if valuesArr[i] === answer_options[i].option
    let addPoints = 0;
    for (let i = 0; i < selectValuesArr.length + 1; i++) {
        for (let j = 0; j < json[i].answer_options.length; j++) {
            const userAnswer = selectValuesArr[i - 2].trim().toLowerCase();
            const option = json[i].answer_options[j].option.trim().toLowerCase();            
    
            if (userAnswer === option) {

                //add points to addPoints
                addPoints += json[i].answer_options[j].scores[0];

                //add userAnswer to json
                json[i].user = {
                    userAnswer: selectValuesArr[i - 3],
                    points: json[i].answer_options[j].scores[0]
                };
                
            }
        }
    };

    //create a new object for user permision to be added to graveyard
    const userPermision = {
        //last one inn selectValuesArr
        userPermision: selectValuesArr[selectValuesArr.length - 1]
    };

    //users email 
    const userEmail = {
        userEmail: inputValuesArr[2]
    };

    //create a new ocject called totalPoints and add it to json
    const totalPoints = {
        totalPoints: addPoints
    };

    json.push(totalPoints, userPermision, userEmail);

    console.log(json);

    //send json to /questionsAPI
    const data = await sendJson('/questionsAPI', 'POST', json);

    //check if data is defined
    if(data) {

        //get userShortId from data
        const userShortId = data.userShortId;
        //redirect to /deathclock
        window.location.href = '/deathClock/results/' + userShortId;
    } else {
        console.log('error sending json');
    }


    //disable submit button
    const submitBtn = id_('submit_btn');
    submitBtn.disabled = true;

};


//check when form is submitted #healthForm
const healthForm = id_('submit_btn');
if(healthForm) {
    healthForm.addEventListener('click', checkAll);
}





