var express = require("express");
var app = express();
app.use(express.static(__dirname + "/public"));
const geolib = require("geolib");

const no_of_children = 5;
var cities = [0, 1, 2, 3, 4];
const address = ["Saibaba Nagar", "Ram Nagar", "Prem Nagar", "MG Road", "SV road"];
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
        sum = sum + geolib.getDistance(cordinates[arr[i]], cordinates[arr[i - 1]], 0.01);
    sum = sum + geolib.getDistance(cordinates[0], cordinates[arr[arr.length - 1]], 0.01);
    return sum;
}
function select_best_genes() {
    let pq = [];
    for (var i = 0; i < gene_pool.length; i++) pq[i] = [calculate_fitness(gene_pool[i]), i];
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

app.get("/", function (req, res) {
    genetic_TSP();
    let warehouseLocation = [];
    let location = [];
    let order = parents[no_of_children - 1];
    for (var i = 0; i < order.length; i++) {
        console.log(address[order[i]]);
        location.push(address[order[i]]);
        warehouseLocation.push([cordinates[order[i]].longitude, cordinates[order[i]].latitude]);
    }
    console.log(location);
    console.log(warehouseLocation);
    res.render("tsp.ejs", { warehouseLocation: warehouseLocation, order: location });
});

//====================================================================//

app.listen(3000, function (req, res) {
    console.log("rollin");
});
