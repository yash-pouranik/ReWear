const express = require("express");
const router = express.Router();
const Item = require("../models/item");
// GET /
router.get("/", (req, res) => {
  res.render("homes/home", { title: ".bitBros" });
});

router.get("/new", (req, res) => {
  res.send("Add new listing");
});



module.exports = router;