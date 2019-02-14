var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    createdAt: { type: Date, default: Date.now() },
    // status: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    isAdmin: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { usePushEach: true });

// userSchema.methods.verifyPassword = function(pwd) {
//     // EXAMPLE CODE!
//     return (this.password === pwd);
// };

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
