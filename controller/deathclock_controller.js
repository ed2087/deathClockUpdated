//get jsonfiles
import {readFileAPI} from "../utils/readFiles.js";

//add model
import Question from "../model/user.js";
import e from "connect-flash";



//deathclockQuestions
export const deathclockQuestions = async (req, res, next) => {

    res.status(200).render("mortality_questions",{
        path: "/deathclockQuestions",
        title: "The Time Ticker: How Long Have You Go",
        csrfToken: res.locals.csrfToken
    })

};


//deathclockResults
export const deathclockResults = async (req, res, next) => {

    const id = req.params.id;


    try {

        //get user data
        const user = await Question.findOne({shortId: id});
        //get all users death

        if(user){
            //render deathclockResults
            res.status(200).render("mortality_results",{
                path: "/mortality_results",
                title: "The Time Ticker: How Long Have You Go",
                csrfToken: res.locals.csrfToken,
                user: user
            })
        }else{
            console.log("user not found");
            res.redirect("/");
        }

        
    } catch (error) {

        console.log(error);
        res.redirect("/");
        
    }

};



//graveyard where all users are listed

export const graveyard = async (req, res, next) => {
    
        try {
    
            //get all users
            const users = await Question.find();

            //loop through users  and get only the ones that user.allowed is true    
            
            const allowedUsers = users.filter((user) => { return user.allowed === true; });
            
            const package_ = allowedUsers.map((user) => {
                
                    return {
                        userName: user.name,
                        userShortId: user.shortId,
                        clock: user.clock
                    }

            });
    
            if(users){
                //render deathclockResults
                res.status(200).render("graveyard",{
                    path: "/graveyard",
                    title: "The Time Ticker: How Long Have You Go",
                    csrfToken: res.locals.csrfToken,
                    users: package_
                })
            }else{
                console.log("user not found");
                res.redirect("/");
            }
    
            
        } catch (error) {
    
            console.log(error);
            res.redirect("/");
            
        }
    
};



//update user clock
export const updateUserClock = async (req, res, next) => {

    const body = req.body;

    let pYear = body.predictedDeathYear;
    let pMonth = body.yearsLeft;
    let pWeek = body.monthsLeft;
    let pDay = body.daysLeft;
    let pHour = body.hoursLeft;
    let pMinute = body.minutesLeft;
    let pSecond = body.secondsLeft;
    

    try {
            
            //update and return json with a ok status
            const user = await Question.findOne({shortId: body.shortId}); 
            
            //get all users death clock.predictedDeathYear use agregate to get averages
            const usersAvg = await Question.aggregate([
                { $group: { _id: null, avg: { $avg: "$clock.predictedDeathYear" } } }
            ]);

            //get all users death clock.predictedDeathYear use agregate to get averages
            const usersMax = await Question.aggregate([
                { $group: { _id: null, max: { $max: "$clock.predictedDeathYear" } } }
            ]);

            //get all users death clock.predictedDeathYear use agregate to get averages
            const usersMin = await Question.aggregate([
                { $group: { _id: null, min: { $min: "$clock.predictedDeathYear" } } }
            ]);

            //update users clock
            user.clock.predictedDeathYear = pYear;
            user.clock.yearsLeft = pYear;
            user.clock.monthsLeft = pMonth;
            user.clock.weeksLeft = pWeek;
            user.clock.daysLeft = pDay;
            user.clock.hoursLeft = pHour;
            user.clock.minutesLeft = pMinute;
            user.clock.secondsLeft = pSecond;
            user.clock.expectedFutureDate = body.expectedFutureDate;

            //updatedAt
            user.updatedAt = Date.now();

            //save user
            const updated = await user.save();

            //if updated
            if(updated){
                console.log("user updated");
                res.status(200).json({
                    status: "ok",
                    data: {
                        usersAvg,
                        usersMax,
                        usersMin
                    }
                });
            }else{
                console.log("user not updated");
                res.status(200).json({
                    status: "not ok",
                    data: data
                });
            }    
            
        } catch (error) {

            console.log(error);
            res.redirect("/");
            
        }

};