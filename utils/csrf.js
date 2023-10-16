// Check CSRF utils globally

const csrf = require('csrf');

const tokens = new csrf();

module.exports.checkCsrf = function (req, res, next, manualCSRF) {
    // Get token from req
    const token = req.body._csrf || manualCSRF;
    console.log(token);
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
