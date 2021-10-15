
(function() { // All the code is in an unnamed function to avoid unintentionally making things global

// Export with a single line like exporty({function1, function2});
function exporty(o) { var exportToGlobal = false; // Set true to not have to import stuff
	var d; // Destination object where we'll attach all the exports
	if (exportToGlobal) d = window; // Simple and works everywhere
	if (!d && module && module.exports) d = module.exports; // Node
	if (!d) d = window; // Fall back to global
	for (k in o) { if (d[k]) logError("exporty overwriting", { exists: o[k], incoming: d[k] }); d[k] = o[k]; }
}

const library = require("./library.js");
const { log, toss } = library;
const { test, ok, runTests, noop } = library;
const { start, beyond, starts, toInt } = library;
const { randomThrough, randomUnder } = library;
const { stringToLines, removeBlankLines } = library;
const { lineToWords } = library;






//add card to deck in a random position
function addCard(deck, card) {
	if (!deck.length) {//first card in
		deck.push(card);
	} else {//1 or more cards there
		var i = randomUnder(deck.length + 2);//that's right plus two, random 0 start through length add on end
		deck.splice(i, 0, card);
	}
}
noop(function() {
	for (var i = 0; i < 50; i++) {
		var deck = [];
		for (var j = 1; j < 4; j++) addCard(deck, j);
		log(deck);
	}
});
exporty({addCard});






//returns an array of instructions like ["a1", "b1", "c17"] randomly rolled according to the weights
//the card won't include any exact variants, and might be impossible, we'll check later
function rollCard(layers) {
	var a = [];
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];
		var roll = randomUnder(layer.weights.length);
		a.push(layer.weights[roll])
	}
	return a;
}

//check all the variants in this card for required or forbidden neighboring variants
//and then make sure there isn't one like it already in the deck
function checkCard(deck, card, negatives, positives, exactlys, stats) {

	//loop for each layer variant, the card's elements
	for (var i = 0; i < card.length; i++) {
		var element = card[i];

		//first, eliminate negatives
		if (negatives[element]) {//this element has some variants that don't mix
			if (cardHasAnyOf(card, negatives[element])) {
				stats.negatives.push(card);
				return false;
			}
		}

		//then, require a positive
		if (positives[element]) {//this element has some variants it must be with
			if (!cardHasAnyOf(card, positives[element])) {
				stats.positives.push(card);
				return false;
			}
		}
	}

	//so the card is possible, but is it unique?
	if (!uniqueCard(deck, card)) {
		stats.duplicates.push(card);
		return false;
	}

	//so the card is possible and unique, but does it have an exactly that's over the limit?
	if (overflowExactlys(deck, card, exactlys)) {
		stats.exactlyOverflows.push(card);
		return false;
	}

	return true;//the card passed our gauntlet
}

exporty({rollCard, checkCard});



//true if the given card has at least one of the variants in the given exactlys array
function cardHasAnExactly(card, exactlys) {
	for (var i = 0; i < exactlys.length; i++) {
		var exactly = exactlys[i];
		if (cardHas(card, exactly.variant)) return true;
	}
	return false;//no exactly found
}


//true if there's an exactly like { variant: "d12", quantity 5 } in the exactlys array,
//and deck doesn't have 5 d12s yet
//false if deck has the full amount of all the exactlys in the array
function deckIsMissingExactlys(deck, exactlys) {
	for (var i = 0; i < exactlys.length; i++) {
		var exactly = exactlys[i];
		var appearances = countAppearances(deck, exactly.variant);
		if (appearances < exactly.quantity) return true;
	}
	return false;//the deck is completely full of exactlys
}
exporty({cardHasAnExactly, deckIsMissingExactlys});






//true if this card has an exactly we don't need
function overflowExactlys(deck, card, exactlys) {//for the current deck and this single new candidate card
	for (var i = 0; i < exactlys.length; i++) {//loop for every exact count requirement
		if (overflowExactly(deck, card, exactlys[i])) return true;//this card puts one requirement over, it's an overflow
	}
	return false;//this card doesn't overflow any exactly requirements, it's ok to add it to the deck
}
//given a deck of unique cards, a new card that is also unique,
//and an object from the exactlys array like { variant: "g7", quantity: 2 }
//true if card has g7, and deck already has two g7s, so we can't add the card because it would be a third g7
function overflowExactly(deck, card, exactly) {
	var quantity = countAppearances(deck, exactly.variant);
	if (cardHas(card, exactly.variant)) quantity++;
	if (quantity > exactly.quantity) return true;//overflow, can't add it
	return false;
}



//given a deck of cards and a single variant like "d7", count how many cards have that variant
function countAppearances(deck, variant) {
	var n = 0;
	for (var i = 0; i < deck.length; i++) {
		var card = deck[i];
		if (cardHas(card, variant)) n++;
	}
	return n;
}
test(function() {
	var deck = [
		["a1", "b1", "c1", "d10"],
		["a1", "b1", "c2", "d10"],
		["a1", "b2", "c3", "d11"],
		["a1", "b2", "c4", "d12"],
		["a1", "b2", "c5", "d12"]
	];
	ok(countAppearances(deck, "a1")  == 5);
	ok(countAppearances(deck, "b1")  == 2);
	ok(countAppearances(deck, "b2")  == 3);
	ok(countAppearances(deck, "c5")  == 1);
	ok(countAppearances(deck, "d11") == 1);

	var card = ["a1", "b2", "c6", "d12"];
	ok(uniqueCard(deck, card));
	ok(overflowExactly(deck, card, { variant: "b2", quantity: 3 }));
	ok(!overflowExactly(deck, card, { variant: "b2", quantity: 4 }));

	var exactlys = [
		{ variant: "b1", quantity: 2 },
		{ variant: "b2", quantity: 3 }
	];
	ok(overflowExactlys(deck, ["a1", "b1", "c6", "d12"], exactlys));
	ok(overflowExactlys(deck, ["a1", "b2", "c7", "d12"], exactlys));
	ok(!overflowExactlys(deck, ["a1", "b3", "c8", "d12"], exactlys));

	ok(!deckIsMissingExactlys(deck, [{ variant: "b1", quantity: 2 }, { variant: "b2", quantity: 3 }]));
	ok(deckIsMissingExactlys(deck,  [{ variant: "b1", quantity: 3 }, { variant: "b2", quantity: 3 }]));
	ok(deckIsMissingExactlys(deck,  [{ variant: "b1", quantity: 2 }, { variant: "b2", quantity: 4 }]));

	ok(cardHasAnExactly(["a1", "b1", "c1", "d10"], exactlys));
	ok(!cardHasAnExactly(["a1", "b3", "c1", "d10"], exactlys));
});





//given a card like ["a1", "b7"] and some related variants like ["v7", "v8"],
//true if any of the variants can be found in the card
function cardHasAnyOf(card, variants) {
	for (var i = 0; i < variants.length; i++) {
		if (cardHas(card, variants[i])) return true;//found one, that's all we need
	}
	return false;//none of them found
}
//given a card like ["a1", "b7"], true if in there is the given variant like "c12"
function cardHas(card, variant) {
	for (var i = 0; i < card.length; i++) {
		if (card[i] == variant) return true;
	}
	return false;//not found
}
test(function() {
	ok(cardHas(["a1", "b1"], "a1"));
	ok(cardHas(["a1", "b1"], "b1"));
	ok(!cardHas(["a1", "b1"], "c1"));

	ok(cardHasAnyOf(["a1", "b1"], ["a1", "b1"]));
	ok(cardHasAnyOf(["a1", "b1"], ["c1", "b1"]));
	ok(!cardHasAnyOf(["a1", "b1"], ["a2", "b3"]));
});

//given a deck of unique cards and a new card that might be unique, return true if it is
function uniqueCard(deck, card) {
	for (var i = 0; i < deck.length; i++) {
		if (sameCard(deck[i], card)) return false;//found a duplicate, card is not unique
	}
	return true;//not found, card is unique
}
test(function() {
	ok(uniqueCard([["a1", "b1"], ["a1", "b2"]], ["a1", "b3"]));
	ok(!uniqueCard([["a1", "b1"], ["a1", "b2"]], ["a1", "b2"]));
});

//given two cards, true if they've got all the same variants
function sameCard(card1, card2) {
	for (var i = 0; i < card1.length; i++) {
		if (card1[i] != card2[i]) return false;//found a different variant
	}
	return true;//they're all the same
}
test(function() {
	ok(sameCard(["a1", "b2", "c5"], ["a1", "b2", "c5"]));
	ok(!sameCard(["a1", "b2", "c5"], ["a1", "b1", "c5"]));
});





})(); // Run the unnamed function that has all the code in this file
