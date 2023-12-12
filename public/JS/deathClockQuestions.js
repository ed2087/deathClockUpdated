console.log('deathClock_questions.js loaded');



// get json from /questionsAPI

const getQuestions_json = async () => {
    const data = await fetch_('/questionsAPI', 'GET');  
    return data.questions;
};





//cheak all inputs/select options and radio for value on submit


const addtojson = async (json,id,value) => {
    for (let i = 0; i < json.length; i++) {
        if (json[i].id === id) {
            json[i].user = {
                userAnswer: value,
                points: 0
            };
        }
    }
};

function calculateBMI(weightPounds, heightFeet) {
    // Check if the inputs are valid numbers
    if (isNaN(weightPounds) || isNaN(heightFeet)) {
      return null; // Return null for invalid inputs
    }
  
    // Calculate BMI
    const bmi = (weightPounds / (heightFeet ** 2)) * 703;
  
    // Round BMI to two decimal places
    const roundedBMI = Math.round(bmi * 100) / 100;
  
    return roundedBMI;
}



function calculateBMI(weight_lbs, height_feet) {
 // Convert the weight from lbs to kg
 var weight_kg = weight_lbs * 0.453592;

 // Convert the height from feet to meters
 var height_meters = height_feet * 0.3048;

 // Calculate the BMI
 var bmi = weight_kg / Math.pow(height_meters, 2);

 return bmi;
}

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
    if(!inputs_){
        for(let i = 0; i < inputs_.length; i++) {
            if(inputs_[i].value === "") {
                inputs_[i].scrollIntoView();
                break;
            }
        } 
        return;
    }    

    //get all inputs_,selects_ in an array
    const selectValuesArr = selects_.map((value) => value.value);
    
   
    //if all values are filled
    let json = await getQuestions_json();
    
    //add userAnswer to json
    addtojson(json,'q1',id_("q1").value);
    addtojson(json,'q2',id_("q2").value);       

        

    //check json answer_options array object for correct answer if valuesArr[i] === answer_options[i].option
    let addPoints = 0;

   
    for (let i = 0; i < selects_.length; i++) {

        if (selects_[i] && selects_[i].name) {

            for (let j = 0; j < json.length; j++) {


                
                // if id is 23 skip it
                if (json[j].id === 23) {

                    continue;

                }else{

                    if (selects_[i].id.toLowerCase() === json[j].id.toLowerCase()) {

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
                        
                    }//END

                }

            }

        }

    };


    // get weight and height from inputs
    const weightInput = id_('q23_').value;
    const weightMetric = id_('q23').value;
    const heightInput = id_('q24_').value;
    const heightMetric = id_('q24').value;

    let weightPounds = 0;
    let heightFeet = 0;

    // convert weight to pounds
    // convert weight to pounds
    if (weightMetric === "kg") {
        weightPounds = parseFloat(weightInput) * 2.20462;
    } else if (weightMetric === "lbs") {
        weightPounds = parseFloat(weightInput);
    } else {
        console.log("Invalid weight unit");
    }
    
    if (heightMetric === "cm") {
        heightFeet = parseFloat(heightInput) * 0.0328084;
    } else if (heightMetric === "ft") {
        heightFeet = parseFloat(heightInput);
    } else {
        console.log("Invalid height unit");
    }

    // add weight and height to JSON
    addtojson(json, 'q23', weightPounds);
    addtojson(json, 'q24', heightFeet);

    // get BMI
    const bmi = calculateBMI(weightPounds, heightFeet);
    addtojson(json, 'q25', bmi);



    //create a new object for user permision to be added to graveyard
    const userPermision = {
        //id q_permission
        userPermision: id_('q_permission').value
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





