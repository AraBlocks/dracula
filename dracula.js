
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

/*
var magic = require("imagemagick");
console.log(typeof magic);
console.log(magic);
*/


//https://www.npmjs.com/package/merge-images

const mergeImages = require('merge-images');
const { Canvas, Image } = require('canvas');


//rise();
function rise() {
  console.log("dracula rises to mint dank NFTs");

  mergeImages(['./body.png', './eyes.png', './mouth.png'], {
    Canvas: Canvas,
    Image: Image
  }).then(b64 => console.log(b64));
    // data:image/png;base64,iVBORw0KGgoAA...

}

rise2();
async function rise2() {
  console.log("dracula rises to mint dank NFTs");
  
  var b64 = await mergeImages(['./body.png', './eyes.png', './mouth.png'], {
    Canvas: Canvas,
    Image: Image
  });
  
  console.log(b64);
    // data:image/png;base64,iVBORw0KGgoAA...

}

/*




/*
//https://stackoverflow.com/questions/6926016/how-can-i-save-a-base64-encoded-image-to-disk

var base64Data = req.rawBody.replace(/^data:image\/png;base64,/, "");

require("fs").writeFile("out.png", base64Data, 'base64', function(err) {
  console.log(err);
});


*/






//the end



















