const express = require("express");
const router = express.Router();

// GET /
router.get("/", (req, res) => {
  res.render("homes/home", { title: ".bitBros" });
});

module.exports = router;