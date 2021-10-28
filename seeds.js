var mongoose = require("mongoose");
var FoodItem = require("./models/foodItem");

var data = [
    {
     title: "Red Paneer Chilly Dry",
        category: "starters",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/nubodkbsmzmvg3ud2jxv",
        cost: 269,
        desc: "Paneer Garlic Ginger Chilly Onion Capsicum Tossing With Schezwan Sauce",
        isVeg: true,
    },
    {
        title: "Paneer Chilli Dry",
        category: "starters",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/i9z0ydh86tdfxcpvqtck",
        cost: 219,
        desc: "Chilly paneer is indo Chinese starter or Appetizer garlic",
        isVeg: true,
    },
    {
        title: "Panner Manchurain Dry",
        category: "starters",
        image: "https://b.zmtcdn.com/data/dish_photos/329/63258ee0e6ec02f2bdb6ac8223cc2329.jpg?output-format=webp&fit=around|130:130&crop=130:130;*,*",
        cost: 225,
        desc: "Soft paneer made by roughly chopping and deep-frying mix vegetables and then sauteeing it in a sauce flavored with soya sauce.",
        isVeg: true,
    },
    {
        title: "Veg 65",
        category: "starters",
        image: "https://lh3.googleusercontent.com/proxy/pIVcbnK5mqO1MiEmkA-Rk76VABNMA6EpEU7ORtUcO7JL9iO92arPQumKo1KYCb7rDqVb3dgPamduHBmji_WeYUh8EA8AVWplM9jSWzKwi7BB2trVYQWER4Ed4RKfROuiAdRWFIeYmB7YHNr-NnFLl6ro9FP7LbuqIdxKn4i30MvdmxI",
        cost: 210,
        desc: "",
        isVeg: true,
    },
    {
        title: "Chicken Tikka",
        category: "starters",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/s8mmxwtwn676dhgmkruc",
        cost: 244,
        desc: "Chicken Cubes Marinated in a seasonal yogurt based marinade Skewered and char grilled serve green chutney & Salad.",
        isVeg: false,
    },
    {
        title: "Chicken Sekh Kebab",
        category: "starters",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/tlfoqywz8m9iqqol9inn",
        cost: 299,
        desc: "Chicken Mince Marinated in a mix of ground Spice Powder Roasted Gram Flour Green Chilly Garlic Ginger Skewered and Grilled Serve with green chutney & salad.",
        isVeg: false,
    },
    {
        title: "Veg Chilli Dry",
        category: "starters",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/n4whnhexzvoodp2ux1vg",
        cost: 195,
        desc: "",
        isVeg: true,
    },
    {
        title: "Veg Crispy",
        category: "starters",
        image: "http://www.sanjeevkapoor.com/UploadFiles/RecipeImages/Veg-Crispy.jpg",
        cost: 230,
        desc: "Generously stuffed, succulent momo fried to perfection topped with creamy sauces served with a dip.",
        isVeg: true,
    },
    {
        title: "Paneer Crispy",
        category: "starters",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/hflfzkjzjhmrjhpebeyf",
        cost: 250,
        desc: "Paneer based Chinese starter, cooked in spices of garlic and ginger with chilly. It is one of our bestsellers.",
        isVeg: true,
    },
    {
        title: "Veg Spring Roll",
        category: "starters",
        image: "https://i2.wp.com/vegecravings.com/wp-content/uploads/2016/09/spring-roll-recipe-step-by-step-instructions.jpg?fit=3766%2C3024&quality=65&strip=all&ssl=1",
        cost: 230,
        desc: "Veg Spring Rolls are crispy deep fried snacks filled with a delicious stuffing of lightly spiced and crunchy vegetables.",
        isVeg: true,
    },
    {
        title: "Veg Manchurian Dry",
        category: "starters",
        image: "http://www.theterracekitchen.in/wp-content/uploads/2019/08/089.-Veg-Manchurian-1.png",
        cost: 215,
        desc: "This dish is prepared by deep frying vegetables balls and by tossing them in the spicy, sweet, tangy Manchurian sauce.",
        isVeg: false,
    },
    //Sandwichesss==================
    {
        title: "Veg Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/qoygpxgudiaeumu07y1p",
        cost: 70,
        desc : "",
        isVeg: true,
    },
    {
        title: "Jain Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/qoygpxgudiaeumu07y1p",
        cost: 80,
        desc : "",
        isVeg: true,
    },
    {
        title: "Veg Toast Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/vd7gewnj1rqthbipasqb",
        cost: 80,
        desc : "",
        isVeg: true,
    },
    {
        title: "Jain Toast Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/vd7gewnj1rqthbipasqb",
        cost: 90,
        desc : "",
        isVeg: true,
    },
    {
        title: "Veg Grilled Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/jak8xue74uia7nw5xcrl",
        cost: 150,
        desc : "Onion, tomato, capsicum, potato with green sauce",
        isVeg: true,
    },
    {
        title: "Veg Cheese Grilled Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/wi2zt2t5ma9v2alwxpde",
        cost: 150,
        desc : "Onion, tomato, capsicum, potato with green sauce loaded with cheese",
        isVeg: true,
    },
    {
        title: "Pasta Hot Dog Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/tat9umb6fevwb5c3ovzv",
        cost: 210,
        desc : "Macaroni pasta oven baked.",
        isVeg: true,
    },
    {
        title: "Veg Cheese Grilled Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/vd7gewnj1rqthbipasqb",
        cost: 180,
        desc : "Hearty sandwich stuffed generously with assorted seasoned vegetables, cheese and grilled.",
        isVeg: true,
    },
    {
        title: "Melting Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/evex5eqdanqthwarhzay",
        cost: 220,
        desc : "Light space pan fried golden cheese along with bechamel sauce.",
        isVeg: true,
    },
    {
        title: "Italian Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/cgpvlcx5b8fifj6yc1x6",
        cost: 190,
        desc : "Black olive, bell pepper, and corn.",
        isVeg: true,
    },
    {
        title: "Paneer Grilled Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/wzfq7djolqxgdhghebbq",
        cost: 225,
        desc : "Panfried masala paneer.",
        isVeg: true,
    },
    {
        title: "American Club Sandwich",
        category: "sandwich",
        image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_1024/bbaysnryu6qqytbqddrq",
        cost: 299,
        desc : "Cottage cheese, mayo, and corn coleslaw salad.",
        isVeg: true,
    },

];

function seedDB() {
    //Remove all FoodItems
    FoodItem.remove({}, function(err){
        if(err){
            console.log(err);
        }
    })
    //      console.log("removed FoodItems!");
    //   added FoodItems
    data.forEach(function (seed) {
        FoodItem.create(seed, function (err, FoodItem) {
            if (err) {
                console.log(err);
            } else {
                // console.log(FoodItem);
            }
        });
    });
}

module.exports = seedDB;
