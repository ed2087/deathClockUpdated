//auth session

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        console.log("User is authenticated");
      return next(); // Allow access to the route if the user is authenticated
    }

    return res.redirect('/user/login'); // Redirect to the login page if not authenticated
}


//export
module.exports = { 
    isAuthenticated
};