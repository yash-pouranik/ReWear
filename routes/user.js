const User = require("../models/user");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const {alreadyLoggedIn, isLoggedin} = require("../middleware.js")
const Item=require("../models/item");
const SwapRequest=require("../models/SwapRequest.js");

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


router.get("/dashboard/:id", isLoggedin, async(req, res) => {
   try {
    const user = req.user;

    // 1. Uploaded items by this user
    const uploadedItems = await Item.find({ uploader: user._id });

    // 2. SwapRequests where user is requester
    const swaps = await SwapRequest.find({ requester: user._id })
      .populate("item")
      .sort({ createdAt: -1 });

    const ongoingSwaps = swaps.filter(s => s.status === "pending" || s.status === "accepted");
    const completedSwaps = swaps.filter(s => s.status === "completed");

    res.render("user/dashboard", {
      user,
      uploadedItems,
      ongoingSwaps,
      completedSwaps,
      title: req.user.username
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading dashboard");
  }
})




router.post("/items/:id/redeem", isLoggedin, async (req, res) => {
  const item = await Item.findById(req.params.id).populate("uploader");
  const buyer = req.user;

  if (item.status !== "approved") {
    return res.send("Item not available for redemption.");
  }

  if (item.buyType === "swap") {
    return res.send("This item can only be swapped, not bought.");
  }

  if (buyer.points < 50) {
    req.flash("error", "You don't have enough points.")
    return res.redirect(`/items/${item._id}`);

  }

  // 10 points = 1 item logic
  buyer.points -= 50;
  await buyer.save();

  // Credit uploader (optional)
  item.uploader.points += 50;
  await item.uploader.save();

  // Update item
  item.status = "swapped";
  await item.save();

  res.redirect(`/dashboard/${buyer._id}`);
});



router.get("/notifications", isLoggedin, async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      owner: req.user._id,
      status: "pending"
    })
      .populate("requester")
      .populate("item")
      .sort({ createdAt: -1 });

    res.render("user/notifications", {
      title: "Notifications",
      requests
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load notifications.");
    res.redirect("user/dashboard");
  }
});


// POST /swap/:id/accept
router.post("/swap/:id/accept", isLoggedin, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id).populate("item");
    if (!swap) {
      req.flash("error", "Swap request not found.");
      return res.redirect("/notifications");
    }

    if (!swap.owner.equals(req.user._id)) {
      req.flash("error", "Unauthorized action.");
      return res.redirect("/notifications");
    }

    // mark as accepted
    swap.status = "accepted";
    await swap.save();

    // optional: mark item as 'swapped'
    swap.item.status = "swapped";
    await swap.item.save();

    req.flash("success", "Swap request accepted.");
    res.redirect("/notifications");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/");
  }
});



// POST /swap/:id/reject
router.post("/swap/:id/reject", isLoggedin, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) {
      req.flash("error", "Swap request not found.");
      return res.redirect("/notifications");
    }

    if (!swap.owner.equals(req.user._id)) {
      req.flash("error", "Unauthorized action.");
      return res.redirect("/notifications");
    }

    swap.status = "rejected";
    await swap.save();

    req.flash("info", "Swap request rejected.");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong.");
    res.redirect("/notification");
  }
});



//admin

const { isAdmin } = require("../middleware");

router.get("/admin/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const users = await User.find({});
  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/");
  }
  res.render("admin/mngUsers", { users }); // Render admin dashboard or similar
});


module.exports = router;