const multer = require("multer");
const path = require("path");

// Local storage setup (you can switch to Cloudinary later)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload;



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


module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    req.flash("error", "Admin access only.");
    return res.redirect("/");
  }
  next();
};
