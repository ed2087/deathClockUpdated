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





// Get the canvas element
const canvas = document.getElementById("canvas");

// Create a context object
const ctx = canvas.getContext("2d");

// Function to resize the canvas based on screen size
function resizeCanvas() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  canvas.width = screenWidth;
  canvas.height = screenHeight;

  // Call your drawing function here
  draw();
}

// Call the resizeCanvas function when the window is resized
window.addEventListener("resize", resizeCanvas);

// Initial canvas sizing
resizeCanvas();

// Function to scroll the canvas to keep the latest image in view
function scrollCanvas() {
  const scrollX = 0; // Adjust as needed
  const scrollY = canvas.height; // Scroll to show the latest content
  window.scrollTo(scrollX, scrollY);
}

// Your drawing code here

// Example: Draw a rectangle on the canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Calculate the dimensions of the rectangle based on the canvas size
  const rectWidth = canvas.width * 0.2; // Example: 20% of the canvas width
  const rectHeight = canvas.height * 0.2; // Example: 20% of the canvas height
  const rectX = (canvas.width - rectWidth) / 2; // Center horizontally
  const rectY = (canvas.height - rectHeight) / 2; // Center vertically

  ctx.fillStyle = "blue";
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
}

// Create an image object for the birth image
const birthImage = new Image();
birthImage.src = "../../IMAGES/utils/baby.png";

// Create an image object for the death image
const deathImage = new Image();
deathImage.src = "../../IMAGES/utils/cross.png";

// Define birth and death objects with initial positions
const births = [];
const deaths = [];

// Set spacing between images and rows
const spacing = 5; // Adjust as needed
const rowHeight = Math.max(birthImage.height, deathImage.height) + spacing; // Height of each row

// Initialize a variable to track the current row
let currentRow = 0;
let currentX = 0;

// Update the canvas every second
function update() {
  // Get the current number of births and deaths per second
  const birthsPerSecond = 4.3; // Adjust as needed
  const deathsPerSecond = 1.8; // Adjust as needed

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate the maximum number of births and deaths in a row
  const maxBirthsInRow = Math.floor((canvas.width - currentX) / (birthImage.width + spacing));
  const maxDeathsInRow = Math.floor((canvas.width - currentX) / (deathImage.width + spacing));

  // Update birth positions and draw
  for (let i = 0; i < births.length; i++) {
    const birth = births[i];
    ctx.drawImage(birthImage, birth.x, birth.y);
  }

  // Update death positions and draw
  for (let i = 0; i < deaths.length; i++) {
    const death = deaths[i];
    ctx.drawImage(deathImage, death.x, death.y);
  }

  // Add new births and deaths with proper spacing and alignment
  for (let i = 0; i < birthsPerSecond; i++) {
    if (currentX + birthImage.width <= canvas.width) {
      const newBirth = {
        x: currentX,
        y: currentRow * rowHeight,
      };
      births.push(newBirth);
      currentX += birthImage.width + spacing;
    } else {
      // Start a new row
      currentRow++;
      currentX = 0;
    }
  }

  for (let i = 0; i < deathsPerSecond; i++) {
    if (currentX + deathImage.width <= canvas.width) {
      const newDeath = {
        x: currentX,
        y: currentRow * rowHeight,
      };
      deaths.push(newDeath);
      currentX += deathImage.width + spacing;
    } else {
      // Start a new row
      currentRow++;
      currentX = 0;
    }
  }

  // Scroll the canvas to show the latest content
  scrollCanvas();

  // Request the next update
  requestAnimationFrame(update);
}

// Start the update loop
//update();
