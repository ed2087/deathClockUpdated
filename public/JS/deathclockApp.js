console.log("deathclock_app.js loaded");
//ES6


let userData = user;
let jsonData = JSON.parse(userData.jsonFile);

// get totalPoints from the json file and return value

// get totalPoints from the json file and return value
let questionsPoints = jsonData
    .filter(element => element.totalPoints)
    .map(element => element.totalPoints);

const userDetails_ = {
    userName : userData.name,
    userBirthdate : userData.birthdate,
    userShortId : userData.shortId    
};


//find jsonData jsonData[i].totalPoints key and return the value
let lifeExpectancy_negativeYears = jsonData.find((element) => {
    return element.totalPoints;
}).totalPoints; 



//  send predicted death date and time data  /deathClock//updateUserClock use fetch
const updateUserClock = async (userDetails_) => {
    //use sendJson function
   let data = await sendJson("/deathClock/updateUserClock", "POST", userDetails_);   
   data = data.data;
console.log(data);
   data =[        
        data.usersMin[0].min,
        data.usersAvg[0].avg,
        data.usersMax[0].max
   ]

   startChart(data);
};


// MESSAGE FOR  USER////////////////////////////////

const createLifestyleMessageForBmi = (bmi, num) => {


  let lifestyleMessage = "";

  switch (num) {
    case 1:
      lifestyleMessage = `Your BMI of <span class="bmi_span">${bmi}</span> indicates you are currently underweight. This may be due to high metabolism, inadequate calorie intake, or over-exercising. We recommend working with a dietitian to ensure you are meeting your nutritional needs to support a healthy, active lifestyle. Small, nutritious snacks between meals can help.`;
      break;
    case 2: 
      lifestyleMessage = `Great job maintaining a BMI of <span class="bmi_span">${bmi}</span>, which falls within the normal healthy weight range! To stay feeling your best, aim for a balanced diet high in fruits and vegetables, lean proteins and whole grains. Stay active with a combination of cardio and strength training most days of the week.`;
      break;
    case 3:
      lifestyleMessage = `Your BMI of <span class="bmi_span">${bmi}</span> falls within the overweight range. The good news is small, sustainable lifestyle changes can improve your health and wellbeing over time. Try adding more steps daily, swapping sugary drinks for water, getting 7-9 hours of sleep, and focusing on portion control as some options to get started.`;   
      break;
    case 4:
     lifestyleMessage = `With a BMI of <span class="bmi_span">${bmi}</span>, your current weight falls into obesity class I. Reaching a healthier weight can be challenging, but we're here to help. Let's collaborate with your healthcare provider to set nutrition, exercise, sleep and stress relief goals you can maintain long-term. We'll be with you each step of the way towards feeling your best.`;
      break;
    case 5:
    lifestyleMessage = `Your BMI is currently <span class="bmi_span">${bmi}</span>, which is categorized as class II obesity. The great news is that improving small habits overtime can make a big difference in your health, energy levels and quality of life. Let's work together on a lifestyle adjustment plan just for you. We'll help you identify healthy changes you can sustain long-term.`;
      break;
    case 6:
     lifestyleMessage = `Your current BMI of <span class="bmi_span">${bmi}</span> falls into the class III obesity range, indicating potential health risks. The good news is we can work together to help support positive lifestyle changes to improve your wellbeing. Let's collaborate with your healthcare provider to create reasonable nutrition, physical activity, sleep and stress relief goals you can maintain long-term while feeling your best.`;
      break; 
    default:
     lifestyleMessage = "Unable to calculate lifestyle recommendations.";
  
  }

  id_("lifestyle_Content").innerHTML = lifestyleMessage;

 
};



const ageMessage = (age) => {
  let message;

  if (age < 18) {
      message = `Embrace your youth at <span class="bmi_span">${age}</span>! Spend time with friends, explore hobbies, excel at school, and ensure adequate sleep for growth. To enhance your lifespan, focus on maintaining a balanced diet, staying physically active, and avoiding harmful habits like smoking.`;
  } else if (age >= 18 && age < 30) {
      message = `Seize the opportunities in your <span class="bmi_span">${age}s</span>! Explore travel, education, career, and relationships. Maintain balance between work, leisure, and self-care for a fulfilling life journey. Consider incorporating regular exercise, a nutritious diet, and stress management practices to promote longevity.`;
  } else if (age >= 30 && age < 50) {
      message = `In your <span class="bmi_span">${age}s</span>, share knowledge, mentor others, prioritize mental well-being, stay physically active, and consult healthcare experts for tailored health advice. Implementing a healthy lifestyle, including proper nutrition, regular exercise, and preventive healthcare measures, can contribute to a longer and healthier life.`;
  } else {
      message = `Offer wisdom at <span class="bmi_span">${age}</span>! Focus on fulfillment through part-time work, engaging hobbies, fostering social connections, and prioritizing your health and well-being. Consider incorporating activities that support mental and physical health, such as regular exercise, a balanced diet, and routine health check-ups, to enhance your overall lifespan.`;
  }

  id_("age_Content").innerHTML = message;
};





//END MESSAGE FOR  USER////////////////////////////////


const calculateHealthScore = (bmi) => {
  let healthScore = 0;

  if (bmi < 18.5) {
      healthScore = -2; // Underweight
      createLifestyleMessageForBmi(bmi, 1);
  } else if (bmi < 25) {
      healthScore = 1; // Normal weight
      createLifestyleMessageForBmi(bmi, 2);
  } else if (bmi < 30) {
      healthScore = -2; // Overweight (positive value)
      createLifestyleMessageForBmi(bmi, 3);
  } else if (bmi < 35) {
      healthScore = -3; // Obese class I (positive value)
      createLifestyleMessageForBmi(bmi, 4);
  } else if (bmi < 40) {
      healthScore = -4; // Obese class II (positive value)
      createLifestyleMessageForBmi(bmi, 5);      
  } else if (bmi >= 40) {
      healthScore = -5; // Obese class III (positive value)
      createLifestyleMessageForBmi(bmi, 6);
  } else {
      console.error("Error in calculateHealthScore function");
  }

  

  return healthScore;
};


const getBmi_HScore = () => {

  // get bmi from json by id q25
  const bmi = jsonData.find((element) => {
      return element.id === "q25";
  });

  const bmiHealthScore = calculateHealthScore(parseInt(bmi.user.userAnswer));

  return bmiHealthScore;

};



function deathCountdown(deathYear) {

  var now = new Date().getTime();

  var countDownDate = new Date();

  const getFulldeathYear = new Date().getFullYear() + deathYear;

  //we need the tick go down till the user death date
  countDownDate.setFullYear(getFulldeathYear);

  countDownDate.setHours(0, 0, 0, 0);

  var distance = countDownDate.getTime() - now;

  // Time calculations for years, months, weeks, days, hours, minutes and seconds
 

  var years = Math.floor(distance / (1000 * 60 * 60 * 24 * 365));
  var months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30.44));
  var weeks = Math.floor(distance / (1000 * 60 * 60 * 24 * 7));
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor(distance / (1000 * 60 * 60));
  var minutes = Math.floor(distance / (1000 * 60));
  var seconds = Math.floor(distance / 1000);
  var milliseconds = Math.floor(distance);



  // get 

  // Return the countdown object with formatted time
  return {
    years: years,
    months: months,
    weeks: weeks,
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    milliseconds: milliseconds,
  };

}



function calculateTime(userBirthdate) {
  

  const bmiHealthScore = getBmi_HScore();

  const averageLifeExpectancy = 70;
  const removeOraddYears = questionsPoints[0];
  const currentDate = new Date();
  const dob = new Date(userBirthdate);

  if (isNaN(dob.getTime())) {
      return "Please enter a valid date of birth.";
  }

  const timeLivedMilliseconds = currentDate.getTime() - dob.getTime();
  //we need to create something likew this for the botom paert

  if (timeLivedMilliseconds <= 0) {
      return "Congratulations, you've already surpassed the average life expectancy!";
  }

  const timeLivedSeconds = Math.floor(timeLivedMilliseconds / 1000);
  const timeLivedMinutes = Math.floor(timeLivedSeconds / 60);
  const timeLivedHours = Math.floor(timeLivedMinutes / 60);
  const timeLivedDays = Math.floor(timeLivedHours / 24);
  const timeLivedWeeks = Math.floor(timeLivedDays / 7);
  const timeLivedMonths = Math.floor(timeLivedDays / 30.44); // Average month length
  const timeLivedYears = Math.floor(timeLivedMonths / 12);  

 
  let totalLifeExpectancy_ = 0;

  if (averageLifeExpectancy > timeLivedYears) {
    totalLifeExpectancy_ = averageLifeExpectancy - timeLivedYears + removeOraddYears + bmiHealthScore;
  } else {
    totalLifeExpectancy_ = timeLivedYears - averageLifeExpectancy + removeOraddYears + bmiHealthScore;
  }

  
  if (totalLifeExpectancy_ < 0) {
    //get 10% of his life in timeLivedYears
    totalLifeExpectancy_ = parseInt(timeLivedYears * 0.3)
  }

  // Ensure totalLifeExpectancy_ is not negative
  totalLifeExpectancy_ = Math.max(totalLifeExpectancy_, 0);  
  
  // Calculate the future date when the user is expected to reach their remaining life expectancy
  
    const timeleft = deathCountdown(totalLifeExpectancy_);

  const yearsLeftYears = timeleft.years;
  const yearsLeftMonths = timeleft.months;
  const yearsLeftWeeks = timeleft.weeks;
  const yearsLeftDays = timeleft.days;
  const yearsLeftHours = timeleft.hours;
  const yearsLeftMinutes = timeleft.minutes;
  const yearsLeftSeconds = timeleft.seconds;


  let yearDeath = currentDate.getFullYear() + yearsLeftYears;
  let monthDeath = currentDate.getMonth() + yearsLeftMonths;
  let dayDeath = currentDate.getDate() + yearsLeftDays
      monthDeath = monthDeath % 12;
      dayDeath = dayDeath % 30;
      
  // Adjust month and year if dayDeath exceeds the days in the current month
  const daysInMonth = new Date(yearDeath, monthDeath, 0).getDate();
  if (dayDeath > daysInMonth) {
      dayDeath -= daysInMonth;
      monthDeath++;
      if (monthDeath > 11) {
          monthDeath = 0;
          yearDeath++;
      }
  }

  const expectedFutureDate = {
      year: yearDeath,
      month: monthDeath + 1, // Add 1 to month since it's zero-based
      day: dayDeath,
  };


  return {
      timeLived: {
          years: timeLivedYears,
          months: timeLivedMonths,
          weeks: timeLivedWeeks,
          days: timeLivedDays,
          hours: timeLivedHours,
          minutes: timeLivedMinutes,
          seconds: timeLivedSeconds,
      },
      remainingTime: {
          years: yearsLeftYears,
          months: yearsLeftMonths,
          weeks: yearsLeftWeeks,
          days: yearsLeftDays,
          hours: yearsLeftHours,
          minutes: yearsLeftMinutes,
          seconds: yearsLeftSeconds,
      },
      expectedFutureDate: {
          year: expectedFutureDate.year,
          month: expectedFutureDate.month, // Add 1 to month since it's zero-based
          day: expectedFutureDate.day,
      },
  };
}



const addhtmlInfo_todeathclock = (userDetails_) => {  

  id_("yearsLeft").innerHTML = userDetails_.remainingTime.years.toLocaleString();
  id_("monthsLeft").innerHTML = userDetails_.remainingTime.months.toLocaleString();
  id_("weeksLeft").innerHTML = userDetails_.remainingTime.weeks.toLocaleString();
  id_("daysLeft").innerHTML = userDetails_.remainingTime.days.toLocaleString();
  id_("hrsLeft").innerHTML = userDetails_.remainingTime.hours.toLocaleString();
  id_("minLeft").innerHTML = userDetails_.remainingTime.minutes.toLocaleString();
  id_("secLeft").innerHTML = userDetails_.remainingTime.seconds.toLocaleString();

};

const addhtmlInfo_timeLived = (userDetails_) => {


  id_("yearsLived").innerHTML = userDetails_.timeLived.years.toLocaleString();
  id_("monthsLived").innerHTML = userDetails_.timeLived.months.toLocaleString();
  id_("weeksLived").innerHTML = userDetails_.timeLived.weeks.toLocaleString();
  id_("daysLived").innerHTML = userDetails_.timeLived.days.toLocaleString();
  id_("hrsLived").innerHTML = userDetails_.timeLived.hours.toLocaleString();
  id_("minLived").innerHTML = userDetails_.timeLived.minutes.toLocaleString();
  id_("secLived").innerHTML = userDetails_.timeLived.seconds.toLocaleString();

};



// Function to update and display the time every second
let lock = false;
function updateTime() {
    const userDetails = {
        userBirthdate: userDetails_.userBirthdate, // Replace with the person's date of birth
        lifeExpectancy: userDetails_.lifeExpectancy, // Replace with the person's life expectancy in years
    };
    
    const result = calculateTime(userDetails.userBirthdate, userDetails.lifeExpectancy);    
    const expectedFutureDate = result.expectedFutureDate;

    //build a package to send to the server
    const userClock = {
        shortId: userDetails_.userShortId,
        predictedDeathYear: result.remainingTime.years,
        yearsLeft: result.remainingTime.years,
        monthsLeft: result.remainingTime.months,
        weeksLeft: result.remainingTime.weeks,
        daysLeft: result.remainingTime.days,
        hoursLeft: result.remainingTime.hours,  
        minutesLeft: result.remainingTime.minutes,
        secondsLeft: result.remainingTime.seconds,
        expectedFutureDate: expectedFutureDate,
        //
    };   
   
    

    //send the package to the server
    if(!lock){
        updateUserClock(userClock);

        //get users age just the year 
        const age = new Date().getFullYear() - new Date(userDetails_.userBirthdate).getFullYear();
        ageMessage(age);


        lock = true;
    }

    // send data to function to update html
    addhtmlInfo_todeathclock(result);
    addhtmlInfo_timeLived(result);

    // add deathdate to html
    id_("deathYear").textContent = `${expectedFutureDate.year}-${expectedFutureDate.month}-${expectedFutureDate.day}`;

};


// onload
window.onload = () =>{

    //add loadingMold_dotts to all elements with class="loading_dotts"
    const loading_dotts = queryAll_(".loading_dotts");
    loading_dotts.forEach(element => {
        element.innerHTML = loadingMold_dotts;
    });

    // set a timer then load function
    setTimeout(() => {

      updateTime();
      setInterval(updateTime, 1000);

    }, 2000);

};






// chart.js

function startChart(data) {
    const ctx = document.getElementById("chart").getContext("2d");
  
    // Define custom colors for the dark theme
    const darkColors = ["#4CAF50", "#FF9800", "#2196F3"];
  
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Min Average Age", "Average Age", "Max Average Age"],
        datasets: [
          {
            label: "Users Death Clock Predictions",
            data: data,
            borderColor: darkColors,
            backgroundColor: darkColors.map(color => color + "40"), // Add transparency to the background color
            pointBackgroundColor: darkColors,
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Users Death Clock Predictions",
          fontColor: "#FFF", // Title text color
        },
        legend: {
          labels: {
            fontColor: "#FFF", // Legend text color
          },
        },
        scales: {
          xAxes: [{
            ticks: {
              fontColor: "#FFF", // X-axis label color
            },
          }],
          yAxes: [{
            ticks: {
              fontColor: "#FFF", // Y-axis label color
            },
          }],
        },
      },
    });

    // remove #gridLoading from html
    id_("gridLoading").remove();
    

};
  


// addd user info to cards