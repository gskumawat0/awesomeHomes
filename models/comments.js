var mongoose = require("mongoose");
var commentSchema = mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
    },
    createdat: { type: Date, default: Date.now() },
    text: String,
}, { usePushEach: true });

module.exports = mongoose.model("Comment", commentSchema);
