// Submission model
const Submission = require("../model/submission.js");
// User model
const User = require("../model/user.js");
const { checkCsrf } = require("../utils/csrf.js");
const uuidv4 = require('uuid').v4;
// Hash password
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const _nodemailer = require("nodemailer");
const _sendgridtransport = require("nodemailer-sendgrid-transport");



const transporter = _nodemailer.createTransport(_sendgridtransport({

   auth : {
      api_key : `${process.env.SENDGRID_KEY}`
   }

}));

//utils\errorHandlers.js
const { registerValidation } = require("../utils/errorHandlers.js");


//log in page
exports.loginPage = (req, res) => {
    res.render("../views/usersInterface/login",{
        title: "Login",
        message: null,
        field: null,
    });
};

//register page
exports.registerPage = (req, res) => {
    res.render("../views/usersInterface/register",{
        title: "Register",
        message: null,
        field: null,
    });
};


//post login

exports.postLogin = async (req, res) => {
   try {

            const {email, password} = req.body;
            
            //validate
            const validate_ = registerValidation(req);

            if(validate_.length > 0) return handlingFlashError(res, "../views/usersInterface/login", "Login", validate_[0].msg, validate_[0].field)

            //check if user exist
            const user = await User.findOne({email: email});
            
            if(!user){
                //there is no user with that email
                return handlingFlashError(res, "../views/usersInterface/login", "Login", "Invalid Email or Password", "email");
            }

            //check if user is verified
            if(!user.userVerified){
                return handlingFlashError(res, "../views/usersInterface/login", "Login", "Please activate your account", "email");
            }

            //check password
            const validPassword = await bcrypt.compare(password, user.password);

            if(!validPassword){
                return handlingFlashError(res, "../views/usersInterface/login", "Login", "Invalid Email or Password", "password");
            }

            //create session
            req.session.userId = user._id;
            req.session.user = user;

            //i only need username,id,email,role
            const userSession = {
                username: user.username,
                id: user._id,
                email: user.email,
                role: user.role
            };

            //set session
            req.session.user = userSession;

            //redirect to home page
            res.redirect("/");
    
   } catch (error) {

            console.log(error);
   
   }
};

//post register

exports.postRegister = async (req, res) => {
    try {
        const {username,email,password} = req.body;

        //validate
        const validate_ = registerValidation(req);

        if(validate_.length > 0) return handlingFlashError(res, "../views/usersInterface/register", "Register", validate_[0].msg, validate_[0].field)

        
        //incript password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //check if user exist
        const userExist = await User.findOne({email: email});

        if(userExist) return handlingFlashError(res, "../views/usersInterface/register", "Register", "Email already exist", "email");

        //create user
        const user = new User({
            username: username,
            email: email,
            password: hashedPassword,
            activateToken: uuidv4()
        });

        //save user
        const userSaved = await user.save();

        
        if(userSaved){

            //send email
            const output = `
                <h2>Thank you for registering</h2>
                <p>Click on the link below to activate your account</p>
                <a href="http://localhost:3000/user/activate/${user.activateToken}">Activate</a>
            `;

            const mailOptions = {
                from : `${process.env.EMAIL}`,
                to : `${email}`,
                subject : "Account Activation",
                html : output
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if(err){
                    return console.log(err);
                }
            });

            //send to login page
            res.render("../views/usersInterface/verifyEmail.ejs",{
                title: "Resend Activation Link",
                message: null,
                field: null,
                id: userSaved._id,
                activateToken: userSaved.activateToken
            });

        }


    } catch (error) {

        console.log(error);        
        
    }

};


//activate account
exports.activateAccount = async (req, res) => {
    try {

        const token = req.params.token;

        //check if token exist
        const user = await User.findOne({activateToken: token});

        //add message to error handler ejs ************
        if(!user) return res.status(400).send("Invalid token");

        //update user
        user.activateToken = null;
        user.userVerified = true;

        //save user
        const userSaved = await user.save();

        if(userSaved){
            //redirect to login page
            res.redirect("/user/login");
        }

    } catch (error) {
        console.log(error);
    }

};

// Logout
exports.logout = async (req, res) => {
    try {      
        // Destroy the session
        req.session.destroy();

        // Redirect to the login page
        res.redirect("/user/login");
    } catch (error) {
        console.log(error);
    }

};

//resent activation link post
exports.resendVerification = async (req, res) => {
        try {
            const {id} = req.body;
            console.log(id);
        } catch (error) {
            
        }
};



function handlingFlashError (res, urlPath, title, msg, path) {
    res.render(urlPath, {
        title: title,
        message: msg,
        field: path
    });
}


//passworD2087
//http://localhost:3000/user/activate/9e210301-23d9-45d6-bae9-bce2322e23d9