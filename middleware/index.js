var Site = require("../models/sites");
var Comment = require("../models/comments");
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
    // console.log(req.url, 12121, req.protocol + '://' + req.get('host') + req.originalUrl);
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.urlToForward = req.protocol + '://' + req.get('host') + req.originalUrl;
    req.flash("error", "please login first");
    res.redirect("/login");
};

middlewareObj.isUser = function(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.url === `https://${req.headers.host}/signup` || `https://${req.headers.host}/login`) {
            req.flash('error', 'user exists already. please logout first and then continue.');
            return res.redirect('/sites');
        }
    }
    return next();
};

middlewareObj.checkSiteOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Site.findById(req.params.id, function(error, foundSite) {
            if (error) {
                req.flash("error", "Can Not Find Any Project");
                res.redirect("back");
            }
            else {
                if (foundSite.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error", "You Are Not Permitted. add your own House <a href='/sites/new'>here</a>");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.session.urlToForward = req.protocol + '://' + req.get('host') + req.originalUrl;
        req.flash("error", "please login first");
        res.redirect("/login");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(error, foundComment) {
            if (error) {
                req.flash("error", "Can Not Find Comment");
                res.redirect("back");
            }
            else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                }
                else {
                    req.flash("error", "You Are Not Autherized");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.session.urlToForward = req.protocol + '://' + req.get('host') + req.originalUrl;
        req.flash("error", "please login first");
        res.redirect("/login");
    }
};

module.exports = middlewareObj;
