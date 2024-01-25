// Check CSRF utils globally
const { registerValidation, globalErrorHandler } = require("../utils/errorHandlers.js");

const csrf = require('csrf');

const tokens = new csrf();

module.exports.checkCsrf = function (req, res, next, manualCSRF) {
    // Get token from req
    const token = req.body._csrf || manualCSRF;
   
    // Check if token is valid
    const valid = tokens.verify(process.env.SESSION_SECRET, token);

    // Check if valid
    if (valid) {
        console.log('valid csrf');

        // If manualCSRF is defined, then return true, else call next()
        return manualCSRF ? true : next();
    } else {
        console.log('invalid csrf');
        // Send to /
        return res.redirect('/');
    }
};


module.exports.checkCsrfToken = function (req, res, next) {

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        const clientToken = req.body._csrf || req.query._csrf || req.headers['x-csrf-token'];

        
        if (!clientToken) {
            return res.status(403).send('CSRF Token is missing.');
        }

        const sessionToken = process.env.SESSION_SECRET; // Adjust this based on your session setup
        
        if (!tokens.verify(sessionToken, clientToken)) {
            return res.status(403).send('CSRF Token is invalid.');
        }
    }

    console.log('valid csrf');

    next();
};




//check csrf token in the route
module.exports.csrfCheckRoute = (req, res, next) => {
    const clientToken = req.body._csrf || req.query._csrf || req.headers['x-csrf-token'];
    const sessionToken = process.env.SESSION_SECRET; // Adjust this based on your session setup

    if (!tokens.verify(sessionToken, clientToken)) {
        // send user globalErrorHandler
        return globalErrorHandler(req, res, next, 'CSRF Token is invalid.');
    }
    console.log('valid csrf');
    next();
}

