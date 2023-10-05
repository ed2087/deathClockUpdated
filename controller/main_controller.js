//get jsonfiles
import {readFileAPI} from "../utils/readFiles.js";

//add model
import Question from "../model/user.js";


export const index = async (req, res, next) => {


        const file = await readFileAPI("questions_api.json");

        res.status(200).render("index",{
            path: "/",
            title: "home page",
            csrfToken: res.locals.csrfToken
        })

};


