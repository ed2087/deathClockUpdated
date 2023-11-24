// if user active get some info

const someUserInfo = async (req, res, next) => {

    let user = req.session.user;

    if (user === undefined) {
      user = { username: "guest" };
    }

    return {
        userName: user.username,
        userActive: req.session.user ? true : false,
    }

};



//create a function that finds out how long a book will take to rean in minutes
const calculateReadingTime = (book) => {
    const wordsPerMinute = 200;
    const wordsPerSecond = wordsPerMinute / 60;
    const numberOfWords = book.split(" ").length;
    const seconds = numberOfWords / wordsPerSecond;

    // Assuming an average adult reads for 15 to 30 minutes at a time.
    const readingDuration = Math.floor(Math.random() * 16) + 15;
    const readingDurationInSeconds = readingDuration * 60;

    const numberOfReadingSessions = Math.ceil(seconds / readingDurationInSeconds);
    const numberOfWordsPerSession = Math.ceil(numberOfWords / numberOfReadingSessions);

    const totalTimeInMinutes = Math.ceil(seconds / 60);

    return totalTimeInMinutes;
};



module.exports = {
    someUserInfo,
    calculateReadingTime
};