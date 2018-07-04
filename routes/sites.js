var express  = require("express");
var  router  = express.Router({mergeparams :true});
var Site   = require("../models/sites");
var middleware = require("../middleware");

//index route
router.get("/",function(req,res){
 Site.find({},function(error,allsite){
    if(error){
        req.flash("error","something went wrong.try again");
        res.redirect("/");}
    else{
      res.render("sites/index",{site: allsite});
        
    }
  });
});

//add new site
router.get("/new",middleware.isLoggedIn,function(req,res){
   res.render("sites/new");
});

//add site to db
router.post("/",middleware.isLoggedIn,function(req,res){
 var author = {
     id : req.user._id,
 username : req.user.username},
  name = req.body.site.name,
 image = req.body.site.image,
 body  = req.body.site.body;
 var newSite = {name :name,image :image,body:body,author :author};

Site.create(newSite,function(error,newimg){
              if(error){
                  req.flash("error","something went wrong.try again");
                  res.redirect("/sites/" + req.param.id +"/edit")}
              else{
                 req.flash("success","successfully Created A Project ");
                res.redirect("/sites");

              }
    });
  });

//show template
 router.get("/:id",function(req,res){
    Site.findById(req.params.id).populate("comments").exec(function(error,foundSite){
          if (error) {
              req.flash("error","something went wrong.try again");
              res.redirect("/sites");
            }
            else {
                     res.render("sites/show",{site : foundSite });
                  }
                 });
              });
//edit route
router.get("/:id/edit",middleware.checkSiteOwnership,function(req,res){
        Site.findById(req.params.id,function(error,site){
          if (error) {
              req.flash("error","something went wrong.try again");
            res.redirect("/sites");
            }
           else{
                   res.render("sites/edit",{site:site});
               }
          });
       });

// update routes
router.put("/:id",middleware.checkSiteOwnership,function(req,res){
   Site.findByIdAndUpdate(req.params.id,req.body.site,function(error,updatedSite){
       if (error) {
           req.flash("error","something went wrong.try again");
           res.redirect("/sites/" + req.params.id + "/edit");
       } else {
           req.flash("success","Successfully Updated");
        res.redirect("/sites/" + req.params.id );
       }
   }) ;
});

// destroy route
router.delete("/:id",middleware.checkSiteOwnership,function(req,res){
   Site.findByIdAndRemove(req.params.id,function(error){
       if (error) {
           req.flash("error","something went wrong.try again");
           res.redirect("/sites" + req.params.id);
       } else{
           req.flash("success","Successfully Deleted");
           res.redirect("/sites");}
   }) ;
});

module.exports = router;
