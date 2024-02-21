// if user active get some info
const Storys = require("../model/submission.js");
const User = require("../model/user.js");
const FuzzySearch = require('fuzzy-search');

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
        this.getTopStiesExcept = [];
        this.getTopByLimitUpvoteCommentsAndByQuery_ = [];
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

    // Find all stories except the one with the given id get top storys set a limit and star from best to worst by checking the upvoteCount and readCount
    async getTopStorysExcept(id, limit) {
        this.getTopStiesExcept = await Storys.find({ _id: { $ne: id }, isApproved: true }).sort({ upvoteCount: -1, readCount: -1 }).limit(limit);
        return this.getTopStiesExcept;
    }

    // Find all stories by limit, upvoteCount and comments and by query if quey is empty return top storys 
    async getTopByLimitUpvoteCommentsAndByQuery(limit, query) {
        console.log(query);
        if (query === "") {
            this.getTopByLimitUpvoteCommentsAndByQuery = await Storys.find({ isApproved: true }).sort({ upvoteCount: -1, comments: -1 }).limit(limit);
        } else {
            this.getTopByLimitUpvoteCommentsAndByQuery = await Storys.find({ $text: { $search: query }, isApproved: true }).sort({ upvoteCount: -1, comments: -1 }).limit(limit);
        }
        return this.getTopByLimitUpvoteCommentsAndByQuery;
    }

    async queryStoriesPagination_(query, language, ranking, page, limit) {
        try {
            // Convert page and limit to numbers and provide default values
            const page_ = page * 1 || 1;
            const limit_ = limit * 1 || 16;

            // Calculate the number of documents to skip for pagination
            const skip = (page_ - 1) * limit_;

            // Default language is English unless specified
            if (!language) {
                language = "English";
            }

            // Check if the query is empty
            const queryIsEmpty = !query || query.trim() === "";

            // Define the aggregation pipeline for counting total stories
            const countPipeline = [
                {
                    $match: {
                        language: language,
                    },
                },
            ];

            if (!queryIsEmpty) {
                // If the query is not empty, add the $or conditions for searching
                const fuzzyQueryConditions = [
                    { legalName: new RegExp(query, 'i') },
                    { creditingName: new RegExp(query, 'i') },
                    { storyTitle: new RegExp(query, 'i') },
                    { tags: new RegExp(query, 'i') },
                    { categories: { $regex: query.split(/\s+/).join('.*'), $options: "i" } }, // Handle separated words in categories
                    { slug: new RegExp(query, 'i') },
                ];

                // Include fuzzy search conditions
                const searcher = new FuzzySearch(this.getFuzzyData(), Object.keys(this.getFuzzyFields()));
                const fuzzyConditions = searcher.search(query).map(field => ({ [field]: new RegExp(query, 'i') }));

                fuzzyQueryConditions.push(...fuzzyConditions);

                countPipeline.unshift({
                    $match: {
                        $or: fuzzyQueryConditions,
                    },
                });
            }

            // Get the count of total stories that match the query but don't count the ones that are not isApproved
            const totalCount = await Storys.aggregate([
                ...countPipeline, // Reuse the count pipeline
                {
                    $match: {
                        isApproved: true, // Filter out stories that are not approved
                    },
                },
                {
                    $count: "totalStories",
                },
            ]);

            // get languages available
            const languages = await Storys.aggregate([
                {
                    $group: {
                        _id: "$language",
                    }
                }
            ]);

            // add values to array
            let languagesArray = [];
            languages.forEach((language_) => {
                languagesArray.push(language_._id);
            });

            // Define the aggregation pipeline for fetching paginated stories
            const pipeline = [
                ...countPipeline, // Reuse the count pipeline
                {
                    $match: {
                        isApproved: true, // Filter out stories that are not approved
                    },
                },
                {
                    $sort: {
                        createdAt: -1, // Sort by createdAt field in descending order
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit_,
                },
                // get most newest to oldest
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
                {
                    $project: this.projectedFields(),
                },
            ];

            // Fetch stories using the aggregation pipeline
            const stories = await Storys.aggregate(pipeline);

            return {
                stories,
                totalStories: totalCount[0] ? totalCount[0].totalStories : 0,
                languagesArray,
            };

        } catch (error) {
            console.error(error);
            throw new Error("An error occurred while fetching stories with pagination.");
        }
    }

    // ... (existing methods)

    getFuzzyFields() {
        return {
            legalName: 1,
            creditingName: 1,
            storyTitle: 1,
            tags: 1,
            categories: 1,
            slug: 1,
            // Add other fields that should be considered for fuzzy search
        };
    }

    getFuzzyData() {
        // Add data for fuzzy search (e.g., fields with string values)
        const data = [];
        // Add entries based on the fields you want to include in the fuzzy search
        // Example: data.push({ legalName: 'someValue', creditingName: 'someValue', ... });
        return data;
    }   

    projectedFields() {
        return {
            // Include fields you want to retrieve
            legalName: 1,
            creditingName: 1,
            storyTitle: 1,
            storySummary: 1,
            tags: 1,
            storyText: 1,
            categories: 1,
            language: 1,
            extraTags: 1,
            upvoteCount: 1,
            createdAt: 1,
            readingTime: 1,
            comments: 1,
            readCount: 1, 
            unicUrlTitle: 1,
            slug: 1,
            backgroundUrl: 1,
        }
    }


}






module.exports = {
    someUserInfo,
    calculateReadingTime,
    GetStories
};