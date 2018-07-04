 var express = require("express"),
     router = express.Router(),
     passport = require("passport"),
     User = require("../models/users");

 router.get("/", function(req, res)
 {
     res.render("home");
 });

 //authentication routes
 router.get("/signup", function(req, res)
 {
     res.render("signup");
 });

 router.post("/signup", function(req, res)
 {
     User.register(new User({ username: req.body.username }), req.body.password, function(error, user)
     {
         if (error)
         {
             req.flash("error", error.message);
             return res.render("signup");
         }
         else
         {
             passport.authenticate("local")(req, res, function()
             {
                 req.flash("success", "successfully Signed In");
                 res.redirect("/sites");
             });
         }
     });
 });

 //login route
 router.get("/login", function(req, res)
 {
     res.render("login");
 });

 router.post("/login", passport.authenticate("local",
 {
     successRedirect: "/sites",
     failureRedirect: "/login",
 }), function(req, res) {});

 //logout
 router.get("/logout", function(req, res)
 {
     req.logout();
     req.flash("success", "successfully logged out");
     res.redirect("/sites");
 });

 module.exports = router;
 