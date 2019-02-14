 const express = require("express"),
     router = express.Router(),
     passport = require("passport"),
     nodemailer = require("nodemailer"),
     Site = require("../models/sites.js"),
     User = require("../models/users");
 const crypto = require("crypto");
 const { isUser } = require("../middleware");
 //  const csrf = require("csurf");
 // const csrfProtection = csrf({ cookie: true });

 // create reusable transporter object using the default SMTP transport
 let transporter = nodemailer.createTransport({
     host: 'smtp.stackmail.com',
     port: 587,
     secure: false, // true for 465, false for other ports
     auth: {
         user: 'projectmail@nintia.in', // generated ethereal user
         pass: process.env.EMAIL_PWD // generated ethereal password
     }
 });

 router.get("/", function(req, res) {
     res.render("homepage");
 });

 //authentication routes
 router.get("/signup", isUser, function(req, res) {
     res.render("auth/signup", { csrfToken: req.csrfToken() });
 });

 router.post("/signup", isUser, function(req, res, next) {
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
             passport.authenticate("local")(req, res, async function() {
                 try {
                     // setup email data with unicode symbols
                     let signupMailOptions = {
                         from: '"Gouri Shankar 👻" <projectmail@nintia.in>', // sender address
                         to: req.user.email, // list of receivers
                         subject: `welcome to Awesome Homes`, // Subject line
                         text: `  Hi ${req.user.firstName} ${req.user.lastName},
    Thanks for being a part of Awesome Homes.
we value your participation.
you can suggest us any improvement at gskumawat555@gmail.com.
again thanks.
your username : ${req.user.username}


Team Awesome Homes
                        `, // plain text body
                         // html: "<b>Hello world?</b>" // html body
                     };
                     transporter.sendMail(signupMailOptions);
                     //  console.log(info);
                     req.flash("success", "successfully Signed In");
                     let url = req.session.urlToForward || '/sites';
                     !req.session.urlToForward;
                     res.redirect(url);
                     !url;
                 }
                 catch (err) {
                     console.log(error);
                     req.flash("error", error.message);
                     return res.redirect("back");
                 }

             });
         }
     });
 });

 //login route
 router.get("/login", isUser, function(req, res) {
     res.render("auth/login", { csrfToken: req.csrfToken() });
 });


 //  router.post('/login', isUser, passport.authenticate('local', {
 //      successRedirect: req.session.urlToForward || '/sites',
 //      failureRedirect: '/login',
 //      successFlash: 'Welcome back',
 //      failureFlash: true
 //  }, ));
 router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
     function(req, res) {
         console.log(req.user)
         let url = req.session.urlToForward || '/sites';
         !req.session.urlToForward;
         req.flash('success', 'welcome back');
         res.redirect(url);
         !url;
     });

 //logout
 router.get("/logout", function(req, res) {
     req.session.urlToForward = undefined;
     req.logout();
     req.flash("success", "successfully logged out");
     res.redirect("/sites");
 });

 // forgot password
 router.get("/reset-password", isUser, function(req, res) {
     res.render("auth/reset-pwd", { csrfToken: req.csrfToken() });
 });

 // handle form submission and generate new reset token
 router.post('/reset-password', isUser, async function(req, res, next) {
     try {
         let token = await crypto.randomBytes(20).toString('hex');
         let user = await User.findOne({ email: req.body.email });
         if (!user) throw Error('No account with that email address exists.');
         //  console.log(token, 78765634);
         //  user.resetPasswordToken = token;
         //  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; //10 minutes
         let newUser = await User.findOneAndUpdate({ email: req.body.email, username: req.body.username }, { $set: { resetPasswordToken: token, resetPasswordExpires: Date.now() + 1000 * 60 * 10 } }, { new: true });
         //  console.log(newUser, 1111111);
         let resetMailOption = {
             to: newUser.email || req.body.email,
             from: 'projectmail@nintia.in',
             subject: 'Awesome Home Password Reset',
             text: `  You are receiving this because you (or someone else) have requested the reset of the password for your account on awesome Home.
 Please click on the following link, or paste this into your browser to complete the process:
 https://${req.headers.host}/reset-password/${newUser.resetPasswordToken}
 If you did not request this, please ignore this email and your password will remain unchanged.
 
 Team Awesome Home`
         };
         transporter.sendMail(resetMailOption);
         //  console.log(sendinfo);
         req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
         res.redirect('back');
     }
     catch (err) {
         //   console.log(error);
         req.flash("error", err.message);
         return res.redirect("back");
     }
 });
 // greenwolf692
 // "79122778906a4267c1b4738a45aae6d1379422e2"
 // send form to reset password 
 router.get('/reset-password/:token', isUser, async function(req, res) {
     try {
         let user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
         if (!user) throw Error('Password reset token is invalid or has expired.');
         res.render('auth/change-pwd', { token: req.params.token, csrfToken: req.csrfToken() });
     }
     catch (err) {
         //   console.log(error);
         req.flash("error", err.message);
         return res.redirect("back");
     }
 });

 // change password here

 router.post('/reset-password/:token', isUser, async function(req, res) {
     try {
         let user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
         if (!user) throw Error('Password reset token is invalid or has expired.');
         if (req.body.password === req.body.confirm) {
             user.setPassword(req.body.password, function(err) {
                 if (err) throw err;
                 user.resetPasswordToken = undefined;
                 user.resetPasswordExpires = undefined;
                 user.save();
             });
         }
         else {
             throw Error('Passwords do not match.');
         }
         console.log(user);
         let confirnMailOption = {
             to: user.email,
             from: 'projectmail@nintia.in',
             subject: 'Your password has been changed on Awesome Home',
             text: `  Hello ${user.firstName} ${user.lastName},
 This is a confirmation that the password for your account ${user.email} on Awesome Home has just been changed.
 if this is not done by you, please contact us at gskumawat555@gmail.com as soon as possible to neutralize the possible damage. 
 `
         };
         transporter.sendMail(confirnMailOption);
         //  console.log(confirminfo);
         req.flash('success', 'Success! Your password has been changed.');
         res.redirect('/sites');
     }
     catch (err) {
         //   console.log(error);
         req.flash("error", err.message);
         return res.redirect("back");
     }
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
 