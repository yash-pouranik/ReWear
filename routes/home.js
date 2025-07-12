const express = require("express");
const router = express.Router();

const Item = require("../models/item");
const SwapRequest = require("../models/SwapRequest");




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


router.get("/browse", async (req, res) => {
  let items = await Item.find({});
  console.log(items);
  res.render("homes/browse", { 
    title: ".bitBros",
    items
   });
});


router.get("/item/new", isLoggedin, (req, res) => {
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
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while uploading.");
    res.redirect("/items/new");
  }
});

router.get("/items/:id/edit", isLoggedin, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.redirect("/");

  if (req.user.isAdmin === false || !item.uploader.equals(req.user._id)) {
    req.flash("error", "You can't edit this item");
    return res.redirect("/");
  }

  res.render("homes/editItem", { item, title: "Edit Item" });
});

router.put("/items/:id/edit", isLoggedin, upload.array("images", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) {
      req.flash("error", "Item not found");
      return res.redirect("/");
    }

    // Permission check
    if (!item.uploader.equals(req.user._id)) {
      req.flash("error", "Unauthorized");
      return res.redirect("/");
    }

    const { title, description, category, buyType, tags } = req.body;

    // Update fields
    item.title = title;
    item.description = description;
    item.category = category;
    item.buyType = buyType;
    item.tags = tags.split(",").map(tag => tag.trim());

    // Handle new images (optional)
    if (req.files && req.files.length > 0) {
      item.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    await item.save();
    req.flash("success", "Item updated successfully!");
    res.redirect(`/items/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Update failed.");
    res.redirect("/");
  }
});





router.delete("/delete/item/:id", isLoggedin, async (req, res) => {
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





router.post("/items/:id/swap", isLoggedin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("uploader");
    if (!item) {
      req.flash("error", "Item not found");
      return res.redirect("/");
    }

    if (item.uploader.equals(req.user._id)) {
      req.flash("error", "You cannot swap your own item.");
      return res.redirect(`/items/${item._id}`);
    }

    const duplicate = await SwapRequest.findOne({
      item: item._id,
      requester: req.user._id,
      status: "pending"
    });

    if (duplicate) {
      req.flash("info", "You already have a pending swap request for this item.");
      return res.redirect(`/items/${item._id}`);
    }

    const swap = new SwapRequest({
      requester: req.user._id,
      item: item._id,
      owner: item.uploader._id,
      status: "pending"
    });

    await swap.save();
    req.flash("success", "Swap request sent successfully!");
    res.redirect("/dashboard");
    
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not send swap request.");
    res.redirect("/");
  }
});




module.exports = router;