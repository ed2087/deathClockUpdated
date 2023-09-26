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


console.log(jsonData);

function calculateTime(userBirthdate) {
    const currentDate = new Date();
    const dob = new Date(userBirthdate);
    const averageLifeExpectancy = 70; // Average life expectancy in years

    if (isNaN(dob.getTime())) {
        return "Please enter a valid date of birth.";
    }

    const timeLivedMilliseconds = currentDate.getTime() - dob.getTime();
    const remainingMilliseconds = dob.getTime() + (averageLifeExpectancy * 365 * 24 * 60 * 60 * 1000) - currentDate.getTime();

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

    const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingDays = Math.floor(remainingHours / 24);
    const remainingMonths = Math.floor(remainingDays / 30.44); // Average month length
    const remainingYears = Math.floor(remainingMonths / 12);

    return {
        timeLived: {
            years: timeLivedYears,
            months: timeLivedMonths % 12,
            weeks: timeLivedWeeks,
            days: timeLivedDays % 30,
            hours: timeLivedHours % 24,
            minutes: timeLivedMinutes % 60,
            seconds: timeLivedSeconds % 60,
        },
        remainingTime: {
            years: remainingYears,
            months: remainingMonths % 12,
            days: remainingDays % 30,
            hours: remainingHours % 24,
            minutes: remainingMinutes % 60,
            seconds: remainingSeconds % 60,
        },
    };
}


// Function to update and display the time every second
let lock = false;
function updateTime() {
    const userDetails = {
        userBirthdate: userDetails_.userBirthdate, // Replace with the person's date of birth
        lifeExpectancy: userDetails_.lifeExpectancy, // Replace with the person's life expectancy in years
    };
    
    const result = calculateTime(userDetails.userBirthdate, userDetails.lifeExpectancy);    

    
    // Update HTML elements
    document.getElementById("timeLived").textContent = `${result.timeLived.years} years, ${result.timeLived.months} months, ${result.timeLived.weeks} weeks, ${result.timeLived.days} days, ${result.timeLived.hours} hours, ${result.timeLived.minutes} minutes, ${result.timeLived.seconds} seconds`;
    document.getElementById("remainingTime").textContent = `${result.remainingTime.years} years, ${result.remainingTime.months} months, ${result.remainingTime.days} days, ${result.remainingTime.hours} hours, ${result.remainingTime.minutes} minutes, ${result.remainingTime.seconds} seconds left`;
    
}

// Call the updateTime function every second
setInterval(updateTime, 1000);

// Call the updateTime function immediately to display the initial values
updateTime();





