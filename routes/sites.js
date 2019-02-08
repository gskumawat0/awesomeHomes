const express = require("express");
const router = express.Router({ mergeparams: true });
const Site = require("../models/sites");
const middleware = require("../middleware");
const NodeGeocoder = require('node-geocoder');


const geocodeOption = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: process.env.GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(geocodeOption);

//index route
router.get("/", async function(req, res) {
    try {
        let site = await Site.find({});
        if (!site && site.length === 0) {
            throw Error('No site found');
        }
        res.render("sites/index", { site });

    }
    catch (err) {
        req.flash('error', err.message);
        return res.redirect('/');
    }

});

//add new site
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("sites/new", { csrfToken: req.csrfToken() });
});

//add site to db
router.post("/", middleware.isLoggedIn, async function(req, res) {
    try {
        let author = {
            id: req.user._id,
            username: req.user
        };
        let locData = await geocoder.geocode(req.body.site.location);
        if (!locData.length) throw Error(`please enter a precise/correct location`);
        let { name, image, body, location } = req.body.site;

        let site = await Site.create({ name, image, body, author, location, lat: locData[0].latitude, lng: locData[0].longitude });
        console.log(site.lat, site.lng, locData);
        req.flash("success", `you successfully created a home. <a href='/sites/${site._id}'> see here </a>`);
        res.redirect("/sites");

    }
    catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }

});

//show template
router.get("/:id", async function(req, res) {
    try {
        let site = await Site.findById(req.params.id).populate("comments").exec();
        res.render("sites/show", { site });

    }
    catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
});



//edit route
router.get("/:id/edit", middleware.checkSiteOwnership, async function(req, res) {
    try {
        let site = await Site.findById(req.params.id);
        res.render("sites/edit", { site, csrfToken: req.csrfToken() });

    }
    catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

// update routes
router.put("/:id", middleware.checkSiteOwnership, async function(req, res) {
    try {
        let site = await Site.findById(req.params.id);
        let { lat, lng } = site;
        if (site.location !== req.body.site.location) {
            let locData = await geocoder.geocode(req.body.site.location);
            if (!locData.length) throw Error(`please enter a precise/correct location`);
            lat = locData[0].latitude;
            lng = locData[0].longitude;
        }
        let { name, image, body, location } = req.body.site;

        let updatedSite = await Site.findByIdAndUpdate(req.params.id, { $set: { name, image, body, location, lat, lng } });
        console.log(lat, lng);
        req.flash("success", "Successfully Updated");
        return res.redirect("/sites/" + req.params.id);
    }
    catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

// destroy route
router.delete("/:id", middleware.checkSiteOwnership, async function(req, res) {
    try {
        await Site.findByIdAndRemove(req.params.id);
        req.flash("success", "successfully deleted a product");
        res.redirect("/sites");
    }
    catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

module.exports = router;
