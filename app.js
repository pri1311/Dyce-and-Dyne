const express = require('express');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
var LocalStrategy = require("passport-local");
var flash = require("connect-flash");
const methodOverride = require('method-override');
var seedDB = require('./seeds')

// seedDB()



const User = require('./models/user');
const FoodItem = require('./models/foodItem');

mongoose.connect('mongodb+srv://admin:admin@cluster0.o8tac.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require("moment");

app.use(
    require("express-session")({
        secret: "Shhhh Secret!",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.get('/', isLoggedIn, (req, res) => {
    res.render('home')
});

app.get('/menu', isLoggedIn, (req, res) => {
    FoodItem.find(function (err, allItems) {
        if (err) {
            console.log(err)
            res.redirect("/")
        } else {
            res.render("menu", { allItems: allItems })
        }
    })
});

//-----------------------------AUTH--------------------------------------

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/signup", function (req, res) {
    res.render("signup");
});


app.post("/login", function (req, res, next) {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
        succssFlash: true
    }, function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash("error", "Password or Email does not match");
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome back " + user.name);
            return res.redirect('/');

        });
    })(req, res, next)
}
);

app.post("/signup", function (req, res) {
    console.log(req.body);
    var newUser = new User({
        username: req.body.username,
        name: req.body.name,
        phone: req.body.phone,
    });

    newUser.addresses.push(req.body.addresses)
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            if (err.message == "A user with the given username is already registered") {
                req.flash("error", "A user with the given Email Id is already registered")
                return res.redirect("/signup");
            } else {
                req.flash("error", "A user with the given Phone No. is already registered")
                return res.redirect("/signup");

            }
        } else {
            passport.authenticate("local")(req, res, function () {
                req.flash("success", "Welcome to Dyce & Dyne " + user.name)
                res.redirect("/");
            });
        }
    });
});

app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/");
});


//===================== MIDDLEWARE =================//
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("/login");
    }
}

app.listen(3000, () => {
    console.log('Serving on port 3000')
})