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
		Math.floor((mouse.y - 8) / tileHeight));
}
function gridToMouse(x,y){
	return {
		x:(hudWidth+x)*tileWidth,
		y:y*tileHeight
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
	var place1=1;
	context.fillStyle = color[black];
	context.fillRect(0, 0, hudWidth * tileWidth, 5 * tileHeight);
	context.fillStyle = color[darkGreen];
	var currentXP = (player.xp-Math.pow(player.level(),3));
	var toNextLevel =  (Math.pow(player.level()+1,3)-Math.pow(player.level(),3));
	context.fillRect(tileWidth, place1++ * tileHeight, 8 * tileWidth * currentXP/toNextLevel, tileHeight);
	var mana1 = tileWidth*player.mana(1)/(4*(5)/2); //mana/(max mana in a tile * tiles in that range /how wide the bar is)
	var mana2 = tileWidth*(player.mana(2)-player.mana(1))/(4*(4)/3);
	var mana3 = tileWidth*(player.mana(3)-player.mana(2))/(4*(4)/3);
	context.fillStyle = color[cyan];
	context.fillRect(tileWidth, place1 * tileHeight,  mana1, tileHeight);
	context.fillStyle = color[blue];
	context.fillRect(tileWidth + mana1, place1 * tileHeight,  mana2, tileHeight);
	context.fillStyle = color[darkBlue];
	context.fillRect(tileWidth + mana1 + mana2, place1++ * tileHeight,  mana3, tileHeight);
	
	var extra = player.buffedHealth() - player.health;
	var max = player.maxHealth;
	context.fillStyle = color[darkGreen];
	context.fillRect(tileWidth, place1 * tileHeight,  8*tileWidth*Math.min(player.buffedHealth(), max)/(max+extra), tileHeight);
	context.fillStyle = color[green];
	context.fillRect(tileWidth + 8*tileWidth*max/(max+extra), place1++ * tileHeight,  8*tileWidth* Math.max(0,(player.buffedHealth()- max)/(max+extra)), tileHeight);
	
	context.fillStyle = color[white];
	var place = 0.75;
	context.fillText('Level '+player.level(), 4 * tileWidth, place++ * tileHeight);
	//context.fillText(player.title, 2 * tileWidth, place++ * tileHeight);
	context.fillText('Exp: '+currentXP+' / '+toNextLevel, 2 * tileWidth, place++ * tileHeight);
	context.fillText('Mana: '+player.mana(1) + ' > '+ player.mana(2)+ ' > '+ player.mana(3), 2 * tileWidth, place++ * tileHeight);
	context.fillText('Health: '+player.buffedHealth() + ' / '+ player.maxHealth, 2 * tileWidth, place++ * tileHeight);
	place++;
	context.fillText(currentTime(), 2 * tileWidth, place++ * tileHeight);
	return place;
}
function examineHud(coord){
	if(coord.x+hudWidth <10){
		if(coord.y === 0){
			return 'At higher levels you get more health and learn new spells.';
		} else if(coord.y == 1){
			return 'You have '+(player.xp-Math.pow(player.level(),3))+' out of '+(Math.pow(player.level()+1,3)-Math.pow(player.level(),3))+' experience points needed to gain a level.';
		} else if(coord.y == 2){
			if(coord.x+hudWidth <5){
				drawDiamond(1);
				return 'this is the mana you can drain from closest to you';
			} else if(coord.x+hudWidth <8){
				drawDiamond(2);
				return 'this is the mana you can drain from an intermediate distance';
			} else {
				drawDiamond(3);
				return 'this is the most distant mana available to you';
			}
		} else if(coord.y == 3){
			return 'you have '+player.buffedHealth()+' health out of a maximum of '+player.maxHealth+'.';
		} else {
			return examineSpells(coord);
		}
	}
	return '';
}
function examineSpells(coord){
	if(coord.x+hudWidth <10){
		if(coord.y >=11 && coord.y < player.spells.length+11){
			return player.spells[coord.y-11].explain;
		} else if(coord.y == 9){
			return 'The spells you have learned so far.';
		}
	}
	return '';
}
function drawDiamond(r){
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext('2d');
	diamond(player.place.x,player.place.y,r,function(x,y){
		if(map[player.place.z].legal(x,y)){
			context.drawImage(terrainTiles.magic[0], (hudWidth + x) * tileWidth, y * tileHeight);
		}
	});
}
function showSpells(context){
	var offset = 12;
	context.fillStyle = color[white];
	context.fillText('Spells:', 3 * tileWidth, 10 * tileHeight);
	for(var i=0; i<player.spells.length; i++){
		context.fillStyle = color[white];
		context.fillText(player.spells[i].key, 1 * tileWidth, (offset+i) * tileHeight);
		if(!player.spells[i].enoughMana(true)){
			context.fillStyle = color[grey];
		}
		context.fillText(interned[player.spells[i].name], 2 * tileWidth, (offset+i) * tileHeight);
	}
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

function examine(point) {
	var z = point.z;
	var creatures = point.mobilesAt();
	var items = point.itemsAt().concat( point.trapsAt() );
	var text = [];
	text[0] = interned[ point.terrainAt().name ];
	var plant = point.plantsAt();
	if(plant){
		text[0] = text[0].concat(', '+interned[plant.name]);
	}
	if(point.manaAt() > 0){
		text.push(''+point.manaAt() +' mana');
	}
	if(map[z].guarded[point.x][point.y]){
		text.push('A glowing aura protects this tile from your mana drain.');
	}
	for (var i = 0; i < creatures.length; i++) {
		text.push(creatures[i].explain);
		text.push('this '+interned[creatures[i].name]+' has '+creatures[i].health+' hitpoints, '+
			'and can hit for '+creatures[i].damage+' damage. '+
			'It is worth '+creatures[i].xp+' experience points');
	}
	for (var i = 0; i < items.length; i++) {
		text.push(items[i].explain);
	}
	return text;
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
	else {
		printToTextbox(examineHud(coord), context);
	}
}
function draw() {
	if(animation.running){
		return; 
	}
	clearView();
	var canvas = document.getElementById("canvas");
	//var canvas = document.createElement('canvas');
	//canvas.width = canvas2.width;
	//canvas.height = canvas2.height;
	var context = canvas.getContext('2d');
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
		var a = map[player.place.z];
		var b = a.seen;
		b.forall(function (tile, x, y) {
			context.drawImage(tile, (hudWidth + x) * tileWidth, y * tileHeight);
		});
		 //fade out the previously seen terrain
			context.fillStyle = 'rgba(0,0,0,0.75)';
			context.fillRect(hudWidth * tileWidth, 0, map[player.place.z].width * tileWidth, map[player.place.z].height * tileHeight);
		visable(player.place, context);
		//tint guarded tiles
			context.fillStyle = 'rgba(255,255,0,0.25)';
			map[player.place.z].guarded.forall(function (t, i, j) {
			if(t && view[hudWidth+i][j]>=0){
				context.fillRect((hudWidth+i) * tileWidth,j*tileHeight,tileWidth,tileHeight);
			}
		});
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
		context.drawImage(terrainTiles.highlight[0], (hudWidth + m.x) * tileWidth, m.y * tileHeight);
		
		var place = showHealth(context);
		showSpells(context);
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
	if(map.turnNumber != display.previousTurn){
		display.screenNumber++;
		display.previousTurn = map.turnNumber;
	}
	//var context = canvas2.getContext('2d');
	//context.drawImage(canvas, 0,0);
}