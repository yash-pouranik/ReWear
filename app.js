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


async function main () {
    await mongoose.connect("mongodb://127.0.0.1:27017/oddo_Hackathon_25");
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




app.get("/", (req, res) => {
    res.render("homes/home", {title: ".bitBros"});
})

app.listen(process.env.PORT, () => {
    console.log("listening on port");
})