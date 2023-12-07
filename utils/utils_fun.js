// if user active get some info
const Storys = require("../model/submission.js");
const User = require("../model/user.js");

const someUserInfo = async (req, res, next) => {

    let user = req.session.user;

    if (user === undefined) {
      user = { username: "guest" };
    }

    return {
        userName: user.username,
        userActive: req.session.user ? true : false,
        userData: req.session.user ? req.session.user : null,
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



// create a class to query Storys by top 5 most read/upvotes/comments and return the data

class GetStories {
    constructor() {
        this.topStorys = [];
        this.topStorysByUpvotes = [];
        this.topStorysByComments = [];
        this.topStorysByReads = [];
        this.byQuery = [];
        this.allStorys = [];
        this.topStoryByUpvotes = [];
    }

    async getTopStorys(limit) {
        //5 top storys by upvotes/comments/reads use agregate
        this.topStorys = await Storys.aggregate([
            {
                $facet: {
                    sortByUpvotes: [
                        { $sort: { upvoteCount: -1 } },
                        { $limit: limit },
                    ],
                    sortByReads: [
                        { $sort: { readCount: -1 } },
                        { $limit: limit },
                    ],
                    sortByComments: [
                        { $sort: { comments: -1 } },
                        { $limit: limit },
                    ],
                },
            },
            {
                $project: {
                    topStorys: {
                        $setUnion: ['$sortByUpvotes', '$sortByReads', '$sortByComments'],
                    },
                },
            },
            {
                $unwind: '$topStorys',
            },
            {
                $replaceRoot: { newRoot: '$topStorys' },
            },
            { $limit: limit }, // Ensure you have a total of 5 unique stories
        ]);
    
        return this.topStorys;

    }

    async getTopStorysByUpvotes(limit) {
        this.topStorysByUpvotes = await Storys.find({}).sort({ upvoteCount: -1 }).limit(limit);
        return this.topStorysByUpvotes;
    }

    async getTopStorysByComments(limit) {
        this.topStorysByComments = await Storys.find({}).sort({ comments: -1 }).limit(limit);
        return this.topStorysByComments;
    }

    async getTopStorysByReads(limit) {
        this.topStorysByReads = await Storys.find({}).sort({ readCount: -1 }).limit(limit);
        return this.topStorysByReads;
    }

    
    async getAllStorys(limit) {
        //get 10 newest storys
        this.allStorys = await Storys.find({}).sort({ createdAt: -1 }).limit(limit);
        return this.allStorys;
    }

    async getStorysByQuery(query, limit) {
        this.byQuery = await Storys.find({ $text: { $search: query } }).limit(limit);
        return this.byQuery;
    }

}






module.exports = {
    someUserInfo,
    calculateReadingTime,
    GetStories
};