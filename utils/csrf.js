//check csrf utils globaly

import csrf from 'csrf';

const tokens = new csrf();


export const checkCsrf = (req, res, next, manualCSRF) => {
    
        //get token from req
        const token = req.body._csrf || manualCSRF;
        console.log(token);
        //check if token is valid
        const valid = tokens.verify(process.env.SESSION_SECRET, token);
    
        //check if valid
        if (valid) {
                console.log('valid csrf');

                //if manualCSRF is defined  then return true else next
                return manualCSRF ? true : next();
    
        } else {
    
            console.log('invalid csrf');
            //send to / 
            return res.redirect('/');
    
        }
    
};

