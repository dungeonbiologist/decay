var tileWidth = 12;
var tileHeight = 12;

function tile(foregroundColor, backgroundColor, character){
	var canvas = document.createElement('canvas');
	canvas.width = tileWidth;
	canvas.height = tileHeight;
	var context = canvas.getContext('2d');
		context.fillStyle = color[backgroundColor];
		context.fillRect(0, 0, tileWidth, tileHeight);
		context.drawImage(charset[foregroundColor] , (character % 16) * tileWidth, Math.floor(character/16) * tileHeight,  tileWidth, tileHeight ,0,0,  tileWidth, tileHeight);
	return canvas;
}

function drawTile(tile,priority) {
	return function (x, y, context) {
		if(view[hudWidth+x][y] < priority){
			context.drawImage(tile, (hudWidth + x) * tileWidth, y * tileHeight);
			view[hudWidth+x][y] = priority;
		}
	};
}
function drawCritter(tile,priority) {
	return function (context) {
		if(view[hudWidth+this.place.x][this.place.y] < priority){
			context.drawImage(tile, (hudWidth + this.place.x) * tileWidth, this.place.y * tileHeight);
			view[hudWidth+this.place.x][this.place.y] = priority;
		}
	};
}
 var tileData = {
	blank: {
		foreground: [white],
		background: [black],
		character: [0]
	},
	upstairs: {
		foreground: [grey],
		background: [black],
		character: [60]
	},
	downstairs: {
		foreground: [grey],
		background: [black],
		character: [62]
	},
	highlight: {
		foreground: [yellow],
		background: [white],
		character: [46]
	}, 
	tilefloor: {
		foreground: [yellow],
		background: [white],
		character: [46]
	}, 
	veg1: {
		foreground: [green, darkGreen],
		background: [black],
		character: [44,39,96]
	},
	veg2: {
		foreground: [green, darkGreen],
		background: [black],
		character: [34,59]
	},
	veg3: {
		foreground: [green, darkGreen],
		background: [black],
		character: [226,159,244]
	},
	veg4: {
		foreground: [green, darkGreen],
		background: [black],
		character: [5,6]
	},
	guts: {
		foreground: [darkGreen, green, darkRed, red, darkYellow],
		background: [red, black, darkRed],
		character: [37,171,237,253,242,243]
	}, 
	blood: {
		foreground: [red, darkRed],
		background: [red, darkRed, black],
		character: [247, 126]
	}, 
	mushroom: {
		foreground: [darkMagenta, darkRed],
		background: [black],
		character: [6,24]
	}, 
	grass: {
		foreground: [green, darkGreen],
		background: [black],
		character: [34,39,44,96]
	}, 
	deadGrass: {
		foreground: [darkYellow, yellow],
		background: [black],
		character: [34,39,44,96]
	}, 
	forb: {
		foreground: [green, darkGreen],
		background: [black],
		character: [34,58,59,231]
	}, 
	poop: {
		foreground: [darkYellow],
		background: [black],
		character: [236,58]
	}, 
	pebbles: {
		foreground: [grey, darkWhite],
		background: [black],
		character: [46,248,249,250]
	}, 
	dirt: {
		foreground: [darkYellow],
		background: [black],
		character: [46,249,250]
	}, 
	bush: {
		foreground: [green, darkGreen],
		background: [black],
		character: [159,226,244]
	}, 
	tree: {
		foreground: [green, darkGreen],
		background: [black],
		character: [5,6]
	}, 
	water: {
		foreground: [blue, darkBlue, cyan],
		background: [darkBlue, blue],
		character: [126,247]
	},
	mud: {
		foreground: [darkYellow],
		background: [black],
		character: [126,247]
	},
	fire: {
		foreground: [red, yellow, darkRed],
		background: [red, yellow, darkRed],
		character: [15,38,42]
	}, 
	rock: {
		foreground: [grey, darkWhite],
		background: [black],
		character: [7,9,48,79,111,167,233,248]
	}, 
	tallGrass: {
		foreground: [green, darkGreen],
		background: [black],
		character: [40,41,174,175,242,243]
	}, 
	jungle: {
		foreground: [green, darkGreen],
		background: [black],
		character: [15,42]
	}, 
	rockWall: {
		foreground: [black],
		background: [darkWhite],
		character: [35]
	}, 
	dirtWall: {
		foreground: [darkYellow,black],
		background: [black,darkYellow],
		character: [176,177,178]
	}, 
	cane: {
		foreground: [darkYellow],
		background: [black],
		character: [124,180,198]
		//19,20,124,180,186,198
	},
	corridorWall: {
		foreground: [darkYellow],
		background: [black],
		character:[7, 179, 196, 192, 179, 179, 218, 195, 196, 217, 196, 193, 191, 180, 194, 197]
	},
	smoothWall: {
		foreground: [white],
		background: [black],
		character:[9, 186, 205, 200, 186, 186, 201, 204, 205, 188, 205, 202, 187, 185, 203, 206]
	}
};
function adjacencyToInt(up,right,down,left){
	return ((up)? 1: 0) + ((right)? 2: 0) + ((down)? 4: 0) + ((left)? 8: 0);
}
function dirToInt(dir){
	//only one should be true at a time;
	return adjacencyToInt(dir.y<0, dir.x>0, dir.y>0, dir.x<0);
}
var thinLine = [];
var thickLine = [];
function drawLine(places,start,length,thin){
	var tiles = [];
	for(var i=start; i<places.length && i<start+length; i++){
		var prev = places[ Math.max(0,i-1) ];
		var current = places[i];
		var next = places[ Math.min(places.length-1,i+1) ];
		var tilePlace = dirToInt({x:prev.x-current.x, y: prev.y-current.y}) +
						dirToInt({x:next.x-current.x, y: next.y-current.y});
		tiles.push( (thin)? thinLine[tilePlace]: thickLine[tilePlace] );
	}
	return tiles;
}
//33
var alphabet = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRATUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
var terrainTiles = {};
function expandTiles(tiles,place){
	for(var i=0; i<tiles.foreground.length; i++){
		for(var j=0; j<tiles.background.length; j++){
			if( tiles.foreground[i] != tiles.background[j]){
				for(var k=0; k<tiles.character.length; k++){
					place.push( tile(tiles.foreground[i],tiles.background[j],tiles.character[k]) );
				}
			}
		}
	}
}
var asciiAlphabet = {};
function initTileData(){
	for(var i in tileData){
		if(tileData.hasOwnProperty(i)){
			terrainTiles[i]=[];
			expandTiles(tileData[i],terrainTiles[i]);
		}
	}	
	var thin = {
		foreground: [red],
		background: [black],
		character:[7, 179, 196, 192, 179, 179, 218, 195, 196, 217, 196, 193, 191, 180, 194, 197]
	};
	var thick = {
		foreground: [red],
		background: [black],
		character:[9, 186, 205, 200, 186, 186, 201, 204, 205, 188, 205, 202, 187, 185, 203, 206]
	};
	expandTiles(thin,thinLine);
	expandTiles(thick,thickLine);
	var list = [];
	for(var i=0; i<alphabet.length; i++){
		/*asciiAlphabet[alphabet[i]] =*/ 
		list.push( tile(white,black, 32+ i));
	}
	//terrainTiles.l = list;
}