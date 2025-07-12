const express = require("express");
const router = express.Router();

const Item = require("../models/item");




const middleware = require("../middleware"); // 👈 import file
const upload = middleware; // default export (upload)
const { isLoggedin } = middleware; // named export


// GET /
router.get("/", async (req, res) => {
  let items = await Item.find({});
  console.log(items);
  res.render("homes/home", { 
    title: ".bitBros",
    items
   });
});

router.get("/item/new", (req, res) => {
  res.render("homes/newItem", {title: "reWear"});
});


router.post("/items/new", isLoggedin, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, category, buyType, tags } = req.body;

    const item = new Item({
      title,
      description,
      category,
      buyType,
      tags: tags.split(",").map(t => t.trim()),
      uploader: req.user._id,
      images: req.files.map(f => `/uploads/${f.filename}`) // ✅ image URLs
    });

    await item.save();
    req.flash("success", "Item added successfully!");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while uploading.");
    res.redirect("/items/new");
  }
});


router.delete("/delete/item/:id", async (req, res) => {
  const { id } = req.params;
  await Item.findByIdAndDelete(id);
  req.flash("success", "Item deleted successfully!");
  res.redirect("/");
})

router.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("uploader");
    if (!item) return res.status(404).send("Item not found");

    res.render("homes/eachItem", { item, title: item.title });
  } catch (err) {
    console.error(err);
    res.send("Error loading item");
  }

});


module.exports = router;