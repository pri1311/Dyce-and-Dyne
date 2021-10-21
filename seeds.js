var mongoose = require("mongoose");
var FoodItem = require("./models/foodItem");

var data = [
    {
        title: "Paneer Chilli Sandwich",
        category: "Sandwich",
        image:
            "https://res.cloudinary.com/dnrlnufs4/image/upload/v1615445786/mtshirt_ykzk2g.jpg",
        cost: 550,
        desc: "lorem Ipsum"
    },
    {
        title: "Paneer Tikka Masala",
        category: "Main Course",
        image:
            "https://res.cloudinary.com/dnrlnufs4/image/upload/v1615445786/mtshirt_ykzk2g.jpg",
        cost: 279,
        desc: "chunks of Malai Paneer marinated in spices and yogurt that are roasted in a Tandoor, treated in Punjabi style in a creamy of Onion and Tomato"
    },
    {
        title: "Paneer Butter Masala",
        category: "Main Course",
        image:
            "https://res.cloudinary.com/dnrlnufs4/image/upload/v1615445786/cap_bzklwx.jpg",
        cost: 300,
        desc: "Small cubes of Paneer in creamy curry is made with onion, tomatoes, cashews, cream and butter"
    },
    {
        title: "Paneer Makhmali Kebab",
        category: "Starters",
        image:
            "data:image/jpeg;base64,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",
        cost: 600,
        desc: "Paneer Pieces are lightly stuffed with all three colour Bell pepper and Capsicum with cheese and Paneer before coating with saffron bases Tandoori Masala and chargrilling to perfection. Served with Mint corrainder chutney and Tandoori Kachumbar salad."

    },
];

function seedDB() {
    //Remove all FoodItems
    // FoodItem.remove({}, function(err){
    //     if(err){
    //         console.log(err);
    //     }
    // })
    //      console.log("removed FoodItems!");
    //   added FoodItems
    data.forEach(function (seed) {
        FoodItem.create(seed, function (err, FoodItem) {
            if (err) {
                console.log(err);
            } else {
                console.log(FoodItem);
            }
        });
    });
}

module.exports = seedDB;
