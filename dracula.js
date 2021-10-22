
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
const mkdir = util.promisify(fs.mkdir);

//npm
const mergeImages = require("merge-images");
const { Canvas, Image } = require("canvas");

//the library is lined with tall bookcases, filled with dusty, leather-bound books
const library = require("./library.js");
const { log, toss } = library;
const { test, ok, runTests, noop } = library;
const { start, beyond, starts, ends, toInt } = library;
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

/*

c0 weight1
c1 weight1 exactly1 +a3 Skull
c2 weight1 exactly1 Bitcoin Jack-O-Lantern
c3 weight1 exactly1 +a2 Missing Poster
c4 weight1 exactly1 +a1 Full Moon

c0 weight506
c1 weight10 +a3 Skull
c2 weight100 exactly1 Bitcoin Jack-O-Lantern
c3 weight50 +a2 Missing Poster
c4 weight100 +a1 Full Moon


*/

var quantity = 666;//how many cards to generate
var attempts = 50000;//how many times to try to get that many
var performPressStep = true;//false to just make instructions
var brew = `

a3 weight1 Sprayroom
a2 weight2 Washhouse (cool)
a1 weight3 Clearing (warm)

b1 weight1 Splat
b2 weight5 Ooze
b0 weight10

c5 weight1 Pumpkin
c1 weight1 +a3 Skull
c3 weight1 +a2 Poster
c4 weight1 +a1 Moon
c0 weight5
c2 weight10 exactly1 +a2 Satoshi Jack
c6 weight1 exactly1 +a1 -c2 -f4 -f12 ARA Moon

d1 weight1 Leroy
d2 weight3 Bridget
d3 weight6 Marvin

e4  weight50 exactly1 -c2 -c6 Lollypop Bingle
e12 weight8 Bingle
e6  weight1 Orange Inmate
e14 weight8 Inmate

e10 weight2 Lavender Gimp
e2  weight4 Gimp
e7  weight2 Pink Clyde
e15 weight4 Clyde

e9  weight8 -a1 Edward (cool)
e1  weight8 -a2 Edward (warm)
e13 weight8 -a1 Jack (cool)
e5  weight8 -a2 Jack (warm)

e3  weight8 -a1 Farmer Bob (cool)
e11 weight8 -a2 Farmer Gary (warm)
e16 weight8 -a1 Bryce (cool)
e8  weight8 -a2 Bryce (warm)

f1  weight1 Pink Peter
f9  weight2 Peter
f4  weight50 exactly1 +e4 Lollypop Bingle
f12 weight10 +e12 Bingle

f10 weight1 +e10 Lavender Gimp
f2  weight4 -e10 Gimp
f14 weight1 Ginger Marcus
f6  weight4 Marcus

f11 weight10 -a1 Sacky (cool)
f3  weight10 -a2 Sacky (warm)
f5  weight10 -a1 -e12 Fang (cool)
f13 weight10 -a2 -e12 Fang (warm)
f15 weight10 -a1 Stitchy (cool)
f7  weight10 -a2 Stitchy (warm)
f8  weight10 -a1 Keeper (cool)
f16 weight10 -a2 Keeper (warm)

g1 weight1 +d1 Leroy
g2 weight3 +d2 Bridget
g3 weight6 +d3 Marvin

h1 weight1

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
	if (performPressStep) press();
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
${stats.exactlyOverflows.length} ultra rare overflows, and ${stats.duplicates.length} identical duplicates.
`);
};

function deckToText(deck) {
	var s = "";
	for (var i = 0; i < deck.length; i++) s += deck[i] + "\r\n";
	return s;
}

async function press() {
	var stamp = (new Date).getTime();//timestamp of this generation
	
	var legendText = "";//compose comma separated legend text with card number and contained variants
	for (var i = 0; i < deck.length; i++) {
		var card = deck[i];
		var number = i + 1;
		legendText += number + "," + card + "\r\n";
	}
	
	for (var i = 0; i < deck.length; i++) {
		var card = deck[i];
		await pressCard(card, i, stamp, legendText);
	}
}
async function pressCard(card, index, stamp, legendText) {
	var number = index + 1;
	var paths = [];
	for (var i = 0; i < card.length; i++) {
		var variant = card[i];
		if (!(variant.length == 2 && ends(variant, "0"))) {//skip blank variants that have number 0
			paths.push(`./input/${card[i]}.png`);//not blank, include it
		}
	}

	//stamp the number on the card
	var numberText = number+"";
	while (numberText.length < 3) numberText = "0" + numberText;
	paths.push(`./input/${numberText[0]}--.png`);
	paths.push(`./input/-${numberText[1]}-.png`);
	paths.push(`./input/--${numberText[2]}.png`);

	var folder = `./output${stamp}`;
	var legend = `./output${stamp}/legend.txt`;
	var output = `./output${stamp}/${number}.png`;

	var s = await mergeImages(paths, { Canvas: Canvas, Image: Image });
	var d = s.replace(/^data:image\/png;base64,/, "");
	if (number == 1) {//just once on the first card
		await mkdir(folder, {recursive: true});//make the folder
		await writeFile(legend, legendText, "utf8");//save the legend
	}
	await writeFile(output, d, "base64");
	log(card + " " + output);
}













runTests();//run all the tests scattered throughout
rise();//run the actual program
})(); // Run the unnamed function that has all the code in this file
