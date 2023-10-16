//auth session

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        console.log("User is authenticated");

        if (req.session.user.userVerified) {
            console.log("User is verified");

            if (["/login", "/register"].includes(req.url)) {
                return res.redirect("/");
            }

            return next(); // Allow access to the route if the user is authenticated
        } else {
            console.log("User is not verified");
            return res.redirect(`/user/resendVerificationLink/${req.session.userId}`);
        }
    }

    // Allow access to the login and register pages
    if (["/login", "/register"].includes(req.url)) {
        return next();
    }

    return res.redirect('/user/login'); // Redirect to the login page if not authenticated
}



//export
module.exports = { 
    isAuthenticated
};