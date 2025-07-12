const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLM = require("passport-local-mongoose");


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.plugin(passportLM);

module.exports = mongoose.model("User", userSchema);