 var express = require("express"),
     router = express.Router(),
     passport = require("passport"),
     User = require("../models/users");

 router.get("/", function(req, res) {
     res.render("homepage");
 });

 //authentication routes
 router.get("/signup", function(req, res) {
     res.render("signup", { csrfToken: req.csrfToken() });
 });

 router.post("/signup", function(req, res, next) {
     var newUser = new User({ username: req.body.username })
     User.register(newUser, req.body.password, function(error, user) {
         if (error) {
             console.log(error)
             req.flash("error", error.message);
             return res.redirect("back");
         }
         else {
             console.log('passpoert auth')
             //  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', })(req, res);
             console.log(user);
             passport.authenticate("local")(req, res, function() {
                 req.flash("success", "successfully Signed In");
                 res.redirect("/sites");
             });
         }
     });
 });

 //login route
 router.get("/login", function(req, res) {
     res.render("login", { csrfToken: req.csrfToken() });
 });


 //  router.post('/login',
 //      passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
 //      function(req, res) {
 //          req.flash('success', 'welcome back');
 //          res.redirect('/');
 //      });
 router.post('/login', passport.authenticate('local', {
     successRedirect: '/sites',
     failureRedirect: '/login',
     successFlash: 'Welcome back',
     failureFlash: true
 }));
 //logout
 router.get("/logout", function(req, res) {
     req.logout();
     req.flash("success", "successfully logged out");
     res.redirect("/sites");
 });

 module.exports = router;
 