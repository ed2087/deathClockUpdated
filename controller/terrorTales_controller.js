// Submission model
const Story = require("../model/submission.js");
const User = require("../model/user.js");

//other
const {sendEmail,htmlTemplate} = require("../utils/sendEmail.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");
const {isToxic} = require("../utils/toxicity_tensorflow.js");
const {someUserInfo, calculateReadingTime} = require("../utils/utils_fun.js");
const nlp = require('compromise');
//packages
const { checkCsrf } = require("../utils/csrf.js");
const uuidv4 = require('uuid').v4;
// Hash password
const bcrypt = require("bcryptjs");
const { validationResult } = require('express-validator');
const { get } = require("mongoose");


// Home page
exports.terrorTalesPage = async (req, res, next) => {

    try {

      const { userName, userActive, userData } = await someUserInfo(req, res, next);
      

      res.status(200).render("../views/storypages/terrorTales", {
        title: "Terror Tales",
        path: "/terrorTales",
        headerTitle: "TERROR TALES",
        userActive,
        userName,
        userData
      });

    } catch (error) {
        console.error("Error in terrorTalesPage:", error);
        globalErrorHandler(req, res, 500, "Something went wrong");
    }

};



// Read page
exports.readPage = async (req, res, next) => {
    try {
        const { userName, userActive, userData } = await someUserInfo(req, res, next);
        const storyId = req.params.id;

        // Get the story by ID
        const story = await Story.findById(storyId);

        // get top 5 stories using this story language and tags
        const top5Stories = await getTop6Stories(story);        

        // If story not found, return a 404 error
        if (!story) {
            return globalErrorHandler(req, res, 404, "Story not found");
        }

        // Check if the user is logged in
        if (userActive) {
            const user = await User.findById(req.session.userId);

            // Check if the user has already read this story
            const hasAlreadyRead = user.booksRead.some(book => book.bookId.toString() === story._id.toString());

            if (!hasAlreadyRead) {
                // If the user has not read the story, add it to their books array
                user.booksRead.push({
                    bookId: story._id,
                    booksReadCount: 1
                });
                await user.save();
            } else {
                // If user has already read the story, then increment the readCount
                const book = user.booksRead.find(book => book.bookId.toString() === story._id.toString());
                if (book) {
                    book.booksReadCount++;
                    await user.save();
                }
            }
        }

        // Increment the readCount every time a user reads a story
        story.readCount++;
        await story.save();

        // Format the story text
        const storyText = await formatStory(story.storyText, 80);

        // Update the story object with the formatted text
        story.storyText = storyText;
        
        // Render the read page with the story details
        res.status(200).render("../views/storypages/read", {
            title: "Read",
            path: "/read",
            headerTitle: `${story.storyTitle}`,
            userActive,
            userName,
            story,
            userData,
            top5Stories
        });

    } catch (error) {
        console.error("Error in readPage:", error);
        globalErrorHandler(req, res, 500, "Something went wrong");
    }
};






// Submission page
exports.submission = async  (req, res, next) => {
  try {
    const { userName, userActive } = await someUserInfo(req, res, next);

    res.render("../views/storypages/submission", {
      title: "Submission",
      path: "/submission",
      headerTitle: "SUBMIT YOUR STORY",
      userActive,
      userName,
    });
  } catch (error) {
        console.error("Error in submission:", error);
        globalErrorHandler(req, res, 500, "Something went wrong");
  }

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

        
        //get time book will take to read
        const readingTime = calculateReadingTime(storyText);

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
            readingTime,
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


// upvote
exports.upvote = async (req, res, next) => {
    try {
        const { storyID, token } = req.query;
        console.log(storyID, token);

        const { userName, userActive } = await someUserInfo(req, res, next);

        // Check CSRF token
        const csrfValid = checkCsrf(req, res, next, token);

        if (!csrfValid) {
            return res.status(401).json({
                status: "fail",
                message: "You must be logged in to upvote"
            });
        }

        if (!userActive) {
            return res.status(401).json({
                status: "fail",
                message: "You must be logged in to upvote"
            });
        }

        // get user
        const user = await User.findById(req.session.userId);
        // get story
        const story = await Story.findById(storyID);

        // check if user has already upvoted
        const upvote = story.upvotes.find(upvote_ => upvote_.toString() === user._id.toString());

        if (upvote) {
            return res.status(401).json({
                status: "fail",
                message: "You have already upvoted"
            });
        }

        // add upvote to story
        story.upvotes.push(user._id);

        // increment upvote count
        story.upvoteCount++;

        // save story
        await story.save();

        return res.status(200).json({
            status: "ok",
            message: story.upvoteCount
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: "Something went wrong"
        });
    }
};


// report
exports.report = async (req, res, next) =>{

    try{

        const { storyID, token, reason } = req.query;

        console.log(storyID, token, reason);

        const story = await Story.findById(storyID);

        const { userName, userActive } = await someUserInfo(req, res, next);


        //check if user is logged in
        if (!userActive) {
            return res.status(401).json({
                status: "fail",
                message: "You must be logged in to report"
            });
        }

        // Check CSRF token
        const csrfValid = checkCsrf(req, res, next, token);

        if (!csrfValid) {
            return res.status(401).json({
                status: "fail",
                message: "You must be logged in to report"
            });
        }


        // check if user has already reported
        const report = story.reports.find(report_ => report_.userId.toString() === req.session.userId.toString());

        if (report) {
            return res.status(401).json({
                status: "fail",
                message: `You have already reported this story for the following reason: ${report.reason}`
            });
        }

        // add report to story
        story.reports.push({
            userId: req.session.userId,
            reason: reason
        });

        // save story
        await story.save();


        // send email to admin
        const adminEmail = process.env.HELP_EMAIL;
        //get website url
        const websiteUrl = `${req.protocol}://${req.get("host")}`;

        const subject = `${story.storyTitle} has been reported`;

        const bodyContent = `
            <h2>${story.storyTitle} has been reported</h2>
            <p>Dear Admin,</p>
            <p>${userName} has reported ${story.storyTitle} for the following reason:</p>
            <p>${reason}</p>
            <p>Best regards,</p>
            <p>TerrorHub Team</p>
            <a href="${websiteUrl}/horrorStory/${story._id}">${story.storyTitle}</a>
        `;

        const html = htmlTemplate(bodyContent);

        //send email to all admins and moderators
        //find all admins and moderators
        const admins = await User.find({ $or: [{ role: "admin" }, { role: "moderator" }] });

        admins.forEach(async (admin) => {
            await sendEmail(admin.email, subject, html);
        });

        //and one to adminEmail
        await sendEmail(adminEmail, subject, html);

        return res.status(200).json({
            status: "ok",
            message: `Thank you for reporting this story. We will review it as soon as possible.`,
        });


    }catch(error){
        console.log(error);
        res.status(500).json({
            status: 500,
            message: "Something went wrong"
        });
    }

};


// comments
exports.comments = async (req, res, next) => {

    
    // not sure if im adding this maybe later

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
                totalStories: stories.totalStories,
                top5Stories: stories.top5Stories,
                languagesArray: stories.languagesArray
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
                        {
                            unicUrlTitle: {
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



        //get languages abalable
        const languages = await Story.aggregate([
            {
                $group: {
                    _id: "$language"
                }
            }
        ]);

        //add values to array
        let languagesArray = [];
        languages.forEach((language_) => {
            languagesArray.push(language_._id);
        });



        // Define the aggregation pipeline for fetching paginated stories
        const pipeline = [
            ...countPipeline, // Reuse the count pipeline
            {
                $skip: skip,
            },
            {
                $limit: limit_,
            },
            //get most newes to oldest
            {
                $sort: {
                    createdAt: -1
                }
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
                    readingTime: 1,
                    comments: 1,
                    readCount: 1,
                    unicUrlTitle: 1,
                },
            },
        ];

        // Fetch stories using the aggregation pipeline
        const stories = await Story.aggregate(pipeline);

        return {
            stories,
            totalStories: totalCount[0] ? totalCount[0].totalStories : 0,
            top5Stories,
            languagesArray
        };

    } catch (error) {
        console.error(error);
        throw new Error("An error occurred while fetching stories with pagination.");
    }
}



// getTop5Stories function to get top 5 stories using this story language and tags
async function getTop6Stories(story) {
    try {
        const top5Stories = await Story.aggregate([
            {
                $match: {
                    $and: [
                        {
                            _id: { $ne: story._id } // Exclude the current story
                        },
                        {
                            $or: [
                                {
                                    tags: {
                                        $in: story.tags
                                    }
                                },
                                {
                                    language: story.language
                                }
                            ]
                        }
                    ]
                }
            },
            {
                $sort: {
                    upvoteCount: -1
                }
            },
            {
                $limit: 6
            }
        ]);

        return top5Stories;
    } catch (error) {
        console.error("Error in getTop5Stories:", error);
        throw error; // Propagate the error for handling by the calling code
    }
}




// FUNCTIONS
function cleanStory(text) {
    // Remove double quotes and extra whitespaces
    const cleanedText = text.replace(/["“”]/g, '').replace(/\s+/g, ' ').trim();
    return cleanedText;
}


async function formatStory(text) {

    // Remove double quotes and extra whitespaces
    text = cleanStory(text);

    const doc = nlp(text);
    const sentences = doc.sentences().out('array');

    // Wrap each sentence ending with .?! in a <p> tag
    const formattedText = sentences
        .map((sentence) => {
            // Check if the sentence ends with .?!
            if (/[.?!]$/.test(sentence)) {
                return `<p class="sentence_p">${sentence.trim()}</p>`;
            } else {
                return sentence.trim();
            }
        })
        .join('');

    return `<div id="story">${formattedText}</div>`;
    
}






  
  
  







