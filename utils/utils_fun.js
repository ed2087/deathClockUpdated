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
        this.bookByTitle = [];
    }

    async getTopStorys(limit) {
        //5 top storys by upvotes/comments/reads use agregate
        this.topStorys = await Storys.aggregate([
            {
                $match: {
                    isApproved: true, // Filter out stories that are not approved
                },
            },
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
        this.topStorysByUpvotes = await Storys.find({ isApproved: true }).sort({ upvoteCount: -1 }).limit(limit);
        return this.topStorysByUpvotes;
    }
    
    async getTopStorysByComments(limit) {
        this.topStorysByComments = await Storys.find({ isApproved: true }).sort({ comments: -1 }).limit(limit);
        return this.topStorysByComments;
    }
    
    async getTopStorysByReads(limit) {
        this.topStorysByReads = await Storys.find({ isApproved: true }).sort({ readCount: -1 }).limit(limit);
        return this.topStorysByReads;
    }
    
    async getAllStorys(limit) {
        // Get 10 newest stories where isApproved is true
        this.allStorys = await Storys.find({ isApproved: true }).sort({ createdAt: -1 }).limit(limit);
        return this.allStorys;
    }
    
    async getStorysByQuery(query, limit) {
        this.byQuery = await Storys.find({ $text: { $search: query }, isApproved: true }).limit(limit);
        return this.byQuery;
    }
    
    // Find a story by title where isApproved is true
    async getStoryByTitle(title) {
        this.bookByTitle = await Storys.find({ title: title, isApproved: true });
        return this.bookByTitle;
    }
    

}






module.exports = {
    someUserInfo,
    calculateReadingTime,
    GetStories
};