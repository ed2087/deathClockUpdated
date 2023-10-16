// Submission model
const Story = require("../model/submission.js");
const User = require("../model/user.js");

//other
const {sendEmail,htmlTemplate} = require("../utils/sendEmail.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");

//packages
const { checkCsrf } = require("../utils/csrf.js");
const uuidv4 = require('uuid').v4;
// Hash password
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');

// Home page
exports.terrorTalesPage = function (req, res) {
    res.render("../views/storypages/terrorTales", {
        title: "Terror Tales"
    });
};

// Submission page
exports.submission = function (req, res) {
    res.render("../views/storypages/submission", {
        title: "Submission"
    });
};

//create users submission
exports.submissionPost = async function (req, res, next) {
    try {
        // Check CSRF token
        const csrfValid = checkCsrf(req, res, next, req.body._csrf);
        if (!csrfValid) {
            return res.redirect('/');
        }

        const {
            legalName,
            creditingName,
            storyTitle,
            storySummary,
            tags,
            storyText,
            categories,
            language,
            extraTags,
            ageVerification,
            acceptedTerms,
            termsAndConditions,
        } = req.body;

        // Check for required fields
        const requiredFields = [legalName, storyTitle, storySummary, storyText, ageVerification, acceptedTerms, creditingName, categories, tags];
        if (requiredFields.some(field => !field)) {
            return res.status(400).json({
                status: 400,
                message: "Please fill out all required fields"
            });
        }

        if (!termsAndConditions) {
            return res.status(400).json({
                status: 400,
                message: "Please accept the terms and conditions"
            });
        }

        // Convert tags and extraTags to arrays
        const tagsArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag !== "");
        const extraTagsArray = extraTags.split(",").map(extraTag => extraTag.trim()).filter(extraTag => extraTag !== "");


        // Update user if not exist
        let userId = req.session.userId;
        const user = await User.findById(userId);

        if (!user) return globalErrorHandler(req, res, 500, "You do not have permission to access this page.");

            

        // Save data to the database
        const submission = await Story.create({
            legalName,
            creditingName,
            storyTitle,
            storySummary,
            tags: tagsArray,
            storyText,
            categories,
            language,
            extraTags: extraTagsArray,
            ageVerification,
            acceptedTerms,
            termsAndConditions,
            owner: req.session.userId
        });  


            user.contributions.stories.push(submission._id);
            user.contributions.storiesCount++;

            //if user role is user then change to writter
            if (user.role === "user") {
                user.role = "writter";
            }

            user_ = await user.save();

        if (!user_) {
            //delete submission
            const deleted = await Story.findByIdAndDelete(submission._id);
            return globalErrorHandler(req, res, 500, "Oops! Something went wrong. Please try again later.");
        }

        if (submission && user_) {

            //send email to user and admin that a new submission has been submitted
            const email = user.email;
            const subject = "Your Story has been submitted successfully";

            const bodyContent = `
                <h2>Thank you for submitting your story</h2>
                <p>Dear ${user.username},</p>
                <p>Your story has been submitted successfully.</p>
                <p>pleease allow 24 hours for your story to be reviewed.</p>
                <p>Thank you for your contribution.</p>
                <p>Best regards,</p>
                <p>TerrorHub Team</p>
                <a href="https://www.terrorhub.com">TerrorHub</a>
            `;

            const html = htmlTemplate(bodyContent);

            const emailSent = await sendEmail(email, subject, html);

            //later on we must send to success page*********************
            return res.status(200).json({
                status: 200,
                message: "Your submission has been sent"
            });

        } else {
            return res.status(500).json({
                status: 500,
                message: "Something went wrong"
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: "Something went wrong"
        });
    }
};



// query for stories 

exports.queryStories = async function (req, res, next) {

    const {query,language,ranking,page,limit} = req.query;    

    try {

        // Query stories
        const stories = await queryStoriesPagination(query,language,ranking,page,limit);       
        
        if (stories) {
            return res.status(200).json({
                status: 200,
                stories: stories.stories,
                totalStories: stories.totalStories
            });
        } else {
            return res.status(500).json({
                status: 500,
                message: "Something went wrong"
            });
        }       
        
        
    } catch (error) {
        console.log(error);
    }

};


// Get paginated stories and total count based on query, language, ranking, page, and limit
async function queryStoriesPagination(query, language, ranking, page, limit) {
    try {
        // Convert page and limit to numbers and provide default values
        const page_ = page * 1 || 1;
        const limit_ = limit * 1 || 8;

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
            countPipeline.unshift({
                $match: {
                    $or: [
                        {
                            legalName: {
                                $regex: query,
                                $options: "i",
                            },
                        },
                        {
                            creditingName: {
                                $regex: query,
                                $options: "i",
                            },
                        },
                        {
                            storyTitle: {
                                $regex: query,
                                $options: "i",
                            },
                        },
                        {
                            tags: {
                                $regex: query,
                                $options: "i",
                            },
                        },
                        {
                            categories: {
                                $regex: query,
                                $options: "i",
                            },
                        },
                    ],
                },
            });
        }

        // Get the count of total stories that match the query
        const totalCount = await Story.aggregate(countPipeline).count("totalStories");

        //get higest upvote count using countPipeline get top 5 posts
        const top5Stories = await Story.aggregate([
            {
                $match: {
                    language: language,
                },
            },
            {
                $sort: {
                    upvoteCount: -1
                }
            },
            {
                $limit: 5
            }
        ]);

        // Define the aggregation pipeline for fetching paginated stories
        const pipeline = [
            ...countPipeline, // Reuse the count pipeline
            {
                $skip: skip,
            },
            {
                $limit: limit_,
            },
            {
                $project: {
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
                },
            },
        ];

        // Fetch stories using the aggregation pipeline
        const stories = await Story.aggregate(pipeline);

        return {
            stories,
            totalStories: totalCount[0] ? totalCount[0].totalStories : 0,
            top5Stories
        };

    } catch (error) {
        console.error(error);
        throw new Error("An error occurred while fetching stories with pagination.");
    }
}

