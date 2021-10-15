
(function() { // All the code is in an unnamed function to avoid unintentionally making things global

/*
________                            .__                  __        
\______ \____________    ____  __ __|  | _____          |__| ______
 |    |  \_  __ \__  \ _/ ___\|  |  \  | \__  \         |  |/  ___/
 |    `   \  | \// __ \\  \___|  |  /  |__/ __ \_       |  |\___ \ 
/_______  /__|  (____  /\___  >____/|____(____  / /\/\__|  /____  >
        \/           \/     \/                \/  \/\______|    \/ 

At sundown, Dracula.js rises from their coffin to mint new generative
sets of dank NFTs. So bring your torch, pitchfork, and MetaMask--
they'll all be gone before dawn...   v   v
*/

//node
const util = require("util");
const fs = require("fs");
const writeFile = util.promisify(fs.writeFile);

//npm
const mergeImages = require("merge-images");
const { Canvas, Image } = require("canvas");

//the library is lined with tall bookcases, filled with dusty, leather-bound books
const library = require("./library.js");
const { log, toss } = library;
const { test, ok, runTests, noop } = library;
const { start, beyond, starts, toInt } = library;
const { stringToLines, removeBlankLines, lineToWords } = library;

//you could admire the elegant parlor, if dark curtains didn't block out all the light
const parlor = require("./parlor.js");
const { rollCard, checkCard, addCard, cardHasAnExactly, deckIsMissingExactlys } = parlor;

/*
  _________ __                  .__           __                          
 /   _____//  |_  ____ ______   |__| ____   _/  |_  ____     _____ ___.__.
 \_____  \\   __\/ __ \\____ \  |  |/    \  \   __\/  _ \   /     <   |  |
 /        \|  | \  ___/|  |_> > |  |   |  \  |  | (  <_> ) |  Y Y  \___  |
/_______  /|__|  \___  >   __/  |__|___|  /  |__|  \____/  |__|_|  / ____|
        \/           \/|__|             \/                       \/\/     
.____          ___.                        __                       
|    |   _____ \_ |__   ________________ _/  |_  ___________ ___.__.
|    |   \__  \ | __ \ /  _ \_  __ \__  \\   __\/  _ \_  __ <   |  |
|    |___ / __ \| \_\ (  <_> )  | \// __ \|  | (  <_> )  | \/\___  |
|_______ (____  /___  /\____/|__|  (____  /__|  \____/|__|   / ____|
        \/    \/    \/                  \/                   \/     

Set quantity, attempts, and brew below, and we shall begin...
*/

var quantity = 100;//how many cards to generate
var attempts = 50000;//how many times to try to get that many
var brew = `

a1 weight1
a2 weight1
a3 weight1

b1 weight1
b2 weight1
b3 weight1

c1 weight1
c2 weight1
c3 weight1 exactly2

d1 weight1
d2 weight1
d3 weight1 exactly1

e1 weight1000
e2 weight1000
e3 weight1 exactly1

f1 weight1
f2 weight1
f3 weight1

g1 weight1
g2 weight1
g3 weight1

`;

//the evil global variables the wise woman of the village warned you about
var layers = [];//information about layers and variants, including weights and exact appearances
var exactlys = [];//variants that must appear exactly a certain number of times
var positives = {};//variants that must appear with another variant
var negatives = {};//variants that cannot appear with another variant
var descriptions = {};//descriptions of each variant
var deck = [];//the finished deck of cards

function rise() {
	prepare();
	mix();
	//here's where you would press()
}

function prepare() {
	var lines = removeBlankLines(stringToLines(brew));
	for (var i = 0; i < lines.length; i++) {//loop for each line in the brew
		var line = lines[i];//the current line
		var words = lineToWords(line);//the words in that line

		//word0 is the layer letter and number
		var word0 = words[0];
		var layerLetter = start(word0, 1);

		//make or get the object about the layer this line is about
		if (!layers.length || layers[layers.length - 1].layer != layerLetter) {
			layers.push({ layer: layerLetter, weights: [] });
		}
		var layer = layers[layers.length - 1];//it's the last one in the array

		//word1 is the weight
		var word1 = words[1];
		if (starts(word1, "exactly")) {//this line describes a variant that must appear an exact number of times
			var exactly = toInt(beyond(word1, "exactly".length));
			exactlys.push({ [word0]: exactly });
		} else if (starts(word1, "weight")) {//this line is about a varient that appears randomly with a weight
			var weight = toInt(beyond(word1, "weight".length));
			for (var k = 0; k < weight; k++) layer.weights.push(word0);
		}

		//the remaining words are either requirements like exactly5 +b1 +b2 -b3, or notes about the variant
		for (var j = 2; j < words.length; j++) {
			var word = words[j];
			if (starts(word, "exactly")) {//exact number of appearances requirement
				var exactly = toInt(beyond(word, "exactly".length));
				exactlys.push({ variant: word0, quantity: exactly });
			} else if (starts(word, "+")) {//optional requirement
				positives[word0] ? positives[word0].push(beyond(word, 1)) : positives[word0] = [beyond(word, 1)];
			} else if (starts(word, "-")) {//poison combination
				negatives[word0] ? negatives[word0].push(beyond(word, 1)) : negatives[word0] = [beyond(word, 1)];
			} else {//part of the description
				descriptions[word0] ? descriptions[word0] += " " : descriptions[word0] = "";
				descriptions[word0] += word;
			}
		}
	}

	log("LAYERS ~~"); log(layers);
	log("EXACTLYS ~~"); log(exactlys);
	log("POSITIVES ~~"); log(positives);
	log("NEGATIVES ~~"); log(negatives);
	log("DESCRIPTIONS ~~"); log(descriptions);
};

function mix() {

	stats = {
		attempts: 0,
		discardsSeekingExactlys: 0,//cards discarded because at the start, we're throwing away everything that doesn't have an exactly
		positives: [],//cards discarded because they rolled a variant with required other variants, but didn't get one
		negatives: [],//cards discarded because they rolled a variant with forbidden neighboring variants, and got one
		duplicates: [],//cards discarded because there's an identical duplicate already in the deck
		exactlyOverflows: []//cards we couldn't add because there's an exactly in there the deck already has enough of
	};

	while (true) {
		if (deck.length == quantity) break;//made as many as we need
		if (stats.attempts == attempts) break;//no more spins of the wheel allowed

		var card = rollCard(layers);
		stats.attempts++;

		//card is valid for positives and negatives, unique in deck, and doesn't push an exactly over the limit
		if (checkCard(deck, card, negatives, positives, exactlys, stats)) {
			//if the deck is still missing some exactlys, only add the card if it has one
			if (deckIsMissingExactlys(deck, exactlys)) {
				if (cardHasAnExactly(card, exactlys)) {
					addCard(deck, card);
				} else {
					stats.discardsSeekingExactlys++;
				}
			//the deck has all the exactlys it needs, add the card
			} else {
				addCard(deck, card);
			}
		}
	}

	log("");
	log(deckToText(deck));
	var success = (deck.length == quantity && !deckIsMissingExactlys(deck, exactlys)) ? "Success!" : "Alas...";
	var madeOrNot = deckIsMissingExactlys(deck, exactlys) ? "Didn't make" : "Made";
	log(`${success} Generated ${deck.length}/${quantity} cards in ${stats.attempts}/${attempts} attempts.
${madeOrNot} all the ultra rares, discarding ${stats.discardsSeekingExactlys} cards at the start looking for them.
Also tossed out ${stats.positives.length} positive and ${stats.negatives.length} negative impossibilities,
${stats.exactlyOverflows.length} ultra rare overflows, and ${stats.duplicates.length} identical duplicates.`);
};

function deckToText(deck) {
	var s = "";
	for (var i = 0; i < deck.length; i++) s += deck[i] + "\r\n";
	return s;
}

async function press() {
  log("Dracula rises to mint dank NFTs");
  
  var s = await mergeImages(['./body.png', './eyes.png', './mouth.png'], { Canvas: Canvas, Image: Image });
  
  var d = s.replace(/^data:image\/png;base64,/, "");
  
  var r = await writeFile("out.png", d, "base64");
  
  log("got r");
  log(r);

}

runTests();//run all the tests scattered throughout
rise();//run the actual program
})(); // Run the unnamed function that has all the code in this file
