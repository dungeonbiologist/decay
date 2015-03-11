var hudWidth = 10;	//things displayed to the left of screen
var allTiles = [];
var keys = [];
var projectiles = [];
var view = [];
function clearView(){
	for(var i=0; i<view.length; i++){
		for(var j=0; j<view[i].length; j++){
			view[i][j] = -1;
		}
	}
}
var mouse = {
	x: 0,
	y: 0
};
function mouseToGrid() {
	return map[player.place.z].newPoint(
		Math.floor((mouse.x - 8) / tileWidth - hudWidth),
		Math.floor((mouse.y - 8) / tileHeight)
	);
}
function gridToMouse(x,y){
	return {
		x:(hudWidth+x)*tileWidth,
		y:y*tileHeight,
	};
}
var textbox;
function setTextbox(x,y,width,height,context){
	context.fillStyle = color[black];
	context.fillRect(x*tileWidth, y*tileHeight, width*tileWidth, height * tileHeight);
	context.fillStyle = color[white];
	textbox = {x:x, y:y, width:width, height:height, place:1, offset:0};
}
function printToTextbox(txt,context){
	var lines = [];
	var done = 0;
	do{
		lines.push(txt.slice(done, done + 2.5*textbox.width));
		done += 2.5*textbox.width;
	}while(done < txt.length);
	for(var i=0; i<lines.length && textbox.place < textbox.height; i++){ 
		context.fillText(lines[i], (textbox.x+1)*tileWidth, (textbox.y+textbox.place+1)*tileHeight);
		textbox.place++;
	}
}
function currentTime(){
	return "";
	
}
function showHealth(context){
	context.fillRect(0, 0, hudWidth * tileWidth, 5 * tileHeight);
	context.fillStyle = color[darkGreen];
	var currentXP = (player.xp-Math.pow(player.level(),3));
	var toNextLevel =  (Math.pow(player.level()+1,3)-Math.pow(player.level(),3));
	context.fillRect(tileWidth, 2 * tileHeight, 8 * tileWidth * currentXP/toNextLevel, tileHeight);
	var maxmana = 4*(25)/8;
	context.fillStyle = color[cyan];
	context.fillRect(tileWidth, 3 * tileHeight,  tileWidth*player.mana(1)/maxmana, tileHeight);
	context.fillStyle = color[blue];
	context.fillRect(tileWidth + tileWidth*player.mana(1)/maxmana, 3 * tileHeight,  tileWidth*(player.mana(2)-player.mana(1))/maxmana, tileHeight);
	context.fillStyle = color[darkBlue];
	context.fillRect(tileWidth + tileWidth*player.mana(2)/maxmana, 3 * tileHeight,  tileWidth*(player.mana(3)-player.mana(2))/maxmana, tileHeight);
	
	var extra = player.buffedHealth() - player.health;
	var max = player.maxHealth;
	context.fillStyle = color[darkGreen];
	context.fillRect(tileWidth, 4 * tileHeight,  8*tileWidth*Math.min(player.buffedHealth(), max)/(max+extra), tileHeight);
	context.fillStyle = color[green];
	context.fillRect(tileWidth + 8*tileWidth*max/(max+extra), 4 * tileHeight,  8*tileWidth* Math.max(0,(player.buffedHealth()- max)/(max+extra)), tileHeight);
	
	context.fillStyle = color[white];
	var place = 0.75;
	context.fillText('Level '+player.level(), 4 * tileWidth, place++ * tileHeight);
	context.fillText(player.title, 2 * tileWidth, place++ * tileHeight);
	context.fillText('Exp: '+currentXP+' / '+toNextLevel, 2 * tileWidth, place++ * tileHeight);
	context.fillText('Mana '+player.mana(1)/* + ', '+ player.mana(2)+ ', '+ player.mana(3)*/, 2 * tileWidth, place++ * tileHeight);
	context.fillText('Health '+player.buffedHealth() + ' / '+ player.maxHealth, 2 * tileWidth, place++ * tileHeight);
	place++;
	context.fillText(currentTime(), 2 * tileWidth, place++ * tileHeight);
	return place
}
function showStatuses(context,place){
	place++;
	context.fillStyle = color[darkGreen];
	context.fillRect(tileWidth, (place-1) * tileHeight, 8 * tileWidth * player.currentPoison/player.maxPoison, tileHeight);
	context.fillStyle = color[white];
	context.fillText('Poison: '+player.currentPoison, 2 * tileWidth, place++ * tileHeight);
}
function manageInventory(context){
	if(player.state == 'inventory' || player.dropping){
		var halfScreen = Math.floor(map[player.place.z].width/2);
		setTextbox(hudWidth,0,halfScreen, map[player.place.z].height, context);
		//highlight selection
		if(typeof player.itemSelected =='number'){
			var temp = context.fillStyle;
			context.fillStyle = color[grey];
			context.fillRect((hudWidth + 2)*tileWidth, (player.itemSelected+3) * tileHeight+3, (hudWidth-3) * tileWidth, tileHeight);
			context.fillStyle = temp;
		}
		printToTextbox('Inventory', context);
		printToTextbox((player.dropping)?'Please select an item to drop':'', context);
		var alphabet = 'abcdefghijklmnopqrstuvwxyz';
		for(var i=0; i<alphabet.length; i++){
			if(player.inventory[i]){
				printToTextbox('('+alphabet.charAt(i)+')   '+interned[ player.inventory[i].name ], context);
			}
		} 
	}
	if(typeof player.itemSelected == 'number' && player.state == 'inventory'){
		setTextbox(hudWidth+halfScreen,0,halfScreen, map[player.place.z].height, context);
		printToTextbox(player.inventory[player.itemSelected].explain, context);
	}
	//if dropping ask 'drop what item?'
}
function displayMessagelog(context){
	if(player.state == 'messagelog'){
		var halfScreen = Math.floor(map[player.place.z].width/2);
		setTextbox(hudWidth,0,halfScreen, map[player.place.z].height, context);
		printToTextbox('Message Log', context);
		for(var i =0;i<messageLog.length; i++){
			for(var j=0;messageLog[i] && j<messageLog[i].length; j++){
				printToTextbox(messageLog[i][j].msg, context);
			}
		}
	}
}

function examinationMessagebox(context){
	setTextbox(hudWidth, map[player.place.z].height, map[player.place.z].width, 7, context);
	var coord = mouseToGrid();
	if ( map[player.place.z].legal(coord.x,coord.y) && view[hudWidth+coord.x][coord.y] > -1 ) {
		var text = examine(coord);
		for (var i = 0; i < text.length; i++) {
			printToTextbox(text[i], context);
		}
	}
}
function draw() {
	if(animation.running){ return; }
	clearView();
	var canvas = document.getElementById("canvas");
	//var canvas = document.createElement('canvas');
	//canvas.width = canvas2.width;
	//canvas.height = canvas2.height;
	var context = canvas.getContext('2d')
	context.fillStyle = color[black];
	context.fillRect(0,0,canvas.width,canvas.height);
	
	if(player.popup){
		setTextbox(hudWidth-15+Math.floor(canvas.width/(2*tileWidth)),7, 30, Math.floor(canvas.height/tileHeight), context);
		for(var i=0; i<player.popup.length; i++){
			printToTextbox(player.popup[i], context);
		}
	} else {
		var level = map[player.place.z];
		messagebox.resize(10,level.height+7,7,level.width);
		var a = map[player.place.z]
		var b = a.seen
		b.forall(function (tile, x, y) {
			context.drawImage(tile, (hudWidth + x) * tileWidth, y * tileHeight);
		});
		 //fade out the previously seen terrain
			context.fillStyle = 'rgba(0,0,0,0.75)';
			context.fillRect((hudWidth) * tileWidth, 0, map[player.place.z].width * tileWidth, map[player.place.z].height * tileHeight);
		visable(player.place, context);
		var m = mouseToGrid();
		if(player.state == 'shooting'){
			line(player.place.x,player.place.y,m.x,m.y, 
				function(x,y){
					if(view[hudWidth+x][y] > -1 && map[player.place.z].terrain[x][y].flyable){
						context.drawImage(terrainTiles.highlight[0], (hudWidth + x) * tileWidth, y * tileHeight);
						return true;
					}
					return false;
				}
			);
		}
		context.drawImage(terrainTiles.highlight[0], (hudWidth + m.x) * tileWidth, m.y * tileHeight)
		
		var place = showHealth(context);
		showStatuses(context,place);
		manageInventory(context);
		examinationMessagebox(context);
		displayMessagelog(context)
		//announcements
			setTextbox(hudWidth, map[player.place.z].height+15, map[player.place.z].width, 7, context);
			if(player.requested){
				printToTextbox(player.requested,context);
			} else {
				messagebox.draw(context);
			}
		if( player.looking){
			drawCursor(player.looking.x, player.looking.y, context);
		}
	}
	//var context = canvas2.getContext('2d');
	//context.drawImage(canvas, 0,0);
}