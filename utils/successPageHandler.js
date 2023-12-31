const successPagefun = (req, res, successTitle, successMessage) => {
        
        const {userName, userActive} = req.session;
    
        res.status(200).render("successPage", {
    
            title: "Success",
            path: "/successPage",
            userActive,
            userName,
            successTitle,
            successMessage
            
        });
}


module.exports = {
    successPagefun
};