// Submission model
const Submission = require("../model/submission.js");
// User model
const User = require("../model/user.js");
const { checkCsrf } = require("../utils/csrf.js");
const uuidv4 = require('uuid').v4;
// Hash password
const bcrypt = require("bcryptjs");

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

// Submission post (add checkCsrf)
exports.submissionPost = async function (req, res, next) {
    try {
        // Check csrf
        const csrf = checkCsrf(req, res, next, req.body._csrf);

        // If csrf is false, return
        if (!csrf) {
            // Send to /
            return res.redirect('/');
        }

        let {
            legalName,
            creditingName,
            email,
            socialMedia,
            website,
            storyTitle,
            storySummary,
            tags,
            storyText,
            categories,
            extraTags,
            ageVerification,
            acceptedTerms,
            termsAndConditions
        } = req.body;

        // Check if required fields are empty
        if (!legalName || !email || !storyTitle || !storySummary || !storyText || !ageVerification || !acceptedTerms || !creditingName || !categories || !tags) {
            return res.status(400).json({
                status: 400,
                message: "Please fill out all required fields"
            });
        }

        // Check terms and conditions if not accepted then return
        if (!termsAndConditions) {
            return res.status(400).json({
                status: 400,
                message: "Please accept the terms and conditions"
            });
        }

        // Check if email is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 400,
                message: "Please enter a valid email"
            });
        }

        // Check if there is no malicious code in the fields
        const maliciousRegex = /<script>|<\/script>|<\?php|<\?=/gi;

        if (maliciousRegex.test(legalName) || maliciousRegex.test(creditingName) || maliciousRegex.test(email) || maliciousRegex.test(socialMedia) || maliciousRegex.test(website) || maliciousRegex.test(storyTitle) || maliciousRegex.test(storySummary) || maliciousRegex.test(storyText) || maliciousRegex.test(extraTags)) {
            return res.status(400).json({
                status: 400,
                message: "Please enter valid data"
            });
        }

        // Get tags, categories, and extraTags as strings and convert them to arrays if they are not empty
        let tagsArray = tags.split(",");
        let categoriesArray = categories.split(",");
        let extraTagsArray = extraTags.split(",");
        let socialMediaArray = socialMedia.split(",");

        if (tags && tagsArray.length > 0) {
            tags = tagsArray.map((tag) => tag.trim());
            // Remove empty strings
            tags = tags.filter((tag) => tag !== "");
        }

        if (categories && categoriesArray.length > 0) {
            categories = categoriesArray.map((category) => category.trim());
            // Remove empty strings
            categories = categories.filter((category) => category !== "");
        }

        if (extraTags && extraTagsArray.length > 0) {
            extraTags = extraTagsArray.map((extraTag) => extraTag.trim());
            // Remove empty strings
            extraTags = extraTags.filter((extraTag) => extraTag !== "");
        }

        if (socialMedia && socialMediaArray.length > 0) {
            socialMedia = socialMediaArray.map((socialMedia) => socialMedia.trim());
            // Remove empty strings
            socialMedia = socialMedia.filter((socialMedia) => socialMedia !== "");
        }

        // Save data to the database
        const submission = await Submission.create({
            legalName,
            creditingName,
            email,
            socialMedia,
            website,
            storyTitle,
            storySummary,
            tags,
            storyText,
            categories,
            extraTags,
            ageVerification,
            acceptedTerms,
            termsAndConditions
        });

        // // Create user if not exist
        // const user = await User.findOne({ email });
        // let user_ = undefined;

        // if (!user) {
        //     const generatePassword = uuidv4();

        //     // Hash password
        //     const salt = await bcrypt.genSalt(10);
        //     const hashPassword = await bcrypt.hash(generatePassword, salt);

        //     // Create user
        //     user_ = await User.create({
        //         name: legalName,
        //         email,
        //         password: hashPassword,
        //         contributions: {
        //             stories: submission._id,
        //             storiesCount: 1
        //         }
        //     });

        //     // Error creating user
        //     if (!user_) {
        //         return res.status(500).json({
        //             status: 500,
        //             message: "user not created"
        //         });
        //     }
        // } else {
        //     // Update user
        //     user.contributions.stories.push(submission._id);
        //     user.contributions.storiesCount = user.contributions.storiesCount + 1;
        //     user_ = await user.save();

        //     // Error updating user
        //     if (!user_) {
        //         return res.status(500).json({
        //             status: 500,
        //             message: "user not updated"
        //         });
        //     }
        // }

        if (submission) {
            // Send response
            return res.status(200).json({
                status: 200,
                message: "Your submission has been sent"
            });
        } else {
            // Send response
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
    };
};
