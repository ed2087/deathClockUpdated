// Submission model
const Story = require("../model/submission.js");
const User = require("../model/user.js");
const Message = require('../model/storyComments.js');
const uuidv4 = require('uuid').v4;
const bcrypt = require("bcryptjs");
// utils
const {someUserInfo,calculateReadingTime,GetStories} = require("../utils/utils_fun.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");
const { response } = require("express");
const {sendEmail,htmlTemplate} = require("../utils/sendEmail.js");

//search user stories
class searchMechanism { 

    // Get stories by rank from top to lowest
    async getUsersStoriesByRank(req, res, limit, userID) {
        try {
            
            //get stories from db sort by top ranking by upvotes and make sure that isApproved and they belong to the user
            const stories = await Story.find({ owner: userID, isApproved: true }).sort({ upvoteCount: -1 }).limit(limit).populate('owner').exec();
           
            return stories;

        } catch (error) {
            return null;
        }
    }

    // Search user stories
    async userStoriesSearch(db, req, res, searchTerm, limit, userID) {
        try {
            const collection = db.collection('stories');
            const stories = await collection.find({ 
                $text: { $search: searchTerm } 
            }).limit(limit).toArray();
            return stories;
        } catch (error) {
            return null;
        }
    }


    // find user by ether username or email or id
    async findUser(req, res, searchTerm) {
        try {
            const user = await User.findOne({ $or: [{ username: searchTerm }, { email: searchTerm }, { _id: searchTerm }] });
            return user;
        }catch (error) {
            return null;
        }

    }
    
}

// profilePge
const formatCount = (count) => {
    if (count >= 1000 && count < 1000000) {
        return (count / 1000).toFixed(count % 1000 !== 0 ? 1 : 0) + 'k';
    } else if (count >= 1000000 && count < 1000000000) {
        return (count / 1000000).toFixed(count % 1000000 !== 0 ? 1 : 0) + 'M';
    } else if (count >= 1000000000) {
        return (count / 1000000000).toFixed(count % 1000000000 !== 0 ? 1 : 0) + 'B';
    }
    return count.toString();
};

const follow_upvotes_stories_comments_Search = async (req, res, id) => {
    console.log(typeof id)
    // Aggregate followers count
    const userFollowers = await User.aggregate([
        { $match: { _id: id } },
        { $project: { followersCount: { $cond: { if: { $isArray: "$followers" }, then: { $size: "$followers" }, else: 0 } } } }
    ]);

    // Aggregate stories count
    const userStories = await Story.aggregate([
        { $match: { owner: id } },
        { $group: { _id: null, storiesCount: { $sum: 1 } } }
    ]);

    // Aggregate upvotes count
    const userUpvotes = await Story.aggregate([
        { $match: { owner: id } },
        { $group: { _id: null, upvotes: { $sum: "$upvoteCount" } } }
    ]);

    // Aggregate comments count
    const userComments = await Story.aggregate([
        { $match: { owner: id } },
        { $project: { commentsCount: { $cond: { if: { $isArray: "$comments" }, then: { $size: "$comments" }, else: 0 } } } },
        { $group: { _id: null, comments: { $sum: "$commentsCount" } } }
    ]);

    // Extract counts
    let followersCount = userFollowers.length > 0 ? userFollowers[0].followersCount : 0;
    let storiesCount = userStories.length > 0 ? userStories[0].storiesCount : 0;
    let upvotes = userUpvotes.length > 0 ? userUpvotes[0].upvotes : 0;
    let comments = userComments.length > 0 ? userComments[0].comments : 0;

    // Format counts
    const formattedData = {
        followersCount: formatCount(followersCount),
        storiesCount: formatCount(storiesCount),
        upvotes: formatCount(upvotes),
        comments: formatCount(comments)
    };

    return formattedData;
};


exports.profilePage = async (req, res, next) => {
    try {        
        const { userName, userActive, userData } = await someUserInfo(req, res, next);

        let profileOwner = null;
        let isOwner = false;

        if (userName !== req.params.userName) {
            const otherUser = await User.findOne({ username: req.params.userName });

            if (otherUser) {
                const {followersCount,storiesCount,upvotes,comments} = await follow_upvotes_stories_comments_Search(req, res, otherUser._id);

                profileOwner = {
                    username: otherUser.username,
                    legalName: otherUser.legalName,
                    id: otherUser._id,
                    email: otherUser.email,
                    role: otherUser.role,
                    userVerified: otherUser.userVerified,
                    userOnline: true,
                    isStoryAllowed: otherUser.isStoryAllowed,
                    isCommentAllowed: otherUser.isCommentAllowed,
                    isBanned: otherUser.isBanned,
                    bio: otherUser.bio,
                    followersCount,
                    storiesCount,
                    upvotes,
                    comments,
                    socialLinks: otherUser.socialLinks
                };
            } else {
                console.log('Profile not found');
                return globalErrorHandler(req, res, 404, "Oops! Something went wrong. Profile not found.");
            }
        } else {
            const userdb = await User.findOne({ _id: userData.id });

            const { followersCount, storiesCount, upvotes, comments } = await follow_upvotes_stories_comments_Search(req, res, userdb._id);

            profileOwner = userData;
            profileOwner.followersCount = followersCount;
            profileOwner.storiesCount = storiesCount;
            profileOwner.upvotes = upvotes;
            profileOwner.comments = comments;

            isOwner = true;
        }

        const search = new searchMechanism();
        const stories = await search.getUsersStoriesByRank(req, res, 40, profileOwner.id);
      
        res.render('profile', {
            path: '/profile',
            title: `TerrorHub - ${userName}`,
            description: `TerrorHub - ${userName}`,
            csrfToken: res.locals.csrfToken,
            userActive,
            userName,
            userData,
            stories,
            profileOwner,
            isOwner
        });

    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};


exports.profilePageURLS = async (req, res, next) => {
    try {
        let {reddit, instagram, twitter, tumblr, facebook, tiktok, youtube, linkedin, website} = req.body;

        const urlPatterns = {
            reddit: /^https:\/\/(www\.)?reddit\.com\/user\/[A-Za-z0-9_]+\/?$/,
            instagram: /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?(\?next=%2F)?$/,
            twitter: /^https:\/\/(x|twitter)\.com\/[A-Za-z0-9_]+\/?$/,
            tumblr: /^https:\/\/(www\.)?tumblr\.com\/[A-Za-z0-9_-]+\/?$/,
            facebook: /^https:\/\/(www\.)?facebook\.com\/[A-Za-z0-9_.]+\/?$/,
            tiktok: /^https:\/\/(www\.)?tiktok\.com\/@?[A-Za-z0-9_.-]+\/?$/,
            linkedin: /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+\/?$/,
            youtube: /^https:\/\/(www\.)?youtube\.com\/(channel\/|c\/|@)[A-Za-z0-9_-]+\/?$/,
            website: /^https:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,6}(\/.*)?$/
        };

        const socialLinks = {reddit, instagram, twitter, tumblr, facebook, tiktok, youtube, linkedin, website};

        for (const [key, value] of Object.entries(socialLinks)) {
            if (value.trim() && !urlPatterns[key].test(value.trim())) {
                return globalErrorHandler(req, res, 400, `Invalid ${key} URL, This website requires Javascript to be turned on.`);
            }
        }

        const { userName, userActive, userData } = await someUserInfo(req, res, next);
        const user = await User.findOne({ _id: userData.id });

        if (!user) {
            return globalErrorHandler(req, res, 404, "User not found.");
        }

        // Update the URLs in the database
        user.socialLinks.redditUrl = reddit.trim();
        user.socialLinks.instagramUrl = instagram.trim();
        user.socialLinks.twitterUrl = twitter.trim();
        user.socialLinks.tumblrUrl = tumblr.trim();
        user.socialLinks.facebookUrl = facebook.trim();
        user.socialLinks.tiktokUrl = tiktok.trim();
        user.socialLinks.youtubeUrl = youtube.trim();
        user.socialLinks.linkedinUrl = linkedin.trim();
        user.socialLinks.websiteUrl = website.trim();

        await user.save();

        // Update the session
        req.session.user.socialLinks = user.socialLinks;
        req.session.save(async (err) => {
            if (err) {
                console.log(err);
                return globalErrorHandler(req, res, 500, "An error occurred while updating social links.");
            } else {
                res.status(200).redirect(`/profile/u/${userName}`);
            }
        });
        
    } catch (error) {
        console.log(error);
        globalErrorHandler(req, res, 500, "An error occurred while updating social links.");
    }
};


// exports.profilePageURLS = async (req, res, next) => {
//     try {

//         let {reddit,instagram,twitter,tumblr,facebook,tiktok,youtube,linkedin,website} = req.body;

//         const { userName, userActive, userData } = await someUserInfo(req, res, next);
//         const user = await User.findOne({ _id: userData.id });

//         if (!user) {
//             return globalErrorHandler(req, res, 404, "User not found.");
//         }

//         // Update the urls in the database
//         user.socialLinks.redditUrl = reddit;
//         user.socialLinks.instagramUrl = instagram;
//         user.socialLinks.twitterUrl = twitter;
//         user.socialLinks.tumblrUrl = tumblr;
//         user.socialLinks.facebookUrl = facebook;
//         user.socialLinks.tiktokUrl = tiktok;
//         user.socialLinks.youtubeUrl = youtube;
//         user.socialLinks.linkedinUrl = linkedin;
//         user.socialLinks.websiteUrl = website;

//         await user.save();
//         //update the session
//         req.session.user.socialLinks = user.socialLinks;
//         req.session.save( async (err) => {
//             if (err) {
//                 console.log(err);
//                 return globalErrorHandler(req, res, 500, "An error occurred while updating social links.");
//             }else{
//                 res.status(200).redirect(`/profile/u/${userName}`);
//             }
//         });
        
//     } catch (error) {
//         console.log(error);
//         globalErrorHandler(req,res,500,"An error occurred while updating social links.");
//     }
// };

exports.followUser = async (req, res, next) => {
    
    try {
        const userTryingToFollow = req.params.userName.trim();
        const userToFollow = await User.findOne({ username: userTryingToFollow });        

        const { userName, userActive, userData } = await someUserInfo(req, res, next);
        const activeUser = await User.findOne({ _id: userData.id });

        if (!userToFollow) {
            return globalErrorHandler(req, res, 404, "User not found.");
        }

         const isFollow = activeUser.following.includes(userToFollow._id);

        if (!isFollow) {

            //add save to following for the active user
            activeUser.following.push(userToFollow._id);
            await activeUser.save();

            //ad save to followers for the user that is being followed
            userToFollow.followers.push(activeUser._id);
            await userToFollow.save();

            //update the session
            req.session.user.following = activeUser.following;
            req.session.save( async (err) => {
                if (err) {
                    console.log(err);
                    return globalErrorHandler(req, res, 500, "An error occurred while following the user.");
                }

                //send email to the user that is being followed
                let followerCount = formatCount(userToFollow.followers.length);
                let html = htmlTemplate(`                    
                        <h2>Followed</h2>
                        <p>You have been followed by ${activeUser.username}.</p>
                        <p>You now have ${followerCount} followers.</p>
                    `
                );
                await sendEmail(userToFollow.email, "Followed", html);            

                res.json({
                    message: `You are now following ${userToFollow.username}.`,
                    status: "ok",
                    numFollowers: formatCount(userToFollow.followers.length)
                });

            });
            

        } else {
            res.status(400).json({
                message: `You are already following ${userToFollow.username}.`,
                status: "error"            
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while following the user." });
    }
};

// Unfollow user
exports.unfollowUser = async (req, res, next) => {
    
    try {
        const userTryingToUnfollow = req.params.userName.trim();
        const userToUnfollow = await User.findOne({ username: userTryingToUnfollow });

        const { userName, userActive, userData } = await someUserInfo(req, res, next);
        const activeUser = await User.findOne({ _id: userData.id });

        if (!userToUnfollow) {
            return globalErrorHandler(req, res, 404, "User not found.");
        }

        const isFollow = activeUser.following.includes(userToUnfollow._id);

        if (isFollow) {
            // Remove from following for the active user
            activeUser.following = activeUser.following.filter(
                userId => !userId.equals(userToUnfollow._id)
            );
            await activeUser.save();

            // Remove from followers for the user that is being unfollowed
            userToUnfollow.followers = userToUnfollow.followers.filter(
                userId => !userId.equals(activeUser._id)
            );
            await userToUnfollow.save();


            //update the session
            req.session.user.following = activeUser.following;
            req.session.save( async (err) => {
                if (err) {
                    console.log(err);
                    return globalErrorHandler(req, res, 500, "An error occurred while unfollowing the user.");
                }else{
                    res.json({
                        message: `You have unfollowed ${userToUnfollow.username}.`,
                        status: "ok",
                        numFollowers: formatCount(userToUnfollow.followers.length)
                    });
                }
            });

            
        } else {
            res.status(400).json({
                message: `You are not following ${userToUnfollow.username}.`,
                status: "error"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while unfollowing the user." });
    }
};



// Update user profile
exports.updateBio = async (req, res, next) => {
    try {
        
        const { userName, userActive, userData } = await someUserInfo(req, res, next);
        const user = await User.findOne({ _id: userData.id });
        
        if (!user) {
            return globalErrorHandler(req, res, 404, "User not found.");
        }

        user.bio = req.body.bio;
        req.session.user.bio = req.body.bio;
        await user.save();
        req.session.save( (err) => {
            if (err) {
                console.log(err);
                return globalErrorHandler(req, res, 500, "An error occurred while updating bio.");
            }
            res.status(200).redirect(`/profile/u/${userName}`);            
        });
        
    } catch (error) {
        console.log(error);
        return globalErrorHandler(req, res, 500, "An error occurred while updating bio.");
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { userName, userActive, userData } = await someUserInfo(req, res, next);
        const user = await User.findOne({ _id: userData.id });

        if (!user) {
            return globalErrorHandler(req, res, 404, "User not found.");
        }

        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
            return globalErrorHandler(req, res, 400, "Current password is incorrect.");
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        let saved = await user.save();
        
        
        if (saved){

            let html = htmlTemplate(`
                <h2>Password Updated</h2>
                <p>Your password has been updated successfully.</p>
            `);

            await sendEmail(user.email, "Password Updated", html);

            res.status(301).redirect("/user/logout");
        }else {
            return globalErrorHandler(req, res, 500, "An error occurred while updating password.");
        }

        
    } catch (error) {
        console.log(error);
        globalErrorHandler(req,res,500,"An error occurred while updating password.");
    }
};

exports.updateUsername = async (req, res, next) => {
    try {
        const { userName, userActive, userData } = await someUserInfo(req, res, next);
        const user = await User.findOne({ _id: userData.id });

        if (!user) {
            return globalErrorHandler(req, res, 404, "User not found.");
        }


        //check if the new username is already taken
        const usernameExists = await User.findOne({ username: req.body.newUsername });

        if (usernameExists)  {
            return globalErrorHandler(req, res, 400, "Username already taken. Do not Turn Javascript off.");
        }

        user.username = req.body.newUsername;
        req.session.user.username = req.body.newUsername;
        req.session.username = req.body.newUsername;        
        await user.save();


        //find all stories that belong to the user and update the username
        const stories = await Story.find({ owner: userData.id });
        stories.forEach(async story => {
            story.creditingName = req.body.newUsername;
            await story.save();
        });

        //find all comments that belong to the user and update the username
        await Message.updateMany({ userId: userData.id }, { $set: { userName: req.body.newUsername } });

        req.session.save((err) => {
            if (err) {
                console.log(err);
                return globalErrorHandler(req, res, 500, "An error occurred while updating username.");
            }

            res.status(200).redirect(`/profile/u/${req.body.newUsername}`);
            
        });


    } catch (error) {
        console.log(error);
        return globalErrorHandler(req, res, 500, "An error occurred while updating username.");
    }
};




// load stories

exports.loadMoreStories = async (req, res, next) => {
    try {
        const userName = req.params.userName.trim();
        const user = await User.findOne({ username: userName });
        const skip = parseInt(req.query.skip) || 0;
        const searchTerm = req.query.q || "";
        const limit = searchTerm ? 10 : 40; // Load 40 stories if no search term, else 10

        const query = { owner: user.id, isApproved: true };
        if (searchTerm) {
            query.$text = { $search: searchTerm };
        }

        const stories = await Story.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        const totalStories = await Story.countDocuments(query);

        res.json({
            stories,
            totalStories,
            hasMore: skip + stories.length < totalStories
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while loading more stories." });
    }
};

exports.searchUserStories = async (req, res, next) => {
    try {
        const userName = req.params.userName.trim();
        const user = await User.findOne({ username: userName });
        const searchTerm = req.query.q.toLowerCase() || "";

        //if searchTerm not a string return an empty string 
        if (typeof searchTerm !== "string") searchTerm = "";

        let stories;
        if (searchTerm) {
            stories = await Story.aggregate([
                {
                    $match: {
                        owner: user._id,
                        isApproved: true,
                        $text: { $search: searchTerm }
                    }
                },
                {
                    $sort: {
                        score: { $meta: "textScore" }
                    }
                },
                {
                    $limit: 20
                }
            ]);
        } else {
            stories = await Story.aggregate([
                {
                    $match: {
                        owner: user._id,
                        isApproved: true
                    }
                },
                {
                    $addFields: {
                        score: {
                            $add: [
                                { $multiply: ["$upvoteCount", 3] },
                                { $multiply: ["$commentCount", 2] },
                                "$readCount"
                            ]
                        }
                    }
                },
                {
                    $sort: { score: -1, createdAt: -1 }
                },
                {
                    $limit: 20
                }
            ]);
        }

        res.json({ stories });

    } catch (error) {
        console.log(error);
        globalErrorHandler(req, res, 500, "An error occurred while searching user stories.");
    }
};




//delete 