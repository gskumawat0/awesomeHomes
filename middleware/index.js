var Site = require("../models/sites");
var Comment = require("../models/comments");
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req,res,next){
       if (req.isAuthenticated()) {
           return next();
       }
       req.flash("error","please login first");
       res.redirect("/login");
   };

middlewareObj.checkSiteOwnership = function(req,res,next){
     if(req.isAuthenticated()){
        Site.findById(req.params.id,function(error,foundSite){
          if (error) {
              req.flash("error","Can Not Find Any Project");
            res.redirect("back");
            }
           else{
               if (foundSite.author.id.equals(req.user._id)){
                   next();
               } else{
                   req.flash("error","You Are Not Permitted");
                  res.redirect("back");
               }
          }
       });
    } else{
        req.flash("error","You Need To Login First");
        res.redirect("back");}
};

middlewareObj.checkCommentOwnership = function(req,res,next){
     if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(error,foundComment){
          if (error) {
              req.flash("error","Can Not Find Comment");
            res.redirect("back");
            }
           else{
               if (foundComment.author.id.equals(req.user._id)){
                   next();
               } else{
                   req.flash("error","You Are Not Autherized");
                  res.redirect("back");
               }
          }
       });
    } else{
        req.flash("error","You Need To Login First");
        res.redirect("back");}
};

module.exports = middlewareObj ;