require("dotenv").config();
const geolib = require("geolib");
const axios = require("axios");

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

module.exports = {
    create_initial_population,
    calculate_fitness,
    select_best_genes,
    getChild,
    crossover,
    mutation,
    genetic_TSP,
    getAdd,
    _addressToLatLng,
    NO_OF_CHILDREN,
    N,
    GENE_POOL,
    PARENTS,
    ADDRESS,
    CITIES,
    CORDINATES
};