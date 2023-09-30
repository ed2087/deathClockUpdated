console.log("deathclock_app.js loaded");
//ES6


let userData = user;
let jsonData = JSON.parse(userData.jsonFile);

const userDetails_ = {
    userName : userData.name,
    userBirthdate : userData.birthdate,
    userShortId : userData.shortId,
};

console.log({
    userData,
    jsonData,
})

//find jsonData jsonData[i].totalPoints key and return the value
let lifeExpectancy_negativeYears = jsonData.find((element) => {
    return element.totalPoints;
}).totalPoints; 



//  send predicted death date and time data  /deathClock//updateUserClock use fetch
const updateUserClock = async (userDetails_) => {
    //use sendJson function
   let data = await sendJson("/deathClock/updateUserClock", "POST", userDetails_);   
   data = data.data;

   data =[        
        data.usersMin[0].min,
        data.usersAvg[0].avg,
        data.usersMax[0].max
   ]

   startChart(data);
};

function calculateTime(userBirthdate) {

    //we have to take in to account lifeExpectancy_negativeYears this 

    const averageLifeExpectancy = 70; // Replace with the average life expectancy in years
    const currentDate = new Date();
    const dob = new Date(userBirthdate);

    if (isNaN(dob.getTime())) {
        return "Please enter a valid date of birth.";
    }

    const timeLivedMilliseconds = currentDate.getTime() - dob.getTime();

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

    // Calculate remaining time for each unit based on adjusted life expectancy
    const totalLifeExpectancy = averageLifeExpectancy + lifeExpectancy_negativeYears;
    
    const remainingYears = Math.floor(totalLifeExpectancy - (timeLivedMonths / 12));
    const remainingMonths = Math.floor((totalLifeExpectancy * 12) - timeLivedMonths);
    const remainingWeeks = Math.floor((totalLifeExpectancy * 52) - timeLivedWeeks);
    const remainingDays = Math.floor((totalLifeExpectancy * 365) - timeLivedDays);
    const remainingHours = Math.floor((totalLifeExpectancy * 365 * 24) - timeLivedHours);
    const remainingMinutes = Math.floor((totalLifeExpectancy * 365 * 24 * 60) - timeLivedMinutes);
    const remainingSeconds = Math.floor((totalLifeExpectancy * 365 * 24 * 60 * 60) - timeLivedSeconds);

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
            years: remainingYears,
            months: remainingMonths,
            weeks: remainingWeeks,
            days: remainingDays,
            hours: remainingHours,
            minutes: remainingMinutes,
            seconds: remainingSeconds,
        },
        
    };

    

};


// Function to update and display the time every second
let lock = false;
function updateTime() {
    const userDetails = {
        userBirthdate: userDetails_.userBirthdate, // Replace with the person's date of birth
        lifeExpectancy: userDetails_.lifeExpectancy, // Replace with the person's life expectancy in years
    };
    
    const result = calculateTime(userDetails.userBirthdate, userDetails.lifeExpectancy);    

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
    };
   

    //send the package to the server
    if(!lock){
        updateUserClock(userClock);
        lock = true;
    }
    
    // Update HTML elements
    document.getElementById("timeLived").textContent = `${result.timeLived.years} years, ${result.timeLived.months.toLocaleString()} months, ${result.timeLived.weeks.toLocaleString()} weeks, ${result.timeLived.days.toLocaleString()} days, ${result.timeLived.hours.toLocaleString()} hours, ${result.timeLived.minutes.toLocaleString()} minutes, ${result.timeLived.seconds.toLocaleString()} seconds`;
    document.getElementById("remainingTime").textContent = `${result.remainingTime.years} years, ${result.remainingTime.months.toLocaleString()} months, ${result.remainingTime.days.toLocaleString()} days, ${result.remainingTime.hours.toLocaleString()} hours, ${result.remainingTime.minutes.toLocaleString()} minutes, ${result.remainingTime.seconds.toLocaleString()} seconds left`;
    
}

// Call the updateTime function every second
setInterval(updateTime, 1000);

// Call the updateTime function immediately to display the initial values
updateTime();





// chart.js

function startChart(data) {
    const ctx = document.getElementById("chart").getContext("2d");
  
    // Define custom colors for the dark theme
    const darkColors = ["#4CAF50", "#FF9800", "#2196F3"];
  
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Min Age", "Average Age", "Max Age"],
        datasets: [
          {
            label: "Years left to live",
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
  }
  