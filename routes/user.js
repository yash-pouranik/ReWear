const User = require("../models/user");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const {alreadyLoggedIn, isLoggedin} = require("../middleware.js")




router.get("/auth/signup", alreadyLoggedIn, (req, res) => {
    res.render("user/signup", {title: "SignUP"});
})

router.post("/auth/signup", alreadyLoggedIn, async(req, res) => {
    try{
        let {username, email, password} = req.body;

        const existingUser = await User.findOne({ username });
            if (existingUser) {
            req.flash("error", "Username already taken.");
            return res.redirect("/auth/signup");
        }



        const newuser = new User({email, username});
        let rUser = await User.register(newuser, password);
        console.log("User registered named: ", rUser);

        req.login(rUser, async(err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to .bitBros!");
            res.redirect("/");  
        })
    } catch(e) {
        console.log("not signed up", e);
        req.flash("error", e.message);
        res.redirect("/auth/signup");
    }
})




router.get("/auth/login", alreadyLoggedIn, (req, res) => {
    res.render("user/login", {title: "Login"});
})

router.post("/auth/login", alreadyLoggedIn, 
    passport.authenticate(
            "local",
            {
                failureRedirect: "/login",
                failureFlash: true,
            }
        ), 
        async(req, res) => {
        req.flash("success", "Welcome back! you are logged in");
        console.log(req.user);
        res.redirect("/");
})

router.get("/logout", (req,res,next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "Logged out Successfully!")
        res.redirect("/");
    })
})


router.get("/dashboard/:id", isLoggedin, (req, res) => {
    res.render("user/dashboard.ejs", {user: req.user});
})





module.exports = router;