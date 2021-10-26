require("dotenv").config();
const express = require("express");
const app = express();
const passport = require("passport");
const path = require("path");
const mongoose = require("mongoose");
var LocalStrategy = require("passport-local");
var flash = require("connect-flash");
const methodOverride = require("method-override");
var seedDB = require("./seeds");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const cors = require("cors");
app.use(cors());

// seedDB()

const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

const User = require("./models/user");
const FoodItem = require("./models/foodItem");
const Order = require("./models/order");

mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.o8tac.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
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

app.use(express.static(__dirname + "/public"));
const geolib = require("geolib");

const no_of_children = 5;
var cities = [0, 1, 2, 3, 4];
const address = [
  "Saibaba Nagar",
  "Ram Nagar",
  "Prem Nagar",
  "MG Road",
  "SV road",
];
var cordinates = [
  { longitude: 72.845812, latitude: 19.21568 },
  { longitude: 72.855673, latitude: 19.24558 },
  { longitude: 72.852912, latitude: 19.25558 },
  { latitude: 19.21558, longitude: 72.842812 },
  { latitude: 19.21658, longitude: 72.843812 },
];

var gene_pool = [
  [0, 1, 2, 3, 4],
  [4, 3, 2, 0, 1],
  [3, 2, 4, 0, 1],
  [1, 2, 4, 0, 3],
  [0, 4, 1, 2, 3],
];
var parents = [];
var total_cost = 100000000000;

//Get dist:
function calculate_fitness(arr) {
  var sum = 0;
  for (var i = 1; i < arr.length; i++)
    sum =
      sum +
      geolib.getDistance(cordinates[arr[i]], cordinates[arr[i - 1]], 0.01);
  sum =
    sum +
    geolib.getDistance(cordinates[0], cordinates[arr[arr.length - 1]], 0.01);
  return sum;
}
function select_best_genes() {
  let pq = [];
  for (var i = 0; i < gene_pool.length; i++)
    pq[i] = [calculate_fitness(gene_pool[i]), i];
  pq.sort();
  for (var i = 0; i < no_of_children; i++) parents[i] = gene_pool[pq[i][1]];
  gene_pool = [];
  for (var i = 0; i < no_of_children; i++) gene_pool[i] = parents[i];
  console.log("Best genes: ");
  for (var i = 0; i < no_of_children; i++)
    console.log(gene_pool[i] + " %d", calculate_fitness(gene_pool[i]));
}
function getChild(p1, p2, len) {
  let c1 = [],
    c2 = [];
  for (var i = 0; i < p1.length; i++) {
    c1[i] = -1;
    c2[i] = -1;
  }

  let start = Math.floor(p1.length / 2 - 1);
  for (var i = start; i <= start + len; i++) {
    c1[i] = p2[i];
    c2[i] = p1[i];
  }

  for (var i = 0; i < p2.length; i++) if (!c1.includes(p2[i])) c1[i] = p2[i];
  for (var i = 0; i < p1.length; i++) if (!c2.includes(p1[i])) c2[i] = p1[i];
  return [c1, c2];
}
function crossover() {
  //Order length=log(parents)/log2
  const len = Math.log2(parents[0].length);
  offsprings = [];
  for (var i = 0; i < no_of_children; i++) {
    for (var j = 0; j < no_of_children; j++) {
      if (i != j) {
        let children = getChild(parents[i], parents[j], len);
        gene_pool.push(children[0]);
        gene_pool.push(children[1]);
      }
    }
  }
}
function genetic_TSP() {
  //create_population()
  let iterations = 0;
  while (iterations < 5) {
    select_best_genes();
    crossover();
    iterations++;
  }
  select_best_genes();
  console.log(parents[no_of_children - 1]);
}

app.get("/tsp", function (req, res) {
  genetic_TSP();
  let warehouseLocation = [];
  let location = [];
  let order = parents[no_of_children - 1];
  for (var i = 0; i < order.length; i++) {
    console.log(address[order[i]]);
    location.push(address[order[i]]);
    warehouseLocation.push([
      cordinates[order[i]].longitude,
      cordinates[order[i]].latitude,
    ]);
  }
  console.log(location);
  console.log(warehouseLocation);
  res.render("tsp.ejs", {
    warehouseLocation: warehouseLocation,
    order: location,
  });
});

app.get("/", isLoggedIn, (req, res) => {
  res.render("home");
});

app.get("/menu", isLoggedIn, (req, res) => {
  FoodItem.find(function (err, allItems) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      res.render("menu", { allItems: allItems });
    }
  });
});

app.get("/cart", isLoggedIn, (req, res) => {
  User.findById(req.user._id, function (err, founduser) {
    if (err) {
      console.log(err);
      return res.redirect("back");
    } else {
      cart = founduser.cart.foodItems.sort(function (a, b) {
        var nameA = a.title.toUpperCase();
        var nameB = b.title.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });
      res.render("cart", { items: cart, total: founduser.cart.total });
    }
  });
});

app.post("/cart/:id", isLoggedIn, function (req, res) {
  User.findById(req.user._id, function (err, founduser) {
    if (err) {
      console.log(err);
      return res.redirect("back");
    } else {
      FoodItem.findById(req.params.id, function (err, foundItem) {
        if (err) {
          console.log(err);
          return res.redirect("back");
        } else {
          if (founduser.cart.foodItems.length == 0) {
            founduser.cart.total = foundItem.cost;
          } else {
            founduser.cart.total = founduser.cart.total + foundItem.cost;
          }
          founduser.cart.foodItems.push(foundItem);
          //   founduser.wallet += 160;
          founduser.cart.amountPayable = Math.max(
            0,
            founduser.cart.total - Math.floor(founduser.wallet / 100)
          );
          founduser.cart.discountApplied = Math.min(
            founduser.cart.total,
            Math.floor(founduser.wallet / 100)
          );
          founduser.save();
          req.flash("success", foundItem.title + " added to cart.");
          return res.redirect("/menu");
        }
      });
    }
  });
});

app.delete("/cart/:id", isLoggedIn, function (req, res) {
  User.findById(req.user._id, function (err, founduser) {
    if (err) {
      console.log(err);
      return res.redirect("back");
    } else {
      FoodItem.findById(req.params.id, function (err, foundItem) {
        if (err) {
          console.log(err);
          return res.redirect("back");
        } else {
          var index = -1;
          console.log(foundItem._id);
          for (var i = 0; i < founduser.cart.foodItems.length; i++) {
            if (
              founduser.cart.foodItems[i]._id.toString() ==
              foundItem._id.toString()
            ) {
              index = i;
            }
          }
          if (index !== -1) {
            founduser.cart.total =
              founduser.cart.total - founduser.cart.foodItems[index].cost;
            founduser.cart.foodItems.splice(index, 1);
          }
          founduser.cart.amountPayable = Math.max(
            0,
            founduser.cart.total - Math.floor(founduser.wallet / 100)
          );
          founduser.cart.discountApplied = Math.min(
            founduser.cart.total,
            Math.floor(founduser.wallet / 100)
          );
          founduser.save();
          req.flash("success", foundItem.title + " removed from cart.");
          return res.redirect("/cart");
        }
      });
    }
  });
});

app.get("/profile", isLoggedIn, function (req, res) {
  User.findById(req.user._id, function (err, foundUser) {
    if (err) {
      console.log(err);
      return res.redirect("back");
    } else {
      var orders = foundUser.orders;
      orders.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      res.render("profile", { orders: orders });
    }
  });
});

app.get("/8puzzle", function (req, res) {
  res.render("8puzzle");
});

app.get("/ordercod", isLoggedIn, function (req, res) {
  cart = req.user.cart.foodItems.sort(function (a, b) {
    var nameA = a.title.toUpperCase();
    var nameB = b.title.toUpperCase();
    if (nameA < nameB) {
      return;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  res.render("ordercod", {
    items: cart,
    total: req.user.cart.total,
  });
});

app.get("/ordercard", isLoggedIn, function (req, res) {
  cart = req.user.cart.foodItems.sort(function (a, b) {
    var nameA = a.title.toUpperCase();
    var nameB = b.title.toUpperCase();
    if (nameA < nameB) {
      return;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  res.render("ordercard", {
    items: cart,
    total: req.user.cart.total,
    key: process.env.KEY_ID,
  });
});

app.post("/api/payment/order", (req, res) => {
  params = req.body;
  instance.orders
    .create(params)
    .then((data) => {
      res.send({ sub: data, status: "success" });
    })
    .catch((error) => {
      res.send({ sub: error, status: "failed" });
    });
});

app.post("/api/payment/verify", (req, res) => {
  body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

  var expectedSignature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  console.log("sig" + req.body.razorpay_signature);
  console.log("sig" + expectedSignature);
  var response = { status: "failure" };
  if (expectedSignature === req.body.razorpay_signature)
    response = { status: "success" };
  res.send(response);
});

app.post("/afterOrderPlaced", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("hit!");
    console.log(req.body);
    User.findById(req.user._id, (err, founduser) => {
      if (err) console.log(err);
      else {
        var inputAddress = `${req.body.flatwing}\n${req.body.locality}\n${req.body.pincode}\n${req.body.city}`;
        var new_order = new Order({
          items: req.user.cart.foodItems,
          total: req.user.cart.amountPayable,
          user: {
            id: req.user._id,
            email: req.user.username,
            name: req.body.name,
            address: `${req.body.locality}, ${req.body.city}`,
            fullAddress: inputAddress,
          },
          paymentMode: req.body.paymentMode,
        });
        Order.create(new_order, function (err, order) {
          if (err) {
            console.log(err);
          } else {
            // console.log(FoodItem);
            var f = 0;
            founduser.addresses.forEach((address) => {
              if (address.fullAddress == inputAddress) {
                // console.log("000000");
                f = 1;
              }
            });
            if (f == 0) {
              //   console.log("01011010");
              var addressObj = {
                fullAddress: inputAddress,
                flatwing: req.body.flatwing,
                locality: req.body.locality,
                pincode: req.body.pincode,
                city: req.body.city,
              };
              founduser.addresses.push(addressObj);
            }
            founduser.orders.push(order);
            founduser.wallet =
              founduser.wallet - founduser.cart.discountApplied * 100;
            founduser.cart.foodItems = [];
            founduser.cart.total = 0;
            founduser.cart.amountPayable = 0;
            founduser.cart.discountApplied = 0;
            founduser.save();
            res.send({ status: "OK" });
          }
        });
      }
    });
  } else {
    res.send({ error: "You need to be logged in first" });
  }
});

app.get("/orderconfirmed", isLoggedIn, (req, res) => {
  res.render("orderconfirmed");
});

//-----------------------------AUTH--------------------------------------

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.post("/login", function (req, res, next) {
  passport.authenticate(
    "local",
    {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
      succssFlash: true,
    },
    function (err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("error", "Password or Email does not match");
        return res.redirect("/login");
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome back " + user.name);
        return res.redirect("/");
      });
    }
  )(req, res, next);
});

app.post("/signup", function (req, res) {
  console.log(req.body);
  var newUser = new User({
    username: req.body.username,
    name: req.body.name,
    phone: req.body.phone,
  });
  var inputAddress = `${req.body.flatwing}\n${req.body.locality}\n${req.body.pincode}\n${req.body.city}`;
  var addressObj = {
    fullAddress: inputAddress,
    flatwing: req.body.flatwing,
    locality: req.body.locality,
    pincode: req.body.pincode,
    city: req.body.city,
  };
  newUser.addresses.push(addressObj);
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      if (
        err.message == "A user with the given username is already registered"
      ) {
        req.flash(
          "error",
          "A user with the given Email Id is already registered"
        );
        return res.redirect("/signup");
      } else {
        req.flash(
          "error",
          "A user with the given Phone No. is already registered"
        );
        return res.redirect("/signup");
      }
    } else {
      passport.authenticate("local")(req, res, function () {
        req.flash("success", "Welcome to Dyce & Dyne " + user.name);
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
  console.log("Serving on port 3000");
});
