var tileWidth = 12;
var tileHeight = 12;

var white = 0;
var darkWhite = 1;
var grey = 2;
var black = 3; var darkGrey = 3;
var red = 4;
var darkRed = 5;
var yellow = 6;
var darkYellow = 7;
var green = 8;
var darkGreen = 9;
var cyan = 10;
var darkCyan = 11;
var blue = 12;
var darkBlue = 13;
var magenta = 14;
var darkMagenta = 15;

var ifAllLoaded = (function(){
	var record = [];
	var total = 0;
	return function(){
		var place = total;
		record[place]=false;
		total++;
		return function (){
			record[place]=true;
			for(var i=0; i<total; i++){
				if( record[i] == false ){ return false;}
			}
			init();
		}
	}
	
})();

var charset = []
for(var i=0; i<16; i++){
	charset[i] = new Image();
	charset[i].onload = ifAllLoaded();
}

charset[white].src = 'charset/white.png';
charset[darkWhite].src = 'charset/darkWhite.png';
charset[grey].src = 'charset/grey.png';
charset[black].src = 'charset/black.png';
charset[red].src = 'charset/red.png';
charset[darkRed].src = 'charset/darkRed.png';
charset[yellow].src = 'charset/yellow.png';
charset[darkYellow].src = 'charset/darkYellow.png';
charset[green].src = 'charset/green.png';
charset[darkGreen].src = 'charset/darkGreen.png';
charset[cyan].src = 'charset/cyan.png';
charset[darkCyan].src = 'charset/darkCyan.png';
charset[blue].src = 'charset/blue.png';
charset[darkBlue].src = 'charset/darkBlue.png';
charset[magenta].src = 'charset/magenta.png';
charset[darkMagenta].src = 'charset/darkMagenta.png';

var color = [];
color[white] = '#FFFFFF';
color[darkWhite] = '#C0C0C0';
color[grey] = '#808080';
color[black] = '#050500';
color[red] = '#FF0000';
color[darkRed] = '#800000';
color[yellow] = '#FFFF00';
color[darkYellow] = '#808000';
color[green] = '#00FF00';
color[darkGreen] = '#008000';
color[cyan] = '#00FFFF';
color[darkCyan] = '#008080';
color[blue] = '#0000FF';
color[darkBlue] = '#000080';
color[magenta] = '#FF00FF';
color[darkMagenta] = '#800080';