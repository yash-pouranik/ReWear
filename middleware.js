module.exports.isLoggedin = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirect = req.originalUrl;
        console.log(req.path)
        console.log("Not logged in!");
        req.flash("error", "you must be logged in.");
        return res.redirect("/login");
    }
    next();
};

module.exports.alreadyLoggedIn = (req, res, next) => {
    if(!req.user){
         return next();
    } else{
        req.flash("success", "Already Logged In")
        res.redirect("/");
    }
}