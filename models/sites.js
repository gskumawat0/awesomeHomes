var mongoose = require("mongoose"),
    User = require("./users.js"),
    Comment = require("./comments.js");


var siteSchema = mongoose.Schema({
    name: String,
    image: String,
    body: String,
    date: { type: Date, default: Date.now },
    location: String,
    lat: Number,
    lng: Number,
    createdat: { type: Date, default: Date.now() },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
}, { usePushEach: true });

module.exports = mongoose.model("Site", siteSchema);
