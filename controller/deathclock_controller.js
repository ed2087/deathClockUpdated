//get jsonfiles
import {readFileAPI} from "../utils/readFiles.js";

//add model
import Question from "../model/user.js";



//deathclockQuestions
export const deathclockQuestions = async (req, res, next) => {

    res.status(200).render("mortality_questions",{
        path: "/deathclockQuestions",
        title: "The Time Ticker: How Long Have You Go",
        //csrfToken: res.locals.csrfToken
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
            res.status(200).render("mortality_results",{
                path: "/mortality_results",
                title: "The Time Ticker: How Long Have You Go",
                //csrfToken: res.locals.csrfToken,
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