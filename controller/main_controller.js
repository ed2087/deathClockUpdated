//get jsonfiles
import {readFileAPI} from "../utils/readFiles.js";

//add model
import Question from "../model/user.js";


export const index = async (req, res, next) => {


        const file = await readFileAPI("questions_api.json");

        res.status(200).render("index",{
            path: "/",
            title: "home page",
            // get token from locals.
            csrfToken: res.locals.csrfToken
        })

};


//deathclockQuestions
export const deathclockQuestions = async (req, res, next) => {

    res.status(200).render("deathclockQuestions",{
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

        if(user){
            //render deathclockResults
            res.status(200).render("deathclockResults",{
                path: "/deathclockResults",
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