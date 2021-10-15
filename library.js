
(function() { // All the code is in an unnamed function to avoid unintentionally making things global

// Export with a single line like exporty({function1, function2});
function exporty(o) { var exportToGlobal = false; // Set true to not have to import stuff
	var d; // Destination object where we'll attach all the exports
	if (exportToGlobal) d = window; // Simple and works everywhere
	if (!d && module && module.exports) d = module.exports; // Node
	if (!d) d = window; // Fall back to global
	for (k in o) { if (d[k]) logError("exporty overwriting", { exists: o[k], incoming: d[k] }); d[k] = o[k]; }
}

const crypto = require("crypto");




//tiny tests
var tests = [];
var assertionsPassed, assertionsFailed, testsThrew;
function test(f) {
	tests.push(f);
}
function ok(assertion) {
	if (assertion) {
		assertionsPassed++;
	} else {
		assertionsFailed++;
		console.error("Test not ok, second line number expanded below:");
	}
}
function runTests() {
	var g = String.fromCodePoint(0x2705);  // Green check emoji
	var r = String.fromCodePoint(0x274C);  // Red X
	var a = String.fromCodePoint(0x1F815); // Up arrow

	assertionsPassed = 0;
	assertionsFailed = 0;
	testsThrew = 0;
	for (var i = 0; i < tests.length; i++) {
		try { tests[i](); } catch (e) { testsThrew++; console.error(e); }
	}
	if (assertionsFailed || testsThrew) {
		console.error(`${r} ${a}${a}${a} Tests failed ${a}${a}${a} ${r}`);
	} else {
		console.log(`${g} ${assertionsPassed} assertions in ${tests.length} tests all passed ${g}`);
	}
}
exporty({test, ok, runTests});
/*
TODO you forgot to add done:

test((ok, done) => {
	ok(true);
	done();
});
*/

var noop = (function(){});
exporty({noop});





//        _               _    
//    ___| |__   ___  ___| | __
//   / __| '_ \ / _ \/ __| |/ /
//  | (__| | | |  __/ (__|   < 
//   \___|_| |_|\___|\___|_|\_\
//                             

/*************************************************************************/
/*                                                                       */
/*                                  (`-.                                 */
/*                                   \  `                                */
/*      /)         ,   '--.           \    `                             */
/*     //     , '          \/          \   `   `                         */
/*    //    ,'              ./         /\    \>- `   ,----------.        */
/*   ( \  ,'    .-.-._        /      ,' /\    \   . `            `.      */
/*    \ \'     /.--. .)       ./   ,'  /  \     .      `           `.    */
/*     \     -{/    \ .)        / /   / ,' \       `     `-----.     \   */
/*     <\      )     ).:)       ./   /,' ,' \        `.  /\)    `.    \  */
/*      >^,  //     /..:)       /   //--'    \         `(         )    ) */
/*       | ,'/     /. .:)      /   (/         \          \       /    /  */
/*       ( |(_    (...::)     (                \       .-.\     /   ,'   */
/*       (O| /     \:.::)                      /\    ,'   \)   /  ,'     */
/*        \|/      /`.:::)                   ,/  \  /         (  /       */
/*                /  /`,.:)                ,'/    )/           \ \       */
/*              ,' ,'.'  `:>-._._________,<;'    (/            (,'       */
/*            ,'  /  |     `^-^--^--^-^-^-'                              */
/*  .--------'   /   |                                                   */
/* (       .----'    |   *************************************************/
/*  \ <`.  \         |   */
/*   \ \ `. \        |   */  // Make sure s is a string that has some text,
/*    \ \  `.`.      |   */  // meaning it's not blank, and not just space
/*     \ \   `.`.    |   */  function checkText(s) {
/*      \ \    `.`.  |   */    if (!hasText(s)) toss("no text", {s});
/*       \ \     `.`.|   */  }
/*        \ \      `.`.  */  function badText(s) {
/*         \ \     ,^-'  */    return !hasText(s);
/*          \ \    |     */  }
/*           `.`.  |     */  function hasText(s) {
/*              .`.|     */    return (
/*               `._>    */      typeof s == "string" &&
/*                       */      s.length &&
/*       g o o d w i n   */      s.trim() != ""
/*                       */    );
/*************************/  }

// Make sure i is a whole integer with a value of m or greater
function toIntCheck(n, m) { var i = toInt(n); checkInt(i, m); return i; }
function toInt(n) {
	var i = parseInt(n, 10);//specify radix of base10
	if (i+"" !== n) toss("round trip mismatch", {n, i});
	return i;
}
function checkInt(i, m) { if (badInt(i, m)) toss("Must be an integer m or higher", {i, m}); }
function minInt(i, m) { return !badInt(i, m); }
function badInt(i, m) {
	if (!m) m = 0;//TODO potentially huge change, make sure -5 is truthy enough to make it through this
	return !(typeof i === "number" && !isNaN(i) && Number.isInteger(i) && i >= m);
}

// Make sure a is an array with at least one element
function checkArray(a) { if (badArray(a)) toss("Must be an array", {a}); }
function badArray(a) {
	return !(typeof a === "object" && typeof a.length == "number" && a.length > 0);
}
//TODO added new stuff, write test cases

exporty({checkText, badText, hasText});
exporty({toIntCheck, toInt, checkInt, minInt, badInt});
exporty({checkArray, badArray});








//   _            _   
//  | |_ _____  _| |_ 
//  | __/ _ \ \/ / __|
//  | ||  __/>  <| |_ 
//   \__\___/_/\_\\__|
//                    

function start(s, n)  { return clip(s, 0, n); }            // Clip out the first n characters of s, start(s, 3) is CCCccccccc	
function end(s, n)    { return clip(s, s.length - n, n); } // Clip out the last n characters of s, end(s, 3) is cccccccCCC	
function beyond(s, i) { return clip(s, i, s.length - i); } // Clip out the characters beyond index i in s, beyond(s, 3) is cccCCCCCCC	
function chop(s, n)   { return clip(s, 0, s.length - n); } // Chop the last n characters off the end of s, chop(s, 3) is CCCCCCCccc	
function clip(s, i, n) {                                   // Clip out part of s, clip(s, 5, 3) is cccccCCCcc
	if (i < 0 || n < 0 || i + n > s.length) toss("Avoided clipping beyond the edges of the given string", {s, i, n});
	return s.substring(i, i + n);
}
//TODO these throw if anything is out of bounds, maybe add startSoft, endSoft, beyondSoft that instead return shorter or blank

function has(s, t)    { return                      findFirst(s, t) != -1; } // True if s contains t
function starts(s, t) { return _mightStart(s, t) && findFirst(s, t) == 0; } // True if s starts with t
function ends(s, t)   { return _mightEnd(s, t)   && findLast(s, t) == s.length - t.length; } // True if s ends with t

function cut(s, t)     { return _cut(s, t, findFirst(s, t)); } // Cut s around t to get what's before and after
function cutLast(s, t) { return _cut(s, t, findLast(s, t)); } // Cut s around the last place t appears to get what's before and after
function _cut(s, t, i) {
	if (i == -1) {
		return { found: false, before: s, tag: "", after: "" };
	} else {
		return {
			found:  true, // We found t at i, clip out the text before and after it
			before: start(s, i),
			tag:    clip(s, i, t.length), // Include t to have all parts of s
			after:  beyond(s, i + t.length)
		};
	}
}
// Keep starts() and ends() from making indexOf() scan the whole thing if the first character doesn't even match
function _mightStart(s, t) { return s.length && t.length && s.charAt(0)            == t.charAt(0); }
function _mightEnd(s, t)   { return s.length && t.length && s.charAt(s.length - 1) == t.charAt(t.length - 1); }
// Don't give indexOf() blank strings, because somehow "abc".indexOf("") is 0 first not -1 not found
function findFirst(s, t) { if (s.length && t.length) return s.indexOf(t);     else return -1; }
function findLast(s, t)  { if (s.length && t.length) return s.lastIndexOf(t); else return -1; }

// In a single pass through s, replace whole instances of t1 with t2
function swap(s, t1, t2) {
	var s2 = "";          // Target string to fill with text as we break off parts and make the replacement
	while (s.length) {    // Loop until s is blank, also makes sure it's a string
		var c = cut(s, t1); // Cut s around the first instance of the tag in it
		s2 += c.before;     // Move the part before from s to done
		if (c.found) s2 += t2;
		s = c.after;
	}
	return s2;
}

// Parse out the part of s between t1 and t2
function parse(s, t1, t2) {
	var c1 = cut(s,        t1);
	var c2 = cut(c1.after, t2);
	if (c1.found && c2.found) {
		return {
			found:     true,
			before:    c1.before,
			tagBefore: c1.tag,
			middle:    c2.before,
			tagAfter:  c2.tag,
			after:     c2.after
		};
	} else {
		return { found: false, before: s, tagBefore: "", middle: "", tagAfter: "", after: "" };
	}
}

exporty({start, end, beyond, chop, clip});
exporty({has, starts, ends});
exporty({findFirst, findLast});
exporty({cut, cutLast});
exporty({swap, parse});







//tiny log and toss
function log(...a) {
	a.forEach(e => console.log(e));
}
function logError(note, watch) {
	var description = "[LOG ERROR] " + note + _describe(watch);
	console.error(description);
	if (watch) console.error(watch);
}
function toss(note, watch) {
	var description = "[TOSS] " + note + _describe(watch);
	console.error(description);
	if (watch) console.error(watch);
	throw new Error(description);
}
function _describe(watch) {
	var s = "";//TODO here's where you'd put in the timestamp prefix if you add that
	if (watch)
		for (var k in watch)
			s += `\r\n-- ${k} (${typeof watch[k]}) ${JSON.stringify(watch[k])}`;
	return s;
}
exporty({log, logError, toss});







//   _ _                 
//  | (_)_ __   ___  ___ 
//  | | | '_ \ / _ \/ __|
//  | | | | | |  __/\__ \
//  |_|_|_| |_|\___||___/
//                       

// Compose lines

// Convert an array of lines into text with "\r\n" at the end of each
function linesToString(lines) {
	var s = "";
	for (var i = 0; i < lines.length; i++) s += lines[i] + "\r\n";//works on linux, mac, *and* windows, bro
	return s;
}

// Parse lines

// Split text with "\r\n" or just "\n" into an array of lines
function stringToLines(s) {
	var lines = s.split("\n");
	for (var i = 0; i < lines.length; i++) {
		if (ends(lines[i], "\r")) lines[i] = chop(lines[i], 1);
	}
	return lines;
}

// Split a list of lines into paragraphs separated by blank lines
function linesToParagraphs(a) {
	var b = []; // Lines in the current paragraph
	var c = []; // Finished paragraphs
	for (var i = 0; i < a.length; i++) {
		var s = a[i];
		if (badText(s)) { // We're on a blank line which separates paragraphs
			if (b.length) { // And we've got some lines in the current paragraph
				c.push(b);    // Finish the current paragraph
				b = [];       // Empty for the next paragraph
			}
		} else {
			b.push(s); // Add this line to the current paragraph
		}
	}
	if (b.length) c.push(b); // Take the last paragraph
	return c;
}

// Group neighboring nonblank lines together
function linesToParagraphLines(lines) {
	var paragraphLines = [];
	var currentLine = "";
	lines.forEach(line => {
		if (hasText(line)) {
			currentLine += line + " ";
		} else {
			if (hasText(currentLine)) {
				paragraphLines.push(currentLine.trimEnd());
				currentLine = "";
			}
			paragraphLines.push("");
		}
	});
	if (hasText(currentLine)) {
		paragraphLines.push(currentLine.trimEnd());
		currentLine = "";
	}
	return paragraphLines;
}

// Examine lines

// Given an array of lines, true if one matches line
function hasLine(lines, line) {
	for (var i = 0; i < lines.length; i++) {
		if (lines[i] == line) return true;
	}
	return false;
}

// Given lines and a starting index, return the index of that line if it has text or the next nonblank line
function findNextLine(lines, i) {
	if (i >= lines.length) return -1; // Already on the end, not found
	for (; i < lines.length; i++) { // Loop from i forward
		if (hasText(lines[i])) return i; // Found a line with some text, return the line's index
	}
	return -1; // No more lines or they're all blank
}

exporty({linesToString, stringToLines, linesToParagraphs, linesToParagraphLines});
exporty({hasLine, findNextLine});

//  __        __            _     
//  \ \      / /__  _ __ __| |___ 
//   \ \ /\ / / _ \| '__/ _` / __|
//    \ V  V / (_) | | | (_| \__ \
//     \_/\_/ \___/|_|  \__,_|___/
//                                

//a single line, words in a line, wrap

//given a long single line, return a list of lines wrapped to the given width in characters
function wrapLineToWidth(line, wrapWidth) {
	if (!wrapWidth) wrapWidth = 80;//default column width
	var lines = [];//list of short lines we'll build and return
	var words = lineToWords(line.trim());//given words, all trimmed, no blanks
	var s = "";//line to build up underneath width, unless not possible
	for (var i = 0; i < words.length; i++) {//loop for each word
		var word = words[i];
		var propsed = (s + " " + word).trim();//see what the new word looks like on our current line
		if (propsed.length <= wrapWidth) {//fits, used proposed
			s = propsed;
		} else {//overflows, start new line
			lines.push(s);
			s = word;
		}
		if (i == words.length - 1) { lines.push(s); }//last word
	}
	return lines;
}
test(function() {
	var line = "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.  Two spaces, and aReallyLongWordThatWillGetItsOwnLineGoingOverTheWidth, but that's ok.";
	var lines = wrapLineToWidth(line, 40);
	ok(lines[3] == "aliqua. Two spaces, and");//two spaces became one space
	ok(lines[4] == "aReallyLongWordThatWillGetItsOwnLineGoingOverTheWidth,");
});

//split a line into an array of words, all trimmed, no blanks
function lineToWords(line) {
	line = onlySpaces(line);//turn tabs and any \r\n in there all into spaces
	var a = line.split(" ");//split on space
	var words = [];
	for (var i = 0; i < a.length; i++) {
		var w = a[i];
		w = w.trim();
		if (hasText(w)) words.push(w);//only return words, no blanks
	}
	return words;
}
test(function() {
	ok(lineToWords(" a b  c ").length == 3);
});
exporty({wrapLineToWidth, lineToWords});






//turn all nonprinting characters in s like tabs and newline characters into spaces
function onlySpaces(s) {
	var t = "";
	for (c of s) t += c.trim().length ? c : " ";//if c trims to blank, mark it with a space
	return t;
}

exporty({onlySpaces});








//   _     _                 
//  | |   (_)_ __   ___  ___ 
//  | |   | | '_ \ / _ \/ __|
//  | |___| | | | |  __/\__ \
//  |_____|_|_| |_|\___||___/
//                           

//given a list of lines, remove all the blank lines, returns a new array
function removeBlankLines(lines) {
	var l = [];
	lines.forEach(line => { if (hasText(line)) l.push(line); });
	return l;
}

//given a list of lines, remove blank lines at the start and the end, edits the given array
function trimBlankLines(lines) {
	while (lines.length && badText(lines[0])) lines.shift();//remove blank at the start
	while (lines.length && badText(lines[lines.length - 1])) lines.pop();//remove blank at the end
	return lines;
}

//given a list of lines, replace multiple blank lines with a single blank line, returns a new array
function condenseBlankLines(lines) {
	var l = [];
	var spaced = false;
	lines.forEach(line => {
		if (hasText(line)) { spaced = false; l.push(line); }
		else if (!spaced) { spaced = true; l.push(""); }
	});
	return trimBlankLines(l);//also remove blank lines at the start and end
}

exporty({removeBlankLines, trimBlankLines, condenseBlankLines});

test(function() {
var block = `

line1

line2a
line2b


line3

line4a
line4b

`;

	var lines = stringToLines(block);
	ok(lines.length == 14);
	ok(removeBlankLines(lines).length == 6);
	ok(trimBlankLines(lines).length == 10);
	ok(condenseBlankLines(lines).length == 9);
});






/*
__________       .__  .__      __  .__             ________  .__              
\______   \ ____ |  | |  |   _/  |_|  |__   ____   \______ \ |__| ____  ____  
 |       _//  _ \|  | |  |   \   __\  |  \_/ __ \   |    |  \|  |/ ___\/ __ \ 
 |    |   (  <_> )  |_|  |__  |  | |   Y  \  ___/   |    `   \  \  \__\  ___/ 
 |____|_  /\____/|____/____/  |__| |___|  /\___  > /_______  /__|\___  >___  >
        \/                              \/     \/          \/        \/    \/ 
if you dare...
*/

// True with the chances of n in d
function chance(n, d) {
	minInt(n, 1); // The numerator must be 1+
	minInt(d, n); // The denominator must be the numerator or larger
	return randomUnder(d) < n; // May the odds be ever in your favor
}

// Pick a random value a through b, like 1-6 for a dice to get 1 2 3 4 5 6
function randomThrough(a, b) {
	minInt(a, 0); // The minimum must be 0+
	minInt(b, a); // The maximum must be the minimum or larger
	return randomUnder(b - a + 1) + a;
}

// Pick a random value from amongst v possibilities, like 10 to get 0-9, or 256 to get 0-255, exact powers of 2 are the fastest
function randomUnder(v) {
	while (true) { // Loop until we roll an r small enough to use
		var r = randomPower(v);
		if (r < v) return r;
	}
}
function randomPower(v) { // Given a number of values, pick a random from amongst a power of 2 that is v or bigger
	var h = 0, r = 0, p = 0;
	while (true) {             // Loop until h is big enough to cover v, return random r which might work
		h += p;                  // High h gets every p
		if (randomBit()) r += p; // Random r gets p half the time
		if (h > v - 2) return r; // Ok if v - 2 is negative, h + 2 could go over max safe int
		p = !p ? 1 : 2*p;        // Double power what we add each time, p 0 1 2 4 8 16...
	}
}

// Get a random bit 0 or 1
var _randomBuffer = null; // Caching more than width 20 bytes doesn't make it faster
var _bitIndex  = 0;
var _byteIndex = 0;
function randomBit() {
	const width = 20; // A SHA1 hash value is 20 bytes
	if (!_randomBuffer)      { _randomBuffer = crypto.randomBytes(width);                                } // First make
	if (_bitIndex  == 8)     {                                            _bitIndex = 0; _byteIndex++;   } // Next byte
	if (_byteIndex == width) { _randomBuffer = crypto.randomBytes(width); _bitIndex = 0; _byteIndex = 0; } // Refresh cache
	var b = (_randomBuffer.readUInt8(_byteIndex) & (1 << _bitIndex)) >>> _bitIndex; // Read a bit
	_bitIndex++; // Move to the next bit for next time
	return b;
}

exporty({randomThrough, randomUnder});



//turn back on to see some rolls of the dice
noop(function() {

	var s = "";
	for (var i = 0; i < 500; i++) {
		s += randomThrough(1, 6) + " ";
	}
	log(s);

});







})(); // Run the unnamed function that has all the code in this file
