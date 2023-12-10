const express = require('express');
const router = express.Router();
//express-validator
const { check, body } = require("express-validator");

//utils\auth.js
const { isAuthenticated } = require("../utils/auth.js");
//csrf
const { checkCsrf, checkCsrfToken } = require("../utils/csrf.js");
// Controller
const {loginPage,registerPage,postLogin,postRegister,activateAccount,verificationPage,resendVerification,logout,checkUserName} = require("../controller/user_controller.js");


// Login page
router.get("/login", isAuthenticated, loginPage);

// Login post
router.post("/login",[

    //check email
    check(
        "email",
        "Please enter valid Email"
    )
        .isEmail()
        .normalizeEmail(),//this will fix email // sanitazer
    //trim password
    check(
        "password"
    ) 
        .trim(),

],checkCsrfToken, postLogin);

// Register page
router.get("/register", isAuthenticated, registerPage);

// Register post
router.post("/register", [
    //check username
    check("username")
        .isLength({ min: 5, max:20 })
        .withMessage("Username must be between 5 to 20 characters")
        .isString(),
    //check email
    check("email")
        .isEmail()
        .withMessage("Please enter valid Email")
        .normalizeEmail(),
    //check password
    check(
        "password",
        "Please enter a password at least 10 character and contain At least one uppercase.At least one lower case.At least one special character. ",
    )            
        .isLength({min: 10})
        .matches(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,
        )
        .trim(),
    //check password2 match with password
    check("confirmPassword",
        "passwords do not match"
    )
        .trim()
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match")
            }
            return true;
        })
], checkCsrfToken, postRegister);


//logout
router.get("/logout", logout);

//verification page
router.get("/verificationPage", verificationPage);

// Resend verification link
router.get("/resenverificationLink/:id", resendVerification);

// Activate account
router.get("/activate/:token", activateAccount);

//check username
router.get("/userName", checkUserName);

module.exports = router;
