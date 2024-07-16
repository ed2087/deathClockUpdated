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

console.log(userDetails_);


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

    //openai()
    //only call one time
    
    if(!lock) {        
        console.log(result, "-------------------")
        generateStory(userDetails_.userName, result.remainingTime);
        lock = true;
    }

    // Update HTML elements
    document.getElementById("timeLived").textContent = `${result.timeLived.years} years, ${result.timeLived.months} months, ${result.timeLived.weeks} weeks, ${result.timeLived.days} days, ${result.timeLived.hours} hours, ${result.timeLived.minutes} minutes, ${result.timeLived.seconds} seconds`;
    document.getElementById("remainingTime").textContent = `${result.remainingTime.years} years, ${result.remainingTime.months} months, ${result.remainingTime.days} days, ${result.remainingTime.hours} hours, ${result.remainingTime.minutes} minutes, ${result.remainingTime.seconds} seconds left`;
    
}

// Call the updateTime function every second
setInterval(updateTime, 1000);

// Call the updateTime function immediately to display the initial values
updateTime();





function generateStory(userName, remainingTime) {
    console.log(remainingTime)
    const storyTemplates = [
    "${Name} lived a life of resilience and perseverance. In the year ${YearOfDeath}, they peacefully passed away in their home, surrounded by family and friends. Their legacy is one of strength and love that will forever be cherished.",
    "In the twilight of life, ${Name} found solace in the embrace of their loved ones. They departed in the year ${YearOfDeath}, leaving behind a lifetime of cherished memories and a heart full of love.",
    "After a lifetime of hard work and dedication, ${Name} enjoyed a well-deserved retirement. In the year ${YearOfDeath}, they passed away in their sleep, a testament to a life well-lived and a legacy of diligence.",
    "Throughout their life, ${Name} was known for their kindness and generosity. In ${YearOfDeath}, they peacefully left this world, leaving behind a community that had been touched by their warmth and compassion.",
    "Amidst the changing seasons of life, ${Name} found contentment in their later years. They departed in ${YearOfDeath}, leaving behind a world that had been enriched by their wisdom and experience.",
    "In the golden years of their life, ${Name} shared laughter and stories with their grandchildren. They passed away in the year ${YearOfDeath}, surrounded by the love of their family, leaving behind cherished memories and a sense of belonging.",
    "A lifelong adventurer, ${Name} found serenity in the beauty of nature. In the year ${YearOfDeath}, they peacefully passed away while gazing at a breathtaking sunset, becoming one with the world they had always loved.",
    "As ${Name} reached their twilight years, they continued to inspire others with their resilience and determination. They passed away in ${YearOfDeath}, leaving behind a legacy of strength that continues to uplift those who knew them.",
    "Throughout their life, ${Name} faced challenges with grace and a sense of humor that brought joy to all. In the year ${YearOfDeath}, they departed, leaving behind a world that had been brightened by their laughter.",
    "In the quiet hours of a peaceful evening in ${YearOfDeath}, ${Name} took their final breath, leaving behind a world that had been enriched by their presence. They found solace in the embrace of eternity.",
    "With a heart full of love and a spirit that touched many, ${Name} departed in ${YearOfDeath}, leaving behind a world that had been illuminated by their kindness and compassion.",
    "In their final moments, ${Name} was surrounded by the beauty of art, their soul's greatest passion. They passed away in ${YearOfDeath}, leaving behind a legacy of creativity and inspiration.",
    "Throughout their life, ${Name} found joy in helping others. In ${YearOfDeath}, they peacefully passed away, leaving behind a world that had been shaped by their acts of kindness and generosity.",
    "As the sun set on a tranquil day in ${YearOfDeath}, ${Name} peacefully crossed the threshold into eternity. Their journey had come to a serene conclusion, leaving behind a world forever touched by their presence.",
    "With a heart that had known love and friendship, ${Name} departed in ${YearOfDeath}, leaving behind cherished memories and a legacy of laughter and joy.",
    "In their final moments, ${Name} found solace in the company of loved ones. They passed away in the year ${YearOfDeath}, surrounded by the warmth of family, leaving behind a world forever changed by their love.",
    "With a life marked by perseverance and determination, ${Name} departed in ${YearOfDeath}, leaving behind a legacy that continues to inspire others to overcome adversity.",
    "As ${Name} entered their golden years, they found peace in the melodies of their favorite music. They passed away in the year ${YearOfDeath}, leaving behind a world that had been enriched by the beauty of their soul.",
    "Throughout their life, ${Name} embraced the spirit of exploration. They departed in ${YearOfDeath}, having met their end while pursuing their dreams, leaving behind a trail of inspiration for generations to come.",
    "With a heart full of compassion, ${Name} left behind a world touched by their kindness in ${YearOfDeath}. Their legacy lives on in the acts of goodness they inspired in others.",
    "As ${Name} faced life's trials, their sense of humor shone brightly. They passed away in ${YearOfDeath}, leaving behind laughter through the tears, a testament to the enduring power of joy.",
    "In their final breath, ${Name} whispered words of love and affection, leaving behind a world that had been warmed by their presence. They departed in ${YearOfDeath}, leaving a legacy of love that lingers on.",
    "With a spirit that embraced life to the fullest, ${Name} left this world with a contented smile in ${YearOfDeath}. Their journey was marked by joy and fulfillment.",
    "In the quiet hours of dawn in ${YearOfDeath}, ${Name} peacefully crossed the threshold into eternity. They left behind a world that had been graced by their quiet strength and grace.",
    "A life of creativity and artistry, ${Name} left behind a world of beauty to behold in ${YearOfDeath}. Their legacy lives on in the art they created and the hearts they touched.",
    "Throughout their life, ${Name} faced a challenging illness with remarkable grace. They departed in ${YearOfDeath}, teaching us the true meaning of strength in the face of adversity.",
    "Their life was a testament to the power of perseverance, even in the face of adversity. ${Name} departed in ${YearOfDeath}, leaving behind a legacy of resilience and determination.",
    "In their favorite garden, ${Name} found their final bloom in ${YearOfDeath}, a serene connection to nature that had always brought them peace and tranquility.",
    "After a life of service and dedication to others, ${Name} left behind the warmth of their love in our hearts in ${YearOfDeath}. Their memory lives on in the lives they touched.",
    "Their journey came to a sudden end in ${YearOfDeath}, but their spirit lives on in the stories we share, a reminder of the preciousness of life and the inevitability of its conclusion.",
    "A life of wisdom and experience, ${Name} left us with the insights of their years in ${YearOfDeath}. Their guidance and teachings continue to inspire those they mentored.",
    "In the quiet solitude they had always cherished, ${Name} met their end in ${YearOfDeath}. They departed in the way they had lived, finding peace in the stillness of the world around them.",
    "In their final act of kindness, ${Name} gave the gift of life to others through organ donation in ${YearOfDeath}. Their selflessness continues to save lives and offer hope to those in need.",
    "A lifetime of adventure culminated in a daring journey into the unknown in ${YearOfDeath}. ${Name} found fulfillment in exploring new horizons and embracing the thrill of discovery.",
    "With unwavering faith, ${Name} passed away in ${YearOfDeath}, finding comfort and solace in the embrace of their spiritual beliefs. Their legacy is one of unwavering faith and inner peace.",
    "A life marked by resilience, ${Name} met their end with unwavering courage in ${YearOfDeath}. They faced life's challenges head-on, inspiring all who knew them with their bravery.",
    "In their final moments, ${Name} found peace in the melodies of their favorite music. They passed away in ${YearOfDeath}, leaving behind a world that had been enriched by the beauty of their soul.",
    "With a spirit of exploration, ${Name} met their end in the pursuit of discovery in ${YearOfDeath}. They departed while embracing the thrill of uncovering the unknown.",
    "${Name} faced numerous challenges in their life, but they always persevered. Tragically, in the year ${YearOfDeath}, they lost their battle to a relentless illness, leaving behind a legacy of strength.",
    "Despite their optimism and unwavering spirit, ${Name} met a tragic end in ${YearOfDeath} when a sudden accident claimed their life, leaving their loved ones heartbroken.",
    "Throughout their life, ${Name} carried the weight of past traumas. Sadly, in the year ${YearOfDeath}, they succumbed to the emotional scars they had endured for years.",
    "In ${YearOfDeath}, ${Name} faced a series of unfortunate events that led to their untimely demise, a reminder of life's unpredictability and the harsh realities it can bring.",
    "A life filled with dreams and aspirations, ${Name} had their hopes shattered in ${YearOfDeath} when circumstances beyond their control led to their tragic end.",
    "Despite their best efforts, ${Name} could not overcome the financial hardships that plagued them. They passed away in ${YearOfDeath}, burdened by the weight of their struggles.",
    "Throughout their life, ${Name} battled with addiction, a relentless foe that ultimately claimed their life in ${YearOfDeath}, leaving their loved ones in anguish.",
    "A troubled soul, ${Name} could not escape the grip of mental illness. In the year ${YearOfDeath}, they tragically lost their battle with their inner demons.",
    "In the prime of their life, ${Name} was struck down by a devastating tragedy in ${YearOfDeath}, a stark reminder of the fragility of human existence.",
    "Despite their loving nature, ${Name} faced betrayal and heartbreak. In ${YearOfDeath}, they met a tragic end, their trust shattered by those they held dear.",
    "Throughout their life, ${Name} was haunted by regrets and missed opportunities. Tragically, they passed away in ${YearOfDeath}, carrying the weight of what could have been.",
    "In ${YearOfDeath}, ${Name} found themselves in the wrong place at the wrong time, falling victim to a senseless act of violence that ended their life prematurely.",
    "Despite their dreams of a better life, ${Name} was trapped in a cycle of despair and hardship. They met a tragic end in ${YearOfDeath}, their dreams forever out of reach.",
    "In ${YearOfDeath}, ${Name} lost their battle with a chronic illness that had plagued them for years, leaving their loved ones with a sense of sorrow and loss.",
    "Throughout their life, ${Name} yearned for love and acceptance. Tragically, they departed in ${YearOfDeath}, their heart still aching for the love they had never truly found.",
    "In the year ${YearOfDeath}, ${Name} was involved in a devastating accident that claimed their life, leaving behind a shattered family and a community in mourning.",
    "Despite their best intentions, ${Name} could not escape the cycle of addiction. They passed away in ${YearOfDeath}, their struggle leaving behind a trail of heartache and regret.",
    "A life marked by heartbreak and disappointment, ${Name} faced another tragic loss in ${YearOfDeath}, a reminder of the relentless challenges they had endured.",
    "In ${YearOfDeath}, ${Name} met their end in a tragic accident that cut short their dreams and aspirations, leaving their loved ones to grapple with the cruel hand of fate.",
    "Despite their resilience, ${Name} could not overcome the financial ruin that befell them. They passed away in ${YearOfDeath}, their dreams of a better life unfulfilled.",
    "Throughout their life, ${Name} carried the burden of unfulfilled potential. Tragically, they departed in ${YearOfDeath}, leaving behind the promise of what could have been.",
    "In ${YearOfDeath}, ${Name} found themselves in the midst of a natural disaster that claimed their life, a stark reminder of the uncontrollable forces of nature.",
    "Despite their kindness and generosity, ${Name} was taken advantage of by those they trusted. In ${YearOfDeath}, they met a tragic end, their trust forever betrayed.",
    "A life marked by lost opportunities and shattered dreams, ${Name} faced yet another tragic setback in ${YearOfDeath}, leaving their spirit broken.",
    "In ${YearOfDeath}, ${Name} fell victim to a senseless act of violence, a tragic reminder of the darkness that can lurk in the world around us.",
    "Despite their best efforts, ${Name} could not escape the grip of addiction. They passed away in ${YearOfDeath}, leaving their loved ones with a profound sense of loss.",
    "Throughout their life, ${Name} carried the weight of past trauma. Tragically, in ${YearOfDeath}, the scars of their past finally overcame them, leaving behind a legacy of pain.",
    "In ${YearOfDeath}, ${Name} faced a series of unfortunate events that led to their untimely demise, a reminder of life's unpredictability and the harsh realities it can bring.",
    "Despite their dreams of a brighter future, ${Name} was trapped in a cycle of despair and hopelessness. They met a tragic end in ${YearOfDeath}, their dreams forever shattered.",
    "A life filled with inner turmoil and struggles, ${Name} could not escape the grip of mental illness. In ${YearOfDeath}, they tragically lost their battle with their inner demons.",
    "In the prime of their life, ${Name} was struck down by a devastating tragedy in ${YearOfDeath}, a stark reminder of the fragility of human existence.",
    "Despite their loving nature, ${Name} faced betrayal and heartbreak. In ${YearOfDeath}, they met a tragic end, their trust shattered by those they held dear.",
    "Throughout their life, ${Name} was haunted by regrets and missed opportunities. Tragically, they passed away in ${YearOfDeath}, carrying the weight of what could have been.",
    "In ${YearOfDeath}, ${Name} found themselves in the wrong place at the wrong time, falling victim to a senseless act of violence that ended their"
    
    ];

    // Randomly select a story template
    function getRandomStoryTemplate() {
        const randomIndex = Math.floor(Math.random() * storyTemplates.length);
        return storyTemplates[randomIndex];
    }

    const selectedTemplate = getRandomStoryTemplate();

    // Replace placeholders with user-specific data when needed
    let story = selectedTemplate.replace("${Name}", userName);

    if (selectedTemplate.includes("${YearOfDeath}")) {
        //calculate year of death from years left 
        const currentDate = new Date();
        const yearOfDeath = currentDate.getFullYear() + remainingTime.years;
        story = story.replace("${YearOfDeath}", yearOfDeath);
    }

    if (selectedTemplate.includes("${remaining months}")) {
        story = story.replace("${remaining months}", remainingTime.months);
    }

    if (selectedTemplate.includes("${remaining days}")) {
        story = story.replace("${remaining days}", remainingTime.days);
    }

    document.getElementById("predictionStory").textContent = story;
}






    









