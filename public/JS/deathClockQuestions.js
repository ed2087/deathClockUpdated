console.log('deathClock_questions.js loaded');



// get json from /questionsAPI

const getQuestions_json = async () => {
    const data = await fetch_('/questionsAPI', 'GET');  
    return data.questions;
};


//cheak all inputs/select options and radio for value on submit
const checkAll = async (e) => {   
    

    //prevent default
    e.preventDefault();

    console.log('checkAll()');

    //get all inputs
    const inputs = queryAll_('input');
    const selects = queryAll_('select');   

    const inputs_ = [...inputs];

    const selects_ = [...selects];



    //check if all values are filled exept email
    const checkValues = inputs_.every((value) => {
        if (value.name === 'email') {
            return true; // Skip the email input
        }
        return value.value !== '';
    });

    //if all values are filled
    if(!checkValues){
        alert('Please fill out all fields');
        return;
    }    

    //get all inputs_,selects_ in an array
    const selectValuesArr = selects_.map((value) => value.value);
    
   
    //if all values are filled
    let json = await getQuestions_json();

    //add name and birthdate to json.user and add points, userAnswer points will be 0  and answer will be the users answer

        json[0].user = {
            userAnswer: id_("q1").value,
            points: 0
        };

        json[1].user = {
            userAnswer: id_("q2").value,
            points: 0
        };

    //check json answer_options array object for correct answer if valuesArr[i] === answer_options[i].option
    let addPoints = 0;

    for (let i = 0; i < selects_.length; i++) {

        if (selects_[i] && selects_[i].name) {

            for (let j = 0; j < json.length; j++) {

                
                if (selects_[i].name.toLowerCase() === json[j].eleName.toLowerCase()) {

                    for (let k = 0; k < json[j].answer_options.length; k++) {
                        const userAnswer = selectValuesArr[i].trim().toLowerCase();
                        const option = json[j].answer_options[k].option.trim().toLowerCase();

                        if (userAnswer === option) {
                            //add points to addPoints
                            addPoints += json[j].answer_options[k].scores[0];

                            //add userAnswer to json
                            json[j].user = {
                                userAnswer: selectValuesArr[i],
                                points: json[j].answer_options[k].scores[0]
                            };
                        }

                    }

                }

            }

        }

    };

    //create a new object for user permision to be added to graveyard
    const userPermision = {
        //last one inn selectValuesArr
        userPermision: selectValuesArr[selectValuesArr.length - 1]
    };

    const csrf = {
        _csrf: id_('csrf').value
    };

    //create a new ocject called totalPoints and add it to json
    const totalPoints = {
        totalPoints: addPoints
    };

    json.push(totalPoints, userPermision, csrf);

    
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
const healthForm = id_('healthForm');
if(healthForm) {
    healthForm.addEventListener('submit', checkAll);
}





