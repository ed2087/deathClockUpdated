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