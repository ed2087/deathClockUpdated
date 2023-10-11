//flashes error messages
const { check, validationResult } = require("express-validator");


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


const globalErrorHandler = (req, res, statusCode, message) => {

    console.log(err);

    res.status(statusCode).render("errorHandler", {

        title: "Error",
        path: "/errorHandler",
        statusCode: statusCode,
        message: message,

    });

};


module.exports = {
    registerValidation,
    globalErrorHandler,
};
