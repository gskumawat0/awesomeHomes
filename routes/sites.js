const express = require("express");
const router = express.Router({ mergeparams: true });
const Site = require("../models/sites");
const middleware = require("../middleware");
const NodeGeocoder = require('node-geocoder');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const csrf = require("csurf");


const geocodeOption = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: process.env.GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(geocodeOption);

var s3 = new aws.S3({
    secretAccessKey: process.env.AWS_SECRET_ACCESS,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: 'ap-south-1'

});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'awesome-home',
        acl: 'public-read',
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            console.log(file);
            cb(null, file.originalname + '-' + Date.now().toString());
        }
    })
});

router.use(csrf({ cookie: true }));
const singleUpload = upload.single('site[image]');
const diffFieldUpload = upload.fields([{ name: 'site[image1]', maxCount: 2 }, { name: 'site[image2]', maxCount: 2 }]);
const multiUpload = upload.array('site[images]', 12);
//index route
router.get("/", async function(req, res) {
    try {
        console.log(req.user);
        let sites = await Site.find({});
        if (!sites && sites.length === 0) {
            throw Error('No site found');
        }
        res.render("sites/index", { sites });

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
router.post("/", middleware.isLoggedIn, singleUpload, async function(req, res) {
    console.log(req.file);
    try {
        let author = {
            id: req.user._id,
            username: req.user.username
        };
        let locData = await geocoder.geocode(req.body.site.location);
        if (!locData.length) throw Error(`please enter a precise/correct location`);
        let { name, body, location, price } = req.body.site;
        let image = req.file.location;
        let imageKey = req.file.key;
        let site = await Site.create({ name, image, imageKey, body, author, location, price, lat: locData[0].latitude, lng: locData[0].longitude });
        // console.log(site.lat, site.lng, locData);
        req.flash("success", `you successfully created a home. <a href='/sites/${site._id}'> see here </a>`);
        res.redirect("/sites");

    }
    catch (err) {
        if (req.file) {
            s3.deleteObject({
                Bucket: 'awesome-home',
                Key: req.file.key,
            });
        }
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

//show template
router.get("/:id", async function(req, res) {
    try {
        let site = await Site.findById(req.params.id).populate("comments").exec();
        res.render("sites/show", { site, csrfToken: req.csrfToken() });

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
        if (req.file) {
            s3.deleteObject({
                Bucket: 'awesome-home',
                Key: site.imageKey,
            });
            req.body.site.image = req.file.location;
            req.body.site.imageKey = req.file.key;
        }
        let { name, image = site.image, imageKey = site.imageKey, body, price, location } = req.body.site;

        let updatedSite = await Site.findByIdAndUpdate(req.params.id, { $set: { name, image, imageKey, body, location, price, lat, lng } });
        // console.log(lat, lng);
        req.flash("success", "Successfully Updated");
        return res.redirect("/sites/" + req.params.id);
    }
    catch (err) {
        console.log(err);
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

// destroy route
router.delete("/:id", middleware.checkSiteOwnership, async function(req, res) {
    try {
        let site = await Site.findByIdAndRemove(req.params.id);
        let deletedData = await s3.deleteObject({
            Bucket: 'awesome-home',
            Key: site.imageKey,
        });
        console.log(deletedData);
        req.flash("success", "successfully deleted a product");
        res.redirect("/sites");
    }
    catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

module.exports = router;
