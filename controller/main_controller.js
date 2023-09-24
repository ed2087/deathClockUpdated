//get jsonfiles
import {readFileAPI} from "../utils/readFiles.js";


export const index = async (req, res, next) => {


        const file = await readFileAPI("questions_api.json");

        res.status(200).render("index",{
            path: "/",
            title: "home page"
        })

};



//deathclockQuestions
export const deathclockQuestions = async (req, res, next) => {

    res.status(200).render("deathclockQuestions",{
        path: "/deathclockQuestions",
        title: "The Time Ticker: How Long Have You Go"
    })

};