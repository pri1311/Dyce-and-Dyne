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
	},
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
	}),
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
const axios = require("axios");

//======================= TSP FUNCTIONS  ========================================
var NO_OF_CHILDREN = 0;
var N = 0;
var CITIES = [];
var ADDRESS = [];
var CORDINATES = [];
var GENE_POOL = [];
var PARENTS = [];

function create_initial_population() {
	for (var i = 0; i < NO_OF_CHILDREN; i++) {
		var tour = [];
		for (var j = 0; j < N; j++) tour[j] = j;
		tour.sort(() => Math.random() - 0.5);
		while (PARENTS.includes(tour)) tour.sort(() => Math.random() - 0.5);
		PARENTS.push(tour);
		GENE_POOL.push(tour);
	}
}
function calculate_fitness(arr) {
	var sum = 0;
	for (var i = 1; i < arr.length; i++)
		sum =
			sum +
			geolib.getDistance(
				CORDINATES[arr[i]],
				CORDINATES[arr[i - 1]],
				0.01,
			);
	sum =
		sum +
		geolib.getDistance(
			CORDINATES[0],
			CORDINATES[arr[arr.length - 1]],
			0.01,
		);
	return sum;
}
function select_best_genes() {
	var pq = [];
	for (var i = 0; i < GENE_POOL.length; i++)
		pq[i] = [calculate_fitness(GENE_POOL[i]), i];
	pq.sort(function (a, b) {
		if (a[0] < b[0]) return -1;
		else if (a[0] > b[0]) return 1;
		return 0;
	});
	for (var i = 0; i < NO_OF_CHILDREN; i++) PARENTS[i] = GENE_POOL[pq[i][1]];
	GENE_POOL = [];
	for (var i = 0; i < NO_OF_CHILDREN; i++) GENE_POOL[i] = PARENTS[i];
}
function getChild(p1, p2, l) {
	let c1 = [],
		c2 = [];
	for (var i = 0; i < N; i++) {
		c1[i] = -1;
		c2[i] = -1;
	}
	let start = Math.floor(N / 2) - 1;
	for (var i = start; i <= start + l; i++) {
		c1[i] = p1[i];
		c2[i] = p2[i];
	}
	var temp = [];
	for (var i = 0; i < N; i++) if (!c1.includes(p2[i])) temp.push(p2[i]);
	let index = 0;
	for (var i = 0; i < N; i++) if (c1[i] == -1) c1[i] = temp[index++];
	temp = [];
	for (var i = 0; i < N; i++) if (!c2.includes(p1[i])) temp.push(p1[i]);
	index = 0;
	for (var i = 0; i < N; i++) if (c2[i] == -1) c2[i] = temp[index++];

	return [c1, c2];
}
function crossover() {
	const len = Math.log2(N);
	offsprings = [];
	for (var i = 0; i < NO_OF_CHILDREN; i++) {
		for (var j = 0; j < NO_OF_CHILDREN; j++) {
			if (i != j) {
				let children = getChild(PARENTS[i], PARENTS[j], len);

				GENE_POOL.push(children[0]);
				GENE_POOL.push(children[1]);
			}
		}
	}
}
function mutation() {
	for (var i = 0; i < Math.floor(Math.log2(NO_OF_CHILDREN)); i++) {
		for (var j = 0; j < 2; j++) {
			let index = Math.floor(Math.random() * NO_OF_CHILDREN);
			let el1 = Math.floor(Math.random() * N);
			let el2 = Math.floor(Math.random() * N);
			while (el2 == el1) el2 = Math.floor(Math.random() * N);
			let x = GENE_POOL[index][el1];
			GENE_POOL[index][el1] = GENE_POOL[index][el2];
			GENE_POOL[index][el2] = x;
		}
	}
}
function genetic_TSP() {
	create_initial_population();
	let iterations = 0;
	let limit = N ** (5 / 2);
	while (iterations < limit) {
		select_best_genes();
		crossover();
		if (iterations % 20 == 0) mutation();
		iterations++;
	}
	select_best_genes();
	return [PARENTS[0], calculate_fitness(PARENTS[0])];
}
const getAdd = async (add) => {
	try {
		return await axios.get(
			"https://api.mapbox.com/geocoding/v5/mapbox.places/" +
				add +
				".json?access_token=pk.eyJ1IjoiYmhhdnlhMDkyIiwiYSI6ImNrb2xlNWUzbjFiNjAydnE0bXpsbG13MGcifQ.jik4Q9NnhmABl1qhYKt7ZA",
		);
	} catch (error) {
		console.error(error);
	}
};
const _addressToLatLng = async (address) => {
	const resp = await getAdd(address);
	if (resp.data) {
		var lng = resp["data"]["features"][0].geometry.coordinates[0];
		var lat = resp["data"]["features"][0].geometry.coordinates[1];

		return { longitude: lng, latitude: lat };
	}
};

//=============================== ROUTES ===============================

app.get("/tsp/:deliveryNo", isDeliveryAgentLoggedIn ,async function (req, res) {
	var currdt = Date.now();
	Order.find({ isDelivered: false }, async function (err, allOrders) {
		if (err) console.log(err);
		else {
			// var map = {};
			// allOrders.forEach((order) => {
			// 	var diff = currdt - order.date;
			// 	diff = diff / 1000;

			// 	var x = Math.ceil(diff / 1200);
			// 	if (map[x] === undefined) map[x] = [];
			// 	map[x].push(order);
			// });
			// var schedule = [];
			// var cost = [];
			// for (var key in map) {
			// 	var temp = [];
			// 	for (var a in map[key]) {
			// 		temp.push(map[key][a]);
			// 	}
			// 	schedule.push(temp);
			// }
			var map = {};
			var schedule = [];
			for (var i = 0; i < allOrders.length; i++) {
				var currdt = allOrders[i].date;
				var temp = [];
				temp.push(allOrders[i]);
				for (var j = i + 1; j < allOrders.length; j++) {
					var diff = allOrders[j].date - currdt;
					diff = diff / 1000;
					if (diff <= 1200) {
						i++;
						temp.push(allOrders[j]);
					} else break;
				}
				schedule.push(temp);
			}
			// for (var k = 0; k < schedule.length; k++) {
			// 	for (var j = 0; j < schedule[k].length; j++)
			// 		console.log(schedule[k][j]["total"]);
			// 	console.log();
			// }
			var allOrders = schedule[req.params.deliveryNo];

			NO_OF_CHILDREN = 0;
			N = 0;
			CITIES = [];
			ADDRESS = [];
			CORDINATES = [];
			GENE_POOL = [];
			PARENTS = [];
			N = allOrders.length + 1;
			NO_OF_CHILDREN = (3 * N) / 2;
			var i = 0;
			for (i = 0; i < allOrders.length; i++) {
				ADDRESS.push(allOrders[i].user.address);
				CITIES.push(i);
				var x = await _addressToLatLng(allOrders[i].user.address);
				CORDINATES.push(x);
			}
			ADDRESS.push("Mahavir Nagar, Borivali west, Mumbai");
			CORDINATES.push({ longitude: 72.84167, latitude: 19.21333 });
			CITIES.push(i);
			var bestTour;
			var minCost = 100000000;

			for (var i = 0; i < 10; i++) {
				var x = genetic_TSP();
				var tour = x[0];
				var cost = x[1];

				console.log(tour, cost);

				if (cost < minCost) {
					minCost = cost;
					bestTour = tour.slice();
				}
			}
			console.log(bestTour, calculate_fitness(bestTour));
			i = 0;
			for (i = 0; i < N; i++) if (bestTour[i] == N - 1) break;

			var finalTour = [];
			i = (i + 1) % N;
			for (var j = 0; j < N - 1; j++) {
				finalTour[j] = bestTour[i];
				i = (i + 1) % N;
			}
			bestTour = finalTour;
			let cords = [];
			let location = [];
			for (var i = 0; i < N - 1; i++) {
				
				location.push(ADDRESS[bestTour[i]]);
				cords.push([
					CORDINATES[bestTour[i]].longitude,
					CORDINATES[bestTour[i]].latitude,
				]);
			}
			res.render("tsp.ejs", {
				cords: cords,
				order: location,
				schedule: allOrders,
				tspno: req.params.deliveryNo,
			});
		}
	}).sort({ date: 1 });
});

app.get("/delivery", isDeliveryAgentLoggedIn , function (req, res) {
	Order.find({ isDelivered: false }, function (err, allOrders) {
		if (err) console.log(err);
		else {
			var map = {};
			var schedule = [];
			for (var i = 0; i < allOrders.length; i++) {
				var currdt = allOrders[i].date;
				var temp = [];
				temp.push(allOrders[i]);
				for (var j = i + 1; j < allOrders.length; j++) {
					var diff = allOrders[j].date - currdt;
					diff = diff / 1000;
					if (diff <= 1200) {
						i++;
						temp.push(allOrders[j]);
					} else break;
				}
				schedule.push(temp);
			}
			// allOrders.forEach((order) => {
			// 	var diff = currdt - order.date;
			// 	diff = diff / 1000;

			// 	var x = Math.ceil(diff / 1200);
			// 	if (map[x] === undefined) map[x] = [];
			// 	map[x].push(order);
			// });
			// var schedule = [];
			// var cost = [];
			// for (var key in map) {
			// 	var temp = [];
			// 	var sum = 0;
			// 	for (var a in map[key]) {
			// 		sum = sum + map[key][a]["total"];
			// 		temp.push(map[key][a]);
			// 	}
			// 	cost.push(sum);
			// 	schedule.push(temp);
			// }
			var cost = [];
			for (var i = 0; i < schedule.length; i++) {
				var sum = 0;
				for (var j = 0; j < schedule[i].length; j++)
					sum = sum + schedule[i][j].total;
				cost.push(sum);
			}
			for (var k = 0; k < schedule.length; k++) {
				for (var j = 0; j < schedule[k].length; j++)
					console.log(schedule[k][j]["total"]);
				console.log();
			}

			res.render("delivery", { schedule: schedule, cost: cost });
		}
	}).sort({ date: 1 });
});

app.get("/changeDeliveryStatus/:Orderid", function (req, res) {
	Order.findById(req.params.Orderid, function (err, foundOrder) {
		if (err) {
			console.log(err);
			res.send({ error: err });
		} else {
			foundOrder["isDelivered"] = true;
			foundOrder.save();
			res.send({ status: "OK" });
		}
	});
});

app.get("/", (req, res) => {
	var recItems = [
		{
		"_id": "617bbe86b88aa0244466d9be",
		"title": "Paneer Chilli Dry",
		"category": "starters",
		"image": "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/i9z0ydh86tdfxcpvqtck",
		"cost": 219,
		"desc": "Chilly paneer is indo Chinese starter or Appetizer garlic",
		"isVeg": true,
	},{
		"_id": "617bbe86b88aa0244466d9d1",
		"title": "American Club Sandwich",
		"category": "sandwich",
		"image": "https://food.fnr.sndimg.com/content/dam/images/food/fullset/2013/2/13/0/FN_FNK-Veggie-Lovers-Club-Sandwich_s4x3.jpg.rend.hgtvcom.616.462.suffix/1371614457375.jpeg",
		"cost": 290,
		"desc": "Cottage cheese, mayo, and corn coleslaw salad.",
		"isVeg": true,
	},{
    	"_id":  "617bbe86b88aa0244466d9d4",
		"title": "Exotica Pizza",
		"category": "Italian",
		"image": "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/afxqbzk9aqbnhbbwcaig",
		"cost": 250,
		"desc": "Scrumptious pizza filled with exotic vegetables, topped with eons of cheese",
		"isVeg": true,
	},{
    "_id": "617bbe86b88aa0244466d9dd",
    "title": "Mumbai Tadka Grilled Pav Bhaji",
    "category": "PavBhaji",
    "image": "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/zuyb0ntyznxwu8vvclzx",
    "cost": 240,
    "desc": "Maska masala tadka bhaji + 2 grilled pav + 1 papad",
	"isVeg": true,
}
	]
	res.render("index",{topItems : recItems});
});

app.get("/menu", (req, res) => {
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
	User.findById(req.user._id, async function (err, founduser) {
		if (err) {
			console.log(err);
			return res.redirect("back");
		} else {
			founduser.cart.amountPayable = Math.max(
				0,
				founduser.cart.total -
					Math.floor(founduser.wallet / 100),
			);
			founduser.cart.discountApplied = Math.min(
				founduser.cart.total,
				Math.floor(founduser.wallet / 100),
			);
			founduser.markModified('cart');
			await founduser.save()
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
						founduser.cart.total =
							founduser.cart.total + foundItem.cost;
					}
					var f = 0;
					var i = 0;
					for (i = 0; i < founduser.cart.foodItems.length; i++) {
						if (
							founduser.cart.foodItems[i]._id.toString() ==
							req.params.id.toString()
						) {
							f = 1;
							
							break;
						}
					}
					if (f == 0) {
						founduser.cart.foodItems.push(foundItem);
						founduser.cart.amountPayable = Math.max(
							0,
							founduser.cart.total -
								Math.floor(founduser.wallet / 100),
						);
						founduser.cart.discountApplied = Math.min(
							founduser.cart.total,
							Math.floor(founduser.wallet / 100),
						);
						founduser.save();
					} else {
						
						var q = founduser.cart.foodItems[i].qty;
						
						
						founduser.cart.foodItems[i].qty = q + 1;
						
						founduser.cart.amountPayable = Math.max(
							0,
							founduser.cart.total -
								Math.floor(founduser.wallet / 100),
						);
						founduser.cart.discountApplied = Math.min(
							founduser.cart.total,
							Math.floor(founduser.wallet / 100),
						);
						founduser.markModified("cart");
						founduser.save();
						
					}

					//   founduser.wallet += 160;

					req.flash("success", foundItem.title + " added to cart.");
					return res.redirect("/menu#" + foundItem.category);
				}
			});
		}
	});
});

app.delete("/cartpage/:id", isLoggedIn, function (req, res) {
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
							founduser.cart.total -
							founduser.cart.foodItems[index].cost;
						if (founduser.cart.foodItems[index].qty > 1) {
							founduser.cart.foodItems[index].qty -= 1;
							req.flash(
								"success",
								foundItem.title + "'s quantity decreased by 1 .",
							);
						} else {
							founduser.cart.foodItems.splice(index, 1);
							req.flash(
								"success",
								foundItem.title + " removed from cart.",
							);
						}
					}
					founduser.cart.amountPayable = Math.max(
						0,
						founduser.cart.total -
							Math.floor(founduser.wallet / 100),
					);
					founduser.cart.discountApplied = Math.min(
						founduser.cart.total,
						Math.floor(founduser.wallet / 100),
					);
					founduser.markModified('cart');
					founduser.save();
					// req.flash(
					// 	"success",
					// 	foundItem.title + " removed from cart.",
					// );
					return res.redirect("/menu#" + foundItem.category);
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
							founduser.cart.total -
							(founduser.cart.foodItems[index].cost*founduser.cart.foodItems[index].qty);
							founduser.cart.foodItems.splice(index, 1);
							req.flash(
								"success",
								foundItem.title + " removed from cart.",
							);
						
					}
					founduser.cart.amountPayable = Math.max(
						0,
						founduser.cart.total -
							Math.floor(founduser.wallet / 100),
					);
					founduser.cart.discountApplied = Math.min(
						founduser.cart.total,
						Math.floor(founduser.wallet / 100),
					);
					founduser.markModified('cart');
					founduser.save();
					// req.flash(
					// 	"success",
					// 	foundItem.title + " removed from cart.",
					// );
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

app.get("/8puzzle", isLoggedIn, function (req, res) {
	res.render("8puzzle");
});

app.get("/connect4", isLoggedIn, function (req, res) {
	res.render("connect4");
});

app.post("/addWalletPoints", isLoggedIn, function (req, res) {
	User.findById(req.user._id, function (err, foundUser) {
		if (err) {
			console.log(err);
			return res.redirect("back");
		} else {
			foundUser.wallet += req.body.points;
			foundUser.cart.amountPayable = Math.max(
				0,
				foundUser.cart.total -
					Math.floor(foundUser.wallet / 100),
			);
			foundUser.cart.discountApplied = Math.min(
				foundUser.cart.total,
				Math.floor(foundUser.wallet / 100),
			);
			foundUser.save();
			res.redirect(req.body.game);
		}
	});
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
		// console.log("hit!");
		// console.log(req.body);
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
					isDelivered: false,
					discountApplied: founduser.cart.discountApplied,
					cartTotal: req.user.cart.total,
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
							founduser.wallet -
							founduser.cart.discountApplied * 100;
						founduser.cart.foodItems = [];
						founduser.cart.total = 0;
						founduser.cart.amountPayable = 0;
						founduser.cart.discountApplied = 0;
						founduser.save();
						console.log(new_order._id);
						res.send({ status: "OK", orderid: new_order._id });
					}
				});
			}
		});
	} else {
		res.send({ error: "You need to be logged in first" });
	}
});

app.get("/orderconfirmed/:orderID", isLoggedIn, (req, res) => {
	Order.find({ _id: req.params.orderID }, (err, foundOrder) => {
		if (err) console.log(err);
		else {
			console.log(foundOrder);
			var id = foundOrder[0]._id.toString().substring(0, 8);
			res.render("orderconfirmed", { order: foundOrder[0], orderid: id });
		}
	});
});


app.get('/games',isLoggedIn,function(req,res){
	res.render("games");
})

//-----------------------------AUTH--------------------------------------

app.get("/login", function (req, res) {
	res.render("login");
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
			if (user.isCustomer == false) {
				req.flash("error", "Please login via Delivery Agent Portal");
				return res.redirect("/deliverylogin");
			}
			req.logIn(user, function (err) {
				if (err) {
					return next(err);
				}
				req.flash("success", "Welcome back " + user.name);
				return res.redirect("/");
			});
		},
	)(req, res, next);
});

app.get("/signup", function (req, res) {
	res.render("signup");
});

app.post("/signup", function (req, res) {
	console.log(req.body);
	var newUser = new User({
		username: req.body.username,
		name: req.body.name,
		phone: req.body.phone,
		isCustomer: true,
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
				err.message ==
				"A user with the given username is already registered"
			) {
				req.flash(
					"error",
					"A user with the given Email Id is already registered",
				);
				return res.redirect("/signup");
			} else {
				req.flash(
					"error",
					"A user with the given Phone No. is already registered",
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

app.get("/deliverylogin", function (req, res) {
	res.render("deliverylogin");
});

app.post("/deliverylogin", function (req, res, next) {
	passport.authenticate(
		"local",
		{
			successRedirect: "/",
			failureRedirect: "/deliverylogin",
			failureFlash: true,
			succssFlash: true,
		},
		function (err, user) {
			// console.log(req.user);
			// console.log(user);
			if (err) {
				return next(err);
			}
			if (!user) {
				req.flash("error", "Password or Email does not match");
				return res.redirect("/deliverylogin");
			}
			if (user.isCustomer == true) {
				req.flash("error", "Please login via Customer Portal");
				return res.redirect("/login");
			}
			req.logIn(user, function (err) {
				if (err) {
					return next(err);
				}
				// console.log(" ----- req.user -----");
				// console.log(req.user);
				req.flash("success", "Welcome back " + user.name);
				return res.redirect("/delivery");
			});
		},
	)(req, res, next);
});

app.get("/deliverysignup", function (req, res) {
	res.render("deliverysignup");
});

app.post("/deliverysignup", function (req, res) {
	var newDeliveryAgent = new User({
		username: req.body.username,
		name: req.body.name,
		phone: req.body.phone,
		isCustomer: false,
	});
	var inputAddress = `${req.body.flatwing}\n${req.body.locality}\n${req.body.pincode}\n${req.body.city}`;
	var addressObj = {
		fullAddress: inputAddress,
		flatwing: req.body.flatwing,
		locality: req.body.locality,
		pincode: req.body.pincode,
		city: req.body.city,
	};
	newDeliveryAgent.addresses.push(addressObj);
	User.register(newDeliveryAgent, req.body.password, function (err, user) {
		if (err) {
			console.log(err);
			if (
				err.message ==
				"A user with the given username is already registered"
			) {
				req.flash(
					"error",
					"A delivery agent with the given Email Id is already registered",
				);
				return res.redirect("/deliverysignup");
			} else {
				req.flash(
					"error",
					"A delivery agent with the given Phone No. is already registered",
				);
				return res.redirect("/deliverysignup");
			}
		} else {
			passport.authenticate("local")(req, res, function () {
				req.flash("success", "Welcome to Dyce & Dyne " + user.name);
				res.redirect("/delivery");
			});
		}
	});
});

app.get("/logout", function (req, res) {
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/");
});

app.get("/cookies", function (req, res) {
	res.render("cookies");
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

function isDeliveryAgentLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		if (!req.user.isCustomer) {
			return next();
		} else {
			req.flash(
				"error",
				"This Page can only be accessed by a Delivery Agent",
			);
			res.redirect("/deliverylogin");
		}
	} else {
		req.flash("error", "You need to be logged in to do that.");
		res.redirect("/deliverylogin");
	}
}

app.listen(3000, () => {
	console.log("Serving on port 3000");
});
