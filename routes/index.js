 const express = require("express"),
     router = express.Router(),
     passport = require("passport"),
     Site = require("../models/sites.js"),
     User = require("../models/users");
 const csrf = require("csurf");

 router.use(csrf({ cookie: true }));
 router.get("/", function(req, res) {
     res.render("homepage");
 });

 //authentication routes
 router.get("/signup", function(req, res) {
     res.render("auth/signup", { csrfToken: req.csrfToken() });
 });

 router.post("/signup", function(req, res, next) {
     let { username, email, firstName, lastName, avatar, adminCode } = req.body;
     let isAdmin = adminCode === process.env.ADMIN_CODE ? true : false;
     let newUser = new User({ username, email, firstName, lastName, avatar, isAdmin });
     User.register(newUser, req.body.password, function(error, user) {
         if (error) {
             //  console.log(error);
             req.flash("error", error.message);
             return res.redirect("back");
         }
         else {
             //  console.log('passpoert auth')
             //  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', })(req, res);
             //  console.log(user);
             passport.authenticate("local")(req, res, function() {
                 req.flash("success", "successfully Signed In");
                 res.redirect("/sites");
             });
         }
     });
 });

 //login route
 router.get("/login", function(req, res) {
     res.render("auth/login", { csrfToken: req.csrfToken() });
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


 // user profile
 router.get('/user/:userId', async function(req, res) {
     try {
         let user = await User.findOne({ _id: req.params.userId });
         let sites = await Site.find({}).where('author.id').equals(user._id).exec();
         res.render('user', { user, sites });
     }
     catch (err) {
         //  console.log(error);
         req.flash("error", err.message);
         return res.redirect("back");
     }
 })

 module.exports = router;
 