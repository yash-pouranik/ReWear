// models/Item.js
const mongoose = require('mongoose');
const User = require("./user")

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
 category: {
  type: String,
  enum: [
    "Tops",
    "Bottoms",
    "Dresses",
    "Ethnic Wear",
    "Footwear",
    "Outerwear",
    "Others"
  ],
  required: true
},
 buyType:{
   type:String,
   enum:["swap","points","both"]
 },
  
  tags: [String],
  images: [String], // image URLs
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
  type: String,
  enum: ["pending", "approved", "rejected", "swapped", "removed"],
  default: "pending"
},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Item", itemSchema);
