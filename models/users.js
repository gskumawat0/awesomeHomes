var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    createdAt: { type: Date, default: Date.now() },
    // status: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isAdmin: { type: Boolean, default: false }
}, { usePushEach: true });

// userSchema.methods.verifyPassword = function(pwd) {
//     // EXAMPLE CODE!
//     return (this.password === pwd);
// };

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
