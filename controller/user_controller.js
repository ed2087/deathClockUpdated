// models
const Submission = require("../model/submission.js");
const User = require("../model/user.js");

//other
const {sendEmail,htmlTemplate} = require("../utils/sendEmail.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");

// packages
const { checkCsrf } = require("../utils/csrf.js");
const uuidv4 = require('uuid').v4;
const bcrypt = require("bcryptjs");
const _nodemailer = require("nodemailer");
const _sendgridtransport = require("nodemailer-sendgrid-transport");



const transporter = _nodemailer.createTransport(_sendgridtransport({

   auth : {
      api_key : `${process.env.SENDGRID_KEY}`
   }

}));





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

        //get website url
        const websiteUrl = `${req.protocol}://${req.get("host")}`;

        if(userSaved){            

            //send email
            const html = htmlTemplate(
                `
                    <h2>Verify your TerrorHub email</h2>
                    <p>Click on the link below to verify your email address and complete your TerrorHub registration:</p>
                    <a href="${websiteUrl}/user/activate/${user.activateToken}">Verify your email</a>
                `
            );

            //send verification email
            const email = await sendEmail(user.email, "TerrorHub verification", html);

            //send to login page
            if(email){

                //add number of verifcations sent per day to user it must be a max of 2 perday save to user session
                req.session.verificationSent = 1;               

                console.log("email sent");
                //redirect to /user/verificationPage  add id and token to query
                return res.redirect(`/user/verificationPage?id=${user._id}&activateToken=${user.activateToken}`);

            }else{

                globalErrorHandler(req, res, 404, "Your verification email could not be sent");

            }

        }else{
            console.log("user not saved");
            globalErrorHandler(req, res, 404, "Oops something went wrong!");
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
        if(!user) return  globalErrorHandler(req, res, 404, "Invalid Token");

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

//verification Page

exports.verificationPage = (req, res) => {

        //get id query
        const {id,activateToken} = req.query;

        try {

            res.status(200).render("../views/usersInterface/verifyEmail.ejs",{
                title: "Resend Activation Link",
                message: null,
                field: null,
                id: id,
                activateToken: activateToken
            });

            
        } catch (error) {
            console.log(error);
        }


};

//resent activation link post
exports.resendVerification = async (req, res) => {
        try {
            const {id} = req.params;
            
            //get user
            const user = await User.findById(id);

            //check if user exist not redirect to login page
            if(!user) return res.redirect("/user/login");

            //check if user is verified
            if(user.userVerified) return res.redirect("/user/login");

            //get website url
            const websiteUrl = `${req.protocol}://${req.get("host")}`;

            //send email

            const html = htmlTemplate(
                `
                    <h2>Verify your TerrorHub email</h2>
                    <p>Click on the link below to verify your email address and complete your TerrorHub registration:</p>
                    <a href="${websiteUrl}/user/activate/${user.activateToken}">Verify your email</a>
                `
            );
            

            //check if user has sent 2 verifications
            if(req.session.verificationSent >= 2){
                //global error handler
                return globalErrorHandler(req, res, 404, "You have reached the maximum number of verifications per day");
            }


            //send verification email
            const email = await sendEmail(user.email, "TerrorHub verification", html);


            if(email){ 

                    //add number of verifcations sent per day to user it must be a max of 2 perday save to user session
                    req.session.verificationSent = 1 + req.session.verificationSent;

                    //redirect to /user/verificationPage  add id and token to query
                    return res.redirect(`/user/verificationPage?id=${user._id}&activateToken=${user.activateToken}`);
    
            }else{
                //redirect to login page
                globalErrorHandler(req, res, 404, "Your verification email could not be sent");
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



function handlingFlashError (res, urlPath, title, msg, path) {

    res.render(urlPath, {
        title: title,
        message: msg,
        field: path
    });

}


//passworD2087
//http://localhost:3000/user/activate/9e210301-23d9-45d6-bae9-bce2322e23d9