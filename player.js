function initPlayer(){ 
	return {
		wizmode: false,
		name: intern('player'),
		title: 'Hexxus the wizard',
		explain: 'you are here',
		place: map[0].newPoint(5,5),
		size: 2,
		drawSelf: drawCritter(tile(darkRed,black,2),20),
		health: 20,
		critter: true,
		maxHealth: 20,
		strength: 2,
		xp: 1,
		dropping:false,	
		level: function(){
			return Math.floor(Math.pow(this.xp,1/3));
		},
		mana:function(range){
			var mana = 0;
			var m = map[player.place.z];
			diamond(player.place.x,player.place.y,range,function(x,y){ 
				if(m.legal(x,y))
					mana += m.magic[x][y]; 
			
			});
			return mana;
		},
		buffedStrength: function(){
			var strength = player.strength;
			for(var i=0; i<this.inventory.length; i++){
				if(this.inventory[i] && this.inventory[i].strength){
					strength += this.inventory[i].strength;
				}
			}
			return strength;
		},
		buffedHealth: function(){
			var health = player.health;
			for(var i=0; i<this.inventory.length; i++){
				if(this.inventory[i] && this.inventory[i].health){
					health += this.inventory[i].health;
				}
			}
			return health;
		},
		visionRadius: function(){
			var vision = 5;
			for(var i=0; i<this.inventory.length; i++){
				if(this.inventory[i] && this.inventory[i].vision){
					vision += this.inventory[i].vision;
				}
			}
			return vision;
		},
		defense:0,
		buffedDefense: function(){
			var defense = this.defense;
			for(var i=0; i<this.inventory.length; i++){
				if(this.inventory[i] && this.inventory[i].defense){
					defense += this.inventory[i].defense;
				}
			}
			return defense;
		},
		inventory: makeVect(26),
		ammo:1,
		traps:1,
		lances:5,
		gold: 50,
		itemSelected:false,
		requested: false,
		dirSelected: false,
		facing: new Direction(0,0),
		draw: function(context){
			this.drawSelf(context);
		},
		popup: false,
		attack: function(creatures,point,melee,amountofdamage){
			for(var i=0; i<creatures.length; i++){
				if(melee){
					var damage = fingerOfDeath.activate(player.place,creatures[i],point);
					message('you strike the '+interned[creatures[i].name]+' for '+damage+' damage',yellow);
				}
				else{
					var damage = creatures[i].attacked(point, this, amountofdamage, !melee);
					message('you attack the '+interned[creatures[i].name]+' for '+damage+' damage',yellow);
				}
			}
		},
		attacked: function(point, thing, damage){
			damage -= damage*dither(this.buffedDefense() / (25+this.buffedDefense()));
			this.health-= damage;
			message('a '+interned[thing.name] + ' hits you for '+damage+' damage',red);
			if(this.health <= 0){
				achieve.killedBy = interned[thing.name];
			}
			return damage;
		},
		at: function(point){
			return this.place.same(point);
		},
		recordLocation:function(array){
			array[this.place.x][this.place.y].push(this);
		},
		levelUp: function(xp){
			message('you gain '+xp+' experience.',green);
			var level = this.level();
			this.xp +=xp;
			for(var i=0; i< this.level()-level; i++){
				var gain = this.level()-level;
				message('You gained '+gain+' level'+((gain == 1)? '.': 's.'),green);
				message('You are now level '+this.level()+'!',cyan);
				this.maxHealth +=5;
				this.health = this.maxHealth;
				this.strength++;
				this.defense+=5;
			}
		}
	};
}
function pickUp(items){
	for(var i=0, j=0; i< items.length;){
		if(items[i].consume){
			items[i].consume();
			i++; continue;
		}
		if( j >= player.inventory.length){
			while(i<items.length){
				if(items[i]){
					message('inventory too full to pick up the '+interned[items[i].name],red);
				}
				i++;
			}
			break;
		}
		if(!player.inventory[j]){
			player.inventory[j] = items[i];
			items[i].carried = true;
			message('you pick up a ' + interned[items[i].name],yellow);
			i++;
		}
		j++;
	}
}
function onlyPressed(){
	for(var i= 0; i<arguments.length; i++){
		if(!find(keys, arguments[i])){
			return false;
		}
	}
	return arguments.length == keys.length;
};
function getDirection(keys) {
	var dx = 0;
	var dy = 0;
	if(find(keys,37)){ 
		dx -= 1;
	}
	if(find(keys,38)){
		dy -= 1;
	}
	if(find(keys,39)){
		dx += 1;
	}
	if(find(keys,40)){
		dy += 1;
	}
	if( dx !== 0 || dy !== 0){
		 player.dirSelected = new Direction(dx, dy);
		return true;
	}
	return false;
}
function selectItem(keys){
	if(keys[0] <=90 && keys[0]>=65){
		if(player.inventory[ keys[0]-65 ] ){
			player.itemSelected = keys[0]-65;
			return true;
		}
	}
	return false;
}
function dropItem(){
	var i = player.itemSelected;
	var thing = player.inventory[i];
	player.inventory[i] = undefined;
	thing.carried = false;
	thing.place.move(player.place.x, player.place.y, player.place.z, thing);
	message('you dropped a '+interned[thing.name],yellow);
	player.itemSelected = false;
	player.dropping = false;
}
function move(){
	var dir = player.dirSelected;
	var x = player.place.x;
	var y = player.place.y;
	if ( map[player.place.z].legal(x + dir.x, y + dir.y)) {
		if(map[player.place.z].unBlocked(player.place.add(dir), player)){
			player.place.move(x+dir.x, y+dir.y, player.place.z, player);
			pickUp(player.place.itemsAt());
			tick();
		} else{
			var creatures = player.place.add(dir).mobilesAt();
			if( creatures.length > 0){
				map[player.place.z].actionlist.add(map.turnNumber-0.5,function(){ 
					player.attack(creatures, player.place.add(dir), true); 
				});
				tick();
			} else {
				message('that way is blocked');
			}
		}
	}
	player.facing = dir;
}
function setInstructions(){
	player.popup =[
		'Use the mouse to look at things',
		'',
		'? calls up instructions',
		'',
		'bump to attack, does 1 damage for every 1 mana it drains from the tiles around you',
		'',
		'f casts a cone of fire that drains 10 mana from the surrounding 13 tiles and does 10 damage',
		'',
		't casts teleport. Teleport moves you in a strait line until you hit an obstacle. It costs 20 mana, and uses additional mana proportional to the distance',
		'',
		'd drains the life out of surrounding vegetation',
		'',
		'b blights the vegetation',
		'',
		'spacebar waits a turn',
		'',
		'i brings up your inventory',
		'',
		'a-z select that item from the inventory',
		'',
		'the arrow keys move you around the map',
		'',
		'spacebar cancels all menus',
	];
}
function handleKeys(evt) {
	addUnique(keys, evt.keyCode);
	if(find(keys,37) || find(keys,38) || find(keys,39) || find(keys,40) || find(keys,32)){
		evt.preventDefault(); //stops scrolling from space or arrow keys
	}
	if(keys.length === 0){
		draw();
		keys = [];
		return;
	}
	player.requested = false; //clear the action requests so that we have to activly maintain them
	player.popup = false;
	if(find(keys,191)){
		setInstructions();
	} 
	else if(messagebox.pages > messagebox.offset && find(keys,32)){
		messagebox.turnPage();
	}
	else if(player.state == 'goal'){
		setInstructions();
		player.state = 'instructions';
	} 
	else if(player.state =='instructions'){
		player.state = 'moveing';
	}
	else if(player.state == 'gameover'){
		reInit();
	} 
	else if(player.dropping){
		if( player.itemSelected !==false || selectItem(keys)) {
			dropItem();
		}
		player.dropping = false;
	}
	else if(player.state == 'moveing'){
		if(find(keys,59)){
			player.state = 'looking';
			player.looking = {x:player.place.x, y:player.place.y};
		} else if( find(keys,73) ){ //i
			player.state = 'inventory';
		} else if(find(keys,68) || find(keys,190)){ //d
			//player.dropping = true;
			drain( player.place.x, player.place.y, player.place.z, 12 );
		} else if(find(keys,70) && fireCone.enoughMana()){ //f
			player.spell = fireCone;
			player.state = 'choose direction';
			message('choose a direction');
			//player.state = 'shooting';
		} else if(find(keys,84) && teleport.enoughMana()){ //t
			player.spell = teleport;
			player.state = 'shooting';
		} else if(find(keys,77)){
			player.state = 'messagelog';
		} else if(getDirection(keys)) { //sets dirSelected
			move();
		} else if( find(keys,32)){
			tick();
		} else if( find(keys,66)){ //b
			blight.activate(player.place.x, player.place.y, player.place.z);
		}
	}
	else if (player.state == 'messagelog'){
		player.state = 'moveing';
	}
	else if(player.state == 'looking'){
		if( getDirection(keys) ){
			var x = player.looking.x + player.dirSelected.x;
			var y = player.looking.y + player.dirSelected.y;
			if(map[player.place.z].legal(x,y) ){
				player.looking.x = x;
				player.looking.y = y;
			}
		} else{
			player.looking = false;
			player.state = 'moveing';
		}
	}
	else if( player.state == 'inventory'){
		if(find(keys,68) || find(keys,190)){
			player.dropping= true;
			if(player.itemSelected !== false){
				dropItem();
				player.dropping = false;
			}
		} else if( selectItem(keys) ){ //selects an item
			player.state = 'inventory';
		} else {
			player.itemSelected = false;
			player.state = 'moveing';
		}
	}
	else if( player.state == 'shooting'){
		if( find(keys,13) || find(keys,70)){
			fireSpell();
		}
		player.state = 'moveing';
		tick();
	}
	else if( player.state == 'choose direction'){
		if( getDirection(keys) && player.spell){
			player.spell.activate(player.place, player.dirSelected);
			player.spell = false;
			tick();
		}
		player.state = 'moveing';
	}
	var p = player.place
	for(var i=0; i<player.inventory.length; i++){
		if(player.inventory[i]){
			player.inventory[i].place.move(p.x, p.y, p.z, player.inventory[i]);
		}
	}
	draw();
	keys = [];
}
function shoot(point){
	line(player.place.x,player.place.y,point.x,point.y, 
		function(x,y){
			return map[player.place.z].terrain[x][y].flyable && !player.attack(map[player.place.z].newPoint(x,y),false);
		}
	);
}
function fireGun(e){
	if(player.state == 'shooting'){
		var p = mouseToGrid();
		message('You fire your gun',yellow);
		if(map[player.place.z].legal(p.x,p.y)){
			shoot(p);
			player.ammo--;
			achieve.ammoUsed++;
			tick();
		}
		player.state = 'moveing';
		draw();
	}
}
function fireSpell(e){
	if(player.state == 'shooting'){
		player.spell.activate(player.place, mouseToGrid());
		player.spell = false;
		player.state = 'moveing';
		draw();
	}
}
function examine(point) {
	var z = point.z;
	var creatures = point.mobilesAt();
	var items = point.itemsAt().concat( point.trapsAt() );
	var text = [];
	text[0] = interned[ point.terrainAt().name ];
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

function request(strng){
	player.requested = strng;
}
