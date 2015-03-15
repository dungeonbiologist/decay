function makegiantroom(level){
	return {x1:0,y1:0,x2:level.width-1,y2:level.height-1, width:level.width-1, height:level.height-1, neighbors:[], doors:[]};
}

function fairyLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,4);
	placeRoom(giantRoom,level);
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	shuffle(someRooms);
	loopRooms(rooms, level,10);
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level,terrains.dirtWall);
		var m = onein(8)? randomInt(1,4): 1;
		fillRoom(rooms[i], level,depth,function(p){
			p.setMana(m);
			p.setPlants(plants.vegetation.init());
		},
		1);
	}
	for(var i=0; i<12; i++){
		placeCircle(randomInt(0,level.width-1),randomInt(0,level.width-1),randomInt(10,19),level,randomInt(1,6),
			function(x,y,a){
				level.magic[x][y]= med(level.magic[x][y], a, 4);
				if(a>0){
				level.plants[x][y] = plants.vegetation.init(); 
				}
		});
		
	}
	
	for(var i=0; i<6; i++){
		var room = randomElt(rooms);
		biome.fairyRing.init(room,level,depth);
	}
	placeStairs(level,depth,rooms);
}

function gnomeLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,8);
	placeRoom(giantRoom,level);
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	shuffle(someRooms);
	loopRooms(rooms, level,10);
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level,terrains.dirtWall);
		var m = randomInt(1,2);
		if( onein(4) ){
			var p=centerOfRoom(rooms[i],depth);
			critters.pixie.init(p.x,p.y,level);
			fillRoom(rooms[i], level,depth,function(p){
				p.setMana(m+randomInt(0,1));
				p.setPlants(plants.vegetation.init());
			},1);
		}
	}	
	for(var i=0; i<6; i++){
		var room = randomElt(rooms);
		var p = centerOfRoom(room,depth);
		critters.gnome.init(p.x,p.y,level);
	}
	placeStairs(level,depth,rooms);
}

function finalLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,8);
	placeRoom(giantRoom,level);
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	shuffle(someRooms);
	loopRooms(rooms, level,10);
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level,terrains.dirtWall);
		var m = randomInt(2,3);
		fillRoom(rooms[i], level,depth,function(p){
			p.setMana(m+randomInt(0,1));
			p.setPlants(plants.vegetation.init());
		},1);
	}
	for(var i=0; i<6; i++){
		var room = randomElt(rooms);
		var p = centerOfRoom(room,depth);
		critters.unicorn.init(p.x,p.y,level);
	}
	placeStairs(level,depth,rooms,true);
}

function testLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,9);
	placeRoom(giantRoom,level);
	fillRoom(giantRoom,level,depth,terrains.dirt,1);
	for(var i=0; i<12; i++){
		placeCircle(randomInt(0,level.width-1),randomInt(0,level.width-1),randomInt(10,19),level,randomInt(1,6),
			function(x,y,a){
				level.magic[x][y]= med(level.magic[x][y], a, 4);
				if(a>0){
				level.plants[x][y] = plants.vegetation.init(); 
				}
		});
		
	}
	for(var i=0; i<1; i++){
		var room = randomElt(rooms);
		biome.sacredGrove.init(room,level,depth);
	}
	for(var i=0; i<8; i++){
		var room = randomElt(rooms);
		critters.gnome.init(randomInt(room.x1,room.x2),randomInt(room.y1,room.y2),level);
	}
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	shuffle(someRooms);
	loopRooms(rooms, level,40);
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level,terrains.dirtWall);
	}
	placeStairs(level,depth,rooms);
}
