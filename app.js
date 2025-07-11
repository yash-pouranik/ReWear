if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}


const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Yash");
})

app.listen(process.env.PORT, () => {
    console.log("listening on port");
})