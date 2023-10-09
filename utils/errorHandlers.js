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


module.exports = {
    registerValidation,
};
