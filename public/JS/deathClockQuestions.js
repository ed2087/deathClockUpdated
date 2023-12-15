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

function breakApartDecimal(decimalNumber) {
    const integerPart = Math.floor(decimalNumber);
    const fractionalPart = Math.round((decimalNumber - integerPart) * 100);
    return { integerPart, fractionalPart };
}

function calculateBMI(weight_lbs, height_feet) {
    console.log({ weight: weight_lbs, height: height_feet });

    if (height_feet % 1 !== 0) {
        const { integerPart, fractionalPart } = breakApartDecimal(height_feet);

        const height_inches = integerPart * 12 + fractionalPart;
        const height_meters = height_inches * 0.0254;

        const weight_kg = weight_lbs * 0.453592;
        const bmi = weight_kg / Math.pow(height_meters, 2);
        
        return bmi;
    }

    const height_inches = height_feet * 12;
    const height_meters = height_inches * 0.0254;

    const weight_kg = weight_lbs * 0.453592;
    const bmi = weight_kg / Math.pow(height_meters, 2);
    
    return bmi;
}

/////////////////////////////////////////
//value checks
/////////////////////////////////////////
// constants
const Q1_MAX_LENGTH = 10;
const SPECIAL_CHARACTERS = ['{', '}', '[', ']', '(', ')', '<', '>', '/', '\\', '|', '~', '`', '!', '@', '#', '$', '%', '^', '&', '*', '+', '=', '?', ':', ';', '"', '\''];

// function
const checkQ1 = (e) => {
    e.preventDefault();
    const q1 = id_('q1');
    const q1Value = q1.value;

    // validate length
    if (q1Value.length > Q1_MAX_LENGTH) q1.value = q1Value.slice(0, Q1_MAX_LENGTH);

    // remove spaces and special characters
    const sanitizedQ1Value = sanitizeInput(q1Value);

    // update q1 input
    q1.value = sanitizedQ1Value;
    q1.style.color = 'white';
}

// helper function
const sanitizeInput = (input) => {
    let sanitizedInput = input.trim(); // remove spaces from the beginning and end

    // remove special characters
    for (let i = 0; i < SPECIAL_CHARACTERS.length; i++) {
        const specialCharacter = SPECIAL_CHARACTERS[i];
        sanitizedInput = sanitizedInput.replace(new RegExp(specialCharacter, 'g'), '');
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
    const weightMetric = id_('q23').value;
    const heightInput = id_('q24_').value;
    const heightMetric = id_('q24').value;

    let weightPounds = 0;
    let heightFeet = 0;

    if (weightMetric === 'kg') {
        weightPounds = parseFloat(weightInput) * 2.20462;
    } else if (weightMetric === 'lbs') {
        weightPounds = parseFloat(weightInput);
    } else {
        console.log('Invalid weight unit');
    }

    if (heightMetric === 'cm') {
        heightFeet = parseFloat(heightInput) * 0.0328084;
    } else if (heightMetric === 'ft') {
        heightFeet = parseFloat(heightInput);
    } else {
        console.log('Invalid height unit');
    }

    addToJson(json, 'q23', weightPounds);
    addToJson(json, 'q24', heightFeet);

    const bmi = calculateBMI(weightPounds, heightFeet);
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
    console.log(json);
        
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
