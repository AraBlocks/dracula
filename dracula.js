
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

console.log("hello, nighttime world!");

const util = require('util');
const fs = require("fs");
const writeFile = util.promisify(fs.writeFile);

const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');

rise();
async function rise() {
  console.log("dracula rises to mint dank NFTs");
  
  var s = await mergeImages(['./body.png', './eyes.png', './mouth.png'], { Canvas: Canvas, Image: Image });
  
  var d = s.replace(/^data:image\/png;base64,/, "");
  
  var r = await writeFile("out.png", d, "base64");
  
  console.log("got r");
  console.log(r);

}
















