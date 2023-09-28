console.log("deathclock_app.js loaded");
//ES6


let userData = user;
let jsonData = JSON.parse(userData.jsonFile);

const userDetails_ = {
    userName : userData.name,
    userBirthdate : userData.birthdate,
    userShortId : userData.shortId,
    lifeExpectancy : jsonData[20].totalPoints
};


//  send predicted death date and time data  /deathClock//updateUserClock use fetch
const updateUserClock = async (userDetails_) => {
    //use sendJson function
   let data = await sendJson("/deathClock/updateUserClock", "POST", userDetails_);   
   data = data.data;

   data =[
        data.usersAvg[0].avg,
        data.usersMax[0].max,
        data.usersMin[0].min
   ]

   startChart(data);
};

function calculateTime(userBirthdate) {

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

    const remainingMilliseconds = dob.getTime() + (averageLifeExpectancy * 365 * 24 * 60 * 60 * 1000) - currentDate.getTime();
    const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingDays = Math.floor(remainingHours / 24);
    const remainingWeeks = Math.floor(remainingDays / 7);
    const remainingMonths = Math.floor(remainingDays / 30.44); // Average month length
    const remainingYears = Math.floor(remainingMonths / 12);

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

function startChart (data) {
    console.log(data);
    const ctx = document.getElementById("chart").getContext("2d");

    const chart = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels: ["Average Age", "Max Age", "Min Age"],
        datasets: [
          {
            label: "Users",
            data: data,
            backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f"],
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Users Death Clock Predictions",
        },
      },
    });

}