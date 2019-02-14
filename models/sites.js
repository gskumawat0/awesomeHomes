var mongoose = require("mongoose"),
    User = require("./users.js"),
    Comment = require("./comments.js");


var siteSchema = mongoose.Schema({
    name: String,
    image: String,
    body: String,
    date: { type: Date, default: Date.now },
    location: { type: String, default: `Rawat Bhata Road, Rajasthan Technical University, Kota, Rajasthan` },
    lat: { type: Number, default: 25.142396 },
    lng: { type: Number, default: 75.806756 },
    price: {
        type: Number,
        default: 100
    },
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
