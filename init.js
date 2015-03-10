function win(){
	var test = true;//false;
	for( var i=0; i<player.inventory.length; i++){
		if(player.inventory[i] && player.inventory[i].name && interned[player.inventory[i].name] == 'Unicorn Horn'){
			test = true;
		}
	}
	if( test ){
		player.popup = ['You Win!'];
		achievements(player.popup);
		player.popup.push('New Game?');
		player.state = 'gameover';
		return true;
	} else {
		message('you can\'t leave yet. You didn\'t get what you came for');
	}
	return false;
}
function lose(){
	player.state = 'gameover';
	player.popup = ['you lost this time'];
	achievements(player.popup);
	player.popup.push('New Game?');
}
function decend(){
	var p = player.place;
	var downlevel = map[p.z+1];
	p.move(downlevel.up.x, downlevel.up.y, p.z + 1, player);
	message('you decended to level '+(p.z+1));
	achieve.deepestLevel = Math.max(achieve.deepestLevel, (p.z+1));
	for(var i=0; i<player.inventory.length; i++){
		if(player.inventory[i]){
			player.inventory[i].place.move(p.x, p.y, p.z, player.inventory[i]);
		}
	}
}
function acend(){
	var p = player.place;
	var uplevel =  map[p.z-1];
	p.move(uplevel.down.x, uplevel.down.y, p.z - 1, player);
	message('you acended to level '+(p.z+1));
	for(var i=0; i<player.inventory.length; i++){
		if(player.inventory[i]){
			player.inventory[i].place.move(p.x, p.y, p.z, player.inventory[i]);
		}
	}
}

function tick(){
	
	map.turnNumber++;
	if(player.health<=0 ){
		lose();
		return;
	}
	var p = player.place;
	var level = map[p.z];
	var terrain = level.terrain[p.x][p.y].name;
	if(level.down && p.same(level.down )){
		decend();
	} else 
	if(level.up && p.same(level.up )){
		if(p.z === 0){
			if( win()){
				return;
			}
		} else {
			acend()
		}
	}
	level.actionlist.tick(map.turnNumber);
}
function init() {
	if (window.Event) {
		document.captureEvents(Event.MOUSEMOVE);
		document.captureEvents(Event.MOUSEDOWN);
		var movefn = function (e) {
			mouse.x = e.pageX;
			mouse.y = e.pageY;
			draw();
		}
	}
	else {
		var movefn = function (e) {
			mouse.x = event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
			mouse.y = event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
			draw();
		}
	 }
	window.addEventListener('mousedown', fireGun,false);
	window.addEventListener('mousemove', movefn, false);
	handleKeys
	window.addEventListener("keydown", handleKeys, false);
	initTileData();
	initTerrains();
	initItems();
	initCritters();
	initializeBiomes();
	reInit();
}
function reInit(){
	messageLog = [];
	var canvas = document.getElementById("canvas");
	for(var i=0; i<canvas.width/tileWidth; i++){
		view[i] = [];
		for(var j=0; j<canvas.height/tileHeight; j++){
			view[i][j] = -1;
		}
	}
	map = [makemap(60,30)];//,makemap(60,30),makemap(60,30),makemap(60,30),makemap(60,30),makemap(60,30),makemap(60,30)];
	for(var i=0; i<map.length; i++){
		map[i].depth = i;
	}
	map.turnNumber = 0;
	var p = 0;
	player = initPlayer();
	
	testLevel(map[p],p++);
	
	for(var i=0; i<map.length; i++){
		map[i].terrain.forall(function(t,x,y){t.update(x,y,i)});
	}
	map[player.place.z].mobiles.add(player);
	player.place.move(map[0].up.x, map[0].up.y, 0, player);
	player.state = 'goal';
	player.popup = ['your goal is to decend to the bottom of the dugeon,',
		'get the horn of the vicious unicorn,', 
		'and exit the top level of the dugeon with it'];
	message('Welcome',green);
	message('Use the mouse to look!!!',red);
	achieve = {crittersKilled:[], deepestLevel:1, killedBy:undefined};
	draw();
}
var start = ifAllLoaded();