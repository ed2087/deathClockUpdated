console.log('deathClock_questions.js loaded');

const getQuestionsJson = async () => {
    const data = await fetch_('/questionsAPI', 'GET');
    return data.questions;
};

const addToJson = (json, id, value) => {
    const foundQuestion = json.find((question) => question.id === id);

    if (foundQuestion) {
        foundQuestion.user = {
            userAnswer: value,
            points: 0
        };
    }
};

/////////////////////////////////////////
//value checks
/////////////////////////////////////////
// constants
const Q1_MAX_LENGTH = 10;
const SPECIAL_CHARACTERS = ['{', '}', '[', ']', '(', ')', '<', '>', '/', '\\', '|', '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '+', '=', '?', ':', ';', '"', '\''];

// function
const checkQ1 = (e) => {
    e.preventDefault();
    let q1 = id_('q1');
    let q1Value = q1.value;

    // validate length
    if (q1Value.length > Q1_MAX_LENGTH) {
        q1.value = q1Value.slice(0, Q1_MAX_LENGTH);
        q1Value = q1.value; // Update q1Value after truncating
    }

    // remove spaces and special characters
    const sanitizedQ1Value = sanitizeInput(q1Value);

    // update q1 input
    q1.value = sanitizedQ1Value;
    q1.style.color = 'white';
}


function calculateBMIMetric(weight, heightInMeters) {
    return weight / Math.pow(heightInMeters, 2);
}

// Function for standard BMI calculation
function calculateBMIStandard(weight, heightInInches) {
    return (weight * 703) / Math.pow(heightInInches, 2);
}

// Function to convert feet and inches to inches
function convertToInches(feet, inches) {
    return (feet * 12) + inches;
}

// Main function to determine which calculation to use based on the weight type
function calculateBMI_() {
    const weightInput = document.getElementById('q23_');
    const heightInput = document.getElementById('q24_');

    const weight = parseFloat(weightInput.value);
    const heightValue = heightInput.value.split('.'); // Splitting the value into feet and inches
    const feet = parseFloat(heightValue[0]);
    const inches = parseFloat(heightValue[1] || 0); // If no inches provided, default to 0

    if (isNaN(weight) || isNaN(feet) || isNaN(inches) || weight <= 0 || feet <= 0 || inches < 0) {
        return 'Invalid Input';
    }

    const weightType = "standard";
    let bmi;
    

    if (weightType === 'metric') {
        // Convert feet and inches to meters
        const totalInches = convertToInches(feet, inches);
        const heightMeters = totalInches * 0.0254;
    
        // Convert pounds to kilograms
        const weightKg = weight * 0.453592; 
    
        bmi = calculateBMIMetric(weightKg, heightMeters);
        
    } else {
        const heightInInches = convertToInches(feet, inches); // Convert feet and inches to total inches for standard calculation
        bmi = calculateBMIStandard(weight, heightInInches);
    }

    return bmi.toFixed(2); // Just the BMI value
}


/////////////////////////////////////////
//convert standard to metric
/////////////////////////////////////////
const convertToMetric = (e) => {
    console.log('convertToMetric()');
    e.preventDefault();

    let weightInput = id_('q23_');
    let heightInput = id_('q24_');

    let weight = parseFloat(weightInput.value);
    let heightValue = heightInput.value.split('.'); // Splitting the value into feet and inches
    let feet = parseFloat(heightValue[0]);
    let inches = parseFloat(heightValue[1] || 0); // If no inches provided, default to 0

    if (isNaN(inches) || weight <= 0 || feet <= 0 || inches < 0) {
        return;
    }

    // Convert feet and inches to meters
    const totalInches = convertToInches(feet, inches);
    let heightMeters = totalInches * 0.0254;

    // Convert pounds to kilograms
    let weightKg = weight * 0.453592;


    //check if its empty or NaN add 0.0
    if (isNaN(weightKg)) {
        weightKg = 0.0;
    }

    if (isNaN(heightMeters)) {
        heightMeters = 0.0;
    }


    id_("metric_height").innerHTML = `${heightMeters.toFixed(2)} M`;
    id_("metric_weight").innerHTML = `${weightKg.toFixed(2)} KG`;
    
};

// listen for q23_ and q24_ on change event
if (id_('q23_')) {
    id_('q23_').addEventListener('change', convertToMetric);
}

if (id_('q24_')) {
    id_('q24_').addEventListener('change', convertToMetric);
}




// helper function
const sanitizeInput = (input) => {
    let sanitizedInput = input.trim(); // remove spaces from the beginning and end

    // remove special characters
    for (let i = 0; i < SPECIAL_CHARACTERS.length; i++) {
        const specialCharacter = SPECIAL_CHARACTERS[i];
        sanitizedInput = sanitizedInput.split(specialCharacter).join('');
    }

    return sanitizedInput;
}


//listen for q1 on keyup event
const q1 = id_('q1');
if (q1) {
    q1.addEventListener('keyup', checkQ1);
}


const checkAll = async (e) => {
    e.preventDefault();

    console.log('checkAll()');

    const inputs = queryAll_('input');
    const selects = queryAll_('select');

    const inputs_ = [...inputs];
    const selects_ = [...selects];

    const checkValues = inputs_.every((value) => value.name === 'email' || value.value !== '');

    if (!checkValues) {
        for (let i = 0; i < inputs_.length; i++) {
            if (inputs_[i].value === '') {
                inputs_[i].scrollIntoView();
                break;
            }
        }
        return;
    }

    const selectValuesArr = selects_.map((value) => value.value);

    let json = await getQuestionsJson();

    addToJson(json, 'q1', id_('q1').value);
    addToJson(json, 'q2', id_('q2').value);

    let addPoints = 0;

    for (let i = 0; i < selects_.length; i++) {
        if (selects_[i] && selects_[i].name) {
            for (let j = 0; j < json.length; j++) {
                if (json[j].id !== 23 && selects_[i].id.toLowerCase() === json[j].id.toLowerCase()) {
                    for (let k = 0; k < json[j].answer_options.length; k++) {
                        const userAnswer = selectValuesArr[i].trim().toLowerCase();
                        const option = json[j].answer_options[k].option.trim().toLowerCase();

                        if (userAnswer === option) {
                            addPoints += json[j].answer_options[k].scores[0];
                            json[j].user = {
                                userAnswer: selectValuesArr[i],
                                points: json[j].answer_options[k].scores[0]
                            };
                        }
                    }
                }
            }
        }
    }

    const weightInput = id_('q23_').value;
    const heightInput = id_('q24_').value; 

    addToJson(json, 'q23', weightInput);
    addToJson(json, 'q24', heightInput);

    const bmi = calculateBMI_();
    addToJson(json, 'q25', bmi);

    const userPermission = {
        id: 'userPermission',
        userPermission: id_('q_permission').value
    };

    const csrf = {
        _csrf: id_('csrf').value
    };

    const totalPoints = {
        totalPoints: addPoints
    };

    json.push(totalPoints, userPermission, csrf);
    
    // Send json to /questionsAPI
    const data = await sendJson('/questionsAPI', 'POST', json);

    if (data) {
        const userShortId = data.userShortId;
        window.location.href = '/deathClock/results/' + userShortId;
    } else {
        console.log('Error sending json');
    }

    const submitBtn = id_('submit_btn');
    submitBtn.disabled = true;
};

const healthForm = id_('healthForm');
if (healthForm) {
    healthForm.addEventListener('submit', checkAll);
}
