// models
const Submission = require("../model/submission.js");
const User = require("../model/user.js");

//other
const {sendEmail,htmlTemplate} = require("../utils/sendEmail.js");
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");
 //check if user is logged in
 const {someUserInfo} = require("../utils/utils_fun.js");


// packages
const { checkCsrf } = require("../utils/csrf.js");
const uuidv4 = require('uuid').v4;
const bcrypt = require("bcryptjs");
const _nodemailer = require("nodemailer");
const _sendgridtransport = require("nodemailer-sendgrid-transport");

//csrf token from session


const transporter = _nodemailer.createTransport(_sendgridtransport({

   auth : {
      api_key : `${process.env.SENDGRID_KEY}`
   }

}));


//log in page
exports.loginPage = async (req, res, next) => {


    let {userName, userActive} = await someUserInfo(req, res, next);

    res.render("../views/usersInterface/login",{
        title: "Login",
        path: "/login",
        message: null,
        field: null,
        body: null,
        csrfToken: res.locals.csrfToken,
        userActive,
        userName,
    });
};

//register page
exports.registerPage = async (req, res, next) => {


    let {userName, userActive} = await someUserInfo(req, res, next);

    res.render("../views/usersInterface/register",{
        title: "Register",
        path: "/register",
        message: null,
        field: null,
        body: null,
        csrfToken: res.locals.csrfToken,
        userActive,
        userName,
    });


};


exports.checkUserName = async (req, res, next) => {
    try {
        const { userName } = req.query;

        // NAMES NOT ALLOWED TO USE BECAUSE THEY ARE FOR THE WEBSITE/ADMIN
        const namesNotAllowed =[
            "terrorhub",
            "terrorhubadmin",
            "terrorhubadministrator",
            "terrorhubadminstrator",
            "terrorhubadminstrators",
            "terrorhubadmins",
            "admin",
            "administrator",
            "administrators",
            "admins",
            "moderator",
            "moderators",
            "mod",
            "mods",
            "developer",
            "developers",
            "dev",
            "devs",
            "terrorhubdev",
            "terrorhubdeveloper",
            "terrorhubdevelopers",
            "deathclock",
            "clock",
            "death",
            "terror",
            "hub",
            "terrorhubclock",
            "terrorhubdeath",
        ]


        // Check if username is in the namesNotAllowed array
        if (namesNotAllowed.includes(userName.toLowerCase())) {
            return res.status(200).json({
                status: true,
                message: "Username exists"
            });
        }

        // Check if username exists (case-insensitive)
        const userExist = await User.findOne({ username: userName.toLowerCase() });

        if (userExist) {
            return res.status(200).json({
                status: true,
                message: "Username exists"
            });
        } else {
            return res.status(200).json({
                status: false,
                message: "Username does not exist"
            });
        }
    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error"
        });
    }
};




//post login
exports.postLogin = async (req, res, next) => {
   try {

            const {email, password} = req.body;
            
            //validate
            const validate_ = registerValidation(req);

            if(validate_.length > 0) return handlingFlashError(res,req,next, "../views/usersInterface/login", "/login", "Login", validate_[0].msg, validate_[0].field, req.body)

            //check if user exist
            const user = await User.findOne({email: email});
            
            if(!user){
                //there is no user with that email
                return handlingFlashError(res,req,next, "../views/usersInterface/login", "/login", "Login", "Invalid Email or Password", "email", req.body);
            }

            //check if user is verified
            if(!user.userVerified){
                return handlingFlashError(res,req,next, "../views/usersInterface/login", "/login", "Login", "Please activate your account", "email", req.body);
            }

            //check password
            const validPassword = await bcrypt.compare(password, user.password);

            if(!validPassword){
                return handlingFlashError(res,req,next, "../views/usersInterface/login", "/login", "Login", "Invalid Email or Password", "password", req.body);
            }

            //create session
            req.session.userId = user._id;
            req.session.user = user;

            //i only need username,id,email,role
            const userSession = {
                username: user.username,
                id: user._id,
                email: user.email,
                role: user.role,
                userVerified: user.userVerified,
                userOnline: true,
                isStoryAllowed: user.isStoryAllowed,
                isCommentAllowed: user.isCommentAllowed,
                isBanned: user.isBanned,
            };

            //set session
            req.session.user = userSession;

            //save session
            req.session.save((err) => {
                if(err) console.log(err);
            });

            //redirect to home page
            res.redirect("/");
    
   } catch (error) {

        //send to globalErrorHandler        
        globalErrorHandler(req, res, 500, "Internal Server Error", error);
   
   }
};

//post register

exports.postRegister = async (req, res, next) => {

    try {
        let {username,email,age,password} = req.body;        
        
        const currentYear = new Date();
        const userAge = new Date(age);        

        //username to lower case
        username = username.toLowerCase().trim();

        //user age
        const age_ = currentYear.getFullYear() - userAge.getFullYear();

        //check if user is 13 years old
        if(age_ < 13) return handlingFlashError(res,req,next, "../views/usersInterface/register", "/register", "Register", "You must be 13 years old to register", "age", req.body);

        //validate
        const validate_ = registerValidation(req);

        console.log(validate_);

        if(validate_.length > 0) return handlingFlashError(res,req,next, "../views/usersInterface/register", "/register",  "Register", validate_[0].msg, validate_[0].field, req.body)

        
        //incript password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //check if user exist
        const userExist = await User.findOne({email: email});

        if(userExist) return handlingFlashError(res,req,next, "../views/usersInterface/register", "/register", "Register", "Email already exist", "email", req.body);
        

        //create user
        const user = new User({
            username: username,
            email: email,
            age: userAge,
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

        //send to globalErrorHandler        
        globalErrorHandler(req, res, 500, "Internal Server Error", error);        
        
    }

};


//activate account
exports.activateAccount = async (req, res, next) => {
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
        //send to globalErrorHandler        
        globalErrorHandler(req, res, 500, "Internal Server Error", error); 
    }

};


//email verification Page

exports.verificationPage = async (req, res, next) => {

    //get id query
    const {id,activateToken} = req.query;
    let {userName, userActive} = await someUserInfo(req, res, next);

    try {

        //check if user exist
        const user = await User.findById(id);

        //check if user exist not redirect to login page
        if(!user) return res.redirect("/user/login");

        //check if user is verified
        if(user.userVerified) return res.redirect("/user/login");

        res.status(200).render("../views/usersInterface/verifyEmail.ejs",{
            title: "Resend Activation Link",
            path: "/user/verificationPage",
            message: null,
            field: null,
            id: id,
            activateToken: activateToken,
            userActive
        });

        
    } catch (error) {
        //send to globalErrorHandler        
        globalErrorHandler(req, res, 500, "Internal Server Error", error); 
    }


};

//resent activation link post
exports.resendVerification = async (req, res, next) => {
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
        //send to globalErrorHandler        
        globalErrorHandler(req, res, 500, "Internal Server Error", error); 
    }

};



// reset password 
exports.resetPasswordRequestPage = async (req, res, next) => {

    try {

        //check if user is logged in
        let {userName, userActive} = await someUserInfo(req, res, next);
        

        res.render("../views/usersInterface/resetPasswordRequest.ejs",{
            title: "Reset Password",
            path: "/user/resetPasswordRequest",
            message: null,
            field: null,
            body: null,
            userActive
        });
        
    } catch (error) {

        //send to globalErrorHandler        
        globalErrorHandler(req, res, 500, "Internal Server Error", error);
        
    }

}



//send reset password email
exports.sendResetLinkToEmail = async (req, res, next) => {

    try {

        const {email} = req.body;

        //validate
        const validate_ = registerValidation(req);

        if(validate_.length > 0) return handlingFlashError(res,req,next, "../views/usersInterface/resetPasswordRequest", "/user/resetPasswordRequest", "Reset Password", validate_[0].msg, validate_[0].field, req.body)

        //check if user exist
        const user = await User.findOne({email: email});

        if(!user) return handlingFlashError(res,req,next, "../views/usersInterface/resetPasswordRequest", "/user/resetPasswordRequest", "Reset Password", "Email does not exist", "email", req.body);



        //check if user has requested 2
        const currentDate = new Date();
        const userDate = new Date(user.passwordResetTokenDate);


        //if there date is not the same reset the count to 0
        if(currentDate.getDate() !== userDate.getDate()){
            user.passwordResetTokenTimes = 0;
            user.passwordResetTokenDate = currentDate;
        }

        //check if user has requested 2 times per day
        if(currentDate.getDate() === userDate.getDate() && user.passwordResetTokenTimes >= 2){
            //redirect to login page
            return handlingFlashError(res,req,next, "../views/usersInterface/resetPasswordRequest", "/user/resetPasswordRequest", "Reset Password", "You have reached the maximum number of password reset per day", "email", req.body);
        } 

        //generate token
        const token = uuidv4();
        //update user
        user.passwordResetToken = token;
        //add requestCount only 2 per day
        user.passwordResetTokenTimes = 1 + user.passwordResetTokenTimes;


        //save user
        const userSaved = await user.save();

        if(userSaved){

            //get website url
            const websiteUrl = `${req.protocol}://${req.get("host")}`;

            //send email
            const html = htmlTemplate(
                `
                    <h2>Reset your TerrorHub password</h2>
                    <p>Click on the link below to reset your password:</p>
                    <a href="${websiteUrl}/user/resetPassword?token=${token}&id=${user._id}">Reset your password</a>
                    
                `
            );

            //send verification email
            const email = await sendEmail(user.email, "TerrorHub Reset Password", html);

            if(email){

                //redirect to login page
                res.redirect("/user/login");

            }else{

                //redirect to login page
                globalErrorHandler(req, res, 404, "Your verification email could not be sent");

            }


        }else{

            //redirect to login page
            globalErrorHandler(req, res, 404, "Oops something went wrong!");

        }

    
    } catch (error) {
            
            //send to globalErrorHandler        
            globalErrorHandler(req, res, 500, "Internal Server Error", error);
            
    }


};


exports.resetPasswordPage = async (req, res, next) => {   
       
    try {


        const {token,id} = req.query;

        //check if user is logged in
        let {userName, userActive} = await someUserInfo(req, res, next);


        //check if user exist and token exist
        const userExist = await User.findOne({passwordResetToken: token, _id: id});


        if(!userExist){
            // redirect to login page
            return res.redirect("/user/login");
        }  
        

        res.render("../views/usersInterface/resetPassword.ejs",{
            title: "Reset Password",
            path: "/user/resetPassword",
            message: null,
            field: null,
            body: null,
            userActive,
            userID: id,
        });
        
    } catch (error) {
        console.log(error);
        //send to globalErrorHandler        
        globalErrorHandler(req, res, 500, "Internal Server Error", error);
        
    }


};



//reset password post
exports.resetPassword = async (req, res, next) => {
    try {

        const {password, id} = req.body;

        //validate
        const validate_ = registerValidation(req);

        if(validate_.length > 0) return handlingFlashError(res,req,next, "../views/usersInterface/resetPassword", "/user/resetPassword", "Reset Password", validate_[0].msg, validate_[0].field, req.body)

        //check if user exist
        const user = await User.findOne({_id: id});

        if(!user) return handlingFlashError(res,req,next, "../views/usersInterface/resetPassword", "/user/resetPassword", "Reset Password", "Email does not exist", "email", req.body);

        //incript password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //update user
        user.password = hashedPassword;


        //reset token
        user.passwordResetToken = null;
        //reset request count
        user.passwordResetTokenTimes = 0;
        user.passwordResetTokenDate = null;

        //save user
        const userSaved = await user.save();

        if(userSaved){


            //get website url
            const websiteUrl = `${req.protocol}://${req.get("host")}`;

            //send email
            const html = htmlTemplate(

                `
                    <h2>
                        Your password has been reset successfully
                    </h2>
                    <p>Your password has been reset successfully</p>
                    <a href="${websiteUrl}/user/login">Login</a>

                `
            );

            //send verification email
            const email = await sendEmail(user.email, "TerrorHub Reset Password", html);

            res.redirect("/user/login");

            
        }
        
    } catch (error) {
        console.log(error);
        //send to globalErrorHandler        
        globalErrorHandler(req, res, 500, "Internal Server Error", error);
        
    }
};

// Logout
exports.logout = async (req, res, next) => {
    try {             

        //save user
        const userSaved = await User.updateOne({_id: req.session.user.id}, {userOnline: false});


        if(!userSaved) return globalErrorHandler(req, res, 404, "Oops something went wrong!");

        //set user online to false
        req.session.user.userOnline = false;

        //save session
        req.session.save((err) => {
            if(err) console.log(err);
        });

        // Destroy the session
        req.session.destroy();

        // Redirect to the login page
        res.redirect("/");

    } catch (error) {
        //send to globalErrorHandler        
        globalErrorHandler(req, res, 500, "Internal Server Error", error); 
    }

};



async function handlingFlashError (res,req,next, urlPath, title, path, msg, path, body) {

    //check if user is logged in
    let {userName, userActive} = await someUserInfo(req, res, next);
    
    //if body is undefined
    if(body === undefined){
        body = null;
    }

    res.render(urlPath, {
        title: title,
        path: path,
        message: msg,
        field: path,
        body: body,
        userActive
    });

}



//passworD2087
//http://localhost:3000/user/activate/9e210301-23d9-45d6-bae9-bce2322e23d9

//http://localhost:3001/user/verificationPage?id=6569eab199a4b8078107ae01&activateToken=40629eb4-4e66-4e30-b379-3da46e5ffbb6