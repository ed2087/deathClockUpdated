//submission model
import Submission from "../model/submission.js";
import {checkCsrf} from "../utils/csrf.js";

//home page
export const terrorTalesPage = (req, res) => {
    res.render("terrorTales", {
         title: "Terror Tales"
    });
};

//submission page
export const submission = (req, res) => {
    res.render("submission", {
         title: "Submission"
    });
};

//submission post add checkCsrf
export  const submissionPost = async (req, res, next) => {   


        try {            

            //check csrf
            const csrf = checkCsrf(req, res, next, req.body._csrf);

            //if csrf is false return
            if (!csrf){
                //send to /
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


            console.log(req.body);

            //check if required fields are empty
            if (!legalName || !email || !storyTitle || !storySummary || !storyText || !ageVerification || !acceptedTerms || !creditingName || !categories || !tags) {
                return res.status(400).json({
                    status: 400,
                    message: "Please fill out all required fields"
                });
            }  


            //check terms and conditions if not accepted then return
            if (!termsAndConditions) {
                return res.status(400).json({
                    status: 400,
                    message: "Please accept the terms and conditions"
                });
            }


            //check if email is valid
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    status: 400,
                    message: "Please enter a valid email"
                });
            }

            //check if there is no malicious code in the fields
            const maliciousRegex = /<script>|<\/script>|<\?php|<\?=/gi;

            if (maliciousRegex.test(legalName) || maliciousRegex.test(creditingName) || maliciousRegex.test(email) || maliciousRegex.test(socialMedia) || maliciousRegex.test(website) || maliciousRegex.test(storyTitle) || maliciousRegex.test(storySummary) || maliciousRegex.test(storyText) || maliciousRegex.test(extraTags)) {
                return res.status(400).json({
                    status: 400,
                    message: "Please enter valid data"
                });
            }


            //get tags,categories and extraTags in string and convert them to array if there not empty
            let tagsArray = tags.split(",");
            let categoriesArray = categories.split(",");
            let extraTagsArray = extraTags.split(",");
            let socialMediaArray = socialMedia.split(",");
            
            if (tags && tagsArray.length > 0) {
                tags = tagsArray.map((tag) => tag.trim());
                //remove empty strings
                tags = tags.filter((tag) => tag !== "");
            }

            if (categories && categoriesArray.length > 0) {
                categories = categoriesArray.map((category) => category.trim());
                //remove empty strings
                categories = categories.filter((category) => category !== "");
            }

            if (extraTags && extraTagsArray.length > 0) {
                extraTags = extraTagsArray.map((extraTag) => extraTag.trim());
                //remove empty strings
                extraTags = extraTags.filter((extraTag) => extraTag !== "");
            }

            if (socialMedia && socialMediaArray.length > 0) {
                socialMedia = socialMediaArray.map((socialMedia) => socialMedia.trim());
                //remove empty strings
                socialMedia = socialMedia.filter((socialMedia) => socialMedia !== "");
            }

            
            //save data to database
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


            if (submission) {

                //send response
                return res.status(200).json({
                    status: 200,
                    message: "Your submission has been sent"
                });

            } else {
                    
                //send response
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