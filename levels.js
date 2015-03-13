function makegiantroom(level){
	return {x1:0,y1:0,x2:level.width-1,y2:level.height-1, width:level.width-1, height:level.height-1, neighbors:[], doors:[]};
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
