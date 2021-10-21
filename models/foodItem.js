var mongoose = require('mongoose');

var foodItemSchema = new mongoose.Schema({
    title: String,
    category: String,
    image: String,
    cost: Number,
    desc: String
})

module.exports = mongoose.model("FoodItem", foodItemSchema);