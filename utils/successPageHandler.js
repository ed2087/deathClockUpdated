const successPagefun = (req, res, successTitle, successMessage) => {
        
        const {userName, userActive} = req.session;
    
        res.status(200).render("successPage", {
    
            title: "Success",
            path: "/successPage",
            description: "TerrrorHub - Success Message Handler",
            userActive,
            userName,
            successTitle,
            successMessage
            
        });
}


module.exports = {
    successPagefun
};