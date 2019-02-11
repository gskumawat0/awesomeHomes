var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    createdat: { type: Date, default: Date.now() },
    password: String,
}, { usePushEach: true });

// userSchema.methods.verifyPassword = function(pwd) {
//     // EXAMPLE CODE!
//     return (this.password === pwd);
// };

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
