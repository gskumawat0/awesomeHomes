var express = require("express");
var router = express.Router({ mergeparams: true });
var Comment = require("../models/comments"),
    Site = require("../models/sites");
var middleware = require("../middleware");

//======================================
//comments route
//======================================

router.get("/sites/:id/comments/new", middleware.isLoggedIn, function(req, res)
{
    Site.findById(req.params.id, function(error, foundSite)
    {
        if (error)
        {
            req.flash("error", "something went wrong.try again");
            res.redirect("back");
        }
        else
        {
            res.render("comments/new", { site: foundSite });
        }
    });
});

router.post("/sites/:id/comments/", middleware.isLoggedIn, function(req, res)
{
    Site.findById(req.params.id, function(error, site)
    {
        if (error)
        {
            req.flash("error", "something went wrong.try again");
            res.redirect("back");
        }
        else
        {
            Comment.create(req.body.comment, { new: true }, function(error, createdComment)
            {
                if (error)
                {
                    req.flash("error", "Can Not Post Comment");
                    res.redirect("back");
                }
                else
                {
                    createdComment.author.id = req.user._id;
                    createdComment.author.username = req.user.username;
                    createdComment.save();
                    site.comments.push(createdComment);
                    site.save();
                    req.flash("success", "Successfully Added A Comment");
                    res.redirect('/sites/' + site._id);
                }
            });
        }
    });
});

// edit route
router.get("/sites/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res)
{
    Comment.findById(req.params.comment_id, function(error, foundComment)
    {
        if (error)
        {
            req.flash("error", "something went wrong.try again");
            res.redirect("back");
        }
        else
        {
            res.render("comments/edit", { comment: foundComment, site_id: req.params.id });
        }
    });
});

//update route
router.put("/sites/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res)
{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment.text, function(error, updatedComment)
    {
        if (error)
        {
            req.flash("error", "something went wrong.try again");
            res.redirect("back");
        }
        else
        {
            req.flash("success", "Successfully updated");
            res.redirect("/sites/" + req.params.id);
        }
    });
});
//destroy route
router.delete("/sites/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res)
{
    Comment.findByIdAndRemove(req.params.comment_id, function(error)
    {
        if (error)
        {
            req.flash("error", "something went wrong.try again");
            res.redirect("back");
        }
        else
        {
            req.flash("success", "Successfully Deleted");
            res.redirect("/sites/" + req.params.id);
        }
    });
});



module.exports = router;
