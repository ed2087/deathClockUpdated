//flashes error messages
const { check, validationResult } = require("express-validator");
const {someUserInfo} = require("../utils/utils_fun.js");

const registerValidation =  (req) => {

    const errors = validationResult(req);
    //return msg, and path
    const errorsArray = errors.array();

    //retun only msg and path
    const errorsArrayMsg = errorsArray.map((item) => {
        return {
            msg: item.msg,
            field: item.path,
        };
    });

    return errorsArrayMsg;
}


const globalErrorHandler = (req, res, statusCode, message, error) => {

        

        // 404 error-  page not found
        if(statusCode === 404) return displayError(req, res, statusCode, message);  
        
        // 500 error - internal server error
        if(statusCode === 500) return displayError(req, res, statusCode, message);

        // 422 error - validation error
        if(statusCode === 422) return displayError(req, res, statusCode, message);

        // 401 error - unauthorized
        if(statusCode === 401) return displayError(req, res, statusCode, message);

        // 403 error - forbidden
        if(statusCode === 403) return displayError(req, res, statusCode, message);
        
        // 400 error - bad request
        if(statusCode === 400) return displayError(req, res, statusCode, message);

        // 409 error - conflict
        if(statusCode === 409) return displayError(req, res, statusCode, message);


        //if nothing matches return 500 error
        return displayError(req, res, 500, "Internal Server Error");


    

};


const displayError = (req, res, statusCode, message) => {
    
    const {userName, userActive} = req.session;

    res.status(statusCode).render("errorHandler", {

        title: "Error",
        path: "/errorHandler",
        statusCode: statusCode,
        message: message,
        userActive,
        userName,
        
    });

};





module.exports = {
    registerValidation,
    globalErrorHandler
};
