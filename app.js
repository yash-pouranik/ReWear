if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}


const express = require("express");
const app = express();

const mongoose = require("mongoose");

const path = require("path");

const methodOverride = require("method-override");

const ejsmate = require("ejs-mate");

const passport = require("passport");

const LocalStrategy = require("passport-local");

const session = require("express-session");

const MongoStore = require("connect-mongo");

const flash = require("connect-flash");


//Collections
const User = require("./models/user");


//requiring routes
const homeRoutes = require("./routes/home");
const userRoutes = require("./routes/user");

const dbUrl = process.env.DBURL;

async function main () {
    await mongoose.connect(dbUrl);
}
main()
.then(() => {
    console.log("connected to DB");
})
.catch(() => {
    console.log("DB not conncted");
});


//middlewares
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
//to serve static files
app.use(express.static(path.join(__dirname, "public")));

// flash a message top par, for succes / failure
app.use(flash());


//view engine setup
app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


//setting session
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600 // 1 day
  }),
  secret: process.env.SESSION_SECRET || "thisisnotagoodsecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

app.use(session(sessionConfig));



//setting up passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// res. locals
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});




//adding routes
app.use("/", homeRoutes); // mount at root
app.use("/", userRoutes);




app.use((req, res) => {
  res.status(404).render("error/defaultError", { title: "Page Not Found" });
});




app.listen(process.env.PORT || 3000, () => {
    console.log("listening on port");
})