
const User = require("../model/user.js");

const refreshUserSession = async (req, res, next) => {
  const user = req.session.user;

    if (user) {
        try {       

        const userD = await User.findById(user.id);
        
        if (userD) {

                //remove unneeded data
                const userDObject = userD.toObject();

                const {
                  activateToken,
                  passwordResetToken,
                  passwordResetTokenTimes,
                  passwordResetTokenDate,
                  createdAt,
                  updatedAt,
                  password,
                  ...userSession
                } = userDObject;

                userSession.id = userD._id;
                userSession.userId = userD._id;

                req.session.user = userSession;
                await req.session.save();
        } else {
            // Handle case where user no longer exists (optional)
            req.session.destroy(); // Destroy session if user no longer exists
        }

        next();
        } catch (err) {
        next(err); // Pass error to the error handling middleware
        }
  } else {
    next();
  }
};

module.exports = refreshUserSession;










// const ActiveUser = require('../models/user.js');

// module.exports = (req, res, next) => {
 
//     const user = req.session.userData;

//     if(user){
        
//         ActiveUser.findById({_id: user._id})
//         .then(userD => {        
//             req.session.userData = userD;
//             req.session.save()
//             next();
//         })
//     }else {
//         next()
//     }
    

// };