function makegiantroom(level){
	return {x1:0,y1:0,x2:level.width-1,y2:level.height-1, width:level.width-1, height:level.height-1, neighbors:[], doors:[]}
}

function savannaLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,5);
	placeRoom(giantRoom,level);
	fillRoom(giantRoom,level,depth,terrains.grass,1);
	findNeighbors(rooms,4);
	randomWalk(rooms[0],50,function(room){ biome.prarie.init(room,level,depth); })
	for(var i=0; i<10; i++){
		randomWalk(randomElt(rooms),3,function(room){ 
			if(Math.random()<0.25){
				biome.pardHideout.init(room,level,depth);
			} else {
				biome.shrubland.init(room,level,depth);
			}
		})
	}
	for(var i=0; i<3; i++){
		biome.savanna.init(randomElt(rooms),level,depth);
	}
	placeItems(level,depth);
	placeStairs(level,depth,rooms);
}
function forestLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,5);
	placeRoom(giantRoom,level);
	fillRoom(giantRoom,level,depth,terrains.dirt,1);
	fillRoom(giantRoom,level,depth,terrains.grass,0.5);
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	connectLevel(someRooms,level);
	loopRooms(rooms, level,8)
	randomWalk(rooms[0],50,function(room){ biome.clearing.init(room,level,depth); })
	for(var i=0; i<10; i++){
		randomWalk(randomElt(rooms),7,function(room){ 
			if(Math.random()<0.75){
				biome.forest.init(room,level,depth);
			} else {
				biome.mushroomPatch.init(room,level,depth);
			}
		})
	}
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level);
	}
	for(var i=0; i<1; i++){
		var place = centerOfRoom(randomElt(rooms),depth);
		critters.unicorn.init(place.x,place.y,level);
	}
	placeItems(level,depth);
	placeStairs(level,depth,rooms);
}
function swampLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,5);
	placeRoom(giantRoom,level);
	fillRoom(giantRoom,level,depth,terrains.dirt,1);
	fillRoom(giantRoom,level,depth,terrains.grass,0.75);
	fillRoom(giantRoom,level,depth,terrains.mud,0.25);
	fillRoom(giantRoom,level,depth,terrains.tallGrass,0.25);
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	connectLevel(someRooms,level);
	loopRooms(rooms, level,8)
	randomWalk(rooms[0],50,function(room){ biome.swamp.init(room,level,depth); })
	for(var i=0; i<10; i++){
		randomWalk(randomElt(rooms),7,function(room){ 
			if(Math.random()<0.75){
				biome.jungle.init(room,level,depth);
			} else {
				biome.gatorHole.init(room,level,depth);
			}
		})
	}
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level,terrains.dirtWall);
	}
	placeItems(level,depth);
	placeStairs(level,depth,rooms);
}
function plainsLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,5);
	placeRoom(giantRoom,level);
	fillRoom(giantRoom,level,depth,terrains.floor,1);
	fillRoom(giantRoom,level,depth,terrains.grass,0.75);
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	connectLevel(someRooms,level);
	loopRooms(rooms, level,4)
	randomWalk(rooms[0],50,function(room){ biome.prarie.init(room,level,depth); })
	for(var i=0; i<10; i++){
		randomWalk(randomElt(rooms),7,function(room){ 
			if(Math.random()<0.125){
				biome.eyrie.init(room,level,depth);
			} else {
				biome.prarie.init(room,level,depth);
			}
		})
	}
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level,terrains.rockWall);
	}
	placeItems(level,depth);
	placeStairs(level,depth,rooms);
}
function finalLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,5);
	placeRoom(giantRoom,level);
	fillRoom(giantRoom,level,depth,terrains.floor,1);
	fillRoom(giantRoom,level,depth,terrains.poop,0.0625);
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	shuffle(someRooms);
	loopRooms(rooms, level,40)
	for(var i=0; i<15; i++){
		randomWalk(randomElt(rooms),8,function(room){ 
			if(Math.random()<0.25){
				fillRoom(room,level,depth,terrains.rock, 0.25);
			} else if(Math.random()<0.5){
				fillRoom(room,level,depth,terrains.deadGrass, 0.5);
			}else {
				fillRoom(room,level,depth,terrains.dirt, 0.5);
			}
		})
	}
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level,terrains.rockWall);
	}
	for(var i=0; i<2; i++){
		var room = randomElt(rooms);
		var place = centerOfRoom(room,depth);
		critters.jabberwock.init(place.x,place.y,level);
		fillRoom(room,level,depth,terrains.poop,0.125)
	}
	placeItems(level,depth);
	placeStairs(level,depth,rooms,true);
}
function bareLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,9);
	placeRoom(giantRoom,level);
	fillRoom(giantRoom,level,depth,terrains.floor,1);
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	shuffle(someRooms);
	loopRooms(rooms, level,40)
	for(var i=0; i<60; i++){
		var room = randomElt(rooms) 
		if(Math.random()<0.25){
			fillRoom(room,level,depth,terrains.grass, 0.25);
		} else if(Math.random()<0.5){
			fillRoom(room,level,depth,terrains.deadGrass, 0.5);
		}else {
			fillRoom(room,level,depth,terrains.dirt, 0.5);
		}
	}
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level,terrains.wall);
	}
	for(var i=0; i<2; i++){
		var room = randomElt(rooms);
		var place = centerOfRoom(room,depth);
		critters.buffalo.init(place.x,place.y,level);
	}
	placeItems(level,depth);
	placeStairs(level,depth,rooms);
}
function testLevel(level,depth){
	var giantRoom = makegiantroom(level);
	var rooms = subdivide(giantRoom,9);
	placeRoom(giantRoom,level);
	fillRoom(giantRoom,level,depth,terrains.vegetation,1);
	for(var i=0; i<12; i++){
		placeMagic(randomInt(0,level.width-1),randomInt(0,level.width-1),randomInt(10,19),level,randomInt(1,6));
	}
	for(var i=0; i<6; i++){
		var room = randomElt(rooms);
		biome.fairyRing.init(room,level,depth);
	}
	/*critters.unicorn.init(3,3,level);
	critters.dryad.init(3,3,level);
	critters.pixie.init(3,3,level);
	critters.fairy.init(3,3,level);
	*/
	findNeighbors(rooms,4);
	var someRooms = [];
	for(var i=0; i<rooms.length; i++){
		someRooms.push(rooms[i]);
	}
	shuffle(someRooms);
	loopRooms(rooms, level,40)
	for(var i=0; i<rooms.length; i++){
		placeRoom(rooms[i], level,terrains.dirtWall);
	}
	//placeRing(5,5,2,level,terrains.mushroom);
	placeStairs(level,depth,rooms);
	//level.magic.forall(function(t,x,y){ level.magic[x][y] = Math.floor(x/13); });
}
