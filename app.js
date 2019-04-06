process.env.NODE_ENV === 'development' && require("dotenv").config();

let express = require("express"),
    app = express(),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    User = require("./models/users"),
    moment = require("moment"),
    session = require("express-session");
const MongoStore = require('connect-mongo')(session);
const csrf = require("csurf");
mongoose.Promise = global.Promise;

//requiring routes
let commentRoutes = require("./routes/comments"),
    siteRoutes = require("./routes/sites"),
    indexRoutes = require("./routes/index");

//env. setup
const dburl = process.env.DATABASEURL;
mongoose.connect(dburl, { useNewUrlParser: true, useCreateIndex: true });
mongoose.set('debug', true);
app.use(methodOverride("_method"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(cookieParser('sadhdgjtioewrumcvsfdsfyuwqrwierweorrwerrpffasdfdfsdffgfmhguriogfdg'));
app.use(flash());

//add session
app.use(session({
    name: 'awesome-session',
    secret: "fywertwebhreurreteturtuirerrwfhgfcaxvcacewqrfduyreofifddfhfdvdvdfiugwregjdfdfdbvcvxcvugfdjfdhnvuirweweffksdfjv",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        maxAge: (6 * 30 * 24 * 60 * 60 * 1000),
        // _expires: (Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
        // secure: true,
        httpOnly: true,
        // domain: 'https://gskumawat-gskumawat.c9users.io/*',
        sameSite: true
    }
}));
app.use(csrf({ cookie: true })); // place below session and cookieparser and above any router config

app.use(function(err, req, res, next) {
    // console.log(err.code, req.csrfToken);
    req.flash('error', err.message);
    next(err);
});

//authorization
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
// passport.use(new LocalStrategy(
//     function(username, password, done) {
//         User.findOne({ username: username }, function(err, user) {
//             if (err) { return done(err); }
//             if (!user) {
//                 return done(null, false, { message: 'Incorrect username.' });
//             }
//             if (!user.validPassword(password)) {
//                 return done(null, false, { message: 'Incorrect password.' });
//             }
//             return done(null, user);
//         });
//     }
// ));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.moment = moment;
    // res.locals.csrfToken = req.csrfToken();
    next();
});

app.use("/sites", siteRoutes);
app.use('/sites/:id/comments', commentRoutes);
app.use(indexRoutes);

app.get('*', function(req, res, next) {
    res.sendStatus('404');
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The Server Has Started!");
});
